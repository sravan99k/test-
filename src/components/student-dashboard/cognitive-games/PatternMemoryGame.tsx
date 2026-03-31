import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Zap, Target, CheckCircle, Brain, Sparkles, LayoutGrid, Info, Activity,
  ChevronRight, Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLevelProgress } from './useLevelProgress';
import { GameWorkspace } from './shared/GameWorkspace';
import { UnifiedGameResults } from './shared/UnifiedGameResults';
import { LevelPathContainer, LevelPathNodeData } from './level-path';
import LevelSelectScaffold from './LevelSelectScaffold';
import { InstructionalOverlay } from './shared/InstructionalOverlay';

interface PatternMemoryGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

type ShapeType = 'circle' | 'square' | 'triangle' | 'star' | 'hexagon';

interface LevelConfig {
  id: number;
  name: string;
  gridSize: number;
  shapes: ShapeType[];
  patternLength: number;
  rounds?: number;
  displayTime: number;
  passingScore: number;
  xpReward: number;
  icon: React.ReactNode;
}

const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Pattern Rookie',
    gridSize: 3,
    shapes: ['circle', 'square'],
    patternLength: 3,
    rounds: 3,
    displayTime: 2000,
    passingScore: 70,
    xpReward: 50,
    icon: <Activity className="w-5 h-5" />
  },
  {
    id: 2,
    name: 'Focus Builder',
    gridSize: 3,
    shapes: ['circle', 'square', 'triangle'],
    patternLength: 4,
    rounds: 3,
    displayTime: 1800,
    passingScore: 75,
    xpReward: 75,
    icon: <Target className="w-5 h-5" />
  },
  {
    id: 3,
    name: 'Pattern Pro',
    gridSize: 4,
    shapes: ['circle', 'square', 'triangle', 'star'],
    patternLength: 5,
    rounds: 3,
    displayTime: 1600,
    passingScore: 80,
    xpReward: 100,
    icon: <Zap className="w-5 h-5" />
  },
  {
    id: 4,
    name: 'Grid Master',
    gridSize: 4,
    shapes: ['circle', 'square', 'triangle', 'star', 'hexagon'],
    patternLength: 6,
    rounds: 3,
    displayTime: 1400,
    passingScore: 85,
    xpReward: 150,
    icon: <Brain className="w-5 h-5" />
  },
  {
    id: 5,
    name: 'Visual Master',
    gridSize: 5,
    shapes: ['circle', 'square', 'triangle', 'star', 'hexagon'],
    patternLength: 7,
    rounds: 4,
    displayTime: 1200,
    passingScore: 90,
    xpReward: 250,
    icon: <Sparkles className="w-5 h-5" />
  }
];

const MOTIVATIONAL_QUOTES = [
  "Your pattern recall is improving!",
  "Great focus! You're getting sharper!",
  "Keep going — your visual memory is growing!",
  "Perfect recall! You're a natural!",
  "Your eyes are getting stronger!",
  "Amazing memory power!",
  "Focus is a superpower — you're building it!"
];

// Aesthetic Shape Components in Blue Theme
const ShapeCircle: React.FC<{ isHighlighted: boolean; isCorrect?: boolean; isWrong?: boolean }> = ({ isHighlighted, isCorrect, isWrong }) => (
  <div className={`w-full h-full rounded-full transition-all duration-300 flex items-center justify-center
    ${isHighlighted ? 'bg-blue-600 scale-110 shadow-lg' : 'bg-blue-100'}
    ${isCorrect ? 'bg-blue-600 !scale-110 shadow-xl' : isWrong ? 'bg-blue-200' : ''}`}>
    <div className={`w-1/2 h-1/2 rounded-full border-2 ${isHighlighted || isCorrect ? 'border-white/50' : 'border-blue-300/30'}`} />
  </div>
);

const ShapeSquare: React.FC<{ isHighlighted: boolean; isCorrect?: boolean; isWrong?: boolean }> = ({ isHighlighted, isCorrect, isWrong }) => (
  <div className={`w-full h-full rounded-[1.2rem] transition-all duration-300 flex items-center justify-center
    ${isHighlighted ? 'bg-blue-600 scale-110 shadow-lg' : 'bg-blue-100'}
    ${isCorrect ? 'bg-blue-600 !scale-110 shadow-xl' : isWrong ? 'bg-blue-200' : ''}`}>
    <div className={`w-1/2 h-1/2 rounded-md border-2 ${isHighlighted || isCorrect ? 'border-white/50' : 'border-blue-300/30'}`} />
  </div>
);

const ShapeTriangle: React.FC<{ isHighlighted: boolean; isCorrect?: boolean; isWrong?: boolean }> = ({ isHighlighted, isCorrect, isWrong }) => (
  <div className={`w-full h-full transition-all duration-300 flex items-center justify-center
    ${isHighlighted || isCorrect ? 'scale-110' : 'scale-100'}`}
    style={{
      clipPath: 'polygon(50% 15%, 15% 85%, 85% 85%)',
      backgroundColor: isHighlighted || isCorrect ? '#2563eb' : isWrong ? '#bfdbfe' : '#dbeafe'
    }} />
);

const ShapeStar: React.FC<{ isHighlighted: boolean; isCorrect?: boolean; isWrong?: boolean }> = ({ isHighlighted, isCorrect, isWrong }) => (
  <div className={`w-full h-full transition-all duration-300
    ${isHighlighted || isCorrect ? 'scale-110' : 'scale-100'}`}
    style={{
      clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
      backgroundColor: isHighlighted || isCorrect ? '#2563eb' : isWrong ? '#bfdbfe' : '#dbeafe'
    }} />
);

const ShapeHexagon: React.FC<{ isHighlighted: boolean; isCorrect?: boolean; isWrong?: boolean }> = ({ isHighlighted, isCorrect, isWrong }) => (
  <div className={`w-full h-full transition-all duration-300
    ${isHighlighted || isCorrect ? 'scale-110' : 'scale-100'}`}
    style={{
      clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
      backgroundColor: isHighlighted || isCorrect ? '#2563eb' : isWrong ? '#bfdbfe' : '#dbeafe'
    }} />
);

const PatternMemoryGame: React.FC<PatternMemoryGameProps> = ({ onComplete, onBack }) => {
  const [gameState, setGameState] = useState<'levelSelect' | 'countdown' | 'display' | 'recall' | 'feedback' | 'complete'>('levelSelect');
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(LEVELS[0]);
  const [grid, setGrid] = useState<ShapeType[]>([]);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [correctIndices, setCorrectIndices] = useState<number[]>([]);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [lastRoundPerfect, setLastRoundPerfect] = useState<boolean | null>(null);

  const {
    totalXP,
    completedLevels,
    bestScores,
    isLevelUnlocked,
    recordLevelCompletion,
  } = useLevelProgress('patternMemory');

  const timeoutsRef = useRef<number[]>([]);
  // Use a ref for score to ensure consistency across rounds
  const actualScoreRef = useRef(0);
  const totalTargetsRef = useRef(0);

  const generateGrid = (size: number, shapes: ShapeType[]) => {
    const totalCells = size * size;
    return Array.from({ length: totalCells }, () =>
      shapes[Math.floor(Math.random() * shapes.length)]
    );
  };

  const generatePattern = (gridSize: number, length: number) => {
    const totalCells = gridSize * gridSize;
    const p: number[] = [];
    while (p.length < length) {
      const idx = Math.floor(Math.random() * totalCells);
      if (!p.includes(idx)) p.push(idx);
    }
    return p;
  };

  const handleStartMission = (level: LevelConfig) => {
    setSelectedLevel(level);
    setShowInstructions(true);
  };

  const initiateCountdown = () => {
    setShowInstructions(false);
    setScore(0);
    actualScoreRef.current = 0;
    totalTargetsRef.current = 0;
    setCurrentRound(1);
    setCountdown(3);
    setGameState('countdown');
  };

  // Countdown logic
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      startRound();
    }
  }, [gameState, countdown]);

  const startRound = () => {
    const newGrid = generateGrid(selectedLevel.gridSize, selectedLevel.shapes);
    const newPattern = generatePattern(selectedLevel.gridSize, selectedLevel.patternLength + (currentRound - 1));

    setGrid(newGrid);
    setPattern(newPattern);
    setUserPattern([]);
    setCorrectIndices([]);
    setWrongIndex(null);
    setHighlightedIndex(null);
    totalTargetsRef.current += newPattern.length;
    setGameState('display');

    // Pattern display sequence
    const sequenceGap = 600;
    const duration = 400;

    newPattern.forEach((cellIdx, step) => {
      const tOn = window.setTimeout(() => {
        setHighlightedIndex(cellIdx);
      }, step * (sequenceGap + duration) + 800);

      const tOff = window.setTimeout(() => {
        setHighlightedIndex(null);
      }, step * (sequenceGap + duration) + 800 + duration);

      timeoutsRef.current.push(tOn, tOff);
    });

    const tEnd = window.setTimeout(() => {
      setGameState('recall');
    }, newPattern.length * (sequenceGap + duration) + 1200);
    timeoutsRef.current.push(tEnd);
  };

  const handleCellClick = (index: number) => {
    if (gameState !== 'recall' || userPattern.includes(index)) return;

    const nextStep = userPattern.length;
    if (pattern[nextStep] === index) {
      // Correct
      const newUserPattern = [...userPattern, index];
      setUserPattern(newUserPattern);
      setCorrectIndices(prev => [...prev, index]);
      setScore(prev => prev + 1);
      actualScoreRef.current += 1;

      if (newUserPattern.length === pattern.length) {
        finishRound(true);
      }
    } else {
      // Wrong
      setWrongIndex(index);
      finishRound(false);
    }
  };

  const finishRound = (perfect: boolean) => {
    setLastRoundPerfect(perfect);
    setGameState('feedback');

    const roundsTotal = selectedLevel.rounds ?? 3;
    const isLast = currentRound >= roundsTotal;

    setTimeout(() => {
      if (isLast) {
        finishLevel();
      } else {
        setCurrentRound(prev => prev + 1);
        startRound();
      }
    }, 1500);
  };

  const finishLevel = () => {
    const totalTargets = totalTargetsRef.current;
    const accuracy = Math.round((actualScoreRef.current / totalTargets) * 100);
    recordLevelCompletion(selectedLevel.id, accuracy, selectedLevel.xpReward);
    setGameState('complete');
    onComplete(accuracy);
  };

  const renderShape = (type: ShapeType, idx: number) => {
    const props = {
      isHighlighted: highlightedIndex === idx,
      isCorrect: correctIndices.includes(idx),
      isWrong: wrongIndex === idx
    };
    switch (type) {
      case 'circle': return <ShapeCircle {...props} />;
      case 'square': return <ShapeSquare {...props} />;
      case 'triangle': return <ShapeTriangle {...props} />;
      case 'star': return <ShapeStar {...props} />;
      case 'hexagon': return <ShapeHexagon {...props} />;
      default: return null;
    }
  };

  if (gameState === 'levelSelect') {
    const levelPathData: LevelPathNodeData[] = LEVELS.map(l => ({
      id: l.id,
      name: l.name,
      xpReward: l.xpReward,
      metadata: {
        grid: `${l.gridSize}x${l.gridSize}`,
        pattern: `${l.patternLength} Nodes`
      }
    }));

    return (
      <LevelSelectScaffold
        title="Pattern Match"

        onBack={onBack}
        totalXP={totalXP}
        completedLevelsCount={completedLevels.size}
        totalLevels={LEVELS.length}
      >
        <InstructionalOverlay
          isOpen={showInstructions}
          onComplete={initiateCountdown}
          title="How to Play"
          instructions={[
            "Look at the game grid",
            "Remember the highlighted pattern",
            "Click the boxes in the same order",
            "Complete all rounds to win"
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

  if (gameState === 'countdown') {
    return (
      <GameWorkspace
        title="Pattern Matrix"
        subtitle="Prepare Focus"
        level={selectedLevel.id}
        currentRound={currentRound}
        totalRounds={selectedLevel.rounds || 3}
        icon={selectedLevel.icon}
        showProgress={false}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-blue-400/20 blur-[80px] rounded-full scale-150 animate-pulse" />
            <div className="relative text-9xl font-black text-blue-900 drop-shadow-2xl animate-in zoom-in duration-500">
              {countdown > 0 ? countdown : <Sparkles className="w-32 h-32 text-blue-500" />}
            </div>
          </div>
          <div className="text-center">
            <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.4em] mb-2">Pattern Matching</p>
            <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight">Prepare your focus...</h2>
          </div>
        </div>
      </GameWorkspace>
    );
  }

  if (gameState === 'display' || gameState === 'recall') {
    const gridCols = selectedLevel.gridSize === 3 ? 'grid-cols-3' : selectedLevel.gridSize === 4 ? 'grid-cols-4' : 'grid-cols-5';
    return (
      <GameWorkspace
        title="Pattern Matrix"
        subtitle={selectedLevel.name}
        currentRound={currentRound}
        totalRounds={selectedLevel.rounds ?? 3}
        score={score}
        icon={<LayoutGrid className="w-5 h-5 text-white" />}
      >
        <div className="flex-1 flex flex-col items-center justify-center py-6 w-full h-full max-w-sm mx-auto px-6">
          <div className="mb-8 w-full">
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Sequence Input</span>
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest font-sans">{userPattern.length} / {pattern.length}</span>
            </div>
            <Progress value={(userPattern.length / pattern.length) * 100} className="h-2 bg-blue-50" />
          </div>

          <div className="p-8 bg-blue-50/50 rounded-[3rem] border-4 border-white shadow-inner relative w-full aspect-square flex flex-col items-center justify-center">
            <div className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em] mb-6 absolute top-4">
              {gameState === 'display' ? 'Observe sequence' : 'Recall sequence'}
            </div>
            <div className={`grid ${gridCols} gap-4 h-full w-full`}>
              {grid.map((type, i) => (
                <button
                  key={i}
                  disabled={gameState === 'display'}
                  onClick={() => handleCellClick(i)}
                  className={`
                    relative rounded-2xl bg-white shadow-sm border-2 transition-all duration-300
                    ${gameState === 'display' ? 'cursor-default' : 'cursor-pointer hover:scale-105 active:scale-95'}
                    ${correctIndices.includes(i) ? 'border-blue-500 bg-blue-50' :
                      wrongIndex === i ? 'border-red-400 bg-red-50' : 'border-white'}
                  `}
                  style={{ aspectRatio: '1/1' }}
                >
                  <div className="absolute inset-0 p-3">
                    {renderShape(type, i)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {gameState === 'display' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] animate-pulse"
            >
              Observing Sequence...
            </motion.p>
          )}
        </div>
      </GameWorkspace>
    );
  }

  if (gameState === 'feedback') {
    const isSuccess = lastRoundPerfect === true;
    const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

    return (
      <GameWorkspace
        title="Pattern Matrix"
        subtitle="Analyzing Performance"
        level={selectedLevel.id}
        currentRound={currentRound}
        totalRounds={selectedLevel.rounds ?? 3}
        showProgress={false}
        icon={isSuccess ? <CheckCircle className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
      >
        <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto p-6">
          <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10 shadow-xl ${isSuccess ? 'bg-blue-600 text-white shadow-blue-100' : 'bg-blue-400 text-white shadow-blue-50'} animate-in zoom-in duration-500`}>
            <Zap className="w-12 h-12" />
          </div>

          <h2 className="text-3xl font-black tracking-tight mb-4 uppercase text-blue-900 text-center">
            {isSuccess ? 'Perfect Recall' : 'Round Complete'}
          </h2>

          <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] italic mb-10 text-center">
            {isSuccess ? 'Pattern Matched!' : 'Pattern Saved'}
          </p>

          <div className="w-full py-6 px-10 bg-blue-50 rounded-[2rem] border-2 border-white mb-10 text-center">
            <p className="text-blue-900 text-sm font-bold leading-relaxed">"{quote}"</p>
          </div>

          <div className="flex items-center gap-3 py-2 px-6 bg-blue-50/50 rounded-full border border-blue-100 animate-pulse">
            <div className="w-2 h-2 bg-blue-600 rounded-full" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">
              Getting Ready...
            </span>
          </div>
        </div>
      </GameWorkspace>
    );
  }

  if (gameState === 'complete') {
    const totalTargets = totalTargetsRef.current;
    const accuracy = Math.round((actualScoreRef.current / totalTargets) * 100);
    return (
      <UnifiedGameResults
        score={actualScoreRef.current}
        maxScore={totalTargets}
        accuracy={accuracy}
        xpEarned={selectedLevel.xpReward}
        levelName={selectedLevel.name}
        gameId="pattern-memory"
        isPassed={accuracy >= selectedLevel.passingScore}
        onPlayAgain={() => {
          setGameState('levelSelect');
          setShowInstructions(false);
        }}
        onExit={onBack}
      />
    );
  }

  return null;
};

export default PatternMemoryGame;
