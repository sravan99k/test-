
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface ProgressData {
  date: string;
  depression: number;
  stress: number;
  anxiety: number;
  wellbeing: number;
  overall: number;
}

interface IndividualStudentProgressProps {
  selectedStudent: string;
  progressData: ProgressData[];
}

// Function to generate mock data for any student
const generateMockStudentData = (studentId: string) => {
  // Generate consistent but unique data based on student ID
  const idHash = studentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const riskLevels = ['Low', 'Moderate', 'High'];
  const riskLevel = riskLevels[idHash % 3];
  const grade = 6 + (idHash % 5); // Grades 6-10
  
  // Generate trend data (4 months)
  const baseScores = {
    depression: 30 + (idHash % 40), // 30-70
    stress: 30 + ((idHash + 10) % 40),
    anxiety: 30 + ((idHash + 20) % 40),
    wellbeing: 40 + ((idHash + 30) % 50)
  };

  // Generate progress data with some variation
  const progress = [];
  for (let i = 3; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthOffset = (idHash + i * 5) % 20 - 10; // -10 to +10 variation
    
    progress.push({
      date: date.toISOString().split('T')[0],
      depression: Math.max(10, Math.min(90, baseScores.depression + monthOffset)),
      stress: Math.max(10, Math.min(90, baseScores.stress + monthOffset)),
      anxiety: Math.max(10, Math.min(90, baseScores.anxiety + monthOffset)),
      wellbeing: Math.max(10, Math.min(90, baseScores.wellbeing - monthOffset)),
      overall: Math.round((baseScores.depression + baseScores.stress + baseScores.anxiety + (100 - baseScores.wellbeing)) / 4)
    });
  }

  // Generate category scores with some variation
  const currentScores = progress[progress.length - 1];
  const categoryScores = [
    { name: 'Depression', value: currentScores.depression },
    { name: 'Stress', value: currentScores.stress },
    { name: 'Anxiety', value: currentScores.anxiety },
    { name: 'Wellbeing', value: currentScores.wellbeing },
  ];

  // Generate random name based on ID for consistency
  const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Ananya', 'Rohan', 'Meera'];
  const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Verma', 'Reddy', 'Joshi'];
  const firstName = firstNames[idHash % firstNames.length];
  const lastName = lastNames[(idHash + 5) % lastNames.length];

  return {
    name: `${firstName} ${lastName}`,
    class: `Grade ${grade}`,
    age: 11 + grade, // Rough age based on grade
    lastAssessment: progress[progress.length - 1].date,
    riskLevel: riskLevel,
    interventions: riskLevel === 'High' ? ['Weekly counseling', 'Parent meetings'] :
                  riskLevel === 'Moderate' ? ['Monthly check-ins'] : ['General monitoring'],
    progress,
    categoryScores,
    classAverage: 40 + (idHash % 30), // 40-70
    schoolAverage: 45 + (idHash % 25), // 45-70
    riskDistribution: [
      { name: 'Low', value: 30 + (idHash % 30), color: '#22c55e' },
      { name: 'Moderate', value: 30 + ((idHash + 10) % 30), color: '#eab308' },
      { name: 'High', value: 30 + ((idHash + 20) % 30), color: '#ff6b6b' },
    ]
  };
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const IndividualStudentProgress = ({ 
  selectedStudent, 
  progressData = []
}: IndividualStudentProgressProps) => {
  // Generate mock data for the selected student
  const studentData = generateMockStudentData(selectedStudent);
  
  // Use provided progress data if available, otherwise use mock data
  if (progressData.length > 0) {
    studentData.progress = progressData;
  }

  return (
    <div className="space-y-6">
      {/* Student Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{studentData.name}</CardTitle>
              <CardDescription>
                {studentData.class} • {studentData.age} years • Last Assessment: {studentData.lastAssessment}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                studentData.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                studentData.riskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {studentData.riskLevel} Risk
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ProgressOver Time */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
            <CardDescription>Trend of wellbeing over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentData.progress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="overall" 
                    fill="#3b82f6" 
                    name="Overall Wellbeing"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Comparison with peers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[{
                    name: 'Student',
                    score: studentData.categoryScores.reduce((sum, item) => sum + item.value, 0) / 
                           studentData.categoryScores.length,
                    fill: '#3b82f6'
                  }, {
                    name: 'Class Avg',
                    score: studentData.classAverage,
                    fill: '#94a3b8'
                  }, {
                    name: 'School Avg',
                    score: studentData.schoolAverage,
                    fill: '#cbd5e1'
                  }]}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip formatter={(value) => [`${(value as number).toFixed(2)}%`, 'Score']} />
                  <Bar dataKey="score" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Scores */}

        {/* Interventions */}
        
      </div>
    </div>
  );
};
