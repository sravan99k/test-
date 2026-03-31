import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Play, Brain, Sparkles, Star, ChevronRight, RotateCcw,
  Zap, CheckCircle, Timer, Target, Smile, Heart, Info, Eye, Shield
} from 'lucide-react';
import { GameWorkspace } from './shared/GameWorkspace';
import { UnifiedGameResults } from './shared/UnifiedGameResults';
import { LevelPathContainer, LevelPathNodeData } from './level-path';
import LevelSelectScaffold from './LevelSelectScaffold';
import { useLevelProgress } from './useLevelProgress';

interface EmotionRecognitionGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Question {
  emoji: string;
  correct: string;
  options: string[];
}

interface LevelConfig {
  id: number;
  name: string;
  questions: Question[];
  xpReward: number;
  icon: React.ReactNode;
  difficulty: 'Basic' | 'Intermediate' | 'Social' | 'Advanced' | 'Master';
}

const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Feelings 101',
    difficulty: 'Basic',
    xpReward: 50,
    icon: <Smile className="w-5 h-5" />,
    questions: [
      { emoji: '😊', correct: 'Happy', options: ['Happy', 'Excited', 'Calm', 'Proud'] },
      { emoji: '😢', correct: 'Sad', options: ['Sad', 'Tired', 'Worried', 'Disappointed'] },
      { emoji: '😠', correct: 'Angry', options: ['Angry', 'Frustrated', 'Annoyed', 'Serious'] }
    ]
  },
  {
    id: 2,
    name: 'Mixed Feelings',
    difficulty: 'Intermediate',
    xpReward: 75,
    icon: <Eye className="w-5 h-5" />,
    questions: [
      { emoji: '😨', correct: 'Scared', options: ['Scared', 'Shocked', 'Nervous', 'Anxious'] },
      { emoji: '😲', correct: 'Surprised', options: ['Surprised', 'Amazed', 'Confused', 'Curious'] },
      { emoji: '🤢', correct: 'Disgusted', options: ['Disgusted', 'Sick', 'Uncomfortable', 'Disappointed'] }
    ]
  },
  {
    id: 3,
    name: 'Friend Detect',
    difficulty: 'Social',
    xpReward: 100,
    icon: <Heart className="w-5 h-5" />,
    questions: [
      { emoji: '😍', correct: 'Love', options: ['Love', 'Happy', 'Excited', 'Admiring'] },
      { emoji: '😌', correct: 'Peaceful', options: ['Peaceful', 'Content', 'Calm', 'Satisfied'] },
      { emoji: '🤔', correct: 'Thinking', options: ['Thinking', 'Confused', 'Curious', 'Doubtful'] },
      { emoji: '🥳', correct: 'Party', options: ['Party', 'Excited', 'Happy', 'Wild'] }
    ]
  },
  {
    id: 4,
    name: 'Tiny Signs',
    difficulty: 'Advanced',
    xpReward: 150,
    icon: <Shield className="w-5 h-5" />,
    questions: [
      { emoji: '😴', correct: 'Tired', options: ['Tired', 'Bored', 'Sleepy', 'Relaxed'] },
      { emoji: '😎', correct: 'Cool', options: ['Cool', 'Proud', 'Confident', 'Relaxed'] },
      { emoji: '😬', correct: 'Awkward', options: ['Awkward', 'Nervous', 'Scared', 'Nervy'] },
      { emoji: '🙄', correct: 'Bored', options: ['Bored', 'Annoyed', 'Tired', 'Skeptical'] }
    ]
  },
  {
    id: 5,
    name: 'Empathy Hero',
    difficulty: 'Master',
    xpReward: 250,
    icon: <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />,
    questions: [
      { emoji: '😇', correct: 'Innocent', options: ['Innocent', 'Holy', 'Kind', 'Proud'] },
      { emoji: '🤨', correct: 'Skeptical', options: ['Skeptical', 'Thinking', 'Annoyed', 'Curious'] },
      { emoji: '🧐', correct: 'Inquisitive', options: ['Inquisitive', 'Thinking', 'Smart', 'Serious'] },
      { emoji: '😅', correct: 'Relieved', options: ['Relieved', 'Nervous', 'Happy', 'Sweaty'] },
      { emoji: '🥺', correct: 'Pleading', options: ['Pleading', 'Sad', 'Love', 'Hopeful'] }
    ]
  }
];

import { InstructionalOverlay } from './shared/InstructionalOverlay';

const EmotionRecognitionGame: React.FC<EmotionRecognitionGameProps> = ({ onComplete, onBack }) => {
  const [gamePhase, setGamePhase] = useState<'levelSelect' | 'playing' | 'complete'>('levelSelect');
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(LEVELS[0]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);

  const {
    totalXP,
    completedLevels,
    bestScores,
    isLevelUnlocked,
    recordLevelCompletion,
  } = useLevelProgress('emotionRecognition');

  const handleStartMission = (level: LevelConfig) => {
    setSelectedLevel(level);
    setShowInstructions(true);
  };

  const startLevel = () => {
    setShowInstructions(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGamePhase('playing');
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === selectedLevel.questions[currentQuestionIndex].correct;
    if (isCorrect) setScore(prev => prev + 1);
    setLastAnswerCorrect(isCorrect);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      if (currentQuestionIndex < selectedLevel.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        const finalScore = isCorrect ? score + 1 : score;
        const accuracy = Math.round((finalScore / selectedLevel.questions.length) * 100);
        recordLevelCompletion(selectedLevel.id, accuracy, selectedLevel.xpReward);
        setGamePhase('complete');
        onComplete(accuracy);
      }
    }, 1200);
  };

  if (gamePhase === 'levelSelect') {
    const levelPathData: LevelPathNodeData[] = LEVELS.map(level => ({
      id: level.id,
      name: level.name,
      xpReward: level.xpReward,
      metadata: {
        difficulty: level.difficulty,
        questions: level.questions.length
      }
    }));

    return (
      <>
        <LevelSelectScaffold
          title="Guess the Feeling"

          onBack={onBack}
          totalXP={totalXP}
          completedLevelsCount={completedLevels.size}
          totalLevels={LEVELS.length}
        >
          <InstructionalOverlay
            isOpen={showInstructions}
            onComplete={startLevel}
            title="How to Play"
            instructions={[
              "Look at the picture",
              "Guess the feeling shown",
              "Click the matching emoji",
              "Try to finish all rounds!"
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
    const currentQuestion = selectedLevel.questions[currentQuestionIndex];
    return (
      <GameWorkspace
        title="Empathy Hub"
        subtitle={selectedLevel.name}
        currentRound={currentQuestionIndex + 1}
        totalRounds={selectedLevel.questions.length}
        score={score}
        icon={<Smile className="w-5 h-5 text-white" />}
      >
        <div className="flex-1 flex flex-col items-center justify-center py-6 w-full h-full">
          <div className="relative mb-12">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute inset-0 blur-[80px] bg-blue-400/20 rounded-full scale-125"
            />
            <div className="relative w-48 h-48 bg-white rounded-[4rem] border-8 border-blue-50 shadow-2xl flex items-center justify-center text-8xl z-10">
              {currentQuestion.emoji}
            </div>

            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 z-20"
              >
                <div className={`px-6 py-3 rounded-2xl text-center font-black uppercase tracking-widest text-xs border-4 border-white shadow-xl ${lastAnswerCorrect ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-400'}`}>
                  {lastAnswerCorrect ? 'Excellent Decode!' : 'Re-Syncing...'}
                </div>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
            {currentQuestion.options.map((option, i) => (
              <Button
                key={i}
                disabled={showFeedback}
                onClick={() => handleAnswer(option)}
                className="h-20 rounded-[2rem] border-4 border-blue-50 bg-white text-blue-900 font-black text-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm uppercase tracking-tight"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </GameWorkspace>
    );
  }

  if (gamePhase === 'complete') {
    const accuracy = Math.round((score / selectedLevel.questions.length) * 100);
    return (
      <UnifiedGameResults
        score={score}
        maxScore={selectedLevel.questions.length}
        accuracy={accuracy}
        xpEarned={selectedLevel.xpReward}
        levelName={selectedLevel.name}
        gameId="emotion-recognition"
        isPassed={accuracy >= 70}
        onPlayAgain={() => setGamePhase('levelSelect')}
        onExit={onBack}
      />
    );
  }

  return null;
};

export default EmotionRecognitionGame;
