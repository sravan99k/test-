import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Play, Target, Eye, EyeOff, Timer, CheckCircle,
  Brain, Sparkles, Star, ChevronRight, RotateCcw, Zap,
  Search, Shield, Cpu, Activity, Info
} from 'lucide-react';
import { GameWorkspace } from './shared/GameWorkspace';
import { UnifiedGameResults } from './shared/UnifiedGameResults';
import { LevelPathContainer, LevelPathNodeData } from './level-path';
import LevelSelectScaffold from './LevelSelectScaffold';
import { useLevelProgress } from './useLevelProgress';

interface FocusMarathonGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface LevelConfig {
  id: number;
  name: string;
  duration: number;
  targetSpeed: number;
  distractionFreq: number;
  targetSize: number;
  xpReward: number;
  icon: React.ReactNode;
  difficulty: 'Relaxed' | 'Focused' | 'Intense' | 'Elite' | 'Zen Master';
}

const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Focus Check',
    difficulty: 'Relaxed',
    duration: 60,
    targetSpeed: 2500,
    distractionFreq: 0,
    targetSize: 60,
    xpReward: 50,
    icon: <Search className="w-5 h-5" />
  },
  {
    id: 2,
    name: 'Steady Vision',
    difficulty: 'Focused',
    duration: 90,
    targetSpeed: 2000,
    distractionFreq: 0,
    targetSize: 50,
    xpReward: 75,
    icon: <Target className="w-5 h-5" />
  },
  {
    id: 3,
    name: 'Ignore the Noise',
    difficulty: 'Intense',
    duration: 120,
    targetSpeed: 1800,
    distractionFreq: 25000,
    targetSize: 40,
    xpReward: 100,
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: 4,
    name: 'Laser Focus',
    difficulty: 'Elite',
    duration: 180,
    targetSpeed: 1500,
    distractionFreq: 15000,
    targetSize: 30,
    xpReward: 150,
    icon: <Activity className="w-5 h-5" />
  },
  {
    id: 5,
    name: 'Focus Master',
    difficulty: 'Zen Master',
    duration: 240,
    targetSpeed: 1200,
    distractionFreq: 8000,
    targetSize: 25,
    xpReward: 250,
    icon: <Cpu className="w-5 h-5" />
  }
];

import { InstructionalOverlay } from './shared/InstructionalOverlay';
import { motion, AnimatePresence } from 'framer-motion';

const DISTRACTION_MESSAGES = [
  "🔔 New notification!", "📞 Incoming call...", "💬 Message received",
  "🎵 Music playing", "🚗 Traffic noise", "👥 People talking",
  "📺 TV in background", "🌧️ Rain sounds", "⚡ Thunder rumbling"
];

const FocusMarathonGame: React.FC<FocusMarathonGameProps> = ({ onComplete, onBack }) => {
  const [gamePhase, setGamePhase] = useState<'levelSelect' | 'playing' | 'paused' | 'complete'>('levelSelect');
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(LEVELS[0]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [score, setScore] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [isTargetVisible, setIsTargetVisible] = useState(false);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [showDistraction, setShowDistraction] = useState(false);
  const [currentDistraction, setCurrentDistraction] = useState('');

  const {
    totalXP,
    completedLevels,
    bestScores,
    isLevelUnlocked,
    recordLevelCompletion,
  } = useLevelProgress('focusMarathon');

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const finishLevelRef = useRef<() => void>();

  const moveTarget = () => {
    if (!gameAreaRef.current) return;

    setIsTargetVisible(false);

    // Expert/high level behavior: occasional invisibility
    const isExpert = selectedLevel.id >= 4;
    const hideProbability = isExpert ? 0.3 : 0;

    setTimeout(() => {
      const rect = gameAreaRef.current!.getBoundingClientRect();
      const padding = 10;
      setTargetPosition({
        x: padding + Math.random() * (rect.width - selectedLevel.targetSize - padding * 2),
        y: padding + Math.random() * (rect.height - selectedLevel.targetSize - padding * 2)
      });

      if (Math.random() > hideProbability) {
        setIsTargetVisible(true);
      } else {
        // Stay hidden for 1s then show
        setTimeout(() => setIsTargetVisible(true), 1000);
      }
    }, 100);
  };

  const showRandomDistraction = () => {
    const message = DISTRACTION_MESSAGES[Math.floor(Math.random() * DISTRACTION_MESSAGES.length)];
    setCurrentDistraction(message);
    setShowDistraction(true);
    setTimeout(() => setShowDistraction(false), 2000);
  };

  const handleStartMission = (level: LevelConfig) => {
    setSelectedLevel(level);
    setShowInstructions(true);
  };

  const startLevel = () => {
    setShowInstructions(false);
    setScore(0);
    setHits(0);
    setMisses(0);
    setTimeRemaining(selectedLevel.duration);
    setGamePhase('playing');

    // Initial move
    setTimeout(moveTarget, 500);
  };

  useEffect(() => {
    if (gamePhase !== 'playing') return;

    const gameTimer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          finishLevel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const targetTimer = setInterval(() => {
      moveTarget();
    }, selectedLevel.targetSpeed);

    let distractionTimer: NodeJS.Timeout | null = null;
    if (selectedLevel.distractionFreq > 0) {
      distractionTimer = setInterval(() => {
        showRandomDistraction();
      }, selectedLevel.distractionFreq);
    }

    return () => {
      clearInterval(gameTimer);
      clearInterval(targetTimer);
      if (distractionTimer) clearInterval(distractionTimer);
    };
  }, [gamePhase, selectedLevel.targetSpeed, selectedLevel.distractionFreq, selectedLevel.duration]);

  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gamePhase !== 'playing' || !isTargetVisible) return;

    setHits(prev => prev + 1);
    setScore(prev => prev + 10);
    moveTarget();
  };

  const handleMiss = () => {
    if (gamePhase !== 'playing') return;
    setMisses(prev => prev + 1);
    setScore(prev => Math.max(0, prev - 2));
  };

  const finishLevel = () => {
    setGamePhase('complete');
  };


  if (gamePhase === 'levelSelect') {
    const levelPathData: LevelPathNodeData[] = LEVELS.map(level => ({
      id: level.id,
      name: level.name,
      xpReward: level.xpReward,
      metadata: {
        difficulty: level.difficulty,
        duration: `${level.duration}s`
      }
    }));

    return (
      <LevelSelectScaffold
        title="Focus Challenge"

        onBack={onBack}
        totalXP={totalXP}
        completedLevelsCount={completedLevels.size}
        totalLevels={LEVELS.length}
      >
        <InstructionalOverlay
          isOpen={showInstructions}
          onComplete={startLevel}
          title="Mission Goal"
          instructions={[
            "Watch the target on the screen",
            "Follow it as it moves around",
            "Click it as many times as you can",
            "Don't let the messages distract you!"
          ]}
          patternType="tap"
        />


        <div className="relative mb-24">
          <LevelPathContainer
            levels={levelPathData}
            completedLevels={completedLevels}
            bestScores={bestScores}
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
    );
  }

  if (gamePhase === 'playing' || gamePhase === 'paused') {
    return (
      <GameWorkspace
        title="Focus Marathon"
        subtitle={selectedLevel.name}
        timeLeft={timeRemaining}
        maxTime={selectedLevel.duration}
        score={score}
        icon={<Eye className="w-5 h-5 text-white" />}
      >
        <div className="flex-1 flex flex-col items-center justify-center p-4 w-full h-full max-w-4xl mx-auto">
          <div className="relative w-full h-full flex flex-col">
            <div
              ref={gameAreaRef}
              onClick={handleMiss}
              className="relative flex-1 bg-white/40 rounded-[3rem] border-8 border-white shadow-inner overflow-hidden cursor-crosshair min-h-[400px]"
            >
              {/* Paused Overlay */}
              {gamePhase === 'paused' && (
                <div className="absolute inset-0 bg-blue-50/70 backdrop-blur-md flex items-center justify-center z-30">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl">
                      <Play className="w-10 h-10 text-blue-600 fill-blue-600 ml-1 cursor-pointer" onClick={() => setGamePhase('playing')} />
                    </div>
                    <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tight">System Halted</h3>
                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-2 mb-8">Mission in sleep mode</p>
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={() => setGamePhase('playing')}
                        className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl"
                      >
                        Resume
                      </Button>
                      <Button
                        onClick={() => setGamePhase('levelSelect')}
                        variant="outline"
                        className="h-14 px-10 rounded-2xl border-4 border-white bg-white/50 text-blue-600 font-black uppercase tracking-widest hover:bg-white transition-all shadow-sm"
                      >
                        Abort
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Distraction Alert */}
              <AnimatePresence>
                {showDistraction && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-12 left-1/2 -translate-x-1/2 z-20"
                  >
                    <div className="bg-blue-600 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl border-4 border-white/20 whitespace-nowrap">
                      ⚠️ {currentDistraction}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Target */}
              <AnimatePresence>
                {isTargetVisible && gamePhase === 'playing' && (
                  <motion.div
                    key="target"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={handleTargetClick}
                    className="absolute flex items-center justify-center cursor-pointer group pointer-events-auto"
                    style={{
                      left: targetPosition.x,
                      top: targetPosition.y,
                      width: selectedLevel.targetSize * 1.5,
                      height: selectedLevel.targetSize * 1.5,
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-blue-500/10 animate-ping absolute" />
                    <div className="w-full h-full rounded-full border-4 border-blue-500 bg-white shadow-xl flex items-center justify-center transition-transform group-hover:scale-110">
                      <Target className="w-1/2 h-1/2 text-blue-600" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Background Detail */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-8 shrink-0">
              <Button
                variant="outline"
                onClick={() => setGamePhase('paused')}
                className="h-14 px-10 rounded-2xl border-4 border-white bg-white text-blue-600 font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-md flex items-center gap-2"
              >
                System Menu
              </Button>
              <Button
                onClick={() => finishLevel()}
                className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl flex items-center gap-2"
              >
                End Protocol
              </Button>
            </div>
          </div>
        </div>
      </GameWorkspace>
    );
  }

  if (gamePhase === 'complete') {
    const totalAttempts = hits + misses;
    const accuracy = totalAttempts === 0 ? 0 : Math.round((hits / totalAttempts) * 100);
    const timeBonus = Math.round((timeRemaining / selectedLevel.duration) * 20); // Minor bonus for finishing fast if possible (not really applicable to marathon but good to have)
    const finalScore = accuracy + timeBonus;

    recordLevelCompletion(selectedLevel.id, accuracy, selectedLevel.xpReward);

    return (
      <UnifiedGameResults
        score={score}
        maxScore={hits * 10 || 100}
        accuracy={accuracy}
        xpEarned={selectedLevel.xpReward}
        levelName={selectedLevel.name}
        gameId="focus-marathon"
        isPassed={accuracy >= 70}
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


export default FocusMarathonGame;