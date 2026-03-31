import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { db, auth } from '@/integrations/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function OrganizationStudentsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSchool, setFilterSchool] = useState("all");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [students, setStudents] = useState<Array<{
    id: string;
    name: string;
    school: string;
    grade: string;
    age: number;
    riskLevel: string;
    lastAssessment: string;
  }>>([]);
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const fetchStudents = async () => {
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

        const studentsList: typeof students = [];
        const schoolsList: typeof schools = [];

        for (const schoolDoc of schoolsSnapshot.docs) {
          const schoolData = schoolDoc.data();
          const schoolName = schoolData.name || 'Unnamed School';
          const schoolPath = `${schoolsPath}/${schoolDoc.id}`;

          schoolsList.push({ id: schoolDoc.id, name: schoolName });

          const studentsSnapshot = await getDocs(collection(db, `${schoolPath}/students`));

          studentsSnapshot.docs.forEach(studentDoc => {
            const student = studentDoc.data();
            studentsList.push({
              id: studentDoc.id,
              name: student.name || 'Unknown',
              school: schoolName,
              grade: student.grade || 'N/A',
              age: student.age || 0,
              riskLevel: student.riskLevel ? student.riskLevel.charAt(0).toUpperCase() + student.riskLevel.slice(1) : 'Low',
              lastAssessment: student.lastAssessment || 'N/A'
            });
          });
        }

        setStudents(studentsList);
        setSchools(schoolsList);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast({
          title: "Error",
          description: "Failed to load students data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user, toast]);

  const handleAddStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Feature Coming Soon",
      description: "Adding students will be available soon.",
      variant: "default"
    });
    setIsAddDialogOpen(false);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSchool = filterSchool === "all" || student.school === filterSchool;
    const matchesGrade = filterGrade === "all" || student.grade === filterGrade;
    const matchesRisk = filterRisk === "all" || student.riskLevel === filterRisk;
    return matchesSearch && matchesSchool && matchesGrade && matchesRisk;
  });

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "High": return "bg-red-100 text-red-700 border-red-300";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default: return "bg-green-100 text-green-700 border-green-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Students Management</h1>
          <p className="text-muted-foreground mt-2">View and manage all students across your organization</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <Label htmlFor="name">Student Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="school">School</Label>
                <Select name="school" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map(school => (
                      <SelectItem key={school.id} value={school.name}>{school.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="grade">Grade</Label>
                <Select name="grade" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 7, 8, 9, 10, 11, 12].map(grade => (
                      <SelectItem key={grade} value={grade.toString()}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" min="11" max="19" required />
              </div>
              <Button type="submit" className="w-full">Add Student</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
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
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger>
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {[6, 7, 8, 9, 10, 11, 12].map(grade => (
                  <SelectItem key={grade} value={grade.toString()}>Grade {grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger>
                <SelectValue placeholder="All Risk Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="Low">Low Risk</SelectItem>
                <SelectItem value="Medium">Medium Risk</SelectItem>
                <SelectItem value="High">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students List ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">School</th>
                    <th className="text-left p-4">Grade</th>
                    <th className="text-left p-4">Age</th>
                    <th className="text-left p-4">Risk Level</th>
                    <th className="text-left p-4">Last Assessment</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="p-4 font-medium">{student.name}</td>
                      <td className="p-4 text-sm text-muted-foreground">{student.school}</td>
                      <td className="p-4">{student.grade}</td>
                      <td className="p-4">{student.age}</td>
                      <td className="p-4">
                        <Badge className={getRiskBadgeColor(student.riskLevel)}>
                          {student.riskLevel}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{student.lastAssessment}</td>
                      <td className="p-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No students found. {searchQuery || filterSchool !== 'all' || filterGrade !== 'all' || filterRisk !== 'all' ? 'Try adjusting your filters.' : 'No students in the organization yet.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
