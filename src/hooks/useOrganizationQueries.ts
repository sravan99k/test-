import { useQuery } from '@tanstack/react-query';
import { db, auth } from '@/integrations/firebase';
import { doc, getDoc, collection, getDocs, query, orderBy, limit, getCountFromServer } from 'firebase/firestore';

// Helper to get org context
const getOrgContext = async () => {
    if (!auth.currentUser) return null;
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists()) return null;

    const userData = userDocSnap.data();
    return {
        adminId: userData.parentAdminId || auth.currentUser.uid,
        organizationId: userData.organizationId,
        uid: auth.currentUser.uid
    };
};

export interface SchoolData {
    id: string;
    name: string;
    schoolCode: string;
    location: string;
    city: string;
    email: string;
    phone: string;
    adminName: string;
    noOfStudents: string;
    students: number;
    teachers: number;
    status: string;
    subscription: string;
    subscriptionStatus?: string;
    subscriptionPlan?: string;
}

export const useOrgInfo = () => {
    return useQuery({
        queryKey: ['orgInfo', auth.currentUser?.uid],
        queryFn: async () => {
            const ctx = await getOrgContext();
            if (!ctx || !ctx.organizationId) return null;

            const orgDocRef = doc(db, `users/${ctx.adminId}/organizations/${ctx.organizationId}`);
            const orgDocSnap = await getDoc(orgDocRef);
            return orgDocSnap.exists() ? orgDocSnap.data() : null;
        },
        enabled: !!auth.currentUser,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useOrgSchools = () => {
    return useQuery<SchoolData[]>({
        queryKey: ['orgSchools', auth.currentUser?.uid],
        queryFn: async () => {
            const ctx = await getOrgContext();
            if (!ctx || !ctx.organizationId) return [];

            const schoolsPath = `users/${ctx.adminId}/organizations/${ctx.organizationId}/schools`;
            const schoolsSnapshot = await getDocs(collection(db, schoolsPath));

            return Promise.all(schoolsSnapshot.docs.map(async (schoolDoc) => {
                const schoolData = schoolDoc.data();
                const schoolId = schoolDoc.id;
                const schoolPath = `${schoolsPath}/${schoolId}`;

                const [studentsCountRes, teachersCountRes] = await Promise.all([
                    getCountFromServer(collection(db, `${schoolPath}/students`)),
                    getCountFromServer(collection(db, `${schoolPath}/teachers`))
                ]);

                return {
                    id: schoolId,
                    name: schoolData.name || 'Unnamed School',
                    schoolCode: schoolData.schoolCode || '',
                    location: schoolData.location || schoolData.city || 'Unknown',
                    city: schoolData.location || schoolData.city || 'Unknown',
                    email: schoolData.email || '',
                    phone: schoolData.phone || '',
                    adminName: schoolData.adminName || '',
                    noOfStudents: schoolData.noOfStudents || '',
                    students: studentsCountRes.data().count,
                    teachers: teachersCountRes.data().count,
                    status: schoolData.status === 'active' ? 'Active' : 'Inactive',
                    subscription: schoolData.subscriptionPlan || 'Standard',
                    ...schoolData
                } as SchoolData;
            }));
        },
        enabled: !!auth.currentUser,
        staleTime: 5 * 60 * 1000,
    });
};

export const useOrgDashboardData = () => {
    return useQuery({
        queryKey: ['orgDashboardData', auth.currentUser?.uid],
        queryFn: async () => {
            const ctx = await getOrgContext();
            if (!ctx || !ctx.organizationId) return null;

            const schoolsPath = `users/${ctx.adminId}/organizations/${ctx.organizationId}/schools`;
            const schoolsSnapshot = await getDocs(collection(db, schoolsPath));

            let totalStudents = 0;
            let totalTeachers = 0;
            let activeSubscriptions = 0;

            const processedSchools = await Promise.all(schoolsSnapshot.docs.map(async (schoolDoc) => {
                const schoolData = schoolDoc.data();
                const schoolId = schoolDoc.id;
                const schoolPath = `${schoolsPath}/${schoolId}`;

                const [studentsCountRes, teachersCountRes] = await Promise.all([
                    getCountFromServer(collection(db, `${schoolPath}/students`)),
                    getCountFromServer(collection(db, `${schoolPath}/teachers`))
                ]);

                const studentCount = parseInt(schoolData.noOfStudents || schoolData.studentCount) || studentsCountRes.data().count;
                totalStudents += studentCount;
                totalTeachers += teachersCountRes.data().count;

                if (schoolData.subscriptionStatus === 'active') activeSubscriptions++;

                const studentsSnapshot = await getDocs(collection(db, `${schoolPath}/students`));

                let highRiskCount = 0;
                let weightedSum = 0;
                let weightTotal = 0;
                const now = Date.now();

                const weightForAgeDays = (ageDays: number) => {
                    if (ageDays <= 7) return 1.0;
                    if (ageDays <= 30) return 0.7;
                    if (ageDays <= 90) return 0.5;
                    return 0.3;
                };

                await Promise.all(studentsSnapshot.docs.map(async (studentDoc) => {
                    const student = studentDoc.data() as any;
                    if (student.riskLevel === 'high') highRiskCount++;

                    const assessQuery = query(
                        collection(db, `${schoolPath}/students/${studentDoc.id}/assessments`),
                        orderBy('assessmentDate', 'desc'),
                        limit(1)
                    );

                    try {
                        const assessSnap = await getDocs(assessQuery);
                        if (!assessSnap.empty) {
                            const latest = assessSnap.docs[0].data() as any;
                            const riskPercentage = (latest.riskPercentage ?? 0) as number;
                            let dateMs = now;
                            if (latest.assessmentDate?.toDate) dateMs = latest.assessmentDate.toDate().getTime();
                            const ageDays = Math.max(0, (now - dateMs) / (1000 * 60 * 60 * 24));
                            const w = weightForAgeDays(ageDays);
                            weightedSum += (100 - riskPercentage) * w;
                            weightTotal += w;
                        } else if (typeof student.wellbeingScore === 'number') {
                            weightedSum += student.wellbeingScore * 0.3;
                            weightTotal += 0.3;
                        }
                    } catch (err) {
                        console.warn(err);
                    }
                }));

                return {
                    name: schoolData.name || 'Unnamed School',
                    score: weightTotal > 0 ? Math.round((weightedSum / weightTotal) * 10) / 10 : 0,
                    students: studentCount,
                    highRisk: highRiskCount
                };
            }));

            return {
                totalStudents,
                totalTeachers,
                totalSchools: schoolsSnapshot.size,
                activeSubscriptions,
                schoolsData: processedSchools
            };
        },
        enabled: !!auth.currentUser,
        staleTime: 5 * 60 * 1000,
    });
};
