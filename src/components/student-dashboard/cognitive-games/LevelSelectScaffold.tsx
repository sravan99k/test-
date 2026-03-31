import React from 'react';
import { ArrowLeft, Trophy, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GAME_LAYOUT } from './shared/game-layout-config';

interface LevelSelectScaffoldProps {
  title: string;

  onBack: () => void;
  totalXP: number;
  completedLevelsCount: number;
  totalLevels: number;
  children: React.ReactNode;
}

/**
 * Shared layout shell for level-select screens across games.
 * The whole page scrolls naturally (levels can be very tall).
 * Consistent with game-layout-config colors and spacing.
 */
const LevelSelectScaffold: React.FC<LevelSelectScaffoldProps> = ({
  title,

  onBack,
  totalXP,
  completedLevelsCount,
  totalLevels,
  children,
}) => {
  return (
    <div
      className="w-full flex justify-center py-4 font-sans relative text-blue-900"
      style={{ backgroundColor: GAME_LAYOUT.page.background }}
    >
      {/* Background Decorative Elements */}
      <div
        className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#3862DD 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="w-full max-w-4xl px-4 sm:px-6 flex flex-col relative z-10 pt-4 pb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-blue-900 tracking-tighter uppercase">{title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {/* Status dot removed */}
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onBack}
            className="h-12 px-6 rounded-2xl border-4 border-blue-50 bg-white text-blue-500 font-black hover:bg-blue-50 hover:text-blue-900 transition-all text-xs flex items-center gap-3 shadow-sm uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>

        {/* Compact Stats Row */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-10">
          <div
            className="rounded-[2.5rem] p-5 shadow-[0_8px_24px_rgba(56,98,221,0.08)] backdrop-blur-sm relative overflow-hidden flex items-center gap-4 border-2 border-white"
            style={{ backgroundColor: GAME_LAYOUT.card.background }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0 bg-blue-600">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Total Points</p>
              <h2 className="text-2xl font-black text-blue-900 leading-tight">{totalXP}</h2>
            </div>
          </div>

          <div
            className="rounded-[2.5rem] p-5 shadow-[0_8px_24px_rgba(56,98,221,0.08)] backdrop-blur-sm flex items-center gap-4 border-2 border-white"
            style={{ backgroundColor: GAME_LAYOUT.card.background }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0 bg-blue-500">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Levels Completed</p>
              <h2 className="text-2xl font-black text-blue-900 leading-tight">
                {completedLevelsCount}
                <span className="text-blue-200 text-sm italic ml-1 font-bold">/ {totalLevels}</span>
              </h2>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};

export default LevelSelectScaffold;
