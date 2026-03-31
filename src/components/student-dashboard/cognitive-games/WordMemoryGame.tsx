import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen, Brain, Sparkles, Zap, Info, Clock, CheckCircle, RotateCcw,
  ChevronRight, Lock, Trophy, LayoutGrid, Search, Eye, ScrollText
} from 'lucide-react';
import { LevelPathContainer, LevelPathNodeData } from './level-path';
import LevelSelectScaffold from './LevelSelectScaffold';
import { useLevelProgress } from './useLevelProgress';
import { GameWorkspace } from './shared/GameWorkspace';
import { UnifiedGameResults } from './shared/UnifiedGameResults';
import { InstructionalOverlay } from './shared/InstructionalOverlay';

interface WordMemoryGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface WordLevelConfig {
  id: number;
  name: string;
  words: string[];
  displayTime: number;
  xpReward: number;
  icon: React.ReactNode;
}

const LEVELS: WordLevelConfig[] = [
  {
    id: 1,
    name: 'Nature Walk',
    words: ['Cloud', 'Ocean', 'Forest', 'Mountain'],
    displayTime: 2500,
    xpReward: 50,
    icon: <Sparkles className="w-5 h-5 text-blue-500" />
  },
  {
    id: 2,
    name: 'Space Trip',
    words: ['Moon', 'Star', 'Planet', 'Rocket', 'Sun'],
    displayTime: 2200,
    xpReward: 75,
    icon: <Brain className="w-5 h-5 text-blue-500" />
  },
  {
    id: 3,
    name: 'Tech Time',
    words: ['Robot', 'Laptop', 'Screen', 'Mouse', 'Keyboard', 'Wire'],
    displayTime: 2000,
    xpReward: 100,
    icon: <Zap className="w-5 h-5 text-blue-500" />
  },
  {
    id: 4,
    name: 'Super Speed',
    words: ['Fast', 'Run', 'Jump', 'Sprint', 'Race', 'Dash', 'Zoom'],
    displayTime: 1800,
    xpReward: 150,
    icon: <Zap className="w-5 h-5 text-blue-500" />
  },
  {
    id: 5,
    name: 'Word Wizard',
    words: ['Magic', 'Wand', 'Spell', 'Castle', 'Dragon', 'King', 'Queen', 'Knight'],
    displayTime: 1500,
    xpReward: 250,
    icon: <Trophy className="w-5 h-5 text-blue-500" />
  }
];

const WordMemoryGame: React.FC<WordMemoryGameProps> = ({ onComplete, onBack }) => {
  const [gamePhase, setGamePhase] = useState<'levelSelect' | 'preview' | 'playing' | 'complete'>('levelSelect');
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<WordLevelConfig>(LEVELS[0]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userWords, setUserWords] = useState<string>('');
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [testWords, setTestWords] = useState<{ word: string; isCorrect: boolean }[]>([]);

  const {
    totalXP,
    completedLevels,
    bestScores,
    isLevelUnlocked,
    recordLevelCompletion,
  } = useLevelProgress('wordMemory');

  const startLevelSelect = (level: WordLevelConfig) => {
    setSelectedLevel(level);
    setShowInstructions(true);
  };

  const handleStartMission = () => {
    setShowInstructions(false);
    setGamePhase('preview');
    setCurrentWordIndex(0);
  };

  const startPlaying = () => {
    // Mix actual words with lures
    const lures = ['River', 'Planet', 'Circuit', 'Logic', 'Force', 'Spirit', 'Ghost', 'Shadow'].filter(w => !selectedLevel.words.includes(w));
    const mixed = [...selectedLevel.words.map(w => ({ word: w, isCorrect: true })),
    ...lures.slice(0, selectedLevel.words.length).map(w => ({ word: w, isCorrect: false }))]
      .sort(() => Math.random() - 0.5);

    setTestWords(mixed);
    setCurrentWordIndex(0);
    setScore(0);
    setGamePhase('playing');
  };

  const handleWordChoice = (seen: boolean) => {
    const currentWord = testWords[currentWordIndex];
    const correctChoice = (seen && currentWord.isCorrect) || (!seen && !currentWord.isCorrect);

    if (correctChoice) {
      setScore(prev => prev + 1);
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }

    setTimeout(() => {
      setIsCorrect(null);
      if (currentWordIndex < testWords.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
      } else {
        const finalAccuracy = Math.round(((correctChoice ? score + 1 : score) / testWords.length) * 100);
        finishLevel(finalAccuracy);
      }
    }, 600);
  };

  const finishLevel = (accuracy: number) => {
    recordLevelCompletion(selectedLevel.id, accuracy, selectedLevel.xpReward);
    setGamePhase('complete');
    onComplete(accuracy);
  };

  if (gamePhase === 'levelSelect') {
    const levelPathData: LevelPathNodeData[] = LEVELS.map(level => ({
      id: level.id,
      name: level.name,
      xpReward: level.xpReward,
      metadata: {
        words: `${level.words.length} Tokens`,
        speed: `${level.displayTime}ms`
      }
    }));

    return (
      <LevelSelectScaffold
        title="Word Memory"

        onBack={onBack}
        totalXP={totalXP}
        completedLevelsCount={completedLevels.size}
        totalLevels={LEVELS.length}
      >
        <InstructionalOverlay
          isOpen={showInstructions}
          onComplete={handleStartMission}
          title="Mission Goal"
          instructions={[
            "Watch the words carefully",
            "Remember the ones that appear",
            "Click if you've seen the word before",
            "Try to get a high score!"
          ]}
          patternType="recall"
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

  if (gamePhase === 'preview') {
    return (
      <GameWorkspace
        title="Lexical Buffer"
        subtitle="Study Phase"
        currentRound={1}
        totalRounds={1}
        score={0}
        icon={<Eye className="w-5 h-5 text-white" />}
      >
        <div className="flex-1 flex flex-col items-center justify-center py-6 w-full h-full max-w-4xl mx-auto px-6">
          <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.4em] mb-12">Remembering Words</div>
          <div className="flex flex-wrap justify-center gap-6">
            {selectedLevel.words.map((word, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                key={i}
                className="bg-white px-10 py-6 rounded-3xl border-2 border-blue-50 shadow-sm flex items-center justify-center min-w-[180px]"
              >
                <p className="text-2xl font-black text-blue-900 tracking-tighter uppercase">{word}</p>
              </motion.div>
            ))}
          </div>
          <Button
            onClick={startPlaying}
            className="mt-16 h-20 px-16 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl group"
          >
            Engage Recall
            <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </GameWorkspace>
    );
  }

  if (gamePhase === 'playing') {
    return (
      <GameWorkspace
        title="Lexical Buffer"
        subtitle="Verification Phase"
        currentRound={currentWordIndex + 1}
        totalRounds={testWords.length}
        score={score}
        icon={<Brain className="w-5 h-5 text-white" />}
      >
        <div className="flex-1 flex flex-col items-center justify-center py-6 w-full h-full max-w-lg mx-auto px-6">
          <div className="relative mb-20 w-full flex flex-col items-center justify-center h-48">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentWordIndex}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.5, y: -20 }}
                className={`w-full bg-white rounded-[4rem] border-8 shadow-2xl flex items-center justify-center py-10 px-8 ${isCorrect === true ? 'border-green-100' : isCorrect === false ? 'border-red-100' : 'border-blue-50'}`}
              >
                <span className={`text-6xl font-black uppercase tracking-tighter ${isCorrect === true ? 'text-green-600' : isCorrect === false ? 'text-red-500' : 'text-blue-900'}`}>
                  {testWords[currentWordIndex].word}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-6 w-full">
            <Button
              onClick={() => handleWordChoice(true)}
              className="h-24 rounded-[2rem] bg-blue-50 hover:bg-blue-100 text-blue-600 border-2 border-blue-200 font-black uppercase tracking-widest text-lg shadow-sm group"
            >
              <CheckCircle className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              Seen
            </Button>
            <Button
              onClick={() => handleWordChoice(false)}
              className="h-24 rounded-[2rem] bg-white hover:bg-blue-50 text-blue-400 border-2 border-blue-100 font-black uppercase tracking-widest text-lg shadow-sm group"
            >
              <RotateCcw className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              New
            </Button>
          </div>

          <div className="mt-16 w-full max-w-xs">
            <div className="flex justify-between items-center mb-2 px-1 text-blue-400">
              <span className="text-[10px] font-black uppercase tracking-widest">Focus Level</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{Math.round((score / (currentWordIndex + 1)) * 100)}%</span>
            </div>
            <Progress value={(score / (currentWordIndex + 1)) * 100} className="h-2 bg-blue-50" />
          </div>
        </div>
      </GameWorkspace>
    );
  }

  if (gamePhase === 'complete') {
    const accuracy = Math.round((score / testWords.length) * 100);
    return (
      <UnifiedGameResults
        score={score}
        maxScore={testWords.length}
        accuracy={accuracy}
        xpEarned={selectedLevel.xpReward}
        levelName={selectedLevel.name}
        gameId="word-memory"
        isPassed={accuracy >= 70}
        onPlayAgain={() => setGamePhase('levelSelect')}
        onExit={onBack}
      />
    );
  }

  return null;
};

export default WordMemoryGame;
