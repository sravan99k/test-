import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getStudentAssessments } from '@/services/assessmentService';
import { format } from 'date-fns';

interface AssessmentHistoryProps {
  studentId: string;
  adminId: string;
  schoolId: string;
  organizationId?: string | null;
}

interface Assessment {
  id: string;
  riskPercentage: number;
  riskCategory: string;
  riskDistribution: {
    highRisk: number;
    moderateRisk: number;
    lowRisk: number;
  };
  assessmentDate: Date;
  totalQuestions?: number;
}

export const AssessmentHistory = ({
  studentId,
  adminId,
  schoolId,
  organizationId
}: AssessmentHistoryProps) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssessments();
  }, [studentId, adminId, schoolId, organizationId]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const data = await getStudentAssessments({
        studentId,
        adminId,
        schoolId,
        organizationId: organizationId || undefined
      });
      setAssessments(data.map((a: any) => ({
        ...a,
        riskCategory: typeof a.riskCategory === 'object' ? (a.riskCategory.label || 'Low Risk') : (a.riskCategory || 'Low Risk')
      })));
      setError(null);
    } catch (err) {
      console.error('Error loading assessments:', err);
      setError('Failed to load assessment history');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (category: string) => {
    switch (category) {
      case 'High Risk':
        return 'bg-red-500 hover:bg-red-600';
      case 'Moderate Risk':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Low Risk':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getTrendIcon = (currentIndex: number) => {
    if (currentIndex === assessments.length - 1) return null; // No trend for oldest

    const current = assessments[currentIndex].riskPercentage;
    const previous = assessments[currentIndex + 1].riskPercentage;

    if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    } else if (current < previous) {
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Loading assessment history...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (assessments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assessment History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No assessments taken yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment History ({assessments.length} total)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assessments.map((assessment, index) => (
            <div
              key={assessment.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getRiskBadgeColor(assessment.riskCategory)}>
                      {assessment.riskCategory}
                    </Badge>
                    {getTrendIcon(index)}
                    {index === 0 && (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        Latest
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Risk Percentage</p>
                      <p className="font-semibold text-lg">{assessment.riskPercentage.toFixed(1)}%</p>
                    </div>

                    <div>
                      <p className="text-gray-600">Date Taken</p>
                      <p className="font-medium">
                        {format(assessment.assessmentDate, 'MMM dd, yyyy')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(assessment.assessmentDate, 'hh:mm a')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-600 mb-1">Risk Distribution:</p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-red-600">
                        High: {assessment.riskDistribution.highRisk}
                      </span>
                      <span className="text-yellow-600">
                        Moderate: {assessment.riskDistribution.moderateRisk}
                      </span>
                      <span className="text-green-600">
                        Low: {assessment.riskDistribution.lowRisk}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentHistory;
