import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Heart, Wind, Brain, Sparkles, Zap, Info, Clock, CheckCircle, RotateCcw
} from 'lucide-react';
import { LevelPathContainer, LevelPathNodeData } from './level-path';
import LevelSelectScaffold from './LevelSelectScaffold';
import { useLevelProgress } from './useLevelProgress';
import { GameWorkspace } from './shared/GameWorkspace';
import { UnifiedGameResults } from './shared/UnifiedGameResults';
import { InstructionalOverlay } from './shared/InstructionalOverlay';

interface BubbleBreathingGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface BreathingPattern {
  inhale: number;
  hold?: number;
  exhale: number;
}

interface LevelConfig {
  id: number;
  name: string;
  pattern: BreathingPattern;
  cycles: number;
  icon: React.ReactNode;
}

const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Deep Calm',
    pattern: { inhale: 4, exhale: 4 },
    cycles: 5,
    icon: <Wind className="w-5 h-5 text-blue-500" />
  },
  {
    id: 2,
    name: 'Slow & Steady',
    pattern: { inhale: 4, hold: 4, exhale: 4 },
    cycles: 6,
    icon: <Brain className="w-5 h-5 text-blue-500" />
  },
  {
    id: 3,
    name: 'The 4-7-8 Breath',
    pattern: { inhale: 4, hold: 7, exhale: 8 },
    cycles: 7,
    icon: <Sparkles className="w-5 h-5 text-blue-500" />
  },
  {
    id: 4,
    name: 'Box Breathing',
    pattern: { inhale: 5, hold: 5, exhale: 5 },
    cycles: 8,
    icon: <Zap className="w-5 h-5 text-blue-500" />
  },
  {
    id: 5,
    name: 'Zen Master',
    pattern: { inhale: 6, hold: 6, exhale: 6 },
    cycles: 10,
    icon: <Heart className="w-5 h-5 text-blue-500" />
  }
];

const BubbleBreathingGame: React.FC<BubbleBreathingGameProps> = ({ onComplete, onBack }) => {
  const [gamePhase, setGamePhase] = useState<'levelSelect' | 'playing' | 'complete'>('levelSelect');
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(LEVELS[0]);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);

  const {
    totalXP,
    completedLevels,
    bestScores,
    isLevelUnlocked,
    recordLevelCompletion,
  } = useLevelProgress('bubbleBreathing');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startLevelSelect = (level: LevelConfig) => {
    setSelectedLevel(level);
    setShowInstructions(true);
  };

  const handleStartMission = () => {
    setShowInstructions(false);
    setGamePhase('playing');
    setCurrentCycle(1);
    setTotalElapsedTime(0);
    startBreathingCycle('inhale');
  };

  const startBreathingCycle = (startPhase: 'inhale' | 'hold' | 'exhale') => {
    setBreathingPhase(startPhase);
    setPhaseProgress(0);

    const duration = selectedLevel.pattern[startPhase] || 0;
    if (duration === 0) {
      handleNextPhase(startPhase);
      return;
    }

    let elapsedMs = 0;
    const intervalMs = 50;
    const totalMs = duration * 1000;

    timerRef.current = setInterval(() => {
      elapsedMs += intervalMs;
      setTotalElapsedTime(prev => prev + intervalMs / 1000);
      setPhaseProgress(Math.min((elapsedMs / totalMs) * 100, 100));

      if (elapsedMs >= totalMs) {
        clearInterval(timerRef.current!);
        handleNextPhase(startPhase);
      }
    }, intervalMs);
  };

  const handleNextPhase = (current: 'inhale' | 'hold' | 'exhale') => {
    if (current === 'inhale') {
      if (selectedLevel.pattern.hold) {
        startBreathingCycle('hold');
      } else {
        startBreathingCycle('exhale');
      }
    } else if (current === 'hold') {
      startBreathingCycle('exhale');
    } else {
      // Exhale finished
      if (currentCycle < selectedLevel.cycles) {
        setCurrentCycle(prev => prev + 1);
        startBreathingCycle('inhale');
      } else {
        finishLevel();
      }
    }
  };

  const finishLevel = () => {
    const accuracy = 100; // Completion based game
    recordLevelCompletion(selectedLevel.id, accuracy, 50);
    setGamePhase('complete');
    onComplete(accuracy);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (gamePhase === 'levelSelect') {
    const levelPathData: LevelPathNodeData[] = LEVELS.map(level => ({
      id: level.id,
      name: level.name,
      xpReward: 50,
      metadata: {
        pattern: `${level.pattern.inhale}-${level.pattern.hold || 0}-${level.pattern.exhale}`,
        duration: `${level.cycles} Cycles`
      }
    }));

    return (
      <LevelSelectScaffold
        title="Calm Breather"
        onBack={onBack}
        totalXP={totalXP}
        completedLevelsCount={completedLevels.size}
        totalLevels={LEVELS.length}
      >
        <InstructionalOverlay
          isOpen={showInstructions}
          onComplete={handleStartMission}
          title="How to Relax"
          instructions={[
            "Watch the bubble grow and shrink",
            "Breathe in as it gets bigger",
            "Breathe out as it gets smaller",
            "Try to relax and feel calm"
          ]}
          patternType="breathe"
        />



        <div className="relative mb-24">
          <LevelPathContainer
            levels={levelPathData}
            completedLevels={completedLevels}
            bestScores={bestScores}
            selectedLevelId={selectedLevel.id}
            onSelectLevel={(l) => {
              const full = LEVELS.find(lv => lv.id === l.id);
              if (full) setSelectedLevel(full);
            }}
            onStartLevel={(l) => {
              const full = LEVELS.find(lv => lv.id === l.id);
              if (full) startLevelSelect(full);
            }}
            isLevelUnlocked={isLevelUnlocked}
            nodeHeight={180}
          />
        </div>
      </LevelSelectScaffold>
    );
  }

  if (gamePhase === 'playing') {
    return (
      <GameWorkspace
        title="Calm Breather"
        subtitle={selectedLevel.name}
        currentRound={currentCycle}
        totalRounds={selectedLevel.cycles}
        score={currentCycle}
        icon={<Heart className="w-5 h-5 text-white" />}
      >
        <div className="flex-1 flex flex-col items-center justify-center py-6 w-full h-full max-w-lg mx-auto">
          <div className="relative mb-12 w-full flex flex-col items-center justify-center h-80">
            <AnimatePresence mode="wait">
              <motion.div
                key={breathingPhase}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                {/* Visual Breath Core */}
                <motion.div
                  animate={{
                    scale: breathingPhase === 'inhale' ? 1.4 : breathingPhase === 'hold' ? 1.4 : 1,
                    backgroundColor: breathingPhase === 'inhale' ? '#2563eb' : breathingPhase === 'hold' ? '#1e40af' : '#60a5fa'
                  }}
                  transition={{
                    duration: (selectedLevel.pattern[breathingPhase] || 1),
                    ease: "easeInOut"
                  }}
                  className="w-48 h-48 rounded-[4rem] border-8 border-white/30 shadow-2xl flex flex-col items-center justify-center z-10 p-4 text-center"
                >
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-2">{breathingPhase}</p>
                  <span className="text-3xl font-black text-white uppercase tracking-tighter tabular-nums">
                    {Math.ceil(((selectedLevel.pattern[breathingPhase] || 0) * (100 - phaseProgress)) / 100)}s
                  </span>
                </motion.div>

                {/* Atmospheric Rings */}
                <motion.div
                  animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                  className="absolute w-48 h-48 rounded-full border-4 border-blue-400/20"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="w-full max-w-xs mb-12">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">{breathingPhase} Status</span>
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{Math.round(phaseProgress)}%</span>
            </div>
            <Progress value={phaseProgress} className="h-3 bg-blue-50 border-none shadow-inner" />
          </div>

          <div className="flex items-center gap-4 bg-blue-50/50 px-8 py-4 rounded-2xl border-2 border-white shadow-sm">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Session Time</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-blue-600" />
                <span className="text-lg font-black text-blue-900 tabular-nums">
                  {Math.floor(totalElapsedTime / 60)}:{String(Math.floor(totalElapsedTime % 60)).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </GameWorkspace>
    );
  }

  if (gamePhase === 'complete') {
    return (
      <UnifiedGameResults
        score={selectedLevel.cycles}
        maxScore={selectedLevel.cycles}
        accuracy={100}
        xpEarned={50}
        levelName={selectedLevel.name}
        gameId="breathing"
        isPassed={true}
        onPlayAgain={() => {
          setGamePhase('levelSelect');
          setShowInstructions(false);
        }}
        onExit={onBack}
      />
    );
  }

  return null;
};

export default BubbleBreathingGame;
