"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface PokerChipProps {
    value: 5 | 10 | 25 | 100 | 500;
    count?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
}

export const PokerChip = React.memo(({
    value,
    count = 1,
    size = 'md',
    className = '',
    onClick
}: PokerChipProps) => {
    const sizeMap = {
        sm: 'w-10 h-10',
        md: 'w-14 h-14',
        lg: 'w-18 h-18'
    };

    const chipColors = {
        5: { bg: 'bg-red-600', border: 'border-red-800', stripe: 'bg-white' },
        10: { bg: 'bg-blue-600', border: 'border-blue-900', stripe: 'bg-white' },
        25: { bg: 'bg-green-600', border: 'border-green-900', stripe: 'bg-white' },
        100: { bg: 'bg-slate-900', border: 'border-slate-700', stripe: 'bg-white' },
        500: { bg: 'bg-purple-600', border: 'border-purple-900', stripe: 'bg-yellow-400' }
    };

    const config = chipColors[value];

    return (
        <div className={`relative ${className}`}>
            {[...Array(count)].map((_, i) => (
                <motion.div
                    key={i}
                    onClick={onClick}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`absolute ${sizeMap[size]} ${config.bg} rounded-full border-4 ${config.border} shadow-[0_4px_12px_rgba(0,0,0,0.6)] cursor-pointer flex items-center justify-center`}
                    style={{
                        top: `-${i * 3}px`,
                        left: 0,
                        zIndex: count - i
                    }}
                >
                    {/* Chip Stripes */}
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                        {[0, 60, 120, 180, 240, 300].map((deg) => (
                            <div
                                key={deg}
                                className={`absolute ${config.stripe} w-1 h-full top-0 left-1/2 -translate-x-1/2 opacity-40`}
                                style={{
                                    transform: `translateX(-50%) rotate(${deg}deg)`,
                                    transformOrigin: 'center center'
                                }}
                            />
                        ))}
                    </div>

                    {/* Value */}
                    <div className="relative z-10 text-white font-black text-xs drop-shadow-md">
                        ${value}
                    </div>
                </motion.div>
            ))}
        </div>
    );
});

PokerChip.displayName = 'PokerChip';
