import { useState, useEffect } from "react";
import { BarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProfanityFilteredInput } from "@/components/ui/profanity-filtered-input";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/integrations/firebase";
import { doc, getDoc, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Search } from "lucide-react";

// Import the new components
import { StudentOverviewTable } from "@/components/school-dashboard/progress/StudentOverviewTable";
import { IndividualStudentProgress } from "@/components/school-dashboard/progress/IndividualStudentProgress";
import { AggregateTrends } from "@/components/school-dashboard/progress/AggregateTrends";
import { InterventionTracking } from "@/components/school-dashboard/progress/InterventionTracking";
import { PersonalProgressChart } from "@/components/school-dashboard/progress/PersonalProgressChart";
import { AssessmentHistory } from "@/components/school-dashboard/progress/AssessmentHistory";
import { ProgressSidebar } from "@/components/school-dashboard/progress/ProgressSidebar";



interface AssessmentData {
  id: string;
  user_id: string;
  categories: string[];
  responses: any;
  results?: {
    overall?: number;
  };
  completed_at: string;
  risk_score: number;  // Added this required field
  notes?: string;      // Added this optional field
  risk_level?: 'low' | 'medium' | 'high';  // Added this optional field with specific values
}
const ProgressTracking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assessmentData, setAssessmentData] = useState<AssessmentData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const isManagement = user?.role === 'management';

  useEffect(() => {
    if (!user) return;

    const setupRealtimeListener = async () => {
      setLoading(true);
      try {
        if (isManagement) {
          // For management users, we would need to implement a service to get all students' assessments
          // For now, return empty array as this requires more complex implementation
          console.log('[ProgressTracking] Management view not fully implemented yet');
          setAssessmentData([]);
          setLoading(false);
          return;
        }

        // For students, set up real-time listener for their assessment data
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        if (userData && userData.studentId && userData.parentAdminId && userData.schoolId) {
          const { studentId, parentAdminId, schoolId, organizationId } = userData;

          // Determine the correct path based on school type
          let assessmentsPath: string;
          if (organizationId) {
            assessmentsPath = `users/${parentAdminId}/organizations/${organizationId}/schools/${schoolId}/students/${studentId}/assessments`;
          } else {
            assessmentsPath = `users/${parentAdminId}/schools/${schoolId}/students/${studentId}/assessments`;
          }

          console.log('[ProgressTracking] Setting up real-time listener for:', assessmentsPath);

          // Set up real-time listener
          const assessmentsQuery = query(
            collection(db, assessmentsPath),
            orderBy('assessmentDate', 'desc')
          );

          const unsubscribe = onSnapshot(
            assessmentsQuery,
            (snapshot) => {
              const assessments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                assessmentDate: doc.data().assessmentDate?.toDate()
              }));

              // Convert assessment format to match expected structure
              const formattedAssessments = assessments.map(assessment => {
                const baseRisk = (assessment as any).riskPercentage || 0;

                return {
                  id: assessment.id,
                  user_id: user.uid,
                  categories: ['mental_health'],
                  responses: (assessment as any).responses || [],
                  results: {
                    overall: Math.round(baseRisk * 100) / 100,
                  },
                  completed_at: (assessment as any).assessmentDate?.toISOString() || new Date().toISOString(),
                  risk_score: Math.round(baseRisk * 100) / 100,
                };
              });

              setAssessmentData(formattedAssessments);
              setLoading(false);
              console.log('[ProgressTracking] Real-time update: Found', formattedAssessments.length, 'assessments');
            },
            (error) => {
              console.error('[ProgressTracking] Error in real-time listener:', error);
              setAssessmentData([]);
              setLoading(false);
            }
          );

          // Return cleanup function
          return unsubscribe;
        } else {
          console.log('[ProgressTracking] Student data not found or incomplete');
          setAssessmentData([]);
          setLoading(false);
        }
      } catch (error) {
        console.error('[ProgressTracking] Error setting up real-time listener:', error);
        setAssessmentData([]);
        setLoading(false);
      }
    };

    const unsubscribePromise = setupRealtimeListener();

    // Cleanup function
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [user, isManagement]);

  const getProgressData = () => {
    if (!assessmentData.length) return [];

    // Filter data based on selected period
    const now = new Date();
    let filteredData = assessmentData;

    switch (selectedPeriod) {
      case "last30":
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredData = assessmentData.filter(assessment =>
          new Date(assessment.completed_at) >= thirtyDaysAgo
        );
        break;
      case "last90":
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        filteredData = assessmentData.filter(assessment =>
          new Date(assessment.completed_at) >= ninetyDaysAgo
        );
        break;
      case "lastyear":
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        filteredData = assessmentData.filter(assessment =>
          new Date(assessment.completed_at) >= oneYearAgo
        );
        break;
      case "all":
      default:
        filteredData = assessmentData;
        break;
    }

    filteredData = [...filteredData].sort(
      (a, b) =>
        new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
    );

    return filteredData.map((assessment) => ({
      date: new Date(assessment.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      overall: assessment.results?.overall ?? 0
    }));
  };


  const getStudentList = () => {
    if (!isManagement) return [];
    // Aggregate unique students from assessmentData
    const studentsMap: Record<string, any> = {};
    assessmentData.forEach(assessment => {
      if (!studentsMap[assessment.user_id]) {
        studentsMap[assessment.user_id] = {
          id: assessment.user_id,
          name: assessment.user_id,
          class: '',
          riskLevel: 'Unknown',
          lastAssessment: assessment.completed_at,
        };
      } else {
        // Update lastAssessment if newer
        if (new Date(assessment.completed_at) > new Date(studentsMap[assessment.user_id].lastAssessment)) {
          studentsMap[assessment.user_id].lastAssessment = assessment.completed_at;
        }
      }
    });
    return Object.values(studentsMap).filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };


  const getAggregateData = () => {
    const categories = ['depression', 'stress', 'anxiety', 'adhd', 'wellbeing'];
    if (!assessmentData.length) return categories.map(category => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      percentage: 0,
      trend: 'up' as 'up',
      change: 0,
      studentCount: 0,
    }));
    return categories.map(category => {
      const scores = assessmentData
        .map(a => a.results?.[category])
        .filter(score => typeof score === 'number');
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      return {
        category: category.charAt(0).toUpperCase() + category.slice(1),
        percentage: avg,
        trend: 'up' as 'up', // TODO: implement real trend logic if needed
        change: 0,   // TODO: implement real change logic if needed
        studentCount: scores.length,
      };
    });
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
    link.setAttribute("download", `progress_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading progress data...</p>
        </div>
      </div>
    );
  }

  const progressData = getProgressData();
  const aggregateData = getAggregateData();
  const studentList = getStudentList();

  // Show empty state if no assessment data for student view
  if (!isManagement && assessmentData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Assessments Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't completed any assessments yet. Your progress tracking will appear here after you complete your first assessment.
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate('/assessment')}
            >
              Take Your First Assessment
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50/30">
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ⭐ Improved Header with Student-Friendly Language */}
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <BarChart className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl font-extrabold text-blue-700">
                {isManagement ? "School Progress Tracking" : "Your Progress"}
              </h1>
            </div>
            <p className="text-lg text-gray-700 font-medium">
              {isManagement
                ? "Monitor student mental health trends and intervention effectiveness"
                : "See how you're growing and track your journey! "
              }
            </p>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">


            {isManagement && (
              <div className="flex gap-2 items-center">
                <Search className="w-4 h-4 text-gray-500" />
                <ProfanityFilteredInput
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64"
                />
              </div>
            )}


          </div>

          {isManagement ? (
            // Management View
            <div className="space-y-8">
              <StudentOverviewTable
                studentList={studentList}
                onSelectStudent={setSelectedStudent}
                getRiskBadgeColor={getRiskBadgeColor}
              />

              {selectedStudent && (
                <IndividualStudentProgress
                  selectedStudent={selectedStudent}
                  progressData={[]} // Use component's built-in mock data for now
                />
              )}

              <AggregateTrends
                aggregateData={aggregateData}
                getRiskColor={getRiskColor}
              />

              <InterventionTracking />
            </div>
          ) : (
            // Student View - 65% main content, 35% sidebar for better desktop balance
            <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-10">
              <div className="space-y-8">
                <PersonalProgressChart
                  progressData={progressData}
                  period={selectedPeriod}
                  onPeriodChange={setSelectedPeriod}
                />
                <AssessmentHistory
                  assessmentData={assessmentData}
                  getRiskLevel={getRiskLevel}
                  getRiskBadgeColor={getRiskBadgeColor}
                />
              </div>

              <ProgressSidebar
                assessmentData={assessmentData}
                getRiskColor={getRiskColor}
                onExportData={exportData}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div >
  );
};

export default ProgressTracking;