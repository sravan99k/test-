import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import {
    fetchStudents,
    getSchoolSettings,
    Student,
} from "@/services/schoolDataService";
import { db, auth } from '@/integrations/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

interface Teacher {
    id: string;
    teacherID?: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    assignedGrades?: string[];
    experience: string;
    dateAdded?: any;
}

interface GradeStat {
    grade: string;
    total: number;
    unassigned: number;
    sections: string[];
}

interface ManagementContextType {
    students: Student[];
    teachers: Teacher[];
    assignments: Record<string, string[]>; // studentId -> teacherIds[]
    settings: any;
    isLoading: boolean;
    error: string | null;
    refreshData: (force?: boolean) => Promise<void>;
    refreshStudents: () => Promise<void>;
    refreshTeachers: () => Promise<void>;
    refreshAssignments: () => Promise<void>;
    gradeStats: GradeStat[];
}

const ManagementContext = createContext<ManagementContextType | undefined>(undefined);

export const ManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastLoaded, setLastLoaded] = useState<number | null>(null);
    const [assignments, setAssignments] = useState<Record<string, string[]>>({});

    const fetchAllAssignments = useCallback(async (schoolPath: string, teachersList: any[]) => {
        try {
            const masterMap: Record<string, string[]> = {};
            // Performance optimization: We could use Promise.all but for now we follow the existing pattern
            // but centralize it in the context.
            await Promise.all(teachersList.map(async (teacher) => {
                const snap = await getDocs(collection(db, `${schoolPath}/assignments/_list/teachers/${teacher.id}/students`));
                snap.docs.forEach(d => {
                    if (!masterMap[d.id]) masterMap[d.id] = [];
                    if (!masterMap[d.id].includes(teacher.id)) {
                        masterMap[d.id].push(teacher.id);
                    }
                });
            }));
            return masterMap;
        } catch (e) {
            console.error("Fetch Assignments Error:", e);
            return {};
        }
    }, []);

    const loadData = useCallback(async (force = false) => {
        // Cache for 5 minutes unless forced
        if (!force && lastLoaded && Date.now() - lastLoaded < 5 * 60 * 1000) {
            return;
        }

        if (!auth.currentUser) return;

        setIsLoading(true);
        setError(null);

        try {
            // 1. Fetch Settings
            const schoolSettings = await getSchoolSettings();
            setSettings(schoolSettings);

            // 2. Fetch Teachers
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (!userDoc.exists()) return;

            const userData = userDoc.data();
            const { schoolId, parentAdminId: adminId, organizationId, isIndependent } = userData;
            const schoolPath = (isIndependent || !organizationId)
                ? `users/${adminId}/schools/${schoolId}`
                : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

            const teachSnap = await getDocs(collection(db, `${schoolPath}/teachers`));
            const loadedTeachers = teachSnap.docs.map(d => ({
                id: d.id,
                teacherID: d.data().teacherID || d.id,
                name: d.data().name || `${d.data().firstName} ${d.data().lastName}`,
                email: d.data().email,
                subject: d.data().subject,
                phone: d.data().phone,
                assignedGrades: d.data().assignedGrades || [],
                experience: d.data().experience || '0 years',
                dateAdded: d.data().createdAt || d.data().dateAdded,
            }));
            setTeachers(loadedTeachers);

            // 3. Fetch Assignments
            const assignmentMap = await fetchAllAssignments(schoolPath, loadedTeachers);
            setAssignments(assignmentMap);

            // 4. Fetch Students
            const loadedStudents = await fetchStudents({
                school: '', branch: '', state: '', city: '', pincode: ''
            });
            setStudents(loadedStudents);

            setLastLoaded(Date.now());
        } catch (err: any) {
            console.error("Management Data Load Error:", err);
            setError(err.message || "Failed to load management data");
        } finally {
            setIsLoading(false);
        }
    }, [lastLoaded, fetchAllAssignments]);

    const refreshStudents = async () => {
        try {
            const loadedStudents = await fetchStudents({
                school: '', branch: '', state: '', city: '', pincode: ''
            });
            setStudents(loadedStudents);
        } catch (err) {
            console.error(err);
        }
    };

    const refreshTeachers = async () => {
        if (!auth.currentUser) return;
        try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            const userData = userDoc.data();
            const { schoolId, parentAdminId: adminId, organizationId, isIndependent } = userData || {};
            const schoolPath = (isIndependent || !organizationId)
                ? `users/${adminId}/schools/${schoolId}`
                : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

            const teachSnap = await getDocs(collection(db, `${schoolPath}/teachers`));
            const loadedTeachers = teachSnap.docs.map(d => ({
                id: d.id,
                teacherID: d.data().teacherID || d.id,
                name: d.data().name || `${d.data().firstName} ${d.data().lastName}`,
                email: d.data().email,
                subject: d.data().subject,
                phone: d.data().phone,
                assignedGrades: d.data().assignedGrades || [],
                experience: d.data().experience || '0 years',
                dateAdded: d.data().createdAt || d.data().dateAdded,
            }));
            setTeachers(loadedTeachers);
        } catch (err) {
            console.error(err);
        }
    };

    const refreshAssignments = async () => {
        if (!auth.currentUser) return;
        try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            const userData = userDoc.data();
            const { schoolId, parentAdminId: adminId, organizationId, isIndependent } = userData || {};
            const schoolPath = (isIndependent || !organizationId)
                ? `users/${adminId}/schools/${schoolId}`
                : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

            const assignmentMap = await fetchAllAssignments(schoolPath, teachers);
            setAssignments(assignmentMap);
        } catch (err) {
            console.error(err);
        }
    };

    // Calculate Grade Stats for Hubs
    const gradeStats = useMemo(() => {
        const stats: Record<string, GradeStat> = {};

        students.forEach(s => {
            if (!stats[s.grade]) {
                stats[s.grade] = { grade: s.grade, total: 0, unassigned: 0, sections: [] };
            }
            stats[s.grade].total++;
            // A student is considered unassigned if they have no teacher assignments
            const isAssigned = assignments[s.id] && assignments[s.id].length > 0;
            if (!isAssigned) {
                stats[s.grade].unassigned++;
            }

            if (!s.section) s.section = 'A';
            if (!stats[s.grade].sections.includes(s.section)) {
                stats[s.grade].sections.push(s.section);
            }
        });

        return Object.values(stats).sort((a, b) => parseInt(a.grade) - parseInt(b.grade));
    }, [students, assignments]);

    useEffect(() => {
        if (user && user.role === 'management') {
            loadData();
        }
    }, [user, loadData]);

    return (
        <ManagementContext.Provider value={{
            students,
            teachers,
            assignments,
            settings,
            isLoading,
            error,
            refreshData: loadData,
            refreshStudents,
            refreshTeachers,
            refreshAssignments,
            gradeStats
        }}>
            {children}
        </ManagementContext.Provider>
    );
};

export const useManagement = () => {
    const context = useContext(ManagementContext);
    if (!context) {
        throw new Error('useManagement must be used within a ManagementProvider');
    }
    return context;
};
