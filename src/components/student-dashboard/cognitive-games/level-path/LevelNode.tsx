import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Lock, Target, Zap, LayoutGrid, Brain, Wind, BookOpen, Timer } from 'lucide-react';

export interface LevelNodeData {
  id: number;
  name: string;
  gridSize?: number;
  patternLength?: number;
  xpReward: number;
  icon?: React.ReactNode;
  metadata?: {
    trials?: number;
    description?: string;
    [key: string]: any;
  };
}

interface LevelNodeProps {
  level: LevelNodeData;
  index: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  bestScore?: number;
  onSelect: () => void;
  onStart: () => void;
}

export const LevelNode: React.FC<LevelNodeProps> = ({
  level,
  isUnlocked,
  isCompleted,
  isCurrent,
  bestScore,
  onSelect,
  onStart,
}) => {
  return (
    <div className="flex flex-col items-center group relative z-10">
      {/* Mastery Badge */}
      {isCompleted && bestScore !== undefined && (
        <div className="absolute -top-3 -right-2 z-20">
          <div className="bg-blue-600 text-[8px] font-black text-white px-2 py-0.5 rounded-full shadow-lg border-2 border-white scale-110">
            {bestScore}%
          </div>
        </div>
      )}

      {/* Glow ring behind node */}
      <div className={`
        absolute w-24 h-24 rounded-full transition-all duration-500
        ${isCompleted ? 'bg-blue-500/20 shadow-[0_0_30px_rgba(56,98,221,0.3)]' :
          isCurrent ? 'bg-blue-400/15 shadow-[0_0_25px_rgba(56,98,221,0.25)]' :
            'bg-blue-50/30'}
      `} />

      {/* Level Node circle */}
      <button
        onClick={() => isUnlocked && onSelect()}
        className={`
          relative w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 border-4 border-white
          ${isCompleted ? 'bg-blue-600 shadow-xl shadow-blue-100' :
            isCurrent ? 'bg-white shadow-xl shadow-blue-200 ring-8 ring-blue-50' :
              'bg-blue-50/60 shadow-md'}
          ${isUnlocked ? 'hover:scale-110 cursor-pointer active:scale-95' : 'cursor-not-allowed opacity-60'}
        `}
      >
        {isCompleted ? (
          <CheckCircle className="w-12 h-12 text-white" />
        ) : isCurrent ? (
          <Target className="w-12 h-12 text-blue-600" />
        ) : (
          <Lock className="w-10 h-10 text-blue-200" />
        )}
      </button>

      {/* Level Name & Info */}
      <div className="mt-6 text-center max-w-[160px]">
        <h3 className={`text-sm font-black tracking-tight mb-2 uppercase ${isUnlocked ? 'text-blue-900' : 'text-blue-200'}`}>
          {level.name}
        </h3>

        {isUnlocked && (
          <div className="flex items-center justify-center min-h-[22px] py-1.5 px-3 bg-blue-50/80 rounded-full border-2 border-white mb-6 scale-90 backdrop-blur-sm divide-x divide-blue-100 shadow-sm">
            <div className="flex items-center gap-1.5 px-3 shrink-0">
              <Zap className="w-3 h-3 text-blue-500 fill-current" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-tight whitespace-nowrap">{level.xpReward} XP</span>
            </div>

            {(level.gridSize !== undefined || level.metadata?.sequenceLength !== undefined || level.metadata?.wordCount !== undefined || level.metadata?.patternName !== undefined || level.metadata?.events !== undefined) && (
              <div className="flex items-center gap-1.5 px-3 shrink-0">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-tight whitespace-nowrap">
                  {level.gridSize !== undefined ? `${level.gridSize}×${level.gridSize}` :
                    level.metadata?.sequenceLength !== undefined ? `${level.metadata?.sequenceLength} Digits` :
                      level.metadata?.patternName !== undefined ? level.metadata?.patternName :
                        level.metadata?.wordCount !== undefined ? `${level.metadata?.wordCount} Words` :
                          level.metadata?.events !== undefined ? `${level.metadata?.events} Events` :
                            null}
                </span>
              </div>
            )}
          </div>
        )}

        {isCurrent && isUnlocked && (
          <Button
            onClick={(e) => { e.stopPropagation(); onStart(); }}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-[10px] shadow-[0_6px_0_0_#1e40af] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest"
          >
            ENGAGE ZONE
          </Button>
        )}
      </div>
    </div>
  );
};