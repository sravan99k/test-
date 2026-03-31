import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Trophy, Target, CheckCircle, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { GAME_LAYOUT, gameViewportClasses, gameCardClasses } from './game-layout-config';

interface UnifiedGameResultsProps {
    score: number;
    maxScore: number;
    accuracy?: number;
    xpEarned: number;
    levelName: string;
    gameId: string;
    isPassed: boolean;
    motivationalText?: string;
    onPlayAgain: () => void;
    onExit: () => void;
}

export const UnifiedGameResults = ({
    score,
    maxScore,
    accuracy,
    xpEarned,
    levelName,
    gameId,
    isPassed,
    motivationalText,
    onPlayAgain,
    onExit
}: UnifiedGameResultsProps) => {
    const calculatedAccuracy = accuracy ?? Math.round((score / Math.max(1, maxScore)) * 100);
    const stars = calculatedAccuracy >= 90 ? 3 : calculatedAccuracy >= 70 ? 2 : calculatedAccuracy >= 50 ? 1 : 0;

    // Simulated Improvement Stats for "Metabolic Path"
    const improvement = Math.floor(Math.random() * 15) + 5;

    return (
        <div
            className={gameViewportClasses}
            style={{ backgroundColor: GAME_LAYOUT.page.background }}
        >
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col flex-1 min-h-0 py-6">
                {/* ========== RESULTS CARD ========== */}
                <div
                    className={`${gameCardClasses} flex-1 min-h-0 flex flex-col overflow-y-auto`}
                    style={{
                        borderColor: GAME_LAYOUT.card.borderColor,
                        borderWidth: GAME_LAYOUT.card.borderWidth,
                        backgroundColor: GAME_LAYOUT.card.background,
                        borderRadius: GAME_LAYOUT.card.radius,
                    }}
                >
                    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
                        {/* Main Trophy */}
                        <div className="relative mb-8">
                            <div
                                className="absolute inset-0 blur-[60px] rounded-full scale-150 opacity-20"
                                style={{ backgroundColor: '#3B82F6' }}
                            />
                            <motion.div
                                initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                className="relative w-28 h-28 bg-white border-8 border-blue-50 rounded-[3rem] flex items-center justify-center text-5xl shadow-2xl"
                            >
                                🏆
                            </motion.div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-lg bg-blue-500"
                            >
                                <CheckCircle className="w-6 h-6 text-white" />
                            </motion.div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-8">
                            <p className="text-blue-400 font-black text-[10px] uppercase tracking-[0.4em] mb-2">Mission Complete</p>
                            <h1 className="text-4xl font-black text-blue-900 tracking-tighter uppercase mb-2">
                                {isPassed ? 'Excellence Achieved' : 'Performance Sync'}
                            </h1>
                            <div className="flex items-center justify-center gap-3">
                                <div className="h-[2px] w-8 bg-blue-100 rounded-full" />
                                <span className="text-blue-500 font-bold text-xs italic">{levelName}</span>
                                <div className="h-[2px] w-8 bg-blue-100 rounded-full" />
                            </div>
                        </div>

                        {/* Stars */}
                        <div className="flex justify-center gap-4 mb-10">
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, y: 10 }}
                                    animate={{ scale: 1, y: 0 }}
                                    transition={{ delay: 0.2 * i }}
                                >
                                    <Star
                                        className={`w-12 h-12 transition-all ${i < stars ? 'fill-blue-500 text-blue-500 filter drop-shadow-[0_0_10px_rgba(56,98,221,0.5)]' : 'text-blue-100'}`}
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* Stats Grid */}
                        <div className="w-full max-w-lg mb-10 space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white rounded-[2rem] p-5 border-2 border-blue-50 shadow-sm flex flex-col items-center text-center">
                                    <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Accuracy</p>
                                    <h4 className="text-2xl font-black text-blue-900">{calculatedAccuracy}%</h4>
                                </div>
                                <div className="bg-white rounded-[2rem] p-5 border-2 border-blue-50 shadow-sm flex flex-col items-center text-center">
                                    <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Score</p>
                                    <h4 className="text-2xl font-black text-blue-600">{score}<span className="text-blue-200 text-sm ml-1">/{maxScore}</span></h4>
                                </div>
                                <div className="bg-blue-600 rounded-[2rem] p-5 shadow-xl shadow-blue-200 flex flex-col items-center text-center border-4 border-blue-400/50">
                                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">XP Gain</p>
                                    <h4 className="text-2xl font-black text-white">+{xpEarned}</h4>
                                </div>
                            </div>

                            {/* Improvement Banner */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 }}
                                className="w-full bg-blue-50/80 backdrop-blur-sm p-4 rounded-[2rem] border-2 border-white flex items-center justify-between px-8"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                        <TrendingUp className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-blue-900 uppercase tracking-tight">Focus Growth</p>
                                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Brain power increased!</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-blue-600">+{improvement}%</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                            <Button
                                variant="outline"
                                onClick={onExit}
                                className="h-14 rounded-[2rem] border-4 border-blue-50 bg-white text-blue-400 font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-50 hover:text-blue-900 transition-all"
                            >
                                MISSION MAP
                            </Button>
                            <Button
                                onClick={onPlayAgain}
                                className="h-14 rounded-[2rem] bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_12px_24px_rgba(56,98,221,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] border-b-8 border-blue-800"
                            >
                                {isPassed ? 'NEXT ZONE' : 'RE-SYNC'}
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
