import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, BookOpen, CheckCircle } from "lucide-react";
import { useState } from "react";

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

interface AssessmentHistoryProps {
  assessmentData: AssessmentData[];
  getRiskLevel: (percentage: number) => string;
  getRiskBadgeColor: (level: string) => string;
}

// Get encouraging messages based on score
const getEncouragementMessage = (score: number): string => {
  if (score < 25) return "Amazing progress!";
  if (score < 40) return "Good start!";
  if (score < 60) return "Improving!";
  if (score < 75) return "Keep going!";
  return "We're here for you!";
};

export const AssessmentHistory = ({
  assessmentData,
  getRiskLevel,
  getRiskBadgeColor,
}: AssessmentHistoryProps) => {
  const [visibleCount, setVisibleCount] = useState(3);

  const sortedAssessments = [...assessmentData].sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );

  const visibleAssessments = sortedAssessments.slice(0, visibleCount);
  const hasMore = visibleCount < sortedAssessments.length;

  const handleViewMore = () => {
    setVisibleCount((prevCount) => Math.min(prevCount + 3, sortedAssessments.length));
  };

  const handleShowLess = () => {
    setVisibleCount(3);
  };

  return (
    <Card className="border border-slate-200 bg-white shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
          <BookOpen className="w-6 h-6 text-blue-600" />
          Your Past Check-Ins
        </CardTitle>
        <CardDescription className="text-base text-gray-600 mt-2">
          See all your completed well-being check-ins
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {assessmentData.length > 0 ? (
          <div className="space-y-4">
            {visibleAssessments.map((assessment, index) => {
              const overallScore = assessment.results?.overall || 0;
              const message = getEncouragementMessage(overallScore);

              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-white mb-3 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {assessment.categories
                          .map((cat: string) => 
                            cat.split('_')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ')
                          )
                          .join(", ")} Check-In
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Completed on {new Date(assessment.completed_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                      <div className="mt-2">
                        <p className="text-sm text-gray-700">
                          <span>Overall: </span>
                          <span className="font-medium">
                            {overallScore.toFixed(0)}%
                          </span>
                          <span className="mx-1.5 text-gray-400">•</span>
                          <span className="text-blue-600">{message}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {hasMore ? (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewMore}
                  className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-sm font-medium text-gray-700 px-4 py-1.5"
                >
                  View More Check-Ins
                  <ChevronDown className="h-4 w-4 ml-0.5" />
                </Button>
              </div>
            ) : (
              visibleCount > 3 && (
                <div className="flex justify-center mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowLess}
                    className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-sm font-medium text-gray-700 px-4 py-1.5"
                  >
                    Show Less
                    <ChevronUp className="h-4 w-4 ml-0.5" />
                  </Button>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
            <BookOpen className="w-10 h-10 text-gray-300 mb-3 mx-auto" />
            <p className="text-gray-500 text-sm font-medium">No check-ins completed yet</p>
            <p className="text-gray-400 text-xs mt-1">Take your first assessment to see it here!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
