import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Phone, Mail, UserCheck, AlertTriangle, FileText, ShieldCheck, Send, CheckCircle } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Student } from "@/services/schoolDataService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface StudentDetailsDialogProps {
    student: Student | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StudentDetailsDialog({ student, open, onOpenChange }: StudentDetailsDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();

    if (!student) return null;

    const isManagement = user?.role === 'management';
    const isTeacher = user?.role === 'teacher';

    const handleEscalate = (action: string) => {
        toast({
            title: "Escalation Triggered",
            description: `${action} for ${student.name}. Notifications will be sent to the assigned teachers and support staff.`,
            duration: 3000,
        });
    };

    const handleExport = () => {
        toast({
            title: "Export Started",
            description: "Generating student wellbeing report PDF...",
            duration: 2000,
        });
        setTimeout(() => window.print(), 1000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle>Student Wellbeing Details</DialogTitle>
                            <DialogDescription>
                                Overall assessment and risk evaluation for {student.name}
                            </DialogDescription>
                        </div>
                        <DialogPrimitive.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </DialogPrimitive.Close>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Student Info */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg border">
                        <div>
                            <p className="text-sm text-muted-foreground">Student Name</p>
                            <p className="font-semibold">{student.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Grade</p>
                            <p className="font-semibold">{student.grade}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Last Assessment</p>
                            <p className="font-semibold">{student.last_assessment || '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Gender</p>
                            <p className="font-semibold capitalize">{student.gender || '—'}</p>
                        </div>
                    </div>

                    {/* Overall Wellbeing */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Overall Wellbeing Assessment</h3>
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Wellbeing Score</span>
                                <span className="text-2xl font-bold text-primary">{student.wellbeing_score}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all duration-500 ${student.wellbeing_score >= 70 ? 'bg-green-500' :
                                        student.wellbeing_score >= 40 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`}
                                    style={{ width: `${student.wellbeing_score}%` }}
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
                                    className={`capitalize ${student.risk_level === 'low' ? 'bg-green-100 text-green-800 border-green-200' :
                                        student.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                            'bg-red-100 text-red-800 border-red-200'
                                        }`}
                                    variant="outline"
                                >
                                    {student.risk_level} Risk
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {student.risk_level === 'low' && 'Student is doing well. Continue regular monitoring.'}
                                {student.risk_level === 'medium' && 'Student may benefit from additional support. Monitor closely.'}
                                {student.risk_level === 'high' && 'Student requires immediate attention and intervention.'}
                            </p>
                        </div>
                    </div>



                    {/* Recommendations */}
                    <div className="space-y-3 pb-2">
                        <h3 className="text-lg font-semibold">Recommendations</h3>
                        <div className="p-4 border rounded-lg bg-blue-50/50">
                            <ul className="list-disc list-inside space-y-2 text-sm text-blue-900">
                                {student.risk_level === 'high' && (
                                    <>
                                        <li>Schedule immediate counseling session</li>
                                        <li>Notify parents/guardians</li>
                                        <li>Provide daily check-ins</li>
                                        <li>Consider peer support programs</li>
                                    </>
                                )}
                                {student.risk_level === 'medium' && (
                                    <>
                                        <li>Schedule weekly wellness check-ins</li>
                                        <li>Encourage participation in support groups</li>
                                        <li>Monitor academic performance</li>
                                        <li>Provide stress management resources</li>
                                    </>
                                )}
                                {student.risk_level === 'low' && (
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
            </DialogContent>
        </Dialog>
    );
}
