"use client";

import React from 'react';
import { motion } from 'framer-motion';

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface PlayingCardProps {
    suit?: Suit;
    rank?: Rank;
    faceDown?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
}

export const PlayingCard = React.memo(({
    suit,
    rank,
    faceDown = false,
    size = 'md',
    className = '',
    onClick
}: PlayingCardProps) => {
    const sizeClasses = {
        sm: 'w-16 h-24',
        md: 'w-20 h-32',
        lg: 'w-24 h-36'
    };

    const isRed = suit === 'hearts' || suit === 'diamonds';
    const suitColor = isRed ? '#dc2626' : '#000';

    const getSuitSymbol = (s: Suit) => {
        const symbols = {
            hearts: '♥',
            diamonds: '♦',
            clubs: '♣',
            spades: '♠'
        };
        return symbols[s];
    };

    if (faceDown) {
        return (
            <motion.div
                onClick={onClick}
                whileHover={{ scale: 1.05 }}
                className={`${sizeClasses[size]} ${className} bg-gradient-to-br from-blue-950 to-indigo-950 rounded-lg border-2 border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer flex items-center justify-center relative overflow-hidden`}
            >
                {/* Card Back Pattern */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `repeating-linear-gradient(45deg, rgba(59,130,246,0.5) 0px, rgba(59,130,246,0.5) 4px, transparent 4px, transparent 8px)`,
                    }} />
                    <div className="absolute inset-0" style={{
                        backgroundImage: `repeating-linear-gradient(-45deg, rgba(99,102,241,0.5) 0px, rgba(99,102,241,0.5) 4px, transparent 4px, transparent 8px)`,
                    }} />
                </div>
                <div className="text-4xl opacity-40">🎰</div>
            </motion.div>
        );
    }

    if (!suit || !rank) return null;

    return (
        <motion.div
            onClick={onClick}
            whileHover={{ scale: 1.05, y: -4 }}
            className={`${sizeClasses[size]} ${className} bg-white rounded-lg border-2 border-slate-300 shadow-[0_6px_25px_rgba(0,0,0,0.4)] cursor-pointer flex flex-col relative overflow-hidden`}
        >
            {/* Top Left Corner */}
            <div className="absolute top-1 left-1 flex flex-col items-center" style={{ color: suitColor }}>
                <span className="text-sm font-bold leading-none">{rank}</span>
                <span className="text-lg leading-none">{getSuitSymbol(suit)}</span>
            </div>

            {/* Center Symbol */}
            <div className="flex-1 flex items-center justify-center">
                <span className="text-5xl" style={{ color: suitColor }}>
                    {getSuitSymbol(suit)}
                </span>
            </div>

            {/* Bottom Right Corner (Rotated) */}
            <div className="absolute bottom-1 right-1 flex flex-col items-center rotate-180" style={{ color: suitColor }}>
                <span className="text-sm font-bold leading-none">{rank}</span>
                <span className="text-lg leading-none">{getSuitSymbol(suit)}</span>
            </div>
        </motion.div>
    );
});

PlayingCard.displayName = 'PlayingCard';
