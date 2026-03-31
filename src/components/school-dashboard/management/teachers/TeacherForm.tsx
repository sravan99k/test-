import { useState } from "react";
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
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { validateEmail } from '@/utils/emailValidation';

interface TeacherFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function TeacherForm({ onSuccess, onCancel }: TeacherFormProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        ID: "",
        subject: "",
        qualification: "",
        experience: "",
        dateOfBirth: "",
        gender: "",
        address: "",
    });

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

            if (!schoolId || !adminId) throw new Error('School/Admin ID missing');

            const secondaryAuth = getSecondaryAuth();
            const cred = await createUserWithEmailAndPassword(
                secondaryAuth,
                formData.email,
                formData.password
            );

            const teacherPath = isIndependent
                ? `users/${adminId}/schools/${schoolId}/teachers`
                : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/teachers`;

            const teacherId = `${formData.firstName.toLowerCase()}-${formData.lastName.toLowerCase()}`.replace(/[^a-z0-9]+/g, '-');

            const teacherData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
                teacherID: formData.ID || '',
                subject: formData.subject || 'General',
                qualification: formData.qualification,
                experience: formData.experience,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                address: formData.address,
                teacherUserId: cred.user.uid,
                schoolId: schoolId,
                status: 'active',
                createdAt: serverTimestamp()
            };

            await setDoc(doc(db, teacherPath, teacherId), teacherData);

            await setDoc(doc(db, 'users', cred.user.uid), {
                email: formData.email,
                role: 'teacher',
                slug: `teacher-${teacherId}`,
                name: `${formData.firstName} ${formData.lastName}`,
                teacherId: teacherId,
                schoolId: schoolId,
                organizationId: organizationId || null,
                parentAdminId: adminId,
                isIndependent,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                status: 'active'
            });

            toast({
                title: "Success",
                description: "Teacher added successfully",
            });
            onSuccess();
        } catch (error: any) {
            console.error('Error adding teacher:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to add teacher",
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

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Teacher ID</Label>
                    <Input
                        value={formData.ID}
                        onChange={(e) => handleChange('ID', e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Qualification *</Label>
                    <Input
                        value={formData.qualification}
                        onChange={(e) => handleChange('qualification', e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Experience (years) *</Label>
                    <Input
                        type="number"
                        value={formData.experience}
                        onChange={(e) => handleChange('experience', e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <Label>Address</Label>
                <Input
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Teacher'}</Button>
            </div>
        </form>
    );
}
