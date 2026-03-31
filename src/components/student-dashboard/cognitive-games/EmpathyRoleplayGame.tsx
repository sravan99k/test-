import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Heart, Users, Brain, Sparkles, Zap, Info, Clock, CheckCircle, RotateCcw,
  ChevronRight, Lock, Trophy, MessageCircle, Eye, Shield
} from 'lucide-react';
import { LevelPathContainer, LevelPathNodeData } from './level-path';
import LevelSelectScaffold from './LevelSelectScaffold';
import { useLevelProgress } from './useLevelProgress';
import { GameWorkspace } from './shared/GameWorkspace';
import { UnifiedGameResults } from './shared/UnifiedGameResults';
import { InstructionalOverlay } from './shared/InstructionalOverlay';
import { scenariosByCategory, EmpathyScenario } from './empathy-scenarios';

interface EmpathyRoleplayGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface LevelConfig {
  id: number;
  name: string;
  category: keyof typeof scenariosByCategory;
  xpReward: number;
  icon: React.ReactNode;
}

const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Friendship',
    category: 'friendship',
    xpReward: 50,
    icon: <Heart className="w-5 h-5 text-blue-500" />
  },
  {
    id: 2,
    name: 'Family',
    category: 'family',
    xpReward: 75,
    icon: <Users className="w-5 h-5 text-blue-500" />
  },
  {
    id: 3,
    name: 'School Life',
    category: 'school',
    xpReward: 100,
    icon: <Brain className="w-5 h-5 text-blue-500" />
  },
  {
    id: 4,
    name: 'Online Kindness',
    category: 'online',
    xpReward: 150,
    icon: <Zap className="w-5 h-5 text-blue-500" />
  },
  {
    id: 5,
    name: 'Community Care',
    category: 'community',
    xpReward: 250,
    icon: <Shield className="w-5 h-5 text-blue-500" />
  }
];

const EmpathyRoleplayGame: React.FC<EmpathyRoleplayGameProps> = ({ onComplete, onBack }) => {
  const [gamePhase, setGamePhase] = useState<'levelSelect' | 'playing' | 'complete'>('levelSelect');
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(LEVELS[0]);
  const [scenarios, setScenarios] = useState<EmpathyScenario[]>([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const {
    totalXP,
    completedLevels,
    bestScores,
    isLevelUnlocked,
    recordLevelCompletion,
  } = useLevelProgress('empathyRoleplay');

  const startLevelSelect = (level: LevelConfig) => {
    setSelectedLevel(level);
    setShowInstructions(true);
  };

  const handleStartMission = () => {
    setShowInstructions(false);
    const categoryScenarios = [...scenariosByCategory[selectedLevel.category]].sort(() => Math.random() - 0.5).slice(0, 3);
    setScenarios(categoryScenarios);
    setCurrentScenarioIndex(0);
    setScore(0);
    setFeedback(null);
    setGamePhase('playing');
  };

  const handleResponseChoice = (response: any) => {
    const isCorrect = response.type === 'empathetic';
    setFeedback({ isCorrect, text: response.text });

    if (isCorrect) setScore(prev => prev + 33); // 3 scenarios, ~100 total

    setTimeout(() => {
      setFeedback(null);
      if (currentScenarioIndex < scenarios.length - 1) {
        setCurrentScenarioIndex(prev => prev + 1);
      } else {
        const finalScore = isCorrect ? Math.min(100, score + 34) : score;
        finishLevel(finalScore);
      }
    }, 2000);
  };

  const finishLevel = (finalScore: number) => {
    recordLevelCompletion(selectedLevel.id, finalScore, selectedLevel.xpReward);
    setGamePhase('complete');
    onComplete(finalScore);
  };

  if (gamePhase === 'levelSelect') {
    const levelPathData: LevelPathNodeData[] = LEVELS.map(level => ({
      id: level.id,
      name: level.name,
      xpReward: level.xpReward,
      metadata: {
        category: level.category,
        nodes: '3 Social Syncs'
      }
    }));

    return (
      <LevelSelectScaffold
        title="Empathy Challenge"

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
            "Read the story carefully",
            "Think about how they feel",
            "Choose the kindest answer",
            "Help everyone get along"
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

  if (gamePhase === 'playing') {
    const current = scenarios[currentScenarioIndex];
    return (
      <GameWorkspace
        title="Empathy Challenge"
        subtitle={selectedLevel.name}
        currentRound={currentScenarioIndex + 1}
        totalRounds={scenarios.length}
        score={score}
        icon={<MessageCircle className="w-5 h-5 text-white" />}
      >
        <div className="flex-1 flex flex-col items-center justify-center py-6 w-full h-full max-w-4xl mx-auto px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScenarioIndex}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -10 }}
              className="w-full"
            >
              {/* Scenario Card */}
              <div className="bg-white rounded-[3rem] border-8 border-blue-50 shadow-2xl p-10 mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
                  <Users className="w-32 h-32 text-blue-900" />
                </div>
                <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.4em] mb-4">What Happened?</div>
                <h2 className="text-3xl font-black text-blue-900 leading-tight tracking-tighter mb-8 max-w-2xl">
                  "{current?.situation}"
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">What would you do?</p>
                </div>
              </div>

              {/* Responses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {current?.responses.map((resp, i) => (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={i}
                    disabled={!!feedback}
                    onClick={() => handleResponseChoice(resp)}
                    className={`p-6 rounded-[2rem] text-left border-2 transition-all flex items-center justify-between group ${feedback?.text === resp.text
                      ? (feedback.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
                      : 'border-blue-100 bg-white hover:border-blue-300 hover:shadow-xl'
                      } ${feedback && feedback.text !== resp.text ? 'opacity-30' : ''}`}
                  >
                    <p className={`text-sm font-bold ${feedback?.text === resp.text ? 'text-blue-900' : 'text-blue-900/70 group-hover:text-blue-900'}`}>
                      {resp.text}
                    </p>
                    {feedback?.text === resp.text && (
                      feedback.isCorrect ? <CheckCircle className="w-6 h-6 text-green-500 shrink-0 ml-4" /> : <RotateCcw className="w-6 h-6 text-red-500 shrink-0 ml-4" />
                    )}
                    {!feedback && <ChevronRight className="w-5 h-5 text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4" />}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </GameWorkspace>
    );
  }

  if (gamePhase === 'complete') {
    return (
      <UnifiedGameResults
        score={score}
        maxScore={100}
        accuracy={score}
        xpEarned={selectedLevel.xpReward}
        levelName={selectedLevel.name}
        gameId="empathy-roleplay"
        isPassed={score >= 60}
        onPlayAgain={() => setGamePhase('levelSelect')}
        onExit={onBack}
      />
    );
  }

  return null;
};

export default EmpathyRoleplayGame;