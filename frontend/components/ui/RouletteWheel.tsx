"use client";

import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface RouletteWheelProps {
    isSpinning: boolean;
    targetNumber: number | null;
    onSpinComplete: () => void;
}

// American Roulette Number Sequence (Counter-Clockwise starting from 0)
// This is critical for calculating the correct angle.
// 0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, 00, 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2
const WHEEL_NUMBERS = [
    0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1,
    37, // 37 represents '00'
    27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export function RouletteWheel({ isSpinning, targetNumber, onSpinComplete }: RouletteWheelProps) {
    const controls = useAnimation();

    const getNumberColor = (num: number) => {
        if (num === 0 || num === 37) return '#10b981'; // Emerald 500 (Green)
        if (RED_NUMBERS.includes(num)) return '#ef4444'; // Red 500
        return 'black';
    };

    const getSectorAngle = (index: number) => {
        return (index * 360) / WHEEL_NUMBERS.length;
    };

    useEffect(() => {
        if (isSpinning && targetNumber !== null) {
            // Calculate random rotations for simulation + final target alignment
            // We want the ball to land on top, so the wheel needs to rotate such that the target number is at -90 degrees (top)
            // But visually, let's just rotate the wheel so the number is at the top.
            // SVG coordinate system: 0 degrees is 3 o'clock. Top is 270 degrees or -90 degrees.

            const targetIndex = WHEEL_NUMBERS.indexOf(targetNumber === 37 ? 37 : targetNumber); // 37 is 00
            if (targetIndex === -1) return;

            // Angle of the target number in the wheel setup
            // We draw 0 at angle 0. 
            // The wheel spins, we stop it. 
            // To have target at top (270deg), we need:
            // currentWheelRotation + sectorAngle = 270
            // Rotation = 270 - sectorAngle

            // Note: Each sector is 360/38 degrees.
            const sliceSize = 360 / WHEEL_NUMBERS.length;
            const sectorAndle = targetIndex * sliceSize;

            // Add extra spins (3 to 6 full rotations)
            const extraSpins = 360 * (3 + Math.floor(Math.random() * 3));

            // Calculate final rotation
            // We want the target number to end up at the top indicator position.
            // Since we render the wheel starting 0 at 0 degrees, top is -90 (or 270).
            // Let's assume we want to align to 270 degrees.
            const landingAndle = 270 - sectorAndle;

            const finalRotation = extraSpins + landingAndle;

            // Animate
            controls.start({
                rotate: finalRotation,
                transition: {
                    duration: 3 + Math.random(), // 3-4 seconds spin
                    ease: "circOut", // Slow down at the end
                    type: "tween"
                }
            }).then(() => {
                onSpinComplete();
            });
        }
    }, [isSpinning, targetNumber, controls, onSpinComplete]);

    // Reset rotation if needed between games, but usually we just keep spinning from where we are.
    // For simplicity, we reset smoothly or just add to the current value if we tracked checks. 
    // Since Framer Motion handles "rotate" cumulatively if we don't reset, we might want to track 'lastRotation'.
    // For now, let's just let it spin forward.

    return (
        <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto mb-10 group">
            {/* Outer Rim */}
            <div className="absolute inset-0 rounded-full border-[16px] border-amber-900/40 shadow-2xl z-20 pointer-events-none" />

            {/* The Wheel */}
            <motion.div
                className="w-full h-full rounded-full overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-amber-600/20 bg-slate-950"
                animate={controls}
                initial={{ rotate: 0 }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {WHEEL_NUMBERS.map((num, i) => {
                        const sliceSize = 360 / WHEEL_NUMBERS.length;
                        const angle = i * sliceSize;
                        // Calculate SVG path for arc
                        // Convert polar to cartesian
                        // This is a bit complex for inline, let's simplify visuals using conic-gradient or rotated clear segments.
                        // Actually, SVG 'path' is best for wedges.

                        const startAngle = angle;
                        const endAngle = angle + sliceSize;

                        const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
                        const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
                        const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
                        const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);

                        return (
                            <g key={i} transform={`rotate(${angle} 50 50)`}>
                                {/* Wedge */}
                                <path
                                    d={`M50,50 L100,50 A50,50 0 0,1 ${50 + 50 * Math.cos(Math.PI * sliceSize / 180)},${50 + 50 * Math.sin(Math.PI * sliceSize / 180)} Z`}
                                    fill={getNumberColor(num)}
                                    className="stroke-slate-900 stroke-[0.5]"
                                />
                                {/* Text */}
                                <text
                                    x="88"
                                    y="50"
                                    fill="white"
                                    fontSize="4"
                                    fontWeight="bold"
                                    fontFamily="monospace"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    transform={`rotate(${sliceSize / 2} 50 50) rotate(90 88 50)`}
                                >
                                    {num === 37 ? '00' : num}
                                </text>
                            </g>
                        );
                    })}

                    {/* Inner Circle decorations */}
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#d97706" strokeWidth="0.5" strokeOpacity="0.5" />
                    <circle cx="50" cy="50" r="28" fill="#0f172a" />
                </svg>

                {/* Center Decoration */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 shadow-xl flex items-center justify-center border-4 border-amber-900">
                        <div className="w-12 h-12 rounded-full border-2 border-amber-200/20 bg-amber-800 animate-pulse" />
                    </div>
                </div>
            </motion.div>

            {/* Indicator / Needle */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-lg">
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-yellow-500" />
            </div>

            {/* Shine overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-20" />
        </div>
    );
}
