"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Play, Square, RotateCw, Settings, Info } from 'lucide-react';
import { triggerConfetti } from '@/lib/confetti';
import { toast } from 'sonner';

interface SlotsGameProps {
    onAction: (amount: number) => void;
    balance: number;
    setBalance: React.Dispatch<React.SetStateAction<number>>;
    playSound: (type: 'spin' | 'win' | 'loss' | 'deal' | 'click' | 'bell' | 'chip' | 'shatter') => void;
}

const SYMBOLS = [
    { char: '🍒', color: 'text-red-500', value: 2 },
    { char: '🍋', color: 'text-yellow-400', value: 3 },
    { char: '🍊', color: 'text-orange-500', value: 4 },
    { char: '🍇', color: 'text-purple-500', value: 5 },
    { char: '💎', color: 'text-cyan-400', value: 10 },
    { char: '7️⃣', color: 'text-red-600', value: 25 },
    { char: '🎰', color: 'text-white', value: 100 },
];

export function SlotsGame({ onAction, balance, setBalance, playSound }: SlotsGameProps) {
    const [reels, setReels] = useState([SYMBOLS[6], SYMBOLS[6], SYMBOLS[6]]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState('');
    const [autoSpin, setAutoSpin] = useState(false);
    const [jackpot, setJackpot] = useState(10000);
    const [turbo, setTurbo] = useState(false);
    const [streak, setStreak] = useState(0);

    const betSize = 10;
    const autoSpinRef = useRef<NodeJS.Timeout | null>(null);

    // Fake progressive jackpot ticker
    useEffect(() => {
        const interval = setInterval(() => {
            setJackpot(prev => prev + Math.floor(Math.random() * 3));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Auto Spin Logic
    useEffect(() => {
        if (autoSpin && !isSpinning && balance >= betSize) {
            autoSpinRef.current = setTimeout(() => {
                spin();
            }, turbo ? 500 : 1500);
        } else if (balance < betSize && autoSpin) {
            setAutoSpin(false);
            toast.error("Auto Spin Paused: Insufficient Funds");
        }
        return () => {
            if (autoSpinRef.current) clearTimeout(autoSpinRef.current);
        };
    }, [autoSpin, isSpinning, balance, turbo]);

    const spin = useCallback(async () => {
        if (balance < betSize || isSpinning) return;

        setIsSpinning(true);
        setResult('');
        setBalance(b => b - betSize);
        onAction(-betSize);
        playSound('spin');

        // Determine Outcome (Rigged Engine)
        const rand = Math.random();
        let finalReels = [];
        let outcome = 'loss';
        let winAmount = 0;

        if (rand < 0.12) { // 12% Win Rate
            outcome = 'win';
            const sym = SYMBOLS[Math.floor(Math.random() * (SYMBOLS.length - 1))]; // Exclude jackpot often
            finalReels = [sym, sym, sym];
            winAmount = betSize * sym.value;
        } else if (rand < 0.50) { // 38% "Near Miss" (High frequency)
            outcome = 'near-miss';
            const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            // 2 matching, 1 different
            const other = SYMBOLS.filter(s => s.char !== sym.char)[Math.floor(Math.random() * (SYMBOLS.length - 1))];
            finalReels = [sym, sym, other];
        } else {
            outcome = 'loss';
            // Completely random junk
            finalReels = [
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
                SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
            ];
            // Ensure no accidental win
            if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
                finalReels[2] = SYMBOLS.find(s => s.char !== finalReels[0].char)!;
            }
        }

        // Animation Sequence
        // We use a state object or just timeouts to simulate reel stops
        const baseDelay = turbo ? 100 : 500;

        // Reel 1 stop
        await new Promise(r => setTimeout(r, baseDelay));
        setReels(prev => [finalReels[0], prev[1], prev[2]]);
        playSound('click');

        // Reel 2 stop
        await new Promise(r => setTimeout(r, baseDelay));
        setReels(prev => [finalReels[0], finalReels[1], prev[2]]);
        playSound('click');

        // Reel 3 stop (Anticipation if Near Miss match on first 2)
        if (finalReels[0].char === finalReels[1].char && !turbo) {
            // Suspense delay
            await new Promise(r => setTimeout(r, 800));
        } else {
            await new Promise(r => setTimeout(r, baseDelay));
        }

        setReels(finalReels);

        if (outcome === 'win') {
            setResult(`WIN! +$${winAmount}`);
            setBalance(b => b + winAmount);
            onAction(winAmount - betSize); // Net positive for user, but onAction tracks activity
            playSound('win');
            if (winAmount >= 100) {
                playSound('bell');
                triggerConfetti('jackpot');
            } else {
                triggerConfetti('win');
            }
            setStreak(s => s + 1);
        } else if (outcome === 'near-miss') {
            setResult('SO CLOSE!');
            playSound('loss'); // Or specific tease sound
            setStreak(0);
        } else {
            setResult('');
            playSound('loss');
            setStreak(0);
        }

        setIsSpinning(false);
    }, [balance, betSize, isSpinning, onAction, setBalance, playSound, turbo]);

    return (
        <div className="max-w-xl w-full mx-auto">
            {/* Machine Header */}
            <div className="bg-slate-900 border-4 border-b-0 border-yellow-500 rounded-t-[3rem] p-6 relative overflow-hidden shadow-[0_-10px_40px_rgba(234,179,8,0.2)]">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Grand Jackpot</span>
                        <span className="text-2xl font-black text-yellow-400 font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                            ${jackpot.toLocaleString()}
                        </span>
                    </div>
                    <div className="px-3 py-1 bg-yellow-950/50 border border-yellow-500/20 rounded-full flex items-center gap-2">
                        <Info size={12} className="text-yellow-500" />
                        <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">RTP: 88% (Rigged)</span>
                    </div>
                </div>
            </div>

            {/* Reels Container */}
            <div className="bg-slate-950 border-x-4 border-yellow-500 p-8 relative">
                {/* Decorative Lights */}
                <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-around py-4">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-2 h-2 rounded-full ${isSpinning ? 'animate-pulse bg-yellow-300' : 'bg-yellow-900'}`} />)}
                </div>
                <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-around py-4">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-2 h-2 rounded-full ${isSpinning ? 'animate-pulse bg-yellow-300' : 'bg-yellow-900'}`} />)}
                </div>

                <div className="grid grid-cols-3 gap-4 h-48">
                    {reels.map((symbol, i) => (
                        <div key={i} className="bg-white rounded-xl border-4 border-slate-300 shadow-inner flex items-center justify-center overflow-hidden relative">
                            {/* Blur effect during spin logic could be here, but using simple state replacement for now */}
                            <AnimatePresence mode="popLayout">
                                {isSpinning && (i === 0 || (i === 1 && reels[0] === reels[1])) ? (
                                    <motion.div
                                        key="blur"
                                        initial={{ filter: "blur(0px)", y: 0 }}
                                        animate={{ filter: "blur(4px)", y: [0, -100, 0] }}
                                        transition={{ repeat: Infinity, duration: turbo ? 0.1 : 0.2 }}
                                        className="text-6xl select-none opacity-50 grayscale"
                                    >
                                        {symbol.char}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="static"
                                        initial={{ y: -50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className={`text-6xl select-none ${symbol.color} drop-shadow-md`}
                                    >
                                        {symbol.char}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                        </div>
                    ))}
                </div>

                {/* Status Bar */}
                <div className="flex justify-center mt-6 h-8">
                    <AnimatePresence>
                        {result ? (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1.2, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                className={`text-2xl font-black italic tracking-widest ${result === 'SO CLOSE!' ? 'text-white' : 'text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]'}`}
                            >
                                {result}
                            </motion.div>
                        ) : (
                            isSpinning && <span className="text-slate-500 font-bold uppercase tracking-widest text-sm animate-pulse">Luck is calculating...</span>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-slate-900 border-4 border-t-0 border-yellow-500 rounded-b-[3rem] p-6 shadow-2xl">
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setTurbo(!turbo)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${turbo ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                    >
                        <Zap size={16} className={turbo ? 'fill-current' : ''} />
                        <span className="text-[10px] font-black uppercase tracking-wider">Turbo</span>
                    </button>
                    <button
                        onClick={() => {
                            if (autoSpin) {
                                setAutoSpin(false);
                            } else {
                                setAutoSpin(true);
                                toast.info("Auto-Spin Enabled", { description: "Maximizing churn rate." });
                            }
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${autoSpin ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                    >
                        <RotateCw size={16} className={autoSpin ? 'animate-spin' : ''} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{autoSpin ? 'Stop Auto' : 'Auto Spin'}</span>
                    </button>
                </div>

                <button
                    onClick={spin}
                    disabled={isSpinning || balance < betSize}
                    className={`w-full py-6 rounded-2xl font-black text-3xl uppercase tracking-[0.2em] transition-all shadow-[0_10px_0_rgb(161,98,7)] active:shadow-none active:translate-y-[10px] ${isSpinning
                        ? 'bg-slate-800 text-slate-600 shadow-none translate-y-[10px] cursor-not-allowed'
                        : 'bg-gradient-to-b from-yellow-400 to-yellow-600 text-yellow-950 hover:to-yellow-500'
                        }`}
                >
                    {isSpinning ? '...' : `SPIN $${betSize}`}
                </button>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic">
                        <strong className="text-yellow-600">Behavioral Insight:</strong> The "Near Miss" (2 matching symbols) is programmed to occur 3x more often than random chance. It triggers the same reward centers in your brain as a win, keeping you playing longer.
                    </p>
                </div>
            </div>
        </div>
    );
}
