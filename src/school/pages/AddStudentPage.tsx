import { useState, useEffect } from "react";
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
import { doc, setDoc, serverTimestamp, getDoc, getDocs, collection, updateDoc, increment, writeBatch } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

interface Teacher {
  id: string;
  name: string;
}

export default function AddStudentPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    email: "",
    password: "",
    phone: "",
    grade: "",
    section: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    parentName: "",
    parentPhone: "",
    teacherId: "",
  });

  // Load teachers on component mount
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        if (!auth.currentUser) return;

        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) return;

        const userData = userDocSnap.data();
        const schoolId = userData.schoolId;
        const adminId = userData.parentAdminId;
        const organizationId = userData.organizationId;
        const isIndependent = userData.isIndependent;
        
        if (!schoolId || !adminId) return;

        let teachersPath = '';
        if (isIndependent) {
          teachersPath = `users/${adminId}/schools/${schoolId}/teachers`;
        } else {
          teachersPath = `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/teachers`;
        }

        const teachersSnapshot = await getDocs(collection(db, teachersPath));
        const teachersData: Teacher[] = teachersSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || `${doc.data().firstName} ${doc.data().lastName}`
        }));

        setTeachers(teachersData);
        
        // Auto-select first teacher if available
        if (teachersData.length > 0) {
          setFormData(prev => ({ ...prev, teacherId: teachersData[0].id }));
        }
      } catch (error) {
        console.error('Error loading teachers:', error);
      }
    };

    loadTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add students",
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
      console.log('[AddStudent] Firestore user data:', userData);
      
      const schoolId = userData.schoolId;
      const adminId = userData.parentAdminId;
      const organizationId = userData.organizationId;
      const isIndependent = userData.isIndependent;
      
      if (!schoolId) {
        throw new Error(`School ID not found in Firestore user document. Please ensure the school was created with the latest code.`);
      }
      
      if (!adminId) {
        throw new Error('Admin ID (parentAdminId) not found. Please ensure the school was created with the latest code.');
      }

      // 2) Create Firebase Auth account for student
      const secondaryAuth = getSecondaryAuth();
      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.email,
        formData.password
      );
      console.log('[AddStudent] Auth user created:', cred.user.uid);

      // 3) Teacher assignment is optional

      // 4) Determine base school path
      let schoolPath = '';
      if (isIndependent) {
        schoolPath = `users/${adminId}/schools/${schoolId}`;
      } else {
        schoolPath = `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;
      }

      // 5) Check if class exists in grades collection, if not create it
      const classId = `${formData.grade}${formData.section}`;
      const gradesPath = `${schoolPath}/grades`;
      const gradeDocRef = doc(db, gradesPath, classId);
      
      console.log(`[AddStudent] Checking for grade at path: ${gradesPath}/${classId}`);
      const gradeDoc = await getDoc(gradeDocRef);
      
      if (!gradeDoc.exists()) {
        const gradeData = {
          id: classId,
          grade: formData.grade,
          section: formData.section,
          name: `Grade ${formData.grade} - Section ${formData.section}`,
          students: 0, // Will be incremented below
          teacherIds: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        console.log(`[AddStudent] Creating new grade:`, gradeData);
        await setDoc(gradeDocRef, gradeData);
        console.log(`[AddStudent] Successfully created grade: ${classId}`);
      } else {
        console.log(`[AddStudent] Grade already exists:`, gradeDoc.data());
      }
      
      // 6) Create student document at school level
      const studentSlug = formData.studentId || `${formData.firstName.toLowerCase()}-${formData.lastName.toLowerCase()}`;
      const studentPath = `${schoolPath}/students`;
      
      // Use a batch to ensure both student creation and class update are atomic
      const batch = writeBatch(db);
      
      // Add student to the batch
      const studentRef = doc(db, studentPath, studentSlug);
      batch.set(studentRef, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        studentId: formData.studentId,
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
        studentUserId: cred.user.uid,
        schoolId: schoolId,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Update grade student count in the same batch
      batch.update(gradeDocRef, {
        students: increment(1),
        updatedAt: serverTimestamp()
      });
      
      // Commit the batch
      await batch.commit();
      console.log(`[AddStudent] Student ${studentSlug} added and class ${classId} updated`);
      
      // Create grade/section record
      const gradePath = `${schoolPath}/grades/_list/${formData.grade}/${formData.section}/students`;
      await setDoc(doc(db, gradePath, studentSlug), {
        enrolledAt: serverTimestamp(),
        status: 'active',
        updatedAt: serverTimestamp()
      });
      console.log(`[AddStudent] Grade record created for student ${studentSlug} in ${formData.grade}${formData.section}`);
      
      // Create user document for student authentication
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: formData.email,
        role: 'student',
        slug: `student-${studentSlug}`,
        studentId: formData.studentId || studentSlug,
        name: `${formData.firstName} ${formData.lastName}`,
        schoolId: schoolId,
        parentAdminId: adminId,
        isIndependent: isIndependent,
        organizationId: isIndependent ? null : organizationId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`[AddStudent] User document created for student ${studentSlug}`);
      
      await setDoc(doc(db, studentPath, studentSlug), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        studentId: formData.studentId,
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
        studentUserId: cred.user.uid,
        schoolId: schoolId,
        status: 'active',
        createdAt: serverTimestamp()
      });
      console.log('[AddStudent] Student document created at:', studentPath);

      // 6) Create assignment: link student to teacher (if teacher is selected)
      if (formData.teacherId) {
        // Path: school/assignments/_list/teachers/{teacherId}/students/{studentId}
        // Using '_list' as placeholder document to make path even (6 segments)
        const assignmentPath = `${schoolPath}/assignments/_list/teachers/${formData.teacherId}/students`;
        await setDoc(doc(db, assignmentPath, studentSlug), {
          assignedAt: serverTimestamp(),
          status: 'active'
        });
        console.log('[AddStudent] Assignment created:', assignmentPath);
      }

      // 7) The grade/section record was already created earlier in the code
      console.log('[AddStudent] Grade record created:', gradePath);

      // 8) Create /users document for student authentication
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: formData.email,
        role: 'student',
        slug: `student-${studentSlug}`,
        studentId: formData.studentId || studentSlug,
        name: `${formData.firstName} ${formData.lastName}`,
        schoolId: schoolId,
        grade: formData.grade,
        section: formData.section,
        organizationId: organizationId || null,
        parentAdminId: adminId,
        isIndependent: isIndependent,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        status: 'active'
      });
      console.log('[AddStudent] User document created');

      toast({
        title: "Student Added Successfully",
        description: `${formData.firstName} ${formData.lastName} can now log in with their email and password.`,
      });

      navigate('/management/students');
    } catch (error: any) {
      console.error('[AddStudent] Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
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
      <Button variant="ghost" onClick={() => navigate("/management/students")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Students
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Student</CardTitle>
          <CardDescription>Enter student details to create their account and login credentials</CardDescription>
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
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => handleChange("studentId", e.target.value)}
                  autoComplete="off"
                  placeholder="e.g., 20230001"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to auto-generate from name
                </p>
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
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher">Assign to Teacher *</Label>
                <Select value={formData.teacherId} onValueChange={(value) => handleChange("teacherId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={teachers.length === 0 ? "No teachers available" : "Select teacher"} />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {teachers.length === 0 && (
                  <p className="text-sm text-red-500">Please add teachers first before adding students.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade *</Label>
                <Select value={formData.grade} onValueChange={(value) => handleChange("grade", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">Class 6</SelectItem>
                    <SelectItem value="7">Class 7</SelectItem>
                    <SelectItem value="8">Class 8</SelectItem>
                    <SelectItem value="9">Class 9</SelectItem>
                    <SelectItem value="10">Class 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section *</Label>
                <Input
                  id="section"
                  value={formData.section}
                  onChange={(e) => handleChange("section", e.target.value)}
                  placeholder="Enter section (e.g., A, B, C)"
                  required
                />
              </div>
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

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Parent/Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                  <Input
                    id="parentName"
                    value={formData.parentName}
                    onChange={(e) => handleChange("parentName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Parent/Guardian Phone *</Label>
                  <Input
                    id="parentPhone"
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => handleChange("parentPhone", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/management/students")} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding Student..." : "Add Student"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
