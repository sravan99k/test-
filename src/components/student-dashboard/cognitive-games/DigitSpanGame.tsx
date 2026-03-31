import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle, Brain, Target, Sparkles, ChevronRight, Info, RotateCcw, Sprout, Waves, Crown, Zap
} from 'lucide-react';
import { LevelPathContainer, LevelNodeData } from './level-path';
import LevelSelectScaffold from './LevelSelectScaffold';
import { useLevelProgress } from './useLevelProgress';
import { GameWorkspace } from './shared/GameWorkspace';
import { UnifiedGameResults } from './shared/UnifiedGameResults';
import { InstructionalOverlay } from './shared/InstructionalOverlay';

interface DigitSpanGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface LevelConfig {
  id: number;
  name: string;
  sequenceLength: number;
  questions: number;
  displayTime: number;
  passingScore: number;
  xpReward: number;
  icon: React.ReactNode;
}

const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Number Warmup',
    sequenceLength: 3,
    questions: 5,
    displayTime: 2000,
    passingScore: 70,
    xpReward: 50,
    icon: <Sprout className="w-5 h-5" />
  },
  {
    id: 2,
    name: 'Focus Core',
    sequenceLength: 4,
    questions: 6,
    displayTime: 1800,
    passingScore: 75,
    xpReward: 75,
    icon: <Target className="w-5 h-5" />
  },
  {
    id: 3,
    name: 'Memory Wave',
    sequenceLength: 5,
    questions: 6,
    displayTime: 1500,
    passingScore: 80,
    xpReward: 100,
    icon: <Waves className="w-5 h-5" />
  },
  {
    id: 4,
    name: 'Super Memory',
    sequenceLength: 6,
    questions: 7,
    displayTime: 1200,
    passingScore: 85,
    xpReward: 150,
    icon: <Zap className="w-5 h-5" />
  },
  {
    id: 5,
    name: 'Zen Master',
    sequenceLength: 7,
    questions: 8,
    displayTime: 1000,
    passingScore: 90,
    xpReward: 250,
    icon: <Crown className="w-5 h-5" />
  }
];

const DigitSpanGame: React.FC<DigitSpanGameProps> = ({ onComplete, onBack }) => {
  const [gamePhase, setGamePhase] = useState<'levelSelect' | 'playing' | 'complete'>('levelSelect');
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(LEVELS[0]);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [isInputPhase, setIsInputPhase] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);

  const {
    totalXP,
    completedLevels,
    bestScores,
    isLevelUnlocked,
    recordLevelCompletion,
  } = useLevelProgress('digitSpan');

  const sequenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const generateSequence = (length: number) => {
    return Array.from({ length }, () => Math.floor(Math.random() * 10));
  };

  const handleStartMission = (level: LevelConfig) => {
    setSelectedLevel(level);
    setShowInstructions(true);
  };

  const startLevel = () => {
    setShowInstructions(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    setGamePhase('playing');
    initRound(selectedLevel, 0);
  };

  const initRound = (level: LevelConfig, index: number) => {
    const nextSequence = generateSequence(level.sequenceLength);
    setSequence(nextSequence);
    setUserSequence('');
    setIsInputPhase(false);
    setShowFeedback(false);

    let step = 0;
    const interval = level.displayTime;

    // Initial delay
    setTimeout(() => {
      setDisplayNumber(nextSequence[0]);

      const timer = setInterval(() => {
        step++;
        if (step < nextSequence.length) {
          setDisplayNumber(nextSequence[step]);
        } else {
          clearInterval(timer);
          setDisplayNumber(null);
          setIsInputPhase(true);
        }
      }, interval);

      sequenceTimerRef.current = timer;
    }, 800);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isInputPhase || userSequence.length === 0) return;

    const isCorrect = userSequence === sequence.join('');
    if (isCorrect) setScore(prev => prev + 1);

    setLastCorrect(isCorrect);
    setShowFeedback(true);
    setIsInputPhase(false);

    setTimeout(() => {
      setShowFeedback(false);
      if (currentQuestionIndex < selectedLevel.questions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        initRound(selectedLevel, currentQuestionIndex + 1);
      } else {
        finishLevel(isCorrect ? score + 1 : score);
      }
    }, 1500);
  };

  const finishLevel = (finalScore: number) => {
    const accuracy = Math.round((finalScore / selectedLevel.questions) * 100);
    recordLevelCompletion(selectedLevel.id, accuracy, selectedLevel.xpReward);
    setGamePhase('complete');
    onComplete(accuracy);
  };

  useEffect(() => {
    return () => {
      if (sequenceTimerRef.current) clearInterval(sequenceTimerRef.current);
    };
  }, []);

  if (gamePhase === 'levelSelect') {
    const levelPathData: LevelNodeData[] = LEVELS.map(level => ({
      id: level.id,
      name: level.name,
      xpReward: level.xpReward,
      metadata: {
        length: `${level.sequenceLength} Digits`,
        tasks: `${level.questions} Rounds`
      }
    }));

    return (
      <LevelSelectScaffold
        title="Number Memory"

        onBack={onBack}
        totalXP={totalXP}
        completedLevelsCount={completedLevels.size}
        totalLevels={LEVELS.length}
      >
        <InstructionalOverlay
          isOpen={showInstructions}
          onComplete={startLevel}
          title="Mission Rules"
          instructions={[
            "Look at the numbers on the screen",
            "Remember the order carefully",
            "Type the numbers back",
            "Try to get them all right!"
          ]}
          patternType="sequence"
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
              if (full) handleStartMission(full);
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
        title="Digit Matrix"
        subtitle={selectedLevel.name}
        currentRound={currentQuestionIndex + 1}
        totalRounds={selectedLevel.questions}
        score={score}
        icon={<Brain className="w-5 h-5 text-white" />}
      >
        <div className="flex-1 flex flex-col items-center justify-center py-6 w-full h-full max-w-lg mx-auto px-6">
          <div className="relative mb-12 w-full flex justify-center min-h-[14rem]">
            <AnimatePresence mode="wait">
              {displayNumber !== null && (
                <motion.div
                  key={`num-${displayNumber}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-48 h-48 bg-white rounded-[4rem] border-8 border-blue-50 shadow-2xl flex items-center justify-center text-8xl font-black text-blue-600 z-10"
                >
                  {displayNumber}
                </motion.div>
              )}

              {isInputPhase && !showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.4em] mb-4">Input Sequence</div>
                  <form onSubmit={handleSubmit} className="w-full">
                    <input
                      autoFocus
                      type="number"
                      value={userSequence}
                      onChange={(e) => setUserSequence(e.target.value)}
                      className="w-full h-24 bg-white rounded-[2rem] border-4 border-blue-100 text-center text-5xl font-black text-blue-900 focus:border-blue-500 focus:outline-none shadow-inner mb-6"
                      placeholder="...."
                    />
                    <Button
                      type="submit"
                      disabled={userSequence.length === 0}
                      className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl disabled:opacity-50"
                    >
                      Engage Recall
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </form>
                </motion.div>
              )}

              {showFeedback && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`w-48 h-48 rounded-[4rem] border-8 border-white shadow-2xl flex flex-col items-center justify-center text-white z-10 ${lastCorrect ? 'bg-blue-600 shadow-blue-200' : 'bg-blue-100 border-blue-200 text-blue-400'}`}
                >
                  {lastCorrect ? <CheckCircle className="w-16 h-16 mb-2" /> : <RotateCcw className="w-16 h-16 mb-2" />}
                  <span className="text-[10px] font-black uppercase tracking-widest">{lastCorrect ? 'Aligned' : 'Recalibrate'}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 flex gap-2">
            {Array.from({ length: selectedLevel.sequenceLength }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${isInputPhase ? (i < userSequence.length ? 'bg-blue-500 scale-125' : 'bg-blue-100') : (displayNumber !== null ? 'bg-blue-200 animate-pulse' : 'bg-blue-50')}`}
              />
            ))}
          </div>
        </div>
      </GameWorkspace>
    );
  }

  if (gamePhase === 'complete') {
    const accuracy = Math.round((score / selectedLevel.questions) * 100);
    return (
      <UnifiedGameResults
        score={score}
        maxScore={selectedLevel.questions}
        accuracy={accuracy}
        xpEarned={selectedLevel.xpReward}
        levelName={selectedLevel.name}
        gameId="digit-span"
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

export default DigitSpanGame;
