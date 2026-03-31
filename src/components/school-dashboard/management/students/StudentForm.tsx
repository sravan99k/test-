import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { db, auth } from '@/integrations/firebase';
import { getSecondaryAuth } from '@/services/novoAdminService';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
    doc,
    setDoc,
    serverTimestamp,
    getDoc,
    getDocs,
    collection,
    writeBatch,
    increment
} from 'firebase/firestore';

interface StudentFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: any;
    mode?: 'add' | 'edit';
}

interface Teacher {
    id: string;
    name: string;
}

export function StudentForm({ onSuccess, onCancel, initialData, mode = 'add' }: StudentFormProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [formData, setFormData] = useState({
        firstName: initialData?.firstName || initialData?.name?.split(' ')[0] || "",
        lastName: initialData?.lastName || initialData?.name?.split(' ').slice(1).join(' ') || "",
        studentId: initialData?.studentId || initialData?.id || "",
        email: initialData?.email || "",
        password: "",
        phone: initialData?.phone || "",
        grade: initialData?.grade || "",
        section: initialData?.section || "",
        dateOfBirth: initialData?.dateOfBirth || "",
        gender: initialData?.gender || "",
        address: initialData?.address || "",
        parentName: initialData?.parentName || "",
        parentPhone: initialData?.parentPhone || "",
        teacherId: initialData?.teacherId || "",
    });

    // Load teachers
    useEffect(() => {
        const loadTeachers = async () => {
            try {
                if (!auth.currentUser) return;
                const userDocRef = doc(db, 'users', auth.currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (!userDocSnap.exists()) return;

                const userData = userDocSnap.data();
                const { schoolId, parentAdminId: adminId, organizationId, isIndependent } = userData;

                if (!schoolId || !adminId) return;

                const teachersPath = isIndependent
                    ? `users/${adminId}/schools/${schoolId}/teachers`
                    : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/teachers`;

                const teachersSnapshot = await getDocs(collection(db, teachersPath));
                const teachersData: Teacher[] = teachersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || `${doc.data().firstName} ${doc.data().lastName}`
                }));

                setTeachers(teachersData);

                // If editing, try to find current teacher
                if (mode === 'edit' && initialData?.id) {
                    const assignmentPath = `${teachersPath.replace('/teachers', '')}/assignments/_list`;
                    const assignmentSnaps = await Promise.all(
                        teachersSnapshot.docs.map(t =>
                            getDoc(doc(db, `${assignmentPath}/teachers/${t.id}/students`, initialData.id))
                        )
                    );
                    const foundIndex = assignmentSnaps.findIndex(s => s.exists());
                    if (foundIndex !== -1) {
                        setFormData(prev => ({ ...prev, teacherId: teachersSnapshot.docs[foundIndex].id }));
                    }
                }
            } catch (error) {
                console.error('Error loading teachers:', error);
            }
        };
        loadTeachers();
    }, []);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!auth.currentUser) throw new Error('Not authenticated');

            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists()) throw new Error('User document not found');

            const userData = userDocSnap.data();
            const { schoolId, parentAdminId: adminId, organizationId, isIndependent } = userData;

            let studentUserId = initialData?.studentUserId || "";

            if (!schoolId || !adminId) throw new Error('School/Admin ID missing');

            if (mode === 'add') {
                const secondaryAuth = getSecondaryAuth();
                const cred = await createUserWithEmailAndPassword(
                    secondaryAuth,
                    formData.email,
                    formData.password
                );
                studentUserId = cred.user.uid;
            }

            // School Path
            const schoolPath = isIndependent
                ? `users/${adminId}/schools/${schoolId}`
                : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

            // Create/Update Grade
            const classId = `${formData.grade}${formData.section}`;
            const gradesPath = `${schoolPath}/grades`;
            const gradeDocRef = doc(db, gradesPath, classId);
            const gradeDoc = await getDoc(gradeDocRef);

            if (!gradeDoc.exists()) {
                await setDoc(gradeDocRef, {
                    id: classId,
                    grade: formData.grade,
                    section: formData.section,
                    name: `Grade ${formData.grade} - Section ${formData.section}`,
                    students: 0,
                    teacherIds: [],
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }

            // Add Student
            const studentSlug = initialData?.id || formData.studentId || `${formData.firstName.toLowerCase()}-${formData.lastName.toLowerCase()}`;
            const studentPath = `${schoolPath}/students`;
            const batch = writeBatch(db);
            const studentRef = doc(db, studentPath, studentSlug);

            const studentData: any = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                studentId: formData.studentId || studentSlug,
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
                grade: formData.grade,
                section: formData.section,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                address: formData.address,
                parentName: formData.parentName,
                parentPhone: formData.parentPhone,
                updatedAt: serverTimestamp()
            };

            if (mode === 'add') {
                studentData.studentUserId = studentUserId;
                studentData.schoolId = schoolId;
                studentData.status = 'active';
                studentData.createdAt = serverTimestamp();
            }

            if (mode === 'add') {
                batch.set(studentRef, studentData);
                batch.update(gradeDocRef, {
                    students: increment(1),
                    updatedAt: serverTimestamp()
                });
            } else {
                batch.update(studentRef, studentData);
            }

            await batch.commit();

            // Create grade/section record
            const gradeListPath = `${schoolPath}/grades/_list/${formData.grade}/${formData.section}/students`;
            await setDoc(doc(db, gradeListPath, studentSlug), {
                studentId: studentSlug,
                updatedAt: serverTimestamp()
            }, { merge: true });

            if (mode === 'add' || initialData?.studentUserId) {
                const uid = initialData?.studentUserId || studentUserId;
                const updateData: any = {
                    ...studentData,
                    updatedAt: serverTimestamp()
                };
                if (mode === 'add') {
                    updateData.role = 'student';
                    updateData.slug = `student-${studentSlug}`;
                    updateData.parentAdminId = adminId;
                    updateData.organizationId = isIndependent ? null : organizationId;
                    updateData.isIndependent = isIndependent;
                    updateData.createdAt = serverTimestamp();
                    updateData.lastLogin = serverTimestamp();
                }
                await setDoc(doc(db, 'users', uid), updateData, { merge: true });
            }

            if (formData.teacherId) {
                // If editing and teacher changed, we should technically remove the old one.
                // But for simplicity in this batch, we just set the new one.
                const assignmentPath = `${schoolPath}/assignments/_list/teachers/${formData.teacherId}/students`;
                await setDoc(doc(db, assignmentPath, studentSlug), {
                    studentId: studentSlug,
                    assignedAt: serverTimestamp(),
                    status: 'active'
                }, { merge: true });
            }

            toast({
                title: "Success",
                description: mode === 'add' ? "Student added successfully" : "Student updated successfully",
            });
            onSuccess();
        } catch (error: any) {
            console.error('Error adding student:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to add student",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        required
                    />
                </div>
            </div>

            {mode === 'add' && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Password *</Label>
                        <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2"> {/* Added Student ID field */}
                    <Label>Student ID</Label>
                    <Input
                        value={formData.studentId}
                        onChange={(e) => handleChange('studentId', e.target.value)}
                        placeholder="Auto-generated if blank"
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Grade *</Label>
                    <Select value={formData.grade} onValueChange={(v) => handleChange('grade', v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                            {[6, 7, 8, 9, 10, 11, 12].map(g => (
                                <SelectItem key={g} value={String(g)}>Class {g}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Section *</Label>
                    <Input
                        value={formData.section}
                        onChange={(e) => handleChange('section', e.target.value)}
                        required
                        placeholder="A, B, C..."
                    />
                </div>
                <div className="space-y-2">
                    <Label>Gender *</Label>
                    <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label>Assign Teacher</Label>
                <Select value={formData.teacherId} onValueChange={(v) => handleChange('teacherId', v)}>
                    <SelectTrigger><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                    <SelectContent>
                        {teachers.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Parent Name *</Label>
                <Input
                    value={formData.parentName}
                    onChange={(e) => handleChange('parentName', e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label>Parent Phone *</Label>
                <Input
                    value={formData.parentPhone}
                    onChange={(e) => handleChange('parentPhone', e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label>Address</Label>
                <Input
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? (mode === 'add' ? 'Adding...' : 'Saving...') : (mode === 'add' ? 'Add Student' : 'Save Changes')}</Button>
            </div>
        </form>
    );
}
