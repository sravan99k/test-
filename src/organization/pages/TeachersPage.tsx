import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { db, auth } from '@/integrations/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function OrganizationTeachersPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSchool, setFilterSchool] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [loading, setLoading] = useState(true);
  
  const [teachers, setTeachers] = useState<Array<{
    id: string;
    name: string;
    school: string;
    subject: string;
    students: number;
    email: string;
    phone: string;
  }>>([]);
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [avgStudentsPerTeacher, setAvgStudentsPerTeacher] = useState(0);

  useEffect(() => {
    const fetchTeachers = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          setLoading(false);
          return;
        }

        const userData = userDocSnap.data();
        const adminId = userData.parentAdminId || auth.currentUser.uid;
        const organizationId = userData.organizationId;

        if (!organizationId) {
          setLoading(false);
          return;
        }

        const schoolsPath = `users/${adminId}/organizations/${organizationId}/schools`;
        const schoolsSnapshot = await getDocs(collection(db, schoolsPath));

        const teachersList: typeof teachers = [];
        const schoolsList: typeof schools = [];
        const subjectsSet = new Set<string>();
        let totalStudentCount = 0;

        for (const schoolDoc of schoolsSnapshot.docs) {
          const schoolData = schoolDoc.data();
          const schoolName = schoolData.name || 'Unnamed School';
          const schoolPath = `${schoolsPath}/${schoolDoc.id}`;

          schoolsList.push({ id: schoolDoc.id, name: schoolName });

          const teachersSnapshot = await getDocs(collection(db, `${schoolPath}/teachers`));
          const studentsSnapshot = await getDocs(collection(db, `${schoolPath}/students`));
          const studentCount = studentsSnapshot.size;
          totalStudentCount += studentCount;
          
          teachersSnapshot.docs.forEach(teacherDoc => {
            const teacher = teacherDoc.data();
            const subject = teacher.subject || 'General';
            subjectsSet.add(subject);
            
            teachersList.push({
              id: teacherDoc.id,
              name: teacher.name || 'Unknown',
              school: schoolName,
              subject: subject,
              students: Math.floor(studentCount / (teachersSnapshot.size || 1)),
              email: teacher.email || 'N/A',
              phone: teacher.phone || 'N/A'
            });
          });
        }

        setTeachers(teachersList);
        setSchools(schoolsList);
        setSubjects(Array.from(subjectsSet).sort());
        setTotalTeachers(teachersList.length);
        setAvgStudentsPerTeacher(teachersList.length > 0 ? Math.round(totalStudentCount / teachersList.length) : 0);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [user]);

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSchool = filterSchool === "all" || teacher.school === filterSchool;
    const matchesSubject = filterSubject === "all" || teacher.subject === filterSubject;
    return matchesSearch && matchesSchool && matchesSubject;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Teachers Management</h1>
        <p className="text-muted-foreground mt-2">View all teachers across your organization</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTeachers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average Students per Teacher</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgStudentsPerTeacher}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Counselors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.floor(totalTeachers * 0.056)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterSchool} onValueChange={setFilterSchool}>
              <SelectTrigger>
                <SelectValue placeholder="All Schools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools.map(school => (
                  <SelectItem key={school.id} value={school.name}>{school.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teachers List */}
      <Card>
        <CardHeader>
          <CardTitle>Teachers List ({filteredTeachers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTeachers.length > 0 ? (
            <div className="space-y-4">
            {filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-semibold">{teacher.name}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>🏫 {teacher.school}</span>
                    <span>📚 {teacher.subject}</span>
                    <span>👥 {teacher.students} Students</span>
                  </div>
                  <div className="flex gap-3 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {teacher.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {teacher.phone}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </div>
            ))}
          </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No teachers found. {searchQuery || filterSchool !== 'all' || filterSubject !== 'all' ? 'Try adjusting your filters.' : 'No teachers in the organization yet.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
