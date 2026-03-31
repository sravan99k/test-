import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, FileText, BarChart3, Users, TrendingUp, Calendar, Filter, Search, AlertCircle, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { SimpleTable } from "@/components/ui/simple-table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { X } from "lucide-react";
import { db, auth } from '@/integrations/firebase';
import { doc, getDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LabelList
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Footer from "@/components/Footer";
import { toast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';

// All data is now fetched from Firestore in real-time
interface SchoolData {
  name: string;
  stats: {
    totalStudents: number;
    assessmentsCompleted: number;
    highRiskStudents: number;
    interventionSuccessRate: number;
    trend: string;
    completionRate: string;
  };
  description: string;
  assessmentData: Array<{ name: string; completed: number; total: number }>;
  wellnessData: Array<{ name: string; value: number; color: string }>;
  monthlyTrendData: Array<{ month: string; assessments: number; wellnessScore: number; highRisk: number; interventions: number }>;
}

type ReportRow = {
  id: string;
  studentName: string;
  grade: string;
  lastAssessment: string;
  wellnessScore: number;
  riskLevel: string;
  interventions: number;
  lastUpdated: string;
  gender?: string;
};

export default function ReportsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentsRows, setStudentsRows] = useState<ReportRow[]>([]);
  const assessmentUnsubsRef = useRef<Record<string, () => void>>({});
  const assessmentsByStudentRef = useRef<Record<string, Array<{ date: Date | null; riskPercentage: number }>>>({});
  const studentsMetaRef = useRef<Array<{ id: string; name: string; grade: string; gender?: string; interventions?: any[] }>>([]);

  // Sorting and Pagination State
  const [sortConfig, setSortConfig] = useState<{ key: keyof ReportRow; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Real-time school data from Firestore
  const [schoolData, setSchoolData] = useState({
    name: 'School',
    stats: {
      totalStudents: 0,
      assessmentsCompleted: 0,
      highRiskStudents: 0,
      interventionSuccessRate: 0,
      trend: 'N/A',
      completionRate: '0% completion rate'
    },
    description: 'Loading school data...',
    assessmentData: [] as Array<{ name: string; completed: number; total: number }>,
    wellnessData: [
      { name: 'Excellent', value: 35, color: '#10b981' },
      { name: 'Good', value: 45, color: '#60a5fa' },
      { name: 'Average', value: 15, color: '#f59e0b' },
      { name: 'Needs Attention', value: 5, color: '#ef4444' },
    ],
    monthlyTrendData: [] as Array<{ month: string; assessments: number; wellnessScore: number; highRisk: number; interventions: number }>
  });

  const {
    name: schoolName,
    stats,
    description: schoolDescription,
    assessmentData,
    wellnessData,
    monthlyTrendData
  } = schoolData;

  // Fetch real-time school data with live listeners
  useEffect(() => {
    const setupRealtimeListeners = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Get school info from user document
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          setLoading(false);
          return;
        }

        const userData = userDocSnap.data();
        const schoolId = userData.schoolId;
        const adminId = userData.parentAdminId;
        const organizationId = userData.organizationId;
        const isIndependent = userData.isIndependent;

        if (!schoolId || !adminId) {
          setLoading(false);
          return;
        }

        // Determine school path
        let schoolPath = '';
        if (isIndependent) {
          schoolPath = `users/${adminId}/schools/${schoolId}`;
        } else {
          schoolPath = `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;
        }

        // Fetch school document
        const schoolDocRef = doc(db, schoolPath);
        const schoolDocSnap = await getDoc(schoolDocRef);

        let schoolName = 'School';
        if (schoolDocSnap.exists()) {
          schoolName = schoolDocSnap.data().name || 'School';
        }
        // Helpers
        const updateAggregates = () => {
          const students = studentsMetaRef.current;
          const totalStudents = students.length;

          // Grade distribution and completion
          const gradeMap: Record<string, { total: number; completed: number }> = {};
          students.forEach(s => {
            const grade = s.grade || 'Unknown';
            if (!gradeMap[grade]) gradeMap[grade] = { total: 0, completed: 0 };
            gradeMap[grade].total++;
            const count = assessmentsByStudentRef.current[s.id]?.length || 0;
            if (count > 0) gradeMap[grade].completed++;
          });

          // Assessment data by grade
          const assessmentData = Object.entries(gradeMap)
            .filter(([grade]) => grade !== 'Unknown')
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([grade, data]) => ({ name: `Grade ${grade}`, completed: data.completed, total: data.total }));

          // Wellness distribution (from latest assessment per student)
          const wellnessMap: Record<string, number> = { 'Excellent': 0, 'Good': 0, 'Average': 0, 'Needs Attention': 0 };
          students.forEach(s => {
            const arr = assessmentsByStudentRef.current[s.id] || [];
            if (arr.length === 0) return; // only count students with assessments
            const latest = arr.find(a => a.date) || arr[0];
            const risk = latest?.riskPercentage ?? 0;
            if (risk < 25) wellnessMap['Excellent']++;
            else if (risk < 50) wellnessMap['Good']++;
            else if (risk < 70) wellnessMap['Average']++;
            else wellnessMap['Needs Attention']++;
          });
          const wellnessData = [
            { name: 'Excellent', value: wellnessMap['Excellent'], color: '#10b981' },
            { name: 'Good', value: wellnessMap['Good'], color: '#60a5fa' },
            { name: 'Average', value: wellnessMap['Average'], color: '#f59e0b' },
            { name: 'Needs Attention', value: wellnessMap['Needs Attention'], color: '#ef4444' },
          ];

          // Stats
          const assessedStudentsCount = Object.values(gradeMap).reduce((sum, g) => sum + g.completed, 0);
          const assessmentsCompleted = Object.values(assessmentsByStudentRef.current).reduce((sum, arr) => sum + arr.length, 0);
          const highRiskStudents = wellnessMap['Needs Attention'];
          const completionRate = totalStudents > 0 ? `${Math.round((assessedStudentsCount / totalStudents) * 100)}% completion rate` : '0% completion rate';

          // Intervention success rate from student-level interventions
          let totalInterventions = 0;
          let successfulInterventions = 0;
          students.forEach((s: any) => {
            if (Array.isArray(s.interventions)) {
              s.interventions.forEach((i: any) => {
                totalInterventions++;
                if (i.status === 'completed' && i.outcome === 'successful') successfulInterventions++;
              });
            }
          });
          const interventionSuccessRate = totalInterventions > 0 ? Math.round((successfulInterventions / totalInterventions) * 100) : 0;

          // Monthly trends from all assessments
          const allAssessments: Array<{ date: Date; riskPercentage: number }> = [];
          Object.values(assessmentsByStudentRef.current).forEach(arr => {
            arr.forEach(a => { if (a.date) allAssessments.push({ date: a.date as Date, riskPercentage: a.riskPercentage }); });
          });
          const currentDate = new Date();
          const monthlyTrendData: Array<{ month: string; assessments: number; wellnessScore: number; highRisk: number; interventions: number }> = [];
          for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });
            const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
            const monthAssessments = allAssessments.filter(a => a.date >= date && a.date < nextMonth);
            const assessmentCount = monthAssessments.length;
            const avgWellness = assessmentCount > 0 ? Math.round(100 - (monthAssessments.reduce((sum, a) => sum + a.riskPercentage, 0) / assessmentCount)) : 0;
            const highRiskCount = monthAssessments.filter(a => a.riskPercentage >= 70).length;
            monthlyTrendData.push({ month: monthName, assessments: assessmentCount, wellnessScore: avgWellness, highRisk: highRiskCount, interventions: Math.floor(highRiskCount * 0.7) });
          }
          const previousMonthAssessments = monthlyTrendData[monthlyTrendData.length - 2]?.assessments || 0;
          const currentMonthAssessments = monthlyTrendData[monthlyTrendData.length - 1]?.assessments || 0;
          const trendPercentage = previousMonthAssessments > 0 ? Math.round(((currentMonthAssessments - previousMonthAssessments) / previousMonthAssessments) * 100) : 0;
          const trend = trendPercentage >= 0 ? `+${trendPercentage}% from last month` : `${trendPercentage}% from last month`;

          // Build student rows for table
          const rows = students.map(s => {
            const arr = assessmentsByStudentRef.current[s.id] || [];
            const latest = arr.find(a => a.date) || arr[0];
            const risk = latest?.riskPercentage ?? 0;
            const wellnessScore = Math.max(0, Math.min(100, Math.round(100 - risk)));
            const riskLevel = risk >= 70 ? 'high' : risk >= 40 ? 'medium' : 'low';
            const lastAssessment = latest?.date ? (latest.date as Date).toLocaleDateString() : '—';
            const activeInterventions = Array.isArray(s.interventions) ? s.interventions.filter((i: any) => i.status !== 'completed' && i.status !== 'cancelled').length : 0;
            return {
              id: s.id,
              studentName: s.name,
              grade: s.grade,
              lastAssessment,
              wellnessScore,
              riskLevel,
              interventions: activeInterventions,
              lastUpdated: lastAssessment,
              gender: s.gender || ''
            };
          });

          setStudentsRows(rows);
          setSchoolData({
            name: schoolName,
            stats: { totalStudents, assessmentsCompleted, highRiskStudents, interventionSuccessRate, trend, completionRate },
            description: `Comprehensive analytics and insights for ${schoolName}`,
            assessmentData,
            wellnessData,
            monthlyTrendData
          });
          setLoading(false);
        };

        // Set up real-time listener for students and per-student assessments
        const studentsPath = `${schoolPath}/students`;
        const unsubStudents = onSnapshot(collection(db, studentsPath), (snapshot) => {
          const students = snapshot.docs.map(studentDoc => {
            const data = studentDoc.data() as any;
            const name = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Student';
            return {
              id: studentDoc.id,
              name,
              grade: String(data.grade || 'Unknown'),
              gender: data.gender || '',
              interventions: Array.isArray(data.interventions) ? data.interventions : []
            };
          });
          studentsMetaRef.current = students;

          const currentIds = new Set(students.map(s => s.id));
          // Unsubscribe removed students
          Object.keys(assessmentUnsubsRef.current).forEach(id => {
            if (!currentIds.has(id)) {
              try { assessmentUnsubsRef.current[id]!(); } catch (e) { /* noop */ }
              delete assessmentUnsubsRef.current[id];
              delete assessmentsByStudentRef.current[id];
            }
          });
          // Subscribe new students
          students.forEach(s => {
            if (!assessmentUnsubsRef.current[s.id]) {
              const colRef = collection(db, `${studentsPath}/${s.id}/assessments`);
              const q = query(colRef, orderBy('assessmentDate', 'desc'));
              assessmentUnsubsRef.current[s.id] = onSnapshot(q, (snap) => {
                const arr = snap.docs.map(d => {
                  const data = d.data() as any;
                  const ts = data.assessmentDate;
                  const date = ts?.toDate ? ts.toDate() : null;
                  return { date, riskPercentage: Number(data.riskPercentage || 0) };
                });
                assessmentsByStudentRef.current[s.id] = arr;
                updateAggregates();
              }, (err) => {
                console.error(`Error listening to assessments for student ${s.id}:`, err);
              });
            }
          });

          // Initial aggregates (before assessment snapshots return)
          updateAggregates();
        });

        return () => {
          unsubStudents();
          Object.values(assessmentUnsubsRef.current).forEach(unsub => {
            try { unsub(); } catch (e) { /* noop */ }
          });
          assessmentUnsubsRef.current = {};
          assessmentsByStudentRef.current = {} as any;
        };
      } catch (error) {
        console.error('Error setting up real-time listeners:', error);
        setLoading(false);
      }
    };

    setupRealtimeListeners();
  }, [user]);

  const handleChartClick = () => {
    navigate('/analytics');
  };

  const handleViewDetails = (student: any) => {
    setSelectedStudent(student);
    setShowDetailsDialog(true);
  };

  const filteredRows = studentsRows.filter(student => {
    const matchesSearch = (student.studentName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || String(student.grade) === String(gradeFilter);
    const matchesGender = genderFilter === 'all' || (student.gender || '') === genderFilter;
    return matchesSearch && matchesGrade && matchesGender;
  });

  const handleSort = (key: keyof ReportRow) => {
    setSortConfig(current => {
      if (current?.key === key && current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedRows = useMemo(() => {
    if (!sortConfig) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      // Handle potential undefined values safely
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === undefined || bValue === undefined) return 0;

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortConfig]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, gradeFilter, genderFilter]);

  const totalPages = Math.ceil(sortedRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = sortedRows.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{schoolName} Reports</h1>
              <p className="text-muted-foreground">{schoolDescription}</p>
            </div>
            <div className="flex items-center space-x-2">
              {activeTab === 'students' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      // Create a worksheet from the report data
                      const ws = XLSX.utils.json_to_sheet(filteredRows);

                      // Create a workbook with the worksheet
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Student Reports');

                      // Generate the Excel file name with school name and date
                      const schoolName = schoolData?.name.replace(/\s+/g, '_') || 'Student_Reports';
                      const fileName = `${schoolName}_${new Date().toISOString().split('T')[0]}.xlsx`;

                      // Save the file
                      XLSX.writeFile(wb, fileName);

                      // Show success message
                      toast({
                        title: 'Export Successful',
                        description: `Successfully exported ${filteredRows.length} student records.`,
                      });
                    } catch (error) {
                      console.error('Error exporting data:', error);
                      toast({
                        title: 'Export Failed',
                        description: 'There was an error exporting the data. Please try again.',
                        variant: 'destructive',
                      });
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>

          <Tabs
            defaultValue="overview"
            className="space-y-4"
            onValueChange={setActiveTab}
          >
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="overview">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="students">
                  <Users className="w-4 h-4 mr-2" />
                  Students
                </TabsTrigger>
                <TabsTrigger value="trends">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trends
                </TabsTrigger>
              </TabsList>
              {activeTab === 'trends' && (
                <div className="flex items-center space-x-2">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    {/* <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent> */}
                  </Select>
                </div>
              )}
            </div>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{stats.trend}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Assessments Completed</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.assessmentsCompleted.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{stats.completionRate}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">High Risk Students</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.highRiskStudents.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {((stats.highRiskStudents / stats.totalStudents) * 100).toFixed(1)}% of total
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Intervention Success</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.interventionSuccessRate}%</div>
                    <p className="text-xs text-muted-foreground">Success rate for interventions</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle className="text-center">Assessment Completion</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="flex justify-between items-center mb-6">
                      <div>

                      </div>
                    </div>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={assessmentData}
                          margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                          barGap={6}
                          barCategoryGap="20%"
                        >
                          <CartesianGrid
                            strokeDasharray="2 4"
                            vertical={true}
                            stroke="#e2e8f0"
                            strokeWidth={0.8}
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                            tickLine={{ stroke: '#d1d5db' }}
                            tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 500 }}
                            padding={{ left: 10, right: 10 }}
                          />
                          <YAxis
                            axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                            tickLine={{ stroke: '#d1d5db' }}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            width={35}
                            domain={[0, 'dataMax * 1.2']}
                            tickFormatter={(value) => Math.round(value) === value ? value : ''}
                            label={{
                              value: 'Students',
                              angle: -90,
                              position: 'insideLeft',
                              offset: -5,
                              style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 }
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                            itemStyle={{
                              color: '#1f2937',
                              fontSize: '0.875rem',
                              padding: '0.25rem 0'
                            }}
                            labelStyle={{
                              color: '#111827',
                              fontWeight: 600,
                              marginBottom: '0.5rem',
                              fontSize: '0.875rem'
                            }}
                            formatter={(value: number, name: string, props: any) => {
                              if (name === 'Completed') {
                                const total = props.payload.total || 0;
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return [
                                  <span key="completed" className="font-medium">
                                    {value} of {total} students
                                  </span>,
                                  <div key="percentage" className="text-blue-600 font-semibold">
                                    {percentage}% completion
                                  </div>
                                ];
                              }
                              return null;
                            }}
                            labelFormatter={(label) => `Grade ${label}`}
                          />
                          <Legend />
                          <Bar
                            dataKey="total"
                            name="Total Students"
                            fill="#b7bbbfff"
                            radius={[4, 4, 0, 0]}
                            barSize={28}
                          >
                            <LabelList
                              dataKey="total"
                              position="top"
                              formatter={(value: number) => `${value} total`}
                              fill="#6b7280"
                              fontSize={11}
                              offset={10}
                            />
                          </Bar>
                          <Bar
                            dataKey="completed"
                            name="Completed"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            barSize={28}
                          >
                            <LabelList
                              dataKey="completed"
                              position="top"
                              formatter={(value: number) => {
                                // Find the matching data point to get the total
                                const dataPoint = assessmentData.find((d: any) => d.completed === value);
                                const total = dataPoint?.total || 1; // Fallback to 1 to avoid division by zero
                                const percentage = Math.round((value / total) * 100);
                                return `${percentage}%`;
                              }}
                              fill="#4f46e5"
                              fontSize={11}
                              fontWeight="bold"
                              offset={10}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-sm text-muted-foreground text-center mt-2">
                      Overall completion rate: {((assessmentData.reduce((sum, item) => sum + item.completed, 0) /
                        assessmentData.reduce((sum, item) => sum + item.total, 0)) * 100).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Wellness Distribution</CardTitle>
                    <CardDescription>Overview of student wellness status across all grades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Calculate the real wellness data with proper mapping
                      const mappedWellnessData = [
                        { name: 'Thriving', value: wellnessData[0]?.value || 0, color: '#10b981' },
                        { name: 'Stable', value: wellnessData[1]?.value || 0, color: '#3b82f6' },
                        { name: 'Needs Support', value: wellnessData[2]?.value || 0, color: '#f59e0b' },
                        { name: 'At Risk', value: wellnessData[3]?.value || 0, color: '#ef4444' },
                      ];

                      const totalStudents = mappedWellnessData.reduce((sum, item) => sum + item.value, 0);
                      const hasData = totalStudents > 0;

                      if (!hasData) {
                        return (
                          <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                              <BarChart3 className="w-12 h-12 text-gray-400" />
                            </div>
                            <p className="text-lg font-medium text-gray-900 mb-2">No Assessment Data Yet</p>
                            <p className="text-sm text-gray-500 max-w-xs">
                              Assessment data will appear here once students complete their first wellness assessment.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="relative h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={mappedWellnessData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={3}
                                dataKey="value"
                                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                                animationBegin={0}
                                animationDuration={800}
                              >
                                {mappedWellnessData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="#fff"
                                    strokeWidth={2}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value: number) => {
                                  const percentage = ((value / totalStudents) * 100).toFixed(1);
                                  return [`${value} students (${percentage}%)`, ''];
                                }}
                                contentStyle={{
                                  backgroundColor: 'white',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '0.5rem',
                                  padding: '0.75rem',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                itemStyle={{
                                  color: '#1f2937',
                                  fontSize: '0.875rem',
                                  fontWeight: 500
                                }}
                              />
                              <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                wrapperStyle={{
                                  paddingTop: '24px'
                                }}
                                formatter={(value, entry: any) => {
                                  const percentage = ((entry.payload.value / totalStudents) * 100).toFixed(0);
                                  return (
                                    <span className="text-sm font-medium">
                                      {value} ({percentage}%)
                                    </span>
                                  );
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Student Reports</CardTitle>
                      <CardDescription>
                        View and manage individual student reports and progress
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 gap-2 flex-wrap">
                      <Select value={gradeFilter} onValueChange={setGradeFilter}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Grade: All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Classes</SelectItem>
                          <SelectItem value="6">Grade 6</SelectItem>
                          <SelectItem value="7">Grade 7</SelectItem>
                          <SelectItem value="8">Grade 8</SelectItem>
                          <SelectItem value="9">Grade 9</SelectItem>
                          <SelectItem value="10">Grade 10</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={genderFilter} onValueChange={setGenderFilter}>
                        {/* <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Gender: All" />
                    </SelectTrigger> */}
                        {/* <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent> */}
                      </Select>
                      <Select value={timeRange} onValueChange={setTimeRange}>
                        {/* <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent> */}
                      </Select>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search students..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 w-[200px]"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('studentName')}>
                            <div className="flex items-center">
                              Student Name
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('grade')}>
                            <div className="flex items-center">
                              Grade
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('lastAssessment')}>
                            <div className="flex items-center">
                              Last Assessment
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('wellnessScore')}>
                            <div className="flex items-center">
                              Wellness Score
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('riskLevel')}>
                            <div className="flex items-center">
                              Risk Level
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort('interventions')}>
                            <div className="flex items-center">
                              Active Interventions
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedRows.length > 0 ? (
                          paginatedRows.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell className="font-medium">{row.studentName}</TableCell>
                              <TableCell>{row.grade}</TableCell>
                              <TableCell>{row.lastAssessment}</TableCell>
                              <TableCell>{row.wellnessScore}%</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    row.riskLevel === 'high'
                                      ? 'destructive'
                                      : row.riskLevel === 'medium'
                                        ? 'secondary'
                                        : 'default'
                                  }
                                  className={`capitalize ${row.riskLevel === 'low' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''
                                    } ${row.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''
                                    }`}
                                >
                                  {row.riskLevel}
                                </Badge>
                              </TableCell>
                              <TableCell>{row.interventions}</TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm" onClick={() => handleViewDetails(row)}>
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              No results found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedRows.length)} of {sortedRows.length} entries
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm font-medium">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends">
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Wellness Score Trend</CardTitle>
                    <CardDescription>Average wellness score over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyTrendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis domain={[60, 90]} />
                          <Tooltip
                            formatter={(value) => [value, 'Wellness Score']}
                            labelFormatter={(label) => `Month: ${label}`}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="wellnessScore"
                            name="Wellness Score"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Monthly Analytics</CardTitle>
                    <CardDescription>Comprehensive view of assessment and wellness metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyTrendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                          <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                          <Tooltip
                            formatter={(value, name) => {
                              if (name === 'assessments') return [value, 'Assessments'];
                              if (name === 'wellnessScore') return [value, 'Wellness Score'];
                              return [value, name];
                            }}
                            labelFormatter={(label) => `Month: ${label}`}
                          />
                          <Legend />
                          <Bar
                            yAxisId="left"
                            dataKey="assessments"
                            name="Assessments"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="wellnessScore"
                            name="Wellness Score"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Student Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Student Wellbeing Details</DialogTitle>
                <DialogDescription>
                  Overall assessment and risk evaluation for {selectedStudent?.studentName}
                </DialogDescription>
              </div>
              <DialogPrimitive.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </div>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="font-semibold">{selectedStudent.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grade</p>
                  <p className="font-semibold">{selectedStudent.grade}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Assessment</p>
                  <p className="font-semibold">{selectedStudent.lastAssessment}</p>
                </div>
                <div>
                  {/* <p className="text-sm text-muted-foreground">Gender</p> */}
                  <p className="font-semibold">{selectedStudent.gender}</p>
                </div>
              </div>

              {/* Overall Wellbeing */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Overall Wellbeing Assessment</h3>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Wellbeing Score</span>
                    <span className="text-2xl font-bold text-primary">{selectedStudent.wellnessScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${selectedStudent.wellnessScore >= 70 ? 'bg-green-500' :
                        selectedStudent.wellnessScore >= 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                      style={{ width: `${selectedStudent.wellnessScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Risk Assessment</h3>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Current Risk Level</span>
                    <Badge
                      className={`capitalize ${selectedStudent.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                        selectedStudent.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                    >
                      {selectedStudent.riskLevel} Risk
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedStudent.riskLevel === 'low' && 'Student is doing well. Continue regular monitoring.'}
                    {selectedStudent.riskLevel === 'medium' && 'Student may benefit from additional support. Monitor closely.'}
                    {selectedStudent.riskLevel === 'high' && 'Student requires immediate attention and intervention.'}
                  </p>
                </div>
              </div>

              {/* Active Interventions */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Active Interventions</h3>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-primary mb-1">{selectedStudent.interventions}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedStudent.interventions > 0
                      ? 'Interventions currently in progress'
                      : 'No active interventions at this time'
                    }
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Recommendations</h3>
                <div className="p-4 border rounded-lg bg-blue-50">
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    {selectedStudent.riskLevel === 'high' && (
                      <>
                        <li>Schedule immediate counseling session</li>
                        <li>Notify parents/guardians</li>
                        <li>Provide daily check-ins</li>
                        <li>Consider peer support programs</li>
                      </>
                    )}
                    {selectedStudent.riskLevel === 'medium' && (
                      <>
                        <li>Schedule weekly wellness check-ins</li>
                        <li>Encourage participation in support groups</li>
                        <li>Monitor academic performance</li>
                        <li>Provide stress management resources</li>
                      </>
                    )}
                    {selectedStudent.riskLevel === 'low' && (
                      <>
                        <li>Continue regular assessments</li>
                        <li>Encourage healthy habits</li>
                        <li>Maintain open communication</li>
                        <li>Celebrate positive progress</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}