import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Star, Sparkles, Zap, Timer, Trophy, Target, Brain, CheckCircle, Lock, Settings, ChevronRight, RotateCcw, Info } from 'lucide-react';
import { LevelPathContainer, LevelPathNodeData } from './level-path';
import LevelSelectScaffold from './LevelSelectScaffold';
import { GameWorkspace } from './shared/GameWorkspace';
import { UnifiedGameResults } from './shared/UnifiedGameResults';

interface StroopGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

type GameMode = 'classic' | 'speed' | 'focus' | 'distraction' | 'reverse';
type GameState = 'menu' | 'warmup' | 'playing' | 'memory' | 'complete';
type TaskType = 'color' | 'word';

interface LevelConfig {
  id: number;
  name: string;
  description: string;
  colors: string[];
  trials: number;
  timePerTrial: number;
  congruentRatio: number;
  hasDistraction: boolean;
  hasTaskSwitch: boolean;
  hasReverse: boolean;
  hasMemoryCheck: boolean;
  hasMissingLetters: boolean;
}

interface Profile {
  levelsUnlocked: number[];
  xp: number;
  coins: number;
  streak: number;
  badges: string[];
  gamesPlayed: number;
  bestScores: Record<number, number>;
  bestTimes: Record<number, number>;
}

interface TrialResult {
  correct: boolean;
  reactionTime: number;
  speedBonus: number;
}

const STORAGE_KEY = 'stroop_profile_v1';

const COLORS = {
  red: { name: 'Red', class: 'text-rose-500', bg: 'bg-rose-500' },
  blue: { name: 'Blue', class: 'text-sky-500', bg: 'bg-sky-500' },
  green: { name: 'Green', class: 'text-emerald-500', bg: 'bg-emerald-500' },
  yellow: { name: 'Yellow', class: 'text-amber-500', bg: 'bg-amber-500' },
  purple: { name: 'Purple', class: 'text-violet-500', bg: 'bg-violet-500' },
  orange: { name: 'Orange', class: 'text-orange-500', bg: 'bg-orange-500' },
};

const LEVELS: LevelConfig[] = [
  { id: 1, name: 'Color Basics', description: 'Intro level', colors: ['red', 'blue', 'green', 'yellow'], trials: 10, timePerTrial: 8, congruentRatio: 0.5, hasDistraction: false, hasTaskSwitch: false, hasReverse: false, hasMemoryCheck: false, hasMissingLetters: false },
  { id: 2, name: 'Speed Starter', description: 'Balanced trials', colors: ['red', 'blue', 'green', 'yellow'], trials: 15, timePerTrial: 6, congruentRatio: 0.4, hasDistraction: false, hasTaskSwitch: false, hasReverse: false, hasMemoryCheck: false, hasMissingLetters: false },
  { id: 3, name: 'Mix & Match', description: 'New colors', colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'], trials: 15, timePerTrial: 5, congruentRatio: 0.3, hasDistraction: true, hasTaskSwitch: false, hasReverse: false, hasMemoryCheck: false, hasMissingLetters: false },
  { id: 4, name: 'Race the Clock', description: 'Timer speeds up', colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'], trials: 18, timePerTrial: 4, congruentRatio: 0.3, hasDistraction: true, hasTaskSwitch: false, hasReverse: false, hasMemoryCheck: false, hasMissingLetters: false },
  { id: 5, name: 'Switch It Up', description: 'Dual task', colors: ['red', 'blue', 'green', 'yellow', 'purple'], trials: 20, timePerTrial: 4, congruentRatio: 0.25, hasDistraction: false, hasTaskSwitch: true, hasReverse: false, hasMemoryCheck: false, hasMissingLetters: false },
  { id: 6, name: 'Brain Flip', description: 'Reverse Stroop', colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'], trials: 20, timePerTrial: 3.5, congruentRatio: 0.2, hasDistraction: false, hasTaskSwitch: false, hasReverse: true, hasMemoryCheck: false, hasMissingLetters: false },
  { id: 7, name: 'Focus Challenge', description: 'Distractions', colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'], trials: 22, timePerTrial: 3, congruentRatio: 0.2, hasDistraction: true, hasTaskSwitch: true, hasReverse: false, hasMemoryCheck: false, hasMissingLetters: false },
  { id: 8, name: 'Color Recall', description: 'Memory check', colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'], trials: 20, timePerTrial: 3, congruentRatio: 0.15, hasDistraction: true, hasTaskSwitch: false, hasReverse: false, hasMemoryCheck: true, hasMissingLetters: false },
  { id: 9, name: 'Sneaky Words', description: 'Missing letters', colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'], trials: 22, timePerTrial: 2.8, congruentRatio: 0.15, hasDistraction: true, hasTaskSwitch: false, hasReverse: false, hasMemoryCheck: false, hasMissingLetters: true },
  { id: 10, name: 'Grand Master', description: 'All mechanics', colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'], trials: 25, timePerTrial: 2.5, congruentRatio: 0.1, hasDistraction: true, hasTaskSwitch: true, hasReverse: false, hasMemoryCheck: true, hasMissingLetters: true },
];

import { InstructionalOverlay } from './shared/InstructionalOverlay';
import { useLevelProgress } from './useLevelProgress';

const StroopGame: React.FC<StroopGameProps> = ({ onComplete, onBack }) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(LEVELS[0]);
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [pendingLevel, setPendingLevel] = useState<LevelConfig | null>(null);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentTrial, setCurrentTrial] = useState(0);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [displayWord, setDisplayWord] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentTask, setCurrentTask] = useState<TaskType>('color');
  const [trialResults, setTrialResults] = useState<TrialResult[]>([]);
  const [colorFrequency, setColorFrequency] = useState<Record<string, number>>({});
  const [memoryAnswer, setMemoryAnswer] = useState<string | null>(null);
  const [showMemoryCheck, setShowMemoryCheck] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showDistraction, setShowDistraction] = useState(false);
  const [stars, setStars] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [isTrialReady, setIsTrialReady] = useState(false);
  const [distractionIntensity, setDistractionIntensity] = useState(0);
  const [flashingColors, setFlashingColors] = useState<string[]>([]);
  const [movingShapes, setMovingShapes] = useState<Array<{ id: number, x: number, y: number, color: string, shape: string }>>([]);
  const [screenShake, setScreenShake] = useState(false);
  const [backgroundFlash, setBackgroundFlash] = useState(false);

  const [profile, setProfile] = useState<Profile | null>({ levelsUnlocked: [1], xp: 0, coins: 0, streak: 0, badges: [], gamesPlayed: 0, bestScores: {}, bestTimes: {} });
  const { totalXP, completedLevels, bestScores, isLevelUnlocked, recordLevelCompletion } = useLevelProgress('stroop');

  // Timer countdown
  useEffect(() => {
    const active = gameState === 'playing' && !showMemoryCheck && !feedback;
    if (!active) return;
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 0.1), 100);
      return () => clearTimeout(timer);
    }
    if (timeLeft <= 0 && !feedback) {
      handleTimeout();
    }
  }, [gameState, timeLeft, showMemoryCheck, feedback]);

  // Enhanced distraction system
  useEffect(() => {
    if (gameState === 'playing' && (selectedLevel?.hasDistraction || gameMode === 'distraction')) {
      const baseInterval = gameMode === 'distraction' ? 400 : 800;
      const intensityLevel = gameMode === 'distraction' ? 3 : 1;

      // Main distraction toggle
      const mainInterval = setInterval(() => {
        setShowDistraction((prev) => !prev);
        setDistractionIntensity(Math.floor(Math.random() * intensityLevel) + 1);
      }, baseInterval);

      // Flashing color words
      const colorInterval = setInterval(() => {
        if (gameMode === 'distraction') {
          const colors = Object.keys(COLORS);
          const randomColors = colors.sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 3));
          setFlashingColors(randomColors);
          setTimeout(() => setFlashingColors([]), 300);
        }
      }, 1200);

      // Moving shapes
      const shapeInterval = setInterval(() => {
        if (gameMode === 'distraction') {
          const shapes = ['circle', 'square', 'triangle', 'star'];
          const colors = Object.keys(COLORS);
          const newShapes = Array.from({ length: 3 + Math.floor(Math.random() * 4) }, (_, i) => ({
            id: Date.now() + i,
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: shapes[Math.floor(Math.random() * shapes.length)]
          }));
          setMovingShapes(newShapes);
          setTimeout(() => setMovingShapes([]), 2000);
        }
      }, 1800);

      // Screen shake effect
      const shakeInterval = setInterval(() => {
        if (gameMode === 'distraction' && Math.random() < 0.3) {
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 200);
        }
      }, 2500);

      // Background flash effect
      const flashInterval = setInterval(() => {
        if (gameMode === 'distraction' && Math.random() < 0.2) {
          setBackgroundFlash(true);
          setTimeout(() => setBackgroundFlash(false), 150);
        }
      }, 3000);

      return () => {
        clearInterval(mainInterval);
        clearInterval(colorInterval);
        clearInterval(shapeInterval);
        clearInterval(shakeInterval);
        clearInterval(flashInterval);
      };
    }
  }, [gameState, selectedLevel, gameMode]);

  const starsFromPct = (pct: number): number => {
    if (pct >= 90) return 3;
    if (pct >= 70) return 2;
    if (pct >= 50) return 1;
    return 0;
  };

  const maskWord = (word: string): string => {
    const len = word.length;
    if (len <= 3) return word;
    const idx = Math.floor(Math.random() * len);
    return word.split('').map((c, i) => (i === idx ? '_' : c)).join('');
  };

  const getColorClass = (color: string): string => {
    const colorKey = color as keyof typeof COLORS;
    return COLORS[colorKey]?.class || 'text-gray-500';
  };

  const getColorBg = (color: string): string => {
    const colorKey = color as keyof typeof COLORS;
    return COLORS[colorKey]?.bg || 'bg-gray-500';
  };

  const getColorName = (color: string): string => {
    const colorKey = color as keyof typeof COLORS;
    return COLORS[colorKey]?.name || color;
  };

  const renderShape = (shape: string, color: string, size: number = 12) => {
    const colorClass = getColorBg(color);
    const baseClasses = `absolute transition-all duration-1000 ${colorClass} opacity-60`;

    switch (shape) {
      case 'circle':
        return `${baseClasses} rounded-full w-${size} h-${size}`;
      case 'square':
        return `${baseClasses} w-${size} h-${size}`;
      case 'triangle':
        return `${baseClasses} w-0 h-0 border-l-${size / 2} border-r-${size / 2} border-b-${size} border-transparent border-b-current`;
      case 'star':
        return `${baseClasses} w-${size} h-${size} clip-path-star`;
      default:
        return `${baseClasses} rounded-full w-${size} h-${size}`;
    }
  };

  const generateTrial = useCallback(() => {
    if (!selectedLevel) return;

    const levelColors = selectedLevel.colors;
    let isCongruent = Math.random() < selectedLevel.congruentRatio;

    // Game mode adjustments
    if (gameMode === 'speed') {
      isCongruent = Math.random() < 0.1; // Mostly incongruent for speed mode
    } else if (gameMode === 'focus') {
      isCongruent = Math.random() < 0.5; // Balanced for focus mode
    } else if (gameMode === 'distraction') {
      isCongruent = Math.random() < 0.2; // Harder with distractions
    } else if (gameMode === 'reverse') {
      isCongruent = Math.random() < 0.15; // Reverse is always harder
    }

    let word = levelColors[Math.floor(Math.random() * levelColors.length)];
    let color = isCongruent ? word : levelColors[Math.floor(Math.random() * levelColors.length)];

    if (!isCongruent) {
      while (color === word) {
        color = levelColors[Math.floor(Math.random() * levelColors.length)];
      }
    }

    // Set states immediately to ensure they're available
    setCurrentWord(word);
    setCurrentColor(color);

    // Task type based on level and game mode
    if (gameMode === 'reverse' || selectedLevel.hasReverse) {
      setCurrentTask('word');
    } else if (selectedLevel.hasTaskSwitch) {
      setCurrentTask(Math.random() < 0.5 ? 'color' : 'word');
    } else {
      setCurrentTask('color');
    }

    const finalDisplayWord = selectedLevel.hasMissingLetters && Math.random() < 0.3
      ? maskWord(word.toUpperCase())
      : word.toUpperCase();
    setDisplayWord(finalDisplayWord);

    setColorFrequency((prev) => ({ ...prev, [color]: (prev[color] || 0) + 1 }));

    setStartTime(Date.now());

    // Adjust time based on game mode
    let timeLimit = selectedLevel.timePerTrial;
    if (gameMode === 'speed') {
      timeLimit = Math.max(1.5, selectedLevel.timePerTrial * 0.7); // 30% faster
    } else if (gameMode === 'focus') {
      timeLimit = 999; // No time limit in focus mode
    }
    setTimeLeft(timeLimit);
    setIsTrialReady(true);
  }, [selectedLevel, gameMode]);

  const startLevel = (level: LevelConfig, mode: GameMode = 'classic') => {
    setSelectedLevel(level);
    setGameMode(mode);
    setCurrentTrial(0);
    setScore(0);
    setTotalPoints(0);
    setStreak(0);
    setMaxStreak(0);
    setTrialResults([]);
    setColorFrequency({});
    setMemoryAnswer(null);
    setShowMemoryCheck(false);
    setShowModeSelect(false);
    setPendingLevel(null);
    setIsTrialReady(false);
    setGameState('warmup');

    setTimeout(() => {
      setGameState('playing');
      generateTrial();
    }, 2000);
  };

  const handleLevelClick = (level: LevelConfig) => {
    setPendingLevel(level);
    setShowModeSelect(true);
  };

  const handleModeSelect = (mode: GameMode) => {
    if (pendingLevel) {
      startLevel(pendingLevel, mode);
    }
  };

  const handleAnswer = (selectedColor: string) => {
    if (feedback) return;

    const reactionTime = Date.now() - startTime;
    const correctAnswer = currentTask === 'color' ? currentColor : currentWord;
    const isCorrect = selectedColor === correctAnswer;

    let points = 0;
    let speedBonus = 0;

    if (isCorrect) {
      points = 10;
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const newStreak = prev + 1;
        setMaxStreak((max) => Math.max(max, newStreak));
        return newStreak;
      });

      if (reactionTime < 1000) speedBonus = 5;
      if (reactionTime < 750) speedBonus = 10;

      if (streak >= 5) {
        points *= 2;
        speedBonus *= 2;
      }

      setTotalPoints((prev) => prev + points + speedBonus);
      setFeedback('correct');
    } else {
      points = -5;
      setTotalPoints((prev) => Math.max(0, prev + points));
      setStreak(0);
      setFeedback('wrong');
    }

    setTrialResults((prev) => [...prev, { correct: isCorrect, reactionTime, speedBonus }]);

    setTimeout(() => {
      setFeedback(null);
      const nextTrial = currentTrial + 1;

      if (selectedLevel?.hasMemoryCheck && nextTrial === Math.floor(selectedLevel.trials / 2)) {
        setShowMemoryCheck(true);
        setGameState('memory');
      } else if (nextTrial < (selectedLevel?.trials || 0)) {
        setCurrentTrial(nextTrial);
        setIsTrialReady(false);
        generateTrial();
      } else {
        finishGame();
      }
    }, 600);
  };

  const handleTimeout = () => {
    setFeedback('wrong');
    setStreak(0);
    setTrialResults((prev) => [...prev, { correct: false, reactionTime: (selectedLevel?.timePerTrial || 3) * 1000, speedBonus: 0 }]);

    setTimeout(() => {
      setFeedback(null);
      const nextTrial = currentTrial + 1;
      if (nextTrial < (selectedLevel?.trials || 0)) {
        setCurrentTrial(nextTrial);
        setIsTrialReady(false);
        generateTrial();
      } else {
        finishGame();
      }
    }, 600);
  };

  const handleMemoryAnswer = (color: string) => {
    setMemoryAnswer(color);
    const mostFrequent = Object.entries(colorFrequency).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (color === mostFrequent) {
      setScore((prev) => prev + 1);
      setTotalPoints((prev) => prev + 20);
    }

    setTimeout(() => {
      setShowMemoryCheck(false);
      setGameState('playing');
      setCurrentTrial((prev) => prev + 1);
      setIsTrialReady(false);
      generateTrial();
    }, 1500);
  };

  const finishGame = () => {
    if (!selectedLevel) return;

    const accuracy = Math.round((score / selectedLevel.trials) * 100);
    const avgReactionTime = trialResults.reduce((sum, r) => sum + r.reactionTime, 0) / trialResults.length;
    const earnedStars = starsFromPct(accuracy);
    setStars(earnedStars);

    const baseXP = selectedLevel.id * 20 + totalPoints;
    const streakBonus = maxStreak >= 10 ? 30 : maxStreak >= 5 ? 15 : 0;
    const xp = baseXP + streakBonus;
    const coins = earnedStars;

    setXpEarned(xp);
    setCoinsEarned(coins);

    recordLevelCompletion(selectedLevel.id, accuracy, xp);

    setGameState('complete');
    onComplete(accuracy);
  };

  const getTimerColor = (): string => {
    if (!selectedLevel) return 'bg-green-500';
    const pct = (timeLeft / selectedLevel.timePerTrial) * 100;
    if (pct > 60) return 'bg-green-500';
    if (pct > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMotivationalMessage = (accuracy: number): string => {
    if (accuracy >= 95) return "🌟 Outstanding! Your focus is razor-sharp!";
    if (accuracy >= 85) return "🎯 Excellent! You're training your brain to stay calm under pressure!";
    if (accuracy >= 70) return "💪 Great job! Your cognitive control is improving!";
    if (accuracy >= 50) return "👍 Good effort! Keep practicing to strengthen your focus!";
    return "🧠 Every attempt trains your brain. Try again!";
  };

  if (gameState === 'menu') {
    const completedLevels = new Set(
      Object.entries(profile?.bestScores || {})
        .filter(([_, score]) => score >= 70)
        .map(([id]) => parseInt(id))
    );

    const isLevelUnlocked = (levelId: number): boolean => {
      if (levelId === 1) return true;
      return Array.isArray(profile?.levelsUnlocked) && profile!.levelsUnlocked.includes(levelId);
    };

    const levelPathData: LevelPathNodeData[] = LEVELS.map(level => ({
      id: level.id,
      name: level.name,
      xpReward: level.id * 20,
      metadata: {
        trials: level.trials,
        description: level.description
      }
    }));

    const handleStartMission = (level: LevelConfig) => {
      setSelectedLevel(level);
      setShowInstructions(true);
    };

    const startLevelActual = () => {
      setShowInstructions(false);
      startLevel(selectedLevel);
    };

    return (
      <>
        <LevelSelectScaffold
          title="Color Match"

          onBack={onBack}
          totalXP={totalXP}
          completedLevelsCount={completedLevels.size}
          totalLevels={LEVELS.length}
        >
          <InstructionalOverlay
            isOpen={showInstructions}
            onComplete={startLevelActual}
            title="Mission Rules"
            instructions={[
              "Look at the word on the screen",
              "Identify the COLOR of the text",
              "Ignore the word itself if it's different",
              "Select the matching color circle"
            ]}
            patternType="tap"
          />





          <div className="relative mb-24">
            <LevelPathContainer
              levels={levelPathData}
              completedLevels={completedLevels}
              bestScores={profile?.bestScores || {}}
              selectedLevelId={selectedLevel.id}
              onSelectLevel={(level) => {
                const fullLevel = LEVELS.find(l => l.id === level.id);
                if (fullLevel) setSelectedLevel(fullLevel);
              }}
              onStartLevel={(level) => {
                const fullLevel = LEVELS.find(l => l.id === level.id);
                if (fullLevel) handleStartMission(fullLevel);
              }}
              isLevelUnlocked={isLevelUnlocked}
              nodeHeight={180}
            />
          </div>
        </LevelSelectScaffold>

        {showModeSelect && pendingLevel && (
          <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[3rem] p-0 w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative border-4 border-blue-50">
              <div className="p-10 pb-8 text-center border-b border-blue-50">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-3">Initialize Sequence</p>
                <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">{pendingLevel.name}</h3>
              </div>

              <div className="p-8 pt-6 space-y-3">
                {[
                  { id: 'classic', name: 'Classic', desc: 'Standard assessment', icon: Play, color: 'text-sky-500' },
                  { id: 'speed', name: 'Speed', desc: 'Accelerated pacing', icon: Zap, color: 'text-amber-500' },
                  { id: 'focus', name: 'Focus', desc: 'Precision emphasis', icon: Target, color: 'text-emerald-500' },
                  { id: 'distraction', name: 'Chaos', desc: 'High signal noise', icon: Sparkles, color: 'text-violet-500' },
                  { id: 'reverse', name: 'Reverse', desc: 'Inverted logic', icon: Trophy, color: 'text-orange-500' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleModeSelect(mode.id as GameMode)}
                    className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-white hover:border-slate-200 hover:bg-slate-50 text-left transition-all flex items-center gap-4 group active:scale-[0.98]"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all shadow-none`}>
                      <mode.icon className={`w-6 h-6 ${mode.color}`} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 uppercase tracking-tight text-sm">{mode.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">{mode.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 ml-auto group-hover:text-slate-400 transition-colors" />
                  </button>
                ))}
              </div>
              <div className="p-8 pt-0">
                <Button
                  variant="ghost"
                  onClick={() => setShowModeSelect(false)}
                  className="w-full h-14 rounded-2xl text-slate-400 font-black hover:bg-slate-50 hover:text-slate-600 transition-all text-[11px] uppercase tracking-widest"
                >
                  Cancel Selection
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (gameState === 'complete') {
    const accuracy = Math.round((score / (selectedLevel?.trials || 1)) * 100);

    return (
      <UnifiedGameResults
        score={score}
        maxScore={selectedLevel?.trials || 1}
        accuracy={accuracy}
        xpEarned={xpEarned}
        levelName={selectedLevel?.name || 'Stroop Challenge'}
        gameId="stroop"
        isPassed={accuracy >= 70}
        motivationalText="Focus is a muscle. The more you train, the stronger it gets."
        onPlayAgain={() => startLevel(selectedLevel!, gameMode)}
        onExit={() => setGameState('menu')}
      />
    );
  }

  // Warmup countdown
  if (gameState === 'warmup') {
    return (
      <GameWorkspace
        title="Stroop Challenge"
        subtitle="Preparing..."
        level={selectedLevel?.id}
        icon={<Brain className="w-5 h-5" />}
        showProgress={false}
      >
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] mb-6">Get Ready</p>
          <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-100 shadow-xl flex items-center justify-center">
            <span className="text-4xl font-black text-slate-800 animate-pulse">3</span>
          </div>
          <p className="mt-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
            {currentTask === 'color' ? 'Pick the INK COLOR' : 'Pick the WORD'}
          </p>
        </div>
      </GameWorkspace>
    );
  }

  // Memory check mid-game
  if (gameState === 'memory' && showMemoryCheck) {
    return (
      <GameWorkspace
        title="Stroop Challenge"
        subtitle="Memory Check"
        level={selectedLevel?.id}
        currentRound={currentTrial + 1}
        totalRounds={selectedLevel?.trials}
        score={score}
        icon={<Brain className="w-5 h-5" />}
      >
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto">
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4">Memory Checkpoint</p>
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 text-center">
            Which color appeared most often?
          </h3>
          <div className="grid grid-cols-3 gap-3 w-full">
            {selectedLevel?.colors.map((color) => (
              <button
                key={color}
                onClick={() => handleMemoryAnswer(color)}
                disabled={memoryAnswer !== null}
                className={`h-14 rounded-2xl border-2 transition-all active:scale-95 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-tight
                  ${memoryAnswer === color
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-sky-300 hover:shadow-md'
                  }`}
              >
                <div className={`w-4 h-4 rounded-full ${getColorBg(color)}`} />
                {getColorName(color)}
              </button>
            ))}
          </div>
        </div>
      </GameWorkspace>
    );
  }

  // Main playing state
  if (gameState === 'playing') {
    return (
      <GameWorkspace
        title="Stroop Challenge"
        subtitle={currentTask === 'color' ? 'Pick the Ink Color' : 'Pick the Word'}
        level={selectedLevel?.id}
        currentRound={currentTrial + 1}
        totalRounds={selectedLevel?.trials}
        timeLeft={gameMode === 'focus' ? undefined : timeLeft}
        maxTime={selectedLevel?.timePerTrial}
        score={score}
        streak={streak}
        icon={<Brain className="w-5 h-5" />}
      >
        <div className={`flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto relative ${screenShake ? 'animate-shake' : ''}`}>
          {/* Distraction overlays */}
          {showDistraction && (selectedLevel?.hasDistraction || gameMode === 'distraction') && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {flashingColors.map((c, i) => (
                <div
                  key={i}
                  className={`absolute ${getColorBg(c)} opacity-20 rounded-full blur-xl`}
                  style={{
                    width: `${40 + Math.random() * 60}px`,
                    height: `${40 + Math.random() * 60}px`,
                    left: `${Math.random() * 80}%`,
                    top: `${Math.random() * 80}%`,
                  }}
                />
              ))}
              {movingShapes.map((shape) => (
                <div
                  key={shape.id}
                  className={`absolute ${getColorBg(shape.color)} opacity-30 ${shape.shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}
                  style={{
                    width: '20px',
                    height: '20px',
                    left: `${shape.x}%`,
                    top: `${shape.y}%`,
                    transition: 'all 1s ease',
                  }}
                />
              ))}
            </div>
          )}

          {/* Timer bar */}
          {gameMode !== 'focus' && selectedLevel && (
            <div className="w-full max-w-sm mb-4">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-100 ${getTimerColor()}`}
                  style={{ width: `${(timeLeft / selectedLevel.timePerTrial) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Task indicator */}
          <div className="mb-3">
            <Badge className="bg-slate-100 text-slate-500 border-none font-black px-3 py-1 rounded-lg uppercase text-[9px]">
              {currentTask === 'color' ? '🎨 Pick the INK COLOR' : '📝 Pick the WORD'}
            </Badge>
          </div>

          {/* Word display */}
          <div className={`relative mb-6 ${backgroundFlash ? 'bg-yellow-100' : ''} rounded-3xl p-8 transition-colors`}>
            {isTrialReady && (
              <h1
                className={`text-5xl sm:text-6xl font-black uppercase tracking-tight select-none ${getColorClass(currentColor)} ${feedback === 'correct' ? 'scale-110' : feedback === 'wrong' ? 'opacity-50' : ''} transition-all duration-200`}
              >
                {displayWord}
              </h1>
            )}
          </div>

          {/* Feedback indicator */}
          {feedback && (
            <div className={`mb-4 px-4 py-2 rounded-xl font-black text-sm uppercase tracking-wider ${feedback === 'correct'
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-rose-50 text-rose-600'
              }`}>
              {feedback === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
            </div>
          )}

          {/* Color buttons */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
            {selectedLevel?.colors.map((color) => (
              <button
                key={color}
                onClick={() => handleAnswer(color)}
                disabled={!!feedback}
                className={`h-12 rounded-xl border-2 transition-all active:scale-95 flex items-center justify-center gap-1.5 font-black text-[10px] uppercase tracking-tight
                  ${feedback
                    ? 'opacity-60 cursor-not-allowed border-slate-100 bg-white text-slate-400'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-sky-300 hover:shadow-md'
                  }`}
              >
                <div className={`w-3 h-3 rounded-full ${getColorBg(color)}`} />
                {getColorName(color)}
              </button>
            ))}
          </div>

          {/* Abort button */}
          <div className="mt-4">
            <Button
              variant="ghost"
              onClick={() => setGameState('menu')}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 h-8 gap-2"
            >
              <ArrowLeft className="w-3 h-3" /> Abort
            </Button>
          </div>
        </div>
      </GameWorkspace>
    );
  }

  return null;
};

export default StroopGame;