
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentData, onSnapshot, collection, query, orderBy, doc, getDoc, getDocs, where, Timestamp, limit } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/integrations/firebase";
import { getMoodEntries, getCheckIns, getMindfulnessSessions } from "@/services/wellnessService";
import { getAvailableAssessments, getCurrentPhase } from "@/services/assessmentScheduler";
import { getAvailableAssessmentsForStudent, AvailableAssessment } from "@/services/studentAssessmentService";

// Define interfaces for our data models
interface AssessmentResult {
  depression?: number;
  stress?: number;
  anxiety?: number;
  wellbeing?: number;
  [key: string]: any;
}

interface AssessmentData extends DocumentData {
  id: string;
  user_id: string;
  completed_at: Date | { toDate: () => Date };
  score?: number;
  results?: AssessmentResult;
}

interface MindfulnessSession extends DocumentData {
  id: string;
  user_id: string;
  completed_at: Date | { toDate: () => Date };
}

interface CheckIn extends DocumentData {
  id: string;
  user_id: string;
  date: Date | { toDate: () => Date };
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, Heart, Target, Clock, Award, Play, CheckCircle2, Flame, ClipboardList, BookOpen, MessageCircle, Sparkles, ChevronRight, Wind, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";


const DashboardStats = () => {
  const navigate = useNavigate();

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleTakeAssessment = () => {
    navigate('/assessment');
  };

  const handleContactCounselor = () => {
    navigate('/wellness/contact');
  };

  const handleBrowseResources = () => {
    navigate('/resources');
  };

  // Real-time stats state
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>("Student");
  const [overallWellbeing, setOverallWellbeing] = useState<string>("-");
  const [wellbeingProgress, setWellbeingProgress] = useState<number>(0);
  const [engagementScore, setEngagementScore] = useState<string>("-");
  const [engagementProgress, setEngagementProgress] = useState<number>(0);
  const [weeklySessions, setWeeklySessions] = useState<number>(0);
  const [weeklyGoal, setWeeklyGoal] = useState<number>(5);
  const [weeklyProgress, setWeeklyProgress] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [nextAssessmentDays, setNextAssessmentDays] = useState<number | null>(null);
  const [nextAssessmentDate, setNextAssessmentDate] = useState<string | null>(null);
  const [lastActivityTime, setLastActivityTime] = useState<string>("");
  const [scheduledActivities, setScheduledActivities] = useState<any[]>([]);
  const [scheduledSessions, setScheduledSessions] = useState<any[]>([]);
  const [currentPhaseId, setCurrentPhaseId] = useState<number>(1);
  const [availableAssessments, setAvailableAssessments] = useState<AvailableAssessment[]>([]);


  // Icon/color mapping for UI
  const statIcons = { wellbeing: Heart, sessions: Target, streak: TrendingUp, assessment: Calendar };
  const statColors = { wellbeing: "text-[#5D9B7A]", sessions: "text-[#5A92AB]", streak: "text-[#9B8768]", assessment: "text-[#9B7EB0]" };

  // Helper function to safely convert Firestore Timestamp to Date
  const toSafeDate = (dateValue: any): Date => {
    if (!dateValue) return new Date();
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue.toDate === 'function') return dateValue.toDate();
    if (typeof dateValue === 'string' || typeof dateValue === 'number') return new Date(dateValue);
    return new Date();
  };

  // Format relative time
  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // --- Fetch dashboard data with real-time listeners ---
  useEffect(() => {
    if (!user) return;

    const setupRealtimeListeners = async () => {
      try {
        // Get user's name and path information
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        // Set user name
        const name = userData?.demographics?.name || user?.email?.split("@")[0] || "Student";
        setUserName(name);

        if (!userData || !userData.studentId || !userData.parentAdminId || !userData.schoolId) {
          console.log('[DashboardStats] Student data not found or incomplete');
          setOverallWellbeing("N/A");
          setWellbeingProgress(0);
          return;
        }

        const { studentId, parentAdminId, schoolId, organizationId } = userData;

        // FIX: Ensure we use the correct student document ID (Slug) not Auth UID
        // We will query for it to be 100% safe, similar to Assessment.tsx
        let resolvedStudentId = studentId;
        let basePath = '';

        // Verify if studentId looks like a slug (e.g. starts with STU-) or is the Auth UID
        // If it looks like arguably an Auth UID (28 chars, alphanumeric), we might want to double check
        // But for now, we trust userData.studentId IF it was set correctly during creation.
        // To be absolutely safe, let's look up the student doc by studentUserId if possible.

        // Actually, let's use the query pattern which is failsafe
        const studentsCollectionPath = organizationId
          ? `users/${parentAdminId}/organizations/${organizationId}/schools/${schoolId}/students`
          : `users/${parentAdminId}/schools/${schoolId}/students`;

        // Check if we can find the doc by studentUserId
        try {
          const q = query(collection(db, studentsCollectionPath), where("studentUserId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            resolvedStudentId = querySnapshot.docs[0].id;
            basePath = `${studentsCollectionPath}/${resolvedStudentId}`;
          } else {
            // Fallback to what we had, but log warning
            console.warn('[DashboardStats] Could not resolve student slug, using stored ID:', studentId);
            basePath = `${studentsCollectionPath}/${studentId}`;
          }
        } catch (e) {
          console.error("Error resolving student slug in DashboardStats:", e);
          basePath = `${studentsCollectionPath}/${studentId}`;
        }

        // 1. Dynamic Assessment Status
        const studentGrade = userData?.grade || userData?.class || '6';
        const gradeNumber = parseInt(studentGrade);
        const phaseNumber = 1; // Default phase, could be calculated dynamically
        const assessments = await getAvailableAssessments(user.uid, gradeNumber, phaseNumber);

        // 2. Get available assessments based on sequential activation
        const availableAssessmentsList = await getAvailableAssessmentsForStudent(gradeNumber);
        setAvailableAssessments(availableAssessmentsList);

        // Convert assessments object to array for find/filter operations
        const assessmentsArray = [assessments.major, assessments.mini].filter(Boolean);
        
        const available = assessmentsArray.find(a => a && a.available);
        const completed = assessmentsArray.filter(a => a && !a.available).pop();

        if (available) {
          setNextAssessmentDate("Now");
          setNextAssessmentDays(0); // Simplified logic
        } else {
          setNextAssessmentDate("No upcoming assessment");
          setNextAssessmentDays(null);
        }

        // Real-time listener for results still needed for the progress bar
        const assessmentsPath = `${basePath}/assessments`;
        const assessmentsQuery = query(
          collection(db, assessmentsPath),
          orderBy('assessmentDate', 'desc'),
          limit(1)
        );

        const unsubscribeAssessments = onSnapshot(query(collection(db, assessmentsPath), orderBy('assessmentDate', 'desc')), (snapshot) => {
          if (!snapshot.empty) {
            const allAss = snapshot.docs.map(d => d.data());
            const latest = allAss[0];

            // --- Reset Logic: Wellbeing fresh per Phase, Engagement fresh per Assessment ---
            const phase = latest.phaseId || 1;
            setCurrentPhaseId(phase);

            // Engagement is always the literal latest
            const eng = latest.engagementRate || 0;
            setEngagementScore(`${eng}%`);
            setEngagementProgress(eng);

            // Wellbeing is the latest in CURRENT PHASE
            const latestInPhase = allAss.find(a => a.phaseId === phase);
            if (latestInPhase) {
              const wellbeing = Math.round(100 - (latestInPhase.riskPercentage || 0));
              setOverallWellbeing(`${wellbeing}%`);
              setWellbeingProgress(wellbeing);
            }

            const lastDate = toSafeDate(latest.assessmentDate);
            setLastActivityTime(`Assessment completed ${getRelativeTime(lastDate)}`);
          } else {
            setOverallWellbeing("No data");
            setWellbeingProgress(0);
            setEngagementScore("No data");
            setEngagementProgress(0);
          }
        });

        // 2. Real-time listener for mindfulness sessions (Weekly Progress)
        const sessionsPath = `${basePath}/mindfulness_sessions`;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const sessionsQuery = query(
          collection(db, sessionsPath),
          where('completed_at', '>=', Timestamp.fromDate(oneWeekAgo)),
          orderBy('completed_at', 'desc')
        );

        const unsubscribeMindfulnessSessions = onSnapshot(sessionsQuery, (snapshot) => {
          const sessionCount = snapshot.size;
          setWeeklySessions(sessionCount);
          setWeeklyProgress(Math.min(100, (sessionCount / weeklyGoal) * 100));

          // Set last activity if sessions exist
          if (snapshot.docs.length > 0) {
            const latestSession = snapshot.docs[0].data();
            if (latestSession.completed_at) {
              const sessionDate = latestSession.completed_at.toDate();
              setLastActivityTime(`Mindfulness session ${getRelativeTime(sessionDate)}`);
            }
          }
        }, (error) => {
          console.error('[DashboardStats] Error listening to sessions:', error);
          // If error (likely no index), fall back to fetching all and filtering
          getMindfulnessSessions({ userId: user.uid }).then(sessions => {
            const recentSessions = sessions.filter(s => {
              const sessionDate = s.completed_at instanceof Date ? s.completed_at : new Date(s.completed_at);
              return sessionDate >= oneWeekAgo;
            });
            setWeeklySessions(recentSessions.length);
            setWeeklyProgress(Math.min(100, (recentSessions.length / weeklyGoal) * 100));
          }).catch(() => {
            setWeeklySessions(0);
            setWeeklyProgress(0);
          });
        });

        // 3. Real-time listener for mood entries (Streak calculation)
        const moodEntriesPath = `${basePath}/mood_entries`;
        const moodEntriesQuery = query(
          collection(db, moodEntriesPath),
          orderBy('created_at', 'desc')
        );

        const unsubscribeMoods = onSnapshot(moodEntriesQuery, (snapshot) => {
          const moodEntries = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            created_at: doc.data().created_at?.toDate()
          }));

          if (moodEntries.length === 0) {
            setStreak(0);
            return;
          }



          // Calculate streak from mood entries
          let currentStreak = 0;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let lastDate: Date | null = null;

          for (const entry of moodEntries) {
            if (!entry.created_at) continue;

            const entryDate = new Date(entry.created_at);
            entryDate.setHours(0, 0, 0, 0);

            if (entryDate > today) continue;

            if (!lastDate) {
              const diffDays = Math.ceil((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
              if (diffDays === 0 || diffDays === 1) {
                currentStreak = 1;
                lastDate = entryDate;
              } else {
                break;
              }
            } else {
              const diffDays = Math.ceil((lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
              if (diffDays === 1) {
                currentStreak++;
                lastDate = entryDate;
              } else if (diffDays > 1) {
                break;
              }
            }
          }

          setStreak(currentStreak);
        }, (error) => {
          console.error('[DashboardStats] Error listening to mood entries:', error);
        });

        // 4. Real-time listener for student activities
        const studentActivitiesPath = `${basePath}/activities`;
        const activitiesQuery = query(
          collection(db, studentActivitiesPath),
          where('status', 'in', ['scheduled', 'active']),
          orderBy('scheduledDate', 'asc')
        );

        const unsubscribeActivities = onSnapshot(activitiesQuery, (snapshot) => {
          const activities = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setScheduledActivities(activities);
        }, (error) => {
          console.error('[DashboardStats] Error listening to activities:', error);
          // Fallback if no index
          getDocs(query(collection(db, studentActivitiesPath))).then(snap => {
            const filtered = snap.docs
              .map(doc => ({ id: doc.id, ...doc.data() } as any))
              .filter(a => ['scheduled', 'active'].includes(a.status))
              .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
            setScheduledActivities(filtered);
          }).catch(() => { });
        });

        // 5. Real-time listener for student sessions
        const studentSessionsPath = `${basePath}/sessions`;
        const counsellingSessionsQuery = query(
          collection(db, studentSessionsPath),
          where('status', 'in', ['scheduled', 'in-progress']),
          orderBy('scheduledDate', 'asc')
        );

        const unsubscribeCounselingSessions = onSnapshot(counsellingSessionsQuery, (snapshot) => {
          const sessions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setScheduledSessions(sessions);
        }, (error) => {
          console.error('[DashboardStats] Error listening to sessions:', error);
          // Fallback if no index
          getDocs(query(collection(db, studentSessionsPath))).then(snap => {
            const filtered = snap.docs
              .map(doc => ({ id: doc.id, ...doc.data() } as any))
              .filter(s => ['scheduled', 'in-progress'].includes(s.status))
              .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
            setScheduledSessions(filtered);
          }).catch(() => { });
        });

        // Cleanup function to unsubscribe from all listeners
        return () => {
          unsubscribeAssessments();
          unsubscribeMindfulnessSessions();
          unsubscribeMoods();
          unsubscribeActivities();
          unsubscribeCounselingSessions();
        };

      } catch (error) {
        console.error('[DashboardStats] Error setting up real-time listeners:', error);
      }
    };

    const unsubscribePromise = setupRealtimeListeners();

    return () => {
      unsubscribePromise.then(cleanup => cleanup && cleanup());
    };
  }, [user, weeklyGoal]);

  // Get streak encouragement message
  const getStreakMessage = () => {
    if (streak === 0) return "Start your streak today! ";
    if (streak === 1) return "Great start! Keep it going! ";
    if (streak < 7) return `${streak} days strong! You're building a habit! `;
    if (streak < 14) return `Amazing! ${streak} days in a row! `;
    if (streak < 30) return `Incredible! ${streak} day streak! You're unstoppable! `;
    return `Wow! ${streak} days! You're an inspiration! `;
  };

  // Get wellbeing encouragement
  const getWellbeingMessage = () => {
    const score = parseInt(overallWellbeing);
    if (isNaN(score)) return "Complete an assessment to track your progress";
    if (score >= 80) return "You're doing great! Keep it up! ";
    if (score >= 60) return "You're making progress! Stay consistent! ";
    if (score >= 40) return "Keep going! Small steps matter! ";
    return "We're here to support you. Reach out anytime! ";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section - Modern Hero Style */}
      <div id="onboarding-welcome" className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 rounded-full -mr-24 -mt-24 opacity-50"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
            {getGreeting()}, <span className="text-teal-600 relative">
              {userName}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">


              </span>
            </span>!
          </h1>
          <p className="text-base text-gray-600 font-medium">Here's your personalized wellness overview for today</p>
          {lastActivityTime && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-xs font-semibold border border-teal-200">
              <Clock className="h-3.5 w-3.5" />
              {lastActivityTime}
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid - Vibrant Cards with Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Overall Wellbeing - Teal Theme */}
        <Card id="onboarding-wellbeing" className="group relative overflow-hidden bg-white border-2 border-teal-100 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100 rounded-full -mr-16 -mt-16 opacity-40 group-hover:scale-150 transition-transform duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">Phase Wellbeing</CardTitle>
              <div className="mt-1.5 inline-block px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-bold rounded-md uppercase">Fresh for Phase {currentPhaseId}</div>
            </div>
            <div className="p-2.5 bg-teal-100 rounded-xl group-hover:bg-teal-200 transition-colors duration-300 group-hover:rotate-6">
              <Heart className="h-5 w-5 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-gray-900 mb-1.5">{overallWellbeing}</div>
            <p className="text-sm text-teal-600 font-semibold mb-3">{getWellbeingMessage()}</p>
            <Progress value={wellbeingProgress} className="h-2.5 rounded-full" indicatorColor="bg-gradient-to-r from-teal-500 to-teal-600" />
            <p className="text-[10px] text-gray-400 mt-2.5 font-bold uppercase tracking-widest">Resets every Phase cycle</p>
          </CardContent>
        </Card>

        {/* Classroom Engagement - Indigo Theme */}
        <Card className="group relative overflow-hidden bg-white border-2 border-indigo-100 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full -mr-16 -mt-16 opacity-40 group-hover:scale-150 transition-transform duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">Live Engagement</CardTitle>
              <div className="mt-1.5 inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-md">CLASSROOM EFFORT</div>
            </div>
            <div className="p-2.5 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors duration-300 group-hover:rotate-6">
              <Target className="h-5 w-5 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-gray-900 mb-1.5">{engagementScore}</div>
            <p className="text-sm text-indigo-600 font-semibold mb-3">Your energy in the current assessment</p>
            <Progress value={engagementProgress} className="h-2.5 rounded-full" indicatorColor="bg-gradient-to-r from-indigo-500 to-indigo-600" />
            <p className="text-[10px] text-gray-400 mt-2.5 font-bold uppercase tracking-widest">Updates every Assessment (Major & Mini)</p>
          </CardContent>
        </Card>

        {/* Current Streak - Coral/Orange Theme */}
        <Card id="onboarding-streak" className="group relative overflow-hidden bg-white border-2 border-orange-100 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full -mr-16 -mt-16 opacity-40 group-hover:scale-150 transition-transform duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">Current Streak</CardTitle>
              {streak > 0 && <div className="mt-1.5 inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-md animate-pulse">ON FIRE</div>}
            </div>
            <div className="p-2.5 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors duration-300 group-hover:rotate-6">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-gray-900 mb-1.5">{streak} <span className="text-lg text-gray-500 font-bold">days</span></div>
            <p className="text-sm text-orange-600 font-semibold mb-3">{getStreakMessage()}</p>
            {streak === 0 ? (
              <Button
                onClick={() => navigate('/wellness/mood')}
                className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm"
              >
                Start your streak today!
              </Button>
            ) : (
              <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-xs text-green-700 font-semibold">Keep the momentum going!</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Progress - Blue Theme */}
        <Card className="group relative overflow-hidden bg-white border-2 border-blue-100 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-40 group-hover:scale-150 transition-transform duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">Weekly Progress</CardTitle>
              <div className="mt-1.5 inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md">{Math.round(weeklyProgress)}% COMPLETE</div>
            </div>
            <div className="p-2.5 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-300 group-hover:rotate-6">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-gray-900 mb-1.5">{weeklySessions}<span className="text-lg text-gray-500 font-bold">/{weeklyGoal}</span></div>
            <p className="text-sm text-gray-600 font-semibold mb-3">Mindfulness sessions this week</p>
            <Progress value={weeklyProgress} className="h-2.5 rounded-full" indicatorColor="bg-gradient-to-r from-blue-500 to-blue-600" />
            {weeklySessions >= weeklyGoal && (
              <div className="flex items-center gap-2 mt-2.5 px-3 py-2 bg-green-50 rounded-xl border border-green-200">
                <Award className="h-4 w-4 text-green-600" />
                <span className="text-xs text-green-700 font-semibold">Weekly goal achieved! 🎉</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Assessment - Amber Theme */}
        <Card className="group relative overflow-hidden bg-white border-2 border-amber-100 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full -mr-16 -mt-16 opacity-40 group-hover:scale-150 transition-transform duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">Next Assessment</CardTitle>
              {nextAssessmentDays !== null && nextAssessmentDays <= 7 && (
                <div className="mt-1.5 inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md animate-pulse">⏰ UPCOMING</div>
              )}
            </div>
            <div className="p-2.5 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors duration-300 group-hover:rotate-6">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-xl font-black text-gray-900 mb-1.5">{nextAssessmentDate || "Schedule now"}</div>
            <p className="text-sm text-gray-600 font-semibold mb-3">
              {nextAssessmentDays !== null
                ? `Due in ${nextAssessmentDays} days`
                : "No upcoming assessment scheduled"}
            </p>
            {nextAssessmentDays !== null && nextAssessmentDays <= 3 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold border border-amber-200">
                <span className="h-2 w-2 bg-amber-500 rounded-full animate-pulse"></span>
                Coming up soon!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Assessments - Sequential Activation */}
        {availableAssessments.length > 0 && (
          <Card className="group relative overflow-hidden bg-white border-2 border-blue-100 shadow-lg hover:shadow-2xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-40 group-hover:scale-150 transition-transform duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">Available Assessments</CardTitle>
                <div className="mt-1.5 inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md">
                  {availableAssessments.filter(a => a.isAvailable && !a.isCompleted).length} Ready
                </div>
              </div>
              <div className="p-2.5 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-300">
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3">
                {availableAssessments.slice(0, 3).map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-sm text-slate-900">{assessment.name}</h5>
                        <Badge variant="outline" className="text-xs">{assessment.type}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{assessment.questions} questions</span>
                        <span>•</span>
                        <span>{assessment.phaseName}</span>
                      </div>
                      {assessment.sections && assessment.sections.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                            <span>Progress</span>
                            <span className="font-medium">{Math.round(assessment.progress)}%</span>
                          </div>
                          <Progress value={assessment.progress} className="h-1.5" indicatorColor="bg-blue-500" />
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      {assessment.isAvailable && !assessment.isCompleted ? (
                        <Button size="sm" onClick={handleTakeAssessment} className="bg-blue-600 hover:bg-blue-700 text-white">
                          Start
                        </Button>
                      ) : assessment.isCompleted ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-xs font-medium">Done</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-xs font-medium">Locked</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {availableAssessments.length > 3 && (
                <div className="mt-3 text-center">
                  <Button variant="ghost" size="sm" onClick={handleTakeAssessment} className="text-blue-600 hover:text-blue-700">
                    View All ({availableAssessments.length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Activities & Sessions Section - Premium Unified View */}
      {(scheduledActivities.length > 0 || scheduledSessions.length > 0) && (
        <Card className="group relative overflow-hidden bg-white border-2 border-indigo-100 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
          <CardHeader className="relative z-10 border-b border-indigo-50/50 pb-4 bg-indigo-50/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">

                <div>
                  <CardTitle className="text-xl font-black text-gray-900 tracking-tight">Activities & Sessions</CardTitle>
                  <CardDescription className="text-sm text-indigo-600/70 font-bold uppercase tracking-wider mt-0.5">Your Wellness Schedule</CardDescription>
                </div>
              </div>
              <Badge className="bg-indigo-600 text-white border-none px-3 py-1 text-xs font-black rounded-full shadow-lg shadow-indigo-200">
                {scheduledActivities.length + scheduledSessions.length} UPCOMING
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 p-0">
            <div className="divide-y divide-indigo-50/50">
              {[...scheduledActivities.map(a => ({ ...a, itemType: 'activity' })),
              ...scheduledSessions.map(s => ({ ...s, itemType: 'session' }))]
                .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                .map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-5 transition-all duration-300 cursor-default"
                  >
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 transition-colors uppercase text-sm tracking-tight">{item.title}</h4>
                        <Badge variant="outline" className={`text-[10px] font-black px-1.5 py-0 border ${item.itemType === 'activity' ? 'text-blue-600 border-blue-200' : 'text-rose-600 border-rose-200'
                          }`}>
                          {item.itemType}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-500 font-bold">
                        <div className="flex items-center gap-1.5 text-indigo-600/80 bg-indigo-50/50 px-2 py-0.5 rounded-md">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(item.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100/50 px-2 py-0.5 rounded-md">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(item.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-right">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${item.status === 'active' || item.status === 'in-progress'
                        ? 'bg-emerald-500 text-white shadow-emerald-200 animate-pulse'
                        : 'bg-slate-100 text-slate-600 shadow-slate-200'
                        }`}>
                        {item.status === 'in-progress' ? 'LIVE NOW' : item.status === 'active' ? 'ACTIVE' : 'SCHEDULED'}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </CardContent>
          <div className="p-4 bg-indigo-50/20 border-t border-indigo-50 text-center">
            <p className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">Remember to stay on time for your sessions </p>
          </div>
        </Card>
      )}

      {/* Step 0: The Discovery Phase - Premium Onboarding Roadmap */}
      {overallWellbeing === "No data" && (
        <Card className="relative overflow-hidden bg-white border-2 border-indigo-100 shadow-2xl rounded-[40px] mb-8 group hover:scale-[1.01] transition-all duration-500">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full -mr-48 -mt-48 opacity-60 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-50 rounded-full -ml-32 -mb-32 opacity-60 group-hover:scale-110 transition-transform duration-700"></div>

          <CardHeader className="relative z-10 p-10 pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-200">
                  <Sparkles className="h-3 w-3" /> Step 0: Discovery
                </div>
                <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Welcome to your Wellness Journey!</CardTitle>
                <CardDescription className="text-base text-slate-500 font-medium max-w-xl">
                  Before your first official check-in, we recommend spending 3-5 days getting comfortable with your support tools.
                </CardDescription>
              </div>
              <div className="hidden md:block">
                <div className="p-5 bg-white shadow-xl rounded-[32px] border border-slate-100 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-10 w-10 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-xs font-black text-indigo-600 shadow-sm">
                        {i}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 mt-2 text-center uppercase tracking-widest">3 Steps to Baseline</p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-10 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1: Explore Tools */}
              <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 space-y-4 hover:bg-white hover:shadow-xl transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-teal-100 flex items-center justify-center">
                  <Wind className="h-6 w-6 text-teal-600" />
                </div>
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">1. Explore Tools</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Visit the Breath Library or start a Mindful Journal entry to build your wellness toolkit.</p>
                <Button variant="ghost" className="p-0 h-auto text-[10px] font-black text-teal-600 hover:bg-transparent uppercase tracking-widest group/btn" onClick={() => navigate('/wellness-dashboard')}>
                  GO TO LIBRARY <ChevronRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Step 2: Daily Pulse */}
              <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 space-y-4 hover:bg-white hover:shadow-xl transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">2. Check Your Pulse</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Complete your first mood check-in. This helps us understand your natural daily rhythm.</p>
                <Button variant="ghost" className="p-0 h-auto text-[10px] font-black text-orange-600 hover:bg-transparent uppercase tracking-widest group/btn" onClick={() => navigate('/wellness/mood')}>
                  LOG MOOD <ChevronRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Step 3: Meet NOVO */}
              <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 space-y-4 hover:bg-white hover:shadow-xl transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-indigo-600" />
                </div>
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">3. Meet NOVO</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Say hi to NOVO, your personal support assistant who is always here to listen.</p>
                <Button variant="ghost" className="p-0 h-auto text-[10px] font-black text-indigo-600 hover:bg-transparent uppercase tracking-widest group/btn" onClick={() => navigate('/chat')}>
                  START CHAT <ChevronRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            <div className="mt-10 p-6 bg-indigo-50 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-100">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-indigo-200 shadow-sm">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                </div>
                <p className="text-sm font-bold text-indigo-900">Your First Major Assessment (Baseline) will unlock in 4 days.</p>
              </div>
              <Button
                variant="outline"
                className="bg-white border-indigo-200 text-indigo-600 font-black text-[10px] uppercase tracking-widest h-12 px-8 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                onClick={() => navigate('/assessment')}
              >
                View Manifest
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Card id="onboarding-quick-actions" className="bg-white border-2 border-gray-100 shadow-lg overflow-hidden">
        <CardHeader className="bg-gray-50 border-b-2 border-gray-100 pb-4">
          <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
          <CardDescription className="text-sm text-gray-600 font-medium">
            What would you like to do today?
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Take Assessment */}
            <Button
              onClick={handleTakeAssessment}
              className="group relative flex flex-col items-center justify-center h-32 p-5 bg-blue-50 text-gray-900 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-100 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-30 group-hover:scale-150 transition-transform duration-300"></div>
              <div className="relative z-10 bg-blue-500 p-3 rounded-xl mb-2.5 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300 shadow-md">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-base text-gray-900">Take Assessment</span>
              <span className="text-xs text-gray-600 mt-0.5 font-medium">Check your wellbeing</span>
            </Button>

            {/* Resources */}
            <Button
              onClick={handleBrowseResources}
              className="group relative flex flex-col items-center justify-center h-32 p-5 bg-teal-50 text-gray-900 border-2 border-teal-200 hover:border-teal-400 hover:bg-teal-100 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-teal-200 rounded-full -mr-10 -mt-10 opacity-30 group-hover:scale-150 transition-transform duration-300"></div>
              <div className="relative z-10 bg-teal-500 p-3 rounded-xl mb-2.5 group-hover:bg-teal-600 group-hover:scale-110 transition-all duration-300 shadow-md">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-base text-gray-900">Resources</span>
              <span className="text-xs text-gray-600 mt-0.5 font-medium">Browse helpful content</span>
            </Button>

            {/* Get Support */}
            <Button
              onClick={handleContactCounselor}
              className="group relative flex flex-col items-center justify-center h-32 p-5 bg-rose-50 text-gray-900 border-2 border-rose-200 hover:border-rose-400 hover:bg-rose-100 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-rose-200 rounded-full -mr-10 -mt-10 opacity-30 group-hover:scale-150 transition-transform duration-300"></div>
              <div className="relative z-10 bg-rose-500 p-3 rounded-xl mb-2.5 group-hover:bg-rose-600 group-hover:scale-110 transition-all duration-300 shadow-md">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-base text-gray-900">Get Support</span>
              <span className="text-xs text-gray-600 mt-0.5 font-medium">Talk to a counselor</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
