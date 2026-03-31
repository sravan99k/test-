import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Clock, Target, Lightbulb, Trophy, Calendar, Sun, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { saveFocusStudyPlan, getFocusStudyPlans, deleteFocusStudyPlan } from '@/services/resourcesService';

const StudyFocusSuperpower: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.uid || '';
  const [activeSection, setActiveSection] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes in seconds
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroRemaining, setPomodoroRemaining] = useState(pomodoroTime);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [resetProgress, setResetProgress] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameTime, setGameTime] = useState(30);
  const [gameRemaining, setGameRemaining] = useState(gameTime);
  const [dotPosition, setDotPosition] = useState({ x: 50, y: 50 });
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [taskOrder, setTaskOrder] = useState(['Math', 'Science', 'Break', 'English']);
  // New state for Study Planner (cloned + prioritization)
  const [spTopic, setSpTopic] = useState('');
  const [spSplitType, setSpSplitType] = useState<'pages' | 'problems' | 'sections' | 'topics' | 'chapters'>('pages');
  const [spTotalUnits, setSpTotalUnits] = useState<number>(0);
  const [spTimeAvailable, setSpTimeAvailable] = useState<number | ''>('');
  const [spChunkCount, setSpChunkCount] = useState<number | ''>('');
  const [spPlan, setSpPlan] = useState<Array<{ index: number; range: string; microGoal: string; checkpoint: string; minutes: number; summary: string; difficulty: 'Easy' | 'Medium' | 'Hard' }>>([]);
  const [spPlanVisible, setSpPlanVisible] = useState<boolean>(true);
  const [spSavedPlans, setSpSavedPlans] = useState<any[]>([]);
  const [spBanner, setSpBanner] = useState<string>('');
  const [spLoading, setSpLoading] = useState<boolean>(false);
  const [spDragIndex, setSpDragIndex] = useState<number | null>(null);
  // New state for Readiness + Pomodoro modal
  const readinessMaster = ['Table clean', 'Materials ready', 'Phone away', 'Quiet space', 'Water ready'];
  const [readyPool, setReadyPool] = useState<string[]>(readinessMaster);
  const [readyBox, setReadyBox] = useState<string[]>([]);
  const [readyNewItem, setReadyNewItem] = useState('');
  const [editableMinutes, setEditableMinutes] = useState<number>(25);
  const [challengeProgress, setChallengeProgress] = useState(
    Array.from({ length: 7 }, (_, i) => ({ day: i + 1, completed: false }))
  );
  const [focusQuestStarted, setFocusQuestStarted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const readyBoxRef = useRef<HTMLDivElement | null>(null);
  const lastSetMinutesRef = useRef<number>(25);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const plans = await getFocusStudyPlans(userId);
        setSpSavedPlans(plans);
      } catch (e) {
        console.error('Failed to load focus study plans', e);
      }
    })();
  }, [userId]);

  // Audio context for sound effects
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);


  const playSound = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!soundEnabled || !audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  }, [soundEnabled]);


  // Pomodoro Timer Logic (no sounds)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const readyBoxFull = readyPool.length === 0 && readyBox.length > 0;
    if (pomodoroRunning && readyBoxFull && pomodoroRemaining > 0) {
      interval = setInterval(() => {
        setPomodoroRemaining(prev => prev - 1);
      }, 1000);
    } else if (pomodoroRemaining === 0 && pomodoroRunning) {
      setPomodoroRunning(false);
      alert('Break time! You earned it! 🥤');
    }
    return () => clearInterval(interval);
  }, [pomodoroRunning, pomodoroRemaining, readyPool.length, readyBox.length]);

  // Focus Game Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameActive && gameRemaining > 0) {
      interval = setInterval(() => {
        setGameRemaining(prev => prev - 1);
        // Move dot along a curved path
        const time = (gameTime - gameRemaining) / gameTime;
        const x = 50 + 30 * Math.cos(time * 6.28);
        const y = 50 + 20 * Math.sin(time * 9.42);
        setDotPosition({ x, y });
      }, 1000);
    } else if (gameRemaining === 0 && gameActive) {
      setGameActive(false);
      playSound(1000, 0.3);
      setTimeout(() => playSound(1500, 0.3), 150);
      setTimeout(() => playSound(2000, 0.5), 300);
    }
    return () => clearInterval(interval);
  }, [gameActive, gameRemaining, gameTime, playSound]);

  // Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionIndex = parseInt(entry.target.getAttribute('data-section') || '0');
            setActiveSection(sectionIndex);
          }
        });
      },
      { threshold: 0.5 }
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (index: number) => {
    const section = document.querySelector(`[data-section="${index}"]`) as HTMLElement | null;
    if (!section) return;
    const offset = 100; // pixels to keep the section a little higher (scroll less down)
    const rect = section.getBoundingClientRect();
    const targetY = rect.top + window.pageYOffset - offset;
    window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
  };

  const startFocusQuest = () => {
    setFocusQuestStarted(true);
    setTimeout(() => scrollToSection(1), 500);
    playSound(800, 0.2);
  };

  const startPomodoro = () => {
    setPomodoroRunning(true);
    playSound(1000, 0.3);
  };

  const pausePomodoro = () => {
    setPomodoroRunning(false);
    playSound(600, 0.2);
  };

  const resetPomodoro = () => {
    setPomodoroRunning(false);
    setPomodoroRemaining(pomodoroTime);
    playSound(500, 0.2);
  };

  // Study Planner: chunk generator (clone-like logic)
  const spTemplateForSplit = (st: typeof spSplitType) => {
    if (st === 'problems') {
      return {
        micro: (range: string) => `Solve ${range.toLowerCase()} and mark questions to revisit.`,
        check: (range: string) => `Explain the method for one problem from ${range.toLowerCase()} in your own words.`
      };
    }
    return {
      micro: (range: string) => `Read ${range.toLowerCase()} and note 3 key points or definitions.`,
      check: (range: string) => `Summarize one key idea from ${range.toLowerCase()} in 2 sentences.`
    };
  };
  const spGeneratePlan = () => {
    const units = Math.max(0, Number(spTotalUnits) || 0);
    if (!spTopic.trim() || units <= 0) { alert('Please enter a topic and a valid number of items.'); return; }
    const defaultMinutes = 25;
    let baseChunks = typeof spChunkCount === 'number' && spChunkCount > 0 ? spChunkCount : 4;
    if (typeof spChunkCount !== 'number' && typeof spTimeAvailable === 'number' && spTimeAvailable > 0) {
      if (spTimeAvailable < 45) baseChunks = Math.max(3, baseChunks - 1);
      if (spTimeAvailable > 120) baseChunks = Math.min(6, baseChunks + 1);
    }
    baseChunks = Math.min(Math.max(baseChunks, 2), Math.min(units, 8));
    const size = Math.max(1, Math.floor(units / baseChunks));
    const tmpl = spTemplateForSplit(spSplitType);
    const hasTotal = typeof spTimeAvailable === 'number' && spTimeAvailable > 0;
    const chunks: Array<{ index: number; range: string; microGoal: string; checkpoint: string; minutes: number; summary: string; difficulty: 'Easy' | 'Medium' | 'Hard' }> = [];
    let start = 1;
    let base = 0; let rem = 0;
    if (hasTotal) { base = Math.floor((spTimeAvailable as number) / baseChunks); rem = (spTimeAvailable as number) - base * baseChunks; }
    for (let i = 0; i < baseChunks; i++) {
      const end = i === baseChunks - 1 ? units : Math.min(units, start + size - 1);
      const unitLabel = ({ pages: 'Pages', problems: 'Problems', sections: 'Sections', topics: 'Topics', chapters: 'Chapters' } as Record<string, string>)[spSplitType] || 'Items';
      const range = `${unitLabel} ${start}–${end}`;
      chunks.push({ index: i + 1, range, microGoal: tmpl.micro(range), checkpoint: tmpl.check(range), minutes: hasTotal ? (base + (i < rem ? 1 : 0)) : defaultMinutes, summary: '', difficulty: 'Medium' });
      start = end + 1; if (start > units) break;
    }
    setSpPlan(chunks);
    setSpPlanVisible(true);
    playSound(900, 0.2);
  };
  const spAdjustMinutes = (chunkIndex: number, val: number) => {
    const input = Math.round(Number(val) || 0);
    if (!(typeof spTimeAvailable === 'number' && spTimeAvailable > 0) || spPlan.length <= 1) {
      setSpPlan(arr => arr.map(x => x.index === chunkIndex ? { ...x, minutes: input } : x));
      return;
    }
    const total = spTimeAvailable as number; const others = spPlan.length - 1; const edited = Math.max(0, Math.min(total, input));
    let remaining = total - edited; const even = Math.floor(remaining / others); let remainder = remaining - even * others;
    setSpPlan(arr => arr.map(x => {
      if (x.index === chunkIndex) return { ...x, minutes: edited };
      const assign = even + (remainder > 0 ? 1 : 0); if (remainder > 0) remainder--; return { ...x, minutes: assign };
    }));
  };
  const spSavePlan = async () => {
    if (!userId) { alert('Please sign in to save your plan'); return; }
    setSpLoading(true);
    try {
      const entry = { topic: spTopic, splitType: spSplitType, totalUnits: spTotalUnits, timeAvailable: spTimeAvailable, chunkCount: spChunkCount, plan: spPlan };
      await saveFocusStudyPlan(userId, entry);
      const plans = await getFocusStudyPlans(userId);
      setSpSavedPlans(plans);
      setSpBanner('Plan saved to cloud');
      setTimeout(() => setSpBanner(''), 2000);
      setSpPlanVisible(false);
    } catch (e) {
      console.error('Error saving focus study plan', e);
      setSpBanner('Error saving plan');
      setTimeout(() => setSpBanner(''), 2500);
    } finally {
      setSpLoading(false);
    }
  };
  const spDeleteSaved = async (id: string) => {
    if (!userId) return;
    try {
      await deleteFocusStudyPlan(userId, id);
      setSpSavedPlans(prev => prev.filter((p: any) => p.id !== id));
    } catch (e) {
      console.error('Error deleting focus study plan', e);
    }
  };
  const spLoadSaved = (id: string) => {
    const found = spSavedPlans.find((p: any) => p.id === id); if (!found) return;
    setSpTopic(found.topic); setSpSplitType(found.splitType); setSpTotalUnits(0); setSpTimeAvailable(found.timeAvailable); setSpChunkCount(found.chunkCount); setSpPlan(found.plan); setSpPlanVisible(true);
  };
  const spPrintPlan = () => {
    const popup = window.open('', '_blank'); if (!popup) return;
    popup.document.write(`<pre style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; white-space: pre-wrap; line-height: 1.6; padding: 16px;">${[
      `Study Plan: ${spTopic}`,
      `Split by: ${spSplitType}${spTimeAvailable ? ` | Time: ${spTimeAvailable} min` : ''}${spChunkCount ? ` | Chunks: ${spChunkCount}` : ''}`,
      '',
      ...spPlan.map(p => `Chunk ${p.index}: ${p.range}\n- Time: ~${p.minutes} min\n- Micro-goal: ${p.microGoal}\n- Checkpoint: ${p.checkpoint}\n- Summary: ${p.summary || '(to fill)'}\n`)
    ].join('\n')}</pre>`);
    popup.print();
  };
  const spOnDragStart = (i: number) => setSpDragIndex(i);
  const spOnDragOver = (e: React.DragEvent) => e.preventDefault();
  const spOnDrop = (target: number) => {
    if (spDragIndex === null || spDragIndex === target) return;
    const arr = [...spPlan];
    const [moved] = arr.splice(spDragIndex, 1);
    arr.splice(target, 0, moved);
    // reindex
    const re = arr.map((x, idx) => ({ ...x, index: idx + 1 }));
    setSpPlan(re);
    setSpDragIndex(null);
    playSound(800, 0.15);
  };

  const spSortByDifficulty = () => {
    const order = { 'Hard': 0, 'Medium': 1, 'Easy': 2 } as Record<string, number>;
    const sorted = [...spPlan].sort((a, b) => order[a.difficulty] - order[b.difficulty]);
    const re = sorted.map((x, idx) => ({ ...x, index: idx + 1 }));
    setSpPlan(re);
  };

  const onReadyDragStart = (e: React.DragEvent, item: string) => {
    e.dataTransfer.setData('text/plain', item);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onReadyDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const item = e.dataTransfer.getData('text/plain');
    if (!item) return;
    if (readyBox.includes(item)) return;

    setReadyPool(prev => prev.filter(x => x !== item));
    setReadyBox(prev => {
      const next = [...prev];
      const container = readyBoxRef.current;
      if (!container || container.children.length === 0) {
        next.push(item);
        return next;
      }

      const rects = Array.from(container.children).map(child =>
        (child as HTMLElement).getBoundingClientRect()
      );
      const { clientX, clientY } = e;

      // Find the nearest chip to the drop point and insert before it.
      let insertIndex = next.length;
      let bestDistance = Number.POSITIVE_INFINITY;
      rects.forEach((r, idx) => {
        const centerX = r.left + r.width / 2;
        const centerY = r.top + r.height / 2;
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        const dist = dx * dx + dy * dy;
        if (dist < bestDistance) {
          bestDistance = dist;
          insertIndex = idx;
        }
      });

      next.splice(insertIndex, 0, item);
      return next;
    });
  };
  const onReadyDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const startMindReset = () => {
    setResetProgress(0);
    const interval = setInterval(() => {
      setResetProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          playSound(1200, 0.5);
          return 100;
        }
        return prev + 1;
      });
    }, 60);
  };

  const startFocusGame = () => {
    setGameActive(true);
    setGameRemaining(gameTime);
    playSound(1000, 0.3);
  };

  const toggleTask = (taskId: string) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks(prev => [...prev, taskId]);
      playSound(1000, 0.2);

      if (completedTasks.length === 2) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        setTimeout(() => {
          playSound(1200, 0.3);
          setTimeout(() => playSound(1600, 0.3), 200);
          setTimeout(() => playSound(2000, 0.5), 400);
        }, 500);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, task: string) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetTask: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask !== targetTask) {
      const newOrder = [...taskOrder];
      const draggedIndex = newOrder.indexOf(draggedTask);
      const targetIndex = newOrder.indexOf(targetTask);
      [newOrder[draggedIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[draggedIndex]];
      setTaskOrder(newOrder);
      playSound(800, 0.2);
    }
    setDraggedTask(null);
  };

  const markDayComplete = (day: number) => {
    setChallengeProgress(prev =>
      prev.map(d => d.day === day ? { ...d, completed: true } : d)
    );
    playSound(1000, 0.3);

    const allCompleted = challengeProgress.filter(d => d.day !== day).every(d => d.completed);
    if (allCompleted) {
      setTimeout(() => {
        playSound(1200, 0.3);
        setTimeout(() => playSound(1600, 0.3), 200);
        setTimeout(() => playSound(2000, 0.3), 400);
        setTimeout(() => playSound(2400, 0.8), 600);
      }, 500);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          background: linear-gradient(135deg, #4A90E2 0%, #7B68EE 50%, #4A90E2 100%) !important;
          background-size: 300% 300% !important;
          animation: gradientShift 15s ease infinite !important;
        }

        body {
          background: linear-gradient(135deg, #4A90E2 0%, #7B68EE 50%, #4A90E2 100%) !important;
          background-size: 300% 300% !important;
          animation: gradientShift 15s ease infinite !important;
          overflow-x: hidden;
        }

        .app {
          min-height: 100vh;
          position: relative;
          background: linear-gradient(135deg, #4A90E2 0%, #7B68EE 50%, #4A90E2 100%);
          background-size: 300% 300%;
          animation: gradientShift 15s ease infinite;
        }

        

        /* Section Base Styles */
        .section {
          min-height: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 0;
          margin: 0;
          overflow: visible;
        }

        /* Remove only the outer top/bottom margins contributed by direct children */
        .section > *:first-child { margin-top: 0 !important; }
        .section > *:last-child { margin-bottom: 0 !important; }

        /* Also trim outer margins at the content level to prevent nested margin bleed */
        .section .section-content > *:first-child { margin-top: 0 !important; }
        .section .section-content > *:last-child { margin-bottom: 0 !important; }

        .section-content {
          max-width: 1000px;
          text-align: center;
          z-index: 10;
        }

        .section-title {
          font-size: 3rem;
          font-weight: 700;
          background: linear-gradient(135deg, #FFD93D, #FFA500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1.5rem;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .section-subtitle {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .section-description {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Hero Section */
        .hero-section {
          background: transparent;
          text-align: center;
          min-height: 100vh;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }

        .floating-elements {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .floating-element {
          position: absolute;
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        .element-0 { top: 10%; left: 10%; animation-delay: 0s; }
        .element-1 { top: 20%; right: 15%; animation-delay: 1s; }
        .element-2 { top: 60%; left: 5%; animation-delay: 2s; }
        .element-3 { bottom: 20%; right: 10%; animation-delay: 3s; }
        .element-4 { top: 40%; left: 20%; animation-delay: 4s; }
        .element-5 { top: 70%; right: 20%; animation-delay: 5s; }
        .element-6 { bottom: 10%; left: 30%; animation-delay: 1.5s; }
        .element-7 { top: 30%; right: 30%; animation-delay: 3.5s; }

        .hero-content {
          position: relative;
          z-index: 10;
        }

        .hero-title {
          margin-bottom: 2rem;
        }

        .title-fade {
          display: block;
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 400;
          animation: fadeInUp 1s ease 0s both;
        }

        .title-main {
          display: block;
          font-size: 4rem;
          font-weight: 700;
          background: linear-gradient(135deg, #FFD93D, #FFA500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: fadeInUp 1s ease 0s both;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 3rem;
          animation: fadeInUp 1s ease 0s both;
        }

        .cta-button {
          background: linear-gradient(135deg, #FFD93D, #FFA500);
          border: none;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          animation: fadeInUp 1s ease 0s both;
        }

        .cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(255, 217, 61, 0.4);
        }

        .cta-arrow {
          animation: bounce 2s infinite;
        }

        /* Power Section */
        .power-section {
          background: transparent;
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .focus-card {
          border-radius: 1rem;
          padding: 1.25rem 1.5rem;
          color: #0f172a;
          box-shadow: none;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          cursor: default;
          transition: transform 0.2s ease;
        }

        .focus-card:hover {
          transform: translateY(-4px);
        }

        .card-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          display: block;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 1rem;
        }

        .card-text {
          color: #111827;
          line-height: 1.6;
        }

        /* Pomodoro Section */
        .pomodoro-section {
          background: transparent;
        }

        .feature-button {
          background: linear-gradient(135deg, #FFD93D, #FFA500);
          border: none;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          margin-top: 2rem;
        }

        .feature-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(255, 217, 61, 0.4);
        }

        .button-icon {
          width: 20px;
          height: 20px;
        }

        /* Wins Section */
        .wins-section {
          background: transparent;
        }

        .tasks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 3rem;
        }

        .task-note {
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          padding: 1.5rem;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          font-weight: 500;
        }

        .task-note:hover {
          transform: rotate(-2deg) scale(1.05);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .task-note.completed {
          background: linear-gradient(135deg, #4CAF50, #45a049);
          color: white;
          transform: rotate(2deg) scale(1.02);
        }

        .checkmark {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .success-message {
          margin-top: 2rem;
          padding: 2rem;
          background: linear-gradient(135deg, #FFD93D, #FFA500);
          border-radius: 20px;
          animation: pulse 2s infinite;
        }

        .success-text {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
        }

        /* Reset Section */
        .reset-section {
          background: transparent;
        }

        /* Game Section */
        .game-section {
          background: transparent;
        }

        /* Prioritize Section */
        .prioritize-section {
          background: transparent;
        }

        .task-cards {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 3rem;
          align-items: center;
        }

        .task-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          padding: 1.5rem 2rem;
          color: white;
          cursor: move;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
          width: 100%;
          max-width: 400px;
        }

        .task-card:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: scale(1.02);
        }

        .task-number {
          background: linear-gradient(135deg, #FFD93D, #FFA500);
          color: #333;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .task-name {
          font-weight: 500;
          flex: 1;
        }

        /* Challenge Section */
        .challenge-section {
          background: transparent;
        }

        .timeline {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 3rem;
          flex-wrap: wrap;
        }

        .timeline-day {
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .day-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .timeline-day:hover .day-circle {
          transform: scale(1.1);
          border-color: #FFD93D;
        }

        .timeline-day.completed .day-circle {
          background: linear-gradient(135deg, #FFD93D, #FFA500);
          color: #333;
          box-shadow: 0 0 20px rgba(255, 217, 61, 0.5);
        }

        .day-stars {
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 1.2rem;
          animation: sparkle 2s infinite;
        }

        .badge-earned {
          margin-top: 3rem;
          padding: 2rem;
          background: linear-gradient(135deg, #FFD93D, #FFA500);
          border-radius: 20px;
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
          animation: pulse 2s infinite;
        }

        /* Final Section */
        .final-section {
          background: transparent;
        }

        /* Spacing adjustments per user request */
        .connections-section { margin-top: 24px; }
        .help-section-wrapper { margin-top: 100px; margin-bottom: 0; padding-bottom: 50px; }

        .affirmation {
          font-size: 2rem;
          font-weight: 500;
          color: white;
          margin-top: 3rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: fadeInUp 2s ease;
        }

        /* Modals */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(5px);
          overflow-y: auto; /* allow page-style scroll to keep modal in view */
          padding: clamp(8px, 2vh, 20px);
        }

        .modal {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 25px;
          padding: clamp(16px, 3vw, 28px);
          max-width: min(720px, 95vw);
          width: 100%;
          max-height: none; /* modal itself doesn't scroll */
          overflow: visible;
          position: relative;
          animation: modalSlideIn 0.3s ease;
        }
        .modal.no-scroll { max-height: none; overflow: visible; }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 1rem;
        }

        .modal-header h3 {
          color: #333;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 2rem;
          color: #999;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          color: #333;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 50%;
        }

        /* Pomodoro Modal */
        .timer-circle {
          width: 200px;
          height: 200px;
          border: 8px solid #f0f0f0;
          border-top: 8px solid #4A90E2;
          border-radius: 50%;
          margin: 2rem auto;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: spin 60s linear infinite;
          position: relative;
        }

        .timer-display {
          font-size: 2rem;
          font-weight: 600;
          color: #333;
          font-family: 'Courier New', monospace;
        }

        .timer-controls {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }

        .control-button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .control-button.primary {
          background: linear-gradient(135deg, #4CAF50, #45a049);
          color: white;
        }

        .control-button.secondary {
          background: linear-gradient(135deg, #FFA500, #FF8C00);
          color: white;
        }

        .control-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        /* Reset Modal */
        .breathing-guide {
          display: flex;
          justify-content: center;
          margin: 2rem 0;
        }

        .breathing-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4A90E2, #7B68EE);
          transition: transform 0.1s ease;
          position: relative;
        }

        .breathing-circle::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
        }

        .progress-bar {
          width: 100%;
          height: 10px;
          background: #f0f0f0;
          border-radius: 5px;
          overflow: hidden;
          margin: 2rem 0;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #4CAF50, #45a049);
          transition: width 0.1s ease;
          border-radius: 5px;
        }

        .reset-checklist {
          margin: 2rem 0;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem 0;
          color: #666;
          transition: all 0.3s ease;
        }

        .checklist-item.checked {
          color: #4CAF50;
        }

        .checklist-item .checkmark {
          font-weight: bold;
          color: #4CAF50;
        }

        .reset-complete {
          text-align: center;
          padding: 1.5rem;
          background: linear-gradient(135deg, #4CAF50, #45a049);
          color: white;
          border-radius: 15px;
          font-weight: 600;
          font-size: 1.1rem;
        }

        /* Game Modal */
        .game-area {
          text-align: center;
          margin: 2rem 0;
        }

        .game-timer {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 2rem;
        }

        .game-grid {
          width: 300px;
          height: 300px;
          border: 2px solid #ddd;
          border-radius: 15px;
          position: relative;
          margin: 0 auto;
          background: linear-gradient(135deg, #f8f9ff, #e8eaff);
          overflow: hidden;
        }

        .focus-dot {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #FFD93D, #FFA500);
          border-radius: 50%;
          position: absolute;
          transition: all 0.1s ease;
          box-shadow: 0 0 15px rgba(255, 217, 61, 0.6);
        }

        .game-complete {
          text-align: center;
          padding: 1.5rem;
          background: linear-gradient(135deg, #4CAF50, #45a049);
          color: white;
          border-radius: 15px;
          font-weight: 600;
          font-size: 1.1rem;
          margin-top: 2rem;
        }

        /* Focus Practices grid (similar to MindRefresh key practices) */
        .focus-practices-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(320px, 1fr));
          gap: 1.25rem;
          margin-top: 1rem;
          justify-items: center;
          width: 100%;
        }
        @media (max-width: 900px) {
          .focus-practices-grid {
            grid-template-columns: 1fr;
          }
        }
        .focus-practice-card {
          background: #ffffffcc;
          backdrop-filter: blur(6px);
          border: 1px solid rgba(99,102,241,0.12);
          border-radius: 16px;
          padding: 1.25rem 1.25rem 1.75rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          position: relative;
          min-height: 340px;
          width: 100%;
          max-width: 460px;
        }
        .practice-title { font-weight: 800; color: #1f2937; margin: 0.9rem 0 0.5rem; font-size: 1.4rem; text-align: center; }
        .practice-text { color: #4b5563; line-height: 1.75; font-size: 1.15rem; text-align: center; }
        .practice-open {
          margin-top: auto;
          margin-left: auto;
          margin-right: auto;
          display: block;
          background: linear-gradient(45deg, #a855f7, #3b82f6);
          color: white;
          border: none;
          padding: 0.7rem 1.15rem;
          border-radius: 9999px;
          font-weight: 700;
          cursor: pointer;
          font-size: 1.05rem;
        }

        /* Confetti */
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1500;
        }

        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #FFD93D, #FFA500);
          animation: confettiFall 3s linear forwards;
        }

        /* Animations */
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

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-5px);
          }
          60% {
            transform: translateY(-3px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0.5;
            transform: translateX(-50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateX(-50%) scale(1.2);
          }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          /* Typography */
          .section-title {
            font-size: 2.25rem;
            margin-bottom: 1.25rem;
          }
          
          .title-main {
            font-size: 2.75rem;
            line-height: 1.2;
          }

          .title-fade {
            font-size: 1.25rem;
          }

          .hero-subtitle {
            font-size: 1.15rem;
            margin-bottom: 2.5rem;
          }

          .section-subtitle {
            font-size: 1.1rem;
          }

          .section-description {
            font-size: 1rem;
            margin-bottom: 1.5rem;
          }

          /* Buttons */
          .cta-button,
          .feature-button {
            padding: 0.85rem 1.75rem;
            font-size: 1.05rem;
          }

          .practice-open {
            padding: 0.65rem 1.1rem;
            font-size: 1rem;
          }
          
          /* Layout */
          .section {
            padding: 0;
          }

          .section-content {
            padding: 0 1rem;
          }
          
          /* Cards */
          .card-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            margin-top: 2rem;
          }

          .focus-card {
            padding: 1.15rem 1.35rem;
          }

          .card-icon {
            font-size: 2.5rem;
            margin-bottom: 0.85rem;
          }

          .card-title {
            font-size: 1.35rem;
            margin-bottom: 0.85rem;
          }

          .card-text {
            font-size: 1rem;
          }

          /* Practice cards */
          .focus-practice-card {
            padding: 1.15rem 1.15rem 1.65rem;
            min-height: 320px;
            max-width: 100%;
          }

          .practice-title {
            font-size: 1.3rem;
            margin: 0.8rem 0 0.45rem;
          }

          .practice-text {
            font-size: 1.1rem;
          }
          
          /* Timeline */
          .timeline {
            gap: 1.25rem;
          }
          
          .timeline-day .day-circle {
            width: 52px;
            height: 52px;
            font-size: 1.05rem;
          }

          .day-label {
            font-size: 0.85rem;
          }
          
          /* Modal */
          .modal {
            width: 92%;
            padding: 1.5rem;
            max-height: 85vh;
          }

          .modal-content {
            padding: 0.5rem;
          }

          .modal-title {
            font-size: 1.5rem;
          }
          
          /* Timer */
          .timer-circle {
            width: 160px;
            height: 160px;
          }
          
          .timer-display {
            font-size: 1.6rem;
          }
          
          /* Game */
          .game-grid {
            width: 260px;
            height: 260px;
          }

          .focus-dot {
            width: 18px;
            height: 18px;
          }

          .game-timer {
            font-size: 1.35rem;
          }
          
          /* Tasks */
          .tasks-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }

          .task-note {
            padding: 1.35rem;
          }

          .task-card {
            padding: 1.35rem 1.75rem;
            max-width: 100%;
          }

          /* Breathing */
          .breathing-circle {
            width: 140px;
            height: 140px;
          }

          /* Progress */
          .progress-bar {
            margin: 1.5rem 0;
          }
        }

        @media (max-width: 480px) {
          /* Typography - smaller */
          .section-title {
            font-size: 1.85rem;
            margin-bottom: 1rem;
          }
          
          .title-main {
            font-size: 2.25rem;
            line-height: 1.15;
          }

          .title-fade {
            font-size: 1.1rem;
          }
          
          .hero-subtitle {
            font-size: 1.05rem;
            margin-bottom: 2rem;
          }

          .section-subtitle {
            font-size: 1rem;
            margin-bottom: 0.85rem;
          }

          .section-description {
            font-size: 0.95rem;
            margin-bottom: 1.25rem;
          }
          
          /* Buttons - touch friendly */
          .cta-button,
          .feature-button {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            min-height: 44px;
          }

          .practice-open {
            padding: 0.6rem 1rem;
            font-size: 0.95rem;
            min-height: 44px;
          }

          /* Layout - tighter */
          .section-content {
            padding: 0 0.75rem;
          }

          /* Cards - smaller */
          .card-grid {
            gap: 1.25rem;
            margin-top: 1.5rem;
          }

          .focus-card {
            padding: 1rem 1.25rem;
          }

          .card-icon {
            font-size: 2.25rem;
            margin-bottom: 0.75rem;
          }

          .card-title {
            font-size: 1.25rem;
            margin-bottom: 0.75rem;
          }

          .card-text {
            font-size: 0.95rem;
            line-height: 1.5;
          }

          /* Practice cards */
          .focus-practice-card {
            padding: 1rem 1rem 1.5rem;
            min-height: 300px;
          }

          .practice-title {
            font-size: 1.2rem;
            margin: 0.75rem 0 0.4rem;
          }

          .practice-text {
            font-size: 1.05rem;
          }

          /* Timeline - compact */
          .timeline {
            gap: 1rem;
          }

          .timeline-day .day-circle {
            width: 48px;
            height: 48px;
            font-size: 1rem;
          }

          .day-label {
            font-size: 0.8rem;
          }
          
          /* Modal - full width */
          .modal {
            width: 96%;
            padding: 1.25rem;
            max-height: 88vh;
            border-radius: 16px;
          }

          .modal-content {
            padding: 0.35rem;
          }

          .modal-title {
            font-size: 1.35rem;
          }

          .modal-close {
            width: 32px;
            height: 32px;
            font-size: 1.5rem;
          }
          
          /* Timer - smaller */
          .timer-circle {
            width: 130px;
            height: 130px;
          }
          
          .timer-display {
            font-size: 1.35rem;
          }
          
          /* Game - smaller */
          .game-grid {
            width: 220px;
            height: 220px;
          }

          .focus-dot {
            width: 16px;
            height: 16px;
          }

          .game-timer {
            font-size: 1.25rem;
            margin-bottom: 1.5rem;
          }

          /* Tasks */
          .tasks-grid {
            gap: 1rem;
            margin-top: 2rem;
          }

          .task-note {
            padding: 1.25rem;
            font-size: 0.95rem;
          }

          .task-card {
            padding: 1.25rem 1.5rem;
          }

          .task-number {
            width: 28px;
            height: 28px;
            font-size: 0.85rem;
          }

          .task-name {
            font-size: 0.95rem;
          }

          /* Breathing */
          .breathing-circle {
            width: 120px;
            height: 120px;
          }

          /* Progress */
          .progress-bar {
            height: 8px;
            margin: 1.25rem 0;
          }

          /* Success message */
          .success-message {
            padding: 1.5rem;
            margin-top: 1.5rem;
          }

          .success-text {
            font-size: 1.25rem;
          }

          /* Checklist */
          .checklist-item {
            gap: 0.75rem;
            padding: 0.4rem 0;
            font-size: 0.95rem;
          }

          .reset-complete,
          .game-complete {
            padding: 1.25rem;
            font-size: 1.05rem;
          }
        }

        @media (max-width: 360px) {
          /* Extra small devices */
          .section-title {
            font-size: 1.65rem;
          }

          .title-main {
            font-size: 2rem;
          }

          .title-fade {
            font-size: 1rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .section-content {
            padding: 0 0.5rem;
          }

          .cta-button,
          .feature-button {
            padding: 0.65rem 1.25rem;
            font-size: 0.95rem;
          }

          .focus-practice-card {
            min-height: 280px;
          }

          .modal {
            padding: 1rem;
          }

          .timer-circle {
            width: 110px;
            height: 110px;
          }

          .timer-display {
            font-size: 1.2rem;
          }

          .game-grid {
            width: 200px;
            height: 200px;
          }

          .breathing-circle {
            width: 100px;
            height: 100px;
          }
        }

        /* Landscape mobile optimization */
        @media (max-width: 768px) and (orientation: landscape) {
          .hero-section {
            min-height: auto;
            padding: 2rem 0;
          }

          .section {
            min-height: auto;
          }

          .modal {
            max-height: 80vh;
          }

          .timer-circle {
            width: 120px;
            height: 120px;
          }

          .game-grid {
            width: 200px;
            height: 200px;
          }

          .breathing-circle {
            width: 110px;
            height: 110px;
          }
        }

        /* Touch-friendly improvements */
        @media (hover: none) and (pointer: coarse) {
          .cta-button,
          .feature-button,
          .practice-open,
          .task-note,
          .task-card,
          .timeline-day,
          .modal-close {
            min-height: 44px;
            min-width: 44px;
          }

          .focus-card,
          .focus-practice-card,
          .task-note,
          .task-card {
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

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #FFD93D, #FFA500);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #FFA500, #FF8C00);
        }
        `
      }} />

      <div
        className="app"
        style={{
          background: 'linear-gradient(135deg, #4A90E2 0%, #7B68EE 50%, #4A90E2 100%)',
          backgroundSize: '300% 300%',
          animation: 'gradientShift 15s ease infinite',
          minHeight: '100vh'
        }}
      >
        {/* Back to Resources Button */}
        <motion.a
          href="/resources"
          onClick={(e) => { e.preventDefault(); navigate('/resources'); }}
          className="fixed top-20 left-8 flex items-center gap-2 text-white hover:text-yellow-300 transition-colors group z-50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Resources</span>
        </motion.a>

        {/* Section 1 - Hero */}
        <section className="section hero-section" data-section="0">
          <div className="hero-background">
            <div className="floating-elements">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`floating-element element-${i}`}></div>
              ))}
            </div>
          </div>
          <div className="hero-content">
            {/* Hero Image */}
            <img
              src="/Resource Images/4. Focus & Study/12.webp"
              alt="Focus"
              className="absolute -left-80 top-1/2 -translate-y-1/2 w-[150px] md:w-[250px] lg:w-[350px] h-auto object-contain opacity-90 pointer-events-none"
              style={{
                filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))'
              }}
            />
            <h1 className="hero-title">
              <span className="title-main">Losing Focus?</span>
            </h1>
            <p className="hero-subtitle">
              Your focus is fading... but not lost.<br />
              Let's rediscover how to study smarter — not longer.
            </p>
            <button className="cta-button" onClick={startFocusQuest}>
              Begin My Focus Quest <ChevronDown className="cta-arrow" />
            </button>
          </div>
        </section>

        {/* Section 2 - Why Focus Habits Matter */}
        <section className="section power-section" data-section="1">
          <div className="section-content px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(240px,360px)_minmax(0,1fr)] items-center gap-5 max-w-[1100px] mx-auto">
              {/* Left: Illustration */}
              <div className="text-center order-first md:order-none">
                <img
                  src="/Resource Images/4. Focus & Study/matters.png"
                  alt="Why focus habits matter"
                  className="w-48 sm:w-56 md:w-64 lg:w-80 xl:w-full max-w-[360px] h-auto object-contain mx-auto"
                />
              </div>

              {/* Right: Text + Cards */}
              <div>
                <h2 className="section-title text-3xl sm:text-4xl md:text-5xl">Why Focus Habits Matter</h2>
                <p className="section-subtitle text-base sm:text-lg md:text-xl">
                  Good study habits make learning feel less overwhelming and more manageable.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 max-w-[720px]">
                  <div
                    className="focus-card p-3"
                    style={{
                      background: '#eff6ff',
                      borderColor: '#bfdbfe',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      boxShadow: 'none',
                      backdropFilter: 'none',
                      backgroundClip: 'padding-box'
                    }}
                  >
                    <h3 className="card-title text-sm sm:text-base leading-tight mb-2">Less Exam Stress</h3>
                    <p className="card-text text-xs sm:text-sm leading-snug">You reduce exam stress by preparing steadily instead of cramming.</p>
                  </div>
                  <div
                    className="focus-card p-3"
                    style={{
                      background: '#ecfdf3',
                      borderColor: '#bbf7d0',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      boxShadow: 'none',
                      backdropFilter: 'none',
                      backgroundClip: 'padding-box'
                    }}
                  >
                    <h3 className="card-title text-sm sm:text-base leading-tight mb-2">Learn Faster</h3>
                    <p className="card-text text-xs sm:text-sm leading-snug">You learn faster because your brain stays sharp and remembers more.</p>
                  </div>
                  <div
                    className="focus-card p-3"
                    style={{
                      background: '#fef9c3',
                      borderColor: '#fde68a',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      boxShadow: 'none',
                      backdropFilter: 'none',
                      backgroundClip: 'padding-box'
                    }}
                  >
                    <h3 className="card-title text-sm sm:text-base leading-tight mb-2">Feel in Control</h3>
                    <p className="card-text text-xs sm:text-sm leading-snug">You feel confident knowing you&apos;re in control of your studies.</p>
                  </div>
                  <div
                    className="focus-card p-3"
                    style={{
                      background: '#fef2f2',
                      borderColor: '#fecaca',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      boxShadow: 'none',
                      backdropFilter: 'none',
                      backgroundClip: 'padding-box'
                    }}
                  >
                    <h3 className="card-title text-sm sm:text-base leading-tight mb-2">More Time for Fun</h3>
                    <p className="card-text text-xs sm:text-sm leading-snug">You save time for fun activities like playing or hanging out with friends.</p>
                  </div>
                </div>
                <p className="section-subtitle text-sm sm:text-base md:text-lg mt-5">
                  For example, using short study sessions can help you tackle tough subjects like math without feeling tired,
                  and a clear workspace can make homework feel easier.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 - Improve your focus */}
        <section className="section pomodoro-section" data-section="2">
          <div className="section-content">
            <h2 className="section-title">Improve your focus</h2>
            <p className="section-subtitle">Two quick tools to plan smart and get ready to crush a session</p>
            <div className="focus-practices-grid">
              <div className="focus-practice-card">
                <div style={{ textAlign: 'center' }}>
                  <img src="/Resource Images/1. Stress management images/buddy studying.png" alt="Study Chunker" style={{ width: 160, height: 160, objectFit: 'contain', margin: '0 auto' }} />
                </div>
                <h3 className="practice-title">Study Planner</h3>
                <p className="practice-text">Split a big chapter into small chunks and drag to the best order.</p>
                <button className="practice-open" onClick={() => setIsModalOpen('chunks-priority')}>Open</button>
              </div>
              <div className="focus-practice-card">
                <div style={{ textAlign: 'center' }}>
                  <img src="/Resource Images/4. Focus & Study/sprint.png" alt="Readiness + Focus" style={{ width: 160, height: 160, objectFit: 'contain', margin: '0 auto' }} />
                </div>
                <h3 className="practice-title">Setup Sprint</h3>
                <p className="practice-text">Drag items into the Ready Box to unlock the timer.</p>
                <button className="practice-open" onClick={() => setIsModalOpen('ready-pomodoro')}>Open</button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 - Focus Connections (cloned) */}
        <section className="section connections-section" data-section="3" id="connections">
          <div className="section-content px-4 md:px-8">
            <h2 className="section-title text-3xl sm:text-4xl md:text-5xl">Focus Connections</h2>
            <p className="section-subtitle text-base sm:text-lg md:text-xl">How your study habits connect with other skills</p>

            {/* Desktop circular layout */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 900, height: 420, margin: '0 auto' }} className="hidden md:block">
              {/* Central image */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}>
                <img src="/Resource Images/4. Focus & Study/connections.png" alt="Connections" style={{ width: 200, height: 200, objectFit: 'contain' }} />
              </div>

              {/* Connections around */}
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {[
                  { angle: 330, r: 48, title: 'Digital Wellness', tip: 'Reducing phone and screen time (from the Digital Wellness Guide) helps you stay focused.', gradient: 'linear-gradient(135deg, #60a5fa, #22d3ee)' },
                  { angle: 210, r: 54, title: 'Sleep & Relaxation', tip: 'A rested brain (from the Sleep & Relaxation Guide) improves concentration and memory.', gradient: 'linear-gradient(135deg, #34d399, #14b8a6)' },
                  { angle: 90, r: 45, title: 'Stress Management', tip: 'Use breathing or positive self-talk from the Stress Management Guide to stay calm during study sessions. These habits work together to make you a study superstar!', gradient: 'linear-gradient(135deg, #a78bfa, #f472b6)' }
                ].map((c, idx) => {
                  const rad = (c.angle * Math.PI) / 180;
                  const radius = c.r; // in percent of half-container
                  const x = 50 + radius * Math.cos(rad);
                  const y = 50 + radius * Math.sin(rad);
                  return (
                    <div key={idx} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', zIndex: 1 }}>
                      <div style={{
                        background: c.gradient,
                        color: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                        minWidth: 260,
                        maxWidth: 320,
                        padding: '12px 16px'
                      }}>
                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{c.title}</div>
                        <div style={{ fontSize: 14, lineHeight: 1.4, opacity: 0.95 }}>{c.tip}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile list layout */}
            <div className="md:hidden space-y-4 mt-6">
              {/* Center image */}
              <div className="flex justify-center mb-6">
                <img src="/Resource Images/4. Focus & Study/connections.png" alt="Connections" className="w-48 h-48 object-contain" />
              </div>

              {/* List of connections */}
              {[
                { title: 'Digital Wellness', tip: 'Reducing phone and screen time (from the Digital Wellness Guide) helps you stay focused.', gradient: 'linear-gradient(135deg, #60a5fa, #22d3ee)' },
                { title: 'Sleep & Relaxation', tip: 'A rested brain (from the Sleep & Relaxation Guide) improves concentration and memory.', gradient: 'linear-gradient(135deg, #34d399, #14b8a6)' },
                { title: 'Stress Management', tip: 'Use breathing or positive self-talk from the Stress Management Guide to stay calm during study sessions. These habits work together to make you a study superstar!', gradient: 'linear-gradient(135deg, #a78bfa, #f472b6)' }
              ].map((c, idx) => (
                <div key={idx} style={{
                  background: c.gradient,
                  color: '#fff',
                  borderRadius: 16,
                  boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                  padding: '16px 20px'
                }}>
                  <div className="text-lg font-bold mb-2">{c.title}</div>
                  <div className="text-sm leading-relaxed opacity-95">{c.tip}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section - When to Ask for Help */}
        <section className="section help-section-wrapper" data-section="4">
          <div className="section-content">
            <h2 className="section-title">When to Ask for Help</h2>
            <div className="help-section">
              <div className="help-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                <img src="/Resource Images/1. Stress management images/buddycall.png" alt="Call for help" style={{ width: 220, height: 'auto', objectFit: 'contain' }} />
                <div className="help-cards" style={{ display: 'grid', gap: 12 }}>
                  <div className="help-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Childline India</h3>
                    <p style={{ margin: '6px 0', color: '#334155' }}>24/7 helpline for children and teenagers</p>
                    <a
                      href="tel:1098"
                      className="help-phone"
                      style={{
                        display: 'inline-block',
                        background: '#2563eb',
                        color: '#ffffff',
                        fontWeight: 800,
                        textDecoration: 'none',
                        padding: '8px 14px',
                        borderRadius: 10,
                        border: '1px solid #1e40af',
                        boxShadow: '0 6px 14px rgba(37, 99, 235, 0.25)'
                      }}
                    >
                      Call: 1098
                    </a>
                  </div>
                  <div className="help-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>NIMHANS</h3>
                    <p style={{ margin: '6px 0', color: '#334155' }}>National Institute of Mental Health and Neurosciences</p>
                    <a
                      href="tel:08046110007"
                      className="help-phone"
                      style={{
                        display: 'inline-block',
                        background: '#2563eb',
                        color: '#ffffff',
                        fontWeight: 800,
                        textDecoration: 'none',
                        padding: '8px 14px',
                        borderRadius: 10,
                        border: '1px solid #1e40af',
                        boxShadow: '0 6px 14px rgba(37, 99, 235, 0.25)'
                      }}
                    >
                      Call: 080-46110007
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Confetti */}
        {showConfetti && (
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div key={i} className="confetti-piece" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}></div>
            ))}
          </div>
        )}

        {/* Pomodoro Modal */}
        {isModalOpen === 'pomodoro' && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(null)}>
            <div className="modal pomodoro-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Pomodoro Timer</h3>
                <button className="close-button" onClick={() => setIsModalOpen(null)}>×</button>
              </div>
              <div className="timer-circle">
                <div className="timer-display">
                  {formatTime(pomodoroRemaining)}
                </div>
              </div>
              <div className="timer-controls">
                {!pomodoroRunning ? (
                  <button className="control-button primary" onClick={startPomodoro}>Start</button>
                ) : (
                  <button className="control-button secondary" onClick={pausePomodoro}>Pause</button>
                )}
                <button className="control-button" onClick={resetPomodoro}>Reset</button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Modal */}
        {isModalOpen === 'reset' && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(null)}>
            <div className="modal reset-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Mind Reset</h3>
                <button className="close-button" onClick={() => setIsModalOpen(null)}>×</button>
              </div>
              <div className="breathing-guide">
                <div className="breathing-circle" style={{ transform: `scale(${1 + (resetProgress / 100) * 0.3})` }}></div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${resetProgress}%` }}></div>
              </div>
              <div className="reset-checklist">
                {['Phone away', 'Water bottle ready', 'Books organized', 'Mind relaxed'].map((item, index) => (
                  <div key={index} className={`checklist-item ${resetProgress > (index + 1) * 25 ? 'checked' : ''}`}>
                    <span className="checkmark">{resetProgress > (index + 1) * 25 ? '✓' : '○'}</span>
                    {item}
                  </div>
                ))}
              </div>
              {resetProgress < 100 && (
                <button className="control-button primary" onClick={startMindReset}>Start Reset</button>
              )}
              {resetProgress === 100 && (
                <div className="reset-complete">You're all set to focus deeply.</div>
              )}
            </div>
          </div>
        )}

        {/* Game Modal */}
        {isModalOpen === 'game' && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(null)}>
            <div className="modal game-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Focus Training</h3>
                <button className="close-button" onClick={() => setIsModalOpen(null)}>×</button>
              </div>
              <div className="game-area">
                <div className="game-timer">Time: {gameRemaining}s</div>
                <div className="game-grid">
                  <div
                    className="focus-dot"
                    style={{
                      left: `${dotPosition.x}%`,
                      top: `${dotPosition.y}%`,
                      transform: gameActive ? 'scale(1)' : 'scale(0)'
                    }}
                  ></div>
                </div>
              </div>
              {!gameActive && gameRemaining === gameTime && (
                <button className="control-button primary" onClick={startFocusGame}>Start Game</button>
              )}
              {gameRemaining === 0 && (
                <div className="game-complete">Nice work! You trained your brain to stay centered.</div>
              )}
            </div>
          </div>
        )}

        {/* Study Chunker + Prioritization Modal */}
        {isModalOpen === 'chunks-priority' && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(null)}>
            <div className="modal no-scroll" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Study Planner</h3>
                <button className="close-button" onClick={() => setIsModalOpen(null)}>×</button>
              </div>
              <div>
                {spBanner && (
                  <div style={{
                    background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#065f46', borderRadius: 10,
                    padding: '8px 12px', marginBottom: '0.5rem', textAlign: 'center', fontWeight: 700
                  }}>{spBanner}</div>
                )}
                <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: '1fr', marginBottom: '0.5rem' }}>
                  <input placeholder="Topic / Chapter" value={spTopic} onChange={(e) => setSpTopic(e.target.value)} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: '1rem' }} />
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <select value={spSplitType} onChange={(e) => setSpSplitType(e.target.value as any)} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                      <option value="pages">Split by pages</option>
                      <option value="problems">Split by problems</option>
                      <option value="sections">Split by sections</option>
                      <option value="topics">Split by topics</option>
                      <option value="chapters">Split by chapters</option>
                    </select>
                    <input type="number" min={1} placeholder={(() => { switch (spSplitType) { case 'pages': return 'Total pages'; case 'problems': return 'Total problems'; case 'sections': return 'Total sections'; case 'topics': return 'Total topics'; case 'chapters': return 'Total chapters'; default: return 'Total items'; } })()} value={spTotalUnits || ''} onChange={(e) => setSpTotalUnits(Number(e.target.value))} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', width: 160 }} />
                    <input type="number" min={0} placeholder="Time available (min)" value={spTimeAvailable} onChange={(e) => setSpTimeAvailable(e.target.value === '' ? '' : Number(e.target.value))} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', width: 200 }} />
                    <input type="number" min={2} max={8} placeholder="Chunks (optional)" value={spChunkCount === '' ? '' : spChunkCount} onChange={(e) => setSpChunkCount(e.target.value === '' ? '' : Math.max(2, Math.min(8, Number(e.target.value))))} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', width: 160 }} />
                    <button className="modal-btn" onClick={spGeneratePlan} style={{
                      background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                      color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10,
                      fontWeight: 800
                    }}>Generate Plan</button>
                  </div>
                </div>
                {spPlan.length > 0 && spPlanVisible && (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div style={{ color: '#475569' }}>Suggested time per chunk: ~{spPlan[0].minutes} min ({typeof spTimeAvailable === 'number' && spTimeAvailable > 0 ? `${spTimeAvailable} min total` : `default`})</div>
                    {spPlan.map((p, i) => (
                      <div key={p.index} draggable onDragStart={() => spOnDragStart(i)} onDragOver={spOnDragOver} onDrop={() => spOnDrop(i)} style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>Chunk {p.index}</div>
                            <input value={p.range} onChange={(e) => setSpPlan(arr => arr.map(x => x.index === p.index ? { ...x, range: e.target.value } : x))} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', minWidth: 200 }} />
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <label style={{ color: '#475569' }}>Time (min):</label>
                            <input type="number" min={0} value={p.minutes} onChange={(e) => spAdjustMinutes(p.index, Number(e.target.value))} style={{ width: 90, padding: '6px 8px', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                            <label style={{ color: '#475569', marginLeft: 8 }}>Difficulty:</label>
                            <select value={p.difficulty} onChange={(e) => setSpPlan(arr => arr.map(x => x.index === p.index ? { ...x, difficulty: e.target.value as any } : x))} style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                              <option>Hard</option>
                              <option>Medium</option>
                              <option>Easy</option>
                            </select>
                          </div>
                          <textarea placeholder="Write a 2–3 line summary you can teach a friend." value={p.summary} onChange={(e) => setSpPlan(arr => arr.map(x => x.index === p.index ? { ...x, summary: e.target.value } : x))} style={{ width: '100%', minHeight: 70, padding: '8px 10px', borderRadius: 10, border: '1px solid #e5e7eb', fontFamily: 'inherit' }} />
                        </div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
                      <button className="modal-btn" onClick={spSortByDifficulty} style={{
                        background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, fontWeight: 800
                      }}>Sort by Difficulty</button>
                      <button className="modal-btn" onClick={spSavePlan} style={{
                        background: '#10b981', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, fontWeight: 800
                      }}>Save Plan</button>
                      <button className="modal-btn" onClick={spPrintPlan} style={{
                        background: '#6b7280', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, fontWeight: 800
                      }}>Print</button>
                      <button className="modal-btn" onClick={() => setSpPlanVisible(false)} style={{
                        background: '#ef4444', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, fontWeight: 800
                      }}>Close Plan</button>
                    </div>
                  </div>
                )}
                {spPlan.length > 0 && !spPlanVisible && (
                  <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <button className="modal-btn" onClick={() => setSpPlanVisible(true)} style={{
                      background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, fontWeight: 800
                    }}>Show Plan</button>
                  </div>
                )}
                {spSavedPlans.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <div className="modal-sub" style={{ marginBottom: 6 }}>Saved Plans</div>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {spSavedPlans.slice(0, 5).map((sp: any) => (
                        <div key={sp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.5rem 0.75rem' }}>
                          <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' }}>{sp.topic}</div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="modal-btn" onClick={() => spLoadSaved(sp.id)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 10, fontWeight: 800 }}>Load</button>
                            <button className="modal-btn" onClick={() => spDeleteSaved(sp.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 10, fontWeight: 800 }}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Readiness + Pomodoro Modal */}
        {isModalOpen === 'ready-pomodoro' && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(null)}>
            <div className="modal no-scroll" onClick={(e) => e.stopPropagation()} style={{ padding: '1.25rem', maxHeight: '88vh' }}>
              <div className="modal-header" style={{ marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.4rem' }}>Setup Sprint</h3>
                <button className="close-button" onClick={() => setIsModalOpen(null)} style={{ boxShadow: 'none' }}>×</button>
              </div>
              <div>
                <p className="section-subtitle" style={{ color: '#374151', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Drag each item into the Ready Box</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'start' }}>
                  <div style={{ background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: 10, padding: 8 }}>
                    <strong style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem' }}>Items</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {readyPool.map(item => (
                        <div key={item} draggable onDragStart={(e) => onReadyDragStart(e, item)} style={{ padding: '4px 8px', background: '#e5e7eb', borderRadius: 9999, fontWeight: 600, color: '#374151', cursor: 'grab', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                          <span>{item}</span>
                          <button onClick={() => setReadyPool(prev => prev.filter(x => x !== item))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', fontWeight: 900, fontSize: '0.9rem' }}>×</button>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      <input value={readyNewItem} onChange={(e) => setReadyNewItem(e.target.value)} placeholder="Add custom item" style={{ flex: 1, padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: '0.8rem' }} />
                      <button className="modal-btn" onClick={() => { const v = readyNewItem.trim(); if (!v) return; if (readyPool.includes(v) || readyBox.includes(v)) return; setReadyPool(prev => [...prev, v]); setReadyNewItem(''); }} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Add</button>
                    </div>
                  </div>
                  <div onDrop={onReadyDrop} onDragOver={onReadyDragOver} style={{ background: '#ecfeff', border: '2px dashed #06b6d4', borderRadius: 10, padding: 8, minHeight: 100 }}>
                    <strong style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem' }}>Ready Box ({readyBox.length}/{readyBox.length + readyPool.length})</strong>
                    <div ref={readyBoxRef} style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {readyBox.map(item => (
                        <div key={item} style={{ padding: '4px 8px', background: '#99f6e4', borderRadius: 9999, fontWeight: 700, color: '#064e3b', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                          <span>{item}</span>
                          <button onClick={() => setReadyBox(prev => prev.filter(x => x !== item))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: 900, fontSize: '0.9rem' }}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="progress-bar" style={{ marginTop: 10, height: 6 }}>
                  <div className="progress-fill" style={{ width: `${(readyBox.length + readyPool.length === 0 ? 0 : (readyBox.length / (readyBox.length + readyPool.length))) * 100}%` }} />
                </div>
                {/* Clock-style Timer UI with editable minutes */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6 }}>
                  <label style={{ color: '#475569', fontSize: '0.85rem' }}>Minutes:</label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={editableMinutes}
                    onChange={(e) => {
                      const next = Math.max(1, Math.min(90, Number(e.target.value)));
                      setEditableMinutes(next);
                      if (!pomodoroRunning) {
                        // Reflect minutes immediately on the clock whenever not running (paused or idle)
                        setPomodoroRemaining(next * 60);
                        lastSetMinutesRef.current = next;
                      }
                    }}
                    style={{ width: 70, padding: '4px 6px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: '0.85rem' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '0.6rem 0' }}>
                  <div style={{
                    position: 'relative',
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: (readyPool.length === 0 && readyBox.length > 0) ? 'linear-gradient(135deg, #dbeafe, #bfdbfe)' : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                    border: '5px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: (readyPool.length === 0 && readyBox.length > 0) ? 1 : 0.4,
                    boxShadow: (readyPool.length === 0 && readyBox.length > 0) ? '0 4px 16px rgba(59, 130, 246, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}>
                    {/* Progress ring */}
                    <div style={{
                      position: 'absolute',
                      top: -5,
                      left: -5,
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: `conic-gradient(#3b82f6 ${pomodoroRunning && readyPool.length === 0 && readyBox.length > 0 ? ((editableMinutes * 60 - pomodoroRemaining) / (editableMinutes * 60)) * 360 : 0}deg, transparent ${pomodoroRunning && readyPool.length === 0 && readyBox.length > 0 ? ((editableMinutes * 60 - pomodoroRemaining) / (editableMinutes * 60)) * 360 : 0}deg)`,
                      mask: 'radial-gradient(circle, transparent 47px, black 52px)',
                      WebkitMask: 'radial-gradient(circle, transparent 47px, black 52px)'
                    }} />
                    {/* Clock face */}
                    <div style={{ textAlign: 'center', zIndex: 1 }}>
                      <div style={{
                        fontSize: '1.3rem',
                        fontWeight: 800,
                        color: (readyPool.length === 0 && readyBox.length > 0) ? '#1e40af' : '#6b7280',
                        fontFamily: 'monospace',
                        marginBottom: 2
                      }}>
                        {formatTime(pomodoroRemaining)}
                      </div>
                      <div style={{
                        fontSize: '0.6rem',
                        color: (readyPool.length === 0 && readyBox.length > 0) ? '#3b82f6' : '#9ca3af',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {pomodoroRunning ? 'FOCUS TIME' : 'READY TO START'}
                      </div>
                    </div>
                    {/* Clock hour markers */}
                    {[...Array(12)].map((_, i) => (
                      <div key={i} style={{
                        position: 'absolute',
                        width: 2,
                        height: 8,
                        background: (readyPool.length === 0) ? '#3b82f6' : '#d1d5db',
                        top: 4,
                        left: '50%',
                        transformOrigin: '1px 56px',
                        transform: `translateX(-50%) rotate(${i * 30}deg)`
                      }} />
                    ))}
                  </div>
                </div>
                <div className="timer-controls" style={{ marginTop: '0.5rem' }}>
                  {!pomodoroRunning ? (
                    <button
                      className="control-button primary"
                      disabled={readyBox.length === 0 || readyPool.length > 0}
                      onClick={() => {
                        setPomodoroRemaining(prev => {
                          if (prev === 0) {
                            lastSetMinutesRef.current = editableMinutes;
                            return editableMinutes * 60;
                          }
                          return prev;
                        });
                        startPomodoro();
                      }}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                      {pomodoroRemaining > 0 && pomodoroRemaining < editableMinutes * 60 ? 'Continue' : 'Start'}
                    </button>
                  ) : (
                    <button className="control-button secondary" onClick={pausePomodoro} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Pause</button>
                  )}
                  <button
                    className="control-button"
                    onClick={() => {
                      setReadyPool(readinessMaster);
                      setReadyBox([]);
                      setPomodoroRemaining(editableMinutes * 60);
                    }}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StudyFocusSuperpower;