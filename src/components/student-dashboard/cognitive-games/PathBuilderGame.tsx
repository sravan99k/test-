import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ArrowUp, ArrowDown, ArrowRight, ArrowLeft as ArrowLeftIcon,
  Map, Brain, Sparkles, Zap, Info, Clock, CheckCircle, RotateCcw,
  ChevronRight, Play, Target
} from 'lucide-react';

interface PathBuilderGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
  gridSize?: number;
  maxMoves?: number;
}

type Direction = 'up' | 'down' | 'left' | 'right';
type CellType = 'empty' | 'start' | 'goal' | 'obstacle' | 'path';

interface Position {
  row: number;
  col: number;
}

const PathBuilderGame: React.FC<PathBuilderGameProps> = ({
  onComplete,
  onBack,
  gridSize = 5,
  maxMoves = 15
}) => {
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [startPos, setStartPos] = useState<Position>({ row: 0, col: 0 });
  const [goalPos, setGoalPos] = useState<Position>({ row: 0, col: 0 });
  const [playerPos, setPlayerPos] = useState<Position>({ row: 0, col: 0 });
  const [moveQueue, setMoveQueue] = useState<Direction[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [feedback, setFeedback] = useState<'success' | 'fail' | null>(null);

  const initGame = () => {
    const newGrid: CellType[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill('empty'));
    const start: Position = { row: 0, col: 0 };
    const goal: Position = { row: gridSize - 1, col: gridSize - 1 };

    setStartPos(start);
    setPlayerPos(start);
    setGoalPos(goal);

    newGrid[start.row][start.col] = 'start';
    newGrid[goal.row][goal.col] = 'goal';

    // Add some random obstacles
    let obstacles = 0;
    while (obstacles < gridSize) {
      const r = Math.floor(Math.random() * gridSize);
      const c = Math.floor(Math.random() * gridSize);
      if (newGrid[r][c] === 'empty') {
        newGrid[r][c] = 'obstacle';
        obstacles++;
      }
    }

    setGrid(newGrid);
    setMoveQueue([]);
    setFeedback(null);
    setIsExecuting(false);
  };

  useEffect(() => {
    initGame();
  }, [gridSize]);

  const addMove = (dir: Direction) => {
    if (isExecuting || moveQueue.length >= maxMoves) return;
    setMoveQueue([...moveQueue, dir]);
  };

  const executePath = async () => {
    setIsExecuting(true);
    let current = { ...startPos };

    for (const move of moveQueue) {
      await new Promise(r => setTimeout(r, 400));

      const next = { ...current };
      if (move === 'up') next.row--;
      if (move === 'down') next.row++;
      if (move === 'left') next.col--;
      if (move === 'right') next.col++;

      if (next.row < 0 || next.row >= gridSize || next.col < 0 || next.col >= gridSize || grid[next.row][next.col] === 'obstacle') {
        setFeedback('fail');
        setIsExecuting(false);
        return;
      }

      current = next;
      setPlayerPos(current);
    }

    if (current.row === goalPos.row && current.col === goalPos.col) {
      setFeedback('success');
      setTimeout(() => onComplete(100), 1000);
    } else {
      setFeedback('fail');
    }
    setIsExecuting(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-6 w-full h-full max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">

        {/* Controls and Queue */}
        <div className="flex flex-col gap-8">
          <div className="bg-white/60 p-8 rounded-[2.5rem] border-2 border-white shadow-sm flex flex-col items-center">
            <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.4em] mb-8">Executive Controls</div>
            <div className="grid grid-cols-3 gap-4">
              <div />
              <ControlBtn icon={<ArrowUp />} onClick={() => addMove('up')} />
              <div />
              <ControlBtn icon={<ArrowLeftIcon />} onClick={() => addMove('left')} />
              <ControlBtn icon={<ArrowDown />} onClick={() => addMove('down')} />
              <ControlBtn icon={<ArrowRight />} onClick={() => addMove('right')} />
            </div>

            <div className="mt-12 w-full">
              <div className="flex justify-between mb-4 px-1">
                <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Move Buffer</p>
                <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{moveQueue.length} / {maxMoves}</p>
              </div>
              <div className="flex flex-wrap gap-2 p-4 bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-100 min-h-[4rem]">
                {moveQueue.map((move, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-sm animate-in zoom-in">
                    {move === 'up' && <ArrowUp className="w-4 h-4" />}
                    {move === 'down' && <ArrowDown className="w-4 h-4" />}
                    {move === 'left' && <ArrowLeftIcon className="w-4 h-4" />}
                    {move === 'right' && <ArrowRight className="w-4 h-4" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 w-full mt-8">
              <Button
                onClick={initGame}
                variant="outline"
                className="flex-1 h-14 rounded-2xl border-2 border-blue-100 text-blue-400 font-black uppercase tracking-widest text-xs"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Reset
              </Button>
              <Button
                disabled={isExecuting || moveQueue.length === 0}
                onClick={executePath}
                className="flex-3 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs shadow-xl"
              >
                {isExecuting ? 'Bot is moving...' : 'Go!'}
                {!isExecuting && <Play className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        </div>

        {/* The Grid */}
        <div className="flex flex-col items-center">
          <div className="text-[10px] font-black uppercase text-blue-400 tracking-[0.4em] mb-8">Game Map</div>
          <div
            className="grid gap-2 p-6 bg-white rounded-[3rem] border-4 border-blue-50 shadow-2xl relative"
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
          >
            {grid.map((row, r) => row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={`w-14 h-14 rounded-xl relative flex items-center justify-center transition-all ${cell === 'obstacle' ? 'bg-blue-50/50 border-2 border-white' :
                  cell === 'start' ? 'bg-blue-50' :
                    cell === 'goal' ? 'bg-blue-100' : 'bg-white border-2 border-blue-50'
                  }`}
              >
                {cell === 'start' && <Map className="w-6 h-6 text-blue-400 opacity-30" />}
                {cell === 'goal' && <Target className="w-8 h-8 text-blue-400 animate-pulse" />}
                {cell === 'obstacle' && <div className="w-4 h-4 rounded-full bg-blue-100" />}

                {playerPos.row === r && playerPos.col === c && (
                  <motion.div
                    layoutId="player"
                    className="absolute inset-2 bg-blue-600 rounded-lg shadow-lg z-10 flex items-center justify-center"
                  >
                    <Zap className="w-6 h-6 text-white fill-white" />
                  </motion.div>
                )}

                {feedback === 'fail' && playerPos.row === r && playerPos.col === c && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    className="absolute inset-0 bg-red-400 rounded-full z-20"
                  />
                )}
              </div>
            )))}
          </div>
        </div>

      </div>
    </div>
  );
};

const ControlBtn = ({ icon, onClick }: { icon: React.ReactNode, onClick: () => void }) => (
  <Button
    onClick={onClick}
    className="w-16 h-16 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 border-2 border-blue-200 shadow-sm transition-all active:scale-95"
  >
    {icon}
  </Button>
);

export default PathBuilderGame;