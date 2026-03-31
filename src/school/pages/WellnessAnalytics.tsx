import { useState, useEffect } from "react";
import { 
  Download, 
  Search, 
  Filter, 
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  ResponsiveContainer 
} from 'recharts';

// Mock data for students
const studentData = [
  { 
    id: 'ST001', 
    name: 'Rahul Sharma', 
    class: 'Grade 10', 
    
    overallRisk: 'High Risk',
    lastAssessment: '2025-06-15'
  },
  { 
    id: 'ST002', 
    name: 'Priya Patel', 
    class: 'Grade 9', 
    
    overallRisk: 'Low Risk',
    lastAssessment: '2025-06-14'
  },
  { 
    id: 'ST003', 
    name: 'Amit Kumar', 
    class: 'Grade 10', 
    
    overallRisk: 'Moderate Risk',
    lastAssessment: '2025-06-13'
  },
  { 
    id: 'ST004', 
    name: 'Anjali Verma', 
    class: 'Grade 10', 
    
    overallRisk: 'High Risk',
    lastAssessment: '2025-06-12'
  },
  { 
    id: 'ST005', 
    name: 'Vikram Singh', 
    class: 'Grade 9', 
    
    overallRisk: 'Low Risk',
    lastAssessment: '2025-06-11'
  },
  { 
    id: 'ST006', 
    name: 'Neha Gupta', 
    class: 'Grade 11', 
    
    overallRisk: 'Moderate Risk',
    lastAssessment: '2025-06-10'
  },
];

// Mock data for charts
const riskDistributionData = [
  { name: 'High Risk', value: 2, color: '#ef4444' },
  { name: 'Moderate Risk', value: 2, color: '#f59e0b' },
  { name: 'Low Risk', value: 2, color: '#10b981' },
];

const trendData = [
  { name: 'Jan', high: 3, moderate: 4, low: 5 },
  { name: 'Feb', high: 2, moderate: 5, low: 5 },
  { name: 'Mar', high: 4, moderate: 3, low: 5 },
  { name: 'Apr', high: 3, moderate: 4, low: 5 },
  { name: 'May', high: 1, moderate: 3, low: 8 },
  { name: 'Jun', high: 2, moderate: 2, low: 8 },
];

const gradeWiseData = [
  { name: 'Grade 6', high: 1, moderate: 1, low: 2 },
  { name: 'Grade 7', high: 0, moderate: 2, low: 1 },
  { name: 'Grade 8', high: 1, moderate: 1, low: 1 },
  { name: 'Grade 9', high: 1, moderate: 0, low: 1 },
  { name: 'Grade 10', high: 2, moderate: 2, low: 0 },
];

export const WellnessAnalytics = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("month");
  const [filteredStudents, setFilteredStudents] = useState(studentData);
  
  // Filter students based on search term
  useEffect(() => {
    const results = studentData.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(results);
  }, [searchTerm]);

  // Calculate summary metrics
  const highRiskCount = studentData.filter(s => s.overallRisk === 'High Risk').length;
  const moderateRiskCount = studentData.filter(s => s.overallRisk === 'Moderate Risk').length;
  const lowRiskCount = studentData.filter(s => s.overallRisk === 'Low Risk').length;
  const totalAssessments = studentData.length;
  const latestAssessment = studentData.length > 0 
    ? new Date(Math.max(...studentData.map(s => new Date(s.lastAssessment).getTime()))).toLocaleDateString()
    : 'N/A';

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">School Wellness Dashboard</h1>
          <p className="text-muted-foreground">Overview of student mental health and wellbeing</p>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search students..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Risk Students</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskCount}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Moderate Risk</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderateRiskCount}</div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowRiskCount}</div>
            <p className="text-xs text-muted-foreground">Doing well</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssessments}</div>
            <p className="text-xs text-muted-foreground">Last updated: {latestAssessment}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Risk Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <LineChartIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Risk Trend</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="high" stroke="#ef4444" name="High Risk" />
                <Line type="monotone" dataKey="moderate" stroke="#f59e0b" name="Moderate Risk" />
                <Line type="monotone" dataKey="low" stroke="#10b981" name="Low Risk" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChartIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Grade-wise Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeWiseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="high" fill="#ef4444" name="High Risk" />
                <Bar dataKey="moderate" fill="#f59e0b" name="Moderate Risk" />
                <Bar dataKey="low" fill="#10b981" name="Low Risk" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Student Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Student Wellness Overview</CardTitle>
              <CardDescription>Detailed view of student assessments and risk levels</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Assessment
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  
                  <TableHead>Overall Risk</TableHead>
                  <TableHead>Last Assessment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
               
                    <TableCell>
                      <Badge 
                        className={
                          student.overallRisk === 'High Risk' ? 'bg-red-100 text-red-800' :
                          student.overallRisk === 'Moderate Risk' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }
                      >
                        {student.overallRisk}
                      </Badge>
                    </TableCell>
                    <TableCell>{student.lastAssessment}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WellnessAnalytics;
