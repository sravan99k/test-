import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen, Brain, Sparkles, Zap, Info, Clock, CheckCircle, RotateCcw,
  ChevronRight, Lock, Trophy, LayoutGrid, Book
} from 'lucide-react';
import { LevelPathContainer, LevelNodeData } from './level-path';
import LevelSelectScaffold from './LevelSelectScaffold';
import { useLevelProgress } from './useLevelProgress';
import { GameWorkspace } from './shared/GameWorkspace';
import { UnifiedGameResults } from './shared/UnifiedGameResults';
import { InstructionalOverlay } from './shared/InstructionalOverlay';

interface SequenceStoryGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface StoryLevelConfig {
  id: number;
  name: string;
  events: string[];
  xpReward: number;
  icon: React.ReactNode;
}

const LEVELS: StoryLevelConfig[] = [
  {
    id: 1,
    name: 'Morning Routine',
    events: [
      "The sun rises over the horizon",
      "I wake up and stretch my arms",
      "I brush my teeth to stay clean",
      "I eat a healthy breakfast"
    ],
    xpReward: 50,
    icon: <Sparkles className="w-5 h-5 text-blue-500" />
  },
  {
    id: 2,
    name: 'School Mission',
    events: [
      "I grab my backpack with my gear",
      "The school bus arrives at my stop",
      "I meet my friends at the gate",
      "The bell rings for the first class",
      "I open my book to start learning"
    ],
    xpReward: 75,
    icon: <Book className="w-5 h-5 text-blue-500" />
  },
  {
    id: 3,
    name: 'Lab Discovery',
    events: [
      "I put on my safety goggles",
      "I mix the two colors",
      "A bright spark appears",
      "I write it in my notebook",
      "The experiment works!"
    ],
    xpReward: 100,
    icon: <Brain className="w-5 h-5 text-blue-500" />
  },
  {
    id: 4,
    name: 'Galaxy Voyage',
    events: [
      "The rocket engines start glowing",
      "The countdown reaches zero",
      "We blast off into the stars",
      "The Earth looks small from space",
      "We float in zero gravity",
      "We land softly on the Moon"
    ],
    xpReward: 150,
    icon: <Zap className="w-5 h-5 text-blue-500" />
  },
  {
    id: 5,
    name: 'Story Vault',
    events: [
      "I turn on the computer",
      "Letters appear on the screen",
      "I type the password correctly",
      "The secret file opens up",
      "I read the special message",
      "I save the work",
      "I turn off the computer"
    ],
    xpReward: 250,
    icon: <LayoutGrid className="w-5 h-5 text-blue-500" />
  }
];

const SequenceStoryGame: React.FC<SequenceStoryGameProps> = ({ onComplete, onBack }) => {
  const [gamePhase, setGamePhase] = useState<'levelSelect' | 'preview' | 'playing' | 'complete'>('levelSelect');
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<StoryLevelConfig>(LEVELS[0]);
  const [shuffledEvents, setShuffledEvents] = useState<{ id: string; text: string }[]>([]);
  const [userSequence, setUserSequence] = useState<{ id: string; text: string }[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const {
    totalXP,
    completedLevels,
    bestScores,
    isLevelUnlocked,
    recordLevelCompletion,
  } = useLevelProgress('sequenceStory');

  const startLevelSelect = (level: StoryLevelConfig) => {
    setSelectedLevel(level);
    setShowInstructions(true);
  };

  const handleStartMission = () => {
    setShowInstructions(false);
    setGamePhase('preview');
  };

  const startPlaying = () => {
    const eventsWithIds = selectedLevel.events.map((text, index) => ({ id: `event-${index}`, text }));
    const shuffled = [...eventsWithIds].sort(() => Math.random() - 0.5);
    setShuffledEvents(shuffled);
    setUserSequence([]);
    setIsCorrect(null);
    setGamePhase('playing');
  };

  const toggleEvent = (event: { id: string; text: string }) => {
    if (userSequence.find(e => e.id === event.id)) {
      setUserSequence(userSequence.filter(e => e.id !== event.id));
    } else {
      setUserSequence([...userSequence, event]);
    }
  };

  const checkSequence = () => {
    const correctOrder = selectedLevel.events;
    const userOrder = userSequence.map(e => e.text);
    const isAllCorrect = userOrder.length === correctOrder.length &&
      userOrder.every((text, i) => text === correctOrder[i]);

    setIsCorrect(isAllCorrect);

    if (isAllCorrect) {
      setScore(100);
      setTimeout(() => finishLevel(100), 1500);
    } else {
      setTimeout(() => setIsCorrect(null), 1500);
    }
  };

  const finishLevel = (finalScore: number) => {
    recordLevelCompletion(selectedLevel.id, finalScore, selectedLevel.xpReward);
    setGamePhase('complete');
    onComplete(finalScore);
  };

  if (gamePhase === 'levelSelect') {
    const levelPathData: LevelNodeData[] = LEVELS.map(level => ({
      id: level.id,
      name: level.name,
      xpReward: level.xpReward,
      metadata: {
        steps: `${level.events.length} Events`,
        theme: level.name
      }
    }));

    return (
      <LevelSelectScaffold
        title="Story Builder"

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
            "Look at the mixed up pictures",
            "Think about what happens first",
            "Put them in the right order",
            "Make the story make sense!"
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
        title="Narrative Link"
        subtitle="Study Phase"
        currentRound={1}
        totalRounds={1}
        score={0}
        icon={<BookOpen className="w-5 h-5 text-white" />}
      >
        <div className="flex-1 flex flex-col items-center justify-center py-6 w-full h-full max-w-4xl mx-auto px-6">
          <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.4em] mb-8">Memorize Original Sequence</div>
          <div className="space-y-4 w-full">
            {selectedLevel.events.map((text, i) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i}
                className="bg-white p-6 rounded-2xl border-2 border-blue-50 shadow-sm flex items-center gap-6"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black text-xs shrink-0">{i + 1}</div>
                <p className="text-blue-900 font-bold">{text}</p>
              </motion.div>
            ))}
          </div>
          <Button
            onClick={startPlaying}
            className="mt-12 h-16 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl group"
          >
            Initialize Test
            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </GameWorkspace>
    );
  }

  if (gamePhase === 'playing') {
    return (
      <GameWorkspace
        title="Narrative Link"
        subtitle="Reconstruction Phase"
        currentRound={1}
        totalRounds={1}
        score={userSequence.length}
        icon={<Brain className="w-5 h-5 text-white" />}
      >
        <div className="flex-1 flex flex-col items-center justify-center py-6 w-full h-full max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* Available Source */}
            <div className="space-y-4">
              <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.4em] mb-4">Select Events</div>
              <div className="space-y-3">
                {shuffledEvents.map((event) => {
                  const isSelected = userSequence.some(e => e.id === event.id);
                  return (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={event.id}
                      onClick={() => !isSelected && toggleEvent(event)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${isSelected ? 'opacity-30 bg-blue-50 border-transparent cursor-default' : 'bg-white border-blue-100 hover:border-blue-300 shadow-sm'}`}
                    >
                      <p className={`text-sm font-bold ${isSelected ? 'text-blue-300' : 'text-blue-900'}`}>{event.text}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Target Timeline */}
            <div className="space-y-4 flex flex-col">
              <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.4em] mb-4">Reconstructed Timeline</div>
              <div className="flex-1 bg-blue-50/30 rounded-[2.5rem] border-2 border-dashed border-blue-200 p-6 space-y-3 min-h-[300px]">
                <AnimatePresence mode="popLayout">
                  {userSequence.map((event, i) => (
                    <motion.div
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      key={event.id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">{i + 1}</div>
                        <p className="text-xs font-bold text-blue-900">{event.text}</p>
                      </div>
                      <button
                        onClick={() => toggleEvent(event)}
                        className="w-6 h-6 rounded-full hover:bg-red-50 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                  {userSequence.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-blue-300 gap-4 py-20">
                      <LayoutGrid className="w-12 h-12 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-center">Click events to begin<br />the sequence</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <Button
                disabled={userSequence.length !== selectedLevel.events.length}
                onClick={checkSequence}
                className={`w-full h-16 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all ${isCorrect === true ? 'bg-green-600' : isCorrect === false ? 'bg-red-500' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isCorrect === true ? 'LINK ESTABLISHED' : isCorrect === false ? 'LINK MISMATCH' : 'VALIDATE SEQUENCE'}
                {isCorrect === true && <CheckCircle className="w-5 h-5 ml-2" />}
                {isCorrect === false && <RotateCcw className="w-5 h-5 ml-2" />}
              </Button>
            </div>
          </div>
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
        gameId="sequence-story"
        isPassed={score >= 70}
        onPlayAgain={() => setGamePhase('levelSelect')}
        onExit={onBack}
      />
    );
  }

  return null;
};

export default SequenceStoryGame;