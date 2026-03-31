import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { GhostPattern } from './GhostPattern';

interface InstructionalOverlayProps {
    isOpen: boolean;
    onComplete: () => void;
    title: string;
    instructions: string[];
    patternType?: 'tap' | 'drag' | 'sequence' | 'breathe' | 'recall';
    // Keeping icon for compatibility but not rendering it as requested
    icon?: React.ReactNode;
}

export const InstructionalOverlay: React.FC<InstructionalOverlayProps> = ({
    isOpen,
    onComplete,
    title,
    instructions,
    patternType = 'tap'
}) => {
    const [timer, setTimer] = useState(5);

    useEffect(() => {
        if (!isOpen) {
            setTimer(5);
            return;
        }

        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && timer <= 0) {
            onComplete();
        }
    }, [isOpen, timer, onComplete]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.9 }}
                    className="fixed top-[80px] right-6 z-[100] max-w-sm w-full"
                >
                    <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(37,99,235,0.15)] border-2 border-blue-50 relative overflow-hidden">
                        {/* Compact Timer Progress */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-50/50">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 5, ease: "linear" }}
                                className="h-full bg-blue-500"
                            />
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onComplete}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors z-20"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex gap-5 items-start mr-6">
                            {/* Ghost Pattern Animation */}
                            <div className="shrink-0 w-16 h-16 flex items-center justify-center bg-blue-50/30 rounded-2xl border border-blue-100/50">
                                <GhostPattern type={patternType} />
                            </div>

                            <div className="flex-1">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Mission Protocol</p>
                                <h2 className="text-sm font-black text-blue-900 uppercase tracking-tight mb-2">
                                    {title}
                                </h2>

                                <div className="space-y-1">
                                    {instructions.slice(0, 2).map((text, i) => (
                                        <p key={i} className="text-[10px] font-bold text-blue-800/70 leading-relaxed italic">
                                            • {text}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-blue-50 flex items-center justify-between">
                            <div className="px-3 py-1 bg-blue-600 rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                                Resuming in {timer}s
                            </div>

                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
