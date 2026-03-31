import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Play, Lightbulb, CheckCircle, XCircle, Zap, BookOpen,
  Timer, Star, Award, RotateCcw, ChevronRight, Brain, Target, Sparkles,
  Info, Shield, Cpu
} from 'lucide-react';
import { GameWorkspace } from './shared/GameWorkspace';
import { UnifiedGameResults } from './shared/UnifiedGameResults';
import { LevelPathContainer, LevelPathNodeData } from './level-path';
import LevelSelectScaffold from './LevelSelectScaffold';
import { useLevelProgress } from './useLevelProgress';

interface LogicPuzzleGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Puzzle {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface LevelConfig {
  id: number;
  name: string;
  puzzles: Puzzle[];
  xpReward: number;
  icon: React.ReactNode;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced' | 'Master';
}

const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Easy Riddles',
    difficulty: 'Basic',
    xpReward: 50,
    icon: <Brain className="w-5 h-5" />,
    puzzles: [
      {
        question: "If all cats are animals, and Fluffy is a cat, what can we conclude?",
        options: ["Fluffy is an animal", "All animals are cats", "Fluffy is not an animal", "We can't conclude anything"],
        correct: 0,
        explanation: "Since all cats are animals and Fluffy is a cat, Fluffy must be an animal."
      },
      {
        question: "Tom is taller than Jerry. Jerry is taller than Spike. Who is the shortest?",
        options: ["Tom", "Jerry", "Spike", "They are all the same height"],
        correct: 2,
        explanation: "If Tom > Jerry > Spike, then Spike is the shortest."
      }
    ]
  },
  {
    id: 2,
    name: 'Tricky Thoughts',
    difficulty: 'Intermediate',
    xpReward: 75,
    icon: <Zap className="w-5 h-5" />,
    puzzles: [
      {
        question: "If it's raining, then the ground is wet. The ground is wet. What can we conclude?",
        options: ["It is raining", "It is not raining", "It might be raining", "The ground is dry"],
        correct: 2,
        explanation: "The ground could be wet for other reasons (sprinkler, etc.), so we can't be certain it's raining."
      },
      {
        question: "A bat and ball cost $1.10 total. The bat costs $1 more than the ball. How much does the ball cost?",
        options: ["10 cents", "5 cents", "15 cents", "1 cent"],
        correct: 1,
        explanation: "If ball = x, then bat = x + $1. So x + (x + $1) = $1.10, meaning 2x = $0.10, so x = $0.05."
      }
    ]
  },
  {
    id: 3,
    name: 'Brain Teasers',
    difficulty: 'Intermediate',
    xpReward: 100,
    icon: <Target className="w-5 h-5" />,
    puzzles: [
      {
        question: "In a class of 30 students, 18 like pizza, 12 like burgers, and 8 like both. How many like neither?",
        options: ["8", "10", "12", "6"],
        correct: 0,
        explanation: "Pizza only: 10, Burger only: 4, Both: 8. Total who like either: 22. Neither: 30-22 = 8."
      },
      {
        question: "Three brothers: Adam is older than Ben. Ben is younger than Charlie. Charlie is older than Adam. Who is the oldest?",
        options: ["Adam", "Ben", "Charlie", "Not enough info"],
        correct: 2,
        explanation: "Charlie > Adam > Ben. So Charlie is the oldest."
      }
    ]
  },
  {
    id: 4,
    name: 'Complex Relations',
    difficulty: 'Advanced',
    xpReward: 150,
    icon: <Shield className="w-5 h-5" />,
    puzzles: [
      {
        question: "Four people need to cross a bridge at night with one flashlight. It takes them 1, 2, 5, and 10 minutes respectively. Only two can cross at once. What's the minimum time?",
        options: ["17 minutes", "19 minutes", "15 minutes", "21 minutes"],
        correct: 0,
        explanation: "1&2 go (2min), 1 returns (1min), 5&10 go (10min), 2 returns (2min), 1&2 go (2min). Total: 17min."
      },
      {
        question: "Five friends sit in a row. Alice is not next to Bob. Charlie is between Alice and Dave. Bob is at one end. Where is Eve?",
        options: ["Next to Alice", "Next to Charlie", "At the other end", "Between Dave and Bob"],
        correct: 2,
        explanation: "If Bob is at one end and Alice can't be next to him, the arrangement works with Eve at the other end."
      }
    ]
  },
  {
    id: 5,
    name: 'Master Riddles',
    difficulty: 'Master',
    xpReward: 200,
    icon: <Cpu className="w-5 h-5" />,
    puzzles: [
      {
        question: "You have 12 balls, one weighs different. Using a balance scale only 3 times, how do you find the odd ball?",
        options: ["Impossible", "Compare 4 vs 4, then narrow down", "Compare 6 vs 6", "Weigh individually"],
        correct: 1,
        explanation: "Divide into groups of 4. First weighing narrows it to 4 balls, second to 1 or 2, third confirms."
      },
      {
        question: "A prisoner sees the hats of two others but not his own. 3 white, 2 black total. If he can't determine his color, others must wear:",
        options: ["Both white", "Both black", "One white, one black", "Not enough info"],
        correct: 0,
        explanation: "If either wore black, he'd know his was white. Since he can't tell, both wear white."
      }
    ]
  }
];

import { InstructionalOverlay } from './shared/InstructionalOverlay';
import { motion } from 'framer-motion';

const LogicPuzzleGame: React.FC<LogicPuzzleGameProps> = ({ onComplete, onBack }) => {
  const [gamePhase, setGamePhase] = useState<'levelSelect' | 'playing' | 'complete'>('levelSelect');
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(LEVELS[0]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const {
    totalXP,
    completedLevels,
    bestScores,
    isLevelUnlocked,
    recordLevelCompletion,
  } = useLevelProgress('logicPuzzle');

  const handleStartMission = (level: LevelConfig) => {
    setSelectedLevel(level);
    setShowInstructions(true);
  };

  const startLevel = () => {
    setShowInstructions(false);
    setCurrentPuzzleIndex(0);
    setScore(0);
    setGamePhase('playing');
    setSelectedOption(null);
  };

  const handleAnswerSelect = (index: number) => {
    if (showFeedback) return;

    setSelectedOption(index);
    const isCorrect = index === selectedLevel.puzzles[currentPuzzleIndex].correct;
    if (isCorrect) setScore(prev => prev + 1);

    setLastAnswerCorrect(isCorrect);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedOption(null);
      if (currentPuzzleIndex < selectedLevel.puzzles.length - 1) {
        setCurrentPuzzleIndex(prev => prev + 1);
      } else {
        const finalScore = isCorrect ? score + 1 : score;
        const accuracy = Math.round((finalScore / selectedLevel.puzzles.length) * 100);
        recordLevelCompletion(selectedLevel.id, accuracy, selectedLevel.xpReward);
        setGamePhase('complete');
        onComplete(accuracy);
      }
    }, 2000);
  };

  if (gamePhase === 'levelSelect') {
    const levelPathData: LevelPathNodeData[] = LEVELS.map(level => ({
      id: level.id,
      name: level.name,
      xpReward: level.xpReward,
      metadata: {
        difficulty: level.difficulty,
        puzzles: level.puzzles.length
      }
    }));

    return (
      <>
        <LevelSelectScaffold
          title="Logic Puzzles"

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
              "Read the clue carefully",
              "Choose the best answer",
              "Watch out for trick answers",
              "Take your time and think!"
            ]}
            patternType="recall"
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
      </>
    );
  }

  if (gamePhase === 'playing') {
    const puzzle = selectedLevel.puzzles[currentPuzzleIndex];
    return (
      <GameWorkspace
        title="Logic Puzzles"
        subtitle={selectedLevel.name}
        currentRound={currentPuzzleIndex + 1}
        totalRounds={selectedLevel.puzzles.length}
        score={score}
        icon={<Brain className="w-5 h-5 text-white" />}
      >
        <div className="flex-1 flex flex-col items-center justify-center py-6 w-full h-full max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={currentPuzzleIndex}
            className="w-full bg-white rounded-[3rem] border-8 border-blue-50 p-10 shadow-2xl relative overflow-hidden mb-8"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600/10" />
            <div className="flex items-center gap-3 mb-6 text-blue-400">
              <Cpu className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Query Analysis</span>
            </div>
            <h3 className="text-2xl font-black text-blue-900 leading-tight mb-8">
              {puzzle.question}
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {puzzle.options.map((option, index) => (
                <Button
                  key={index}
                  disabled={showFeedback}
                  onClick={() => handleAnswerSelect(index)}
                  className={`
                    h-auto min-h-[4rem] p-5 rounded-2xl border-4 text-left justify-start transition-all duration-300
                    ${selectedOption === index
                      ? index === puzzle.correct
                        ? 'bg-blue-600 border-blue-700 text-white shadow-xl'
                        : 'bg-red-50 border-red-200 text-red-900'
                      : showFeedback && index === puzzle.correct
                        ? 'bg-blue-50 border-blue-200 text-blue-900 opacity-80'
                        : 'bg-white border-blue-50 text-blue-900 hover:border-blue-400 hover:bg-blue-50/50'
                    }
                  `}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 text-xs font-black shadow-inner
                    ${selectedOption === index ? 'bg-white/20' : 'bg-blue-50'}`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-sm font-black uppercase tracking-tight flex-1">{option}</span>
                </Button>
              ))}
            </div>

            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-blue-50 rounded-[2rem] border-4 border-white shadow-inner"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                    ${lastAnswerCorrect ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-400'}`}>
                    {lastAnswerCorrect ? <CheckCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Deduction Intel</p>
                    <p className="text-sm text-blue-900 font-bold leading-relaxed">{puzzle.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </GameWorkspace>
    );
  }

  if (gamePhase === 'complete') {
    const accuracy = Math.round((score / selectedLevel.puzzles.length) * 100);
    return (
      <UnifiedGameResults
        score={score}
        maxScore={selectedLevel.puzzles.length}
        accuracy={accuracy}
        xpEarned={selectedLevel.xpReward}
        levelName={selectedLevel.name}
        gameId="logic-puzzle"
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

export default LogicPuzzleGame;