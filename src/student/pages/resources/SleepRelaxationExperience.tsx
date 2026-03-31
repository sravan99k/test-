import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Moon,
  Heart,
  Smile,
  Lightbulb,
  Smartphone,
  Clock,
  Coffee,
  Frown,
  Volume2,
  Bed,
  Phone,
  Utensils,
  Thermometer,
  Lightbulb as LightIcon,
  Sun,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft
} from 'lucide-react';
// Inline animations and helpers via <style> tag below to avoid external CSS import
import { useAuth } from '@/hooks/useAuth';
import { logSleep as logSleepToDb, getSleepLogs, getSleepRelaxationStats, awardBadge, hasBadge } from '@/services/resourcesService';

interface SleepData {
  completedTechniques: string[];
  reflectionAnswer: string | null;
}

const SleepRelaxationExperience: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.uid || '';
  const [currentSection, setCurrentSection] = useState(0);
  const [sleepData, setSleepData] = useState<SleepData>({
    completedTechniques: [],
    reflectionAnswer: null
  });
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingTimer, setBreathingTimer] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalTimer, setModalTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [gratitudeItems, setGratitudeItems] = useState<string>('');
  const [visualizationStep, setVisualizationStep] = useState(0);
  const [muscleStep, setMuscleStep] = useState(0);
  const [muscleTimer, setMuscleTimer] = useState(0);
  const [isMuscleActive, setIsMuscleActive] = useState(false);
  const [envChecks, setEnvChecks] = useState<boolean[]>([false, false, false, false, false, false]);
  const [showBreathModal, setShowBreathModal] = useState(false);
  const [worryText, setWorryText] = useState<string>('');
  const [worrySubmitting, setWorrySubmitting] = useState<boolean>(false);
  const [worryResponse, setWorryResponse] = useState<string>('');
  const [bedTime, setBedTime] = useState<string>('');
  const [wakeTime, setWakeTime] = useState<string>('');
  const [feeling, setFeeling] = useState<string>('Great');
  const [sleepLogs, setSleepLogs] = useState<Array<{ date: string; bedTime: string; wakeTime: string; feeling: string; hours: number }>>([]);
  const [sleepLoading, setSleepLoading] = useState(false);
  const [sleepStreak, setSleepStreak] = useState<number>(0);
  const [pickerOpen, setPickerOpen] = useState<'bed' | 'wake' | null>(null);
  const [pickerHour, setPickerHour] = useState<number>(10);
  const [pickerMinute, setPickerMinute] = useState<number>(0);
  const [pickerAm, setPickerAm] = useState<boolean>(true);
  const [pickerMode, setPickerMode] = useState<'hour' | 'minute'>('hour');

  const openPicker = (which: 'bed' | 'wake') => {
    setPickerOpen(which);
    const val = which === 'bed' ? bedTime : wakeTime;
    if (val && /\d{2}:\d{2}/.test(val)) {
      const [h, m] = val.split(':').map(Number);
      const am = h < 12;
      const hour12 = ((h + 11) % 12) + 1;
      setPickerHour(hour12);
      setPickerMinute(m);
      setPickerAm(am);
      setPickerMode('hour');
    } else {
      setPickerHour(10);
      setPickerMinute(0);
      setPickerAm(true);
      setPickerMode('hour');
    }
  };

  // no stepper-related effects

  useEffect(() => {
    if (userId) {
      fetchSleepData();
    }
  }, [userId]);

  const fetchSleepData = async () => {
    try {
      const [logs, stats] = await Promise.all([
        getSleepLogs(userId),
        getSleepRelaxationStats(userId)
      ]);
      setSleepLogs(logs as any);
      setSleepStreak((stats as any)?.sleepStreak || 0);
    } catch (e) {
      console.error('Error fetching sleep data', e);
    }
  };

  // Backfill: if user already has a sleep streak, ensure first badge is awarded
  useEffect(() => {
    (async () => {
      try {
        if (!userId) return;
        const stats = await getSleepRelaxationStats(userId);
        const s = Number((stats as any)?.sleepStreak || 0);
        if (s >= 1 && !(await hasBadge(userId, 'sleep-first'))) {
          await awardBadge(userId, { key: 'sleep-first', name: 'First Sleep Log', icon: 'moon', description: 'Logged your first sleep' });
        }
      } catch { }
    })();
  }, [userId]);

  const callOpenRouter = async (messages: Array<{ role: string; content: string }>, maxTokens = 120) => {
    const apiKey = (import.meta as any).env?.VITE_OPENROUTER_API_KEY;
    if (!apiKey) return null;
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Worry Box Coach'
      },
      body: JSON.stringify({ model: 'openrouter/auto', messages, max_tokens: maxTokens, temperature: 0.6 })
    });
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  };

  const generateOvercome = async (text: string) => {
    setWorryResponse('');
    const toPlain = (s: string) => s
      .split('\n')
      .map(line => line
        .replace(/\*\*|__/g, '') // remove bold/italic markers
        .replace(/^\s*[-*]\s+/, '') // remove bullet markers
        .replace(/^\s*\d+[\.)]\s+/, '') // remove numbering
        .trim()
      )
      .filter(Boolean)
      .join('\n');
    try {
      if (/\b(exam|exm|test|paper)\b/i.test(text)) {
        const examMsg = [
          "Don't take too much stress.",
          "Take it lightly, trust your preparation, and you'll write the exam well.",
          "Breathe slowly for 30 seconds, review only key points, then rest."
        ].join('\n');
        setWorryResponse(examMsg);
        return;
      }
      const msg = await callOpenRouter([
        { role: 'system', content: 'You are a warm, encouraging sleep and stress coach for teens. Write a kind, human reply in 3-4 short lines. Plain text only. No symbols, no lists, no bullets, no numbering. Tone: gentle, hopeful, supportive. Line 1: validate and reassure. Line 2: reduce pressure and offer a positive reframe. Line 3: give one tiny next step they can do now. Line 4: a brief calm closing or well-wish.' },
        { role: 'user', content: `User worry: ${text}\nReply with 3-4 short lines. Plain text only, no symbols.` }
      ], 220);
      const plain = msg ? toPlain(msg) : '';
      setWorryResponse(plain || 'You are doing your best and that is enough. It is okay to take the pressure off and go gently. Do one tiny step now, then pause and breathe slowly. You will handle this more calmly than you think.');
    } catch {
      setWorryResponse('You are doing your best and that is enough. It is okay to take the pressure off and go gently. Do one tiny step now, then pause and breathe slowly. You will handle this more calmly than you think.');
    }
  };

  const savePicker = () => {
    const h24 = (pickerHour % 12) + (pickerAm ? 0 : 12);
    const mm = String(pickerMinute).padStart(2, '0');
    const hh = String(h24).padStart(2, '0');
    const str = `${hh}:${mm}`;
    if (pickerOpen === 'bed') setBedTime(str); else if (pickerOpen === 'wake') setWakeTime(str);
    setPickerOpen(null);
  };

  const handleClockClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const angle = Math.atan2(dy, dx);
    const deg = (angle * 180 / Math.PI + 90 + 360) % 360;
    if (pickerMode === 'hour') {
      const h = Math.round(deg / 30) % 12;
      setPickerHour(h === 0 ? 12 : h);
    } else {
      const m = Math.round(deg / 6) % 60;
      setPickerMinute(m);
    }
  };

  const logSleep = async () => {
    if (!userId) {
      alert('You must be logged in to log sleep.');
      return;
    }
    if (!bedTime || !wakeTime) {
      alert('Please set both bedtime and wake-up time');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    // Check if already logged today
    if (sleepLogs.some(log => log.date === today)) {
      alert('You have already logged sleep for today');
      return;
    }
    setSleepLoading(true);
    try {
      await logSleepToDb(userId, bedTime, wakeTime, feeling);
      await fetchSleepData();
      try {
        const stats = await getSleepRelaxationStats(userId);
        const s = Number((stats as any)?.sleepStreak || 0);
        if (s >= 1 && !(await hasBadge(userId, 'sleep-first'))) {
          await awardBadge(userId, { key: 'sleep-first', name: 'First Sleep Log', icon: 'moon', description: 'Logged your first sleep' });
        }
        if (s >= 7 && !(await hasBadge(userId, 'sleep-champion'))) {
          await awardBadge(userId, { key: 'sleep-champion', name: 'Sleep Champion', icon: 'moon', description: '7-day sleep streak' });
        }
      } catch { }
      setBedTime('');
      setWakeTime('');
      setFeeling('Great');
    } catch (error) {
      console.error('Error logging sleep', error);
      const message = error instanceof Error ? error.message : 'Failed to log sleep. Please try again.';
      alert(message);
    } finally {
      setSleepLoading(false);
    }
  };

  const resetForm = () => {
    setBedTime('');
    setWakeTime('');
    setFeeling('Great');
  };

  const avgSleep = sleepLogs.length > 0 ? (sleepLogs.reduce((sum, log) => sum + (Number(log.hours) || 0), 0) / sleepLogs.length).toFixed(1) : '—';

  // Calculate 7-day streak (simple day counter)
  const currentStreak = sleepStreak > 0 ? Math.min(sleepStreak, 7) : Math.min(sleepLogs.length, 7);

  const streakDays = Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    logged: i < currentStreak
  }));

  const containerRef = useRef<HTMLDivElement>(null);

  // Generate stable star positions that never change
  const smallStars = useMemo(() =>
    Array.from({ length: 150 }, (_, i) => ({
      id: `star-small-${i}`,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 0.5 + Math.random() * 1,
      opacity: 0.3 + Math.random() * 0.4,
      delay: Math.random() * 8,
      duration: 3 + Math.random() * 4
    })), []
  );

  const mediumStars = useMemo(() => {
    const colors = ['#ffffff', '#fff4e6', '#e6f3ff', '#fff0f5'];
    return Array.from({ length: 80 }, (_, i) => ({
      id: `star-med-${i}`,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1.5 + Math.random() * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0.5 + Math.random() * 0.5,
      glow: 2 + Math.random() * 3,
      delay: Math.random() * 6,
      duration: 2 + Math.random() * 3
    }));
  }, []);

  const brightStars = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: `star-bright-${i}`,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 2
    })), []
  );

  const shootingStars = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: `shooting-${i}`,
      left: 10 + Math.random() * 80,
      top: Math.random() * 40,
      delay: i * 7
    })), []
  );

  const sections = [
    'intro',
    'why-sleep-matters',
    'sleep-problems',
    'sleep-hygiene',
    'relaxation-techniques',
    'connections',
    'reflection',
    'support'
  ];

  // Breathing exercise timer
  useEffect(() => {
    if (breathingPhase === 'inhale' && breathingTimer < 4) {
      setTimeout(() => setBreathingTimer(prev => prev + 1), 1000);
    } else if (breathingPhase === 'inhale' && breathingTimer >= 4) {
      setBreathingPhase('hold');
      setBreathingTimer(0);
    } else if (breathingPhase === 'hold' && breathingTimer < 2) {
      setTimeout(() => setBreathingTimer(prev => prev + 1), 1000);
    } else if (breathingPhase === 'hold' && breathingTimer >= 2) {
      setBreathingPhase('exhale');
      setBreathingTimer(0);
    } else if (breathingPhase === 'exhale' && breathingTimer < 6) {
      setTimeout(() => setBreathingTimer(prev => prev + 1), 1000);
    } else if (breathingPhase === 'exhale' && breathingTimer >= 6) {
      setBreathingPhase('inhale');
      setBreathingTimer(0);
    }
  }, [breathingPhase, breathingTimer]);

  // Visualization journey progression
  useEffect(() => {
    if (activeModal === 'visualization' && isTimerActive && visualizationStep < 3) {
      const timer = setTimeout(() => setVisualizationStep(prev => prev + 1), 2000);
      return () => clearTimeout(timer);
    }
  }, [activeModal, isTimerActive, visualizationStep]);

  // Muscle relaxation timer
  useEffect(() => {
    if (isMuscleActive && muscleTimer > 0) {
      const timer = setTimeout(() => setMuscleTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isMuscleActive && muscleTimer === 0 && muscleStep < 3) {
      setMuscleStep(prev => prev + 1);
      setMuscleTimer(7);
    } else if (isMuscleActive && muscleStep >= 3) {
      setIsMuscleActive(false);
      setMuscleStep(0);
      setMuscleTimer(0);
    }
  }, [isMuscleActive, muscleTimer, muscleStep]);

  // Modal timer
  useEffect(() => {
    if (isTimerActive && modalTimer > 0) {
      const timer = setTimeout(() => setModalTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isTimerActive && modalTimer === 0) {
      setIsTimerActive(false);
    }
  }, [isTimerActive, modalTimer]);

  // removed persistence and daily reset for simplified Worry Box

  // removed bedtime reassurance; using single overcome response instead

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20
      }
    }
  };

  const scrollToSection = (index: number) => {
    if (index >= 0 && index < sections.length) {
      setIsScrolling(true);
      setCurrentSection(index);

      const element = document.getElementById(sections[index]);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }

      setTimeout(() => setIsScrolling(false), 1000);
    }
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      scrollToSection(currentSection + 1);
    }
  };

  const completeTechnique = (technique: string) => {
    setSleepData(prev => ({
      ...prev,
      completedTechniques: [...prev.completedTechniques, technique]
    }));
  };

  const setReflectionAnswer = (answer: string) => {
    setSleepData(prev => ({ ...prev, reflectionAnswer: answer }));
  };

  const startModal = (modalType: string) => {
    setActiveModal(modalType);
    setModalTimer(modalType === 'visualization' ? 180 : 0);
    setIsTimerActive(modalType === 'visualization');
    if (modalType === 'muscle') {
      setIsMuscleActive(true);
      setMuscleStep(0);
      setMuscleTimer(7);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalTimer(0);
    setIsTimerActive(false);
    setVisualizationStep(0);
    setMuscleStep(0);
    setMuscleTimer(0);
    setIsMuscleActive(false);
  };

  const DeepBreathingGame: React.FC = () => {
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [scale, setScale] = useState(1);
    const [cycle, setCycle] = useState(0);
    const [complete, setComplete] = useState(false);
    useEffect(() => {
      if (complete || cycle >= 3) return;
      let elapsed = 0;
      const id = setInterval(() => {
        elapsed += 50;
        if (elapsed < 4000) {
          setPhase('inhale');
          setScale(1 + (elapsed / 4000) * 0.6);
        } else if (elapsed < 6000) {
          setPhase('hold');
          setScale(1.6);
        } else if (elapsed < 10000) {
          setPhase('exhale');
          setScale(1.6 - ((elapsed - 6000) / 4000) * 0.6);
        } else {
          setCycle((c) => c + 1);
          elapsed = 0;
        }
      }, 50);
      return () => clearInterval(id);
    }, [cycle, complete]);
    useEffect(() => { if (cycle >= 3 && !complete) setComplete(true); }, [cycle, complete]);
    return (
      <div style={{ background: 'linear-gradient(135deg, #dbeafe, #e9d5ff)', borderRadius: 14, padding: '2rem', textAlign: 'center' }}>
        {!complete ? (
          <>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', marginBottom: '1rem' }}>
              {phase === 'inhale' && 'Inhale...'}
              {phase === 'hold' && 'Hold...'}
              {phase === 'exhale' && 'Exhale...'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <div className="breath-bubble" style={{ transform: `scale(${scale})`, transition: 'transform 0.05s linear' }} />
            </div>
            <div className="modal-sub">Cycle {cycle + 1} of 3</div>
          </>
        ) : (
          <div>
            <div style={{ fontSize: '1.8rem', marginBottom: '1rem' }}></div>
            <div className="modal-section-title">Great job!</div>
            <div className="modal-sub">You've completed your deep breathing.</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen overflow-x-hidden relative"
    >
      {/* Back to Resources Button */}
      <motion.a
        href="/resources"
        onClick={(e) => { e.preventDefault(); navigate('/resources'); }}
        className="fixed top-20 md:top-20 left-4 md:left-8 flex items-center gap-1 md:gap-2 text-sm md:text-base text-gray-300 hover:text-white transition-colors group z-50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Resources</span>
      </motion.a>
      {/* Fixed Night Sky Background - Covers Entire Page */}
      <div className="fixed inset-0 z-0">
        {/* Deep space gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-blue-950 to-indigo-900"></div>

        {/* Nebula clouds - adds depth and color variation */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-[600px] h-96 bg-indigo-800/10 rounded-full blur-3xl"></div>
        </div>

        {/* Milky Way effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-300/5 to-transparent"
          style={{ transform: 'rotate(-25deg)', transformOrigin: 'center' }}>
        </div>

        {/* Realistic stars - multiple layers for depth */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Distant small stars */}
          {smallStars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white star-twinkle"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`
              }}
            />
          ))}

          {/* Medium stars with color variation */}
          {mediumStars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full star-twinkle-slow"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                backgroundColor: star.color,
                opacity: star.opacity,
                boxShadow: `0 0 ${star.glow}px ${star.color}`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`
              }}
            />
          ))}

          {/* Bright prominent stars */}
          {brightStars.map((star) => (
            <div
              key={star.id}
              className="absolute star-pulse"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`
              }}
            >
              <div className="w-1 h-1 bg-white rounded-full"
                style={{
                  boxShadow: '0 0 4px 1px rgba(255, 255, 255, 0.8), 0 0 8px 2px rgba(255, 255, 255, 0.4)'
                }}>
              </div>
            </div>
          ))}
        </div>

        {/* Realistic Moon with craters and glow */}
        <div className="absolute top-12 md:top-20 right-4 md:right-20 w-24 md:w-32 lg:w-40 h-24 md:h-32 lg:h-40 moon-float">
          {/* Outer glow */}
          <div className="absolute -inset-4 md:-inset-8 bg-yellow-200/20 rounded-full blur-2xl"></div>
          {/* Middle glow */}
          <div className="absolute -inset-2 md:-inset-4 bg-yellow-100/30 rounded-full blur-xl"></div>
          {/* Moon surface */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 shadow-2xl">
            {/* Crater details */}
            <div className="absolute top-3 md:top-6 left-4 md:left-8 w-3 md:w-6 h-3 md:h-6 rounded-full bg-yellow-300/40 shadow-inner"></div>
            <div className="absolute top-8 md:top-16 right-5 md:right-10 w-4 md:w-8 h-4 md:h-8 rounded-full bg-yellow-300/30 shadow-inner"></div>
            <div className="absolute bottom-6 md:bottom-12 left-6 md:left-12 w-2 md:w-4 h-2 md:h-4 rounded-full bg-yellow-300/35 shadow-inner"></div>
            <div className="absolute top-6 md:top-12 right-3 md:right-6 w-2 md:w-3 h-2 md:h-3 rounded-full bg-yellow-300/45 shadow-inner"></div>
            <div className="absolute bottom-4 md:bottom-8 right-7 md:right-14 w-3 md:w-5 h-3 md:h-5 rounded-full bg-yellow-300/25 shadow-inner"></div>
          </div>
          {/* Moon shine */}
          <div className="absolute inset-1 md:inset-2 rounded-full bg-gradient-to-tl from-transparent via-transparent to-white/20"></div>
        </div>

        {/* Shooting stars with trails */}
        {shootingStars.map((star) => (
          <div
            key={star.id}
            className="absolute shooting-star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: '2s'
            }}
          >
            <div className="w-1 h-1 bg-white rounded-full"
              style={{
                boxShadow: '-60px 0 20px 2px rgba(255, 255, 255, 0.5), -30px 0 15px 1px rgba(255, 255, 255, 0.7)'
              }}>
            </div>
          </div>
        ))}

        {/* Aurora Borealis effect at horizon */}
        <div className="absolute bottom-0 left-0 right-0 h-64 aurora">
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 via-cyan-400/10 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 via-pink-400/8 to-transparent aurora-wave"></div>
        </div>

        {/* Atmospheric haze for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-indigo-900/40"></div>
      </div>

      <style>{`
        /* Realistic star animations - only opacity changes, no movement */
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.3; }
          25% { opacity: 0.8; }
          50% { opacity: 0.4; }
          75% { opacity: 0.9; }
        }
        .star-twinkle { animation: star-twinkle 4s ease-in-out infinite; }
        
        @keyframes star-twinkle-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .star-twinkle-slow { animation: star-twinkle-slow 6s ease-in-out infinite; }
        
        @keyframes star-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .star-pulse { animation: star-pulse 3s ease-in-out infinite; }
        
        /* Realistic moon float */
        @keyframes moon-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        .moon-float { animation: moon-float 8s ease-in-out infinite; }
        
        /* Shooting star with trail */
        @keyframes shooting-star {
          0% { opacity: 0; transform: translateX(0) translateY(0) rotate(-45deg); }
          5% { opacity: 1; }
          100% { opacity: 0; transform: translateX(400px) translateY(200px) rotate(-45deg); }
        }
        .shooting-star { animation: shooting-star 2s linear infinite; }
        
        /* Aurora wave */
        @keyframes aurora-wave {
          0%, 100% { opacity: 0.3; transform: translateX(0) scaleY(1); }
          50% { opacity: 0.6; transform: translateX(20px) scaleY(1.1); }
        }
        .aurora-wave { animation: aurora-wave 15s ease-in-out infinite; }
        
        /* Other animations */
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0); opacity: 0.9; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
        .animate-gentle-float { animation: gentle-float 4s ease-in-out infinite; }

        @keyframes bounce-custom {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-custom { animation: bounce-custom 2.2s ease-in-out infinite; }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-twinkle { animation: twinkle 1.8s ease-in-out infinite; }

        @keyframes float-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(40px); }
        }
        .animate-float { animation: float-slow 8s ease-in-out infinite alternate; }

        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .transform-gpu { transform: translateZ(0); }
        /* Modal styles (mirrored from StressManagementApp) */
        .popup-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .popup-content { background: #ffffff; border-radius: 20px; padding: 1rem 2rem 2rem; width: min(720px, 95vw); max-width: 100%; max-height: 90vh; overflow: auto; box-sizing: border-box; display: flex; flex-direction: column; }
        .popup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .popup-header h3 { color: #374151; margin: 0; }
        .popup-header h3:empty { display: none; }
        .popup-header button { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; padding: 0.5rem; margin-left: auto; }
        /* Helper styles used by the breathing mini-game */
        .breath-bubble { width: 90px; height: 90px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #a5b4fc, #60a5fa); transition: transform 0.2s ease; box-shadow: 0 8px 24px rgba(96,165,250,0.35); }
        .modal-sub { color: #6b7280; font-size: 0.95rem; margin-top: 0.5rem; }
        .modal-section-title { font-weight: 800; font-size: 1.25rem; color: #111827; text-align: center; margin-bottom: 0.5rem; }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          /* Back to Resources Button */
          .fixed.top-20.left-8 {
            top: 1rem;
            left: 1rem;
            font-size: 0.9rem;
          }

          /* Moon positioning */
          .moon-float {
            width: 100px !important;
            height: 100px !important;
            top: 3rem !important;
            right: 1rem !important;
          }

          /* Popup/Modal adjustments */
          .popup-content {
            width: min(720px, 92vw);
            padding: 1.25rem 1.5rem 1.5rem;
            max-height: 85vh;
          }

          .popup-header button {
            font-size: 1.3rem;
            padding: 0.4rem;
          }

          /* Breathing bubble */
          .breath-bubble {
            width: 75px;
            height: 75px;
          }

          .modal-section-title {
            font-size: 1.15rem;
          }

          .modal-sub {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          /* Back to Resources Button - smaller on mobile */
          .fixed.top-20.left-8 {
            top: 0.75rem;
            left: 0.75rem;
            font-size: 0.85rem;
          }

          .fixed.top-20.left-8 .w-5 {
            width: 1rem;
            height: 1rem;
          }

          /* Moon - even smaller on mobile */
          .moon-float {
            width: 80px !important;
            height: 80px !important;
            top: 2.5rem !important;
            right: 0.75rem !important;
          }

          /* Popup/Modal - optimized for small screens */
          .popup-content {
            width: min(720px, 96vw);
            padding: 1rem 1.25rem 1.25rem;
            max-height: 88vh;
            border-radius: 16px;
          }

          .popup-header h3 {
            font-size: 1.1rem;
          }

          .popup-header button {
            font-size: 1.2rem;
            padding: 0.3rem;
          }

          /* Breathing bubble - smaller */
          .breath-bubble {
            width: 65px;
            height: 65px;
          }

          .modal-section-title {
            font-size: 1.05rem;
          }

          .modal-sub {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 360px) {
          /* Extra small devices */
          .popup-content {
            padding: 0.85rem 1rem 1rem;
            border-radius: 14px;
          }

          .popup-header h3 {
            font-size: 1rem;
          }

          .breath-bubble {
            width: 55px;
            height: 55px;
          }

          .modal-section-title {
            font-size: 1rem;
          }

          .modal-sub {
            font-size: 0.8rem;
          }
        }

        /* Landscape mobile optimization */
        @media (max-width: 768px) and (orientation: landscape) {
          .popup-content {
            max-height: 80vh;
          }

          .moon-float {
            width: 70px !important;
            height: 70px !important;
            top: 2rem !important;
            right: 1rem !important;
          }
        }

        /* Touch-friendly improvements */
        @media (hover: none) and (pointer: coarse) {
          button, a {
            min-height: 44px;
            min-width: 44px;
          }

          button {
            touch-action: manipulation;
          }
        }

        /* Accessibility - Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
      {/* Navigation Dots */}


      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/30 z-50">
        <div
          className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-500"
          style={{ width: `${(currentSection / (sections.length - 1)) * 100}%` }}
        />
      </div>

      {/* Section 1: Intro */}
      <section id="intro" className="min-h-screen flex items-center justify-center relative z-10">
        {/* Right-side large image behind text */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/Resource Images/2. Sleep & Relaxation/12.webp"
            alt="Ready to Rest"
            className="hidden md:block absolute left-32 md:left-16 xl:left-34 top-1/2 md:top-[55%] -translate-y-1/2 w-[100px] lg:w-[250px] xl:w-[350px] opacity-90 drop-shadow-2xl select-none"
            style={{
              WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 72%, rgba(0,0,0,0) 100%)',
              maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 72%, rgba(0,0,0,0) 100%)'
            }}
          />
        </div>

        <motion.div
          className="relative z-10 text-center text-white px-4 md:px-8 max-w-5xl"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold mb-4 md:mb-6 leading-tight md:leading-relaxed text-yellow-200">
              Ready to Rest?
            </h1>
          </motion.div>
          <motion.div variants={itemVariants}>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 md:mb-12 text-purple-100 leading-relaxed px-2">
              Discover how sleep can recharge your body and mind.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <button
              onClick={() => {
                const el = document.getElementById('why-sleep-matters');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group bg-yellow-200 hover:bg-yellow-300 text-indigo-900 px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-yellow-300/60"
            >
              Begin My Night
              <Moon className="inline-block w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:animate-bounce" />
            </button>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-custom">

        </div>
      </section>

      {/* Section 2: Why Sleep Matters */}
      <section id="why-sleep-matters" className="flex items-center justify-center py-6 pt-12 scroll-mt-20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-10 text-white drop-shadow-lg">
            Why Sleep Matters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {[
              { img: '/Resource Images/2. Sleep & Relaxation/growsmarter.png', title: 'Grow Smarter', text: 'Memory consolidation happens during sleep', animationClass: 'lightbulb-bounce' },
              { img: '/Resource Images/2. Sleep & Relaxation/stayhappy.png', title: 'Stay Happy', text: 'Sleep regulates mood and emotional balance', animationClass: 'moon-bounce' },
              { img: '/Resource Images/2. Sleep & Relaxation/focusbetter.png', title: 'Focus Better', text: 'Improved concentration and learning ability', animationClass: 'telescope-focus' },
              { img: '/Resource Images/2. Sleep & Relaxation/stayhealthy.png', title: 'Stay Healthy', text: 'Stronger immune system and physical recovery', animationClass: 'heart-pulse' }
            ].map((item: { img: string; title: string; text: string; animationClass: string }, index: number) => (
              <div
                key={index}
                className="group bg-white/90 backdrop-blur-md rounded-2xl p-4 md:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-white/20"
              >
                <div className={`${item.animationClass} mb-4 md:mb-6 h-24 md:h-32 flex items-center justify-center`}>
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-contain mx-auto group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-medium mb-2 md:mb-3 text-gray-800">{item.title}</h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 md:p-8 rounded-2xl max-w-2xl mx-auto">
            <p className="text-base md:text-lg lg:text-xl leading-relaxed">
              <strong>Teens need 8–10 hours of sleep every night to feel their best. Without enough sleep, you might feel tired, forget things, or get upset easily.

              </strong>
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Why Sleep Problems Happen */}
      <section id="sleep-problems" className="flex items-center justify-center py-6 relative z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-10 text-center text-white drop-shadow-lg">
            Common Sleep Disruptors
          </h2>

          {/* Desktop circular layout */}
          <div className="relative w-full h-[400px] md:h-[520px] hidden md:block">
            {/* Center Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-cyan-400/15 backdrop-blur-md text-white rounded-2xl px-4 md:px-6 py-3 md:py-4 shadow-xl ring-1 ring-cyan-300/30 flex flex-col items-center gap-2">
                <img src="/Resource Images/2. Sleep & Relaxation/nosleep.png" alt="No Sleep" className="w-20 md:w-24 lg:w-28 h-20 md:h-24 lg:h-28 object-contain" />
                <div className="text-base md:text-lg lg:text-xl font-semibold">Sleep Disruptors</div>

              </div>
            </div>

            {/* Surrounding Bubbles */}
            {[
              { icon: Smartphone, title: 'Screens Before Bed', text: 'Blue light disrupts melatonin production', style: { top: '2%', left: '-10%' } },
              { icon: Clock, title: 'Irregular Schedules', text: 'Inconsistent sleep times confuse your body clock', style: { top: '2%', right: '-10%' } },
              { icon: Coffee, title: 'Caffeine & Late Meals', text: 'Stimulants keep your brain alert when it should wind down', style: { bottom: '33%', left: '-20%' } },
              { icon: Frown, title: 'Stress', text: 'Worry and anxiety make it hard to relax', style: { bottom: '35%', right: '-20%' } },
              { icon: Volume2, title: 'Noisy Environment', text: 'Disturbances interrupt deep sleep cycles', style: { bottom: '-5%', left: '50%', transform: 'translateX(-50%)' } }
            ].map((item, idx) => (
              <div
                key={idx}
                className="absolute group"
                style={item.style as React.CSSProperties}
              >
                <div className="bg-white rounded-2xl px-2 md:px-3 py-2 md:py-3 shadow-xl border border-gray-100 flex flex-col items-center text-center gap-1 md:gap-2 min-w-[120px] md:min-w-[160px] max-w-[140px] md:max-w-[180px]">
                  <item.icon className="w-5 md:w-6 lg:w-7 h-5 md:h-6 lg:h-7 text-blue-500" />
                  <div className="font-semibold text-gray-800 text-xs md:text-sm">{item.title}</div>
                  <p className="text-gray-600 text-xs md:text-sm leading-snug">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile list layout */}
          <div className="md:hidden space-y-4">
            {/* Center image */}
            <div className="flex justify-center mb-6">
              <div className="bg-cyan-400/15 backdrop-blur-md text-white rounded-2xl px-6 py-4 shadow-xl ring-1 ring-cyan-300/30 flex flex-col items-center gap-2">
                <img src="/Resource Images/2. Sleep & Relaxation/nosleep.png" alt="No Sleep" className="w-24 h-24 object-contain" />
                <div className="text-lg font-semibold">Sleep Disruptors</div>
              </div>
            </div>

            {/* List of disruptors */}
            {[
              { icon: Smartphone, title: 'Screens Before Bed', text: 'Blue light disrupts melatonin production' },
              { icon: Clock, title: 'Irregular Schedules', text: 'Inconsistent sleep times confuse your body clock' },
              { icon: Coffee, title: 'Caffeine & Late Meals', text: 'Stimulants keep your brain alert when it should wind down' },
              { icon: Frown, title: 'Stress', text: 'Worry and anxiety make it hard to relax' },
              { icon: Volume2, title: 'Noisy Environment', text: 'Disturbances interrupt deep sleep cycles' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-start gap-3">
                  <item.icon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold text-gray-800 text-base mb-1">{item.title}</div>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>


        </div>
      </section>

      {/* Section 5: Relaxation Techniques */}
      <section id="relaxation-techniques" className="flex items-center justify-center py-6 relative z-10 mt-6">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-5xl font-bold mb-10 text-center text-white drop-shadow-lg">
            Relaxation Techniques Before Bed
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* Slow Breathing Exercise - Enhanced */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <div className="flex flex-col items-center">
                <img
                  src="/Resource Images/2. Sleep & Relaxation/buddy breathing.png"
                  alt="Buddy Breathing"
                  className="w-40 h-40 object-contain mb-4"
                />
                <h3 className="text-2xl font-medium mb-2 text-gray-800 text-center">Slow Breathing Exercise</h3>
                <p className="text-gray-600 text-center mb-4">
                  Follow the breathing rhythm to relax your body and mind.
                </p>
                <button
                  onClick={() => setShowBreathModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Open Breathing Challenge
                </button>
              </div>
            </div>
            {/* Worry Box */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <div className="flex flex-col items-center">
                <img
                  src="/Resource Images/2. Sleep & Relaxation/worrybox.png"
                  alt="Worry Box"
                  className="w-40 h-40 object-contain mb-4"
                />
                <h3 className="text-2xl font-medium mb-2 text-gray-800 text-center">Worry Box</h3>
                <p className="text-gray-600 text-center mb-4">Put worries in the box and get quick ways to handle them</p>
                <button
                  onClick={() => startModal('worry')}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Open Worry Box
                </button>
              </div>
            </div>
          </div>

          {/* Completed Techniques */}
          {sleepData.completedTechniques.length > 0 && (
            <div className="mt-12 text-center">
              <h3 className="text-xl font-medium mb-6 text-gray-800">Techniques Explored</h3>
              <div className="flex justify-center space-x-4">
                {sleepData.completedTechniques.map((technique, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-4 py-2 rounded-full text-sm font-medium animate-bounce"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {technique === 'breathing' && 'Breathing Master'}
                    {technique === 'visualization' && 'Journey Explorer'}
                    {technique === 'muscle' && 'Body Relaxer'}
                    {technique === 'schedule' && 'Schedule Keeper'}
                    {technique === 'screens' && 'Screen-Free Champion'}
                    {technique === 'caffeine' && 'Caffeine Avoider'}
                    {technique === 'environment' && 'Environment Creator'}
                    {technique === 'worry' && 'Worry Boxer'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {showBreathModal && (
        <div className="popup-overlay" onClick={() => setShowBreathModal(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3></h3>
              <button onClick={() => setShowBreathModal(false)}>×</button>
            </div>
            <DeepBreathingGame />
          </div>
        </div>
      )}

      {/* Modal: Worry Box (simplified) */}
      {activeModal === 'worry' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 relative text-center">
              <button
                onClick={closeModal}
                aria-label="Close"
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
              <h2 className="text-3xl font-light mb-1 text-gray-800">Worry Box</h2>
              <p className="text-gray-600 text-sm">Put your worry in, get quick tips to overcome it.</p>
            </div>
            <div className="space-y-4">
              <textarea
                value={worryText}
                onChange={(e) => setWorryText(e.target.value)}
                placeholder="Write your worry here..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                rows={5}
              />
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={async () => {
                    if (!worryText.trim()) return;
                    setWorrySubmitting(true);
                    setWorryResponse('');
                    await generateOvercome(worryText.trim());
                    setWorrySubmitting(false);
                  }}
                  disabled={!worryText.trim() || worrySubmitting}
                  className="px-6 py-2 rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white"
                >
                  {worrySubmitting ? 'Generating…' : 'Put it in the box'}
                </button>
              </div>
              {worrySubmitting && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin"></div>
                  <span>Let's put it in the box…</span>
                </div>
              )}
              {worryResponse && (
                <>
                  <div className="bg-orange-50 border border-orange-200 text-orange-900 rounded-xl p-4 text-sm whitespace-pre-line">
                    {worryResponse}
                  </div>
                  <div className="text-xs text-gray-600 mt-3 text-center">
                    If you want to talk more about this, you can chat with Buddy in the chatbot.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Sleep Environment & Tracker (Combined) */}
      <section id="sleep-checklist-tracker" className="flex items-center justify-center py-6 relative z-10">
        <div className="max-w-4xl mx-auto px-8 w-full">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/30">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800">Sleep Tracker</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Checklist */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Better Sleep Tips</h3>
                <ul className="space-y-3 text-gray-800 list-disc pl-5">
                  <li>Keep the room dark (use blackout curtains or an eye mask)</li>
                  <li>Reduce noise (consider earplugs or gentle white noise)</li>
                  <li>Maintain a cool temperature (around 18–22°C)</li>
                  <li>Use a comfortable mattress and supportive pillows</li>
                  <li>Avoid screens at least 30 minutes before bed</li>
                  <li>Skip caffeine after 6 PM and avoid heavy late meals</li>
                </ul>
              </div>

              {/* Right: Logging */}
              <div>
                <div className="text-sm text-gray-600 mb-4">Avg sleep: {avgSleep} hours</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">How did you feel?</label>
                    <select value={feeling} onChange={(e) => setFeeling(e.target.value)} className="w-full p-2 rounded-lg border border-gray-200 bg-white">
                      <option>Great</option>
                      <option>Okay</option>
                      <option>Tired</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Bedtime</label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button type="button" onClick={() => openPicker('bed')} className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-left hover:border-gray-300 bg-white">
                        {bedTime || 'Set time'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Wake-up</label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button type="button" onClick={() => openPicker('wake')} className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-left hover:border-gray-300 bg-white">
                        {wakeTime || 'Set time'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <button onClick={logSleep} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Log Sleep</button>
                  <button onClick={resetForm} className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg">Reset</button>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Sleep Streak</h3>
                  <p className="text-sm text-gray-600 mt-1">Keep logging to reach 7 days!</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    {currentStreak}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Days</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-white rounded-full overflow-hidden shadow-inner mb-6">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${(currentStreak / 7) * 100}%` }}
                >
                  {currentStreak > 0 && (
                    <div className="absolute right-0 top-0 h-full w-2 bg-white/30 animate-pulse" />
                  )}
                </div>
              </div>

              {/* Day Dots */}
              <div className="flex items-center justify-between mb-4">
                {streakDays.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${item.logged
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg scale-110'
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                      }`}>
                      {item.day}
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Message */}
              <div className="text-center">
                {currentStreak === 0 && (
                  <p className="text-sm text-gray-600">Start your sleep journey today!</p>
                )}
                {currentStreak > 0 && currentStreak < 7 && (
                  <p className="text-sm font-medium text-cyan-600"> {7 - currentStreak} more day{7 - currentStreak !== 1 ? 's' : ''} to go!</p>
                )}
                {currentStreak === 7 && (
                  <p className="text-sm font-bold text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text"> Perfect Week! Amazing job!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {pickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-4">Select Time</div>

            {/* Hour/Minute Display */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <button
                onClick={() => setPickerMode('hour')}
                className={`w-20 h-24 rounded-lg flex items-center justify-center text-5xl font-bold transition-colors ${pickerMode === 'hour' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-800'
                  }`}
              >
                {String(pickerHour).padStart(2, '0')}
              </button>
              <div className="text-4xl font-bold text-gray-800">:</div>
              <button
                onClick={() => setPickerMode('minute')}
                className={`w-20 h-24 rounded-lg flex items-center justify-center text-5xl font-bold transition-colors ${pickerMode === 'minute' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-800'
                  }`}
              >
                {String(pickerMinute).padStart(2, '0')}
              </button>
              <div className="flex flex-col gap-1 ml-2">
                <button
                  onClick={() => setPickerAm(true)}
                  className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors ${pickerAm ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300'
                    }`}
                >
                  AM
                </button>
                <button
                  onClick={() => setPickerAm(false)}
                  className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors ${!pickerAm ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300'
                    }`}
                >
                  PM
                </button>
              </div>
            </div>

            {/* Analog Clock */}
            <div
              className="relative w-64 h-64 mx-auto rounded-full bg-gray-200 cursor-pointer select-none"
              onClick={handleClockClick}
              onMouseDown={(e) => e.preventDefault()}
            >
              {/* Hour markers */}
              {Array.from({ length: 12 }, (_, i) => {
                const angle = (i * 30 - 90) * Math.PI / 180;
                const x = 50 + 38 * Math.cos(angle);
                const y = 50 + 38 * Math.sin(angle);
                const num = pickerMode === 'hour' ? (i === 0 ? 12 : i) : i * 5;
                const isSelected = pickerMode === 'hour' ? (pickerHour === (i === 0 ? 12 : i)) : (pickerMinute === i * 5);
                return (
                  <div
                    key={i}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${isSelected ? 'bg-purple-600 text-white' : 'text-gray-700'
                      }`}>
                      {num}
                    </div>
                  </div>
                );
              })}

              {/* Clock hand */}
              <div
                className="absolute top-1/2 left-1/2 pointer-events-none"
                style={{
                  width: '2px',
                  height: '35%',
                  background: '#7c3aed',
                  transform: `translate(-50%, -100%) rotate(${pickerMode === 'hour' ? ((pickerHour % 12) * 30) : (pickerMinute * 6)
                    }deg)`,
                  transformOrigin: 'bottom center',
                  borderRadius: '2px'
                }}
              />

              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600 pointer-events-none" />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setPickerOpen(null)} className="text-purple-600 font-medium px-4 py-2 hover:bg-purple-50 rounded-lg">CANCEL</button>
              <button onClick={savePicker} className="text-purple-600 font-medium px-4 py-2 hover:bg-purple-50 rounded-lg">OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Section 6: Connections */}
      <section id="connections" className="flex items-center justify-center py-6 relative z-10 mt-6">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-10 text-center text-white drop-shadow-lg">
            Sleep Connections
          </h2>

          {/* Desktop circular layout */}
          <div className="relative hidden md:block">
            {/* Central Moon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <img
                src="/Resource Images/2. Sleep & Relaxation/connections.png"
                alt="Connections"
                className="w-80 md:w-100 h-80 md:h-100 object-contain"
              />
            </div>

            {/* Connection Lines */}
            <div className="relative w-full h-96">
              {[
                { angle: 0, title: 'Stress Management', tip: 'Better sleep reduces anxiety and worry', color: 'from-purple-400 to-pink-400' },
                { angle: 120, title: 'Digital Wellness', tip: 'Limit screens for deeper rest', color: 'from-blue-400 to-cyan-400' },
                { angle: 240, title: 'School Success', tip: 'Rest improves memory and learning', color: 'from-green-400 to-teal-400' }
              ].map((connection, index) => {
                const radians = (connection.angle * Math.PI) / 180;
                const x = 50 + 48 * Math.cos(radians);
                const y = 50 + 48 * Math.sin(radians);

                return (
                  <div key={index}>
                    {/* Connection Line */}

                    {/* Connected Item */}
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`
                      }}
                    >
                      <div className={`bg-gradient-to-br ${connection.color} text-white p-4 md:p-6 rounded-2xl shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer group min-w-40 md:min-w-48`}>
                        <h3 className="text-base md:text-lg font-medium mb-1 md:mb-2">{connection.title}</h3>
                        <p className="text-xs md:text-sm opacity-90 group-hover:opacity-100">{connection.tip}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile list layout */}
          <div className="md:hidden space-y-4">
            {/* Center image */}
            <div className="flex justify-center mb-6">
              <img
                src="/Resource Images/2. Sleep & Relaxation/connections.png"
                alt="Connections"
                className="w-48 h-48 object-contain"
              />
            </div>

            {/* List of connections */}
            {[
              { title: 'Stress Management', tip: 'Better sleep reduces anxiety and worry', color: 'from-purple-400 to-pink-400' },
              { title: 'Digital Wellness', tip: 'Limit screens for deeper rest', color: 'from-blue-400 to-cyan-400' },
              { title: 'School Success', tip: 'Rest improves memory and learning', color: 'from-green-400 to-teal-400' }
            ].map((connection, index) => (
              <div key={index} className={`bg-gradient-to-br ${connection.color} text-white p-5 rounded-2xl shadow-lg`}>
                <h3 className="text-lg font-medium mb-2">{connection.title}</h3>
                <p className="text-sm opacity-95">{connection.tip}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 md:mt-16">
            <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow px-4">
              Sleep isn't just about rest—it's the foundation that connects and strengthens every aspect of your wellbeing.
            </p>
          </div>
        </div>
      </section>



      {/* Section 8: When to Ask for Help */}
      <section id="support" className="flex items-center justify-center py-6 relative z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-8 w-full">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-10 lg:p-12 shadow-xl border border-white/30">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-10 text-gray-800 text-center">When to Ask for Help</h2>

            <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
              <img
                src="/Resource Images/1. Stress management images/buddycall.png"
                alt="Call for help"
                className="w-40 md:w-48 lg:w-56 h-auto object-contain drop-shadow"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full sm:w-auto max-w-xl">
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 md:p-6 rounded-2xl shadow border border-cyan-100 text-center">
                  <h3 className="text-lg md:text-xl font-semibold mb-1 text-gray-800">Childline India</h3>
                  <p className="text-sm md:text-base text-gray-700 mb-3">24/7 helpline for children and teenagers</p>
                  <a href="tel:1098" className="inline-block px-3 md:px-4 py-2 rounded-full bg-cyan-600 text-white text-sm md:text-base font-medium hover:bg-cyan-700 transition-colors">Call: 1098</a>
                </div>

                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 md:p-6 rounded-2xl shadow border border-emerald-100 text-center">
                  <h3 className="text-lg md:text-xl font-semibold mb-1 text-gray-800">NIMHANS</h3>
                  <p className="text-sm md:text-base text-gray-700 mb-3">National Institute of Mental Health and Neurosciences</p>
                  <a href="tel:08046110007" className="inline-block px-3 md:px-4 py-2 rounded-full bg-emerald-600 text-white text-sm md:text-base font-medium hover:bg-emerald-700 transition-colors">Call: 080-46110007</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SleepRelaxationExperience;