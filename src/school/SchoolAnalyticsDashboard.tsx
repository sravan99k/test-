import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, Users, TrendingUp, AlertCircle } from "lucide-react";
import { StudentData, exportToCSV } from "@/services/studentDataService";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SchoolAnalyticsDashboardProps {
  students: StudentData[];
}

const SchoolAnalyticsDashboard = ({ students }: SchoolAnalyticsDashboardProps) => {
  const [filterType, setFilterType] = useState<'all' | 'gender' | 'class'>('all');
  const [filterValue, setFilterValue] = useState<string>('all');

  const filteredStudents = useMemo(() => {
    if (filterType === 'all' || filterValue === 'all') return students;
    
    return students.filter(student => {
      if (filterType === 'gender') return student.gender === filterValue;
      if (filterType === 'class') return student.class === filterValue;
      return true;
    });
  }, [students, filterType, filterValue]);

  const analytics = useMemo(() => {
    const total = filteredStudents.length;
    const highRisk = filteredStudents.filter(s => s.riskLevel === 'High').length;
    const moderateRisk = filteredStudents.filter(s => s.riskLevel === 'Moderate').length;
    const lowRisk = filteredStudents.filter(s => s.riskLevel === 'Low').length;
    
    const avgEmotionalOverwhelm = Math.round(
      filteredStudents.reduce((sum, s) => sum + s.emotionalOverwhelm, 0) / total
    );
    const avgLonelinessStress = Math.round(
      filteredStudents.reduce((sum, s) => sum + s.lonelinessStress, 0) / total
    );
    const avgDepression = Math.round(
      filteredStudents.reduce((sum, s) => sum + s.depression, 0) / total
    );
    const avgEatingHabits = Math.round(
      filteredStudents.reduce((sum, s) => sum + s.eatingHabits, 0) / total
    );

    return {
      total,
      highRisk,
      moderateRisk,
      lowRisk,
      avgEmotionalOverwhelm,
      avgLonelinessStress,
      avgDepression,
      avgEatingHabits,
    };
  }, [filteredStudents]);

  const chartConfig = {
    high: { label: "High Risk", color: "#ef4444" },
    moderate: { label: "Moderate Risk", color: "#f97316" },
    low: { label: "Low Risk", color: "#22c55e" },
  };

  const riskDistributionData = [
    { name: 'High Risk', value: analytics.highRisk, color: '#ef4444' },
    { name: 'Moderate Risk', value: analytics.moderateRisk, color: '#f97316' },
    { name: 'Low Risk', value: analytics.lowRisk, color: '#22c55e' },
  ];

  const categoryData = [
    { category: 'Emotional Overwhelm', percentage: analytics.avgEmotionalOverwhelm },
    { category: 'Loneliness Stress', percentage: analytics.avgLonelinessStress },
    { category: 'Depression', percentage: analytics.avgDepression },
    { category: 'Eating Habits', percentage: analytics.avgEatingHabits },
  ];

  const uniqueGenders = Array.from(new Set(students.map(s => s.gender)));
  const uniqueClasses = Array.from(new Set(students.map(s => s.class)));

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Analytics Filters
          </CardTitle>
          <CardDescription>Filter data by school, gender, or class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter By</label>
              <Select value={filterType} onValueChange={(value: 'all' | 'gender' | 'class') => {
                setFilterType(value);
                setFilterValue('all');
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Entire School</SelectItem>
                  <SelectItem value="gender">Gender</SelectItem>
                  <SelectItem value="class">Class</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filterType !== 'all' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {filterType === 'gender' ? 'Select Gender' : 'Select Class'}
                </label>
                <Select value={filterValue} onValueChange={setFilterValue}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filterType === 'gender' 
                      ? uniqueGenders.map(gender => (
                          <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                        ))
                      : uniqueClasses.map(className => (
                          <SelectItem key={className} value={className}>{className}</SelectItem>
                        ))
                    }
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button onClick={() => exportToCSV(filteredStudents)} className="bg-blue-500 hover:bg-blue-600">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{analytics.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{analytics.highRisk}</p>
                <p className="text-xs text-gray-500">{Math.round((analytics.highRisk / analytics.total) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Moderate Risk</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.moderateRisk}</p>
                <p className="text-xs text-gray-500">{Math.round((analytics.moderateRisk / analytics.total) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Risk</p>
                <p className="text-2xl font-bold text-green-600">{analytics.lowRisk}</p>
                <p className="text-xs text-gray-500">{Math.round((analytics.lowRisk / analytics.total) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Risk Distribution
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-1 cursor-pointer text-gray-400">ⓘ</span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  AI-generated risk and sentiment analytics are visible only to authorized staff. No sensitive student data is exposed.
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>
              {filterType === 'all' ? 'Entire School' : 
               filterType === 'gender' && filterValue !== 'all' ? `${filterValue} Students` :
               filterType === 'class' && filterValue !== 'all' ? `${filterValue} Students` :
               'Filtered Results'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Mental Health Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Average Risk Percentages by Category</CardTitle>
            <CardDescription>Mental health risk categories analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="percentage" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Current Filter Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-800">
                Current View: {filterType === 'all' ? 'Entire School' : 
                              filterType === 'gender' && filterValue !== 'all' ? `${filterValue} Students` :
                              filterType === 'class' && filterValue !== 'all' ? `${filterValue}` :
                              'All Students'}
              </p>
              <p className="text-sm text-blue-600">
                Showing data for {analytics.total} students with {analytics.highRisk} high-risk cases
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setFilterType('all');
                setFilterValue('all');
              }}
              className="text-blue-700 border-blue-300"
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolAnalyticsDashboard;
