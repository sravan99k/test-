import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { School, Users, Plus, Edit, Trash2, ChevronRight } from "lucide-react";

interface ClassSection {
  id: string;
  grade: string;
  section: string;
  students: number;
  teacher?: string;
}

const SCHOOL_CLASSES: Record<string, ClassSection[]> = {
  'novo.school@gmail.com': [
    { id: "C101", grade: "7", section: "A", students: 35, teacher: "Meena Agarwal" },
    { id: "C102", grade: "7", section: "B", students: 32, teacher: "Meena Agarwal" },
    { id: "C103", grade: "8", section: "A", students: 38, teacher: "Arun Kumar" },
    { id: "C104", grade: "8", section: "B", students: 36, teacher: "Arun Kumar" },
    { id: "C105", grade: "9", section: "A", students: 34, teacher: "Ramu Yadav" },
    { id: "C106", grade: "10", section: "A", students: 40, teacher: "Anitha Kapoor" },
  ],
  'greenwoodint.school@gmail.com': [
    { id: "C201", grade: "7", section: "A", students: 30, teacher: "Rajesh Kumar" },
    { id: "C202", grade: "8", section: "A", students: 33, teacher: "Arjun Mehta" },
    { id: "C203", grade: "9", section: "A", students: 28, teacher: "Kavya Iyer" },
    { id: "C204", grade: "10", section: "A", students: 35, teacher: "Priya Desai" },
  ],
  'horizonhigh.school@gmail.com': [
    { id: "C301", grade: "7", section: "A", students: 40, teacher: "Nandita Choudary" },
    { id: "C302", grade: "8", section: "A", students: 38, teacher: "Raghav Joshi" },
    { id: "C303", grade: "9", section: "A", students: 35, teacher: "Meera Nair" },
    { id: "C304", grade: "10", section: "A", students: 36, teacher: "Manoj Chatterjee" },
  ],
};

const getClassesBySchool = (email?: string): ClassSection[] => {
  if (!email || !SCHOOL_CLASSES[email]) return [];
  return SCHOOL_CLASSES[email];
};

export default function ClassesManagementPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClass, setNewClass] = useState({ grade: "", section: "" });

  useEffect(() => {
    const schoolClasses = getClassesBySchool(user?.email);
    setClasses(schoolClasses);
  }, [user?.email]);

  const handleCreateClass = () => {
    if (!newClass.grade || !newClass.section) {
      toast({
        title: "Invalid Input",
        description: "Please select both grade and section",
        variant: "destructive",
      });
      return;
    }

    const exists = classes.some(
      (cls) => cls.grade === newClass.grade && cls.section === newClass.section
    );

    if (exists) {
      toast({
        title: "Class Already Exists",
        description: `Class ${newClass.grade}${newClass.section} is already created`,
        variant: "destructive",
      });
      return;
    }

    const newClassData: ClassSection = {
      id: Date.now().toString(),
      grade: newClass.grade,
      section: newClass.section,
      students: 0, // Default students to 0
    };

    setClasses([...classes, newClassData]);
    toast({
      title: "Class Created",
      description: `Class ${newClass.grade}${newClass.section} has been created successfully`,
    });

    setNewClass({ grade: "", section: "" });
    setIsDialogOpen(false);
  };

  const handleDeleteClass = (id: string) => {
    const classToDelete = classes.find((cls) => cls.id === id);
    setClasses(classes.filter((cls) => cls.id !== id));
    toast({
      title: "Class Deleted",
      description: `Class ${classToDelete?.grade}${classToDelete?.section} has been removed`,
    });
  };

  const groupedClasses = classes.reduce((acc, cls) => {
    if (!acc[cls.grade]) {
      acc[cls.grade] = [];
    }
    acc[cls.grade].push(cls);
    return acc;
  }, {} as Record<string, ClassSection[]>);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Grades & Sections</h1>
          <p className="text-muted-foreground mt-1">Manage grades and sections in your school</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Grade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Grade</DialogTitle>
              <DialogDescription>
                Add a new grade and section to your school
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select
                  value={newClass.grade}
                  onValueChange={(value) => setNewClass({ ...newClass, grade: value })}
                >
                  <SelectTrigger id="grade">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 7, 8, 9, 10, 11, 12].map((grade) => (
                      <SelectItem key={grade} value={grade.toString()}>
                        Grade {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Select
                  value={newClass.section}
                  onValueChange={(value) => setNewClass({ ...newClass, section: value })}
                >
                  <SelectTrigger id="section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D", "E"].map((section) => (
                      <SelectItem key={section} value={section}>
                        Section {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateClass}>Create Grade</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>All Grades & Sections</CardTitle>
            <CardDescription>Overview of all grades and sections in your school</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.keys(groupedClasses)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((grade, index, array) => (
                  <div key={grade} className="space-y-3">
                    {/* Add separator before each grade except the first one */}
                    {index > 0 && (
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white dark:bg-gray-900 px-3 text-sm text-muted-foreground">
                            Grade {parseInt(grade) - 1} • Grade {grade}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <School className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Grade {grade}</h3>
                      <Badge variant="secondary">{groupedClasses[grade].length} {groupedClasses[grade].length === 1 ? 'section' : 'sections'}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                      {groupedClasses[grade].map((cls) => (
                        <Card key={cls.id} className="relative hover:shadow-none hover:bg-transparent">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-lg font-semibold">
                                  Section {cls.section}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Class {cls.grade}{cls.section}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClass(cls.id)}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{cls.students} students</span>
                              </div>
                              {cls.teacher && (
                                <div className="flex items-center gap-2 text-sm">
                                  <School className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">{cls.teacher}</span>
                                </div>
                              )}
                              {!cls.teacher && (
                                <Badge variant="outline" className="text-xs">
                                  No teacher assigned
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}