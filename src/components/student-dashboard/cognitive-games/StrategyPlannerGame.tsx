import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Target, Brain, Sparkles, Zap, Info, Clock, CheckCircle, RotateCcw,
  ChevronRight, Lock, Trophy, LayoutGrid, Cpu, Shield, Activity, Map
} from 'lucide-react';
import { LevelPathContainer, LevelPathNodeData } from './level-path';
import LevelSelectScaffold from './LevelSelectScaffold';
import { useLevelProgress } from './useLevelProgress';
import { GameWorkspace } from './shared/GameWorkspace';
import { UnifiedGameResults } from './shared/UnifiedGameResults';
import { InstructionalOverlay } from './shared/InstructionalOverlay';
import PathBuilderGame from './PathBuilderGame';

interface StrategyPlannerGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Tower {
  id: number;
  disks: number[];
}

interface StrategyLevelConfig {
  id: number;
  name: string;
  type: 'tower-of-hanoi' | 'path-builder';
  disks?: number;
  gridSize?: number;
  maxMoves?: number;
  xpReward: number;
  icon: React.ReactNode;
}

const LEVELS: StrategyLevelConfig[] = [
  {
    id: 1,
    name: 'Stack Challenge 1',
    type: 'tower-of-hanoi',
    disks: 3,
    xpReward: 50,
    icon: <Activity className="w-5 h-5 text-blue-500" />
  },
  {
    id: 2,
    name: 'Stack Challenge 2',
    type: 'tower-of-hanoi',
    disks: 4,
    xpReward: 75,
    icon: <Shield className="w-5 h-5 text-blue-500" />
  },
  {
    id: 3,
    name: 'Path Finder I',
    type: 'path-builder',
    gridSize: 5,
    maxMoves: 12,
    xpReward: 100,
    icon: <Map className="w-5 h-5 text-blue-500" />
  },
  {
    id: 4,
    name: 'Stack Challenge 3',
    type: 'tower-of-hanoi',
    disks: 5,
    xpReward: 150,
    icon: <Cpu className="w-5 h-5 text-blue-500" />
  },
  {
    id: 5,
    name: 'Path Finder II',
    type: 'path-builder',
    gridSize: 7,
    maxMoves: 20,
    xpReward: 250,
    icon: <Sparkles className="w-5 h-5 text-blue-500" />
  }
];

const StrategyPlannerGame: React.FC<StrategyPlannerGameProps> = ({ onComplete, onBack }) => {
  const [gamePhase, setGamePhase] = useState<'levelSelect' | 'playing' | 'complete'>('levelSelect');
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<StrategyLevelConfig>(LEVELS[0]);
  const [towers, setTowers] = useState<Tower[]>([
    { id: 1, disks: [] },
    { id: 2, disks: [] },
    { id: 3, disks: [] }
  ]);
  const [selectedTowerId, setSelectedTowerId] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);

  const {
    totalXP,
    completedLevels,
    bestScores,
    isLevelUnlocked,
    recordLevelCompletion,
  } = useLevelProgress('strategyPlanner');

  const startLevelSelect = (level: StrategyLevelConfig) => {
    setSelectedLevel(level);
    setShowInstructions(true);
  };

  const handleStartMission = () => {
    setShowInstructions(false);
    if (selectedLevel.type === 'tower-of-hanoi') {
      const initialDisks = Array.from({ length: selectedLevel.disks! }, (_, i) => selectedLevel.disks! - i);
      setTowers([
        { id: 1, disks: initialDisks },
        { id: 2, disks: [] },
        { id: 3, disks: [] }
      ]);
      setMoves(0);
      setSelectedTowerId(null);
    }
    setGamePhase('playing');
  };

  const handleTowerClick = (towerId: number) => {
    if (selectedTowerId === null) {
      const tower = towers.find(t => t.id === towerId);
      if (tower && tower.disks.length > 0) {
        setSelectedTowerId(towerId);
      }
    } else {
      if (selectedTowerId === towerId) {
        setSelectedTowerId(null);
      } else {
        const fromTower = towers.find(t => t.id === selectedTowerId)!;
        const toTower = towers.find(t => t.id === towerId)!;
        const disk = fromTower.disks[fromTower.disks.length - 1];

        if (toTower.disks.length === 0 || disk < toTower.disks[toTower.disks.length - 1]) {
          const newTowers = towers.map(t => {
            if (t.id === selectedTowerId) return { ...t, disks: t.disks.slice(0, -1) };
            if (t.id === towerId) return { ...t, disks: [...t.disks, disk] };
            return t;
          });
          setTowers(newTowers);
          setMoves(prev => prev + 1);
          setSelectedTowerId(null);

          if (newTowers[2].disks.length === selectedLevel.disks) {
            setTimeout(() => finishLevel(100), 1000);
          }
        } else {
          setSelectedTowerId(towerId);
        }
      }
    }
  };

  const finishLevel = (finalScore: number) => {
    setScore(finalScore);
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
        type: level.type === 'tower-of-hanoi' ? 'Tower Stack' : 'Mesh Mapping',
        spec: level.type === 'tower-of-hanoi' ? `${level.disks} Blocks` : `${level.gridSize}x${level.gridSize} Grid`
      }
    }));

    return (
      <LevelSelectScaffold
        title="Planning Master"

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
            selectedLevel.type === 'tower-of-hanoi'
              ? "Move the stack to the last pole"
              : "Draw a path to the goal",
            "Be careful with the order",
            "Try to use fewer moves",
            "Think before you move!"
          ]}
          patternType={selectedLevel.type === 'tower-of-hanoi' ? 'drag' : 'sequence'}
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
    if (selectedLevel.type === 'path-builder') {
      return (
        <GameWorkspace
          title="Mapping Protocol"
          subtitle={selectedLevel.name}
          currentRound={1}
          totalRounds={1}
          score={0}
          icon={<Map className="w-5 h-5 text-white" />}
        >
          <PathBuilderGame
            gridSize={selectedLevel.gridSize}
            maxMoves={selectedLevel.maxMoves}
            onComplete={finishLevel}
            onBack={() => setGamePhase('levelSelect')}
          />
        </GameWorkspace>
      );
    }

    return (
      <GameWorkspace
        title="Stack Builder"
        subtitle={selectedLevel.name}
        currentRound={1}
        totalRounds={1}
        score={moves}
        icon={<Cpu className="w-5 h-5 text-white" />}
      >
        <div className="flex-1 flex flex-col items-center justify-center py-6 w-full h-full max-w-4xl mx-auto">
          <div className="w-full flex justify-center items-end gap-16 h-96 px-10 relative bg-blue-50/30 rounded-[3rem] border-4 border-white shadow-inner overflow-hidden">

            {/* Atmospheric Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#2563eb 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {towers.map((tower) => (
              <div key={tower.id} className="flex flex-col items-center flex-1 h-[80%] relative group">
                <motion.div
                  onClick={() => handleTowerClick(tower.id)}
                  className="absolute bottom-4 w-4 bg-blue-100 rounded-full h-full cursor-pointer hover:bg-blue-200 transition-colors"
                />
                <div
                  className="relative w-full h-full flex flex-col-reverse items-center cursor-pointer pb-4"
                  onClick={() => handleTowerClick(tower.id)}
                >
                  <AnimatePresence>
                    {tower.disks.map((disk, idx) => {
                      const isTop = idx === tower.disks.length - 1;
                      const isSelected = selectedTowerId === tower.id && isTop;
                      return (
                        <motion.div
                          layoutId={`disk-${disk}`}
                          key={disk}
                          className={`h-10 rounded-2xl shadow-lg border-b-4 border-black/10 transition-all ${disk === 1 ? 'bg-blue-400' :
                            disk === 2 ? 'bg-blue-500' :
                              disk === 3 ? 'bg-blue-600' :
                                disk === 4 ? 'bg-blue-700' : 'bg-blue-900'
                            } ${isSelected ? '-translate-y-20 ring-4 ring-blue-300 scale-110 z-20' : 'hover:scale-102 z-10'}`}
                          style={{ width: `${30 + (disk / selectedLevel.disks!) * 70}%` }}
                        />
                      );
                    })}
                  </AnimatePresence>
                </div>
                <div className="absolute -bottom-10 flex flex-col items-center">
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Pole {tower.id}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 flex gap-4">
            <div className="px-10 py-4 bg-white rounded-2xl border-2 border-blue-50 shadow-sm flex flex-col items-center">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Move Count</span>
              <span className="text-3xl font-black text-blue-900 tabular-nums">{moves}</span>
            </div>
            <Button
              variant="outline"
              onClick={handleStartMission}
              className="h-20 w-20 rounded-2xl border-2 border-blue-100 bg-white text-blue-400 hover:text-blue-600 hover:bg-blue-50"
            >
              <RotateCcw className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </GameWorkspace>
    );
  }

  if (gamePhase === 'complete') {
    return (
      <UnifiedGameResults
        score={moves}
        maxScore={50} // Arbitrary target moves
        accuracy={100}
        xpEarned={selectedLevel.xpReward}
        levelName={selectedLevel.name}
        gameId="strategy-planner"
        isPassed={true}
        onPlayAgain={() => setGamePhase('levelSelect')}
        onExit={onBack}
      />
    );
  }

  return null;
};

export default StrategyPlannerGame;