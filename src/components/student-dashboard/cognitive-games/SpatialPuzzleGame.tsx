import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Target, Brain, Sparkles, Zap, Info, Clock, CheckCircle, RotateCcw,
  ChevronRight, Lock, Trophy, LayoutGrid, RotateCw
} from 'lucide-react';
import { LevelPathContainer, LevelPathNodeData } from './level-path';
import LevelSelectScaffold from './LevelSelectScaffold';
import { useLevelProgress } from './useLevelProgress';
import { GameWorkspace } from './shared/GameWorkspace';
import { UnifiedGameResults } from './shared/UnifiedGameResults';
import { InstructionalOverlay } from './shared/InstructionalOverlay';

interface SpatialPuzzleGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface PuzzleLevelConfig {
  id: number;
  name: string;
  gridSize: number;
  targetPattern: number[][];
  pieces: { id: string; shape: number[][]; color: string }[];
  xpReward: number;
  icon: React.ReactNode;
}

const LEVELS: PuzzleLevelConfig[] = [
  {
    id: 1,
    name: 'Grid Puzzle',
    gridSize: 3,
    targetPattern: [
      [1, 1, 0],
      [1, 1, 0],
      [0, 0, 0]
    ],
    pieces: [
      { id: 'p1', shape: [[1, 1], [1, 1]], color: '#2563eb' }
    ],
    xpReward: 50,
    icon: <Sparkles className="w-5 h-5 text-blue-500" />
  },
  {
    id: 2,
    name: 'Logic Bricks',
    gridSize: 4,
    targetPattern: [
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 1, 1],
      [0, 0, 1, 1]
    ],
    pieces: [
      { id: 'p1', shape: [[1, 1], [1, 1]], color: '#2563eb' },
      { id: 'p2', shape: [[1, 1], [1, 1]], color: '#60a5fa' }
    ],
    xpReward: 75,
    icon: <Brain className="w-5 h-5 text-blue-500" />
  },
  {
    id: 3,
    name: 'Square Frame',
    gridSize: 4,
    targetPattern: [
      [1, 1, 1, 1],
      [1, 0, 0, 1],
      [1, 0, 0, 1],
      [1, 1, 1, 1]
    ],
    pieces: [
      { id: 'p1', shape: [[1, 1, 1, 1]], color: '#2563eb' },
      { id: 'p2', shape: [[1], [1], [1], [1]], color: '#3b82f6' },
      { id: 'p3', shape: [[1, 1, 1, 1]], color: '#60a5fa' },
      { id: 'p4', shape: [[1], [1], [1], [1]], color: '#93c5fd' }
    ],
    xpReward: 100,
    icon: <Zap className="w-5 h-5 text-blue-500" />
  }
];

const SpatialPuzzleGame: React.FC<SpatialPuzzleGameProps> = ({ onComplete, onBack }) => {
  const [gamePhase, setGamePhase] = useState<'levelSelect' | 'playing' | 'complete'>('levelSelect');
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<PuzzleLevelConfig>(LEVELS[0]);
  const [placedPieces, setPlacedPieces] = useState<{ id: string; x: number; y: number }[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const {
    totalXP,
    completedLevels,
    bestScores,
    isLevelUnlocked,
    recordLevelCompletion,
  } = useLevelProgress('spatialPuzzle');

  const startLevelSelect = (level: PuzzleLevelConfig) => {
    setSelectedLevel(level);
    setShowInstructions(true);
  };

  const handleStartMission = () => {
    setShowInstructions(false);
    setPlacedPieces([]);
    setSelectedPieceId(null);
    setGamePhase('playing');
  };

  const checkSolution = () => {
    // Basic verification logic
    const currentGrid = Array.from({ length: selectedLevel.gridSize }, () => Array(selectedLevel.gridSize).fill(0));

    placedPieces.forEach(p => {
      const piece = selectedLevel.pieces.find(sp => sp.id === p.id);
      if (piece) {
        piece.shape.forEach((row, ri) => {
          row.forEach((cell, ci) => {
            if (cell === 1) {
              const targetX = p.x + ri;
              const targetY = p.y + ci;
              if (targetX < selectedLevel.gridSize && targetY < selectedLevel.gridSize) {
                currentGrid[targetX][targetY] = 1;
              }
            }
          });
        });
      }
    });

    const isMatch = JSON.stringify(currentGrid) === JSON.stringify(selectedLevel.targetPattern);

    if (isMatch) {
      setScore(100);
      setTimeout(() => finishLevel(100), 1000);
    }
  };

  const finishLevel = (finalScore: number) => {
    recordLevelCompletion(selectedLevel.id, finalScore, selectedLevel.xpReward);
    setGamePhase('complete');
    onComplete(finalScore);
  };

  const handleCellClick = (x: number, y: number) => {
    if (selectedPieceId) {
      const existing = placedPieces.find(p => p.id === selectedPieceId);
      if (existing) {
        setPlacedPieces(placedPieces.map(p => p.id === selectedPieceId ? { ...p, x, y } : p));
      } else {
        setPlacedPieces([...placedPieces, { id: selectedPieceId, x, y }]);
      }
      setSelectedPieceId(null);
    }
  };

  useEffect(() => {
    if (placedPieces.length === selectedLevel.pieces.length) {
      checkSolution();
    }
  }, [placedPieces]);

  if (gamePhase === 'levelSelect') {
    const levelPathData: LevelPathNodeData[] = LEVELS.map(level => ({
      id: level.id,
      name: level.name,
      xpReward: level.xpReward,
      metadata: {
        grid: `${level.gridSize}x${level.gridSize}`,
        pieces: `${level.pieces.length} Elements`
      }
    }));

    return (
      <LevelSelectScaffold
        title="Shape Puzzle"

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
            "Look at the pattern on the left",
            "Pick a shape from the bottom",
            "Drag it onto the grid on the right",
            "Copy the pattern to win!"
          ]}
          patternType="drag"
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
        title="Spatial Archon"
        subtitle={selectedLevel.name}
        currentRound={1}
        totalRounds={1}
        score={placedPieces.length}
        icon={<LayoutGrid className="w-5 h-5 text-white" />}
      >
        <div className="flex-1 flex flex-col items-center justify-center py-6 w-full h-full max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 w-full">

            {/* Target Blueprint */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.4em] mb-6">Target Blueprint</div>
              <div
                className="grid gap-2 p-4 bg-blue-50/50 rounded-3xl border-2 border-dashed border-blue-200"
                style={{ gridTemplateColumns: `repeat(${selectedLevel.gridSize}, 1fr)` }}
              >
                {selectedLevel.targetPattern.flat().map((cell, i) => (
                  <div key={i} className={`w-12 h-12 rounded-lg ${cell === 1 ? 'bg-blue-400 shadow-sm' : 'bg-white/50'}`} />
                ))}
              </div>
            </div>

            {/* Workspace Matrix */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.4em] mb-6">Pattern Grid</div>
              <div
                className="grid gap-2 p-6 bg-white rounded-[3rem] border-4 border-blue-50 shadow-2xl"
                style={{ gridTemplateColumns: `repeat(${selectedLevel.gridSize}, 1fr)` }}
              >
                {Array.from({ length: selectedLevel.gridSize * selectedLevel.gridSize }).map((_, i) => {
                  const x = Math.floor(i / selectedLevel.gridSize);
                  const y = i % selectedLevel.gridSize;
                  const isOccupied = placedPieces.some(p => {
                    const piece = selectedLevel.pieces.find(sp => sp.id === p.id);
                    if (!piece) return false;
                    return piece.shape.some((row, ri) =>
                      row.some((cell, ci) => cell === 1 && p.x + ri === x && p.y + ci === y)
                    );
                  });

                  return (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={i}
                      onClick={() => handleCellClick(x, y)}
                      className={`w-14 h-14 rounded-xl transition-colors ${isOccupied ? 'bg-blue-600 shadow-lg' : 'bg-blue-50/50 border-2 border-transparent hover:border-blue-200'}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Piece Buffer */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.4em] mb-6">Piece Buffer</div>
              <div className="flex flex-col gap-6 w-full">
                {selectedLevel.pieces.map((piece) => {
                  const isPlaced = placedPieces.some(p => p.id === piece.id);
                  return (
                    <motion.button
                      whileHover={!isPlaced ? { scale: 1.05 } : {}}
                      whileTap={!isPlaced ? { scale: 0.95 } : {}}
                      key={piece.id}
                      onClick={() => !isPlaced && setSelectedPieceId(piece.id)}
                      className={`p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${isPlaced ? 'opacity-30 border-transparent bg-blue-50' : (selectedPieceId === piece.id ? 'border-blue-500 bg-blue-50 shadow-blue-100 shadow-xl' : 'border-blue-100 bg-white shadow-sm')}`}
                    >
                      <div
                        className="grid gap-1"
                        style={{ gridTemplateColumns: `repeat(${piece.shape[0].length}, 1fr)` }}
                      >
                        {piece.shape.flat().map((cell, i) => (
                          <div key={i} className={`w-4 h-4 rounded-sm ${cell === 1 ? 'bg-blue-500' : 'bg-transparent'}`} />
                        ))}
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest">{isPlaced ? 'Deployed' : 'Ready'}</span>
                    </motion.button>
                  );
                })}
              </div>
              {placedPieces.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => setPlacedPieces([])}
                  className="mt-8 text-blue-400 hover:text-blue-600 hover:bg-blue-50 font-black uppercase tracking-widest text-[10px]"
                >
                  <RotateCcw className="w-3 h-3 mr-2" />
                  Clear Matrix
                </Button>
              )}
            </div>

          </div>
        </div>
      </GameWorkspace>
    );
  }

  if (gamePhase === 'complete') {
    return (
      <UnifiedGameResults
        score={100}
        maxScore={100}
        accuracy={100}
        xpEarned={selectedLevel.xpReward}
        levelName={selectedLevel.name}
        gameId="spatial-puzzle"
        isPassed={true}
        onPlayAgain={() => setGamePhase('levelSelect')}
        onExit={onBack}
      />
    );
  }

  return null;
};

export default SpatialPuzzleGame;