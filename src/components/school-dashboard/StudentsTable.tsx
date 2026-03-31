import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { ArrowUpDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Student } from "@/services/schoolDataService";
import { format } from 'date-fns';

type SortableField = keyof Pick<Student, 'name' | 'grade' | 'risk_level' | 'last_assessment' | 'wellbeing_score'>;

interface StudentsTableProps {
  students: Student[];
  onSort: (key: SortableField) => void;
  sortConfig: {
    key: SortableField;
    direction: 'asc' | 'desc';
  };
  onViewDetails: (student: Student) => void;
}

const getRiskBadgeVariant = (riskLevel: string) => {
  switch (riskLevel) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'outline';
    default:
      return 'secondary';
  }
};

export function StudentsTable({ 
  students, 
  onSort, 
  sortConfig,
  onViewDetails 
}: StudentsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-accent"
              onClick={() => onSort('name')}
            >
              <div className="flex items-center">
                Name
                {sortConfig.key === 'name' && (
                  sortConfig.direction === 'asc' ? <ArrowUpDown className="ml-2 h-4 w-4 rotate-180" /> : <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-accent"
              onClick={() => onSort('grade')}
            >
              <div className="flex items-center">
                Grade
                {sortConfig.key === 'grade' && (
                  sortConfig.direction === 'asc' ? <ArrowUpDown className="ml-2 h-4 w-4 rotate-180" /> : <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead>Section</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-accent"
              onClick={() => onSort('risk_level')}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      Risk Level
                      {sortConfig.key === 'risk_level' && (
                        sortConfig.direction === 'asc' ? <ArrowUpDown className="ml-2 h-4 w-4 rotate-180" /> : <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span>Indicates the student's current risk assessment: Low, Medium, or High.</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-accent"
              onClick={() => onSort('wellbeing_score')}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      Wellbeing Score
                      {sortConfig.key === 'wellbeing_score' && (
                        sortConfig.direction === 'asc' ? <ArrowUpDown className="ml-2 h-4 w-4 rotate-180" /> : <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span>Reflects the student’s average wellbeing from recent assessments (0–10).</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-accent"
              onClick={() => onSort('last_assessment')}
            >
              <div className="flex items-center">
                Last Assessment
                {sortConfig.key === 'last_assessment' && (
                  sortConfig.direction === 'asc' ? <ArrowUpDown className="ml-2 h-4 w-4 rotate-180" /> : <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No students found.
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <button 
                    onClick={() => onViewDetails(student)}
                    className="hover:underline text-left"
                  >
                    {student.name}
                  </button>
                </TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>Grade {student.grade}</TableCell>
                <TableCell>Section {student.section}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Badge 
                            variant={getRiskBadgeVariant(student.risk_level)} 
                            aria-label={`Risk level: ${student.risk_level}`}
                          >
                            {student.risk_level.charAt(0).toUpperCase() + student.risk_level.slice(1)}
                          </Badge>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <span>
                          {student.risk_level === 'high' && 'High risk: Immediate attention recommended.'}
                          {student.risk_level === 'medium' && 'Medium risk: Monitor and support as needed.'}
                          {student.risk_level === 'low' && 'Low risk: No immediate concerns.'}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  {format(new Date(student.last_assessment), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-10 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                      <div 
                        className={`h-full ${
                          student.wellbeing_score >= 7 ? 'bg-green-500' : 
                          student.wellbeing_score >= 4 ? 'bg-amber-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${student.wellbeing_score * 10}%` }}
                      />
                    </div>
                    {student.wellbeing_score.toFixed(1)}/10
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewDetails(student)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
