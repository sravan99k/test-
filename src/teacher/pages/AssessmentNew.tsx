import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, AlertCircle, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import AuthForm from "@/components/shared/AuthForm";
import AssessmentForm from "@/components/AssessmentForm";
import AssessmentResults from "@/components/student-dashboard/assessment-components/AssessmentResults";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getIncompleteAssessmentForUser, saveIncompleteAssessmentForUser, clearIncompleteAssessmentForUser } from "@/services/incompleteAssessmentService";

// Define types for assessment results
interface AssessmentResult {
  [key: string]: number;
}

interface AssessmentResponse {
  [key: string]: any;
}

const Assessment = () => {
  const [currentStep, setCurrentStep] = useState<"auth" | "instructions" | "assessment" | "results">("auth");
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult | null>(null);
  const [assessmentResponses, setAssessmentResponses] = useState<AssessmentResponse>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [initialStep, setInitialStep] = useState(0);


  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();



  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === 'management') {
          navigate('/school-dashboard');
          toast({
            title: 'Access Restricted',
            description: 'School management users cannot take assessments.',
            variant: 'destructive',
          });
        } else {
          // Check if user wants to resume assessment
          const shouldResume = sessionStorage.getItem('resume_assessment');

          if (shouldResume) {
            (async () => {
              try {
                const assessment = await getIncompleteAssessmentForUser(user.uid);
                if (assessment && assessment.responses) {
                  setAssessmentResponses(assessment.responses);

                  let nextQuestionIndex = 0;
                  if (assessment.currentQuestionIndex !== undefined) {
                    nextQuestionIndex = assessment.currentQuestionIndex;
                  } else {
                    const answeredQuestions = Object.keys(assessment.responses).map(Number);
                    const totalQuestions = assessment.totalQuestions || 67;

                    for (let i = 0; i < totalQuestions; i++) {
                      if (!answeredQuestions.includes(i)) {
                        nextQuestionIndex = i;
                        break;
                      }
                    }
                  }

                  setInitialStep(nextQuestionIndex);
                  setCurrentStep("assessment");
                  sessionStorage.removeItem('resume_assessment');
                  toast({
                    title: "Assessment Resumed",
                    description: `Continuing from question ${nextQuestionIndex + 1}.`,
                  });
                } else {
                  setCurrentStep("instructions");
                }
              } catch (error) {
                console.error('Error resuming assessment from Firestore:', error);
                setCurrentStep("instructions");
              }
            })();
          } else {
            setCurrentStep("instructions");
          }
        }
      } else {
        setCurrentStep("auth");
      }
    }
  }, [user, loading, navigate, toast]);

  const handleAuthComplete = () => {
    setCurrentStep("instructions");
  };

  const startAssessment = () => {
    // Initialize incomplete assessment tracking when starting
    if (user) {
      saveIncompleteAssessmentForUser(user.uid, {
        startedAt: Date.now(),
        responses: {},
        totalQuestions: 67, // Known total for overall assessment
        categories: ['overall']
      });
    }

    setCurrentStep("assessment");
    toast({
      title: "Assessment Started!",
      description: "Please answer each question honestly.",
    });
  };

  const handleAssessmentComplete = (results: AssessmentResult) => {
    setIsProcessing(true);

    // Clear incomplete assessment since it's now complete
    if (user) {
      clearIncompleteAssessmentForUser(user.uid);
    }

    setTimeout(() => {
      setAssessmentResults(results);
      // Store the responses in the format expected by AssessmentResults
      const formattedResponses = Object.entries(results).reduce((acc, [key, value]) => {
        acc[`${key}_score`] = value;
        return acc;
      }, {} as AssessmentResponse);

      setAssessmentResponses(formattedResponses);
      setCurrentStep("results");
      setIsProcessing(false);
      toast({
        title: "Assessment Complete!",
        description: "Your results are ready. Review them below.",
      });
    }, 1500);
  };

  const handleTakeAnotherAssessment = () => {
    // Clear any incomplete assessment when starting fresh
    if (user) {
      clearIncompleteAssessmentForUser(user.uid);
    }
    setAssessmentResults(null);
    setCurrentStep("instructions");
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <main className="flex-1 container mx-auto px-4 py-8">
        {currentStep === "auth" && (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Mental Health Assessment</h1>
              <p className="text-gray-600">Sign in to begin your personalized assessment</p>
            </div>
            <AuthForm onAuthComplete={handleAuthComplete} />
          </div>
        )}

        {currentStep === "instructions" && (
          <div className="max-w-3xl mx-auto h-[calc(100vh-200px)] flex flex-col">
            <Card className="flex-1 flex flex-col border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-center">Assessment Instructions</CardTitle>
                <CardDescription className="text-center text-gray-600">Please read the following instructions carefully before starting</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-6 px-8">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Before You Begin:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Find a quiet, comfortable place where you won't be disturbed.</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Set aside enough time to complete the assessment in one sitting.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">About the Assessment:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-2 mt-0.5 flex-shrink-0">1</span>
                      <span>This is a comprehensive mental health assessment covering various aspects of well-being.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-2 mt-0.5 flex-shrink-0">2</span>
                      <span>Answer all questions honestly based on your experiences.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-2 mt-0.5 flex-shrink-0">3</span>
                      <span>There are no right or wrong answers - your honest responses will provide the most accurate results.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mt-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Important Note</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        This assessment is not a substitute for professional medical advice. If you're in crisis, please contact emergency services immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg"
                  onClick={startAssessment}
                >
                  Start Assessment
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {currentStep === "assessment" && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-center">Mental Health Assessment</h2>
            </div>
            <Card className="overflow-hidden">
              <AssessmentForm
                selectedCategories={['overall']} // Always use overall test
                onComplete={handleAssessmentComplete}
                initialResponses={assessmentResponses}
                initialStep={initialStep}
                onResponseChange={(newResponses) => {
                  setAssessmentResponses(newResponses);
                  // Note: Individual question progress is now saved in AssessmentForm component
                }}
              />
            </Card>
          </div>
        )}

        {currentStep === "results" && assessmentResults && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Assessment Results</h1>
                <p className="text-gray-600">Review your assessment outcomes and recommendations</p>
              </div>
              <Button
                variant="outline"
                onClick={handleTakeAnotherAssessment}
                className="hidden md:inline-flex"
              >
                Retake Assessment
              </Button>
            </div>

            <Card className="mb-6">
              <AssessmentResults
                userResponses={assessmentResponses}
                categories={['overall']}
                results={assessmentResults}
                onTakeAnother={handleTakeAnotherAssessment}
                userRole={user?.role}
              />
            </Card>

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('instructions')}
                className="w-full sm:w-auto"
              >
                Back to Instructions
              </Button>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={handleTakeAnotherAssessment}
                  className="w-full sm:w-auto"
                >
                  Retake Assessment
                </Button>
                <Button
                  onClick={() => navigate('/wellness-dashboard')}
                  className="w-full sm:w-auto"
                >
                  View Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Assessment;
