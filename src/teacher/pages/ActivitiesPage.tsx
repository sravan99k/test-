import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Clock, Users, Plus, Search, PlayCircle, Pause, Edit, Copy, ChevronDown, CalendarPlus, MoreVertical, Trash2, CheckCircle, XCircle, RotateCw } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';
import { db, auth } from '@/integrations/firebase';
import { collection, addDoc, getDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot, serverTimestamp, where } from 'firebase/firestore';
import {
  TeacherActivity,
  TeacherSession,
  TeacherStudent,
  subscribeToTeacherActivities,
  subscribeToTeacherSessions,
  subscribeToTeacherStudents
} from '@/services/teacherDataService';
import { useToast } from '@/hooks/use-toast';

// Mock data removed as it's now fetched from Firebase

export const ActivitiesPage = () => {
  const activityDateRef = useRef<HTMLInputElement>(null);
  const sessionDateRef = useRef<HTMLInputElement>(null);
  const [activities, setActivities] = useState<TeacherActivity[]>([]);
  const [sessions, setSessions] = useState<TeacherSession[]>([]);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolPath, setSchoolPath] = useState<string>('');
  const [teacherName, setTeacherName] = useState<string>('Teacher');
  const [showActions, setShowActions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [teacherId, setTeacherId] = useState<string>('');
  const [editingActivity, setEditingActivity] = useState<TeacherActivity | null>(null);
  const [editingSession, setEditingSession] = useState<TeacherSession | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'activity' | 'session'; participants: string[] } | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };

    // Close dropdown when pressing Escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);
  // Fetch data from Firebase
  useEffect(() => {
    let unsubActivities: (() => void) | null = null;
    let unsubSessions: (() => void) | null = null;
    let unsubStudents: (() => void) | null = null;

    const setupSubscriptions = async () => {
      if (!auth.currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const adminId = userData.parentAdminId;
          const schoolId = userData.schoolId;
          const organizationId = userData.organizationId;
          const isIndependent = userData.isIndependent;

          // Set teacher name
          const name = userData.name ||
            (userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : null) ||
            auth.currentUser.displayName ||
            "Teacher";
          setTeacherName(name);

          const path = isIndependent
            ? `users/${adminId}/schools/${schoolId}`
            : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;
          setSchoolPath(path);
          setTeacherId(userData.teacherId || '');

          unsubActivities = await subscribeToTeacherActivities((data) => {
            setActivities(data);
          });

          unsubSessions = await subscribeToTeacherSessions((data) => {
            setSessions(data);
          });

          unsubStudents = await subscribeToTeacherStudents((data) => {
            setStudents(data);
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error setting up ActivitiesPage subscriptions:', error);
        setLoading(false);
      }
    };

    setupSubscriptions();

    return () => {
      if (unsubActivities) unsubActivities();
      if (unsubSessions) unsubSessions();
      if (unsubStudents) unsubStudents();
    };
  }, []);

  const [newActivityOpen, setNewActivityOpen] = useState(false);
  const [newSessionOpen, setNewSessionOpen] = useState(false);

  // Auto-update activity statuses based on time
  // Auto-update activity and session statuses based on time (UI only)
  useEffect(() => {
    const updateStatuses = () => {
      setActivities(prev => prev.map(act => {
        if (act.status === 'cancelled' || act.status === 'completed' || act.status === 'missed') return act;
        const start = new Date(act.scheduledDate);
        const end = new Date(start.getTime() + (act.duration || 0) * 60000);
        const now = new Date();
        let status = act.status;
        if (now < start) {
          status = 'scheduled';
        } else if (now >= start && now <= end) {
          status = 'active';
        }
        return status === act.status ? act : { ...act, status };
      }));

      setSessions(prev => prev.map(sess => {
        if (sess.status === 'cancelled' || sess.status === 'completed' || sess.status === 'missed') return sess;
        const start = new Date(sess.scheduledDate);
        const end = new Date(start.getTime() + (sess.duration || 0) * 60000);
        const now = new Date();
        let status = sess.status;
        if (now < start) {
          status = 'scheduled';
        } else if (now >= start && now <= end) {
          status = 'in-progress';
        }
        return status === sess.status ? sess : { ...sess, status };
      }));
    };
    updateStatuses();
    const id = setInterval(updateStatuses, 60000);
    return () => clearInterval(id);
  }, []);

  // Form states
  const [activityForm, setActivityForm] = useState<Omit<TeacherActivity, 'id'>>({
    title: '',
    type: 'mindfulness',
    status: 'scheduled',
    description: '',
    scheduledDate: new Date().toISOString().slice(0, 16),
    duration: 30,
    participants: [],
    objectives: [],
    facilitator: teacherName,
    location: 'Classroom',
    notes: ''
  });

  useEffect(() => {
    setActivityForm(prev => ({ ...prev, facilitator: teacherName }));
  }, [teacherName]);

  // Optional single learning objective text mapped to objectives array on submit
  const [activityObjective, setActivityObjective] = useState<string>('');

  const [sessionForm, setSessionForm] = useState<Omit<TeacherSession, 'id'>>({
    title: '',
    type: 'individual',
    scheduledDate: new Date().toISOString().slice(0, 16),
    duration: 30,
    participants: [],
    status: 'scheduled',
    agenda: [],
    outcome: '',
    nextSteps: []
  });

  const [activityTime, setActivityTime] = useState<string>('');
  const [sessionTime, setSessionTime] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState('');

  const formatTo12h = (time24: string) => {
    const [hhStr, mmStr] = (time24 || '09:00').split(':');
    const hh = parseInt(hhStr || '9', 10);
    const mm = parseInt(mmStr || '0', 10);
    const period = hh >= 12 ? 'PM' : 'AM';
    const hour12 = ((hh % 12) || 12);
    return `${hour12}:${mm.toString().padStart(2, '0')} ${period}`;
  };

  const polar = (r: number, angleDeg: number) => {
    const a = (angleDeg - 90) * Math.PI / 180; // start at top
    return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
  };

  const hourPositions = Array.from({ length: 12 }, (_, i) => {
    const pos = polar(40, (i * 30));
    const label = i === 0 ? 12 : i; // 12 at the top, then 1..11 clockwise
    return { i, label, left: pos.x, top: pos.y };
  });

  const minutePositions = Array.from({ length: 12 }, (_, idx) => {
    const minutes = (idx * 5) % 60;
    const pos = polar(40, (idx * 30));
    return { idx, minutes, left: pos.x, top: pos.y };
  });

  const [activityClockMode, setActivityClockMode] = useState<'hour' | 'minute'>('hour');
  const [sessionClockMode, setSessionClockMode] = useState<'hour' | 'minute'>('hour');

  const parse12hTo24 = (input: string, fallback: string) => {
    if (!input) return fallback;
    let s = input.trim().toUpperCase();
    s = s.replace(/\s+/g, ' ');
    const m = s.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)?$/i);
    if (!m) return fallback;
    let h = parseInt(m[1], 10);
    let min = parseInt(m[2] || '0', 10);
    let ap = (m[3] || '').toUpperCase();
    if (min > 59) min = 59;
    if (h === 0) h = 12;
    if (!ap) {
      const curH = parseInt((fallback || '09:00').slice(0, 2), 10);
      ap = curH >= 12 ? 'PM' : 'AM';
    }
    if (h < 1) h = 1;
    if (h > 12) h = 12;
    let hh24 = h % 12;
    if (ap === 'PM') hh24 += 12;
    if (ap === 'AM' && h === 12) hh24 = 0;
    return `${hh24.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const t = (activityForm.scheduledDate || '').slice(11, 16) || '09:00';
    setActivityTime(formatTo12h(t));
  }, [activityForm.scheduledDate]);

  useEffect(() => {
    const t = (sessionForm.scheduledDate || '').slice(11, 16) || '09:00';
    setSessionTime(formatTo12h(t));
  }, [sessionForm.scheduledDate]);

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolPath || !teacherId) {
      toast({ title: 'Error', description: 'Could not determine school or teacher path', variant: 'destructive' });
      return;
    }

    try {
      // Find student names for selected participants
      const participantNames = activityForm.participants.map(pid => {
        const student = students.find(s => s.uid === pid);
        return student ? student.name : pid;
      });

      const activityData = {
        ...activityForm,
        participantNames,
        scheduledDate: new Date(activityForm.scheduledDate).toISOString(),
        objectives: activityObjective ? [activityObjective] : [],
        updatedAt: serverTimestamp()
      };

      const teachersPath = `${schoolPath}/teachers/${teacherId}/activities`;

      if (editingActivity) {
        // Update existing in teacher subcollection
        await updateDoc(doc(db, teachersPath, editingActivity.id), activityData);

        // Update copies in each student's subcollection
        // First, we need to clean up old records for all participants (previous and current)
        // For simplicity, we query and delete all copies associated with this activity ID
        const prevParticipants = editingActivity.participants;
        const allPotentialStudents = Array.from(new Set([...prevParticipants, ...activityForm.participants]));

        for (const studentId of allPotentialStudents) {
          const studentActPath = `${schoolPath}/students/${studentId}/activities`;
          const q = query(collection(db, studentActPath), where('teacherRef', '==', editingActivity.id));
          const querySnapshot = await getDocs(q);
          for (const docSnap of querySnapshot.docs) {
            await deleteDoc(docSnap.ref);
          }
        }

        // Now add the new updated copies for current participants
        for (const studentId of activityForm.participants) {
          const studentActPath = `${schoolPath}/students/${studentId}/activities`;
          await addDoc(collection(db, studentActPath), {
            ...activityData,
            teacherRef: editingActivity.id,
            createdAt: editingActivity.createdAt || serverTimestamp()
          });
        }
      } else {
        // Add new to teacher subcollection
        const docRef = await addDoc(collection(db, teachersPath), { ...activityData, createdAt: serverTimestamp() });

        // Add copies to each student's subcollection
        for (const studentId of activityForm.participants) {
          const studentActPath = `${schoolPath}/students/${studentId}/activities`;
          await addDoc(collection(db, studentActPath), {
            ...activityData,
            teacherRef: docRef.id,
            createdAt: serverTimestamp()
          });
        }
      }

      setActivityForm({
        title: '',
        type: 'mindfulness',
        status: 'scheduled',
        description: '',
        scheduledDate: new Date().toISOString().slice(0, 16),
        duration: 30,
        participants: [],
        objectives: [],
        facilitator: teacherName,
        location: 'Classroom',
        notes: ''
      });
      setActivityObjective('');
      setNewActivityOpen(false);
      setEditingActivity(null);

      toast({
        title: editingActivity ? 'Activity Updated' : 'Activity Success',
        description: editingActivity ? 'Activity has been successfully updated.' : 'New activity has been planned successfully.'
      });
    } catch (error) {
      console.error('Error saving activity:', error);
      toast({
        title: 'Error',
        description: 'Failed to save activity. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolPath || !teacherId) {
      toast({ title: 'Error', description: 'Could not determine school or teacher path', variant: 'destructive' });
      return;
    }

    try {
      // Find student names for selected participants
      const participantNames = sessionForm.participants.map(pid => {
        const student = students.find(s => s.uid === pid);
        return student ? student.name : pid;
      });

      const sessionData = {
        ...sessionForm,
        participantNames,
        scheduledDate: new Date(sessionForm.scheduledDate).toISOString(),
        updatedAt: serverTimestamp()
      };

      const sessionsPath = `${schoolPath}/teachers/${teacherId}/sessions`;

      if (editingSession) {
        await updateDoc(doc(db, sessionsPath, editingSession.id), sessionData);

        // Update in student records (Clean up old and add new)
        const prevParticipants = editingSession.participants;
        const allPotentialStudents = Array.from(new Set([...prevParticipants, ...sessionForm.participants]));

        for (const studentId of allPotentialStudents) {
          const studentSessPath = `${schoolPath}/students/${studentId}/sessions`;
          const q = query(collection(db, studentSessPath), where('teacherRef', '==', editingSession.id));
          const querySnapshot = await getDocs(q);
          for (const docSnap of querySnapshot.docs) {
            await deleteDoc(docSnap.ref);
          }
        }

        for (const studentId of sessionForm.participants) {
          const studentSessPath = `${schoolPath}/students/${studentId}/sessions`;
          await addDoc(collection(db, studentSessPath), {
            ...sessionData,
            teacherRef: editingSession.id,
            createdAt: editingSession.createdAt || serverTimestamp()
          });
        }
      } else {
        const docRef = await addDoc(collection(db, sessionsPath), { ...sessionData, createdAt: serverTimestamp() });

        // Add to student records
        for (const studentId of sessionForm.participants) {
          const studentSessPath = `${schoolPath}/students/${studentId}/sessions`;
          await addDoc(collection(db, studentSessPath), {
            ...sessionData,
            teacherRef: docRef.id,
            createdAt: serverTimestamp()
          });
        }
      }

      setSessionForm({
        title: '',
        type: 'individual',
        scheduledDate: new Date().toISOString().slice(0, 16),
        duration: 30,
        participants: [],
        status: 'scheduled',
        agenda: [],
        outcome: '',
        nextSteps: []
      });
      setNewSessionOpen(false);
      setEditingSession(null);

      toast({
        title: editingSession ? 'Session Updated' : 'Session Scheduled',
        description: editingSession ? 'Session has been successfully updated.' : 'New counseling session has been scheduled successfully.'
      });
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: 'Error',
        description: 'Failed to save session. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteActivity = (id: string, participants: string[]) => {
    setItemToDelete({ id, type: 'activity', participants });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteSession = (id: string, participants: string[]) => {
    setItemToDelete({ id, type: 'session', participants });
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete || !schoolPath || !teacherId) return;

    try {
      const collectionName = itemToDelete.type === 'activity' ? 'activities' : 'sessions';

      // 1. Delete from teacher's collection
      const teacherCollPath = `${schoolPath}/teachers/${teacherId}/${collectionName}`;
      await deleteDoc(doc(db, teacherCollPath, itemToDelete.id));

      // 2. Delete from each student's collection
      for (const studentId of itemToDelete.participants) {
        const studentCollPath = `${schoolPath}/students/${studentId}/${collectionName}`;
        const q = query(collection(db, studentCollPath), where('teacherRef', '==', itemToDelete.id));
        const querySnapshot = await getDocs(q);

        for (const docSnap of querySnapshot.docs) {
          await deleteDoc(docSnap.ref);
        }
      }

      toast({
        title: `${itemToDelete.type === 'activity' ? 'Activity' : 'Session'} Deleted`,
        description: `The ${itemToDelete.type} has been successfully removed from all records.`,
      });
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error);
      toast({
        title: "Error",
        description: `Failed to delete ${itemToDelete.type} from all records.`,
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleUpdateStatus = async (item: TeacherActivity | TeacherSession, newStatus: string, type: 'activity' | 'session') => {
    if (!schoolPath || !teacherId) return;

    try {
      const collectionName = type === 'activity' ? 'activities' : 'sessions';
      const teacherItemPath = `${schoolPath}/teachers/${teacherId}/${collectionName}/${item.id}`;

      // Update in teacher's collection
      await updateDoc(doc(db, teacherItemPath), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Update in each student's collection
      for (const studentId of item.participants) {
        const studentCollPath = `${schoolPath}/students/${studentId}/${collectionName}`;
        const q = query(collection(db, studentCollPath), where('teacherRef', '==', item.id));
        const querySnapshot = await getDocs(q);

        for (const docSnap of querySnapshot.docs) {
          await updateDoc(docSnap.ref, {
            status: newStatus,
            updatedAt: serverTimestamp()
          });
        }
      }

      toast({
        title: 'Status Updated',
        description: `The ${type} has been marked as ${newStatus}.`
      });
    } catch (error) {
      console.error(`Error updating ${type} status:`, error);
      toast({
        title: 'Error',
        description: `Failed to update ${type} status.`,
        variant: 'destructive'
      });
    }
  };

  const isPastDue = (item: TeacherActivity | TeacherSession) => {
    if (item.status === 'completed' || item.status === 'cancelled' || item.status === 'missed') return false;
    const end = new Date(new Date(item.scheduledDate).getTime() + (item.duration || 0) * 60000);
    return new Date() > end;
  };

  const handleEditActivity = (activity: TeacherActivity) => {
    setEditingActivity(activity);
    setActivityForm({
      title: activity.title,
      type: activity.type,
      status: activity.status,
      description: activity.description,
      scheduledDate: activity.scheduledDate.slice(0, 16),
      duration: activity.duration,
      participants: activity.participants,
      objectives: activity.objectives || [],
      facilitator: activity.facilitator,
      location: activity.location,
      notes: activity.notes || ''
    });
    setActivityObjective(activity.objectives?.[0] || '');
    setNewActivityOpen(true);
  };

  const handleEditSession = (session: TeacherSession) => {
    setEditingSession(session);
    setSessionForm({
      title: session.title,
      type: session.type,
      scheduledDate: session.scheduledDate.slice(0, 16),
      duration: session.duration,
      participants: session.participants,
      status: session.status,
      agenda: session.agenda,
      outcome: session.outcome || '',
      nextSteps: session.nextSteps || []
    });
    setNewSessionOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'active':
      case 'in-progress': return 'destructive'; // Make it pop when it's live
      case 'completed': return 'secondary';
      case 'cancelled':
      case 'missed': return 'destructive';
      default: return 'outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mindfulness': return 'bg-blue-100 text-blue-800';
      case 'gratitude-practice': return 'bg-yellow-100 text-yellow-800';
      case 'emotional-expression': return 'bg-pink-100 text-pink-800';
      case 'stress-relief': return 'bg-blue-100 text-blue-800';
      case 'self-awareness': return 'bg-indigo-100 text-indigo-800';
      case 'social-skills': return 'bg-green-100 text-green-800';
      case 'assessment': return 'bg-emerald-100 text-emerald-800';
      case 'workshop': return 'bg-orange-100 text-orange-800';
      case 'counseling': return 'bg-red-100 text-red-800';
      case 'individual': return 'bg-blue-100 text-blue-800';
      case 'small-group': return 'bg-teal-100 text-teal-800';
      case 'parent-teacher': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 w-full overflow-x-hidden overflow-y-auto bg-[#FAFAFA] bg-[radial-gradient(at_0%_0%,rgba(59,130,246,0.03)_0,transparent_50%),radial-gradient(at_100%_0%,rgba(16,185,129,0.03)_0,transparent_50%)] px-4 md:px-10 py-10 font-sans">
      <div className="max-w-[1400px] mx-auto w-full space-y-12">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Activities & Sessions</h1>
            <p className="text-muted-foreground">Plan and manage student activities and counseling sessions</p>
          </div>
        <div className="relative" ref={dropdownRef}>
          <Button
            className="text-white"
            onClick={() => setShowActions(!showActions)}
            aria-expanded={showActions}
            aria-haspopup="true"
          >
            <Plus className="h-4 w-4 mr-2" />
            Activities / Sessions
          </Button>

          {showActions && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              <div className="py-1" role="none">
                <button
                  onClick={() => {
                    setNewActivityOpen(true);
                    setShowActions(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  <div className="flex items-center">
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    <span>Plan Activity</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setNewSessionOpen(true);
                    setShowActions(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Schedule Session</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          <Dialog open={newActivityOpen} onOpenChange={(open) => {
            setNewActivityOpen(open);
            if (!open) {
              setEditingActivity(null);
              // Reset form
              setActivityForm({
                title: '',
                type: 'mindfulness',
                status: 'scheduled',
                description: '',
                scheduledDate: new Date().toISOString().slice(0, 16),
                duration: 30,
                participants: [],
                objectives: [],
                facilitator: teacherName,
                location: 'Classroom',
                notes: ''
              });
              setActivityObjective('');
            }
          }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingActivity ? 'Edit Activity' : 'Plan New Activity'}</DialogTitle>
                <DialogDescription>
                  {editingActivity ? 'Update the details of this activity' : 'Create a new wellbeing or educational activity'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleActivitySubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Activity Title</label>
                    <Input
                      placeholder="e.g., Mindfulness Session"
                      className="mt-1"
                      value={activityForm.title}
                      onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Activity Type</label>
                      <select
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                        value={activityForm.type}
                        onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value as TeacherActivity['type'] })}
                        required
                      >
                        <option value="mindfulness">Mindfulness</option>
                        <option value="gratitude-practice">Gratitude Practice</option>
                        <option value="emotional-expression">Emotional Expression</option>
                        <option value="stress-relief">Stress Relief</option>
                        <option value="self-awareness">Self-Awareness</option>
                        <option value="social-skills">Social Skills</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Duration (minutes)</label>
                      <Input
                        type="number"
                        placeholder="45"
                        className="mt-1"
                        value={activityForm.duration}
                        onChange={(e) => setActivityForm({ ...activityForm, duration: parseInt(e.target.value) || 0 })}
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  {/* Date & Time and Participants side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                      <label className="text-sm font-medium">Date </label>
                      <div className="relative mt-1">
                        <Input
                          ref={activityDateRef}
                          type="date"
                          className="pr-10 appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                          value={activityForm.scheduledDate.slice(0, 10)}
                          onChange={(e) => {
                            const datePart = e.target.value || new Date().toISOString().slice(0, 10);
                            const timePart = (activityForm.scheduledDate || new Date().toISOString().slice(0, 16)).slice(11, 16) || '09:00';
                            setActivityForm({
                              ...activityForm,
                              scheduledDate: `${datePart}T${timePart}`
                            });
                          }}
                          required
                        />
                        <button
                          type="button"
                          aria-label="Open date picker"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => (activityDateRef.current as any)?.showPicker?.()}
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2">
                        <label className="text-sm font-medium">Time</label>
                        <div className="relative mt-1">
                          <Input
                            type="text"
                            className="pr-12"
                            placeholder="hh:mm AM/PM"
                            value={activityTime}
                            onChange={(e) => setActivityTime(e.target.value)}
                            onBlur={() => {
                              const current = (activityForm.scheduledDate || '').slice(11, 16) || '09:00';
                              const next24 = parse12hTo24(activityTime, current);
                              const datePart = activityForm.scheduledDate.slice(0, 10);
                              setActivityForm({
                                ...activityForm,
                                scheduledDate: `${datePart}T${next24}`
                              });
                            }}
                            required
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                <Clock className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-72 p-3">
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-medium">
                                  {(() => {
                                    const t = (activityForm.scheduledDate || '').slice(11, 16) || '09:00';
                                    return formatTo12h(t);
                                  })()}
                                </div>
                                <div className="flex items-center gap-2">
                                  {(() => {
                                    const t = (activityForm.scheduledDate || '').slice(11, 16) || '09:00';
                                    const h = parseInt(t.slice(0, 2), 10);
                                    const isPM = h >= 12;
                                    return (
                                      <>
                                        <button type="button" className={`px-2 py-0.5 rounded text-xs ${!isPM ? 'bg-accent' : 'text-muted-foreground'}`} onClick={(e) => {
                                          e.stopPropagation();
                                          if (h >= 12) {
                                            const newH = (h === 12 ? 0 : h - 12);
                                            const mm = t.slice(3, 5);
                                            const datePart = activityForm.scheduledDate.slice(0, 10);
                                            const value = `${newH.toString().padStart(2, '0')}:${mm}`;
                                            setActivityForm({ ...activityForm, scheduledDate: `${datePart}T${value}` });
                                            setActivityTime(formatTo12h(value));
                                          }
                                        }}>AM</button>
                                        <button type="button" className={`px-2 py-0.5 rounded text-xs ${isPM ? 'bg-accent' : 'text-muted-foreground'}`} onClick={(e) => {
                                          e.stopPropagation();
                                          if (h < 12) {
                                            const newH = (h === 12 ? 12 : h + 12);
                                            const mm = t.slice(3, 5);
                                            const datePart = activityForm.scheduledDate.slice(0, 10);
                                            const value = `${newH.toString().padStart(2, '0')}:${mm}`;
                                            setActivityForm({ ...activityForm, scheduledDate: `${datePart}T${value}` });
                                            setActivityTime(formatTo12h(value));
                                          }
                                        }}>PM</button>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                              <div className="flex items-center justify-center gap-3 mb-2">
                                <button type="button" className={`text-xs px-2 py-0.5 rounded ${activityClockMode === 'hour' ? 'bg-accent' : 'text-muted-foreground'}`} onClick={(e) => { e.stopPropagation(); setActivityClockMode('hour'); }}>Hour</button>
                                <button type="button" className={`text-xs px-2 py-0.5 rounded ${activityClockMode === 'minute' ? 'bg-accent' : 'text-muted-foreground'}`} onClick={(e) => { e.stopPropagation(); setActivityClockMode('minute'); }}>Minute</button>
                              </div>
                              <div className="relative" style={{ width: 240, height: 240 }} onClick={(e) => e.stopPropagation()}>
                                <div className="absolute inset-0 rounded-full border flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-foreground rounded-full z-20" />
                                </div>
                                {activityClockMode === 'hour' && (() => {
                                  const t = (activityForm.scheduledDate || '').slice(11, 16) || '09:00';
                                  const curH = parseInt(t.slice(0, 2), 10);
                                  const cur12 = ((curH % 12) || 12);
                                  const angle = (cur12 % 12) * 30;
                                  const hand = polar(28, angle);
                                  const center = { x: 50, y: 50 };
                                  return (
                                    <>
                                      <svg className="absolute inset-0 pointer-events-none text-foreground z-10" viewBox="0 0 100 100">
                                        <line x1={center.x} y1={center.y} x2={hand.x} y2={hand.y} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                        <circle cx={center.x} cy={center.y} r="2.5" fill="currentColor" />
                                        <circle cx={hand.x} cy={hand.y} r="1" fill="currentColor" />
                                      </svg>
                                      {hourPositions.map(({ i, label, left, top }) => (
                                        <button
                                          key={i}
                                          type="button"
                                          className={`absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full text-sm ${label === cur12 ? 'bg-accent' : 'hover:bg-accent'}`}
                                          style={{ left: `${left}%`, top: `${top}%` }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const current = (activityForm.scheduledDate || '').slice(11, 16) || '09:00';
                                            const [curH, curM] = current.split(':').map(Number);
                                            const period = curH >= 12 ? 'PM' : 'AM';
                                            let h = label % 12;
                                            if (period === 'PM') h = (h % 12) + 12;
                                            if (period === 'AM' && label === 12) h = 0;
                                            const hh = h.toString().padStart(2, '0');
                                            const mm = curM.toString().padStart(2, '0');
                                            const datePart = activityForm.scheduledDate.slice(0, 10);
                                            const value = `${hh}:${mm}`;
                                            setActivityForm({ ...activityForm, scheduledDate: `${datePart}T${value}` });
                                            setActivityTime(formatTo12h(value));
                                            setActivityClockMode('minute');
                                          }}
                                        >{label}</button>
                                      ))}
                                    </>
                                  );
                                })()}
                                {activityClockMode === 'minute' && (() => {
                                  const t = (activityForm.scheduledDate || '').slice(11, 16) || '09:00';
                                  const curM = parseInt(t.slice(3, 5), 10);
                                  const angle = Math.round(curM / 5) * 30;
                                  const hand = polar(35, angle);
                                  const center = { x: 50, y: 50 };
                                  return (
                                    <>
                                      <svg className="absolute inset-0 pointer-events-none text-foreground z-10" viewBox="0 0 100 100">
                                        <line x1={center.x} y1={center.y} x2={hand.x} y2={hand.y} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                        <circle cx={center.x} cy={center.y} r="2.5" fill="currentColor" />
                                        <circle cx={hand.x} cy={hand.y} r="0.8" fill="currentColor" />
                                      </svg>
                                      {minutePositions.map(({ idx, minutes, left, top }) => (
                                        <button
                                          key={idx}
                                          type="button"
                                          className={`absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full text-xs ${minutes === curM ? 'bg-accent' : 'hover:bg-accent'}`}
                                          style={{ left: `${left}%`, top: `${top}%` }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const current = (activityForm.scheduledDate || '').slice(11, 16) || '09:00';
                                            let [curH] = current.split(':').map(Number);
                                            const mm = minutes.toString().padStart(2, '0');
                                            const hh = curH.toString().padStart(2, '0');
                                            const datePart = activityForm.scheduledDate.slice(0, 10);
                                            const value = `${hh}:${mm}`;
                                            setActivityForm({ ...activityForm, scheduledDate: `${datePart}T${value}` });
                                            setActivityTime(formatTo12h(value));
                                          }}
                                        >{minutes.toString().padStart(2, '0')}</button>
                                      ))}
                                    </>
                                  );
                                })()}
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Participants</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="justify-between w-full">
                            <span>
                              {activityForm.participants.length > 0
                                ? `${activityForm.participants.length} selected`
                                : 'Select students'}
                            </span>
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-80 p-2">
                          <div className="space-y-2 mb-2">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                              <Input
                                placeholder="Search students..."
                                className="pl-8 h-8 text-sm"
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="flex items-center justify-between px-2 py-1.5 border-b">
                              <div className="text-sm text-muted-foreground">Select students</div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="select-all-activity-students"
                                  checked={activityForm.participants.length === students.length && students.length > 0}
                                  onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    setActivityForm(prev => ({
                                      ...prev,
                                      participants: isChecked ? students.map(s => s.uid) : []
                                    }));
                                  }}
                                  className="h-4 w-4 text-primary-600 rounded"
                                />
                                <label htmlFor="select-all-activity-students" className="text-xs cursor-pointer">Select All</label>
                              </div>
                            </div>
                          </div>
                          <div className="max-h-64 overflow-y-auto pr-1">
                            {students
                              .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || (s.class && s.class.toLowerCase().includes(studentSearch.toLowerCase())))
                              .map((student) => (
                                <div key={student.uid} className="flex items-center space-x-2 p-1 rounded hover:bg-accent/50">
                                  <input
                                    type="checkbox"
                                    id={`activity-student-${student.uid}`}
                                    checked={activityForm.participants.includes(student.uid)}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      setActivityForm(prev => ({
                                        ...prev,
                                        participants: isChecked
                                          ? [...prev.participants, student.uid]
                                          : prev.participants.filter(id => id !== student.uid)
                                      }));
                                    }}
                                    className="h-4 w-4 text-primary-600 rounded"
                                  />
                                  <label htmlFor={`activity-student-${student.uid}`} className="text-sm">
                                    {student.name} (Grade: {student.class})
                                  </label>
                                </div>
                              ))}
                          </div>
                          <div className="px-2 pt-2 text-xs text-muted-foreground">
                            Selected: {activityForm.participants.length}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Learning Objective (Optional)</label>
                    <Textarea
                      placeholder="What students should gain from this"
                      className="mt-1 h-20"
                      value={activityObjective}
                      onChange={(e) => setActivityObjective(e.target.value)}
                    />
                  </div>



                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1 text-white">
                      {editingActivity ? 'Update Activity' : 'Create Activity'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setNewActivityOpen(false);
                      setEditingActivity(null);
                    }}>Cancel</Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={newSessionOpen} onOpenChange={(open) => {
            setNewSessionOpen(open);
            if (!open) {
              setEditingSession(null);
              setSessionForm({
                title: '',
                type: 'individual',
                scheduledDate: new Date().toISOString().slice(0, 16),
                duration: 30,
                participants: [],
                status: 'scheduled',
                agenda: [],
                outcome: '',
                nextSteps: []
              });
            }
          }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingSession ? 'Edit Session' : 'Schedule New Session'}</DialogTitle>
                <DialogDescription>
                  {editingSession ? 'Update session details' : 'Schedule a counseling session or meeting'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSessionSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Session Title</label>
                    <Input
                      placeholder="e.g., Individual Counseling - Student Name"
                      className="mt-1"
                      value={sessionForm.title}
                      onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Session Type</label>
                      <select
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                        value={sessionForm.type}
                        onChange={(e) => setSessionForm({ ...sessionForm, type: e.target.value as TeacherSession['type'] })}
                        required
                      >
                        <option value="individual">Individual</option>
                        <option value="small-group">Small Group</option>
                        <option value="parent-teacher">Parent-Teacher Meeting</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Duration (minutes)</label>
                      <Input
                        type="number"
                        placeholder="30"
                        className="mt-1"
                        value={sessionForm.duration}
                        onChange={(e) => setSessionForm({ ...sessionForm, duration: parseInt(e.target.value) })}
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                      <label className="text-sm font-medium">Date</label>
                      <div className="relative mt-1">
                        <Input
                          ref={sessionDateRef}
                          type="date"
                          className="pr-10 appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                          value={sessionForm.scheduledDate.slice(0, 10)}
                          onChange={(e) => {
                            const datePart = e.target.value || new Date().toISOString().slice(0, 10);
                            const timePart = (sessionForm.scheduledDate || new Date().toISOString().slice(0, 16)).slice(11, 16) || '09:00';
                            setSessionForm({
                              ...sessionForm,
                              scheduledDate: `${datePart}T${timePart}`
                            });
                          }}
                          required
                        />
                        <button
                          type="button"
                          aria-label="Open date picker"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => (sessionDateRef.current as any)?.showPicker?.()}
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2">
                        <label className="text-sm font-medium">Time</label>
                        <div className="relative mt-1">
                          <Input
                            type="text"
                            className="pr-12"
                            placeholder="hh:mm AM/PM"
                            value={sessionTime}
                            onChange={(e) => setSessionTime(e.target.value)}
                            onBlur={() => {
                              const current = (sessionForm.scheduledDate || '').slice(11, 16) || '09:00';
                              const next24 = parse12hTo24(sessionTime, current);
                              const datePart = sessionForm.scheduledDate.slice(0, 10);
                              setSessionForm({
                                ...sessionForm,
                                scheduledDate: `${datePart}T${next24}`
                              });
                            }}
                            required
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                <Clock className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-72 p-3">
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-medium">
                                  {(() => {
                                    const t = (sessionForm.scheduledDate || '').slice(11, 16) || '09:00';
                                    return formatTo12h(t);
                                  })()}
                                </div>
                                <div className="flex items-center gap-2">
                                  {(() => {
                                    const t = (sessionForm.scheduledDate || '').slice(11, 16) || '09:00';
                                    const h = parseInt(t.slice(0, 2), 10);
                                    const isPM = h >= 12;
                                    return (
                                      <>
                                        <button type="button" className={`px-2 py-0.5 rounded text-xs ${!isPM ? 'bg-accent' : 'text-muted-foreground'}`} onClick={(e) => {
                                          e.stopPropagation();
                                          if (h >= 12) {
                                            const newH = (h === 12 ? 0 : h - 12);
                                            const mm = t.slice(3, 5);
                                            const datePart = sessionForm.scheduledDate.slice(0, 10);
                                            const value = `${newH.toString().padStart(2, '0')}:${mm}`;
                                            setSessionForm({ ...sessionForm, scheduledDate: `${datePart}T${value}` });
                                            setSessionTime(formatTo12h(value));
                                          }
                                        }}>AM</button>
                                        <button type="button" className={`px-2 py-0.5 rounded text-xs ${isPM ? 'bg-accent' : 'text-muted-foreground'}`} onClick={(e) => {
                                          e.stopPropagation();
                                          if (h < 12) {
                                            const newH = (h === 12 ? 12 : h + 12);
                                            const mm = t.slice(3, 5);
                                            const datePart = sessionForm.scheduledDate.slice(0, 10);
                                            const value = `${newH.toString().padStart(2, '0')}:${mm}`;
                                            setSessionForm({ ...sessionForm, scheduledDate: `${datePart}T${value}` });
                                            setSessionTime(formatTo12h(value));
                                          }
                                        }}>PM</button>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                              <div className="flex items-center justify-center gap-3 mb-2">
                                <button type="button" className={`text-xs px-2 py-0.5 rounded ${sessionClockMode === 'hour' ? 'bg-accent' : 'text-muted-foreground'}`} onClick={(e) => { e.stopPropagation(); setSessionClockMode('hour'); }}>Hour</button>
                                <button type="button" className={`text-xs px-2 py-0.5 rounded ${sessionClockMode === 'minute' ? 'bg-accent' : 'text-muted-foreground'}`} onClick={(e) => { e.stopPropagation(); setSessionClockMode('minute'); }}>Minute</button>
                              </div>
                              <div className="relative" style={{ width: 240, height: 240 }} onClick={(e) => e.stopPropagation()}>
                                <div className="absolute inset-0 rounded-full border flex items-center justify-center">
                                  <div className="w-1 h-1 bg-foreground rounded-full" />
                                </div>
                                {sessionClockMode === 'hour' && (() => {
                                  const t = (sessionForm.scheduledDate || '').slice(11, 16) || '09:00';
                                  const curH = parseInt(t.slice(0, 2), 10);
                                  const cur12 = ((curH % 12) || 12);
                                  const angle = (cur12 % 12) * 30;
                                  const hand = polar(28, angle);
                                  const center = { x: 50, y: 50 };
                                  return (
                                    <>
                                      <svg className="absolute inset-0 pointer-events-none text-foreground z-10" viewBox="0 0 100 100">
                                        <line x1={center.x} y1={center.y} x2={hand.x} y2={hand.y} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                        <circle cx={center.x} cy={center.y} r="2.5" fill="currentColor" />
                                        <circle cx={hand.x} cy={hand.y} r="1" fill="currentColor" />
                                      </svg>
                                      {hourPositions.map(({ i, label, left, top }) => (
                                        <button
                                          key={i}
                                          type="button"
                                          className={`absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full text-sm ${label === cur12 ? 'bg-accent' : 'hover:bg-accent'}`}
                                          style={{ left: `${left}%`, top: `${top}%` }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const current = (sessionForm.scheduledDate || '').slice(11, 16) || '09:00';
                                            const [curH, curM] = current.split(':').map(Number);
                                            const period = curH >= 12 ? 'PM' : 'AM';
                                            let h = label % 12;
                                            if (period === 'PM') h = (h % 12) + 12;
                                            if (period === 'AM' && label === 12) h = 0;
                                            const hh = h.toString().padStart(2, '0');
                                            const mm = curM.toString().padStart(2, '0');
                                            const datePart = sessionForm.scheduledDate.slice(0, 10);
                                            const value = `${hh}:${mm}`;
                                            setSessionForm({ ...sessionForm, scheduledDate: `${datePart}T${value}` });
                                            setSessionTime(formatTo12h(value));
                                            setSessionClockMode('minute');
                                          }}
                                        >{label}</button>
                                      ))}
                                    </>
                                  );
                                })()}
                                {sessionClockMode === 'minute' && (() => {
                                  const t = (sessionForm.scheduledDate || '').slice(11, 16) || '09:00';
                                  const curM = parseInt(t.slice(3, 5), 10);
                                  const angle = Math.round(curM / 5) * 30;
                                  const hand = polar(35, angle);
                                  const center = { x: 50, y: 50 };
                                  return (
                                    <>
                                      <svg className="absolute inset-0 pointer-events-none text-foreground z-10" viewBox="0 0 100 100">
                                        <line x1={center.x} y1={center.y} x2={hand.x} y2={hand.y} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                        <circle cx={center.x} cy={center.y} r="2.5" fill="currentColor" />
                                        <circle cx={hand.x} cy={hand.y} r="0.8" fill="currentColor" />
                                      </svg>
                                      {minutePositions.map(({ idx, minutes, left, top }) => (
                                        <button
                                          key={idx}
                                          type="button"
                                          className={`absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full text-xs ${minutes === curM ? 'bg-accent' : 'hover:bg-accent'}`}
                                          style={{ left: `${left}%`, top: `${top}%` }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const current = (sessionForm.scheduledDate || '').slice(11, 16) || '09:00';
                                            let [curH] = current.split(':').map(Number);
                                            const mm = minutes.toString().padStart(2, '0');
                                            const hh = curH.toString().padStart(2, '0');
                                            const datePart = sessionForm.scheduledDate.slice(0, 10);
                                            const value = `${hh}:${mm}`;
                                            setSessionForm({ ...sessionForm, scheduledDate: `${datePart}T${value}` });
                                            setSessionTime(formatTo12h(value));
                                          }}
                                        >{minutes.toString().padStart(2, '0')}</button>
                                      ))}
                                    </>
                                  );
                                })()}
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Participants</label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="justify-between w-full">
                            <span>
                              {sessionForm.participants.length > 0
                                ? `${sessionForm.participants.length} selected`
                                : 'Select participants'}
                            </span>
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-80 p-2">
                          <div className="space-y-2 mb-2">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                              <Input
                                placeholder="Search participants..."
                                className="pl-8 h-8 text-sm"
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="flex items-center justify-between px-2 py-1.5 border-b">
                              <div className="text-sm text-muted-foreground">Select participants</div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="select-all-session-participants"
                                  checked={sessionForm.participants.length === students.length && students.length > 0}
                                  onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    setSessionForm(prev => ({
                                      ...prev,
                                      participants: isChecked ? students.map(s => s.uid) : []
                                    }));
                                  }}
                                  className="h-4 w-4 text-primary-600 rounded"
                                />
                                <label htmlFor="select-all-session-participants" className="text-xs cursor-pointer">Select All</label>
                              </div>
                            </div>
                          </div>
                          <div className="max-h-64 overflow-y-auto pr-1">
                            {students
                              .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || (s.class && s.class.toLowerCase().includes(studentSearch.toLowerCase())))
                              .map((student) => (
                                <div key={student.uid} className="flex items-center space-x-2 p-1 rounded hover:bg-accent/50">
                                  <input
                                    type="checkbox"
                                    id={`session-student-${student.uid}`}
                                    checked={sessionForm.participants.includes(student.uid)}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      setSessionForm(prev => ({
                                        ...prev,
                                        participants: isChecked
                                          ? [...prev.participants, student.uid]
                                          : prev.participants.filter(id => id !== student.uid)
                                      }));
                                    }}
                                    className="h-4 w-4 text-primary-600 rounded"
                                  />
                                  <label htmlFor={`session-student-${student.uid}`} className="text-sm">
                                    {student.name} (Grade: {student.class})
                                  </label>
                                </div>
                              ))}
                          </div>
                          <div className="px-2 pt-2 text-xs text-muted-foreground">
                            Selected: {sessionForm.participants.length}
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Agenda / Key Topics</label>
                    <Textarea
                      placeholder="Brief reason or focus area (e.g., anxiety, focus issues, peer conflict)"
                      className="mt-1 h-24"
                      value={sessionForm.agenda.join('\n')}
                      onChange={(e) => setSessionForm({ ...sessionForm, agenda: e.target.value.split('\n').filter(Boolean) })}
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingSession ? 'Update Session' : 'Schedule Session'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setNewSessionOpen(false);
                        setEditingSession(null);
                        // Reset form on cancel
                        setSessionForm({
                          title: '',
                          type: 'individual',
                          scheduledDate: new Date().toISOString().slice(0, 16),
                          duration: 30,
                          participants: [],
                          status: 'scheduled',
                          agenda: [],
                          outcome: '',
                          nextSteps: []
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs
        value={searchParams.get('tab') || 'activities'}
        onValueChange={(value) => setSearchParams({ tab: value })}
        className="space-y-6"
        id="teacher-tour-activities-container"
      >
        <TabsList>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          {!loading && activities.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
              <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                <CalendarPlus className="h-10 w-10 text-blue-500" />
              </div>
              <CardTitle className="text-xl mb-2">No Activities Planned</CardTitle>
              <CardDescription className="max-w-xs mx-auto mb-6">
                You haven't scheduled any wellbeing activities yet. Start by planning a mindfulness session or a workshop for your students.
              </CardDescription>
              <Button onClick={() => setNewActivityOpen(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Plan First Activity
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id} className="hover:shadow-md transition-shadow">
                  {/* ... existing card content ... */}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-blue-500" />
                          {activity.title}
                          <Badge variant={getStatusColor(activity.status)}>
                            {activity.status.toUpperCase()}
                          </Badge>
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(activity.scheduledDate).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {activity.participants.length} participants
                          </div>
                          <span>{activity.duration} minutes</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
                            {activity.type.replace('-', ' ')}
                          </span>
                          <span className="text-sm text-muted-foreground">{activity.location}</span>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditActivity(activity)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteActivity(activity.id, activity.participants)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardDescription>{activity.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Objectives:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {activity.objectives.map((objective, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {activity.notes && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Notes:</h4>
                          <p className="text-sm text-muted-foreground">{activity.notes}</p>
                        </div>
                      )}

                      {/* Status Confirmation Actions */}
                      {isPastDue(activity) && (
                        <div className="pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            This activity is past due. Please confirm:
                          </p>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700 text-white gap-1 flex-1 sm:flex-none"
                              onClick={() => handleUpdateStatus(activity, 'completed', 'activity')}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Done
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 gap-1 flex-1 sm:flex-none"
                              onClick={() => handleUpdateStatus(activity, 'missed', 'activity')}
                            >
                              <XCircle className="h-4 w-4" />
                              Did Not Attend
                            </Button>
                          </div>
                        </div>
                      )}

                      {activity.status === 'missed' && (
                        <div className="pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <p className="text-sm font-medium text-red-600 flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            Students did not attend this activity.
                          </p>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 flex-1 sm:flex-none"
                              onClick={() => handleEditActivity(activity)}
                            >
                              <RotateCw className="h-4 w-4" />
                              Reschedule
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive/20 hover:bg-destructive/5 gap-1 flex-1 sm:flex-none"
                              onClick={() => handleDeleteActivity(activity.id, activity.participants)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          {!loading && sessions.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
              <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
                <Users className="h-10 w-10 text-green-500" />
              </div>
              <CardTitle className="text-xl mb-2">No Sessions Scheduled</CardTitle>
              <CardDescription className="max-w-xs mx-auto mb-6">
                You haven't scheduled any counseling sessions yet. These are ideal for 1-on-1 support or small group discussions.
              </CardDescription>
              <Button onClick={() => setNewSessionOpen(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Schedule First Session
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-green-500" />
                          {session.title}
                          <Badge variant={getStatusColor(session.status)}>
                            {session.status.toUpperCase()}
                          </Badge>
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(session.scheduledDate).toLocaleString()}
                          </div>
                          <span>{session.duration} minutes</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(session.type)}`}>
                          {session.type.replace('-', ' ')}
                        </span>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditSession(session)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteSession(session.id, session.participants)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Participants:</h4>
                        <div className="flex flex-wrap gap-1">
                          {session.participants.map((participantId, index) => {
                            const student = students.find(s => s.uid === participantId);
                            return (
                              <Badge key={index} variant="outline" className="text-xs">
                                {student ? student.name : participantId}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Agenda:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {session.agenda.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Status Confirmation Actions */}
                      {isPastDue(session) && (
                        <div className="pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            This session is past due. Please confirm:
                          </p>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700 text-white gap-1 flex-1 sm:flex-none"
                              onClick={() => handleUpdateStatus(session, 'completed', 'session')}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Done
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 gap-1 flex-1 sm:flex-none"
                              onClick={() => handleUpdateStatus(session, 'missed', 'session')}
                            >
                              <XCircle className="h-4 w-4" />
                              Did Not Attend
                            </Button>
                          </div>
                        </div>
                      )}

                      {session.status === 'missed' && (
                        <div className="pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <p className="text-sm font-medium text-red-600 flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            Students did not attend this session.
                          </p>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 flex-1 sm:flex-none"
                              onClick={() => handleEditSession(session)}
                            >
                              <RotateCw className="h-4 w-4" />
                              Reschedule
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive/20 hover:bg-destructive/5 gap-1 flex-1 sm:flex-none"
                              onClick={() => handleDeleteSession(session.id, session.participants)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {itemToDelete?.type} from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </div>
  );
};