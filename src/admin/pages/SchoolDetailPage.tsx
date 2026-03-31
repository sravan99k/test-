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

const SchoolDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const [school, setSchool] = useState<School | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
  
  // Get organization ID from location state if coming from organization page
  const organizationId = location.state?.organizationId;
  const organizationName = location.state?.organizationName;

  useEffect(() => {
    const loadSchoolData = async () => {
      if (!auth.currentUser || !id) return;

      try {
        setLoading(true);
        const adminId = auth.currentUser.uid;
        let schoolData = null;
        let schoolPath = '';
        let isIndependent = false;

        // If organizationId is provided, fetch directly from that organization
        if (organizationId) {
          const schoolRef = doc(db, `users/${adminId}/organizations/${organizationId}/schools`, id);
          const schoolSnap = await getDoc(schoolRef);
          
          if (schoolSnap.exists()) {
            schoolData = schoolSnap.data();
            schoolPath = `users/${adminId}/organizations/${organizationId}/schools/${id}`;
            isIndependent = false;
            console.log('[SchoolDetail] Found school under organization:', organizationId);
          }
        } else {
          // Try to find school in independent schools first
          const independentSchoolRef = doc(db, `users/${adminId}/schools`, id);
          const independentSchoolSnap = await getDoc(independentSchoolRef);

          if (independentSchoolSnap.exists()) {
            schoolData = independentSchoolSnap.data();
            schoolPath = `users/${adminId}/schools/${id}`;
            isIndependent = true;
            console.log('[SchoolDetail] Found independent school:', id);
          } else {
            // Search in all organizations
            const orgsSnapshot = await getDocs(collection(db, `users/${adminId}/organizations`));
            
            for (const orgDoc of orgsSnapshot.docs) {
              const orgId = orgDoc.id;
              const schoolRef = doc(db, `users/${adminId}/organizations/${orgId}/schools`, id);
              const schoolSnap = await getDoc(schoolRef);
              
              if (schoolSnap.exists()) {
                schoolData = schoolSnap.data();
                schoolPath = `users/${adminId}/organizations/${orgId}/schools/${id}`;
                isIndependent = false;
                console.log('[SchoolDetail] Found school under organization:', orgId);
                break;
              }
            }
          }
        }

        if (schoolData) {
          setSchool({
            name: schoolData.name || '',
            location: schoolData.location || '',
            organization: organizationName || (isIndependent ? 'Independent School' : (schoolData.organizationName || 'N/A')),
            email: schoolData.email || '',
            phoneNumber: schoolData.phone || '',
            fullName: schoolData.adminName || '',
            noOfStudents: schoolData.studentCount || 0
          });

          // Load teachers
          const teachersSnapshot = await getDocs(collection(db, `${schoolPath}/teachers`));
          const teachersData = teachersSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || '',
            subject: doc.data().subject || 'N/A',
            experience: doc.data().experience || 'N/A',
            email: doc.data().email || ''
          }));
          setTeachers(teachersData);

          // Load students directly from school's students collection
          const studentsSnapshot = await getDocs(collection(db, `${schoolPath}/students`));
          const studentsData = studentsSnapshot.docs.map(doc => ({
            id: doc.id,
            studentId: doc.data().studentId || doc.id, // Use studentId if exists, otherwise fallback to doc.id
            name: doc.data().name || '',
            grade: doc.data().grade || 'N/A',
            rollNo: doc.data().rollNumber || 'N/A',
            email: doc.data().email || ''
          }));
          setStudents(studentsData);
        } else {
          toast({
            title: 'Error',
            description: 'School not found',
            variant: 'destructive'
          });
          navigate('/admin/schools');
        }
      } catch (error) {
        console.error('[SchoolDetail] Error loading school:', error);
        toast({
          title: 'Error',
          description: 'Failed to load school details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadSchoolData();
  }, [id, organizationId]);

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
        <p className="text-lg">Loading school details...</p>
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
          <Button variant="ghost" onClick={() => organizationId ? navigate(`/admin/organizations/${organizationId}`) : navigate('/admin/schools')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{school.name}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Contact Card */}
          <Card className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
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
          <Card className="bg-gradient-to-br from-white to-indigo-50 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
            <CardHeader className="pb-0">
              <CardTitle className="text-md font-medium text-center text-indigo-700">
                {activeTab === 'teachers' ? 'Total Teachers' : 'Total Students'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-4">
              <span className="text-5xl font-bold text-indigo-700">
                {activeTab === 'teachers' ? teachers.length : students.length}
              </span>
            </CardContent>
          </Card>
        </div>

        <Card>
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
                <SimpleTable columns={studentColumns} data={students} keyField="id" />
              </TabsContent>
              <TabsContent value="teachers" className="space-y-4">
                <SimpleTable columns={teacherColumns} data={teachers} keyField="id" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolDetailPage;
