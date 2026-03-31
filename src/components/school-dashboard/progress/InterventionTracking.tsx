
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const InterventionTracking = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Intervention Tracking</CardTitle>
        <CardDescription>Notes and follow-ups for at-risk students</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium">Anjali Verma (ST002)</h4>
              <p className="text-sm text-gray-600">Wellness check completed</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Resolved</Badge>
          </div>
          <p className="text-sm text-gray-700">
            Student reported improved wellbeing after peer support group participation.
          </p>
          <p className="text-xs text-gray-500 mt-2">Last updated: 1 week ago</p>
        </div>
      </CardContent>
    </Card>
  );
};
