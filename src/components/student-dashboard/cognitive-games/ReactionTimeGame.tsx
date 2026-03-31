import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Trophy, Zap, Timer, Brain, Sparkles, Star, ChevronRight, CheckCircle, Lightbulb } from 'lucide-react';
import { GameWorkspace } from './shared/GameWorkspace';
import { UnifiedGameResults } from './shared/UnifiedGameResults';
import { useLevelProgress } from './useLevelProgress';

interface ReactionTimeGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

type LightState = 'yellow' | 'green' | 'red';
type GamePhase = 'instructions' | 'playing' | 'feedback' | 'complete';

interface RoundResult {
  lightColor: LightState;
  clicked: boolean;
  reactionTime: number | null;
  points: number;
}

const TOTAL_ROUNDS = 12;
const YELLOW_MIN_DELAY = 1000;
const YELLOW_MAX_DELAY = 4000;
const RED_PROBABILITY = 0.3; // 30% chance of red light

const MOTIVATIONAL_QUOTES = [
  "Patience is power — the calm mind reacts quickest.",
  "Every second you focus makes your brain sharper.",
  "You're faster than you think!",
  "Keep your cool — that's real speed.",
  "Practice makes your reflexes legendary.",
  "Focus is the bridge between thought and action.",
  "Speed without control is chaos. You've got both!",
  "Your brain is a supercomputer. Keep training it!"
];

const ReactionTimeGame: React.FC<ReactionTimeGameProps> = ({ onComplete, onBack }) => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('instructions');
  const [currentRound, setCurrentRound] = useState(0);
  const [lightState, setLightState] = useState<LightState>('yellow');
  const [totalScore, setTotalScore] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [lastReactionTime, setLastReactionTime] = useState<number | null>(null);
  const [canClick, setCanClick] = useState(false);
  const yellowTimeoutRef = useRef<number | null>(null);
  const missTimeoutRef = useRef<number | null>(null);
  const roundIdRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const { totalXP, recordLevelCompletion } = useLevelProgress('reactionTime');

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (yellowTimeoutRef.current) window.clearTimeout(yellowTimeoutRef.current);
      if (missTimeoutRef.current) window.clearTimeout(missTimeoutRef.current);
    };
  }, []);

  // Generate truly random color for each round - no predictable patterns
  const getRandomLightColor = (): 'green' | 'red' => {
    // Add slight randomness to the probability itself to make it even more unpredictable
    const randomizedProb = RED_PROBABILITY + (Math.random() - 0.5) * 0.1; // ±5% variance
    return Math.random() < Math.max(0.1, Math.min(0.5, randomizedProb)) ? 'red' : 'green';
  };


  const startGame = () => {
    setCurrentRound(0);
    setTotalScore(0);
    setRoundResults([]);
    setGamePhase('playing');
    startRound(0);
  };

  const startRound = (roundIndex: number) => {
    // Increment round id and clear any pending timers
    roundIdRef.current += 1;
    const thisRoundId = roundIdRef.current;
    if (yellowTimeoutRef.current) window.clearTimeout(yellowTimeoutRef.current);
    if (missTimeoutRef.current) window.clearTimeout(missTimeoutRef.current);

    setLightState('yellow');
    setCanClick(false);
    setLastReactionTime(null);
    setFeedbackMessage('');

    // Add extra randomness to yellow delay to make timing completely unpredictable
    const baseDelay = Math.random() * (YELLOW_MAX_DELAY - YELLOW_MIN_DELAY) + YELLOW_MIN_DELAY;
    const randomVariance = (Math.random() - 0.5) * 500; // ±250ms additional variance
    const yellowDelay = Math.max(500, baseDelay + randomVariance);

    yellowTimeoutRef.current = window.setTimeout(() => {
      // If round changed, abort
      if (roundIdRef.current !== thisRoundId) return;
      const newLightState: LightState = getRandomLightColor();
      setLightState(newLightState);
      setCanClick(true);

      if (newLightState === 'green') {
        startTimeRef.current = performance.now();
      }

      // Auto-advance after timeout with extra randomness
      const baseHoldDuration = 2000 + Math.random() * 2000; // 2.0s - 4.0s
      const holdVariance = (Math.random() - 0.5) * 800; // ±400ms additional variance
      const holdDuration = Math.max(1500, baseHoldDuration + holdVariance);
      missTimeoutRef.current = window.setTimeout(() => {
        // Ignore if not the same round anymore
        if (roundIdRef.current !== thisRoundId) return;
        handleMissed(newLightState);
      }, holdDuration);
    }, yellowDelay);
  };

  const handleClick = () => {
    if (!canClick) return;

    setCanClick(false);
    // Cancel any pending miss timeout for this round
    if (missTimeoutRef.current) {
      window.clearTimeout(missTimeoutRef.current);
      missTimeoutRef.current = null;
    }

    if (lightState === 'green') {
      // Correct click on green
      const reactionTime = startTimeRef.current != null
        ? Math.round(performance.now() - startTimeRef.current)
        : 0;
      setLastReactionTime(reactionTime);

      let points = 10;
      let bonus = 0;
      let message = '';

      if (reactionTime < 200) {
        bonus = 5;
        message = `⚡ Lightning Fast! ${reactionTime}ms (+${points + bonus} pts)`;
      } else if (reactionTime <= 500) {
        message = `✅ Nice Reflex! ${reactionTime}ms (+${points} pts)`;
      } else {
        message = `✅ Good! ${reactionTime}ms (+${points} pts)`;
      }

      const totalPoints = points + bonus;
      setTotalScore(prev => prev + totalPoints);
      setFeedbackMessage(message);

      setRoundResults(prev => [...prev, {
        lightColor: 'green',
        clicked: true,
        reactionTime,
        points: totalPoints
      }]);
    } else if (lightState === 'red') {
      // Wrong click on red
      const penalty = -5;
      setTotalScore(prev => Math.max(0, prev + penalty));
      setFeedbackMessage(`❌ Too early! Red means wait! (${penalty} pts)`);

      setRoundResults(prev => [...prev, {
        lightColor: 'red',
        clicked: true,
        reactionTime: null,
        points: penalty
      }]);
    }

    setGamePhase('feedback');

    setTimeout(() => {
      const nextRound = currentRound + 1;
      if (nextRound < TOTAL_ROUNDS) {
        setCurrentRound(nextRound);
        setGamePhase('playing');
        startRound(nextRound);
      } else {
        finishGame();
      }
    }, 1500);
  };

  const handleMissed = (lightColor: LightState) => {
    if (gamePhase !== 'playing') return;

    setCanClick(false);
    // Cancel any pending timers as we're concluding this round
    if (yellowTimeoutRef.current) {
      window.clearTimeout(yellowTimeoutRef.current);
      yellowTimeoutRef.current = null;
    }
    if (missTimeoutRef.current) {
      window.clearTimeout(missTimeoutRef.current);
      missTimeoutRef.current = null;
    }

    if (lightColor === 'green') {
      setFeedbackMessage('⏱️ You missed it! (0 pts)');
      setRoundResults(prev => [...prev, {
        lightColor: 'green',
        clicked: false,
        reactionTime: null,
        points: 0
      }]);
    } else {
      // Correctly didn't click red
      const reward = 5;
      setFeedbackMessage(`✅ Good restraint! (+${reward} pts)`);
      setTotalScore(prev => prev + reward);
      setRoundResults(prev => [...prev, {
        lightColor: 'red',
        clicked: false,
        reactionTime: null,
        points: reward
      }]);
    }

    setGamePhase('feedback');

    setTimeout(() => {
      const nextRound = currentRound + 1;
      if (nextRound < TOTAL_ROUNDS) {
        setCurrentRound(nextRound);
        setGamePhase('playing');
        startRound(nextRound);
      } else {
        finishGame();
      }
    }, 1500);
  };

  const finishGame = () => {
    setGamePhase('complete');
  };

  useEffect(() => {
    if (gamePhase !== 'complete') return;

    const finalScore = Math.round((totalScore / (TOTAL_ROUNDS * 15)) * 100); // Max possible ~15pts per round
    recordLevelCompletion(1, Math.min(100, Math.max(0, finalScore)), totalScore);
    onComplete(Math.min(100, Math.max(0, finalScore)));
  }, [gamePhase, totalScore, onComplete, recordLevelCompletion]);

  if (gamePhase === 'instructions') {
    return (
      <div className="w-full h-full flex justify-center py-4 bg-white font-sans relative overflow-hidden text-slate-900">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#93c5fd 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="w-full max-w-4xl px-6 flex flex-col relative z-10 pt-4 pb-2">
          {/* Main Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase leading-none text-center sm:text-left">Reaction Master</h1>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest leading-none">Status: Game Ready</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onBack}
              className="h-10 px-4 rounded-xl border-2 border-slate-100 bg-white text-slate-500 font-bold hover:bg-blue-50 hover:text-blue-900 transition-all text-[10px] flex items-center gap-2 shadow-sm"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </Button>
          </div>

          {/* Compact protocol label (no large background card) */}
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-2xl bg-[#EFF6FF] flex items-center justify-center text-xl">
              🚦
            </div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Goal: Speed &amp; Focus</p>
          </div>

          {/* Mission Intel */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 px-1 mb-2">
              <Sparkles className="w-3 h-3 text-sky-500" />
              <h3 className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em]">Quick Tips</h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { title: 'Yellow Light', color: 'amber', icon: '🟡', desc: 'Get ready. Watch for the light to change.' },
                { title: 'Green Light', color: 'emerald', icon: '🟢', desc: 'Click now! Be as fast as you can (+10 pts).' },
                { title: 'Red Light', color: 'rose', icon: '🔴', desc: 'Stop! Do not click or you will lose points.' }
              ].map((phase, i) => (
                <div key={phase.title} className="group p-4 rounded-2xl border border-slate-50 bg-white shadow-sm flex items-center gap-5 transition-all hover:border-sky-100">
                  <div className={`w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform`}>
                    {phase.icon}
                  </div>
                  <div>
                    <p className={`text-[11px] font-black uppercase tracking-tight text-blue-600`}>{phase.title}</p>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{phase.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3 mb-1 text-[10px] text-blue-600 font-bold">
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <p className="leading-snug">
              <span className="uppercase font-black mr-1">Pro tip:</span>
              Under 200ms reaction earns a <span className="text-emerald-600 font-black">legendary bonus</span>. Focus on the center.
            </p>
          </div>

          <Button
            onClick={startGame}
            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-600 text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] group mt-1"
          >
            START CHALLENGE
            <Play className="w-4 h-4 ml-3" />
          </Button>
        </div>
      </div>
    );
  }


  if (gamePhase === 'playing' || gamePhase === 'feedback') {
    const getLightColor = () => {
      if (lightState === 'yellow') return 'bg-amber-400';
      if (lightState === 'green') return 'bg-emerald-500';
      return 'bg-rose-500';
    };

    const getLightText = () => {
      if (lightState === 'yellow') return 'Get Ready...';
      if (lightState === 'green') return 'Click Now!';
      return 'Wait! Don\'t click.';
    };

    const getLightEmoji = () => {
      if (lightState === 'yellow') return '🟡';
      if (lightState === 'green') return '🟢';
      return '🔴';
    };

    return (
      <GameWorkspace
        title="Reaction Master"
        subtitle="Speed & Focus Protocol"
        currentRound={currentRound + 1}
        totalRounds={TOTAL_ROUNDS}
        score={totalScore}
        icon={<Zap className="w-5 h-5 text-white" />}
      >
        <div className="flex-1 flex flex-col items-center justify-center py-2 w-full h-full">
          <div className="relative group">
            {/* Outer Glow Effect */}
            <div className={`absolute inset-0 blur-[60px] opacity-20 rounded-full scale-110 transition-colors duration-500 ${getLightColor()}`} />

            <button
              disabled={gamePhase === 'feedback'}
              onClick={handleClick}
              className={`relative w-64 h-64 rounded-full border-[10px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center text-white transition-all duration-300 transform active:scale-95 ${canClick && lightState === 'green' ? 'cursor-pointer hover:scale-105' : 'cursor-default'} ${getLightColor()} z-10`}
            >
              <div className="text-5xl mb-4 drop-shadow-md">{getLightEmoji()}</div>
              <p className="text-sm font-black uppercase tracking-[0.1em] drop-shadow-sm">{getLightText()}</p>
              {lightState === 'yellow' && <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />}
            </button>

            {/* Feedback Alert */}
            {gamePhase === 'feedback' && feedbackMessage && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 z-20">
                <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-[2rem] border-2 border-slate-100 shadow-2xl text-center transform -rotate-2">
                  <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">{feedbackMessage}</p>
                </div>
              </div>
            )}
          </div>

          {gamePhase === 'playing' && lightState === 'yellow' && (
            <div className="mt-8 group">
              <div className="flex items-center gap-3 bg-slate-50/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-slate-100 shadow-sm animate-bounce">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Wait for visual trigger...</p>
              </div>
            </div>
          )}
        </div>
      </GameWorkspace>
    );
  }

  if (gamePhase === 'complete') {
    const accuracy = Math.round((roundResults.filter(r => (r.clicked && r.lightColor === 'green') || (!r.clicked && r.lightColor === 'red')).length / TOTAL_ROUNDS) * 100);
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

    return (
      <UnifiedGameResults
        score={totalScore}
        maxScore={TOTAL_ROUNDS * 15}
        accuracy={accuracy}
        xpEarned={totalScore}
        levelName="Reaction Master"
        gameId="reaction-time"
        isPassed={true}
        motivationalText={randomQuote}
        onPlayAgain={startGame}
        onExit={onBack}
      />
    );
  }

  return null;
};

export default ReactionTimeGame;
