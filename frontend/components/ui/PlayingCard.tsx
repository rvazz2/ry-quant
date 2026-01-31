"use client";

import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useCasinoSettings } from '@/contexts/CasinoSettingsContext';

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
    const { deckStyle } = useCasinoSettings();
    const isLuxury = deckStyle === 'luxury';
    const isJungle = deckStyle === 'jungle';
    const isPremium = isLuxury || isJungle;

    const sizeClasses = {
        sm: 'w-16 h-24',
        md: 'w-20 h-32',
        lg: 'w-24 h-36'
    };

    const isRed = suit === 'hearts' || suit === 'diamonds';
    const suitColor = isPremium
        ? (isRed ? '#ef4444' : '#fbbf24') // Red or Gold for Luxury/Jungle
        : (isRed ? '#dc2626' : '#000');   // Red or Black for Classic

    const getSuitSymbol = (s: Suit) => {
        const symbols = {
            hearts: '♥',
            diamonds: '♦',
            clubs: '♣',
            spades: '♠'
        };
        return symbols[s];
    };

    // 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [15, -15]);
    const rotateY = useTransform(x, [-100, 100], [-15, 15]);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const xPct = (mouseX / width - 0.5) * 200;
        const yPct = (mouseY / height - 0.5) * 200;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    if (faceDown) {
        return (
            <motion.div
                onClick={onClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                    perspective: 1000
                }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                className={`${sizeClasses[size]} ${className} rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer flex items-center justify-center relative overflow-hidden`}
            >
                {/* Background: Classic Gradient or Luxury Texture */}
                {isLuxury ? (
                    <div className="absolute inset-0 bg-slate-950 border-2 border-yellow-600/50">
                        <div className="absolute inset-0 bg-[url('/cards/luxury.png')] bg-cover bg-center opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
                    </div>
                ) : isJungle ? (
                    <div className="absolute inset-0 bg-slate-950 border-2 border-emerald-600/50">
                        <div className="absolute inset-0 bg-[url('/cards/jungle.jpg')] bg-cover bg-center" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-950 to-indigo-950 border-2 border-white/20">
                        {/* Card Back Pattern for Classic */}
                        <div className="absolute inset-0 opacity-30">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `repeating-linear-gradient(45deg, rgba(59,130,246,0.5) 0px, rgba(59,130,246,0.5) 4px, transparent 4px, transparent 8px)`,
                            }} />
                            <div className="absolute inset-0" style={{
                                backgroundImage: `repeating-linear-gradient(-45deg, rgba(99,102,241,0.5) 0px, rgba(99,102,241,0.5) 4px, transparent 4px, transparent 8px)`,
                            }} />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-4xl opacity-40 animate-pulse">🎰</div>
                        </div>
                    </div>
                )}

                {/* Glossy Sheen Overlay (Shared) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
        );
    }

    if (!suit || !rank) return null;

    return (
        <motion.div
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                perspective: 1000
            }}
            whileHover={{ scale: 1.1, y: -10, zIndex: 100, transition: { duration: 0.2 } }}
            className={`${sizeClasses[size]} ${className} ${isPremium ? 'bg-slate-900 border-yellow-600/40 shadow-yellow-900/20' : 'bg-white border-slate-300'} rounded-lg border-2 shadow-[0_6px_25px_rgba(0,0,0,0.4)] cursor-pointer flex flex-col relative overflow-hidden transition-all duration-200 ease-out`}
        >
            {/* Glossy Sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-20" />

            {/* Top Left Corner */}
            <div className="absolute top-1 left-1 flex flex-col items-center z-10" style={{ color: suitColor }}>
                <span className="text-sm font-bold leading-none">{rank}</span>
                <span className="text-lg leading-none">{getSuitSymbol(suit)}</span>
            </div>

            {/* Center Symbol */}
            <div className="flex-1 flex items-center justify-center z-10">
                <span className="text-5xl drop-shadow-sm" style={{ color: suitColor }}>
                    {getSuitSymbol(suit)}
                </span>
            </div>

            {/* Bottom Right Corner (Rotated) */}
            <div className="absolute bottom-1 right-1 flex flex-col items-center rotate-180 z-10" style={{ color: suitColor }}>
                <span className="text-sm font-bold leading-none">{rank}</span>
                <span className="text-lg leading-none">{getSuitSymbol(suit)}</span>
            </div>
        </motion.div>
    );
});

PlayingCard.displayName = 'PlayingCard';
