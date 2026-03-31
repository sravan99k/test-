import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Download, BarChart, Clock, CheckCircle } from "lucide-react";

// Helper function to calculate days ago from a date string
const getDaysAgo = (dateString: string): number => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

interface AssessmentResult {
  overall?: number;
}

interface AssessmentData {
  id: string;
  user_id: string;
  categories: string[];
  responses: any;
  results?: AssessmentResult;
  completed_at: string;
  risk_score: number;
  notes?: string;
  risk_level?: 'low' | 'medium' | 'high';
}

// Helper function to determine risk level based on score
const getRiskLevel = (score: number): 'low' | 'medium' | 'high' => {
  if (score < 40) return 'low';
  if (score < 70) return 'medium';
  return 'high';
};

interface ProgressSidebarProps {
  assessmentData: AssessmentData[];
  getRiskColor: (percentage: number) => string;
  onExportData: () => void;
}



// Simplified encouragement messages
const getEncouragementMessage = (score: number): string => {
  if (score < 40) return "Great work!";
  if (score < 70) return "Good progress!";
  return "Keep going!";
};

export const ProgressSidebar = ({
  assessmentData,
  getRiskColor,
  onExportData,
}: ProgressSidebarProps) => {

  return (
    <div className="space-y-6 md:space-y-8 px-2 sm:px-0">
      {/* Time Filter */}


      {/* My Progress Card */}
      <Card
        className="border border-slate-200 bg-white"
        aria-labelledby="progress-heading"
      >
        <CardHeader className="pb-2 px-4 sm:px-6 pt-4">
          <CardTitle
            id="progress-heading"
            className="text-lg sm:text-xl font-semibold text-slate-800"
          >
            My Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 p-3 sm:p-4">
          {/* Total Check-Ins */}
          <div
            className="flex flex-col p-4 bg-blue-50 rounded-xl border border-blue-100"
            role="status"
            aria-label={`You have completed ${assessmentData.length} check-ins in total`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-slate-600">Total Check-Ins</span>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">{assessmentData.length}</span>
              </div>
            </div>
            <div className="h-3 w-full bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(assessmentData.length * 10, 100)}%` }}
              />
            </div>
          </div>

          {/* This Month */}
          <div
            className="flex flex-col p-4 bg-emerald-50 rounded-xl border border-emerald-100"
            role="status"
            aria-label={`${assessmentData.filter(
              (a) => new Date(a.completed_at).getMonth() === new Date().getMonth()
            ).length} check-ins this month`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-slate-600">This Month</span>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-600 font-bold">
                  {assessmentData.filter(
                    (a) => new Date(a.completed_at).getMonth() === new Date().getMonth()
                  ).length}
                </span>
              </div>
            </div>
            <div className="h-3 w-full bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(assessmentData.filter(a =>
                    new Date(a.completed_at).getMonth() === new Date().getMonth()
                  ).length * 30, 100)}%`
                }}
              />
            </div>
          </div>

          {/* Last Check-In */}
          <div
            className="flex flex-col p-4 bg-purple-50 rounded-xl border border-purple-100"
            role="status"
            aria-label={`Last check-in was on ${assessmentData.length > 0 ?
              new Date(assessmentData[0].completed_at).toLocaleDateString("en-US", {
                month: "long",

                day: "numeric",
                year: "numeric"
              }) : 'No check-ins yet'}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <span className="text-sm font-medium text-slate-600">Last Check-In</span>
              </div>
              <div className="text-right">
                {assessmentData.length > 0 ? (
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-lg font-semibold text-purple-800">
                      {new Date(assessmentData[0].completed_at).getDate()}
                    </span>
                    <span className="text-sm text-purple-700">
                      {new Date(assessmentData[0].completed_at).toLocaleDateString("en-US", {
                        month: "short"
                      })}
                    </span>
                    <span className="text-xs text-purple-500">
                      {new Date(assessmentData[0].completed_at).getFullYear()}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">No check-ins</span>
                )}
              </div>
            </div>
            {assessmentData.length > 0 && (
              <div className="mt-3 text-xs text-purple-500 flex items-center">
                <Clock className="w-3 h-3 text-purple-500 mr-1.5" />
                {getDaysAgo(assessmentData[0].completed_at) === 0
                  ? "Today"
                  : getDaysAgo(assessmentData[0].completed_at) === 1
                    ? "Yesterday"
                    : `${getDaysAgo(assessmentData[0].completed_at)} days ago`}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {assessmentData.length > 0 && assessmentData[0].results && (
        <Card className="border border-slate-200 bg-white shadow-none">
          <CardHeader className="pb-3 px-4 sm:px-6 pt-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-slate-800">
              <BarChart className="w-5 h-5 text-blue-600" aria-hidden="true" />
              Latest Check-In
            </CardTitle>
            <p className="text-xs text-slate-500 -mt-1">
              {new Date(assessmentData[0].completed_at).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </CardHeader>
          <CardContent className="space-y-5 p-3 sm:p-4">
            {Object.entries(assessmentData[0].results).map(([category, percentage]) => {
              const score = percentage as number;
              const message = getEncouragementMessage(score);
              const scoreId = `${category.toLowerCase().replace(/\s+/g, '-')}-score`;

              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span
                      className="text-sm font-medium capitalize text-slate-700"
                      id={scoreId}
                    >
                      {category.split(/(?=[A-Z])/).join(' ')}
                    </span>
                    <span className="text-sm font-medium text-slate-700">
                      {score}%
                    </span>
                  </div>
                  <div
                    className="relative h-3 bg-slate-100 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-labelledby={scoreId}
                  >
                    <div
                      className={`h-full rounded-full ${score < 25 ? 'bg-emerald-400' :
                        score < 50 ? 'bg-blue-400' :
                          score < 75 ? 'bg-amber-400' : 'bg-rose-400'
                        }`}
                      style={{ width: `${Math.min(score, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
      {/* Quick Actions */}
      <Card className="border border-slate-200 bg-white shadow-none">
        <CardHeader className="pb-3 px-4 sm:px-6 pt-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-slate-800">
            <CheckCircle className="w-5 h-5 text-blue-600" aria-hidden="true" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-3 sm:p-4">
          <Button
            variant="outline"
            className="w-full h-12 border-2 border-blue-100 bg-blue-50 text-blue-700 font-medium shadow-none hover:bg-blue-100 hover:border-blue-200 hover:text-blue-800"
            onClick={() => (window.location.href = "/assessment")}
          >
            <div className="p-1.5 mr-2 bg-blue-100 rounded-md">
              <Plus className="h-4 w-4 text-blue-600" />
            </div>
            New Check-In
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 border-2 border-emerald-100 bg-emerald-50 text-emerald-700 font-medium shadow-none hover:bg-emerald-100 hover:border-emerald-200 hover:text-emerald-800"
            onClick={() => (window.location.href = "/resources")}
          >
            <div className="p-1.5 mr-2 bg-emerald-100 rounded-md">
              <BookOpen className="h-4 w-4 text-emerald-600" />
            </div>
            View Resources
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 border-2 border-purple-100 bg-purple-50 text-purple-700 font-medium shadow-none hover:bg-purple-100 hover:border-purple-200 hover:text-purple-800"
            onClick={onExportData}
          >
            <div className="p-1.5 mr-2 bg-purple-100 rounded-md">
              <Download className="h-4 w-4 text-purple-600" />
            </div>
            Download Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
