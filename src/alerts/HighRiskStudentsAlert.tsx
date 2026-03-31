
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, Mail } from "lucide-react";
import { StudentData } from "@/services/studentDataService";

interface HighRiskStudentsAlertProps {
  students: StudentData[];
}

const HighRiskStudentsAlert = ({ students }: HighRiskStudentsAlertProps) => {
  const highRiskStudents = students.filter(student => student.riskLevel === 'High');

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          High-Risk Students Alert
        </CardTitle>
        <CardDescription className="text-red-600">
          {highRiskStudents.length} students require immediate attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {highRiskStudents.slice(0, 5).map((student) => (
            <Alert key={student.id} className="border-red-300 bg-red-100">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-red-800">
                {student.name} (Roll: {student.rollNo})
              </AlertTitle>
              <AlertDescription className="text-red-700">
                <div className="mt-2 space-y-1">
                  <p><strong>Class:</strong> {student.class} | <strong>Gender:</strong> {student.gender}</p>
                  <p><strong>Risk Level:</strong> {student.riskLevel} ({student.riskPercentage}%)</p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="text-red-700 border-red-300">
                      <Phone className="w-3 h-3 mr-1" />
                      Call Parent
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-700 border-red-300">
                      <Mail className="w-3 h-3 mr-1" />
                      Send Alert
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
          
          {highRiskStudents.length > 5 && (
            <div className="text-center">
              <Button variant="outline" className="text-red-700 border-red-300">
                View All {highRiskStudents.length} High-Risk Students
              </Button>
            </div>
          )}
          
          <div className="bg-red-100 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">⚠️ Immediate Actions Required:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Contact parents/guardians within 24 hours</li>
              <li>• Schedule counseling sessions immediately</li>
              <li>• Inform class teachers about behavioral changes</li>
              <li>• Consider peer support group referrals</li>
              <li>• Monitor daily attendance and academic performance</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HighRiskStudentsAlert;
