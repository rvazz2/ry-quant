"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb, Diamond } from 'lucide-react';
import { useCasinoSFX } from '@/hooks/useCasinoSFX';
import { triggerConfetti } from '@/lib/confetti';

interface MinesGameProps {
    onAction: (amount: number) => void;
    balance: number;
    setBalance: React.Dispatch<React.SetStateAction<number>>;
}

export function MinesGame({ onAction, balance, setBalance }: MinesGameProps) {
    const { playSound } = useCasinoSFX();
    const [gameState, setGameState] = useState<'betting' | 'playing' | 'cashed' | 'exploded'>('betting');
    const [grid, setGrid] = useState<boolean[]>(Array(25).fill(false)); // true = revealed
    const [mines, setMines] = useState<number[]>([]); // indices of mines
    const [mineCount, setMineCount] = useState(3);
    const [bet, setBet] = useState(10);
    const [revealedCount, setRevealedCount] = useState(0);

    const safeCount = 25 - mineCount;

    // Calculate current multiplier based on probability
    // Multiplier = 0.99 * nCr(25, mines) / nCr(25-revealed, mines) ? 
    // Simplified standard Mines math: Multiplier_next = Multiplier_current * (Remaining_Tiles / Remaining_Safe)
    // House edge applies.

    const calculateMultiplier = (revealed: number) => {
        let mult = 0.99; // 1% House edge implicit
        for (let i = 0; i < revealed; i++) {
            const tilesLeft = 25 - i;
            const safeLeft = 25 - mineCount - i;
            mult *= (tilesLeft / safeLeft);
        }
        return Math.max(1, mult);
    };

    const currentMultiplier = calculateMultiplier(revealedCount);
    const nextMultiplier = calculateMultiplier(revealedCount + 1);
    const currentPayout = bet * currentMultiplier;

    const startGame = () => {
        if (balance < bet) return;
        setBalance(prev => prev - bet);
        onAction(-bet);
        playSound('chip');

        // Generate mines
        const newMines: number[] = [];
        while (newMines.length < mineCount) {
            const r = Math.floor(Math.random() * 25);
            if (!newMines.includes(r)) newMines.push(r);
        }
        setMines(newMines);
        setGrid(Array(25).fill(false));
        setRevealedCount(0);
        setGameState('playing');
        playSound('spin');
    };

    const clickTile = (index: number) => {
        if (gameState !== 'playing' || grid[index]) return;

        if (mines.includes(index)) {
            // BOOM
            const newGrid = [...grid];
            newGrid[index] = true;
            setGrid(newGrid);
            setGameState('exploded');
            playSound('shatter'); // Need a boom sound, shatter works for now
            playSound('loss');
        } else {
            // SAFE
            const newGrid = [...grid];
            newGrid[index] = true;
            setGrid(newGrid);
            setRevealedCount(prev => prev + 1);
            playSound('deal'); // Flip sound

            // Auto win if all safe tiles found
            if (revealedCount + 1 === safeCount) {
                const win = bet * calculateMultiplier(revealedCount + 1);
                cashOut(win);
            }
        }
    };

    const cashOut = (amount?: number) => {
        const win = amount || currentPayout;
        setBalance(prev => prev + win);
        onAction(win - bet);
        setGameState('cashed');
        playSound('win');
        playSound('bell');
        triggerConfetti('win');
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8 p-6 bg-[#0f172a] rounded-[2.5rem] border-4 border-slate-800 shadow-2xl relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)'
            }} />

            {/* Sidebar Controls */}
            <div className="w-full md:w-80 flex flex-col gap-6 bg-slate-900/50 p-6 rounded-3xl border border-white/5 relative z-10">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bet Amount</label>
                        <span className="text-slate-200 font-mono">${bet}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={gameState === 'playing'}
                            onClick={() => setBet(Math.max(1, bet - 10))}
                            className="flex-1 py-3 bg-slate-800 rounded-xl hover:bg-slate-700 disabled:opacity-50 font-bold text-slate-300"
                        >-</button>
                        <button
                            disabled={gameState === 'playing'}
                            onClick={() => setBet(Math.min(1000, bet + 10))}
                            className="flex-1 py-3 bg-slate-800 rounded-xl hover:bg-slate-700 disabled:opacity-50 font-bold text-slate-300"
                        >+</button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mines</label>
                        <span className="text-rose-400 font-mono">{mineCount}</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="24"
                        value={mineCount}
                        onChange={(e) => setMineCount(parseInt(e.target.value))}
                        disabled={gameState === 'playing'}
                        className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                        <span>1</span>
                        <span>24</span>
                    </div>
                </div>

                <div className="mt-auto">
                    {gameState === 'playing' ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                                <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-1">Current Win</div>
                                <div className="text-3xl font-black text-white">${currentPayout.toFixed(2)}</div>
                                <div className="text-[10px] text-emerald-400/60 font-mono mt-1">{currentMultiplier.toFixed(2)}x</div>
                            </div>

                            <button
                                onClick={() => cashOut()}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                            >
                                Cash Out
                            </button>
                            <div className="text-center text-[10px] text-slate-500 uppercase tracking-widest">
                                Next Tile: {nextMultiplier.toFixed(2)}x
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={startGame}
                            disabled={balance < bet}
                            className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Start Game
                        </button>
                    )}
                </div>
            </div>

            {/* Game Grid */}
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <div className="grid grid-cols-5 gap-3 w-full max-w-[500px] aspect-square">
                    {Array.from({ length: 25 }).map((_, i) => {
                        const isRevealed = grid[i];
                        const isMine = mines.includes(i);
                        const isExploded = gameState === 'exploded' && isMine;
                        const isLost = gameState === 'exploded';
                        const isCashed = gameState === 'cashed';

                        // Show all mines if lost
                        const showContent = isRevealed || (isLost && isMine) || (isCashed && isMine);

                        return (
                            <motion.button
                                key={i}
                                disabled={gameState !== 'playing' || isRevealed}
                                onClick={() => clickTile(i)}
                                whileHover={gameState === 'playing' && !isRevealed ? { scale: 1.05 } : {}}
                                whileTap={gameState === 'playing' && !isRevealed ? { scale: 0.95 } : {}}
                                className={`
                                    relative rounded-xl border-b-4 transition-all duration-200
                                    ${!showContent
                                        ? 'bg-slate-700 border-slate-900 hover:bg-slate-600'
                                        : isMine
                                            ? 'bg-rose-950 border-rose-900'
                                            : 'bg-emerald-900 border-emerald-800'
                                    }
                                    ${gameState === 'playing' && !isRevealed ? 'cursor-pointer' : 'cursor-default'}
                                `}
                            >
                                <AnimatePresence>
                                    {showContent && (
                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            {isMine ? (
                                                <Bomb className={`w-1/2 h-1/2 ${isExploded ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`} fill={isExploded ? "currentColor" : "none"} />
                                            ) : (
                                                <Diamond className="w-1/2 h-1/2 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" fill="currentColor" />
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
