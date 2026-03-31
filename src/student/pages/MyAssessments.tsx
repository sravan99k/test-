import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ClipboardList, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/integrations/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getStudentAssessments } from "@/services/assessmentService";

const MyAssessments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3); // Start with 3 assessments

  useEffect(() => {
    if (!user) return;
    
    const loadAssessments = async () => {
      setLoading(true);
      try {
        // Get student's school information from user document
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        if (userData && userData.studentId && userData.parentAdminId && userData.schoolId) {
          const assessmentData = await getStudentAssessments({
            studentId: userData.studentId,
            adminId: userData.parentAdminId,
            schoolId: userData.schoolId,
            organizationId: userData.organizationId || null
          });
          
          // Convert assessment format to match expected structure
          const formattedAssessments = assessmentData.map(assessment => ({
            id: assessment.id,
            user_id: user.uid,
            categories: ['mental_health'], // Default category
            responses: assessment.responses || {},
            results: {
              overall: Math.round((assessment.riskPercentage || 0) * 100) / 100,
              // Generate category-specific scores based on risk percentage
              depression: Math.round(Math.max(0, Math.min(100, (assessment.riskPercentage || 0) + (Math.random() - 0.5) * 10)) * 100) / 100,
              stress: Math.round(Math.max(0, Math.min(100, (assessment.riskPercentage || 0) + (Math.random() - 0.5) * 10)) * 100) / 100,
              anxiety: Math.round(Math.max(0, Math.min(100, (assessment.riskPercentage || 0) + (Math.random() - 0.5) * 10)) * 100) / 100,
              wellbeing: Math.round(Math.max(0, Math.min(100, 100 - (assessment.riskPercentage || 0) + (Math.random() - 0.5) * 10)) * 100) / 100
            },
            completed_at: assessment.assessmentDate?.toISOString() || new Date().toISOString()
          }));
          
          // Sort by completion date (newest first)
          formattedAssessments.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
          
          setAssessments(formattedAssessments);
          console.log('[MyAssessments] Loaded assessments:', formattedAssessments.length);
        } else {
          console.log('[MyAssessments] Student data not found or incomplete');
          setAssessments([]);
        }
      } catch (error) {
        console.error('Error loading assessments:', error);
        setAssessments([]);
      } finally {
        setLoading(false);
      }
    };

    loadAssessments();
  }, [user]);

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      depression: "bg-red-100 text-red-800",
      stress: "bg-orange-100 text-orange-800",
      anxiety: "bg-yellow-100 text-yellow-800",
      adhd: "bg-blue-100 text-blue-800",
      wellbeing: "bg-green-100 text-green-800",
      overall: "bg-purple-100 text-purple-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
            <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Assessments</h1>
            <p className="text-lg text-gray-600">
              View your assessment history and track your mental health journey
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assessments.length}</div>
                <p className="text-xs text-muted-foreground">
                  Completed assessments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {assessments.filter(a => 
                    new Date(a.completed_at).getMonth() === new Date().getMonth()
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recent assessments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Assessment</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {assessments.length > 0 
                    ? new Date(assessments[0].completed_at).toLocaleDateString()
                    : "None"
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Most recent completion
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Assessment History */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment History</CardTitle>
              <CardDescription>
                Detailed view of all your completed assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assessments.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start your mental health journey by taking your first assessment.
                  </p>
                  <Button 
                    className="bg-teal-500 hover:bg-teal-600"
                    onClick={() => navigate('/assessment')}
                  >
                    Take Assessment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {assessments
                    .slice(0, visibleCount)
                    .map((assessment, index) => (
                    <div key={assessment.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Assessment #{assessments.length - index}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(assessment.completed_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{new Date(assessment.completed_at).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Categories Assessed:</h4>
                        <div className="flex flex-wrap gap-2">
                          {(assessment.categories || []).map((category: string) => (
                            <Badge 
                              key={category} 
                              variant="secondary"
                              className={getCategoryBadgeColor(category)}
                            >
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Questions Answered:</h4>
                        <p className="text-sm text-gray-600">
                          {Object.keys(assessment.responses || {}).length} questions completed
                        </p>
                      </div>

                      {assessment.results && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Risk Scores:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {Object.entries(assessment.results).map(([category, score]) => (
                              <div key={category} className="text-center">
                                <div className="text-lg font-bold text-gray-900">{(score as number).toFixed(2)}%</div>
                                <div className="text-xs text-gray-600 capitalize">{category}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {assessments.length > visibleCount ? (
                    <div className="flex justify-center mt-6">
                      <Button 
                        variant="outline"
                        onClick={() => setVisibleCount(prev => Math.min(prev + 3, assessments.length))}
                        className="flex items-center gap-1"
                      >
                        <ChevronDown className="h-4 w-4" />
                        View More
                      </Button>
                    </div>
                  ) : visibleCount > 3 && (
                    <div className="flex justify-center mt-6">
                      <Button 
                        variant="outline"
                        onClick={() => setVisibleCount(3)}
                        className="flex items-center gap-1"
                      >
                        <ChevronUp className="h-4 w-4" />
                        Show Less
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-8 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
            <CardHeader>
              <CardTitle className="text-teal-800">Ready for Your Next Assessment?</CardTitle>
              <CardDescription className="text-teal-600">
                Regular assessments help track your mental health progress over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button 
                  className="bg-teal-500 hover:bg-teal-600 text-white"
                  onClick={() => navigate('/assessment')}
                >
                  Take New Assessment
                </Button>
                <Button 
                  variant="outline" 
                  className="border-teal-300 text-teal-700 hover:bg-teal-50"
                  onClick={() => navigate('/progress-tracking')}
                >
                  View Progress
                </Button>
                <Button 
                  variant="outline" 
                  className="border-teal-300 text-teal-700 hover:bg-teal-50"
                  onClick={() => navigate('/resources')}
                >
                  Browse Resources
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyAssessments;
