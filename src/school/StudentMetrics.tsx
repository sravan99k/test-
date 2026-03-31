
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const StudentMetrics = () => {
  const navigate = useNavigate();
  const riskCategories = [
    { category: "High Risk", count: 31, color: "text-red-600", bgColor: "bg-red-50 border-red-200" },
    { category: "Moderate Risk", count: 45, color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200" },
    { category: "Low Risk", count: 436, color: "text-green-600", bgColor: "bg-green-50 border-green-200" }
  ];

  const commonIssues = [
    { issue: "Academic Stress", percentage: 68, count: 342 },
    { issue: "Social Anxiety", percentage: 45, count: 225 },
    { issue: "Family Pressure", percentage: 38, count: 190 },
    { issue: "Body Image Concerns", percentage: 32, count: 160 },
    { issue: "Sleep Issues", percentage: 29, count: 145 }
  ];

  const recentAlerts = [
    { student: "Grade 8 Student", issue: "High stress indicators", time: "2 hours ago", severity: "high" },
    { student: "Grade 10 Student", issue: "Eating pattern concerns", time: "5 hours ago", severity: "moderate" },
    { student: "Grade 7 Student", issue: "Social isolation signals", time: "1 day ago", severity: "moderate" }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
          <CardDescription>Student mental health risk levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {riskCategories.map((risk, index) => (
              <div key={index} className={`p-3 rounded-lg ${risk.bgColor}`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{risk.category}</span>
                  <span className={`font-bold ${risk.color}`}>{risk.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Issues</CardTitle>
          <CardDescription>Most reported mental health concerns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commonIssues.map((issue, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{issue.issue}</span>
                  <span className="text-gray-500">{issue.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${issue.percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">{issue.count} students</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>Students requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAlerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                alert.severity === "high" ? "border-red-500 bg-red-50" : "border-orange-500 bg-orange-50"
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{alert.student}</p>
                    <p className="text-xs text-gray-600">{alert.issue}</p>
                  </div>
                  <span className="text-xs text-gray-500">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4 bg-blue-500 hover:bg-blue-600">
            View All Alerts
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full text-blue-700 border-blue-300 hover:bg-blue-100"
              onClick={() => navigate('/resources')}
            >
              Browse Helpful Resources
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-blue-700 border-blue-300 hover:bg-blue-100"
              onClick={() => navigate('/wellness/contact')}
            >
              Get Support - Talk to a Counselor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentMetrics;
