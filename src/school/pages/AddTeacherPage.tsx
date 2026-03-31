import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { db, auth } from '@/integrations/firebase';
import { getSecondaryAuth } from '@/services/novoAdminService';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

export default function AddTeacherPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add teachers",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // 1) Get school info from Firestore (not from useAuth hook)
      if (!auth.currentUser) {
        throw new Error('Not authenticated');
      }

      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        throw new Error('User document not found in Firestore');
      }

      const userData = userDocSnap.data();
      console.log('[AddTeacher] Firestore user data:', userData);
      
      const schoolId = userData.schoolId;
      const adminId = userData.parentAdminId;
      const organizationId = userData.organizationId;
      const isIndependent = userData.isIndependent;
      
      console.log('[AddTeacher] School info:', { schoolId, adminId, organizationId, isIndependent });
      
      if (!schoolId) {
        throw new Error(`School ID not found in Firestore user document. Available fields: ${Object.keys(userData).join(', ')}. Please ensure the school was created with the latest code.`);
      }
      
      if (!adminId) {
        throw new Error('Admin ID (parentAdminId) not found. Please ensure the school was created with the latest code.');
      }

      // 2) Create Firebase Auth account for teacher
      const secondaryAuth = getSecondaryAuth();
      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.email,
        formData.password
      );
      console.log('[AddTeacher] Auth user created:', cred.user.uid);

      // 3) Determine the correct path for teacher
      let teacherPath = '';
      if (isIndependent) {
        teacherPath = `users/${adminId}/schools/${schoolId}/teachers`;
      } else {
        teacherPath = `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/teachers`;
      }

      // 4) Create teacher document in Firestore
      const teacherId = `${formData.firstName.toLowerCase()}-${formData.lastName.toLowerCase()}`;
      await setDoc(doc(db, teacherPath, teacherId), {
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
      });

      // 5) Create /users document for teacher
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: formData.email,
        role: 'teacher',
        slug: `teacher-${teacherId}`,
        name: `${formData.firstName} ${formData.lastName}`,
        teacherId: teacherId,
        schoolId: schoolId,
        organizationId: organizationId || null,
        parentAdminId: adminId,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        status: 'active'
      });

      toast({
        title: "Teacher Added Successfully",
        description: `${formData.firstName} ${formData.lastName} can now log in with their email and password.`,
      });

      navigate('/management/teachers');
    } catch (error: any) {
      console.error('[AddTeacher] Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add teacher",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate("/management/teachers")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Teachers
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Teacher</CardTitle>
          <CardDescription>Enter teacher details to create their account and login credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teacherID">Teacher ID</Label>
                <Input
                  id="teacherID"
                  type="text"
                  value={formData.ID}
                  onChange={(e) => handleChange("ID", e.target.value)}
                  autoComplete="off"
                  placeholder="e.g., T001, TEA123"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  placeholder="Enter subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification *</Label>
                <Input
                  id="qualification"
                  placeholder="e.g., M.Ed, B.Ed"
                  value={formData.qualification}
                  onChange={(e) => handleChange("qualification", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience (years) *</Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/management/teachers")} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding Teacher..." : "Add Teacher"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
