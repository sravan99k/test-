import React from 'react';
import { motion } from 'framer-motion';

interface GhostPatternProps {
    type: 'tap' | 'drag' | 'sequence' | 'breathe' | 'recall';
}

export const GhostPattern: React.FC<GhostPatternProps> = ({ type }) => {
    if (type === 'tap') {
        return (
            <div className="relative w-16 h-16 flex items-center justify-center">
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded-full border-4 border-blue-400"
                />
                <motion.div
                    animate={{
                        scale: [0.8, 1, 0.8],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-4 h-4 rounded-full bg-blue-500"
                />
            </div>
        );
    }

    if (type === 'drag') {
        return (
            <div className="relative w-24 h-12 flex items-center">
                <div className="absolute inset-x-0 h-1 bg-blue-50 rounded-full" />
                <motion.div
                    animate={{
                        x: [0, 80, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-4 h-4 rounded-full bg-blue-500 shadow-lg shadow-blue-200 z-10"
                />
            </div>
        );
    }

    if (type === 'sequence') {
        return (
            <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        animate={{
                            backgroundColor: ['#eff6ff', '#3b82f6', '#eff6ff'],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.4,
                        }}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-black text-white"
                    >
                        {i}
                    </motion.div>
                ))}
            </div>
        );
    }

    if (type === 'breathe') {
        return (
            <div className="relative w-16 h-16 flex items-center justify-center">
                <motion.div
                    animate={{
                        scale: [1, 1.8, 1],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded-[1.5rem] bg-blue-400"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-8 h-8 rounded-[1rem] bg-blue-600 shadow-xl"
                />
            </div>
        );
    }

    if (type === 'recall') {
        return (
            <div className="relative w-16 h-16 flex items-center justify-center">
                <motion.div
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0.8, 1, 1.2],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="w-10 h-10 border-4 border-blue-500/30 rounded-full flex items-center justify-center"
                >
                    <div className="w-4 h-4 bg-blue-500 rounded-sm" />
                </motion.div>
            </div>
        );
    }

    return null;
};
