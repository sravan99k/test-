import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { logSelfTalk, logGratitude, logReframe, getHealthyMindStats, awardBadge, hasBadge } from '@/services/resourcesService';

const MindRefresh: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.uid || '';
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [gratitudeItems, setGratitudeItems] = useState<string[]>([]);
  const [newGratitude, setNewGratitude] = useState('');
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingTimer, setBreathingTimer] = useState(30);
  const [focusDotPosition, setFocusDotPosition] = useState({ x: 50, y: 50 });
  const [focusTimer, setFocusTimer] = useState(30);
  const focusTimerRef = useRef(focusTimer);
  const focusIntervalRef = useRef<number | null>(null);
  const [flippedCards, setFlippedCards] = useState<boolean[]>([false, false, false]);
  const [scrollY, setScrollY] = useState(0);
  // Games state
  const [selfTalkTexts, setSelfTalkTexts] = useState<string[]>(['', '', '']);
  const selfTalkInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const gratitudeInputRef = useRef<HTMLInputElement>(null);
  const [gratitudeGameItems, setGratitudeGameItems] = useState<string[]>([]);
  const reframingQuestions = [
    { neg: 'I failed the test, I’m dumb.', options: ['I didn’t do well, but I can prepare better next time.', 'I should stop trying.'], correct: 0 },
    { neg: 'Nobody likes me.', options: ['Some people may not, but I have true friends who care.', 'I will always be alone.'], correct: 0 },
    { neg: 'I always mess up.', options: ['Everyone makes mistakes; I’ll learn from this one.', 'I can’t change anything.'], correct: 0 },
  ];
  const [reframingIndex, setReframingIndex] = useState(0);
  const [reframingCorrectChosen, setReframingCorrectChosen] = useState(false);
  const [reframingFeedback, setReframingFeedback] = useState<string>('');
  const [showReframeHint, setShowReframeHint] = useState(false);
  const [reframingSelectedIdx, setReframingSelectedIdx] = useState<number | null>(null);
  const reframeHints = [
    'What would you say to a friend in this situation?',
    'Is there evidence against the negative thought?',
    'What is a more balanced or helpful way to see this?'
  ];
  const reframeExplanations = [
    'This reframe focuses on improvement and effort rather than fixed ability.',
    'This reframe acknowledges real support and challenges the “nobody” exaggeration.',
    'This reframe normalizes mistakes and emphasizes learning and growth.'
  ];
  // Streaks & daily locks
  type GameId = 'selftalk' | 'gratitudePractice' | 'reframeGuide';
  const [streaks, setStreaks] = useState<Record<GameId, number>>({ selftalk: 0, gratitudePractice: 0, reframeGuide: 0 });
  const [completedToday, setCompletedToday] = useState<Record<GameId, boolean>>({ selftalk: false, gratitudePractice: false, reframeGuide: false });

  const todayKey = () => new Date().toISOString().slice(0, 10);
  const dateMinusDays = (d: Date, days: number) => { const x = new Date(d); x.setDate(x.getDate() - days); return x.toISOString().slice(0, 10); };
  const STORAGE_KEY = (g: GameId) => `mindrefresh_streak_${g}`;

  useEffect(() => {
    (['selftalk', 'gratitudePractice', 'reframeGuide'] as GameId[]).forEach((g) => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY(g));
        if (raw) {
          const parsed = JSON.parse(raw);
          const last = parsed.lastDate as string | undefined;
          const st = Number(parsed.streak) || 0;
          setStreaks(s => ({ ...s, [g]: Math.min(7, Math.max(0, st)) }));
          setCompletedToday(c => ({ ...c, [g]: last === todayKey() }));
        }
      } catch { }
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    const go = async () => {
      try {
        const stats = await getHealthyMindStats(userId);
        setStreaks(s => ({
          ...s,
          selftalk: Math.min(7, Number((stats as any)?.selfTalkStreak || 0)),
          gratitudePractice: Math.min(7, Number((stats as any)?.gratitudeStreak || 0)),
          reframeGuide: Math.min(7, Number((stats as any)?.reframeStreak || 0)),
        }));
      } catch (e) {
        console.error('Error fetching healthy mind stats', e);
      }
    };
    go();
  }, [userId]);

  const completeGameToday = (g: GameId) => {
    setCompletedToday(prev => ({ ...prev, [g]: true }));
    setStreaks(prev => {
      let next = 1;
      try {
        const raw = localStorage.getItem(STORAGE_KEY(g));
        const lastDate = raw ? JSON.parse(raw).lastDate as string | undefined : undefined;
        const wasYesterday = lastDate === dateMinusDays(new Date(), 1);
        const prevStreak = raw ? Number(JSON.parse(raw).streak) || 0 : 0;
        next = wasYesterday ? Math.min(7, prevStreak + 1) : 1;
      } catch { }
      const updated = { ...prev, [g]: next };
      try { localStorage.setItem(STORAGE_KEY(g), JSON.stringify({ streak: next, lastDate: todayKey() })); } catch { }
      return updated;
    });
  };

  // Mark completion when conditions met (no score or win banners)
  useEffect(() => {
    if (!completedToday.selftalk && selfTalkTexts.every(t => t.trim())) {
      completeGameToday('selftalk');
      if (userId) {
        (async () => {
          try {
            await logSelfTalk(userId, selfTalkTexts.filter(t => t.trim()));
            const stats = await getHealthyMindStats(userId);
            setStreaks(s => ({
              ...s,
              selftalk: Math.min(7, Number((stats as any)?.selfTalkStreak || 0)),
              gratitudePractice: Math.min(7, Number((stats as any)?.gratitudeStreak || 0)),
              reframeGuide: Math.min(7, Number((stats as any)?.reframeStreak || 0)),
            }));
            // Award badges for Positive Self-Talk
            const selfTalkStreak = Number((stats as any)?.selfTalkStreak || 0);
            try {
              if (selfTalkStreak >= 1 && !(await hasBadge(userId, 'selftalk-first'))) {
                await awardBadge(userId, { key: 'selftalk-first', name: 'First Affirmation', icon: 'smile', description: 'Completed your first Positive Self-Talk' });
              }
              if (selfTalkStreak >= 7 && !(await hasBadge(userId, 'selftalk-streaker'))) {
                await awardBadge(userId, { key: 'selftalk-streaker', name: 'Self-Talk Streaker', icon: 'smile', description: '7-day Positive Self-Talk streak' });
              }
            } catch { }
          } catch (e) {
            console.error('Error logging self talk', e);
          }
        })();
      }
    }
  }, [selfTalkTexts, completedToday, userId]);

  useEffect(() => {
    if (!completedToday.gratitudePractice && gratitudeGameItems.length >= 2) {
      completeGameToday('gratitudePractice');
      if (userId) {
        (async () => {
          try {
            await logGratitude(userId, gratitudeGameItems);
            const stats = await getHealthyMindStats(userId);
            setStreaks(s => ({
              ...s,
              selftalk: Math.min(7, Number((stats as any)?.selfTalkStreak || 0)),
              gratitudePractice: Math.min(7, Number((stats as any)?.gratitudeStreak || 0)),
              reframeGuide: Math.min(7, Number((stats as any)?.reframeStreak || 0)),
            }));
            // Award badges for Gratitude Practice
            const gratitudeStreak = Number((stats as any)?.gratitudeStreak || 0);
            try {
              if (gratitudeStreak >= 1 && !(await hasBadge(userId, 'gratitude-first'))) {
                await awardBadge(userId, { key: 'gratitude-first', name: 'First Gratitude', icon: 'star', description: 'Logged your first Gratitude Practice' });
              }
              if (gratitudeStreak >= 7 && !(await hasBadge(userId, 'gratitude-guru'))) {
                await awardBadge(userId, { key: 'gratitude-guru', name: 'Gratitude Guru', icon: 'star', description: '7-day Gratitude Practice streak' });
              }
            } catch { }
          } catch (e) {
            console.error('Error logging gratitude', e);
          }
        })();
      }
    }
  }, [gratitudeGameItems, completedToday, userId]);


  // Breathing exercise timer
  useEffect(() => {
    if (activeModal === 'breathing' && breathingTimer > 0) {
      const timer = setTimeout(() => {
        setBreathingTimer(prev => prev - 1);
        // Cycle through breathing phases
        const phases = ['inhale', 'hold', 'exhale'] as const;
        const currentIndex = phases.indexOf(breathingPhase);
        const nextIndex = (currentIndex + 1) % phases.length;
        setBreathingPhase(phases[nextIndex]);
      }, 4000); // 4 seconds per phase
      return () => clearTimeout(timer);
    }
  }, [activeModal, breathingTimer, breathingPhase]);

  // Keep a ref of the latest focusTimer
  useEffect(() => { focusTimerRef.current = focusTimer; }, [focusTimer]);

  // Focus dot movement: start once on modal open, stop when timer ends or modal closes
  useEffect(() => {
    if (activeModal === 'focus') {
      // Clear any existing interval
      if (focusIntervalRef.current) {
        clearInterval(focusIntervalRef.current);
        focusIntervalRef.current = null;
      }
      // Move immediately
      setFocusDotPosition({ x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 });
      // Start interval
      const id = window.setInterval(() => {
        if (focusTimerRef.current > 0) {
          setFocusDotPosition({ x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 });
        }
      }, 2000);
      focusIntervalRef.current = id;
      return () => {
        if (focusIntervalRef.current) {
          clearInterval(focusIntervalRef.current);
          focusIntervalRef.current = null;
        }
      };
    } else {
      // Modal closed
      if (focusIntervalRef.current) {
        clearInterval(focusIntervalRef.current);
        focusIntervalRef.current = null;
      }
    }
  }, [activeModal]);

  // Focus timer
  useEffect(() => {
    if (activeModal === 'focus' && focusTimer > 0) {
      const timer = setTimeout(() => setFocusTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
    // When timer hits 0, stop movement interval
    if (activeModal === 'focus' && focusTimer === 0 && focusIntervalRef.current) {
      clearInterval(focusIntervalRef.current);
      focusIntervalRef.current = null;
    }
  }, [activeModal, focusTimer]);

  // Close modals with Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        resetModals();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeModal]);

  // Auto-focus logic for modals
  useEffect(() => {
    if (activeModal === 'selftalk') {
      setTimeout(() => selfTalkInputRefs.current[0]?.focus(), 100);
    } else if (activeModal === 'gratitudePractice') {
      setTimeout(() => gratitudeInputRef.current?.focus(), 100);
    }
  }, [activeModal]);

  // Scroll effect for parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGratitudeSubmit = () => {
    if (newGratitude.trim()) {
      setGratitudeItems([...gratitudeItems, newGratitude]);
      setNewGratitude('');
    }
  };

  const resetModals = () => {
    setActiveModal(null);
    setBreathingTimer(30);
    setBreathingPhase('inhale');
    setFocusTimer(30);
    setFocusDotPosition({ x: 50, y: 50 });
    if (focusIntervalRef.current) { clearInterval(focusIntervalRef.current); focusIntervalRef.current = null; }
  };

  const ThoughtCard = ({ negative, positive, index }: { negative: string; positive: string; index: number }) => (
    <div
      className={`thought-card ${flippedCards[index] ? 'flipped' : ''}`}
      onClick={() => {
        const newFlipped = [...flippedCards];
        newFlipped[index] = !newFlipped[index];
        setFlippedCards(newFlipped);
      }}
    >
      <div className="card-inner">
        <div className="card-front">
          <p>{negative}</p>
          <span className="flip-hint">Click to flip ↻</span>
        </div>
        <div className="card-back">
          <p>{positive}</p>
          <span className="flip-hint">✨ Better perspective!</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .mind-refresh-container, .mind-refresh-container * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          overflow-x: hidden;
        }

        .mind-refresh-container {
          background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%);
          min-height: 100vh;
          position: relative;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
        }

        /* Floating Animation Elements */
        .floating-clouds {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .cloud {
          position: absolute;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50px;
          opacity: 0.6;
          animation: float 15s infinite ease-in-out;
        }

        .cloud:nth-child(1) {
          width: 80px;
          height: 40px;
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        .cloud:nth-child(2) {
          width: 60px;
          height: 30px;
          top: 40%;
          right: 15%;
          animation-delay: 5s;
        }

        .cloud:nth-child(3) {
          width: 100px;
          height: 50px;
          top: 60%;
          left: 20%;
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-15px) translateX(3px); }
        }

        .twinkling-stars {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: twinkle 3s infinite;
        }

        .star:nth-child(1) { width: 3px; height: 3px; top: 10%; left: 20%; animation-delay: 0s; }
        .star:nth-child(2) { width: 2px; height: 2px; top: 30%; right: 10%; animation-delay: 1s; }
        .star:nth-child(3) { width: 4px; height: 4px; top: 70%; left: 80%; animation-delay: 2s; }
        .star:nth-child(4) { width: 2px; height: 2px; top: 50%; left: 50%; animation-delay: 1.5s; }

        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        /* Section Styles */
        .section {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          position: relative;
          z-index: 2;
        }

        .section-content {
          text-align: center;
          max-width: 800px;
          animation: fadeInUp 1s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mind-refresh-container h1 {
          font-size: 4.25rem;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #8b5cf6, #3b82f6, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
          animation: gradient 3s ease infinite;
        }

        .mind-refresh-container h2 {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          color: #6b46c1;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }

        .subtitle {
          font-size: 1.5rem;
          color: #4c1d95;
          margin-bottom: 2rem;
          animation: fadeInUp 1s ease-out 0.5s both;
        }

        .section-text {
          font-size: 1.2rem;
          line-height: 1.8;
          color: #374151;
          margin-bottom: 2rem;
        }

        .action-button {
          background: linear-gradient(45deg, #a855f7, #3b82f6);
          color: white;
          border: none;
          padding: 1rem 2rem;
          font-size: 1.2rem;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
        }

        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(168, 85, 247, 0.4);
        }

        /* Section 1 - Welcome */
        .welcome-section {
          background: url("/Resource Images/3. Healthy mind habbits/12.webp") no-repeat;
          background-size: 30% auto;
          background-position: 97% 60%;
          position: relative;
        }

        .sunrise-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, #fbbf24 0%, #f59e0b 30%, #e879f9 70%, #8b5cf6 100%);
          opacity: 0.3;
          animation: sunrise 4s ease-out;
          display: none;
        }

        @keyframes sunrise {
          from { opacity: 0; transform: scale(1.1); }
          to { opacity: 0.3; transform: scale(1); }
        }

        .scroll-hint {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          animation: bounce 2s infinite;
          color: #6b46c1;
          font-weight: 600;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(-10px); }
          60% { transform: translateX(-50%) translateY(-5px); }
        }

        /* Section 2 - Rest & Relax */
        .relax-section {
          background: transparent;
        }

        /* Section 2 (new) - Why It Matters */
        .mind-refresh-container .why-section {
          position: relative;
          margin-bottom: 0 !important; /* keep gap after removed as before */
        }
        /* Force extra top gap for Why It Matters (override generic .section rule below) */
        .mind-refresh-container .section.why-section { margin-top: 2rem !important; }

        /* Width for Why It Matters */
        .mind-refresh-container .why-section .section-content {
          max-width: 1000px;
        }

        .mind-refresh-container .why-grid {
          display: grid;
          grid-template-columns: 1.35fr 0.65fr;
          gap: 2rem;
          align-items: center;
          max-width: 1000px;
        }

        .mind-refresh-container .why-left .why-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(45deg, #8b5cf6, #3b82f6, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.75rem;
        }

        .mind-refresh-container .why-left .why-lead {
          font-size: 1.25rem;
          line-height: 1.9;
          color: #374151;
        }

        .mind-refresh-container .why-cards {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .mind-refresh-container .why-card {
          background: #ffffffbb;
          backdrop-filter: blur(6px);
          border-radius: 16px;
          padding: 1rem;
          text-align: left;
          border: 1px solid rgba(99,102,241,0.12);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .mind-refresh-container .why-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.08);
        }

        .mind-refresh-container .why-card .card-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .mind-refresh-container .why-card .card-text {
          color: #4b5563;
          line-height: 1.7;
          font-size: 1.05rem;
        }

        .mind-refresh-container .why-right {
          display: flex;
          justify-content: center;
        }

        .mind-refresh-container .why-image {
          max-width: 100%;
          width: 320px;
          height: auto;
          display: block;
        }

        .mind-refresh-container .why-badge {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 30% 30%, #dbeafe, #e9d5ff);
          box-shadow: 0 12px 24px rgba(139, 92, 246, 0.2);
          font-size: 3rem;
        }

        .mind-refresh-container .why-cta {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-top: 1.25rem;
          justify-content: center;
        }

        .mind-refresh-container .why-cta .action-button.secondary {
          background: linear-gradient(45deg, #10b981, #3b82f6);
        }

        @media (max-width: 900px) {
          .mind-refresh-container .why-grid {
            grid-template-columns: 1fr;
          }
          .mind-refresh-container .why-cards {
            grid-template-columns: 1fr;
          }
          .mind-refresh-container .why-right { order: -1; }
          .mind-refresh-container .why-badge { width: 120px; height: 120px; font-size: 2.2rem; }
          .welcome-section { background-size: 65% auto; }
          .mind-refresh-container .why-image { width: 240px; }
        }

        /* Cancel shared .section spacing for Why It Matters */
        .mind-refresh-container .why-section.section {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          min-height: auto !important;
        }

        /* Section 3 - Gratitude Garden */
        .gratitude-section {
          background: transparent;
          min-height: auto;
          padding: 1.25rem 1rem;
        }

        .mind-refresh-container .practices-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
          margin-top: 1rem;
          justify-items: center;
        }
        .mind-refresh-container .gratitude-section .section-content { max-width: 1280px; }

        /* Match heading size with 'Why It Matters' */
        .mind-refresh-container .gratitude-section h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .mind-refresh-container .practice-card {
          background: #ffffffbb;
          backdrop-filter: blur(6px);
          border: 1px solid rgba(99,102,241,0.12);
          border-radius: 16px;
          padding: 1rem 1rem 3.25rem; /* extra bottom space for streak progress */
          text-align: left;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          position: relative;
          min-height: 300px;
          cursor: pointer;
          width: 100%;
          max-width: 340px; /* allow a bit more width while keeping 4 per row */
        }

        .mind-refresh-container .practice-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.08);
        }

        .mind-refresh-container .practice-card.disabled {
          opacity: 0.6;
          filter: grayscale(10%);
          cursor: not-allowed;
        }

        .mind-refresh-container .practice-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 800;
          color: #1f2937;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          font-size: 1.2rem;
        }

        .mind-refresh-container .practice-text {
          color: #4b5563;
          line-height: 1.7;
          font-size: 1.15rem;
        }

        .mind-refresh-container .practice-image {
          width: 100%;
          height: 140px;
          object-fit: contain;
          display: block;
          margin-bottom: 0.75rem;
        }

        .mind-refresh-container .practice-open {
          margin-top: auto; /* push button to bottom */
          margin-left: auto;
          margin-right: auto;
          margin-bottom: 0.75rem; /* add bottom gap from streak bar */
          display: block;
          background: linear-gradient(45deg, #a855f7, #3b82f6);
          color: white;
          border: none;
          padding: 0.7rem 1.1rem;
          border-radius: 9999px;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.95rem;
        }

        .mind-refresh-container .try-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(59,130,246,0.12);
          color: #1d4ed8;
          border: 1px solid rgba(59,130,246,0.25);
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 9999px;
        }

        .mind-refresh-container .streak-progress {
          position: absolute;
          bottom: 12px;
          left: 12px;
          right: 12px;
          height: 6px;
          background: rgba(107,114,128,0.2);
          border-radius: 9999px;
          overflow: hidden;
        }

        .mind-refresh-container .streak-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #34d399);
          border-radius: 9999px;
          transition: width 0.3s ease;
        }

        .mind-refresh-container .streak-text {
          position: absolute;
          bottom: 24px;
          left: 12px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #047857;
        }

        .mind-refresh-container .lock-badge {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(107,114,128,0.15);
          color: #374151;
          border: 1px solid rgba(107,114,128,0.25);
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 9999px;
        }

        @media (max-width: 900px) {
          .mind-refresh-container .practices-grid { grid-template-columns: 1fr; }
        }

        .garden-bg {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 200px;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><path d="M10,50 Q20,30 30,40 T50,35 T70,45 Q80,25 90,50" fill="none" stroke="%234ade80" stroke-width="3"/><circle cx="15" cy="40" r="2" fill="%2365d16a"/><circle cx="35" cy="35" r="2" fill="%2365d16a"/><circle cx="55" cy="35" r="2" fill="%2365d16a"/><circle cx="75" cy="45" r="2" fill="%2365d16a"/></svg>') repeat-x;
          opacity: 0.6;
          display: none;
        }

        /* Section 4 - Focus Reset */
        .focus-section {
          background: transparent;
        }

        /* Section 5 - Thought Reframer */
        .reframe-section {
          background: transparent;
        }

        .thought-cards {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 2rem;
        }

        .thought-card {
          width: 250px;
          height: 150px;
          perspective: 1000px;
          cursor: pointer;
        }

        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .thought-card:hover .card-inner {
          transform: rotateY(10deg);
        }

        .thought-card.flipped .card-inner {
          transform: rotateY(180deg);
        }

        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 15px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .card-front {
          background: linear-gradient(45deg, #fca5a5, #fbbf24);
          color: white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .card-back {
          background: linear-gradient(45deg, #86efac, #60a5fa);
          color: white;
          transform: rotateY(180deg);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .card-front p, .card-back p {
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }

        .flip-hint {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        /* Safety & Accessibility Section */
        .safety-section {
          background: transparent;
          color: inherit;
          margin-top: 5rem !important;  /* add more gap before (outside) */
          margin-bottom: 0 !important; /* keep gap after removed */
        }

        .safety-section h2 {
          color: #1f2937;
        }

        /* Cancel shared .section spacing for Safety section */
        .mind-refresh-container .safety-section.section {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          min-height: auto !important;
        }

        .safety-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .safety-message {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .safety-message .section-text {
          font-size: 1.1rem;
          line-height: 1.7;
          margin-bottom: 1.2rem;
          color: #1f2937;
        }

        .support-cards {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .support-card {
          background: rgba(255, 255, 255, 0.12);
          padding: 2rem;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        /* Colored backgrounds for the three support cards */
        .support-cards .support-card:nth-child(1) {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          border-color: rgba(59,130,246,0.25);
        }

        .support-cards .support-card:nth-child(2) {
          background: linear-gradient(135deg, #e9d5ff, #c4b5fd);
          border-color: rgba(139,92,246,0.25);
        }

        .support-cards .support-card:nth-child(3) {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          border-color: rgba(16,185,129,0.25);
        }

        .support-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
        }

        .support-card h3 {
          font-size: 1.2rem;
          margin-bottom: 0.8rem;
          color: #1f2937;
        }

        .support-card p {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #374151;
        }

        /* When to Ask for Help Section */
        .help-section-wrapper {
          background: transparent;
          color: inherit;
          margin-top: 1rem;   /* add small gap before (outside) */
          margin-bottom: 0.75rem; /* keep tighter space after */
        }

        /* Remove all vertical spacing on Mind Connections section */
        .mind-refresh-container #connections {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          margin-bottom: 0 !important;
        }

        /* Remove extra margins inside connections */
        .mind-refresh-container #connections .mt-16 {
          margin-top: 0 !important;
        }
        .mind-refresh-container #connections h2 {
          margin-bottom: 1.5rem !important; /* small gap below heading */
        }

        /* The Help section uses the shared .section padding; override the top padding/margin */
        .mind-refresh-container .help-section-wrapper.section {
          padding-top: 0 !important;
          margin-top: 5rem !important; /* add a little more gap before Help */
          min-height: auto !important; /* cancel global .section min-height */
        }

        /* General top gap for sections inside this page */
        .mind-refresh-container .section { margin-top: 1rem; }
        .mind-refresh-container .section:first-of-type { margin-top: 0; }

        /* Add a little gap between Mind Connections and Help */
        .mind-refresh-container #connections + .help-section-wrapper.section { margin-top: 1rem !important; }

        /* Ensure Mind Connections itself has a small top gap relative to prior section */
        .mind-refresh-container #connections { margin-top: 1rem !important; }
        .mind-refresh-container .help-section-wrapper h2 {
          margin-top: 0 !important;
        }

        .help-section-wrapper h2 {
          color: #1f2937;
          margin-bottom: 0.75rem; /* slightly reduce heading spacing */
        }

        /* Unify all section heading styles to match 'Why It Matters' */
        .mind-refresh-container .section h2,
        .mind-refresh-container #connections h2,
        .mind-refresh-container .help-section-wrapper h2,
        .mind-refresh-container .safety-section h2,
        .mind-refresh-container .gratitude-section h2 {
          font-weight: 800 !important;
          background: linear-gradient(45deg, #8b5cf6, #3b82f6, #10b981) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
          color: transparent !important;
          text-shadow: none !important;
        }

        .help-section {
          max-width: 800px;
          margin: 0 auto;
        }

        .help-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }

        .help-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .help-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .help-card h3 {
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 1.2rem;
        }

        .help-card p {
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .help-phone {
          display: block;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .help-phone:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
          padding: 1rem;
        }

        .modal-content {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-radius: 24px;
          padding: 2rem;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: slideUp 0.3s ease;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #64748b;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .close-button:hover {
          color: #374151;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }

        .breathing-bubble.inhale {
          transform: scale(1.5);
          background: linear-gradient(45deg, #10b981, #3b82f6);
        }

        .breathing-bubble.hold {
          transform: scale(1.5);
          background: linear-gradient(45deg, #f59e0b, #ef4444);
        }

        .breathing-bubble.exhale {
          transform: scale(1);
          background: linear-gradient(45deg, #8b5cf6, #3b82f6);
        }

        .breathing-text {
          color: white;
          font-size: 1.2rem;
          font-weight: 600;
          text-align: center;
        }

        /* Gratitude Modal */
        .gratitude-input {
          width: 100%;
          padding: 1rem;
          border: 2px solid #d1d5db;
          border-radius: 10px;
          font-size: 1rem;
          margin-bottom: 1rem;
          font-family: inherit;
        }

        .gratitude-submit {
          background: linear-gradient(45deg, #10b981, #3b82f6);
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 25px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 600;
          width: 100%;
        }

        .gratitude-list {
          margin-top: 1rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .gratitude-item {
          background: #f3f4f6;
          padding: 0.8rem;
          border-radius: 10px;
          margin-bottom: 0.5rem;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Focus Modal */
        .focus-area {
          width: 300px;
          height: 300px;
          border: 2px dashed #d1d5db;
          border-radius: 15px;
          margin: 2rem auto;
          position: relative;
          overflow: hidden;
        }

        .focus-dot {
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, #fbbf24, #f59e0b);
          border-radius: 50%;
          position: absolute;
          transition: all 2s ease-in-out;
          box-shadow: 0 0 10px rgba(251, 191, 36, 0.6);
        }

        /* Responsive Design */
        @media (max-width: 900px) {
          .mind-refresh-container .why-grid {
            grid-template-columns: 1fr;
          }
          .mind-refresh-container .why-cards {
            grid-template-columns: 1fr;
          }
          .mind-refresh-container .why-right { order: -1; }
          .mind-refresh-container .why-badge { width: 120px; height: 120px; font-size: 2.2rem; }
          .welcome-section { background-size: 65% auto; background-position: 50% 70%; }
          .mind-refresh-container .why-image { width: 240px; }
          .mind-refresh-container .practices-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .support-cards { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          /* Typography */
          .mind-refresh-container h1 { 
            font-size: 3rem; 
            line-height: 1.2;
          }
          .mind-refresh-container h2 { 
            font-size: 2rem; 
            margin-bottom: 1.25rem;
          }
          .subtitle { 
            font-size: 1.25rem; 
            margin-bottom: 1.5rem;
          }
          .section-text { 
            font-size: 1rem; 
            line-height: 1.6;
          }
          .mind-refresh-container .why-left .why-title { font-size: 2rem; }
          .mind-refresh-container .why-left .why-lead { font-size: 1.1rem; }
          .mind-refresh-container .why-card .card-text { font-size: 0.95rem; }

          /* Layout */
          .section { 
            padding: 1.5rem 1rem; 
            min-height: auto;
          }
          .section-content { 
            max-width: 100%; 
            padding: 0 0.5rem;
          }

          /* Welcome section */
          .welcome-section {
            background-size: 80% auto;
            background-position: 50% 75%;
            padding: 2rem 1rem;
          }

          /* Buttons */
          .action-button {
            padding: 0.85rem 1.75rem;
            font-size: 1.1rem;
          }

          /* Cards */
          .thought-cards { 
            flex-direction: column; 
            align-items: center; 
            gap: 1.5rem;
          }
          .thought-card { 
            width: 220px; 
            height: 140px;
          }
          .card-front p, .card-back p {
            font-size: 0.95rem;
          }

          /* Practice cards */
          .mind-refresh-container .practice-card {
            padding: 1rem 1rem 3rem;
            min-height: 280px;
          }
          .mind-refresh-container .practice-title {
            font-size: 1.1rem;
          }
          .mind-refresh-container .practice-text {
            font-size: 1.05rem;
          }
          .mind-refresh-container .practice-image {
            height: 120px;
          }

          /* Modal */
          .modal-content {
            padding: 1.5rem;
            max-width: 90vw;
            border-radius: 20px;
          }
          .modal-overlay {
            padding: 0.75rem;
          }

          /* Focus area */
          .focus-area {
            width: 250px;
            height: 250px;
          }

          /* Help cards */
          .help-cards {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
          .help-card {
            padding: 1.25rem;
          }

          /* Support cards */
          .support-card {
            padding: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          /* Typography - smaller */
          .mind-refresh-container h1 { 
            font-size: 2.25rem; 
            margin-bottom: 0.75rem;
          }
          .mind-refresh-container h2 { 
            font-size: 1.75rem; 
            margin-bottom: 1rem;
          }
          .subtitle { 
            font-size: 1.1rem; 
            margin-bottom: 1.25rem;
          }
          .section-text { 
            font-size: 0.95rem; 
          }
          .mind-refresh-container .why-left .why-title { font-size: 1.75rem; }
          .mind-refresh-container .why-left .why-lead { font-size: 1rem; }

          /* Layout - tighter */
          .section { 
            padding: 1.25rem 0.75rem; 
          }
          .section-content { 
            padding: 0 0.25rem;
          }

          /* Welcome section */
          .welcome-section {
            background-size: 90% auto;
            background-position: 50% 80%;
            padding: 1.5rem 0.75rem;
          }

          /* Buttons - touch friendly */
          .action-button {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            min-height: 44px;
          }

          /* Cards - smaller */
          .thought-card { 
            width: 200px; 
            height: 130px;
          }
          .card-front p, .card-back p {
            font-size: 0.9rem;
          }
          .flip-hint {
            font-size: 0.75rem;
          }

          /* Practice cards - single column */
          .mind-refresh-container .practices-grid { 
            grid-template-columns: 1fr;
            gap: 0.85rem;
          }
          .mind-refresh-container .practice-card {
            padding: 0.85rem 0.85rem 2.75rem; /* extra bottom space for streak progress */
            min-height: 260px;
            max-width: 100%;
          }
          .mind-refresh-container .practice-title {
            font-size: 1.05rem;
            margin-top: 0.75rem;
          }
          .mind-refresh-container .practice-text {
            font-size: 1.05rem;
          }
          .mind-refresh-container .practice-image {
            height: 110px;
          }
          .mind-refresh-container .practice-open {
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
          }

          /* Why cards */
          .mind-refresh-container .why-card {
            padding: 0.85rem;
          }
          .mind-refresh-container .why-card .card-title {
            font-size: 0.95rem;
          }
          .mind-refresh-container .why-card .card-text {
            font-size: 0.9rem;
          }

          /* Modal - full width */
          .modal-content {
            padding: 1.25rem;
            max-width: 95vw;
            border-radius: 16px;
          }
          .modal-overlay {
            padding: 0.5rem;
          }
          .close-button {
            top: 0.75rem;
            right: 0.75rem;
            width: 28px;
            height: 28px;
            font-size: 1.3rem;
          }

          /* Focus area - smaller */
          .focus-area {
            width: 220px;
            height: 220px;
          }
          .focus-dot {
            width: 16px;
            height: 16px;
          }

          /* Breathing */
          .breathing-text {
            font-size: 1.1rem;
          }

          /* Gratitude */
          .gratitude-input {
            padding: 0.85rem;
            font-size: 0.95rem;
          }
          .gratitude-submit {
            padding: 0.7rem 1.25rem;
            font-size: 0.95rem;
          }

          /* Help cards */
          .help-card {
            padding: 1rem;
          }
          .help-card h3 {
            font-size: 1.1rem;
          }
          .help-card p {
            font-size: 0.85rem;
          }
          .help-phone {
            padding: 0.65rem 1.25rem;
            font-size: 0.85rem;
          }

          /* Support cards */
          .support-card {
            padding: 1.25rem;
          }
          .support-card h3 {
            font-size: 1.1rem;
          }
          .support-card p {
            font-size: 0.9rem;
          }

          /* Scroll hint */
          .scroll-hint {
            font-size: 0.9rem;
            bottom: 1.5rem;
          }

          /* Clouds - smaller */
          .cloud:nth-child(1) { width: 60px; height: 30px; }
          .cloud:nth-child(2) { width: 50px; height: 25px; }
          .cloud:nth-child(3) { width: 70px; height: 35px; }
        }

        @media (max-width: 360px) {
          /* Extra small devices */
          .mind-refresh-container h1 { 
            font-size: 2rem; 
          }
          .mind-refresh-container h2 { 
            font-size: 1.5rem; 
          }
          .subtitle { 
            font-size: 1rem; 
          }

          .section { 
            padding: 1rem 0.5rem; 
          }

          .action-button {
            padding: 0.65rem 1.25rem;
            font-size: 0.95rem;
          }

          .thought-card { 
            width: 180px; 
            height: 120px;
          }

          .modal-content {
            padding: 1rem;
          }

          .focus-area {
            width: 200px;
            height: 200px;
          }

          .mind-refresh-container .practice-card {
            min-height: 240px;
          }
        }

        /* Landscape mobile optimization */
        @media (max-width: 768px) and (orientation: landscape) {
          .section {
            min-height: auto;
            padding: 1.5rem 1rem;
          }

          .welcome-section {
            min-height: auto;
            padding: 1.5rem 1rem;
          }

          .modal-content {
            max-height: 85vh;
          }

          .focus-area {
            width: 200px;
            height: 200px;
          }
        }

        /* Touch-friendly improvements */
        @media (hover: none) and (pointer: coarse) {
          .action-button,
          .practice-open,
          .gratitude-submit,
          .help-phone,
          .close-button {
            min-height: 44px;
            min-width: 44px;
          }

          .thought-card,
          .practice-card,
          .help-card,
          .support-card,
          .why-card {
            cursor: pointer;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
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

      <div className="mind-refresh-container">
        {/* Back to Resources Button */}
        <motion.a
          href="/resources"
          onClick={(e) => { e.preventDefault(); navigate('/resources'); }}
          className="fixed top-20 left-8 flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors group z-50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Resources</span>
        </motion.a>
        {/* Floating Elements */}
        <div className="floating-clouds">
          <div className="cloud"></div>
          <div className="cloud"></div>
          <div className="cloud"></div>
        </div>

        <div className="twinkling-stars">
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
        </div>

        {/* Section 1 - Welcome Scene */}
        <section className="section welcome-section">
          <div className="sunrise-bg"></div>
          <div className="section-content px-4 md:px-8" style={{ transform: 'translateX(-10%)' }}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl">Mind Refresh </h1>
            <p className="subtitle text-lg sm:text-xl md:text-2xl px-2">Take a moment to slow down. Let's recharge your energy, one scroll at a time.</p>
            <button
              className="action-button"
              onClick={() => {
                const el = document.getElementById('why-matters-title');
                if (!el) return;
                const y = el.getBoundingClientRect().top + window.pageYOffset - 90; // slight upward offset
                window.scrollTo({ top: y, behavior: 'smooth' });
              }}
            >
              Let's Reset
            </button>
          </div>
        </section>

        {/* Section 2 - Why It Matters */}
        <section className="section why-section" aria-labelledby="why-matters-title">
          <div className="section-content px-4 md:px-8">
            <div className="why-grid">
              <div className="why-left">
                <h2 id="why-matters-title" className="why-title text-3xl sm:text-4xl md:text-5xl">Why It Matters</h2>
                <p className="why-lead text-base sm:text-lg md:text-xl">
                  The way you think affects how you feel and act every day. Healthy mind habits, like talking kindly to yourself or noticing good things,
                  help you feel stronger, happier, and ready to face challenges.
                </p>
                <div className="why-cards">
                  <div className="why-card">
                    <div className="card-title text-sm sm:text-base">Exam stress</div>
                    <div className="card-text text-sm sm:text-base">Positive thoughts can help you stay calm instead of panicking.</div>
                  </div>
                  <div className="why-card">
                    <div className="card-title text-sm sm:text-base">Friendship issues</div>
                    <div className="card-text text-sm sm:text-base">Reframing thoughts can remind you that one fight doesn't mean you're alone.</div>
                  </div>
                  <div className="why-card">
                    <div className="card-title text-sm sm:text-base">Feeling down</div>
                    <div className="card-text text-sm sm:text-base">Gratitude can lift your mood by focusing on what's good in your life.</div>
                  </div>
                  <div className="why-card">
                    <div className="card-title text-sm sm:text-base">Overwhelmed</div>
                    <div className="card-text text-sm sm:text-base">A quick focus reset can clear your mind and help you tackle tasks one at a time.</div>
                  </div>
                </div>
              </div>
              <div className="why-right">
                <img src="/Resource Images/3. Healthy mind habbits/whyitmatters.png" alt="Why It Matters" className="why-image w-48 sm:w-56 md:w-64 lg:w-80" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 - Gratitude Garden */}
        <section className="section gratitude-section">
          <div className="section-content">
            <h2>Key Healthy Mind Practices</h2>
            <div className="practices-grid">
              <div
                className={`practice-card ${completedToday['selftalk'] ? 'disabled' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => { if (!completedToday['selftalk']) setActiveModal('selftalk'); }}
                onKeyDown={(e) => { if (!completedToday['selftalk'] && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setActiveModal('selftalk'); } }}
                aria-label="Open Positive Self-Talk"
              >
                <div className="streak-progress">
                  <div className="streak-fill" style={{ width: `${(streaks.selftalk / 7) * 100}%` }} />
                </div>
                <div className="streak-text">{streaks.selftalk}/7 days</div>

                <img src="/Resource Images/3. Healthy mind habbits/positiveselftalk.png" alt="Positive Self-Talk" className="practice-image" />
                <div className="practice-title">Positive Self-Talk</div>
                <div className="practice-text">
                  Speak to yourself kindly, like you would to a best friend. It builds confidence and reduces worry.
                </div>
                <button className="practice-open" onClick={() => setActiveModal('selftalk')}>Try it yourself</button>
                {completedToday['selftalk'] && <div className="lock-badge">Come back tomorrow</div>}
              </div>
              <div
                className={`practice-card ${completedToday['gratitudePractice'] ? 'disabled' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => { if (!completedToday['gratitudePractice']) setActiveModal('gratitudePractice'); }}
                onKeyDown={(e) => { if (!completedToday['gratitudePractice'] && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setActiveModal('gratitudePractice'); } }}
                aria-label="Open Gratitude Practice"
              >
                <div className="streak-progress">
                  <div className="streak-fill" style={{ width: `${(streaks.gratitudePractice / 7) * 100}%` }} />
                </div>
                <div className="streak-text">{streaks.gratitudePractice}/7 days</div>

                <img src="/Resource Images/3. Healthy mind habbits/gratitude.png" alt="Gratitude Practice" className="practice-image" />
                <div className="practice-title">Gratitude Practice</div>
                <div className="practice-text">
                  Notice and appreciate good things, big or small. Focusing on positives helps you feel happier.
                </div>
                <button className="practice-open" onClick={() => setActiveModal('gratitudePractice')}>Try it yourself</button>
                {completedToday['gratitudePractice'] && <div className="lock-badge">Come back tomorrow</div>}
              </div>
              <div
                className={`practice-card ${completedToday['reframeGuide'] ? 'disabled' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => { if (!completedToday['reframeGuide']) { setReframingIndex(0); setReframingCorrectChosen(false); setReframingFeedback(''); setActiveModal('reframeGuide'); } }}
                onKeyDown={(e) => { if (!completedToday['reframeGuide'] && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setReframingIndex(0); setReframingCorrectChosen(false); setReframingFeedback(''); setActiveModal('reframeGuide'); } }}
                aria-label="Open Thought Reframing"
              >
                <div className="streak-progress">
                  <div className="streak-fill" style={{ width: `${(streaks.reframeGuide / 7) * 100}%` }} />
                </div>
                <div className="streak-text">{streaks.reframeGuide}/7 days</div>

                <img src="/Resource Images/3. Healthy mind habbits/thoughtreframing.png" alt="Thought Reframing" className="practice-image" />
                <div className="practice-title">Thought Reframing</div>
                <div className="practice-text">
                  Change negative thoughts into kinder, more helpful ones. See problems as chances to grow.
                </div>
                <button className="practice-open" onClick={() => setActiveModal('reframeGuide')}>Try it yourself</button>
                {completedToday['reframeGuide'] && <div className="lock-badge">Come back tomorrow</div>}
              </div>
              <div
                className="practice-card"
                role="button"
                tabIndex={0}
                onClick={() => { setFocusTimer(30); setFocusDotPosition({ x: 50, y: 50 }); setActiveModal('focus'); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFocusTimer(30); setFocusDotPosition({ x: 50, y: 50 }); setActiveModal('focus'); } }}
                aria-label="Open Focus Reset"
              >
                <img src="/Resource Images/3. Healthy mind habbits/focus.png" alt="Focus Reset" className="practice-image" />
                <div className="practice-title">Focus Reset</div>
                <div className="practice-text">
                  Bring your wandering mind back with a 30-second focus exercise. Track the moving dot to center your attention.
                </div>
                <button className="practice-open" onClick={() => { setFocusTimer(30); setFocusDotPosition({ x: 50, y: 50 }); setActiveModal('focus'); }}>Try it yourself</button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Connections */}
        <section id="connections" className="flex items-center justify-center py-6 relative z-10 mt-6">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 md:mb-10 text-center text-white drop-shadow-lg">
              Mind Connections
            </h2>

            {/* Desktop circular layout */}
            <div className="relative hidden md:block">
              {/* Central Moon */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <img
                  src="/Resource Images/3. Healthy mind habbits/connections.png"
                  alt="Connections"
                  className="w-80 md:w-100 h-80 md:h-100 object-contain"
                />
              </div>

              {/* Connection Lines */}
              <div className="relative w-full h-96">
                {[
                  // Move Stress Management further right (slightly) and a bit outward
                  { angle: 0, r: 85, title: 'Stress Management', tip: 'Use positive self-talk or breathing from the Stress Management Guide to calm worries.', color: 'from-purple-400 to-pink-400' },
                  // Keep Peer Support roughly where it was
                  { angle: 120, r: 55, title: 'Peer Support', tip: 'Share gratitude or reframed thoughts with friends to build stronger bonds.', color: 'from-blue-400 to-cyan-400' },
                  // Move Sleep & Relaxation further left and down
                  { angle: 200, r: 90, title: 'Sleep & Relaxation', tip: 'A positive mind helps you sleep better—try gratitude before bed to relax. 👉 These habits work together to make you feel balanced and strong.', color: 'from-green-400 to-teal-400' }
                ].map((connection, index) => {
                  const radians = (connection.angle * Math.PI) / 180;
                  const radius = typeof (connection as any).r === 'number' ? (connection as any).r : 55;
                  const x = 50 + radius * Math.cos(radians);
                  const y = 50 + radius * Math.sin(radians);

                  return (
                    <div key={index}>
                      {/* Connected Item */}
                      <div
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`
                        }}
                      >
                        <div
                          className={`bg-gradient-to-br ${connection.color} text-white rounded-2xl shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer group min-w-80 md:min-w-96`}
                          style={{ padding: '16px 24px' }}
                        >
                          <h3 className="text-base md:text-lg font-medium mb-2">{connection.title}</h3>
                          <p className="text-sm md:text-base opacity-90 group-hover:opacity-100 leading-relaxed">{connection.tip}</p>
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
                  src="/Resource Images/3. Healthy mind habbits/connections.png"
                  alt="Connections"
                  className="w-48 h-48 object-contain"
                />
              </div>

              {/* List of connections */}
              {[
                { title: 'Stress Management', tip: 'Use positive self-talk or breathing from the Stress Management Guide to calm worries.', color: 'from-purple-400 to-pink-400' },
                { title: 'Peer Support', tip: 'Share gratitude or reframed thoughts with friends to build stronger bonds.', color: 'from-blue-400 to-cyan-400' },
                { title: 'Sleep & Relaxation', tip: 'A positive mind helps you sleep better—try gratitude before bed to relax. 👉 These habits work together to make you feel balanced and strong.', color: 'from-green-400 to-teal-400' }
              ].map((connection, index) => (
                <div key={index} className={`bg-gradient-to-br ${connection.color} text-white p-5 rounded-2xl shadow-lg`}>
                  <h3 className="text-lg font-medium mb-2">{connection.title}</h3>
                  <p className="text-sm opacity-95 leading-relaxed">{connection.tip}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12 md:mt-16">
              <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow px-4">

              </p>
            </div>
          </div>
        </section>

        {/* Safety & Accessibility Section */}
        <section className="section safety-section">
          <div className="section-content">
            <h2>Safety & Accessibility</h2>
            <div className="safety-content">
              <div className="safety-message">
                <p className="section-text">
                  Having a bad day or negative thoughts is normal—everyone feels that way sometimes. These habits can help you handle them better, but they're not a fix for everything.
                </p>
                <p className="section-text">
                  If sad or worried thoughts last a long time, or make it hard to study, sleep, or enjoy things like family time or school festivals, talk to a parent, teacher, or counselor. You're not alone, and asking for help is a strong choice!
                </p>
              </div>
              <div className="support-cards">
                <div className="support-card">
                  <h3>Family Support</h3>
                  <p>Share your feelings during family meals or evening walks. Your parents and siblings care about you.</p>
                </div>
                <div className="support-card">
                  <h3>School Resources</h3>
                  <p>Teachers and counselors are there to help. Talk to them during breaks or after class.</p>
                </div>
                <div className="support-card">
                  <h3>Stay Connected</h3>
                  <p>Join school festivals, cultural events, or group activities. Being with friends helps you feel better.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* When to Ask for Help Section */}
        <section className="section help-section-wrapper">
          <div className="section-content">
            <h2>When to Ask for Help</h2>
            <div className="help-section">
              <div className="help-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                <img src="/Resource Images/1. Stress management images/buddycall.png" alt="Call for help" style={{ width: 220, height: 'auto', objectFit: 'contain' }} />
                <div className="help-cards">
                  <div className="help-card">
                    <h3>Childline India</h3>
                    <p>24/7 helpline for children and teenagers</p>
                    <a href="tel:1098" className="help-phone">Call: 1098</a>
                  </div>
                  <div className="help-card">
                    <h3>NIMHANS</h3>
                    <p>National Institute of Mental Health and Neurosciences</p>
                    <a href="tel:08046110007" className="help-phone">Call: 080-46110007</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Breathing Modal */}
        {activeModal === 'breathing' && (
          <div className="modal-overlay" onClick={resetModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={resetModals}>×</button>
              <h2>Breathing Exercise</h2>
              <p>Follow the bubble's rhythm for 30 seconds</p>

              <div className={`breathing-bubble ${breathingPhase}`}>
                <div className="breathing-text">
                  {breathingPhase === 'inhale' && 'Inhale calm...'}
                  {breathingPhase === 'hold' && 'Hold steady...'}
                  {breathingPhase === 'exhale' && 'Exhale stress...'}
                </div>
              </div>

              <p style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                {breathingTimer}s
              </p>

              {breathingTimer === 0 && (
                <p style={{ textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>
                  Great job! Your mind is clear and centered.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Positive Self-Talk Modal - Game */}
        {activeModal === 'selftalk' && (
          <div className="modal-overlay" onClick={resetModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={resetModals}>×</button>
              <h2>Positive Self-Talk</h2>
              <p className="section-text" style={{ marginTop: '0.5rem' }}>Type 3 kind sentences about yourself.</p>
              <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.75rem' }}>
                {selfTalkTexts.map((val, i) => (
                  <input
                    key={i}
                    ref={el => selfTalkInputRefs.current[i] = el}
                    value={val}
                    onChange={(e) => setSelfTalkTexts(arr => arr.map((x, idx) => idx === i ? e.target.value : x))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (i < selfTalkTexts.length - 1) {
                          selfTalkInputRefs.current[i + 1]?.focus();
                        }
                      }
                    }}
                    placeholder={'Write a kind sentence about yourself...'}
                    className="gratitude-input"
                    style={{ marginBottom: 0 }}
                    disabled={completedToday.selftalk}
                  />
                ))}
              </div>
              <div style={{ marginTop: '0.5rem', textAlign: 'right', fontSize: 12, color: '#6b7280' }}>{selfTalkTexts.filter(t => t.trim()).length}/3</div>
              {(selfTalkTexts.every(t => t.trim()) || completedToday.selftalk) && (
                <div style={{ marginTop: '0.75rem', textAlign: 'center', color: '#10b981', fontWeight: 800 }}>Nice! You practiced kind self-talk.</div>
              )}
            </div>
          </div>
        )}

        {/* Gratitude Practice Modal - Game */}
        {activeModal === 'gratitudePractice' && (
          <div className="modal-overlay" onClick={resetModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={resetModals}>×</button>
              <h2>Gratitude Practice</h2>
              <p className="section-text" style={{ marginTop: '0.5rem' }}>Add 2 things you’re thankful for.</p>
              {gratitudeGameItems.length < 2 && !completedToday.gratitudePractice && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <input
                    type="text"
                    ref={gratitudeInputRef}
                    className="gratitude-input"
                    placeholder="I’m thankful for..."
                    value={newGratitude}
                    onChange={(e) => setNewGratitude(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = newGratitude.trim();
                        if (val) {
                          setGratitudeGameItems(arr => [...arr, val]);
                          setNewGratitude('');
                        }
                      }
                    }}
                    style={{ flex: 1, marginBottom: 0 }}
                  />
                  <button className="gratitude-submit" style={{ width: 'auto' }} onClick={() => { if (newGratitude.trim()) { setGratitudeGameItems(arr => [...arr, newGratitude.trim()]); setNewGratitude(''); } }}>Add</button>
                </div>
              )}
              {gratitudeGameItems.length > 0 && (
                <div className="gratitude-list">
                  {gratitudeGameItems.map((g, i) => (
                    <div key={i} className="gratitude-item">{g}</div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: '0.5rem', textAlign: 'right', fontSize: 12, color: '#6b7280' }}>{Math.min(2, gratitudeGameItems.length)}/2</div>
              {(gratitudeGameItems.length >= 2 || completedToday.gratitudePractice) && (
                <div style={{ marginTop: '0.75rem', textAlign: 'center', color: '#10b981', fontWeight: 800 }}>Great! You completed today’s gratitude.</div>
              )}
            </div>
          </div>
        )}

        {/* Thought Reframing Modal - Game */}
        {activeModal === 'reframeGuide' && (
          <div className="modal-overlay" onClick={resetModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={resetModals}>×</button>
              <h2>Thought Reframing</h2>
              <p className="section-text" style={{ marginTop: '0.5rem' }}>Pick the kinder reframe for each negative thought.</p>
              <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.75rem' }}>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '0.75rem' }}>
                  <div style={{ fontWeight: 700, color: '#991b1b' }}>Negative Thought</div>
                  <div>{reframingQuestions[reframingIndex].neg}</div>
                </div>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {(() => {
                    const correctIdx = reframingQuestions[reframingIndex].correct;
                    return reframingQuestions[reframingIndex].options.map((opt, idx) => {
                      const isSelected = reframingSelectedIdx === idx;
                      const isCorrect = idx === correctIdx;
                      const baseStyle = { background: '#eef2ff', color: '#3730a3', border: '1px solid #c7d2fe' } as React.CSSProperties;
                      const selectedCorrectStyle = { background: '#dcfce7', color: '#14532d', border: '1px solid #86efac' } as React.CSSProperties;
                      const selectedWrongStyle = { background: '#fef3c7', color: '#7c2d12', border: '1px solid #fed7aa' } as React.CSSProperties;
                      const style = isSelected ? (isCorrect ? selectedCorrectStyle : selectedWrongStyle) : baseStyle;
                      return (
                        <button
                          key={idx}
                          className="gratitude-submit"
                          style={{ width: '100%', padding: '0.6rem 1rem', ...style }}
                          disabled={completedToday.reframeGuide || reframingCorrectChosen && isSelected}
                          onClick={() => {
                            if (completedToday.reframeGuide) return;
                            setReframingSelectedIdx(idx);
                            const correct = correctIdx === idx;
                            if (correct) {
                              setReframingFeedback('Great choice – that’s a kinder, helpful reframe.');
                              setReframingCorrectChosen(true);
                            } else {
                              setReframingFeedback('That sounds a bit harsh. Try the other option for a kinder reframe.');
                              setReframingCorrectChosen(false);
                            }
                          }}
                        >
                          {opt}
                        </button>
                      );
                    });
                  })()}
                </div>
                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ color: '#6b7280', fontSize: 12 }}>Question {Math.min(reframingQuestions.length, reframingIndex + 1)}/{reframingQuestions.length}</div>
                  <button
                    type="button"
                    className="gratitude-submit"
                    style={{ background: '#e5e7eb', color: '#374151', padding: '0.35rem 0.75rem', width: 'auto' }}
                    onClick={() => setShowReframeHint(v => !v)}
                  >
                    {showReframeHint ? 'Hide hint' : 'Need a hint?'}
                  </button>
                </div>
                {showReframeHint && (
                  <ul style={{ marginTop: '0.5rem', color: '#4b5563', fontSize: 14, paddingLeft: '1rem' }}>
                    {reframeHints.map((h, i) => (
                      <li key={i} style={{ listStyle: 'disc', marginTop: 2 }}>{h}</li>
                    ))}
                  </ul>
                )}
                {reframingFeedback && (
                  <div style={{ textAlign: 'center', color: reframingCorrectChosen ? '#059669' : '#b45309', fontWeight: 700, marginTop: '0.5rem' }}>{reframingFeedback}</div>
                )}
                {reframingCorrectChosen && (
                  <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem' }}>
                    <div style={{ background: '#ecfeff', border: '1px solid #a5f3fc', color: '#155e75', borderRadius: 10, padding: '0.75rem' }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Why this works</div>
                      <div>{reframeExplanations[reframingIndex]}</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="gratitude-submit"
                        style={{ width: 'auto', padding: '0.5rem 1rem', background: '#6366f1', color: '#ffffff' }}
                        onClick={async () => {
                          setShowReframeHint(false);
                          setReframingSelectedIdx(null);
                          if (reframingIndex >= reframingQuestions.length - 1) {
                            completeGameToday('reframeGuide');
                            setReframingFeedback('All done for today!');
                            if (userId) {
                              try {
                                await logReframe(userId, { finished: true });
                                const stats = await getHealthyMindStats(userId);
                                setStreaks(s => ({
                                  ...s,
                                  selftalk: Math.min(7, Number((stats as any)?.selfTalkStreak || 0)),
                                  gratitudePractice: Math.min(7, Number((stats as any)?.gratitudeStreak || 0)),
                                  reframeGuide: Math.min(7, Number((stats as any)?.reframeStreak || 0)),
                                }));
                                // Award badges for Thought Reframing
                                const reframeStreak = Number((stats as any)?.reframeStreak || 0);
                                try {
                                  if (reframeStreak >= 1 && !(await hasBadge(userId, 'reframing-first'))) {
                                    await awardBadge(userId, { key: 'reframing-first', name: 'First Reframe', icon: 'refresh-cw', description: 'Completed Thought Reframing once' });
                                  }
                                  if (reframeStreak >= 7 && !(await hasBadge(userId, 'reframing-pro'))) {
                                    await awardBadge(userId, { key: 'reframing-pro', name: 'Reframing Pro', icon: 'refresh-cw', description: '7-day Thought Reframing streak' });
                                  }
                                } catch { }
                              } catch (e) {
                                console.error('Error logging reframe finish', e);
                              }
                            }
                          } else {
                            setReframingIndex(i => i + 1);
                            setReframingCorrectChosen(false);
                            setReframingFeedback('');
                          }
                        }}
                      >
                        {reframingIndex >= reframingQuestions.length - 1 ? 'Finish Today' : 'Next'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {completedToday.reframeGuide && (
                <div style={{ marginTop: '0.75rem', textAlign: 'center', color: '#10b981', fontWeight: 800 }}>Great! Come back tomorrow to continue your streak.</div>
              )}
            </div>
          </div>
        )}

        {/* Gratitude Modal */}
        {activeModal === 'gratitude' && (
          <div className="modal-overlay" onClick={resetModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={resetModals}>×</button>
              <h2>Gratitude Garden</h2>
              <p>What are you thankful for today?</p>

              <input
                type="text"
                className="gratitude-input"
                placeholder="Type something you're grateful for..."
                value={newGratitude}
                onChange={(e) => setNewGratitude(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGratitudeSubmit()}
              />

              <button className="gratitude-submit" onClick={handleGratitudeSubmit}>
                Add to Garden
              </button>

              {gratitudeItems.length > 0 && (
                <div className="gratitude-list">
                  {gratitudeItems.map((item, index) => (
                    <div key={index} className="gratitude-item">
                      {item}
                    </div>
                  ))}
                </div>
              )}

              <p style={{ textAlign: 'center', marginTop: '1rem', color: '#10b981', fontWeight: 'bold' }}>
                Kind thoughts make strong roots.
              </p>
            </div>
          </div>
        )}

        {/* Focus Modal */}
        {activeModal === 'focus' && (
          <div className="modal-overlay" onClick={resetModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.25rem', maxHeight: '85vh' }}>
              <button className="close-button" onClick={resetModals}>×</button>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Focus Reset</h2>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Track the glowing dot with your eyes for 30 seconds</p>

              <div className="focus-area" style={{ width: '240px', height: '240px', margin: '1rem auto' }}>
                <div
                  className="focus-dot"
                  style={{
                    left: `${focusDotPosition.x}%`,
                    top: `${focusDotPosition.y}%`,
                  }}
                ></div>
              </div>

              <p style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: '#8b5cf6', marginTop: '0.75rem' }}>
                {focusTimer}s
              </p>

              {focusTimer === 0 && (
                <p style={{ textAlign: 'center', color: '#10b981', fontWeight: 'bold', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                  Excellent focus! Your mind is clear and centered.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MindRefresh;