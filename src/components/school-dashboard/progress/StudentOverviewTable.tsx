
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";

interface Student {
  id: string;
  name: string;
  class: string;
  riskLevel: string;
  lastAssessment: string;
}

interface StudentOverviewTableProps {
  studentList: Student[];
  onSelectStudent: (studentId: string) => void;
  getRiskBadgeColor: (level: string) => string;
}

export const StudentOverviewTable = ({ 
  studentList, 
  onSelectStudent, 
  getRiskBadgeColor 
}: StudentOverviewTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Student Overview Dashboard
        </CardTitle>
        <CardDescription>
          Latest risk assessments for all students with color-coded risk levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              
              <TableHead>Overall Risk</TableHead>
              <TableHead>Last Assessment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentList.map((student) => (
              <TableRow key={student.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{student.id}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.class}</TableCell>
                <TableCell>
                  <Badge className={getRiskBadgeColor('Moderate')}>
                    Moderate
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getRiskBadgeColor('High')}>
                    High
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getRiskBadgeColor('Low')}>
                    Low
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getRiskBadgeColor(student.riskLevel)}>
                    {student.riskLevel} Risk
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">{student.lastAssessment}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectStudent(student.id)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
