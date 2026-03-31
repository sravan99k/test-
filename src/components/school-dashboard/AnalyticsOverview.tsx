import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, AlertTriangle, Activity, ArrowUp, ArrowDown } from "lucide-react";

type AnalyticsData = {
  totalStudents: number;
  highRiskStudents: number;
  interventionsThisMonth: number;
  averageWellbeingScore: number;
  wellbeingTrend: 'improving' | 'declining' | 'stable';
};

export const AnalyticsOverview = ({ data }: { data: AnalyticsData }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalStudents}</div>
          <p className="text-xs text-muted-foreground">
            Enrolled students
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High Risk Students</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.highRiskStudents}</div>
          <p className="text-xs text-muted-foreground">
            {((data.highRiskStudents / data.totalStudents) * 100).toFixed(1)}% of total
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Interventions</CardTitle>
          <Activity className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.interventionsThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            This month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Wellbeing</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.averageWellbeingScore.toFixed(1)}/10</div>
          <p className="text-xs text-muted-foreground flex items-center">
            {data.wellbeingTrend === 'improving' ? (
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
            ) : data.wellbeingTrend === 'declining' ? (
              <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
            ) : null}
            {data.wellbeingTrend === 'improving' ? 'Improving' : data.wellbeingTrend === 'declining' ? 'Declining' : 'Stable'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
