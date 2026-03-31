import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, Brain, Leaf, Sun, Moon, BookOpen, Users, Phone, Volume2, Droplets, Zap, Star, Calendar, Clock, Smile, Check, X, ArrowLeft, Maximize, Minimize, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  saveStudyPlan, getStudyPlans, deleteStudyPlan,
  logExercise, getExerciseLogs, deleteExerciseLog,
  logHydration, getHydrationStatus,
  getStressManagementStats,
  awardBadge, hasBadge
} from '@/services/resourcesService';

interface BreathingCircleProps {
  isActive: boolean;
}

const BreathingCircle: React.FC<BreathingCircleProps> = ({ isActive }) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [scale, setScale] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      const cycle = () => {
        // Inhale phase (4 seconds)
        setPhase('inhale');
        let progress = 0;
        const inhaleInterval = setInterval(() => {
          progress += 0.1;
          setScale(1 + progress * 0.5);
          if (progress >= 1) {
            clearInterval(inhaleInterval);
            // Hold phase (2 seconds)
            setPhase('hold');
            setTimeout(() => {
              // Exhale phase (6 seconds)
              setPhase('exhale');
              let exhaleProgress = 1;
              const exhaleInterval = setInterval(() => {
                exhaleProgress -= 0.05;
                setScale(1 + exhaleProgress * 0.5);
                if (exhaleProgress <= 0) {
                  clearInterval(exhaleInterval);
                  if (isActive) {
                    setTimeout(cycle, 1000); // Pause before next cycle
                  }
                }
              }, 30);
            }, 2000);
          }
        }, 40);
      };
      cycle();
    } else {
      setScale(1);
      setPhase('inhale');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  return (
    <div className="breathing-circle">
      <div
        className="breathing-circle-inner"
        style={{
          transform: `scale(${scale})`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="breathing-text">
          {phase === 'inhale' && 'Inhale...'}
          {phase === 'hold' && 'Hold...'}
          {phase === 'exhale' && 'Exhale...'}
        </div>
      </div>
    </div>
  );
};

// Study Splitter (no timer) modal
const StudySplitterModal: React.FC<{ userId: string }> = ({ userId }) => {
  const [topic, setTopic] = useState('');
  const [splitType, setSplitType] = useState<'pages' | 'problems' | 'sections' | 'topics' | 'chapters'>('pages');
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [timeAvailable, setTimeAvailable] = useState<number | ''>('');
  const [chunkCount, setChunkCount] = useState<number | ''>('');
  const [plan, setPlan] = useState<Array<{ index: number; range: string; microGoal: string; checkpoint: string; minutes: number; summary: string }>>([]);
  const [planVisible, setPlanVisible] = useState<boolean>(true);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [banner, setBanner] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadPlans();
    }
  }, [userId]);

  const loadPlans = async () => {
    try {
      const plans = await getStudyPlans(userId);
      setSavedPlans(plans);
    } catch (error) {
      console.error('Failed to load plans', error);
    }
  };

  const defaultMinutes = 25;

  const templateForSplit = (st: typeof splitType) => {
    if (st === 'problems') {
      return {
        micro: (range: string) => `Solve ${range.toLowerCase()} and mark questions to revisit.`,
        check: (range: string) => `Explain the method for one problem from ${range.toLowerCase()} in your own words.`
      };
    }
    // pages/sections/topics/chapters
    return {
      micro: (range: string) => `Read ${range.toLowerCase()} and note 3 key points or definitions.`,
      check: (range: string) => `Summarize one key idea from ${range.toLowerCase()} in 2 sentences.`
    };
  };

  const calcChunks = () => {
    const units = Math.max(0, Number(totalUnits) || 0);
    if (!topic.trim() || units <= 0) {
      alert('Please enter a topic and a valid number of pages/problems.');
      return;
    }
    let baseChunks = typeof chunkCount === 'number' && chunkCount > 0 ? chunkCount : 4;
    if (typeof chunkCount !== 'number' && typeof timeAvailable === 'number' && timeAvailable > 0) {
      if (timeAvailable < 45) baseChunks = Math.max(3, baseChunks - 1);
      if (timeAvailable > 120) baseChunks = Math.min(6, baseChunks + 1);
    }
    baseChunks = Math.min(Math.max(baseChunks, 2), Math.min(units, 8));
    const size = Math.max(1, Math.floor(units / baseChunks));
    const tmpl = templateForSplit(splitType);
    const hasTotal = typeof timeAvailable === 'number' && timeAvailable > 0;

    const chunks: Array<{ index: number; range: string; microGoal: string; checkpoint: string; minutes: number; summary: string }> = [];
    let start = 1;
    let base = 0;
    let rem = 0;
    if (hasTotal) {
      base = Math.floor((timeAvailable as number) / baseChunks);
      rem = (timeAvailable as number) - base * baseChunks;
    }
    for (let i = 0; i < baseChunks; i++) {
      const end = i === baseChunks - 1 ? units : Math.min(units, start + size - 1);
      const unitLabel = ({ pages: 'Pages', problems: 'Problems', sections: 'Sections', topics: 'Topics', chapters: 'Chapters' } as Record<string, string>)[splitType] || 'Items';
      const range = `${unitLabel} ${start}–${end}`;
      chunks.push({
        index: i + 1,
        range,
        microGoal: tmpl.micro(range),
        checkpoint: tmpl.check(range),
        minutes: hasTotal ? (base + (i < rem ? 1 : 0)) : defaultMinutes,
        summary: ''
      });
      start = end + 1;
      if (start > units) break;
    }
    setPlan(chunks);
    setPlanVisible(true);
  };

  const adjustChunkMinutes = (chunkIndex: number, val: number) => {
    const input = Math.round(Number(val) || 0);
    if (!(typeof timeAvailable === 'number' && timeAvailable > 0) || plan.length <= 1) {
      setPlan(arr => arr.map(x => x.index === chunkIndex ? { ...x, minutes: input } : x));
      return;
    }
    const total = timeAvailable as number;
    const others = plan.length - 1;
    const edited = Math.max(0, Math.min(total, input));
    let remaining = total - edited;
    const even = Math.floor(remaining / others);
    let remainder = remaining - even * others;
    setPlan(arr => arr.map(x => {
      if (x.index === chunkIndex) return { ...x, minutes: edited };
      const assign = even + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
      return { ...x, minutes: assign };
    }));
  };

  const savePlan = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const entry = { topic, splitType, totalUnits, timeAvailable, chunkCount, plan };
      await saveStudyPlan(userId, entry);
      await loadPlans();
      setBanner('Plan saved to cloud');
      setTimeout(() => setBanner(''), 2500);
    } catch (error) {
      console.error('Error saving plan', error);
      setBanner('Error saving plan');
    } finally {
      setLoading(false);
    }
  };

  const deleteSaved = async (id: string) => {
    if (!userId) return;
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await deleteStudyPlan(userId, id);
      setSavedPlans(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting plan', error);
    }
  };

  const loadSaved = (id: string) => {
    const found = savedPlans.find((p: any) => p.id === id);
    if (!found) return;
    setTopic(found.topic);
    setSplitType(found.splitType);
    setTotalUnits(0);
    setTimeAvailable(found.timeAvailable);
    setChunkCount(found.chunkCount);
    setPlan(found.plan);
    setPlanVisible(true);
  };

  const printPlan = () => {
    const popup = window.open('', '_blank');
    if (!popup) return;
    popup.document.write(`<pre style="font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; white-space: pre-wrap; line-height: 1.6; padding: 16px;">${[
      `Study Plan: ${topic}`,
      `Split by: ${splitType}${timeAvailable ? ` | Time: ${timeAvailable} min` : ''}${chunkCount ? ` | Chunks: ${chunkCount}` : ''}`,
      '',
      ...plan.map(p => `Chunk ${p.index}: ${p.range}\n- Time: ~${p.minutes} min\n- Micro-goal: ${p.microGoal}\n- Checkpoint: ${p.checkpoint}\n- Summary: ${p.summary || '(to fill)'}\n`)
    ].join('\n')}</pre>`);
    popup.print();
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: 'min(720px, 100%)',
      margin: '0 auto',
      boxSizing: 'border-box',
      padding: 'clamp(0.75rem, 2vw, 1.25rem)',
      background: 'linear-gradient(135deg, #eef2ff 0%, #e0f2fe 100%)',
      borderRadius: 14
    }}>
      {banner && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #bbf7d0',
          color: '#065f46',
          borderRadius: 10,
          padding: '8px 12px',
          marginBottom: '0.75rem',
          textAlign: 'center',
          fontWeight: 600
        }}>{banner}</div>
      )}
      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr', marginBottom: '1rem' }}>
        <input
          placeholder="Topic / Chapter"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: '1rem' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select value={splitType} onChange={(e) => setSplitType(e.target.value as any)} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb' }}>
            <option value="pages">Split by pages</option>
            <option value="problems">Split by problems</option>
            <option value="sections">Split by sections</option>
            <option value="topics">Split by topics</option>
            <option value="chapters">Split by chapters</option>
          </select>
          <input
            type="number"
            min={1}
            placeholder={(() => { switch (splitType) { case 'pages': return 'Total pages'; case 'problems': return 'Total problems'; case 'sections': return 'Total sections'; case 'topics': return 'Total topics'; case 'chapters': return 'Total chapters'; default: return 'Total items'; } })()}
            value={totalUnits || ''}
            onChange={(e) => setTotalUnits(Number(e.target.value))}
            style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', width: 160 }}
          />
          <input
            type="number"
            min={0}
            placeholder="Time available (min)"
            value={timeAvailable}
            onChange={(e) => setTimeAvailable(e.target.value === '' ? '' : Number(e.target.value))}
            style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', width: 200 }}
          />
          <input
            type="number"
            min={2}
            max={8}
            placeholder="Chunks (optional)"
            value={chunkCount === '' ? '' : chunkCount}
            onChange={(e) => setChunkCount(e.target.value === '' ? '' : Math.max(2, Math.min(8, Number(e.target.value))))}
            style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', width: 160 }}
          />
          <button className="modal-btn" onClick={calcChunks} disabled={loading}>Generate Plan</button>
        </div>
      </div>

      {plan.length > 0 && planVisible && (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <div style={{ color: '#475569' }}>Suggested time per chunk: ~{plan[0].minutes} min (based on {typeof timeAvailable === 'number' && timeAvailable > 0 ? `${timeAvailable} min total` : `default`})</div>
          {plan.map(p => (
            <div key={p.index} style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, padding: '0.75rem 1rem' }}>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>Chunk {p.index}</div>
                  <input
                    value={p.range}
                    onChange={(e) => setPlan(arr => arr.map(x => x.index === p.index ? { ...x, range: e.target.value } : x))}
                    style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', minWidth: 180 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ color: '#475569' }}>Time (min):</label>
                  <input type="number" min={0}
                    value={p.minutes}
                    onChange={(e) => adjustChunkMinutes(p.index, Number(e.target.value))}
                    style={{ width: 90, padding: '6px 8px', borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                </div>
                <textarea
                  placeholder="Write a 2–3 line summary you can teach a friend."
                  value={p.summary}
                  onChange={(e) => setPlan(arr => arr.map(x => x.index === p.index ? { ...x, summary: e.target.value } : x))}
                  style={{ width: '100%', minHeight: 70, padding: '8px 10px', borderRadius: 10, border: '1px solid #e5e7eb', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
            <button className="modal-btn secondary" onClick={savePlan} disabled={loading}>
              {loading ? 'Saving...' : 'Save Plan'}
            </button>
            <button className="modal-btn" onClick={printPlan}>Print</button>
            <button className="modal-btn" onClick={() => setPlanVisible(false)}>Close Plan</button>
          </div>
        </div>
      )}

      {plan.length > 0 && !planVisible && (
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <button className="modal-btn" onClick={() => setPlanVisible(true)}>Show Plan</button>
        </div>
      )}

      {savedPlans.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div className="modal-sub" style={{ marginBottom: 6 }}>Saved Plans</div>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {savedPlans.slice(0, 5).map((sp: any) => (
              <div key={sp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.5rem 0.75rem' }}>
                <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.95rem' }}>{sp.topic}</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="modal-btn" onClick={() => loadSaved(sp.id)}>Load</button>
                  <button className="modal-btn secondary" onClick={() => deleteSaved(sp.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PowerNapModal: React.FC = () => {
  const [preset, setPreset] = useState<number | null>(15);
  const [remaining, setRemaining] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);
  const [done, setDone] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setRunning(false);
          setDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, remaining]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const start = (mins?: number) => {
    const m = mins ?? preset ?? 15;
    setPreset(m);
    setRemaining(m * 60);
    setDone(false);
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setRemaining(0);
    setDone(false);
  };

  const format = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: 'min(720px, 100%)',
        margin: '0 auto',
        boxSizing: 'border-box',
        padding: 'clamp(0.75rem, 2vw, 1.5rem)',
        position: 'relative',
        ...(isFullscreen && {
          maxWidth: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        })
      }}
    >
      {/* Fullscreen Toggle Button */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: 'absolute',
          top: isFullscreen ? '1.5rem' : '0.5rem',
          right: isFullscreen ? '1.5rem' : '0.5rem',
          background: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          borderRadius: '8px',
          padding: '0.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          zIndex: 10
        }}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? <Minimize size={20} color="#4c1d95" /> : <Maximize size={20} color="#4c1d95" />}
      </button>

      {!done && (
        <div style={{
          background: isFullscreen ? 'rgba(243, 232, 255, 0.95)' : 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
          borderRadius: 14,
          padding: isFullscreen ? '3rem' : '1.5rem',
          width: isFullscreen ? 'auto' : '100%',
          minWidth: isFullscreen ? '400px' : 'auto'
        }}>
          <div style={{ textAlign: 'center', color: '#6b21a8', fontWeight: 700, fontSize: isFullscreen ? '1.5rem' : '1.1rem', marginBottom: '1rem' }}>Choose a nap length</div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {[10, 15, 20].map(m => (
              <button
                key={m}
                onClick={() => setPreset(m)}
                disabled={running}
                style={{
                  padding: isFullscreen ? '0.8rem 1.5rem' : '0.6rem 1rem',
                  borderRadius: 10,
                  border: preset === m ? '2px solid #7c3aed' : '2px solid #e5e7eb',
                  background: preset === m ? '#ede9fe' : '#fff',
                  color: '#4c1d95',
                  cursor: running ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: isFullscreen ? '1.1rem' : '1rem'
                }}
              >
                {m} min
              </button>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: isFullscreen ? '4rem' : '2.25rem', fontWeight: 800, color: '#4c1d95' }}>
              {remaining > 0 ? format(remaining) : `${preset ?? 15}:00`}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {running && (
              <button className="modal-btn secondary" onClick={() => setRunning(false)} style={{ minWidth: 140 }}>Pause</button>
            )}
            {!running && remaining === 0 && (
              <button className="modal-btn" onClick={() => start()} style={{ minWidth: 140 }}>Start</button>
            )}
            {!running && remaining > 0 && (
              <button className="modal-btn" onClick={() => setRunning(true)} style={{ minWidth: 140 }}>Resume</button>
            )}
            <button className="modal-btn secondary" onClick={reset} style={{ minWidth: 120 }}>Reset</button>
          </div>
        </div>
      )}

      {done && (
        <div style={{
          background: isFullscreen ? 'rgba(236, 252, 203, 0.95)' : 'linear-gradient(135deg, #ecfccb, #d9f99d)',
          borderRadius: 14,
          padding: isFullscreen ? '3rem' : '1.5rem',
          width: isFullscreen ? 'auto' : '100%',
          minWidth: isFullscreen ? '500px' : 'auto',
          maxWidth: isFullscreen ? '600px' : '100%'
        }}>
          <div style={{ textAlign: 'center', color: '#3f6212', fontWeight: 800, fontSize: isFullscreen ? '1.75rem' : '1.25rem', marginBottom: '0.5rem' }}>Nice nap!</div>
          <div style={{ textAlign: 'center', color: '#4d7c0f', marginBottom: '1rem', fontSize: isFullscreen ? '1.1rem' : '1rem' }}>Do these quick wake-up steps:</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.6rem' }}>
            <li style={{ background: '#fefce8', border: '1px solid #bef264', borderRadius: 10, padding: isFullscreen ? '1rem 1.25rem' : '0.75rem 1rem', color: '#4d7c0f', fontSize: isFullscreen ? '1.05rem' : '1rem' }}>
              Rub your hands together to warm them, then gently place them on your face for a few seconds.
            </li>
            <li style={{ background: '#fefce8', border: '1px solid #bef264', borderRadius: 10, padding: isFullscreen ? '1rem 1.25rem' : '0.75rem 1rem', color: '#4d7c0f', fontSize: isFullscreen ? '1.05rem' : '1rem' }}>
              Take a few deep breaths and stretch your neck and shoulders.
            </li>
            <li style={{ background: '#fefce8', border: '1px solid #bef264', borderRadius: 10, padding: isFullscreen ? '1rem 1.25rem' : '0.75rem 1rem', color: '#4d7c0f', fontSize: isFullscreen ? '1.05rem' : '1rem' }}>
              Sip some water to rehydrate.
            </li>
            <li style={{ background: '#fefce8', border: '1px solid #bef264', borderRadius: 10, padding: isFullscreen ? '1rem 1.25rem' : '0.75rem 1rem', color: '#4d7c0f', fontSize: isFullscreen ? '1.05rem' : '1rem' }}>
              Get some light: open a window or look outside for a moment.
            </li>
          </ul>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="modal-btn" onClick={reset} style={{ minWidth: 140 }}>Restart Timer</button>
          </div>
        </div>
      )}
    </div>
  );
};

// 5-4-3-2-1 Grounding Game modal component
const GroundingGameModal: React.FC = () => {
  const steps = [
    { count: 5, sense: 'see', prompt: 'Name 5 things you see' },
    { count: 4, sense: 'hear', prompt: 'Name 4 things you hear' },
    { count: 3, sense: 'feel', prompt: 'Name 3 things you feel' },
    { count: 2, sense: 'smell', prompt: 'Name 2 things you smell' },
    { count: 1, sense: 'taste', prompt: 'Name 1 thing you taste' },
  ];
  const [stepIndex, setStepIndex] = useState(0);
  const isDone = stepIndex >= steps.length;
  const current = !isDone ? steps[stepIndex] : null;
  const [answers, setAnswers] = useState<string[]>(Array(current ? current.count : 0).fill(''));
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const cnt = !isDone ? steps[stepIndex].count : 0;
    setAnswers(Array(cnt).fill(''));
    setError('');
    inputRefs.current = Array(cnt).fill(null);

    // Focus first input
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, [stepIndex]);

  const senseEmoji = !isDone ? ({ see: '👀', hear: '👂', feel: '✋', smell: '👃', taste: '👅' } as Record<string, string>)[steps[stepIndex].sense] : '';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index < answers.length - 1) {
        // Move to next input
        inputRefs.current[index + 1]?.focus();
      } else {
        // Last input, trigger next/finish
        onNext();
      }
    }
  };

  const onNext = () => {
    if (isDone) return;
    const allFilled = answers.every(a => a.trim().length > 0);
    if (!allFilled) {
      setError('Please fill all boxes before continuing.');
      return;
    }
    setError('');
    setStepIndex((s) => s + 1);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: 'min(800px, 100%)',
      margin: '0 auto',
      boxSizing: 'border-box',
      padding: 'clamp(0.5rem, 2vw, 1rem)'
    }}>
      {!isDone ? (
        <>
          <div style={{ textAlign: 'center', fontSize: '2rem', marginBottom: 6 }}>{senseEmoji}</div>
          <div className="modal-section-title" style={{ textTransform: 'capitalize', textAlign: 'center' }}>{current!.prompt}</div>

          <div style={{
            display: 'grid',
            gap: '0.75rem',
            marginTop: '1rem',
            gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
            maxWidth: 560,
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            {answers.map((val, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#6366f1',
                  minWidth: '28px',
                  textAlign: 'right'
                }}>
                  {i + 1}.
                </span>
                <input
                  ref={(el) => inputRefs.current[i] = el}
                  className="timer-input"
                  value={val}
                  onChange={(e) => setAnswers(arr => arr.map((x, idx) => idx === i ? e.target.value : x))}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: '1rem', width: '100%' }}
                  placeholder={`Item ${i + 1}`}
                />
              </div>
            ))}
          </div>
          {error && <div className="modal-sub" style={{ color: '#dc2626', marginTop: 8, textAlign: 'center' }}>{error}</div>}
          <div className="modal-actions" style={{ justifyContent: 'center' }}>
            <button className="modal-btn" onClick={onNext}>
              {stepIndex === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div className="modal-section-title">Nicely done</div>
          <div className="modal-sub">You grounded yourself using your senses.</div>
        </div>
      )}
    </div>
  );
};

// Music Therapy modal content component (single soothing nature track with big play/pause)
const MusicTherapyModal: React.FC = () => {
  const NATURE_URL = '/Resource Images/1. Stress management images/calmmusic.mp3';
  const audioObj = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    // create audio once
    const a = new Audio(NATURE_URL);
    a.loop = true;
    a.preload = 'auto';
    a.volume = 0.7;
    audioObj.current = a;
    return () => {
      try {
        a.pause();
        a.currentTime = 0;
      } catch { }
      audioObj.current = null;
    };
  }, []);
  const toggle = () => {
    setPlaying((p) => {
      const next = !p;
      const a = audioObj.current;
      if (!a) return next;
      if (next) {
        a.play().catch(() => { });
      } else {
        a.pause();
      }
      return next;
    });
  };
  return (
    <div className="music-card" style={{ textAlign: 'center' }}>
      <button
        type="button"
        aria-label={playing ? 'Pause nature sounds' : 'Play nature sounds'}
        onClick={toggle}
        style={{
          width: 140,
          height: 140,
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 30% 30%, #60a5fa, #3b82f6)',
          boxShadow: '0 12px 24px rgba(59,130,246,0.35)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: '2rem',
          marginTop: '0.5rem'
        }}
      >
        {playing ? '⏸' : '▶'}
      </button>
      <div className="modal-sub" style={{ marginTop: 10 }}>{playing ? 'Now Playing' : 'Paused'}</div>
    </div>
  );
};

const FloatingElement: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  return (
    <div
      className="floating-element"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// Mini-game components for modals
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

  useEffect(() => {
    if (cycle >= 3 && !complete) setComplete(true);
  }, [cycle, complete]);

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



type PomodoroGamesProps = {
  timerMinutes: number; timerSeconds: number; isTimerRunning: boolean; timerProgress: number;
  setTimerMinutes: (n: number) => void; setTimerSeconds: (n: number) => void; startTimer: () => void;
};
const PomodoroFocusTimer: React.FC<PomodoroGamesProps> = ({ timerMinutes, timerSeconds, isTimerRunning, timerProgress, setTimerMinutes, setTimerSeconds, startTimer }) => {
  const [complete, setComplete] = useState(false);
  useEffect(() => {
    if (timerMinutes === 0 && timerSeconds === 0 && !complete) setComplete(true);
  }, [timerMinutes, timerSeconds, complete]);

  const resetTimer = () => {
    setTimerMinutes(25);
    setTimerSeconds(0);
    setComplete(false);
  };

  return (
    <div style={{ textAlign: 'center', position: 'relative', background: '#f0f9ff', borderRadius: 14, padding: '2rem' }}>
      {/* Focus mode overlay - blocks interaction when timer is running */}
      {isTimerRunning && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Focus Mode Active</div>
            <div className="timer-visual">
              <div className="timer-circle" style={{ boxShadow: '0 0 40px rgba(59, 130, 246, 0.5)' }}>
                <div className="timer-progress" style={{ background: `conic-gradient(#3b82f6 ${timerProgress * 3.6}deg, #1f2937 ${timerProgress * 3.6}deg 360deg)` }} />
                <div className="timer-time" style={{ color: 'white' }}>{String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}</div>
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', padding: '0 2rem' }}>
              <div style={{ height: 12, background: '#1f2937', borderRadius: 9999, overflow: 'hidden', maxWidth: 400, margin: '0 auto' }}>
                <div style={{ width: `${timerProgress}%`, height: '100%', background: 'linear-gradient(90deg,#60a5fa,#34d399)', transition: 'width 0.3s' }} />
              </div>
              <div style={{ marginTop: 8, color: '#9ca3af', fontSize: '0.9rem' }}>Stay focused - {Math.round(timerProgress)}% complete</div>
            </div>
          </div>
          <button
            className="modal-btn"
            onClick={startTimer}
            style={{ background: '#ef4444', padding: '12px 32px', fontSize: '1rem' }}
          >
            Pause Focus Session
          </button>
        </div>
      )}

      {!complete ? (
        <>
          <div className="modal-section-title">Focus Session</div>
          <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '1.5rem' }}>
              Click Start to begin a 25-minute focus session.
              <br />
              Focus mode will block all distractions.
            </div>
          </div>
          <div className="modal-actions" style={{ justifyContent: 'center', marginTop: 12, gap: '0.5rem' }}>
            <button className="modal-btn" onClick={startTimer} disabled={isTimerRunning}>Start</button>
            <button className="modal-btn secondary" onClick={resetTimer}>Reset</button>
          </div>
        </>
      ) : (
        <div>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅</div>
          <div className="modal-section-title">Focus Chunk Complete!</div>
          <div className="modal-actions" style={{ justifyContent: 'center', marginTop: 12 }}>
            <button className="modal-btn" onClick={() => { setTimerMinutes(5); setTimerSeconds(0); setComplete(false); }}>Take a 5-min break</button>
            <button className="modal-btn secondary" onClick={() => { setTimerMinutes(25); setTimerSeconds(0); setComplete(false); }}>Start Next Chunk</button>
          </div>
        </div>
      )}
    </div>
  );
};

const QuickExerciseRecharge: React.FC<{ userId: string }> = ({ userId }) => {
  const [exerciseLogs, setExerciseLogs] = useState<Array<{ id: string; date: string; exercised: boolean; description: string }>>([]);
  const [newLogDescription, setNewLogDescription] = useState<string>('');
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    try {
      const [logs, stats] = await Promise.all([
        getExerciseLogs(userId),
        getStressManagementStats(userId)
      ]);
      setExerciseLogs(logs as any);
      setStreak(stats.exerciseStreak || 0);
    } catch (error) {
      console.error('Error fetching exercise data', error);
    }
  };

  // Streak is now handled by the server/stats logic, so we don't need client-side calculation effect
  // But we can keep cycleProgress calculation


  const addLog = async () => {
    if (!userId) {
      alert('You must be logged in to add an exercise log.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];

    // Check if we already have a log for today
    const exists = exerciseLogs.find(log => log.date === today);
    if (exists) {
      alert('You have already logged an exercise for today! Great job!');
      return;
    }

    if (!newLogDescription.trim()) {
      alert('Please add a description!');
      return;
    }

    setLoading(true);
    try {
      await logExercise(userId, newLogDescription);
      await fetchData(); // Refresh logs and streak
      try {
        const stats = await getStressManagementStats(userId);
        const s = Number((stats as any)?.exerciseStreak || 0);
        if (s >= 1 && !(await hasBadge(userId, 'exercise-first'))) {
          await awardBadge(userId, { key: 'exercise-first', name: 'First Exercise', icon: 'zap', description: 'Logged your first exercise' });
        }
        if (s >= 7 && !(await hasBadge(userId, 'active-achiever'))) {
          await awardBadge(userId, { key: 'active-achiever', name: 'Active Achiever', icon: 'zap', description: '7-day exercise streak' });
        }
      } catch { }
      setNewLogDescription('');
    } catch (error) {
      console.error('Error logging exercise', error);
      const message = error instanceof Error ? error.message : 'Failed to save log. Please try again.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (logId: string) => {
    if (!userId) return;
    if (!confirm('Delete this log?')) return;
    try {
      await deleteExerciseLog(userId, logId);
      setExerciseLogs(prev => prev.filter(l => l.id !== logId));
      // Note: Streak might not update immediately without full recalculation on server
    } catch (error) {
      console.error('Error deleting log', error);
    }
  };

  // Calculate progress in current 7-day cycle (1-7)
  const cycleProgress = streak > 0 ? ((streak - 1) % 7) + 1 : 0;

  return (
    <div style={{
      textAlign: 'center',
      background: '#ecfdf5',
      borderRadius: 14,
      padding: '0.5rem',
      width: '100%',
      maxWidth: 'min(680px, 100%)',
      margin: '0 auto',
      boxSizing: 'border-box'
    }}>
      <div className="modal-section-title" style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>Do Exercise Everyday</div>
      <div className="modal-sub" style={{ marginBottom: '0.5rem', fontSize: '0.75rem' }}>
        Regular exercise helps reduce stress, improve mood, and boost your energy.
      </div>

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem',
        marginBottom: '0.5rem'
      }}>
        {/* Left Column: 7-Day Streak Goal */}
        <div style={{
          background: 'white',
          padding: '0.5rem',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{
            color: '#059669',
            fontWeight: 600,
            marginBottom: '0.35rem',
            textAlign: 'center',
            fontSize: '0.85rem'
          }}>
            7-Day Streak Goal
          </h4>

          {/* Small Streak Indicator */}
          {streak > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              borderRadius: '6px',
              padding: '0.25rem 0.4rem',
              marginBottom: '0.35rem',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(251, 191, 36, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem'
            }}>
              <span style={{ fontSize: '0.85rem' }}>🔥</span>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>
                {streak} Day Streak!
              </span>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '240px',
            margin: '0 auto',
            padding: '0 0.15rem'
          }}>
            {[1, 2, 3, 4, 5, 6, 7].map((num) => {
              const isFilled = num <= cycleProgress;
              return (
                <div
                  key={num}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.1rem'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isFilled
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : '#f1f5f9',
                    border: isFilled ? 'none' : '2px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isFilled ? 'white' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    boxShadow: isFilled ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {num}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: 'center', marginTop: '0.4rem', fontSize: '0.7rem', color: '#64748b' }}>
            {cycleProgress === 7 ? "Week completed! Unstoppable!" : `${7 - cycleProgress} days to go`}
          </div>
        </div>

        {/* Right Column: Log Today's Exercise */}
        <div style={{
          background: 'white',
          padding: '0.5rem',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ marginBottom: '0.4rem', color: '#065f46', fontWeight: 600, fontSize: '0.85rem' }}>Log Today's Exercise</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'center' }}>
            <textarea
              placeholder="What exercise did you do?"
              value={newLogDescription}
              onChange={(e) => setNewLogDescription(e.target.value)}
              style={{
                padding: '0.4rem',
                borderRadius: '8px',
                border: '2px solid #10b981',
                fontSize: '0.75rem',
                outline: 'none',
                width: '100%',
                minHeight: '50px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <button
              className="modal-btn"
              onClick={addLog}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', width: '100%' }}
              disabled={!userId || loading}
            >
              {loading ? 'Saving...' : 'Add Log'}
            </button>
          </div>
        </div>
      </div>

      {/* Exercise Logs */}
      <div style={{
        background: 'white',
        padding: '0.5rem',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxHeight: '160px',
        overflowY: 'auto'
      }}>
        <h4 style={{ marginBottom: '0.4rem', color: '#065f46', fontWeight: 600, fontSize: '0.85rem' }}>Your Exercise Log</h4>
        {exerciseLogs.length === 0 ? (
          <p style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '0.75rem' }}>No logs yet. Start tracking!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {exerciseLogs.map((log, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '0.4rem',
                  background: '#d1fae5',
                  borderRadius: '8px',
                  border: '2px solid #10b981',
                  gap: '0.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Check size={14} color="#10b981" strokeWidth={3} />
                    <span style={{ fontWeight: 600, color: '#065f46', fontSize: '0.75rem' }}>
                      {new Date(log.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteLog(log.id)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.15rem 0.4rem',
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      flexShrink: 0
                    }}
                  >
                    Delete
                  </button>
                </div>
                <p style={{
                  color: '#047857',
                  fontSize: '0.7rem',
                  margin: '0',
                  paddingLeft: '18px',
                  lineHeight: 1.3,
                  textAlign: 'left'
                }}>
                  {log.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const HydrationTracker: React.FC<{ userId: string }> = ({ userId }) => {
  const [hydratedToday, setHydratedToday] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    try {
      const [status, stats] = await Promise.all([
        getHydrationStatus(userId),
        getStressManagementStats(userId)
      ]);
      setHydratedToday(status.hydratedToday);
      setStreak(stats.hydrationStreak || 0);
    } catch (error) {
      console.error('Error fetching hydration data', error);
    }
  };

  // Initial check handled by fetchData


  const markAsHydrated = async () => {
    if (!userId) {
      alert('You must be logged in to mark hydration.');
      return;
    }
    if (hydratedToday) return;

    setLoading(true);
    try {
      await logHydration(userId);
      await fetchData(); // Refresh status and streak
      try {
        const stats = await getStressManagementStats(userId);
        const s = Number((stats as any)?.hydrationStreak || 0);
        if (s >= 1 && !(await hasBadge(userId, 'hydration-starter'))) {
          await awardBadge(userId, { key: 'hydration-starter', name: 'Hydration Starter', icon: 'droplets', description: 'Logged hydration today' });
        }
        if (s >= 7 && !(await hasBadge(userId, 'hydration-hero'))) {
          await awardBadge(userId, { key: 'hydration-hero', name: 'Hydration Hero', icon: 'droplets', description: '7-day hydration streak' });
        }
      } catch { }
      setHydratedToday(true);
    } catch (error) {
      console.error('Error logging hydration', error);
      const message = error instanceof Error ? error.message : 'Failed to log hydration.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress in current 7-day cycle (1-7)
  const cycleProgress = streak > 0 ? ((streak - 1) % 7) + 1 : 0;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
      borderRadius: 14,
      padding: '0.5rem',
      width: '100%',
      maxWidth: 'min(680px, 100%)',
      margin: '0 auto',
      boxSizing: 'border-box',
      overflow: 'visible'
    }}>
      <div className="modal-section-title" style={{ color: '#0369a1', textAlign: 'center', marginBottom: '0.5rem', fontSize: '1rem' }}>
        Stay Hydrated, Stay Focused
      </div>

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem',
        marginBottom: '0.5rem'
      }}>
        {/* Left Column: 7-Day Streak Goal */}
        <div style={{
          background: 'white',
          padding: '0.5rem',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{
            color: '#0369a1',
            fontWeight: 600,
            marginBottom: '0.35rem',
            textAlign: 'center',
            fontSize: '0.85rem'
          }}>
            7-Day Streak Goal
          </h4>

          {/* Small Streak Indicator */}
          {streak > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              borderRadius: '6px',
              padding: '0.25rem 0.4rem',
              marginBottom: '0.35rem',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(251, 191, 36, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem'
            }}>
              <span style={{ fontSize: '0.85rem' }}>🔥</span>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>
                {streak} Day Streak!
              </span>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '240px',
            margin: '0 auto',
            padding: '0 0.15rem'
          }}>
            {[1, 2, 3, 4, 5, 6, 7].map((num) => {
              const isFilled = num <= cycleProgress;
              return (
                <div
                  key={num}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.1rem'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isFilled
                      ? 'linear-gradient(135deg, #0ea5e9, #0284c7)'
                      : '#f1f5f9',
                    border: isFilled ? 'none' : '2px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isFilled ? 'white' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    boxShadow: isFilled ? '0 2px 8px rgba(14, 165, 233, 0.3)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {num}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: 'center', marginTop: '0.4rem', fontSize: '0.7rem', color: '#64748b' }}>
            {cycleProgress === 7 ? "Week completed! Amazing!" : `${7 - cycleProgress} days to go`}
          </div>
        </div>

        {/* Right Column: Quick Tips */}
        <div style={{
          background: 'white',
          padding: '0.5rem',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{
            color: '#0369a1',
            fontWeight: 600,
            marginBottom: '0.4rem',
            textAlign: 'center',
            fontSize: '0.85rem'
          }}>
            Quick Tips
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: '#0ea5e9', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>✓</span>
              <span style={{ color: '#475569', fontSize: '0.75rem', lineHeight: 1.3 }}>
                Drink water when you wake up
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: '#0ea5e9', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>✓</span>
              <span style={{ color: '#475569', fontSize: '0.75rem', lineHeight: 1.3 }}>
                Have water before meals
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: '#0ea5e9', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>✓</span>
              <span style={{ color: '#475569', fontSize: '0.75rem', lineHeight: 1.3 }}>
                Set phone reminders
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: '#0ea5e9', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>✓</span>
              <span style={{ color: '#475569', fontSize: '0.75rem', lineHeight: 1.3 }}>
                Add lemon for flavor
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Check-in */}
      <div style={{
        background: 'white',
        padding: '0.5rem 0.75rem',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h4 style={{
          color: '#0369a1',
          fontWeight: 600,
          marginBottom: '0.35rem',
          fontSize: '0.85rem'
        }}>
          Today's Hydration Check-in
        </h4>
        <p style={{
          color: '#64748b',
          marginBottom: '0.5rem',
          fontSize: '0.75rem',
          lineHeight: 1.3
        }}>
          Did you drink enough water today?
        </p>
        <button
          onClick={markAsHydrated}
          disabled={hydratedToday}
          style={{
            background: hydratedToday ? 'transparent' : '#0ea5e9',
            color: hydratedToday ? '#0ea5e9' : 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '0.5rem 1rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: hydratedToday ? 'default' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            transition: 'all 0.3s ease',
            boxShadow: hydratedToday ? 'none' : '0 4px 12px rgba(14, 165, 233, 0.3)',
            minWidth: '180px',
            opacity: hydratedToday ? 1 : 1
          }}
        >
          {hydratedToday ? (
            <>
              <Check size={16} strokeWidth={3} />
              <span>Yes, I stayed hydrated today!</span>
            </>
          ) : (
            <>
              <Droplets size={16} />
              <span>Mark as hydrated</span>
            </>
          )}
        </button>
        {hydratedToday && (
          <p style={{
            color: '#0ea5e9',
            marginTop: '0.5rem',
            fontWeight: 600,
            fontSize: '0.75rem',
            lineHeight: 1.3
          }}>
            Great job! Keep it up!
          </p>
        )}
      </div>
    </div>
  );
};

const PositiveSelfTalkGame: React.FC = () => {
  const cards = [
    { neg: "I can't do this", pos: "I'm learning and growing" },
    { neg: "I'm not good enough", pos: "I have unique strengths" },
    { neg: "Everything is wrong", pos: "I can improve step by step" },
    { neg: "I always fail", pos: "Every attempt teaches me something" },
    { neg: "This is too hard", pos: "I can break it into small steps" },
    { neg: "I never focus", pos: "I can focus for small chunks" },
    { neg: "I'm behind", pos: "I can catch up one page at a time" },
    { neg: "I'm not smart", pos: "I am capable and improving" },
    { neg: "I mess up", pos: "Mistakes help me learn" },
    { neg: "It's pointless", pos: "Every step counts" },
    { neg: "I won't finish", pos: "I can finish one part now" },
    { neg: "I panic", pos: "I can breathe and reset" },
    { neg: "Others are better", pos: "My journey is my own" },
    { neg: "Too many tasks", pos: "I'll prioritize the top one" },
    { neg: "I forget everything", pos: "Review helps me remember" },
    { neg: "I'm always tired", pos: "Short breaks recharge me" },
    { neg: "I can't start", pos: "Starting small is still starting" },
    { neg: "I can't ask for help", pos: "Asking is a strength" },
    { neg: "I don't belong", pos: "I deserve to be here" },
    { neg: "I give up", pos: "I can try one more time" },
  ];
  const [selected] = useState(() => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  });
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  const toggleFlip = (idx: number) => {
    setFlipped(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) newSet.delete(idx);
      else newSet.add(idx);
      return newSet;
    });
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #fecaca, #fbcfe8)', borderRadius: 14, padding: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1rem' }}>
        {selected.map((card, idx) => (
          <div
            key={idx}
            style={{ padding: '0.5rem', cursor: 'pointer' }}
            onClick={() => toggleFlip(idx)}
          >
            <div style={{ position: 'relative', height: 120, perspective: '1000px' }}>
              <div className={`self-talk-card ${flipped.has(idx) ? 'flipped' : ''}`}>
                <div className="self-talk-front">{card.neg}</div>
                <div className="self-talk-back">{card.pos}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="modal-sub" style={{ textAlign: 'center' }}>Click cards to flip them</div>
    </div>
  );
};

const StressManagementApp: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.uid || '';
  const [activeSection, setActiveSection] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [breathingActive, setBreathingActive] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerProgress, setTimerProgress] = useState(0);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [expandMindMap, setExpandMindMap] = useState<Set<number>>(new Set());
  const [showReflection, setShowReflection] = useState(false);
  const [badgeEarned, setBadgeEarned] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [showBreathModal, setShowBreathModal] = useState(false);
  const [showPomodoroModal, setShowPomodoroModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showSelfTalkModal, setShowSelfTalkModal] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showGroundingModal, setShowGroundingModal] = useState(false);
  const [showHydrationModal, setShowHydrationModal] = useState(false);
  const [showPowerNapModal, setShowPowerNapModal] = useState(false);

  const sections = [
    { id: 'intro', title: 'Welcome', isActive: activeSection === 0 },
    { id: 'what-is-stress', title: 'Understanding Stress', isActive: activeSection === 1 },
    { id: 'causes', title: 'Common Causes', isActive: activeSection === 2 },
    { id: 'techniques', title: 'Try It Yourself', isActive: activeSection === 3 },
    { id: 'quick-busters', title: 'Quick Relief', isActive: activeSection === 4 },
    { id: 'help', title: 'When to Get Help', isActive: activeSection === 5 },
  ];

  useEffect(() => {
    setProgress((activeSection / (sections.length - 1)) * 100);
  }, [activeSection, sections.length]);

  useEffect(() => {
    let timerInterval: ReturnType<typeof setInterval> | undefined;

    if (isTimerRunning) {
      timerInterval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(timerSeconds - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(timerMinutes - 1);
          setTimerSeconds(59);
        } else {
          setIsTimerRunning(false);
          setTimerProgress(100);
          alert('Study session complete!  Time for a break.');
        }

        const totalSeconds = timerMinutes * 60 + timerSeconds;
        const originalTotal = 25 * 60;
        const progress = ((originalTotal - totalSeconds) / originalTotal) * 100;
        setTimerProgress(Math.max(0, Math.min(100, progress)));
      }, 1000);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isTimerRunning, timerMinutes, timerSeconds]);

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
    const element = document.getElementById(`section-${index}`);
    if (element) {
      const nav = document.querySelector('.navigation') as HTMLElement | null;
      const navComputedTop = nav ? parseFloat(getComputedStyle(nav).top || '0') : 0;
      const navOffset = nav ? nav.offsetHeight + navComputedTop : 0;
      const y = element.getBoundingClientRect().top + window.pageYOffset - navOffset - 96;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setActiveSection(index);
    setCompletedSections(prev => new Set([...prev, index]));
  };

  const toggleMindMap = (index: number) => {
    setExpandMindMap(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const flipCard = (index: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const startTimer = () => {
    if (timerMinutes === 0 && timerSeconds === 0) {
      setTimerMinutes(25);
      setTimerSeconds(0);
      setTimerProgress(0);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  return (
    <>
      <style>{`
        /* Global Styles */
        .section-container:last-of-type { margin-bottom: 0 !important; padding-bottom: 0 !important; }
        .section-container { margin-bottom: 0; }
        .section-content { padding-bottom: 0; }
        .section-content > *:last-child { margin-bottom: 0 !important; padding-bottom: 0 !important; }
        .app, .page, .content, .container { margin-bottom: 0 !important; padding-bottom: 0 !important; }
        /* Tighten gap between Intro and Section 1 */
        #section-1.section-container {
          min-height: auto;
          padding-top: 0;
          padding-bottom: 0;
          margin-top: 24px;
        }
        .app, .app * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          overflow-x: hidden;
        }

        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #e6f3ff 0%, #f0fff4 50%, #f3e8ff 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          line-height: 1.6;
          color: #2d3748;
        }

        /* Progress Bar */
        .progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          z-index: 1000;
          display: none;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #60a5fa, #34d399, #a78bfa);
          transition: width 0.3s ease;
        }

        /* Navigation */
        .navigation {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          background: rgba(255, 255, 255, 0.9);
          padding: 8px;
          border-radius: 50px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          z-index: 999;
          flex-wrap: wrap;
          max-width: 90vw;
        }

        .nav-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: transparent;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .nav-button:hover {
          background: rgba(96, 165, 250, 0.1);
          color: #3b82f6;
        }

        .nav-button.active {
          background: linear-gradient(135deg, #60a5fa, #34d399);
          color: white;
          box-shadow: 0 4px 16px rgba(96, 165, 250, 0.3);
        }

        .nav-button.completed {
          background: rgba(52, 211, 153, 0.1);
          color: #10b981;
        }

        .nav-number {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(96, 165, 250, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
        }

        /* Section Containers */
        .section-container {
          min-height: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 40px 20px;
          opacity: 1;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }
        #section-0.section-container {
          min-height: 100vh;
          padding: 0 20px 0;
        }
        .section-container.section-active {
          opacity: 1;
          transform: translateY(0);
        }

        .section-container.section-completed {
          opacity: 1;
        }

        .section-content {
          max-width: 1200px;
          width: 100%;
          text-align: center;
          position: relative;
          z-index: 2;
        }

        /* Intro Section */
        .intro-section {
          text-align: center;
        }

        .main-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 800;
          background: linear-gradient(135deg, #3b82f6, #10b981, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .intro-subtitle {
          font-size: clamp(1.2rem, 3vw, 1.5rem);
          color: #64748b;
          margin-bottom: 2rem;
          font-weight: 400;
        }

        .begin-journey-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
          transition: all 0.3s ease;
        }

        .begin-journey-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(16, 185, 129, 0.4);
        }

        /* Animated Background */
        .animated-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }

        /* Intro full-screen background image */
        .intro-image-bg {
          position: absolute;
          inset: 0;
          background-image: url("/Resource Images/1. Stress management images/12.webp");
          background-size: 20% auto;
          background-position: 6% 35%;
          background-repeat: no-repeat;
          z-index: 0;
        }

        .wave {
          position: absolute;
          width: 120%;
          height: 120%;
          background: linear-gradient(45deg, rgba(96, 165, 250, 0.1), rgba(52, 211, 153, 0.1));
          border-radius: 50%;
          animation: waveFloat 20s infinite ease-in-out;
        }

        .wave1 {
          top: -50%;
          left: -50%;
          animation-delay: 0s;
        }

        .wave2 {
          top: -30%;
          right: -30%;
          animation-delay: -7s;
        }

        .wave3 {
          bottom: -40%;
          left: 20%;
          animation-delay: -14s;
        }

        @keyframes waveFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-30px) scale(1.1);
            opacity: 0.1;
          }
        }

        /* Floating Elements */
        .floating-element {
          animation: floatIn 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
        }

        @keyframes floatIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Section Titles */
        .section-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 2rem;
        }

        /* Stress Animation */
        .stress-animation {
          margin: 3rem 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 250px;
          position: relative;
        }

        .stress-floating-icons {
          position: relative;
          width: 350px;
          height: 250px;
        }

        .floating-icon {
          position: absolute;
          font-size: 2.5rem;
          animation: gentleFloat 4s infinite ease-in-out;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .floating-icon:hover {
          transform: scale(1.2);
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.2));
        }

        .icon-1 {
          top: 10%;
          left: 15%;
          animation-delay: 0s;
          animation-duration: 3.5s;
        }

        .icon-2 {
          top: 15%;
          right: 20%;
          animation-delay: -0.5s;
          animation-duration: 4s;
        }

        .icon-3 {
          top: 45%;
          left: 10%;
          animation-delay: -1s;
          animation-duration: 3.8s;
        }

        .icon-4 {
          top: 40%;
          right: 15%;
          animation-delay: -1.5s;
          animation-duration: 4.2s;
        }

        .icon-5 {
          top: 70%;
          left: 20%;
          animation-delay: -2s;
          animation-duration: 3.6s;
        }

        .icon-6 {
          top: 75%;
          right: 25%;
          animation-delay: -2.5s;
          animation-duration: 4.1s;
        }

        .icon-7 {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -3s;
          animation-duration: 4.5s;
        }

        .icon-8 {
          top: 25%;
          left: 45%;
          animation-delay: -3.5s;
          animation-duration: 3.9s;
        }

        @keyframes gentleFloat {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
            opacity: 0.8;
          }
          25% { 
            transform: translateY(-15px) rotate(2deg);
            opacity: 1;
          }
          50% { 
            transform: translateY(-10px) rotate(-1deg);
            opacity: 0.9;
          }
          75% { 
            transform: translateY(-20px) rotate(1deg);
            opacity: 1;
          }
        }

        /* Trigger Cards */
        .stress-triggers h3 {
          font-size: 1.3rem;
          color: #64748b;
          margin-bottom: 2rem;
        }

        .trigger-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .trigger-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          min-height: 110px;
          text-align: center;
        }

        .trigger-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .trigger-card svg {
          color: #3b82f6;
          margin-bottom: 0;
          flex-shrink: 0;
        }

        .trigger-label {
          display: inline-block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0;
        }

        .trigger-description {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-weight: 500;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .trigger-card:hover .trigger-description {
          opacity: 1;
        }

        /* Mind Map */
        .mind-map-container {
          position: relative;
          height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 2rem 0;
        }

        .mind-map-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #ef4444, #f97316);
          color: white;
          padding: 1rem 2rem;
          border-radius: 25px;
          font-weight: 700;
          font-size: 1.2rem;
          box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .mind-map-center-image {
          width: 160px;
          height: 160px;
          object-fit: contain;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
        }

        .mind-map-bubbles {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .mind-bubble {
          position: absolute;
          background: white;
          border-radius: 20px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          min-width: 120px;
          text-align: center;
          overflow: visible;
          transform: var(--base-transform, none);
          transform-origin: center;
          will-change: transform, box-shadow;
        }

        .mind-bubble:nth-child(1) { top: 10%; left: 20%; animation-delay: 0s; }
        .mind-bubble:nth-child(2) { top: 10%; right: 20%; animation-delay: 0.5s; }
        .mind-bubble:nth-child(3) { bottom: 30%; left: 15%; animation-delay: 1s; }
        .mind-bubble:nth-child(4) { bottom: 30%; right: 15%; animation-delay: 1.5s; }
        .mind-bubble:nth-child(5) { bottom: 0%; left: 45%; animation-delay: 2s; }

        .mind-bubble:hover {
          transform: var(--base-transform, none) scale(1.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .bubble-label {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .bubble-details {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 1.25rem 1.25rem;
          border-radius: 14px;
          font-size: 1rem;
          line-height: 1.5;
          max-width: 340px;
          min-width: 220px;
          text-align: left;
          word-break: normal;
          overflow-wrap: break-word;
          z-index: 20;
          margin-top: 0.5rem;
          white-space: normal;
          opacity: 0;
          transition: opacity 0.25s ease;
          pointer-events: none;
        }

        .mind-bubble:hover .bubble-details {
          opacity: 1;
        }

        /* Techniques Grid */
        .techniques-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(260px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .technique-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.06);
          /* Avoid backdrop-filter to reduce repaints on hover */
          /* backdrop-filter: blur(10px); */
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          will-change: transform, box-shadow;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          overflow: hidden;
        }

        .technique-card:hover {
          transform: translate3d(0, -4px, 0);
          -webkit-transform: translate3d(0, -4px, 0);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .technique-card h3 {
          color: #374151;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }

        /* Modal mini-game styles */
        .modal-section-title { font-weight: 700; margin-bottom: 0.5rem; color: #1f2937; }
        .modal-sub { color: #6b7280; font-size: 0.95rem; margin-bottom: 1rem; }
        .modal-actions { display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem; }
        .modal-btn { background: #3b82f6; color: #fff; border: 0; padding: 8px 14px; border-radius: 10px; font-weight: 600; cursor: pointer; }
        .modal-btn.secondary { background: #e5e7eb; color: #111827; }
        .game-area { display: flex; align-items: center; justify-content: center; min-height: 180px; background: rgba(243,244,246,0.7); border-radius: 14px; }
        .breath-bubble { width: 90px; height: 90px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #a5b4fc, #60a5fa); transition: transform 0.2s ease; box-shadow: 0 8px 24px rgba(96,165,250,0.35); }
        .garden { display: flex; gap: 10px; }
        .flower { width: 22px; height: 22px; border-radius: 50%; background: #a7f3d0; opacity: 0.3; transition: opacity 0.2s, transform 0.2s; }
        .flower.active { opacity: 1; transform: scale(1.15); }
        .wave-sync { width: 100%; height: 10px; background: linear-gradient(90deg, #bfdbfe, #d8b4fe); border-radius: 9999px; position: relative; overflow: hidden; }
        .wave-dot { position: absolute; top: -6px; width: 18px; height: 18px; border-radius: 50%; background: #3b82f6; box-shadow: 0 6px 16px rgba(59,130,246,0.4); transition: left 0.2s; }
        .feather { font-size: 42px; filter: drop-shadow(0 6px 10px rgba(0,0,0,0.2)); transition: transform 0.12s ease; }
        .glow-circle { width: 140px; height: 140px; border-radius: 50%; background: radial-gradient(circle at 50% 50%, rgba(59,130,246,0.25), rgba(99,102,241,0.15)); display:flex; align-items:center; justify-content:center; box-shadow: 0 0 0 0 rgba(59,130,246,0.35); animation: pulseGlow 2s infinite; }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.35); } 70% { box-shadow: 0 0 0 18px rgba(59,130,246,0); } 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); } }

        /* Self-talk flip cards */
        .self-talk-card { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
        .self-talk-card.flipped { transform: rotateY(180deg); }
        .self-talk-front, .self-talk-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 12px; display: flex; align-items: center; justify-content: center; padding: 1rem; font-weight: 600; font-size: 0.95rem; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); pointer-events: none; }
        .self-talk-front { background: #fee2e2; color: #991b1b; }
        .self-talk-back { background: #dcfce7; color: #166534; transform: rotateY(180deg); }

        .technique-btn {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }

        .technique-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .technique-text {
          color: #64748b;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        /* Breathing Circle */
        .breathing-circle {
          width: 200px;
          height: 200px;
          margin: 2rem auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .breathing-circle-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #60a5fa, #34d399, #a78bfa);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(96, 165, 250, 0.3);
        }

        .breathing-text {
          color: white;
          font-weight: 600;
          text-align: center;
          font-size: 1rem;
        }

        /* Timer */
        .timer-visual {
          display: flex;
          justify-content: center;
          margin: 1rem 0;
        }

        .timer-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: conic-gradient(#e5e7eb 0deg, #e5e7eb 360deg);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin: 0 auto;
        }

        .timer-progress {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: conic-gradient(#3b82f6 0deg, #3b82f6 var(--progress, 0deg), #e5e7eb var(--progress, 0deg) 360deg);
          transition: transform 0.3s ease;
        }

        .timer-time {
          position: relative;
          z-index: 2;
          font-weight: 700;
          font-size: 1.1rem;
          color: #374151;
        }

        .timer-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
          margin-top: 1rem;
        }

        .timer-input {
          width: 60px;
          padding: 4px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          text-align: center;
        }

        /* Exercise Animation */
        .exercise-animation {
          position: relative;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 1rem 0;
        }

        .student-stretching {
          font-size: 3rem;
          animation: stretchMove 2s infinite ease-in-out;
        }

        .stretch-movement {
          position: absolute;
          font-size: 2rem;
          animation: stretchMove 2s infinite ease-in-out reverse;
        }

        @keyframes stretchMove {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }

        /* Card Flip */
        .card-flip-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .flip-card {
          perspective: 1000px;
          height: 80px;
          cursor: pointer;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flip-card.flipped .flip-card-inner {
          transform: rotateY(180deg);
        }

        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .flip-card-front {
          background: #fee2e2;
          color: #dc2626;
        }

        .flip-card-back {
          background: #dcfce7;
          color: #16a34a;
          transform: rotateY(180deg);
        }

        /* Journal styles were here; journaling card removed per new spec */

        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .popup-content {
          background: white;
          border-radius: 20px;
          padding: 1rem 2rem 2rem;
          width: min(720px, 95vw);
          max-width: 100%;
          max-height: 85vh;
          overflow-y: auto;
          overflow-x: hidden;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        
        .popup-content::-webkit-scrollbar {
          width: 8px;
        }
        
        .popup-content::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .popup-content::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        .popup-content::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .popup-header h3 {
          color: #374151;
          margin: 0;
        }

        .popup-header h3:empty { display: none; }

        .popup-header button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #64748b;
          padding: 0.5rem;
          margin-left: auto;
        }

        .journal-textarea {
          flex: 1;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 1rem;
          resize: none;
          font-family: inherit;
          margin-bottom: 1rem;
        }

        .save-journal-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          align-self: center;
        }

        /* Quick Busters */
        .busters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
          align-items: stretch;
        }

        .buster-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .buster-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .buster-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .buster-card h4 {
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }

        .buster-card p {
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .buster-btn {
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: auto;
          align-self: center;
        }

        .buster-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
        }

        /* Timeline */
        .timeline-container {
          position: relative;
          padding: 2rem 0;
          overflow-x: auto;
        }

        .timeline {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .timeline-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          position: relative;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .timeline-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          border-color: rgba(96, 165, 250, 0.3);
        }

        .timeline-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          position: relative;
          z-index: 2;
        }

        .timeline-icon::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 100%;
          width: 20px;
          height: 2px;
          background: linear-gradient(to right, #e5e7eb, #d1d5db);
          transform: translateY(-50%);
        }

        .timeline-content {
          flex: 1;
          min-width: 0;
        }

        .timeline-time {
          font-size: 0.85rem;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .timeline-content h4 {
          color: #1f2937;
          margin-bottom: 0.75rem;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .timeline-tip {
          color: #4b5563;
          font-size: 0.95rem;
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }

        .timeline-detail {
          color: #6b7280;
          font-size: 0.85rem;
          font-style: italic;
          line-height: 1.4;
        }

        /* Help Section */
        .help-section {
          max-width: 800px;
          margin: 0 auto;
        }

        .help-animation {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          margin: 2rem 0;
          flex-wrap: wrap;
        }

        .student-talking {
          font-size: 4rem;
          animation: talkingFloat 3s infinite ease-in-out;
        }

        .support-network {
          display: flex;
          gap: 1rem;
        }

        .teacher, .counselor, .friends {
          font-size: 2.5rem;
          animation: supportFloat 3s infinite ease-in-out;
        }

        .teacher { animation-delay: 0s; }
        .counselor { animation-delay: -1s; }
        .friends { animation-delay: -2s; }

        @keyframes talkingFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes supportFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-5px) rotate(2deg); }
          75% { transform: translateY(5px) rotate(-2deg); }
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

        .help-card svg {
          color: #ef4444;
          margin-bottom: 1rem;
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

        .help-phone, .help-btn {
          display: block;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 500;
          margin: 0.5rem auto;
          width: fit-content;
          transition: all 0.3s ease;
        }

        .help-btn {
          border: none;
          cursor: pointer;
        }

        .help-phone:hover, .help-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }

        .get-help-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 25px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 2rem;
          box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
          transition: all 0.3s ease;
        }

        .get-help-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(16, 185, 129, 0.4);
        }

        /* Reflection Section */
        .reflection-section {
          max-width: 600px;
          margin: 0 auto;
        }

        .reflection-quote {
          font-size: 1.5rem;
          color: #64748b;
          font-style: italic;
          margin: 2rem 0;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 16px;
          border-left: 4px solid #3b82f6;
        }

        .reflection-questions h3 {
          color: #374151;
          margin-bottom: 1rem;
        }

        .question-list {
          text-align: left;
          margin: 2rem 0;
        }

        .question {
          background: rgba(255, 255, 255, 0.9);
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          color: #374151;
          transition: all 0.3s ease;
        }

        .question:hover {
          transform: translateX(5px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .badge-container {
          margin: 2rem 0;
        }

        .achievement-badge {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 50px;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 8px 32px rgba(251, 191, 36, 0.3);
          transition: all 0.3s ease;
        }

        .achievement-badge:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(251, 191, 36, 0.4);
        }

        .achievement-badge.earned {
          background: linear-gradient(135deg, #10b981, #059669);
          animation: badgeEarned 2s ease-in-out infinite;
        }

        @keyframes badgeEarned {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .final-message {
          background: linear-gradient(135deg, #e0e7ff, #fef3c7);
          padding: 2rem;
          border-radius: 20px;
          margin: 2rem 0;
          color: #374151;
          font-weight: 500;
          font-size: 1.1rem;
        }

        /* Celebration Background */
        .celebration-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
          pointer-events: none;
        }

        .floating-hearts {
          position: absolute;
          font-size: 2rem;
          animation: floatUp 4s infinite ease-in-out;
          opacity: 0.7;
        }

        .floating-hearts:nth-child(1) { left: 10%; animation-delay: 0s; }
        .floating-hearts:nth-child(2) { left: 30%; animation-delay: 1s; }
        .floating-hearts:nth-child(3) { left: 50%; animation-delay: 2s; }
        .floating-hearts:nth-child(4) { left: 70%; animation-delay: 3s; }
        .floating-hearts:nth-child(5) { left: 90%; animation-delay: 0.5s; }

        @keyframes floatUp {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10%, 90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .navigation {
            position: fixed;
            top: 10px;
            left: 10px;
            right: 10px;
            transform: none;
            padding: 6px;
            gap: 4px;
            flex-wrap: wrap;
            max-width: none;
          }

          .nav-button {
            padding: 6px 12px;
            font-size: 11px;
            gap: 4px;
          }

          .nav-number {
            width: 18px;
            height: 18px;
            font-size: 9px;
          }

          .section-container {
            padding: 100px 10px 20px;
          }

          #section-0.section-container {
            padding: 80px 15px 20px;
          }

          .intro-image-bg {
            background-size: 70% auto;
            background-position: center 70%;
          }

          .mind-map-container {
            height: 400px;
          }

          .mind-bubble {
            min-width: 100px;
            padding: 0.8rem;
          }

          .mind-bubble:nth-child(1) { top: 5%; left: 5%; }
          .mind-bubble:nth-child(2) { top: 5%; right: 5%; }
          .mind-bubble:nth-child(3) { bottom: 40%; left: 2%; }
          .mind-bubble:nth-child(4) { bottom: 40%; right: 2%; }
          .mind-bubble:nth-child(5) { bottom: 5%; left: 50%; transform: translateX(-50%); }

          .bubble-details {
            max-width: 280px;
            min-width: 180px;
            font-size: 0.9rem;
            padding: 1rem;
          }

          .techniques-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .technique-card {
            padding: 1.5rem;
          }

          .technique-btn {
            padding: 10px 18px;
            font-size: 0.95rem;
            width: 100%;
            max-width: 280px;
          }

          .timeline {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .timeline-item {
            flex-direction: row;
            text-align: left;
            padding: 1rem;
          }

          .timeline-icon {
            width: 50px;
            height: 50px;
          }

          .timeline-icon::after {
            display: none;
          }

          .timeline-content h4 {
            font-size: 1.1rem;
          }

          .timeline-tip {
            font-size: 0.9rem;
          }

          .timeline-detail {
            font-size: 0.8rem;
          }

          .stress-animation {
            height: 200px;
          }

          .stress-floating-icons {
            width: 280px;
            height: 200px;
          }

          .floating-icon {
            font-size: 2rem;
          }

          .help-animation {
            flex-direction: column;
            gap: 1rem;
          }

          .support-network {
            gap: 0.5rem;
          }

          .busters-grid {
            grid-template-columns: 1fr;
          }

          .buster-card {
            padding: 1.25rem;
          }

          .buster-btn {
            padding: 10px 20px;
            font-size: 0.95rem;
            width: 100%;
            max-width: 200px;
          }

          .trigger-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .trigger-card {
            padding: 1rem;
            min-height: 90px;
          }

          .card-flip-container {
            grid-template-columns: 1fr;
          }

          .popup-content {
            width: min(720px, 95vw);
            padding: 1.5rem;
            margin: 1rem;
            max-height: 80vh;
          }

          .popup-header button {
            font-size: 1.3rem;
            padding: 0.4rem;
          }

          .modal-btn {
            padding: 10px 16px;
            font-size: 0.95rem;
            min-width: 100px;
          }

          .final-message {
            padding: 1.5rem;
            font-size: 1rem;
          }

          .begin-journey-btn, .get-help-btn, .achievement-badge {
            padding: 12px 24px;
            font-size: 1rem;
          }

          .main-title {
            font-size: 2.5rem;
            line-height: 1.1;
          }

          .intro-subtitle {
            font-size: 1.1rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .breathing-circle {
            width: 150px;
            height: 150px;
          }

          .timer-circle {
            width: 100px;
            height: 100px;
          }

          .timer-time {
            font-size: 1rem;
          }

          .student-stretching {
            font-size: 2.5rem;
          }

          .stretch-movement {
            font-size: 1.5rem;
          }

          .student-talking {
            font-size: 3rem;
          }

          .teacher, .counselor, .friends {
            font-size: 2rem;
          }

          .help-cards {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }

          .help-card {
            padding: 1.25rem;
          }

          .mind-map-center {
            padding: 0.8rem 1.5rem;
            font-size: 1rem;
          }

          .mind-map-center-image {
            width: 120px;
            height: 120px;
          }
        }

        @media (max-width: 480px) {
          .nav-button span {
            display: none;
          }

          .nav-button {
            min-width: 30px;
            padding: 6px;
          }

          .navigation {
            top: 5px;
            left: 5px;
            right: 5px;
            padding: 4px;
            gap: 3px;
          }

          .section-container {
            padding: 90px 8px 15px;
          }

          #section-0.section-container {
            padding: 70px 10px 15px;
          }

          .intro-image-bg {
            background-size: 85% auto;
            background-position: center 75%;
            opacity: 0.8;
          }

          .main-title {
            font-size: 2rem;
            margin-bottom: 0.75rem;
          }

          .intro-subtitle {
            font-size: 1rem;
            margin-bottom: 1.5rem;
          }

          .section-title {
            font-size: 1.75rem;
            margin-bottom: 1.5rem;
          }

          .mind-map-container {
            height: 350px;
          }

          .mind-bubble {
            min-width: 80px;
            padding: 0.6rem;
            font-size: 0.8rem;
          }

          .bubble-label {
            font-size: 0.8rem;
          }

          .bubble-details {
            max-width: 240px;
            min-width: 160px;
            font-size: 0.85rem;
            padding: 0.85rem;
          }

          .mind-map-center {
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
          }

          .mind-map-center-image {
            width: 100px;
            height: 100px;
          }

          .breathing-circle {
            width: 120px;
            height: 120px;
          }

          .breathing-text {
            font-size: 0.85rem;
          }

          .timer-circle {
            width: 80px;
            height: 80px;
          }

          .timer-time {
            font-size: 0.9rem;
          }

          .technique-card {
            padding: 1.25rem;
          }

          .technique-card h3 {
            font-size: 1.15rem;
          }

          .technique-text {
            font-size: 0.85rem;
          }

          .technique-btn {
            padding: 10px 16px;
            font-size: 0.9rem;
          }

          .popup-content {
            width: min(720px, 98vw);
            padding: 1rem;
            margin: 0.5rem;
            max-height: 90vh;
          }

          .popup-header h3 {
            font-size: 1.1rem;
          }

          .modal-section-title {
            font-size: 1.1rem;
          }

          .modal-sub {
            font-size: 0.9rem;
          }

          .modal-btn {
            padding: 8px 14px;
            font-size: 0.9rem;
            min-width: 90px;
          }

          .timeline-item {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 0.85rem;
          }

          .timeline-icon {
            width: 45px;
            height: 45px;
            margin-bottom: 0.5rem;
          }

          .timeline-content h4 {
            font-size: 1rem;
          }

          .timeline-tip {
            font-size: 0.85rem;
          }

          .timeline-detail {
            font-size: 0.75rem;
          }

          .trigger-grid {
            grid-template-columns: 1fr;
            gap: 0.85rem;
          }

          .trigger-card {
            padding: 0.85rem;
            min-height: 80px;
            font-size: 0.9rem;
          }

          .buster-card {
            padding: 1rem;
          }

          .buster-card h4 {
            font-size: 1rem;
          }

          .buster-card p {
            font-size: 0.85rem;
          }

          .buster-icon {
            width: 50px;
            height: 50px;
          }

          .buster-btn {
            padding: 8px 16px;
            font-size: 0.9rem;
          }

          .help-card {
            padding: 1rem;
          }

          .help-card h3 {
            font-size: 1.05rem;
          }

          .help-card p {
            font-size: 0.85rem;
          }

          .begin-journey-btn, .get-help-btn {
            padding: 10px 20px;
            font-size: 0.95rem;
          }

          .achievement-badge {
            padding: 12px 20px;
            font-size: 1.05rem;
          }

          .final-message {
            padding: 1.25rem;
            font-size: 0.95rem;
          }

          .reflection-quote {
            font-size: 1.2rem;
            padding: 1.25rem;
          }

          .stress-animation {
            height: 180px;
          }

          .stress-floating-icons {
            width: 240px;
            height: 180px;
          }

          .floating-icon {
            font-size: 1.75rem;
          }

          .student-stretching {
            font-size: 2rem;
          }

          .stretch-movement {
            font-size: 1.25rem;
          }

          .student-talking {
            font-size: 2.5rem;
          }

          .teacher, .counselor, .friends {
            font-size: 1.75rem;
          }

          .flip-card {
            height: 70px;
          }

          .flip-card-front, .flip-card-back {
            font-size: 0.85rem;
            padding: 0.4rem;
          }

          .self-talk-front, .self-talk-back {
            font-size: 0.85rem;
            padding: 0.75rem;
          }
        }

        /* Extra small devices optimization */
        @media (max-width: 360px) {
          .main-title {
            font-size: 1.75rem;
          }

          .section-title {
            font-size: 1.5rem;
          }

          .popup-content {
            padding: 0.85rem;
          }

          .technique-card, .buster-card, .help-card {
            padding: 0.85rem;
          }

          .modal-btn {
            padding: 7px 12px;
            font-size: 0.85rem;
            min-width: 80px;
          }

          .begin-journey-btn, .get-help-btn {
            padding: 8px 16px;
            font-size: 0.9rem;
          }
        }

        /* Landscape mobile optimization */
        @media (max-width: 768px) and (orientation: landscape) {
          .section-container {
            padding: 80px 15px 15px;
          }

          #section-0.section-container {
            min-height: auto;
            padding: 60px 15px 15px;
          }

          .intro-image-bg {
            background-size: 40% auto;
            background-position: 95% 50%;
          }

          .mind-map-container {
            height: 300px;
          }

          .stress-animation {
            height: 150px;
          }

          .popup-content {
            max-height: 80vh;
          }
        }

        /* Touch-friendly improvements for all mobile */
        @media (hover: none) and (pointer: coarse) {
          .nav-button,
          .technique-btn,
          .buster-btn,
          .modal-btn,
          .begin-journey-btn,
          .get-help-btn,
          .help-btn,
          .achievement-badge {
            min-height: 44px;
            min-width: 44px;
          }

          .trigger-card,
          .flip-card,
          .mind-bubble {
            cursor: pointer;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
          }

          /* Prevent double-tap zoom on buttons */
          button {
            touch-action: manipulation;
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Print Styles */
        @media print {
          .navigation,
          .progress-bar,
          .animated-background,
          .celebration-background {
            display: none;
          }

          .section-container {
            page-break-after: always;
            min-height: auto;
            opacity: 1;
            transform: none;
          }

          .section-container:last-child {
            page-break-after: avoid;
          }
        }
      `}</style>

      <div className="app">
        {/* Back to Resources Button */}
        <motion.a
          href="/resources"
          onClick={(e) => { e.preventDefault(); navigate('/resources'); }}
          className="fixed top-20 left-8 flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors group z-50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Resources</span>
        </motion.a>
        {/* Progress Bar */}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Navigation removed */}

        {/* Section 1: Intro */}
        <section id="section-0" className={`section-container ${activeSection === 0 ? 'section-active' : ''}`}>
          <motion.div
            className="section-content intro-section"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={itemVariants}>
              <h1 className="main-title">Feeling Overwhelmed?</h1>
            </motion.div>
            <motion.div variants={itemVariants}>
              <p className="intro-subtitle">You're not alone. Let's explore how to find your calm.</p>
            </motion.div>
            <motion.div variants={itemVariants}>
              <button
                className="begin-journey-btn"
                onClick={() => scrollToSection(1)}
              >
                Begin My Journey <Leaf className="ml-2" size={20} />
              </button>
            </motion.div>
          </motion.div>
          <div className="intro-image-bg" />
          <div className="animated-background">
            <div className="wave wave1"></div>
            <div className="wave wave2"></div>
            <div className="wave wave3"></div>
          </div>
        </section>

        {/* Section 2: What is Stress? */}
        <section id="section-1" className={`section-container ${activeSection === 1 ? 'section-active' : ''}`}>
          <div className="section-content">
            <h2 className="section-title">What is Stress?</h2>
            <div style={{ maxWidth: 900, width: '100%', margin: '0 auto', color: '#475569', fontSize: '1.25rem', lineHeight: 1.9, textAlign: 'center' }}>
              Stress is your body’s natural response to pressure or challenge. A little stress can help you focus and take action,
              but too much for too long can feel overwhelming and affect sleep, mood, and concentration. Common signs include
              racing thoughts, muscle tension, irritability, headaches, and trouble focusing. Learning simple tools to notice and
              manage stress can help you feel calmer and more in control.
            </div>
            <br />
            <div className="stress-triggers">
              <div className="trigger-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                  padding: '2rem',
                  borderRadius: '16px',
                  textAlign: 'left',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                      background: '#10b981',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={20} color="white" strokeWidth={3} />
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#065f46', margin: 0 }}>Normal Stress</h3>
                  </div>
                  <p style={{ marginBottom: '1rem', color: '#064e3b', fontSize: '1rem', lineHeight: 1.6 }}>
                    A little stress can push you to study or finish homework.
                  </p>
                  <p style={{ color: '#047857', fontSize: '0.95rem', fontWeight: 600 }}>
                    Example: Test nerves help you prepare.
                  </p>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
                  padding: '2rem',
                  borderRadius: '16px',
                  textAlign: 'left',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                      background: '#ef4444',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <X size={20} color="white" strokeWidth={3} />
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#991b1b', margin: 0 }}>Harmful Stress</h3>
                  </div>
                  <p style={{ marginBottom: '1rem', color: '#7f1d1d', fontSize: '1rem', lineHeight: 1.6 }}>
                    Too much stress can make you tired, anxious, or sick.
                  </p>
                  <p style={{ color: '#b91c1c', fontSize: '0.95rem', fontWeight: 600 }}>
                    Example: Worrying about grades may disturb your sleep.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Common Causes */}
        <section id="section-2" className={`section-container ${activeSection === 2 ? 'section-active' : ''}`}>
          <div className="section-content">
            <h2 className="section-title">Common Causes of Student Stress</h2>
            <div className="mind-map-container">
              <div className="mind-map-center">
                <img
                  src="/Resource Images/1. Stress management images/studentstress.png"
                  alt="Student Stress"
                  className="mind-map-center-image"
                />
                Student Stress
              </div>
              <div className="mind-map-bubbles">
                {[
                  { icon: BookOpen, label: 'Exams', color: 'bg-blue-200', text: 'Tests, assignments, and academic pressure' },
                  { icon: Users, label: 'Expectations', color: 'bg-green-200', text: 'Family, personal, and societal expectations' },
                  { icon: Heart, label: 'Friends', color: 'bg-purple-200', text: 'Social relationships and peer conflicts' },
                  { icon: Volume2, label: 'Social Media', color: 'bg-pink-200', text: 'Online pressure and comparison' },
                  { icon: Moon, label: 'Sleep', color: 'bg-indigo-200', text: 'Poor sleep habits and exhaustion' },
                ].map((cause, index) => (
                  <div
                    key={index}
                    className={`mind-bubble ${cause.color}`}
                  >
                    <cause.icon size={24} />
                    <span className="bubble-label">{cause.label}</span>
                    <div className="bubble-details">
                      {cause.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Coping Techniques */}
        <section id="section-3" className={`section-container ${activeSection === 3 ? 'section-active' : ''}`}>
          <div className="section-content">
            <h2 className="section-title">Try It Yourself</h2>
            <div className="techniques-grid">
              {/* Deep Breathing (modal) */}
              <div className="technique-card">
                <img src="/Resource Images/1. Stress management images/buddy breathing.png" alt="Breathing" style={{ width: '140px', height: '140px', margin: '0 auto 1rem', objectFit: 'contain', display: 'block' }} />
                <h3>Deep Breathing</h3>
                <p className="technique-text">Open interactive breathing games to practice mindful breaths.</p>
                <button className="technique-btn" onClick={() => setShowBreathModal(true)}>Open Breathing Challenge</button>
              </div>

              {/* Study Chunks (modal) */}
              <div className="technique-card">
                <img src="/Resource Images/1. Stress management images/buddy studying.png" alt="Studying" style={{ width: '140px', height: '140px', margin: '0 auto 1rem', objectFit: 'contain', display: 'block', transform: 'scale(1.25)', transformOrigin: 'center' }} />
                <h3>Study Chunks</h3>
                <p className="technique-text">Gamified focus sessions with visual rewards.</p>
                <button className="technique-btn" onClick={() => setShowPomodoroModal(true)}>Open Focus Challenge</button>
              </div>

              {/* Hold... (modal) */}
              <div className="technique-card">
                <img src="/Resource Images/1. Stress management images/buddy positive talk.png" alt="Positive Talk" style={{ width: '140px', height: '140px', margin: '0 auto 1rem', objectFit: 'contain', display: 'block', transform: 'scale(1.25)', transformOrigin: 'center' }} />
                <h3>Positive Self-Talk</h3>
                <p className="technique-text">Open daily changing affirmations to boost your mindset.</p>
                <button className="technique-btn" onClick={() => setShowSelfTalkModal(true)}>Open Self-Talk</button>
              </div>

              {/* Quick Exercise (modal) */}
              <div className="technique-card">
                <img src="/Resource Images/1. Stress management images/buddy exercise.png" alt="Exercise" style={{ width: '140px', height: '140px', margin: '0 auto 1rem', objectFit: 'contain', display: 'block' }} />
                <h3>Quick Exercise</h3>
                <p className="technique-text">Short movement breaks to recharge energy.</p>
                <button className="technique-btn" onClick={() => setShowExerciseModal(true)}>Open Exercise Challenge</button>
              </div>
            </div>
            {/* <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button className="technique-btn" onClick={() => setShowSelfTalkModal(true)}>Open Positive Self-Talk</button>
            </div> */}
          </div>
        </section>

        {/* Breathing Modal */}
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


        {/* Pomodoro/Study Modal */}
        {showPomodoroModal && (
          <div className="popup-overlay" onClick={() => setShowPomodoroModal(false)}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <div className="popup-header">
                <h3></h3>
                <button onClick={() => setShowPomodoroModal(false)}>×</button>
              </div>
              <StudySplitterModal userId={userId} />
            </div>
          </div>
        )}

        {/* Quick Exercise Modal */}
        {showExerciseModal && (
          <div className="popup-overlay" onClick={() => setShowExerciseModal(false)}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <div className="popup-header">
                <h3></h3>
                <button onClick={() => setShowExerciseModal(false)}>×</button>
              </div>
              <QuickExerciseRecharge userId={userId} />
            </div>
          </div>
        )}

        {/* Positive Self-Talk Modal */}
        {showSelfTalkModal && (
          <div className="popup-overlay" onClick={() => setShowSelfTalkModal(false)}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <div className="popup-header">
                <h3></h3>
                <button onClick={() => setShowSelfTalkModal(false)}>×</button>
              </div>
              <PositiveSelfTalkGame />
            </div>
          </div>
        )}

        {/* Section 5: Quick Stress Busters */}
        <section id="section-4" className={`section-container ${activeSection === 4 ? 'section-active' : ''}`}>
          <div className="section-content">
            <h2 className="section-title">Quick Stress Busters</h2>
            <div className="busters-grid">
              {[
                { img: '/Resource Images/1. Stress management images/music.png', title: 'Music Therapy', desc: 'Listen to calming instrumental music or nature sounds', color: 'bg-blue-100', action: () => setShowMusicModal(true) },
                { img: '/Resource Images/1. Stress management images/drinking water.png', title: 'Hydration', desc: 'Drink a glass of water mindfully', color: 'bg-cyan-100', action: () => setShowHydrationModal(true) },
                { img: '/Resource Images/1. Stress management images/54321.png', title: '5-4-3-2-1 Game', desc: 'Name 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste', color: 'bg-green-100', action: () => setShowGroundingModal(true) },
                { img: '/Resource Images/1. Stress management images/sleep.png', title: 'Power Nap', desc: 'Close your eyes for 10-15 minutes', color: 'bg-purple-100', action: () => setShowPowerNapModal(true) },
              ].map((buster, index) => (
                <div key={index} className="buster-card">
                  <img
                    src={buster.img}
                    alt={buster.title}
                    style={{ width: 96, height: 96, objectFit: 'contain', display: 'block', margin: '0 auto 8px' }}
                  />
                  <h4>{buster.title}</h4>
                  <p>{buster.desc}</p>
                  {buster.action && (
                    <button
                      className="buster-btn"
                      onClick={buster.action}
                    >
                      Try Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Music Therapy Modal */}
        {showMusicModal && (
          <div className="popup-overlay" onClick={() => setShowMusicModal(false)}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <div className="popup-header">
                <h3>Music Therapy</h3>
                <button onClick={() => setShowMusicModal(false)}>×</button>
              </div>
              <MusicTherapyModal />
            </div>
          </div>
        )}

        {/* Power Nap Modal */}
        {showPowerNapModal && (
          <div className="popup-overlay" onClick={() => setShowPowerNapModal(false)}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <div className="popup-header">
                <h3>Power Nap</h3>
                <button onClick={() => setShowPowerNapModal(false)}>×</button>
              </div>
              <PowerNapModal />
            </div>
          </div>
        )}

        {/* Hydration Modal */}
        {showHydrationModal && (
          <div className="popup-overlay" onClick={() => setShowHydrationModal(false)}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <div className="popup-header">
                <h3></h3>
                <button onClick={() => setShowHydrationModal(false)}>×</button>
              </div>
              <HydrationTracker userId={userId} />
            </div>
          </div>
        )}

        {/* 5-4-3-2-1 Grounding Modal */}
        {showGroundingModal && (
          <div className="popup-overlay" onClick={() => setShowGroundingModal(false)}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <div className="popup-header">
                <h3>5-4-3-2-1 Grounding</h3>
                <button onClick={() => setShowGroundingModal(false)}>×</button>
              </div>
              <GroundingGameModal />
            </div>
          </div>
        )}


        {/* Section 7: When to Ask for Help */}
        <section id="section-6" className={`section-container ${activeSection === 6 ? 'section-active' : ''}`}>
          <div className="section-content">
            <h2 className="section-title">When to Ask for Help</h2>
            <div className="help-section">
              {/* help animation removed as requested */}
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

      </div>
    </>
  );
};

export default StressManagementApp;