import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Student } from "@/services/schoolDataService";
import { format } from "date-fns";
import { ReactNode, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface StudentDetailDialogProps {
  student: Student | null;
  onClose: () => void;
  onInterventionComplete: (interventionId: string) => void;
  children?: ReactNode;
}

export function StudentDetailDialog({
  student,
  onClose,
  onInterventionComplete,
  children
}: StudentDetailDialogProps) {
  const [showAddIntervention, setShowAddIntervention] = useState(false);
  const [interventionForm, setInterventionForm] = useState({
    type: "",
    description: "",
    startDate: "",
    frequency: "",
    status: "pending" as "pending" | "active" | "completed" | "cancelled"
  });
  const { toast } = useToast();

  const handleAddIntervention = () => {
    if (!interventionForm.type || !interventionForm.description || !interventionForm.startDate || !interventionForm.frequency) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Intervention Added",
      description: `${interventionForm.type} intervention has been scheduled for ${student?.name}`,
    });

    setInterventionForm({
      type: "",
      description: "",
      startDate: "",
      frequency: "",
      status: "pending"
    });
    setShowAddIntervention(false);
  };

  if (!student) return null;

  return (
    <Dialog open={!!student} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Student Details</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="text-lg font-semibold">{student.name}</h3>
              <p className="text-muted-foreground">{student.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Grade & Section</p>
              <p className="font-medium">Grade {student.grade} - {student.section}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wellbeing Score</p>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${student.wellbeing_score >= 7 ? 'bg-green-500' :
                        student.wellbeing_score >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    style={{ width: `${(student.wellbeing_score / 10) * 100}%` }}
                  />
                </div>
                <span className="font-medium">{student.wellbeing_score}/10</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="assessments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
              <TabsTrigger value="interventions">Interventions</TabsTrigger>
            </TabsList>

            <TabsContent value="assessments" className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Assessment History</h3>
                {student.assessments?.length > 0 ? (
                  <div className="border rounded-md divide-y">
                    {student.assessments.map((assessment, index) => (
                      <div key={index} className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{assessment.category}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(assessment.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Score: {assessment.score}/10</p>
                          <p className={`text-xs ${assessment.score >= 7 ? 'text-green-600' :
                              assessment.score >= 4 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {assessment.score >= 7 ? 'Good' : assessment.score >= 4 ? 'Moderate' : 'Needs Attention'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm p-4">No assessment history available.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="interventions" className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Intervention History</h3>
                  <Button size="sm" onClick={() => setShowAddIntervention(true)}>+ Add Intervention</Button>
                </div>
                {student.interventions?.length > 0 ? (
                  <div className="border rounded-md divide-y">
                    {student.interventions.map((intervention, index) => (
                      <div key={index} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{intervention.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(intervention.date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${intervention.status === 'completed' ? 'bg-green-100 text-green-800' :
                              intervention.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                intervention.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                            }`}>
                            {intervention.status.replace('-', ' ')}
                          </span>
                        </div>
                        {intervention.status !== 'completed' && intervention.status !== 'cancelled' && (
                          <div className="mt-2 flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onInterventionComplete(`int-${index}`)}
                            >
                              Mark as Complete
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm p-4">No intervention history available.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>

      {/* Add Intervention Dialog */}
      <Dialog open={showAddIntervention} onOpenChange={setShowAddIntervention}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Intervention</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Intervention Type *</Label>
              <Input
                id="type"
                placeholder="e.g., Academic Support, Social Skills, Counseling"
                value={interventionForm.type}
                onChange={(e) => setInterventionForm({ ...interventionForm, type: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="e.g., Extra tutoring sessions, Peer interaction coaching"
                value={interventionForm.description}
                onChange={(e) => setInterventionForm({ ...interventionForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={interventionForm.startDate}
                  onChange={(e) => setInterventionForm({ ...interventionForm, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <Input
                  id="frequency"
                  placeholder="e.g., 2x per week, Daily"
                  value={interventionForm.frequency}
                  onChange={(e) => setInterventionForm({ ...interventionForm, frequency: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={interventionForm.status}
                onValueChange={(value: any) => setInterventionForm({ ...interventionForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddIntervention(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddIntervention}>
              Add Intervention
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}