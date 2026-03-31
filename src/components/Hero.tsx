import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeroGallery from "./shared/HeroGallery";
import IncompleteAssessmentAlert from "@/alerts/IncompleteAssessmentAlert";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3, Users, AlertTriangle, TrendingUp, Settings, FileText, Bell, Shield } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../integrations/firebase';
import { doc, getDoc, collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { getIncompleteAssessmentForUser } from '@/services/incompleteAssessmentService';
import { loadEnabledAssessments } from '@/services/assessmentManagementService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import MoodPopup from "./MoodPopup";

// Interfaces for real-time data
interface StudentData {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  grade?: string;
  section?: string;
  riskLevel?: string;
}

interface AssessmentData {
  id: string;
  riskPercentage?: number;
  riskCategory?: string;
  assessmentDate?: any;
  createdAt?: any;
}

const Hero = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [hasIncompleteAssessment, setHasIncompleteAssessment] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [phaseEnabled, setPhaseEnabled] = useState<boolean | null>(null);
  const [showMoodPopup, setShowMoodPopup] = useState(false);
  const isManagement = user?.role === 'management';
  const [schoolData, setSchoolData] = useState({
    name: 'School',
    totalStudents: 0,
    assessmentsCompleted: 0,
    highRiskStudents: 0,
    interventionSuccess: 0,
    completionRate: 0
  });
  const [loadingData, setLoadingData] = useState(true);
  const assessmentUnsubsRef = useRef<Record<string, () => void>>({});
  const assessmentCountsRef = useRef<Record<string, number>>({});
  const highRiskByStudentRef = useRef<Record<string, boolean>>({});
  const studentsRef = useRef<StudentData[]>([]);
  const studentsPathRef = useRef<string>('');
  const interventionSuccessRef = useRef<number>(0);

  // Add a small delay to prevent flash of content
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch real-time school data from Firestore with live listeners
  useEffect(() => {
    if (!auth.currentUser || !isManagement) {
      setLoadingData(false);
      return;
    }

    const setupRealtimeListeners = async () => {
      try {
        // Get school info from user document
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          setLoadingData(false);
          return;
        }

        const userData = userDocSnap.data();
        const schoolId = userData.schoolId;
        const adminId = userData.parentAdminId;
        const organizationId = userData.organizationId;
        const isIndependent = userData.isIndependent;

        if (!schoolId || !adminId) {
          setLoadingData(false);
          return;
        }

        // Determine school path
        let schoolPath = '';
        if (isIndependent) {
          schoolPath = `users/${adminId}/schools/${schoolId}`;
        } else {
          schoolPath = `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;
        }

        // Fetch school name (one-time)
        const schoolDocRef = doc(db, schoolPath);
        const schoolDocSnap = await getDoc(schoolDocRef);
        let schoolName = 'School';
        if (schoolDocSnap.exists()) {
          schoolName = schoolDocSnap.data().name || 'School';
        }

        const updateAggregates = () => {
          const totalStudents = studentsRef.current.length;

          const totalAssessments = Object.values(assessmentCountsRef.current)
            .reduce((sum, c) => sum + c, 0);

          const studentsWithAssessments = studentsRef.current
            .reduce((acc, s) => acc + ((assessmentCountsRef.current[s.id] || 0) > 0 ? 1 : 0), 0);

          const completionRate = totalStudents > 0
            ? Math.round((studentsWithAssessments / totalStudents) * 100)
            : 0;

          const highRiskFromAssess = studentsRef.current
            .reduce((acc, s) => acc + (highRiskByStudentRef.current[s.id] ? 1 : 0), 0);

          const highRiskFromNoAssess = studentsRef.current.reduce((acc, s) => {
            const count = assessmentCountsRef.current[s.id] || 0;
            if (count === 0) {
              const risk = (s.riskLevel || '').toLowerCase();
              if (risk.includes('high')) return acc + 1;
            }
            return acc;
          }, 0);

          const highRiskCount = highRiskFromAssess + highRiskFromNoAssess;

          setSchoolData({
            name: schoolName,
            totalStudents,
            assessmentsCompleted: totalAssessments,
            highRiskStudents: highRiskCount,
            interventionSuccess: interventionSuccessRef.current,
            completionRate
          });
          setLoadingData(false);
        };

        // Real-time listener for students
        const studentsPath = `${schoolPath}/students`;
        studentsPathRef.current = studentsPath;
        const unsubStudents = onSnapshot(collection(db, studentsPath), async (studentsSnapshot) => {
          const totalStudents = studentsSnapshot.size;
          const students: StudentData[] = [];

          studentsSnapshot.forEach(doc => {
            students.push({ id: doc.id, ...doc.data() } as StudentData);
          });

          studentsRef.current = students;


          let totalInterventions = 0;
          let successfulInterventions = 0;
          students.forEach(student => {
            const studentData = student as any;
            if (studentData.interventions && Array.isArray(studentData.interventions)) {
              studentData.interventions.forEach((intervention: any) => {
                totalInterventions++;
                if (intervention.status === 'completed' && intervention.outcome === 'successful') {
                  successfulInterventions++;
                }
              });
            }
          });
          interventionSuccessRef.current = totalInterventions > 0
            ? Math.round((successfulInterventions / totalInterventions) * 100)
            : 0;


          const currentIds = new Set(students.map(s => s.id));


          Object.keys(assessmentUnsubsRef.current).forEach((id) => {
            if (!currentIds.has(id)) {
              try { assessmentUnsubsRef.current[id]!(); } catch (e) { /* noop */ }
              delete assessmentUnsubsRef.current[id];
              delete assessmentCountsRef.current[id];
              delete highRiskByStudentRef.current[id];
            }
          });


          students.forEach((student) => {
            const id = student.id;
            if (!assessmentUnsubsRef.current[id]) {
              const assessmentsCol = collection(db, `${studentsPathRef.current}/${id}/assessments`);
              const q = query(assessmentsCol, orderBy('assessmentDate', 'desc'));
              assessmentUnsubsRef.current[id] = onSnapshot(q, (snap) => {
                const count = snap.size;
                assessmentCountsRef.current[id] = count;

                let isHigh = false;
                if (count > 0) {
                  const data = snap.docs[0].data();
                  const riskPercentage = (data.riskPercentage ?? 0) as number;
                  const riskCategory = String(data.riskCategory || '').toLowerCase();
                  isHigh = riskCategory.includes('high') || riskPercentage >= 70;
                }
                highRiskByStudentRef.current[id] = isHigh;


                updateAggregates();
              }, (err) => {
                console.error(`Error listening to assessments for student ${id}:`, err);
              });
            }
          });


          updateAggregates();
        }, (error) => {
          console.error('Error in students listener:', error);
          setLoadingData(false);
        });

        // Cleanup function
        return () => {
          unsubStudents();

          Object.values(assessmentUnsubsRef.current).forEach((unsub) => {
            try { unsub(); } catch (e) { /* noop */ }
          });
          assessmentUnsubsRef.current = {};
          assessmentCountsRef.current = {};
          highRiskByStudentRef.current = {};
        };
      } catch (error) {
        console.error('Error setting up real-time listeners:', error);
        setLoadingData(false);
      }
    };

    const unsubscribePromise = setupRealtimeListeners();

    // Cleanup on unmount
    return () => {
      unsubscribePromise.then(cleanup => {
        if (cleanup) cleanup();
      });
    };
  }, [user, isManagement]);

  // Check for incomplete assessment
  useEffect(() => {
    if (user) {
      (async () => {
        try {
          const assessment = await getIncompleteAssessmentForUser(user.uid);
          if (!assessment) {
            setHasIncompleteAssessment(false);
            return;
          }

          const hoursPassed = (Date.now() - assessment.startedAt) / (1000 * 60 * 60);
          const hasAnswers = Object.keys(assessment.responses || {}).length > 0;
          setHasIncompleteAssessment(hoursPassed < 24 && hasAnswers);
        } catch (error) {
          console.error('Error checking incomplete assessment from Firestore:', error);
          setHasIncompleteAssessment(false);
        }
      })();
    } else {
      setHasIncompleteAssessment(false);
    }
  }, [user]);

  // Check if mood popup should be shown for students after 12 AM
  useEffect(() => {
    if (!user || user.role !== 'student') return;

    const checkMoodPopup = async () => {
      console.log('[Hero] Checking mood popup for user:', user.uid);
      const now = new Date();
      const lastMoodCheck = localStorage.getItem(`lastMoodCheck_${user.uid}`);
      
      console.log('[Hero] Last mood check:', lastMoodCheck);
      
      // First check localStorage for performance
      let shouldShowPopup = false;
      
      if (lastMoodCheck) {
        const lastCheckDate = new Date(lastMoodCheck);
        const today = new Date();
        
        // If last check was before today, check server-side
        if (lastCheckDate.toDateString() !== today.toDateString()) {
          console.log('[Hero] LocalStorage check shows different day, checking server...');
          shouldShowPopup = await checkServerSideMood();
        } else {
          console.log('[Hero] Not showing popup - already checked today (localStorage)');
        }
      } else {
        // First time user or no localStorage entry, check server-side
        console.log('[Hero] No localStorage entry, checking server...');
        shouldShowPopup = await checkServerSideMood();
      }
      
      if (shouldShowPopup) {
        setShowMoodPopup(true);
        console.log('[Hero] Showing popup based on server check');
      }
    };

    // Check server-side if user has mood entry today
    const checkServerSideMood = async (): Promise<boolean> => {
      try {
        const { getMoodEntries } = await import('@/services/wellnessService');
        const entries = await getMoodEntries({ userId: user.uid, limit: 5 });
        
        if (entries.length > 0) {
          const latestEntry = entries[0];
          const entryDate = latestEntry.created_at;
          const today = new Date();
          
          // Check if latest entry is from today
          if (entryDate.toDateString() === today.toDateString()) {
            console.log('[Hero] Found mood entry from today, updating localStorage');
            localStorage.setItem(`lastMoodCheck_${user.uid}`, new Date().toISOString());
            return false; // Don't show popup
          }
        }
        
        console.log('[Hero] No mood entry found for today');
        return true; // Show popup
      } catch (error) {
        console.error('[Hero] Error checking server-side mood:', error);
        // Fallback to localStorage logic if server check fails
        return true;
      }
    };

    // Small delay to ensure page is loaded
    const timer = setTimeout(checkMoodPopup, 2000);
    return () => clearTimeout(timer);
  }, [user]);

  // Check if an assessment is enabled for the student's grade & current phase
  useEffect(() => {
    if (!user || user.role !== 'student') {
      setPhaseEnabled(null);
      return;
    }

    (async () => {
      try {
        // Fetch user document to get grade / student context
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          setPhaseEnabled(null);
          return;
        }

        const userData = userSnap.data() as any;

        // Try to get grade directly from user doc, otherwise look up student document
        let grade: string | number | undefined = userData.grade;

        if (!grade && userData.studentId && (userData.schoolId || userData.organizationId)) {
          const adminId = userData.parentAdminId || user.uid;
          const schoolId = userData.schoolId;
          const organizationId = userData.organizationId || null;

          if (adminId && schoolId) {
            const studentsBase = organizationId
              ? `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/students`
              : `users/${adminId}/schools/${schoolId}/students`;

            try {
              const studentRef = doc(db, studentsBase, userData.studentId as string);
              const studentSnap = await getDoc(studentRef);
              if (studentSnap.exists()) {
                const studentData = studentSnap.data() as any;
                grade = studentData.grade || grade;
              }
            } catch (err) {
              console.warn('[Hero] Failed to load student document for grade', err);
            }
          }
        }

        if (!grade) {
          grade = '6';
        }

        // Check enabled status from backend
        const enabled = await loadEnabledAssessments();
        const gradeDigits = String(grade).replace(/[^0-9]/g, "");

        // Check if ANY assessment for this grade is currently enabled
        const hasEnabledForGrade = Object.entries(enabled || {}).some(
          ([id, isOn]) => Boolean(isOn) && id.startsWith(`g${gradeDigits}-`)
        );

        console.log('[Hero] Assessment check:', { grade, hasEnabledForGrade, enabled });
        setPhaseEnabled(hasEnabledForGrade);
      } catch (err) {
        console.warn('[Hero] Failed to compute phaseEnabled', err);
        setPhaseEnabled(false);
      }
    })();
  }, [user]);

  // Don't render anything until we're sure about the auth state
  if (!isReady || (loading && !user)) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" />;
  }


  // Render hero for non-management (Students and Guests)
  return (
    <div className="relative min-h-[93vh] flex items-center py-20 overflow-hidden bg-slate-50">
      {/* Hidden image element to preload the background */}
      <img
        src="/hom.webp"
        alt=""
        className="hidden"
        onLoad={() => setBgLoaded(true)}
      />
      {/* Background Image - Zoomed out and anchored to bottom right */}
      <div
        className={`absolute inset-0 z-0 bg-no-repeat transition-opacity duration-500 ${bgLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage: 'url("/hom.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transform -translate-y-4 md:-translate-y-12 lg:-translate-y-32 transition-opacity duration-500 ${bgLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 id="onboarding-hero-title" className="text-4xl md:text-5xl font-bold leading-tight">
              <span style={{ color: 'rgb(11, 73, 77)' }}>Your Mental Health</span> <span style={{ color: 'rgba(29, 78, 216, 1)' }}>Matters</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              A safe space for students in grades 6-10 to understand,
              track, and improve their mental wellbeing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
              {hasIncompleteAssessment ? (
                <IncompleteAssessmentAlert />
              ) : (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to="/assessment"
                          className="w-full sm:w-auto"
                          onClick={(e) => {
                            if (user?.role === 'student' && phaseEnabled === false) {
                              e.preventDefault();
                              e.stopPropagation();
                            }
                          }}
                        >
                          <Button
                            id="onboarding-take-assessment"
                            size="lg"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
                            disabled={user?.role === 'student' && phaseEnabled === false}
                          >
                            Take Assessment
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      {user?.role === 'student' && phaseEnabled === false && (
                        <TooltipContent>
                          Your assessment has not been scheduled yet
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                  <Link to="/resources" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-medium"
                    >
                      View Resources
                    </Button>
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>100% Private & Confidential - Your data is only shared with your school administrators to provide better support.</span>
            </div>
          </div>
          <div className="flex items-center justify-center h-full">
            <HeroGallery />
          </div>
        </div>
      </div>
      
      {/* Mood Popup for logged-in students */}
      {user?.role === 'student' && (
        <>
          {console.log('[Hero] About to render MoodPopup - showMoodPopup:', showMoodPopup, 'user role:', user?.role)}
          <MoodPopup 
            isOpen={showMoodPopup}
            onClose={() => {
              console.log('[Hero] MoodPopup onClose called');
              setShowMoodPopup(false);
              // Store today's check to prevent showing again today
              if (user) {
                localStorage.setItem(`lastMoodCheck_${user.uid}`, new Date().toISOString());
              }
            }}
          />
        </>
      )}
    </div>
  );
};

export default Hero;

export function HeroWithFeatures() {
  const { user } = useAuth();
  const isManagement = user?.role === 'management';

  return (
    <>
      <Hero />
    </>
  );
}
