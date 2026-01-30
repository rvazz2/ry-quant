"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown } from 'lucide-react';
import { useCasinoSFX } from '@/hooks/useCasinoSFX';
import { triggerConfetti } from '@/lib/confetti';

interface PlinkoGameProps {
    onAction: (amount: number) => void;
    balance: number;
    setBalance: React.Dispatch<React.SetStateAction<number>>;
}

const ROWS_OPTIONS = [8, 10, 12, 14, 16];
const RISK_OPTIONS = ['Low', 'Medium', 'High'] as const;

type RiskLevel = typeof RISK_OPTIONS[number];

// Multipliers - Simplified presets (Symmetric)
const MULTIPLIERS: Record<RiskLevel, Record<number, number[]>> = {
    'Low': {
        8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
        16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16] // approximated
    },
    'Medium': {
        8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
        16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110]
    },
    'High': {
        8: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
        16: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000]
    }
};

// Fallback generator if exact row count not in preset
const getMultipliers = (rows: number, risk: RiskLevel) => {
    if (MULTIPLIERS[risk][rows]) return MULTIPLIERS[risk][rows];

    // Generate placeholder if specific row count config missing (simplified for demo)
    // Real implementation would have exact tables for 8-16
    const base = MULTIPLIERS[risk][16] || MULTIPLIERS[risk][8];
    // Interpolate or just return a default set
    return base.slice(0, rows + 1);
};

export function PlinkoGame({ onAction, balance, setBalance }: PlinkoGameProps) {
    const { playSound } = useCasinoSFX();
    const [rows, setRows] = useState(16);
    const [risk, setRisk] = useState<RiskLevel>('Medium');
    const [bet, setBet] = useState(10);
    const [balls, setBalls] = useState<{ id: number; path: number[] }[]>([]); // path = array of -1 (left) or 1 (right)
    const [history, setHistory] = useState<number[]>([]);

    const multipliers = getMultipliers(rows, risk);
    const ballIdCounter = useRef(0);

    const dropBall = () => {
        if (balance < bet) return;

        setBalance(prev => prev - bet);
        onAction(-bet);
        playSound('chip'); // Drop sound

        const path: number[] = [];
        for (let i = 0; i < rows; i++) {
            // Random -0.5 to 0.5 offset per row? No, strictly left/right visual
            path.push(Math.random() > 0.5 ? 1 : -1);
        }

        const newBall = { id: ballIdCounter.current++, path };
        setBalls(prev => [...prev, newBall]);
    };

    const handleBallFinish = (ballId: number, multiplierIndex: number) => {
        const multiplier = multipliers[multiplierIndex];
        const payout = bet * multiplier;

        setBalance(prev => prev + payout);
        onAction(payout - bet);
        setHistory(prev => [multiplier, ...prev].slice(0, 5));

        // Remove ball
        setBalls(prev => prev.filter(b => b.id !== ballId));

        if (multiplier >= 10) {
            playSound('bell');
            triggerConfetti('win', 1000);
        } else if (multiplier > 1) {
            playSound('win');
        } else {
            // plink sound?
            playSound('click');
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 p-6 bg-[#0f172a] rounded-[2.5rem] border-4 border-slate-800 shadow-2xl relative overflow-hidden">

            {/* Sidebar */}
            <div className="w-full md:w-80 flex flex-col gap-6 bg-slate-900/50 p-6 rounded-3xl border border-white/5 relative z-10 h-fit">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bet Amount</label>
                        <span className="text-slate-200 font-mono">${bet}</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setBet(Math.max(1, bet - 10))} className="flex-1 py-3 bg-slate-800 rounded-xl hover:bg-slate-700 font-bold text-slate-300">-</button>
                        <button onClick={() => setBet(Math.min(1000, bet + 10))} className="flex-1 py-3 bg-slate-800 rounded-xl hover:bg-slate-700 font-bold text-slate-300">+</button>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risk Level</label>
                    <div className="flex bg-slate-800 rounded-xl p-1">
                        {RISK_OPTIONS.map(r => (
                            <button
                                key={r}
                                onClick={() => setRisk(r)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${risk === r ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rows: <span className="text-indigo-400">{rows}</span></label>
                    <input
                        type="range"
                        min="8"
                        max="16"
                        step="1"
                        value={rows}
                        onChange={(e) => setRows(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <button
                    onClick={dropBall}
                    disabled={balance < bet}
                    className="w-full py-6 bg-green-500 hover:bg-green-400 text-slate-950 font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all active:scale-95 disabled:opacity-50 mt-4"
                >
                    Drop Ball
                </button>
            </div>

            {/* Game Area */}
            <div className="flex-1 bg-slate-950/50 rounded-3xl border border-slate-800 relative min-h-[600px] flex flex-col items-center pt-8 overflow-hidden">

                {/* Pyramid */}
                <div className="relative z-10 mb-8" style={{ width: '100%', maxWidth: '600px', height: '500px' }}>

                    {/* Pins */}
                    {Array.from({ length: rows }).map((_, r) => (
                        <div key={r} className="flex justify-center gap-4 mb-4" style={{ marginBottom: `${400 / rows}px` }}>
                            {Array.from({ length: r + 3 }).map((_, c) => (
                                <div key={c} className="w-1.5 h-1.5 bg-white rounded-full opacity-20 shadow-[0_0_5px_white]" />
                            ))}
                        </div>
                    ))}

                    {/* Balls */}
                    <AnimatePresence>
                        {balls.map(ball => (
                            <PlinkoBall
                                key={ball.id}
                                path={ball.path}
                                rows={rows}
                                onFinish={() => {
                                    // Calculate final index based on path (sum of 'rights')
                                    // path consists of -1 (left) and 1 (right)
                                    // But actually, for indices, going right increments index.
                                    // The starting index at row N (buckets) is... 0 to N.
                                    // Let's assume index 0 is far left.
                                    // Each '1' (right) adds 1 to index. Each '-1' (left) keeps index same? (if moving from node to node)
                                    // In a triangle: 
                                    // Row 0: 1 pin
                                    // Row 1: 2 pins
                                    // ...
                                    // Buckets at bottom: rows + 1 buckets.
                                    // If we go right every time, we hit bucket [rows]. If left every time, bucket [0].
                                    // So index = count of 'right' moves.

                                    const rightMoves = ball.path.filter(p => p === 1).length;
                                    handleBallFinish(ball.id, rightMoves);
                                }}
                            />
                        ))}
                    </AnimatePresence>

                    {/* Buckets */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 px-4">
                        {multipliers.map((m, i) => {
                            // Color based on multiplier val relative to risk
                            let colorClass = 'bg-slate-800 text-slate-500';
                            if (m >= 10) colorClass = 'bg-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.5)] text-white';
                            else if (m >= 2) colorClass = 'bg-orange-500 text-black';
                            else if (m >= 1) colorClass = 'bg-yellow-500 text-black';
                            else colorClass = 'bg-slate-700 text-slate-400';

                            return (
                                <div key={i} className={`flex-1 h-10 flex items-center justify-center text-[10px] font-bold rounded-md transition-all ${colorClass}`}>
                                    {m}x
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Subcomponent for the animation
function PlinkoBall({ path, rows, onFinish }: { path: number[], rows: number, onFinish: () => void }) {
    // Generate keyframes based on path
    // We visualize it top-down. 
    // Simplified physics: pure chaos simulation or fixed path? Fixed for "Provably Fair" feel usually (result determined at start)
    // We'll animate X/Y coordinates.

    // Assume container width 600px.
    // Start X = 0 (center relative).
    // Each step: Y increases by (height / rows). X changes by (width / rows / 2) * direction.

    // IMPORTANT: The visual pins are spaced differently.
    // Let's approximate.

    const [style, setStyle] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Animate
        const duration = 500 * (rows / 8); // ms
        const steps = path.length;

        let startTime: number;

        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const progress = (time - startTime) / duration;

            if (progress >= 1) {
                onFinish();
                return;
            }

            // Current step index
            const currentStep = Math.floor(progress * steps);
            const stepProgress = (progress * steps) - currentStep;

            // Calculate Position
            // Y is simple linear (gravity) + bounce effect? Linear is sufficient for CSS
            const y = progress * 450; // 450px total drop height

            // X accumulation
            // At Step index K, X is Sum(path[0..K-1]) * spacing + path[K] * spacing * stepProgress
            // Basically drift.

            // Let's pre-calculate exact X positions for each row center.
            let x = 0;
            const rowHeight = 450 / rows;
            const xStepBase = 300 / rows; // Max width dispersion

            for (let i = 0; i < currentStep; i++) {
                x += path[i] * (xStepBase / 2) * (Math.random() * 0.4 + 0.8); // Add slight jitter
            }
            // Interpolate current step
            if (path[currentStep]) {
                x += path[currentStep] * (xStepBase / 2) * stepProgress;
            }

            setStyle({ x, y });
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);

    }, []);

    return (
        <motion.div
            className="absolute top-0 left-1/2 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_red] z-50"
            style={{
                x: style.x,
                y: style.y,
                marginLeft: '-6px'
            }}
        />
    );
}

