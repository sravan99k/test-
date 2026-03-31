import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen, Play, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getIncompleteAssessmentForUser, clearIncompleteAssessmentForUser } from "@/services/incompleteAssessmentService";

interface IncompleteAssessment {
  userId: string;
  startedAt: number;
  responses: Record<number, any>;
  totalQuestions: number;
  categories: string[];
}

const IncompleteAssessmentAlert = () => {
  const [incompleteAssessment, setIncompleteAssessment] = useState<IncompleteAssessment | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkIncompleteAssessment = async () => {
      try {
        const assessment = await getIncompleteAssessmentForUser(user.uid);
        if (!assessment) {
          setIncompleteAssessment(null);
          setTimeRemaining("");
          return;
        }

        const deadline = assessment.startedAt + 24 * 60 * 60 * 1000; // 24 hours from start
        const now = Date.now();
        const remainingMs = deadline - now;

        if (remainingMs <= 0) {
          await clearIncompleteAssessmentForUser(user.uid);
          setIncompleteAssessment(null);
          setTimeRemaining("");
          return;
        }

        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s remaining`);
        setIncompleteAssessment(assessment);
      } catch (error) {
        console.error('Error loading incomplete assessment from Firestore:', error);
        setIncompleteAssessment(null);
      }
    };

    checkIncompleteAssessment();

    const interval = setInterval(() => {
      checkIncompleteAssessment();
    }, 1000);
    return () => clearInterval(interval);
  }, [user]);

  if (!incompleteAssessment || !user) return null;

  const completedQuestions = Object.keys(incompleteAssessment.responses).length;
  const progressPercentage = Math.round((completedQuestions / incompleteAssessment.totalQuestions) * 100);

  const handleResumeAssessment = () => {
    // Store resume flag and navigate
    sessionStorage.setItem('resume_assessment', 'true');
    navigate('/assessment');
  };

  const handleStartNew = () => {
    // Clear incomplete assessment and start fresh
    clearIncompleteAssessmentForUser(user.uid);
    setIncompleteAssessment(null);
    navigate('/assessment');
  };

  return (
    <Card className="w-full max-w-lg mx-auto mb-6 border-l-4 border-l-primary bg-white shadow-md">
      <CardHeader className="flex-row items-center justify-between p-4">
        <CardTitle className="flex items-center gap-2 text-md font-semibold text-primary">
          <BookOpen className="h-5 w-5" />
          Complete Your Assessment
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
          <Clock className="h-4 w-4" />
          <span>{timeRemaining}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-medium text-primary">
                {progressPercentage}% completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          You have an assessment in progress. Resume where you left off or start a new one.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleResumeAssessment}
            className="flex items-center gap-2, text-white"
          >
            <Play className="h-4 w-4" />
            Resume Assessment
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleStartNew}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Start New
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncompleteAssessmentAlert;