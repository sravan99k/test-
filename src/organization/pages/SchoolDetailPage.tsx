import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { SimpleTable } from '@/components/ui/simple-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { db, auth } from '@/integrations/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface School {
  name: string;
  location: string;
  organization: string;
  email?: string;
  phoneNumber?: string;
  fullName?: string;
  noOfStudents?: number;
}

const OrganizationSchoolDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const [school, setSchool] = useState<School | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');

  // Get school name from location state
  const schoolName = location.state?.schoolName;

  useEffect(() => {
    const loadSchoolData = async () => {
      if (!auth.currentUser || !id) return;

      try {
        setLoading(true);

        // Get user document to find organization info
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          throw new Error('User data not found');
        }

        const userData = userDocSnap.data();
        const adminId = userData.parentAdminId || auth.currentUser.uid;
        const organizationId = userData.organizationId;

        if (!organizationId) {
          throw new Error('Organization ID not found');
        }

        console.log('[OrganizationSchoolDetail] Loading school:', { adminId, organizationId, schoolId: id });

        // Fetch school data
        const schoolPath = `users/${adminId}/organizations/${organizationId}/schools/${id}`;
        const schoolRef = doc(db, `users/${adminId}/organizations/${organizationId}/schools`, id);
        const schoolSnap = await getDoc(schoolRef);

        if (!schoolSnap.exists()) {
          throw new Error('School not found');
        }

        const schoolData = schoolSnap.data();
        console.log('[OrganizationSchoolDetail] School data:', schoolData);

        setSchool({
          name: schoolData.name || '',
          location: schoolData.location || '',
          organization: userData.organizationName || 'Organization',
          email: schoolData.email || '',
          phoneNumber: schoolData.phone || '',
          fullName: schoolData.adminName || '',
          noOfStudents: schoolData.studentCount || 0
        });

        // Load teachers and students in parallel
        const [teachersSnapshot, studentsSnapshot] = await Promise.all([
          getDocs(collection(db, `${schoolPath}/teachers`)),
          getDocs(collection(db, `${schoolPath}/students`))
        ]);

        const teachersData = teachersSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || '',
          subject: doc.data().subject || 'N/A',
          experience: doc.data().experience || 'N/A',
          email: doc.data().email || ''
        }));
        setTeachers(teachersData);

        const studentsData = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          studentId: doc.data().studentId || doc.id,
          name: doc.data().name || '',
          grade: doc.data().grade || 'N/A',
          rollNo: doc.data().rollNumber || 'N/A',
          email: doc.data().email || ''
        }));
        setStudents(studentsData);

      } catch (error: any) {
        console.error('[OrganizationSchoolDetail] Error loading school:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load school details',
          variant: 'destructive'
        });
        navigate('/organization/schools');
      } finally {
        setLoading(false);
      }
    };

    loadSchoolData();
  }, [id, navigate, toast]);

  const studentColumns = [
    { header: 'Student ID', accessor: 'studentId' as const },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Grade', accessor: 'grade' as const },

    { header: 'Email', accessor: 'email' as const },
  ];

  const teacherColumns = [
    { header: 'Name', accessor: 'name' as const },
    { header: 'Subject', accessor: 'subject' as const },
    { header: 'Experience', accessor: 'experience' as const },
    { header: 'Email', accessor: 'email' as const },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading school details...</p>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <p className="text-lg">School not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/organization/schools')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{school.name}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Contact Card */}
          <Card id="org-tour-school-info" className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Contact Person</p>
                  <p className="text-sm font-medium">{school.fullName || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{school.phoneNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{school.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{school.location || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Count Card */}
          <Card className="bg-gradient-to-br from-white to-indigo-50 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-indigo-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                {activeTab === 'teachers' ? 'Teachers Overview' : 'Students Overview'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full py-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                  <span className="text-3xl font-bold text-indigo-700">
                    {activeTab === 'teachers' ? teachers.length : students.length}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                  Total
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {activeTab === 'teachers'
                  ? (
                    teachers.length === 0
                      ? 'No teachers found in this school.'
                      : teachers.length === 1
                        ? '1 teacher in this school'
                        : `${teachers.length} teachers in this school`
                  )
                  : (
                    students.length === 0
                      ? 'No students enrolled yet'
                      : students.length === 1
                        ? '1 student enrolled'
                        : `${students.length} students enrolled`
                  )}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card id="org-tour-school-tabs">
          <CardContent className="pt-6">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'students' | 'teachers')}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="teachers">Teachers</TabsTrigger>
              </TabsList>
              <TabsContent value="students" className="space-y-4">
                {students.length > 0 ? (
                  <SimpleTable columns={studentColumns} data={students} keyField="id" />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No students found in this school.
                  </div>
                )}
              </TabsContent>
              <TabsContent value="teachers" className="space-y-4">
                {teachers.length > 0 ? (
                  <SimpleTable columns={teacherColumns} data={teachers} keyField="id" />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No teachers found in this school.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationSchoolDetailPage;
