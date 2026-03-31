import React, { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { GAME_LAYOUT, gameViewportClasses, gameCardClasses } from './game-layout-config';

interface GameWorkspaceProps {
    title: string;
    subtitle?: string;
    level?: number | string;
    currentRound?: number;
    totalRounds?: number;
    timeLeft?: number;
    maxTime?: number;
    score?: number;
    maxScore?: number;
    streak?: number;
    lives?: number;
    icon?: React.ReactNode;
    children: ReactNode;
    showProgress?: boolean;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const GameWorkspace = ({
    title,
    subtitle,
    level,
    currentRound,
    totalRounds,
    timeLeft,
    maxTime,
    score,
    maxScore,
    streak,
    lives,
    icon,
    children,
    showProgress = true
}: GameWorkspaceProps) => {
    const progressValue = currentRound && totalRounds
        ? ((currentRound) / totalRounds) * 100
        : timeLeft && maxTime
            ? (timeLeft / maxTime) * 100
            : 0;

    return (
        <div
            className={gameViewportClasses}
            style={{ backgroundColor: GAME_LAYOUT.page.background }}
        >
            {/* Full-height inner wrapper */}
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col flex-1 min-h-0 py-4">

                {/* Header Section — Minimalist & Receding */}
                <div className="flex items-center justify-between mb-4 w-full shrink-0 opacity-40 hover:opacity-100 transition-opacity duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-[0_8px_16px_rgba(56,98,221,0.2)]">
                            {icon || <Brain className="w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-blue-900 tracking-tight leading-tight uppercase">{title}</h2>
                            {subtitle && <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em]">{subtitle}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        {level !== undefined && (
                            <Badge className="bg-blue-50 text-blue-500 border-none font-black px-3 py-1 rounded-lg uppercase text-[8px]">
                                Zone {level}
                            </Badge>
                        )}
                        {(currentRound !== undefined && totalRounds !== undefined) && (
                            <Badge className="bg-blue-500 text-white border-none font-black px-3 py-1 rounded-lg uppercase text-[8px] shadow-sm">
                                {currentRound}/{totalRounds}
                            </Badge>
                        )}
                        {timeLeft !== undefined && (
                            <Badge className={`border-none font-black px-3 py-1 rounded-lg uppercase text-[8px] ${timeLeft < 10 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                ⏱️ {formatTime(timeLeft)}
                            </Badge>
                        )}
                        {lives !== undefined && (
                            <Badge className="bg-blue-50 text-blue-600 border-none font-black px-3 py-1 rounded-lg uppercase text-[8px]">
                                ♥ {lives}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Progress Bar — Integrated & Slim */}
                {showProgress && (currentRound !== undefined || timeLeft !== undefined) && (
                    <div className="w-full bg-blue-50 rounded-full h-1 mb-4 overflow-hidden shrink-0">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressValue}%` }}
                            className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(56,98,221,0.3)]"
                        />
                    </div>
                )}

                {/* ========== MAIN GAME CARD ========== */}
                <div
                    className={`${gameCardClasses} flex-1 min-h-0 flex flex-col overflow-hidden`}
                    style={{
                        borderColor: GAME_LAYOUT.card.borderColor,
                        borderWidth: GAME_LAYOUT.card.borderWidth,
                        backgroundColor: GAME_LAYOUT.card.background,
                        borderRadius: GAME_LAYOUT.card.radius,
                    }}
                >
                    <div className="flex-1 min-h-0 flex flex-col items-center justify-center overflow-y-auto p-4 sm:p-8">
                        {children}
                    </div>
                </div>

                {/* Footer Stats — Receding */}
                {(score !== undefined || streak !== undefined) && (
                    <div className="w-full max-w-sm mx-auto mt-4 shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="bg-white rounded-[2rem] p-3 border-2 border-blue-50 shadow-sm flex items-center justify-around">
                            {score !== undefined && (
                                <div className="text-center flex-1">
                                    <p className="text-[7px] font-black text-blue-300 uppercase tracking-[0.3em] mb-0.5">SCORE</p>
                                    <h3 className="text-lg font-black text-blue-900">
                                        {score}
                                        {maxScore !== undefined && <span className="text-blue-100 text-xs ml-1 font-bold">/ {maxScore}</span>}
                                    </h3>
                                </div>
                            )}
                            {score !== undefined && streak !== undefined && (
                                <div className="w-[1px] h-6 bg-blue-50" />
                            )}
                            {streak !== undefined && (
                                <div className="text-center flex-1">
                                    <p className="text-[7px] font-black text-blue-400 uppercase tracking-[0.3em] mb-0.5">STREAK</p>
                                    <h4 className="text-lg font-black text-blue-600 flex items-center justify-center gap-1">
                                        🧿 {streak}
                                    </h4>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
