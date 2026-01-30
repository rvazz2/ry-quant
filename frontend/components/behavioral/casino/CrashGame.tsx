"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, AlertTriangle, Play, StopCircle } from 'lucide-react';
import { triggerConfetti } from '@/lib/confetti';

interface CrashGameProps {
    onAction: (amount: number) => void;
    balance: number;
    setBalance: React.Dispatch<React.SetStateAction<number>>;
    playSound: (type: 'spin' | 'win' | 'loss' | 'deal' | 'click' | 'bell' | 'chip' | 'shatter') => void;
}

export function CrashGame({ onAction, balance, setBalance, playSound }: CrashGameProps) {
    const [gameState, setGameState] = useState<'idle' | 'running' | 'crashed' | 'cashed'>('idle');
    const [multiplier, setMultiplier] = useState(1.00);
    const [cashOutPoint, setCashOutPoint] = useState<number | null>(null);
    const [crashPoint, setCrashPoint] = useState<number | null>(null);
    const [bet, setBet] = useState(10);

    // Animation refs
    const requestRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    const MIN_BET = 10;
    const MAX_BET = 1000;

    const startGame = () => {
        if (balance < bet) return;

        setBalance(prev => prev - bet);
        onAction(-bet);
        setGameState('running');
        setMultiplier(1.00);
        setCashOutPoint(null);
        setCrashPoint(null);
        playSound('chip'); // Start sound
        playSound('spin'); // Rising sound start

        // Determine crash point (The "Rug Pull")
        // Algorithm: inverse exponential distribution with house edge
        // 1% instant crash (1.00x)
        // 4% crash at 1.00-1.10x
        const e = 2 ** 32;
        const h = crypto.getRandomValues(new Uint32Array(1))[0];
        // House edge of 4% integrated into the crash point generation
        const crash = Math.floor(100 * e / (e - h)) / 100;
        // Cap max win to prevent infinite runs (e.g. 5000x) - "Liquidity Crisis"
        const finalCrash = Math.min(crash, 5000) * 0.96; // 4% reduced for house edge

        // Ensure minimum 1.00
        const actualCrash = Math.max(1.00, finalCrash);
        setCrashPoint(actualCrash);

        startTimeRef.current = Date.now();
        requestRef.current = requestAnimationFrame(updateGame);
    };

    const updateGame = () => {
        if (!startTimeRef.current || !crashPoint) return;

        const now = Date.now();
        const elapsed = (now - startTimeRef.current) / 1000; // seconds

        // Growth function: e^t/k
        // We want 2x in about 2-3 seconds?
        // Let's make it increasingly fast.
        const currentMult = Math.pow(Math.E, 0.15 * elapsed);

        if (currentMult >= crashPoint) {
            setMultiplier(crashPoint);
            handleCrash(crashPoint);
        } else {
            setMultiplier(currentMult);
            requestRef.current = requestAnimationFrame(updateGame);
        }
    };

    const handleCrash = (finalValue: number) => {
        cancelAnimationFrame(requestRef.current!);
        setGameState('crashed');
        playSound('shatter'); // Crash sound
        playSound('loss');
    };

    const cashOut = () => {
        if (gameState !== 'running') return;

        cancelAnimationFrame(requestRef.current!);
        const winAmount = bet * multiplier;
        setBalance(prev => prev + winAmount);
        onAction(winAmount - bet); // Net profit
        setCashOutPoint(multiplier);
        setGameState('cashed');
        playSound('win');
        playSound('bell');
        triggerConfetti('win');
    };

    useEffect(() => {
        return () => cancelAnimationFrame(requestRef.current!);
    }, []);

    return (
        <div className="max-w-xl w-full mx-auto">
            <div className="relative bg-slate-950 border border-slate-800 rounded-[2.5rem] p-8 overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />

                {/* Game Screen */}
                <div className="relative z-10 h-64 flex flex-col items-center justify-center mb-8">
                    <AnimatePresence>
                        {gameState === 'crashed' && (
                            <motion.div
                                initial={{ scale: 2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <div className="text-8xl font-black text-rose-600/20 uppercase tracking-widest rotate-12">CRASHED</div>
                            </motion.div>
                        )}
                        {gameState === 'cashed' && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <div className="text-6xl font-black text-green-500/20 uppercase tracking-widest -rotate-12">CASHED OUT</div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={`text-7xl md:text-8xl font-black font-mono tracking-tighter transition-colors duration-100 ${gameState === 'crashed' ? 'text-rose-500' :
                        gameState === 'cashed' ? 'text-green-500' :
                            'text-white'
                        }`}>
                        {multiplier.toFixed(2)}x
                    </div>

                    {gameState === 'running' && (
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-[0.5em] mt-2 animate-pulse">
                            Market Bubble Inflating...
                        </div>
                    )}

                    {gameState === 'crashed' && (
                        <div className="text-xs font-bold text-rose-500 uppercase tracking-[0.5em] mt-2">
                            Market Correction
                        </div>
                    )}

                    {gameState === 'cashed' && (
                        <div className="text-2xl font-black text-green-400 mt-4">
                            +${(bet * (cashOutPoint || 0)).toFixed(0)}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="relative z-10 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 bg-slate-900/50 rounded-2xl p-4 border border-white/5">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Wager</div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setBet(Math.max(MIN_BET, bet - 10))}
                                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold disabled:opacity-50"
                                disabled={gameState === 'running'}
                            >
                                -
                            </button>
                            <div className="flex-1 text-center font-mono text-2xl font-bold text-white">
                                ${bet}
                            </div>
                            <button
                                onClick={() => setBet(Math.min(MAX_BET, bet + 10))}
                                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold disabled:opacity-50"
                                disabled={gameState === 'running'}
                            >
                                +
                            </button>
                        </div>
                        <div className="flex justify-between mt-2 px-1">
                            <button onClick={() => setBet(Math.floor(balance))} className="text-[10px] font-bold text-yellow-500/60 hover:text-yellow-500 uppercase">Max</button>
                            <button onClick={() => setBet(Math.max(MIN_BET, bet * 2))} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase">2x</button>
                        </div>
                    </div>

                    <div className="flex-1">
                        {gameState === 'running' ? (
                            <button
                                onClick={cashOut}
                                className="w-full h-full min-h-[80px] bg-green-500 hover:bg-green-400 text-black font-black text-2xl uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <StopCircle size={28} />
                                Cash Out
                            </button>
                        ) : (
                            <button
                                onClick={startGame}
                                disabled={balance < bet}
                                className="w-full h-full min-h-[80px] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-2xl uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Play size={28} />
                                Place Bet
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="text-rose-500 flex-shrink-0" size={18} />
                        <p className="text-xs text-rose-200/80 leading-relaxed italic">
                            <strong>The Greater Fool Theory:</strong> In a bubble, prices rise not because of intrinsic value, but because people believe they can sell to a "greater fool" later. The price ALWAYS crashes. The only winning move is to exit early.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
