import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
// TODO: Replace Supabase logic with Firebase/Firestore.
import { db } from "@/integrations/firebase";
import { collection, getDocs, query, where, orderBy, onSnapshot } from "firebase/firestore";

import { Download, Filter, Search } from "lucide-react";

// Import the progress components
import { StudentOverviewTable } from "@/components/progress/StudentOverviewTable";
import { IndividualStudentProgress } from "@/components/progress/IndividualStudentProgress";
import { AggregateTrends } from "@/components/progress/AggregateTrends";
import { InterventionTracking } from "@/components/progress/InterventionTracking";

interface AssessmentResult {
  depression?: number;
  stress?: number;
  anxiety?: number;
  adhd?: number;
  wellbeing?: number;
  overall?: number;
}

interface AssessmentData {
  id: string;
  user_id: string;
  categories: string[];
  responses: any;
  results?: AssessmentResult;
  completed_at: string;
}

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [assessmentData, setAssessmentData] = useState<AssessmentData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const isManagement = user?.role === 'management';

  useEffect(() => {
    loadAssessmentData();
  }, [user, selectedPeriod, selectedCategory]);

  const loadAssessmentData = async () => {
    if (!user) return;

    try {
      // TODO: Replace this query with Firestore logic. Example:
      // const q = query(collection(db, 'YOUR_COLLECTION'));
      // Firestore migration:
      try {
        let q;
        if (isManagement) {
          q = query(collection(db, "assessment_responses"), orderBy("completed_at", "asc"));
        } else {
          q = query(
            collection(db, "assessment_responses"),
            where("user_id", "==", user.uid),
            orderBy("completed_at", "asc")
          );
        }
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => doc.data());
        setAssessmentData((data || []) as AssessmentData[]);
      } catch (error) {
        console.error('Error loading assessment data:', error);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading assessment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressData = () => {
    if (!assessmentData.length) return [];

    return assessmentData.map((assessment) => ({
      date: new Date(assessment.completed_at).toLocaleDateString(),
      depression: (assessment.results?.depression as number) || Math.floor(Math.random() * 100),
      stress: (assessment.results?.stress as number) || Math.floor(Math.random() * 100),
      anxiety: (assessment.results?.anxiety as number) || Math.floor(Math.random() * 100),
      wellbeing: (assessment.results?.wellbeing as number) || Math.floor(Math.random() * 100),
      overall: (assessment.results?.overall as number) || Math.floor(Math.random() * 100),
    }));
  };

  const getStudentList = () => {
    if (!isManagement) return [];
    // Add gender and class for demo
    const allStudents = [
      { id: 'ST001', name: 'Rahul Sharma', class: 'Grade 10', gender: 'Male', riskLevel: 'High', lastAssessment: '2025-06-15' },
      { id: 'ST002', name: 'Priya Patel', class: 'Grade 9', gender: 'Female', riskLevel: 'Low', lastAssessment: '2025-06-14' },
      { id: 'ST003', name: 'Amit Kumar', class: 'Grade 11', gender: 'Male', riskLevel: 'Moderate', lastAssessment: '2025-06-13' },
      { id: 'ST004', name: 'Anjali Verma', class: 'Grade 10', gender: 'Female', riskLevel: 'High', lastAssessment: '2025-06-12' },
      { id: 'ST005', name: 'Vikram Singh', class: 'Grade 9', gender: 'Male', riskLevel: 'Low', lastAssessment: '2025-06-11' },
      { id: 'ST006', name: 'Neha Gupta', class: 'Grade 11', gender: 'Female', riskLevel: 'Moderate', lastAssessment: '2025-06-10' },
    ];
    return allStudents.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass === "all" || student.class === selectedClass;
      const matchesGender = selectedGender === "all" || student.gender === selectedGender;
      return matchesSearch && matchesClass && matchesGender;
    });
  };

  const getAggregateData = () => {
    const categories = ['Depression', 'Stress', 'Anxiety', 'ADHD', 'Wellbeing'];
    return categories.map(category => ({
      category,
      percentage: Math.floor(Math.random() * 100),
      trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down',
      change: Math.floor(Math.random() * 20),
      studentCount: Math.floor(Math.random() * 50) + 10,
    }));
  };

  const getRiskColor = (percentage: number) => {
    if (percentage >= 70) return "text-red-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  const getRiskLevel = (percentage: number) => {
    if (percentage >= 70) return "High Risk";
    if (percentage >= 40) return "Moderate Risk";
    return "Low Risk";
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportData = () => {
    const csvData = assessmentData.map(assessment => ({
      Date: new Date(assessment.completed_at).toLocaleDateString(),
      Categories: assessment.categories.join(', '),
      Results: JSON.stringify(assessment.results || {}),
    }));

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Categories,Results\n"
      + csvData.map(row => `${row.Date},"${row.Categories}","${row.Results}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Filter progressData by selectedCategory for chart
  let progressData = getProgressData();
  if (selectedCategory !== "all") {
    progressData = progressData.map((entry) => {
      const filtered: any = { date: entry.date };
      if (entry[selectedCategory] !== undefined) {
        filtered[selectedCategory] = entry[selectedCategory];
      }
      return filtered;
    });
  }
  
  const aggregateData = getAggregateData();
  const studentList = getStudentList();

  return (
    <div className="min-h-screen bg-gray-50">
            <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              School Analytics Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Monitor student mental health trends and intervention effectiveness
            </p>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex gap-4">
              {/* Class Filter */}
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="Grade 6">Grade 6</SelectItem>
                  <SelectItem value="Grade 7">Grade 7</SelectItem>
                  <SelectItem value="Grade 8">Grade 8</SelectItem>
                  <SelectItem value="Grade 9">Grade 9</SelectItem>
                  <SelectItem value="Grade 10">Grade 10</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Gender Filter */}
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last90">Last 3 Months</SelectItem>
                  <SelectItem value="lastyear">Last Year</SelectItem>
                </SelectContent>
              </Select>

              
            </div>
            <div className="flex gap-2 items-center">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <Button onClick={exportData} variant="outline" className="ml-auto">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>

          <div className="space-y-8">
            <StudentOverviewTable
              studentList={studentList}
              onSelectStudent={setSelectedStudent}
              getRiskBadgeColor={getRiskBadgeColor}
            />

            {selectedStudent && (
              <IndividualStudentProgress
                selectedStudent={selectedStudent}
                progressData={progressData}
              />
            )}

            <AggregateTrends
              aggregateData={aggregateData}
              getRiskColor={getRiskColor}
            />

            <InterventionTracking />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AnalyticsPage;
