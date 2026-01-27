"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dices,
    CircleDollarSign,
    Gamepad2,
    MoreHorizontal,
    AlertTriangle,
    Calculator,
    TrendingDown,
    Zap,
    Clock,
    Skull,
    X,
    ShieldAlert,
    LayoutDashboard,
    History,
    Info,
    Smartphone,
    Trophy,
    User
} from 'lucide-react';
import { PokerGame } from './PokerGame';
import { SportsGame } from './SportsGame';
import { PlayingCard, Suit, Rank } from '../ui/PlayingCard';
import { PokerChip } from '../ui/PokerChip';

type TabType = 'slots' | 'tables' | 'electronic' | 'other' | 'reality';

// Custom hook for synthesized casino sound effects
const useCasinoSFX = () => {
    const playSound = (type: 'spin' | 'win' | 'loss' | 'deal' | 'click' | 'bell' | 'chip') => {
        try {
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;

            if (type === 'spin') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(110, now + 0.5);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.start();
                osc.stop(now + 0.5);
            } else if (type === 'win') {
                osc.type = 'square';
                const notes = [523.25, 659.25, 783.99, 1046.50];
                notes.forEach((freq, i) => {
                    osc.frequency.setValueAtTime(freq, now + i * 0.1);
                });
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.5);
                osc.start();
                osc.stop(now + 0.5);
            } else if (type === 'loss') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.linearRampToValueAtTime(55, now + 0.5);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.5);
                osc.start();
                osc.stop(now + 0.5);
            } else if (type === 'deal') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(880, now);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start();
                osc.stop(now + 0.1);
            } else if (type === 'click') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1000, now);
                gain.gain.setValueAtTime(0.02, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.start();
                osc.stop(now + 0.05);
            } else if (type === 'bell') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1500, now);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
                osc.start();
                osc.stop(now + 1);
            } else if (type === 'chip') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(2000, now);
                gain.gain.setValueAtTime(0.03, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.start();
                osc.stop(now + 0.05);
            }
        } catch (e) {
            console.warn("Audio Context failed", e);
        }
    };

    return { playSound };
};

// GogginsMessage component for typewriter effect
const GogginsMessage = ({ text, onComplete }: { text: string; onComplete: () => void }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < text.length) {
            const timeoutId = setTimeout(() => {
                setDisplayedText((prev) => prev + text[index]);
                setIndex((prev) => prev + 1);
            }, 50); // Typing speed

            return () => clearTimeout(timeoutId);
        } else {
            onComplete();
        }
    }, [index, text, onComplete]);

    return (
        <p className="text-2xl md:text-4xl font-black text-white leading-tight md:leading-snug tracking-tighter italic mb-8">
            {displayedText}
            <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-2 h-6 md:h-10 bg-white ml-1"
            />
        </p>
    );
};

export function CasinoGuide() {
    const [activeTab, setActiveTab] = useState<TabType>('slots');
    const [activeGame, setActiveGame] = useState<string | null>(null);
    const [showGoggins, setShowGoggins] = useState(false);
    const [isLockdown, setIsLockdown] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const { playSound } = useCasinoSFX();

    // Session State
    const [balance, setBalance] = useState(1000);
    const [totalLost, setTotalLost] = useState(0);
    const [actionCount, setActionCount] = useState(0);
    const [showRealityCheck, setShowRealityCheck] = useState(false);

    // Loss Calculator State (legacy/static)
    const [bankroll, setBankroll] = useState(100);
    const [hours, setHours] = useState(1);
    const [betSize, setBetSize] = useState(10);

    const handleAction = (amount: number) => {
        const newCount = actionCount + 1;
        setActionCount(newCount);
        if (amount < 0) {
            setTotalLost(prev => prev + Math.abs(amount));
        }
        if (newCount % 10 === 0) {
            setShowRealityCheck(true);
        }
    };

    useEffect(() => {
        if (isLockdown) {
            document.body.classList.add('lockdown-active');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.classList.remove('lockdown-active');
            document.body.style.overflow = 'auto';
        }
    }, [isLockdown]);

    const calculation = useMemo(() => {
        const handsPerHour = 60;
        const avgHouseEdge = 0.015; // 1.5% blended
        const totalWagered = hours * handsPerHour * betSize;
        const expectedLoss = totalWagered * avgHouseEdge;
        const remaining = Math.max(0, bankroll - expectedLoss);

        return {
            totalWagered,
            expectedLoss,
            remaining,
            percentLost: (expectedLoss / bankroll) * 100
        };
    }, [bankroll, hours, betSize]);

    const tabs = [
        { id: 'slots', label: 'Slots', icon: <CircleDollarSign size={18} /> },
        { id: 'tables', label: 'Table Games', icon: <Dices size={18} /> },
        { id: 'electronic', label: 'Electronic', icon: <Gamepad2 size={18} /> },
        { id: 'other', label: 'Other', icon: <MoreHorizontal size={18} /> },
        { id: 'reality', label: 'The Reality Check', icon: <AlertTriangle size={18} /> },
    ];

    const renderElectronic = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                    <Gamepad2 className="text-cyan-500" size={28} />
                </div>
                <div>
                    <h4 className="text-2xl font-black text-white tracking-tight uppercase italic">Digital Churn</h4>
                    <p className="text-slate-400 text-sm font-medium tracking-wide">High-speed terminal gaming designed for relentless volume.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <button
                    onClick={() => { setActiveGame('videopoker'); playSound('deal'); }}
                    className="group relative p-8 text-left bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] hover:border-cyan-500/40 transition-all overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-center relative z-10">
                        <div className="flex-1">
                            <span className="text-xs font-black text-cyan-500/60 uppercase tracking-[0.2em] mb-2 block">Skill-Based Trap</span>
                            <h5 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">Video Poker</h5>
                            <p className="text-sm text-slate-400 leading-relaxed font-medium max-w-xl">Unlike slots, this involves strategy. However, casinos often adjust pay tables (e.g., 8/5 vs 9/6) to maintain a lethal edge over time.</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center border border-white/5 group-hover:border-cyan-500/30 transition-all">
                            <Gamepad2 size={24} className="text-cyan-500" />
                        </div>
                    </div>
                </button>

                <div className="p-8 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] relative overflow-hidden">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                        <div>
                            <h5 className="text-lg font-bold text-white mb-2 italic">Electronic Table Games (ETGs)</h5>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">Stadium Gaming terminals where you play roulette or blackjack on a screen. Faster play cycles mean you hit the house edge more frequently per hour.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderOther = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                    <MoreHorizontal className="text-indigo-500" size={28} />
                </div>
                <div>
                    <h4 className="text-2xl font-black text-white tracking-tight uppercase italic">Ancillary Options</h4>
                    <p className="text-slate-400 text-sm font-medium tracking-wide">PVP rooms and high-margin distractions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { name: "Poker Rooms", desc: "Player vs Player. The house takes a 'rake' (fee) from every pot.", id: 'poker', icon: "🃏" },
                    { name: "Sportsbooks", desc: "The 'Vig' (juice) makes winning long-term extremely difficult.", id: 'sports', icon: "🏈" },
                    { name: "Keno / Bingo", desc: "The ultimate mathematical 'donation'. 25%+ house edge.", id: 'keno', icon: "🔢" }
                ].map((o, i) => (
                    <button
                        key={i}
                        onClick={() => { if (['poker', 'sports', 'keno'].includes(o.id)) { setActiveGame(o.id); playSound('click'); } }}
                        className="group relative p-6 text-left bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] hover:border-indigo-500/40 transition-all overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="text-2xl mb-4 group-hover:scale-110 transition-transform origin-left">{o.icon}</div>
                            <h5 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{o.name}</h5>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{o.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderSlots = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                    <Zap className="text-yellow-500" size={28} />
                </div>
                <div>
                    <h4 className="text-2xl font-black text-white tracking-tight uppercase italic">The Floor Anchors</h4>
                    <p className="text-slate-400 text-sm font-medium tracking-wide">High-energy machines engineered for maximum psychological &quot;stickiness.&quot;</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {[
                    { title: "Classic Slots", desc: "Mechanical 'three-reel' relics. Fast, unforgiving, and built for high-speed turnover.", id: 'slots', icon: "🎰" },
                    { title: "Video Slots", desc: "Immersive screens using cinematic audio-visual 'rewards' to mask net session losses.", id: 'slots', icon: "🎬" },
                    { title: "Progressives", desc: "Massive networked jackpots. A small tax on every bet funds the 'Big One', leaving base odds at their worst.", id: 'slots', icon: "💎" }
                ].map((s, i) => (
                    <button
                        key={i}
                        onClick={() => { setActiveGame('slots'); playSound('click'); }}
                        className="group relative p-6 text-left bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] hover:border-yellow-500/40 transition-all overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex-1">
                                <span className="text-xs font-black text-yellow-500/60 uppercase tracking-[0.2em] mb-2 block">{s.icon} Engine Type</span>
                                <h5 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">{s.title}</h5>
                                <p className="text-sm text-slate-400 leading-relaxed font-medium">{s.desc}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                <Zap size={18} className="text-yellow-500" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderTables = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <Dices className="text-emerald-500" size={28} />
                </div>
                <div>
                    <h4 className="text-2xl font-black text-white tracking-tight uppercase italic">The Green Felt</h4>
                    <p className="text-slate-400 text-sm font-medium tracking-wide">Where skill meets the inevitable math of the house edge.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { name: "Blackjack", desc: "Beat the dealer to 21. Lowest edge if you follow the book.", id: 'blackjack', stat: "0.5% Edge" },
                    { name: "Roulette", desc: "The wheel of chance. Numbers, colors, and the 0/00 trap.", id: 'roulette', stat: "5.26% Edge" },
                    { name: "Craps", desc: "Momentum and complex odds. Stick to the line bets.", id: 'craps', stat: "1.4% Edge" },
                    { name: "Baccarat", desc: "The high-roller choice. Banker vs Player logic.", id: 'baccarat', stat: "1.06% Edge" },
                    { name: "Pai Gow", desc: "Two-handed poker. The ultimate 'slow burn' game.", id: 'paigow', stat: "Low Vol" }
                ].map((t, i) => (
                    <button
                        key={i}
                        onClick={() => { setActiveGame(t.id); playSound('chip'); }}
                        className="group relative p-6 text-left bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] hover:border-emerald-500/40 transition-all overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.2em]">{t.stat}</span>
                                <TrendingDown size={14} className="text-emerald-500 opacity-0 group-hover:opacity-50 transition-all" />
                            </div>
                            <h5 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{t.name}</h5>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{t.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderReality = () => (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="relative group overflow-hidden p-10 bg-gradient-to-br from-red-950/40 to-black rounded-[3rem] border border-red-500/20 shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                    <Skull size={120} className="text-red-500" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-red-500/20 rounded-2xl border border-red-500/30">
                            <Skull className="text-red-500" size={32} />
                        </div>
                        <h4 className="text-3xl font-black text-white tracking-tighter italic uppercase">The Math of Decay</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { name: "Blackjack", edge: "0.5%", status: "Slow Drain", color: "text-emerald-400" },
                            { name: "Baccarat", edge: "1.06%", status: "Steady Erosion", color: "text-blue-400" },
                            { name: "Roulette", edge: "5.26%", status: "High Risk", color: "text-orange-400" },
                            { name: "Slot Machines", edge: "10-15%", status: "Extreme Churn", color: "text-red-400" },
                            { name: "Keno / Bingo", edge: "25-30%", status: "Total Loss", color: "text-red-600" }
                        ].map((row, i) => (
                            <div key={i} className="p-6 bg-slate-950/60 backdrop-blur-xl border border-white/5 rounded-3xl group/row hover:border-red-500/30 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-sm font-black text-slate-500 uppercase tracking-widest">{row.name}</div>
                                    <div className={`text-xl font-mono font-black ${row.color}`}>{row.edge}</div>
                                </div>
                                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (parseFloat(row.edge) / 30) * 100)}%` }}
                                        className={`h-full bg-current ${row.color}`}
                                    />
                                </div>
                                <div className="mt-3 text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{row.status}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-10 bg-slate-950/40 backdrop-blur-md border border-slate-800 rounded-[3rem] relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="p-2 bg-cyan-500/10 rounded-xl">
                            <Calculator className="text-cyan-400" size={24} />
                        </div>
                        <h4 className="text-xl font-black text-white uppercase tracking-widest">Expected Loss Calculator</h4>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Initial Bankroll</label>
                                    <span className="text-sm font-mono text-cyan-400">${bankroll}</span>
                                </div>
                                <input
                                    type="range"
                                    min="100"
                                    max="10000"
                                    step="100"
                                    value={bankroll}
                                    onChange={(e) => setBankroll(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Hands / Hour</label>
                                    <span className="text-sm font-mono text-cyan-400">60 Hands</span>
                                </div>
                                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500/20 w-[60%]" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Bet Size</label>
                                    <span className="text-sm font-mono text-cyan-400">${betSize}</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="500"
                                    step="5"
                                    value={betSize}
                                    onChange={(e) => setBetSize(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-[2rem] flex flex-col justify-center">
                                <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-4">Mathematical Decay</div>
                                <div className="text-5xl font-black text-red-500 font-mono tracking-tighter">
                                    -${calculation.expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                                <p className="mt-4 text-xs text-slate-500 font-medium leading-relaxed">
                                    Your bankroll will likely bleed <span className="text-red-400 font-bold">{calculation.percentLost.toFixed(1)}%</span> in just {hours} hour{hours > 1 ? 's' : ''} of play.
                                </p>
                            </div>
                            <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-[2rem] flex flex-col justify-center group-hover:border-slate-700 transition-colors">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Likely Remaining</div>
                                <div className="text-5xl font-black text-white font-mono tracking-tighter">
                                    ${calculation.remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                                <p className="mt-4 text-xs text-slate-600 font-medium">The house doesn&apos;t need to steal; they just wait for the math to work.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-cyan-500/5 border-l-4 border-cyan-500 rounded-r-2xl">
                        <div className="flex gap-4">
                            <TrendingDown className="text-cyan-500 flex-shrink-0" size={24} />
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                <strong className="text-cyan-400">The Velocity of Ruin:</strong> High-speed play (like slots or fast tables) increases your "Theoretical Loss" exponentially. The faster you play, the faster the house edge consumes your bankroll.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderRestrictedPortal = () => (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black z-0" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-4xl w-full"
            >
                <div className="flex flex-col items-center mb-12">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-3 h-3 rounded-full bg-rose-600 animate-pulse" />
                        <h1 className="text-xl md:text-3xl font-black text-rose-600 uppercase tracking-[0.4em] italic">Access Restricted</h1>
                    </div>
                    <div className="h-px w-64 bg-gradient-to-r from-transparent via-rose-600/50 to-transparent mb-8" />

                    <div className="flex gap-4 mb-12">
                        <div className="px-4 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status: <span className="text-rose-500">Locked</span></span>
                        </div>
                        <div className="px-4 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Logic Check: <span className="text-rose-500">Failed</span></span>
                        </div>
                    </div>
                </div>

                <div className="space-y-8 mb-16">
                    <p className="text-lg md:text-2xl font-medium text-zinc-400 leading-relaxed italic">
                        &quot;Rigged loops&quot; are the ultimate test of discipline. Being here is a failure of <span className="text-white font-black underline decoration-rose-600">Opportunity Cost</span>. Every second spent trying to &quot;beat the house&quot; is a second stolen from your actual compounding growth.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 text-left">
                        <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl">
                            <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-3">Mathematical Certainty</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed italic">You are fighting an equation where the result is always <span className="text-white">-$</span>.</p>
                        </div>
                        <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl">
                            <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-3">Discipline Leakage</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed italic">Entering the loop suggests a crack in the <span className="text-white">&quot;Stay Hard&quot;</span> mentality.</p>
                        </div>
                        <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl">
                            <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-3">The Trap</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed italic">The house edge isn't just about money; it's about stealing your <span className="text-white">momentum</span>.</p>
                        </div>
                    </div>

                    <div className="py-10">
                        <span className="text-zinc-600 text-3xl font-serif">"</span>
                        <p className="inline text-xl md:text-2xl font-black text-white italic tracking-tight mx-4">
                            The house doesn't just win; it waits for you to lose yourself.
                        </p>
                        <span className="text-zinc-600 text-3xl font-serif">"</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-12">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="group flex items-center gap-4 px-12 py-6 bg-white text-black font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-zinc-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                    >
                        Stay Hard
                        <div className="h-px w-0 group-hover:w-8 bg-black transition-all duration-300" />
                    </button>

                    <button
                        onClick={() => {
                            playSound('chip');
                            document.body.style.filter = 'invert(1)';
                            setTimeout(() => {
                                document.body.style.filter = 'none';
                                setIsUnlocked(true);
                            }, 150);
                        }}
                        className="opacity-10 hover:opacity-100 transition-opacity p-4"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-black text-zinc-600 tracking-[0.5em] uppercase">RC</span>
                            <p className="text-[8px] text-zinc-700 italic font-medium">(Press only if you choose to bypass logic and enter the casino floor.)</p>
                        </div>
                    </button>
                </div>
            </motion.div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto relative">
            {!isUnlocked ? (
                renderRestrictedPortal()
            ) : (
                <>
                    {/* Base View */}
                    <div className={`${isLockdown ? 'opacity-0 pointer-events-none' : 'opacity-100 transition-opacity duration-500'}`}>
                        {/* Header Section with Session Balance */}
                        <div className="mb-10 text-center relative">
                            <div className="absolute top-0 right-0 flex flex-col items-end gap-2">
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-2xl">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-1">Session Balance</div>
                                    <div className="text-xl font-mono font-bold text-emerald-400">${balance.toLocaleString()}</div>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 px-3 shadow-xl flex items-center gap-2">
                                    <TrendingDown size={12} className="text-red-500" />
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Lost</div>
                                    <div className="text-sm font-mono font-bold text-red-500">-${totalLost.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="inline-flex p-3 bg-yellow-500/10 rounded-2xl mb-4 border border-yellow-500/20">
                                <Dices className="text-yellow-500" size={32} />
                            </div>
                            <h2 className="text-5xl font-black text-white tracking-tight mb-2 italic">Ryans Casino</h2>
                            <p className="text-2xl font-bold text-yellow-500/80 tracking-wide">&quot;Good Luck,&quot;</p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Sidebar Tabs */}
                            <div className="w-full lg:w-72 flex-shrink-0 space-y-3">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id as TabType); playSound('click'); }}
                                        className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] text-[10px] font-black transition-all border-2 uppercase tracking-[0.2em] relative overflow-hidden group ${activeTab === tab.id
                                            ? tab.id === 'reality'
                                                ? 'bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                                                : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.15)]'
                                            : 'bg-slate-950/40 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-slate-900/60 hover:border-white/10'
                                            }`}
                                    >
                                        {activeTab === tab.id && (
                                            <motion.div
                                                layoutId="tab-glow"
                                                className={`absolute inset-0 opacity-20 bg-gradient-to-r ${tab.id === 'reality' ? 'from-red-500' : 'from-yellow-500'} to-transparent`}
                                            />
                                        )}
                                        <div className="relative z-10 flex items-center gap-4">
                                            {tab.icon}
                                            {tab.label}
                                        </div>
                                    </button>
                                ))}

                                <div className="mt-10 p-6 bg-slate-950 border border-slate-800 rounded-3xl hidden lg:block relative">
                                    <p className="text-xs text-slate-500 font-bold mb-4 uppercase tracking-tighter">Pro Tip</p>
                                    <p className="text-sm text-slate-400 leading-relaxed italic">
                                        &quot;Many hotels like The Venetian offer free lessons at 10:00 AM. They teach you the rules because they know once you know how to play, you&rsquo;re more likely to give them your money.&quot;
                                    </p>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 bg-slate-950/30 border border-slate-800/50 rounded-[2.5rem] p-8 min-h-[600px] backdrop-blur-sm">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {activeTab === 'slots' && renderSlots()}
                                        {activeTab === 'tables' && renderTables()}
                                        {activeTab === 'reality' && renderReality()}
                                        {activeTab === 'electronic' && renderElectronic()}
                                        {activeTab === 'other' && renderOther()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Hidden Reality Check Trigger at the absolute bottom */}
                        <div className="mt-32 pb-10 flex justify-center">
                            <button
                                onClick={() => {
                                    playSound('chip');
                                    // Pattern Interrupt: Flicker effect before Lockdown
                                    document.body.style.filter = 'invert(1)';
                                    setTimeout(() => {
                                        document.body.style.filter = 'none';
                                        setIsLockdown(true);
                                    }, 150);
                                }}
                                className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-[8px] font-black text-white/5 hover:text-white/40 hover:border-white/20 transition-all uppercase tracking-tighter opacity-10 hover:opacity-100"
                            >
                                RC
                            </button>
                        </div>
                    </div>

                    {/* David Goggins Lockdown Mode Overlay */}
                    <AnimatePresence>
                        {isLockdown && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[500] bg-black overflow-y-auto custom-scrollbar flex flex-col"
                            >
                                {/* Inject styles to suppress the rest of the site */}
                                <style>
                                    {`
                                body.lockdown-active aside, 
                                body.lockdown-active header, 
                                body.lockdown-active main > header {
                                    display: none !important;
                                }
                                body.lockdown-active main {
                                    padding: 0 !important;
                                    margin: 0 !important;
                                    background: black !important;
                                }
                            `}
                                </style>

                                {/* Lockdown Header: Goggins + Stats + Personalized Jabs */}
                                <div className="sticky top-0 z-50 bg-black border-b border-white/10 p-4 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
                                    <div className="flex items-center gap-8">
                                        <motion.div
                                            initial={{ scale: 0.5, rotate: -10 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.1)] flex-shrink-0"
                                        >
                                            <img src="/assets/goggins.png" alt="Goggins" className="w-full h-full object-cover grayscale" />
                                        </motion.div>
                                        <div className="max-w-xl text-center md:text-left">
                                            <h2 className="text-2xl md:text-4xl font-black text-rose-600 italic tracking-tighter uppercase mb-3">Stay Hard.</h2>
                                            <p className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                                                &quot;Rigged loops don&apos;t care about your logic. The house edge is a mathematical certainty. Explain the failure of being here.&quot;
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6">
                                        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 min-w-[180px] text-center shadow-2xl">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Live Bankroll</p>
                                            <p className="text-3xl font-mono font-bold text-emerald-400">${balance.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 min-w-[180px] text-center shadow-2xl border-red-500/20">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Total Decay</p>
                                            <p className="text-3xl font-mono font-bold text-red-500">-${totalLost.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            playSound('click');
                                            setIsLockdown(false);
                                        }}
                                        className="px-10 py-5 bg-white text-black font-black uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                    >
                                        Stay Hard
                                    </button>
                                </div>

                                {/* Casino Logo */}
                                <div className="flex justify-center py-12 border-b border-white/5">
                                    <motion.img
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.6, type: 'spring' }}
                                        src="/ryans-casino-logo.png"
                                        alt="Ryan's Casino"
                                        className="w-64 h-64 drop-shadow-[0_0_50px_rgba(124,58,237,0.7)]"
                                    />
                                </div>

                                {/* Lockdown Floor */}
                                <div className="flex-1 p-6 md:p-20 max-w-7xl mx-auto w-full mb-32">
                                    <div className="grid lg:grid-cols-12 gap-16">
                                        <div className="lg:col-span-4 space-y-6">
                                            <div className="mb-10">
                                                <p className="text-[11px] font-black text-rose-500 uppercase tracking-[0.4em] mb-2">Casino Lockdown</p>
                                                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">The Floor</h3>
                                            </div>
                                            {tabs.map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => { setActiveTab(tab.id as TabType); playSound('click'); }}
                                                    className={`w-full flex items-center justify-between px-8 py-6 rounded-[2rem] text-[10px] font-black transition-all border-2 uppercase tracking-[0.2em] ${activeTab === tab.id
                                                        ? 'bg-white/10 border-white/40 text-white shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                                                        : 'bg-transparent border-white/5 text-slate-600 hover:border-white/20'}`}
                                                >
                                                    <span className="flex items-center gap-4">{tab.icon} {tab.label}</span>
                                                    {activeTab === tab.id && <motion.div layoutId="lockdown-indicator" className="w-2 h-2 rounded-full bg-white shadow-[0_0_15px_white]" />}
                                                </button>
                                            ))}

                                            <div className="mt-20 p-8 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] opacity-40">
                                                <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Mathematical Alert</p>
                                                <p className="text-xs text-slate-400 italic leading-relaxed">
                                                    &quot;The house edge is 1.25% blended. There is no precision in luck. Return to the data.&quot;
                                                </p>
                                            </div>
                                        </div>
                                        <div className="lg:col-span-8 bg-zinc-950/80 border border-white/5 rounded-[3rem] p-10 md:p-16 min-h-[700px] flex items-center justify-center shadow-inner relative overflow-hidden">
                                            {/* Background Subtle Logo */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                                                <Skull size={400} />
                                            </div>
                                            <div className="relative z-10 w-full flex justify-center">
                                                {activeTab === 'slots' && renderSlots()}
                                                {activeTab === 'tables' && renderTables()}
                                                {activeTab === 'electronic' && renderElectronic()}
                                                {activeTab === 'other' && renderOther()}
                                                {activeTab === 'reality' && renderReality()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* David Goggins Reality Check Overlay (Existing Feature) */}
                    <AnimatePresence>
                        {showGoggins && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[600] bg-black flex flex-col items-center justify-center p-8 text-center overflow-hidden"
                            >
                                <motion.div
                                    initial={{ scale: 0.8, filter: 'grayscale(100%) brightness(0%)' }}
                                    animate={{ scale: 1, filter: 'grayscale(100%) brightness(100%) shadow(0 0 30px rgba(255,255,255,0.1))' }}
                                    transition={{ duration: 1 }}
                                    className="relative w-64 h-64 md:w-80 md:h-80 mb-12 rounded-full overflow-hidden border-4 border-white/20"
                                >
                                    <img
                                        src="/assets/goggins.png"
                                        alt="David Goggins"
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>

                                <div className="max-w-4xl">
                                    <GogginsMessage
                                        onComplete={() => { }}
                                        text="I'M DISAPPOINTED IN YOU. YOU KNOW THE HOUSE EDGE ISN'T A SUGGESTION—IT'S A MATHEMATICAL CERTAINTY. SO EXPLAIN THE LOGICAL COLLAPSE. WHY ARE YOU HERE INTERACTING WITH RIGGED LOOPS? YOU DON'T BUILD SYSTEMS ON LUCK. YOU BUILD THEM ON DATA. STAY HARD."
                                    />
                                </div>

                                <div className="flex flex-col md:flex-row gap-6 mt-16 scale-110">
                                    <button
                                        onClick={() => setShowGoggins(false)}
                                        className="px-10 py-5 bg-white text-black font-black uppercase tracking-[0.3em] hover:bg-zinc-200 transition-colors rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                    >
                                        Stay Hard
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowGoggins(false);
                                            setActiveTab('slots');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="px-10 py-5 bg-transparent border-2 border-white/20 text-white font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-colors rounded-2xl"
                                    >
                                        Play Casino Games
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Reality Check Modal */}
                    <AnimatePresence>
                        {showRealityCheck && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-[2rem] p-8 text-center shadow-2xl"
                                >
                                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <AlertTriangle className="text-red-500" size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2 uppercase">Reality Check</h3>
                                    <p className="text-slate-400 mb-6 font-medium">
                                        You&apos;ve executed <span className="text-red-500 font-bold">{actionCount}</span> actions.
                                        Mathematical erosion in progress: <span className="text-red-500 font-bold">-${totalLost.toLocaleString()}</span>.
                                    </p>

                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 text-sm italic text-red-400">
                                        &quot;The only way to win is to not play the Law of Large Numbers.&quot;
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button onClick={() => setShowRealityCheck(false)} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl transition-all uppercase tracking-widest">
                                            Continue Play
                                        </button>
                                        <button onClick={() => { setShowRealityCheck(false); setActiveGame(null); }} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black rounded-xl transition-all uppercase tracking-widest">
                                            Exit to Menu
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Interactive Game Overlay */}
                    <AnimatePresence>
                        {activeGame && (
                            <motion.div
                                initial={{ opacity: 0, y: "100%" }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: "100%" }}
                                className="fixed inset-0 z-[550] bg-slate-950 flex flex-col"
                            >
                                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-xl">
                                    <div className="flex items-center gap-6">
                                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                            <Dices className="text-emerald-500" size={24} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-black text-white uppercase tracking-[0.2em] italic">{activeGame} Floor</h3>
                                            <div className="flex gap-4 mt-1">
                                                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Bankroll: ${balance.toLocaleString()}</span>
                                                <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">Lost: -${totalLost.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveGame(null)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-full transition-all">
                                        <X size={28} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent">
                                    {activeGame === 'slots' && <SlotsEngine onAction={handleAction} balance={balance} setBalance={setBalance} playSound={playSound} />}
                                    {activeGame === 'blackjack' && <BlackjackEngine onAction={handleAction} balance={balance} setBalance={setBalance} playSound={playSound} />}
                                    {activeGame === 'roulette' && <RouletteEngine onAction={handleAction} balance={balance} setBalance={setBalance} playSound={playSound} />}
                                    {activeGame === 'craps' && <CrapsEngine onAction={handleAction} balance={balance} setBalance={setBalance} playSound={playSound} />}
                                    {activeGame === 'baccarat' && <BaccaratEngine onAction={handleAction} balance={balance} setBalance={setBalance} playSound={playSound} />}
                                    {activeGame === 'paigow' && <PaiGowEngine onAction={handleAction} balance={balance} setBalance={setBalance} playSound={playSound} />}
                                    {activeGame === 'videopoker' && <VideoPokerEngine onAction={handleAction} balance={balance} setBalance={setBalance} playSound={playSound} />}
                                    {activeGame === 'keno' && <KenoEngine onAction={handleAction} balance={balance} setBalance={setBalance} playSound={playSound} />}
                                    {activeGame === 'poker' && <PokerGame onAction={handleAction} balance={balance} setBalance={setBalance} playSound={playSound} />}
                                    {activeGame === 'sports' && <SportsGame onAction={handleAction} balance={balance} setBalance={setBalance} playSound={playSound} />}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    );
}

// --- GAME ENGINES ---
interface GameEngineProps {
    onAction: (amount: number) => void;
    balance: number;
    setBalance: React.Dispatch<React.SetStateAction<number>>;
    playSound: (type: 'spin' | 'win' | 'loss' | 'deal' | 'click' | 'bell' | 'chip') => void;
}

function SlotsEngine({ onAction, balance, setBalance, playSound }: GameEngineProps) {
    const symbols = ['🍒', '🍋', '🔔', '💎', '7️⃣', '🎰'];
    const [reels, setReels] = useState(['🎰', '🎰', '🎰']);
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState('');

    const betSize = 10;

    const spin = async () => {
        if (balance < betSize || isSpinning) return;

        setIsSpinning(true);
        setResult('');
        setBalance((b: number) => b - betSize);
        onAction(-betSize);
        playSound('spin');

        // Animation
        for (let i = 0; i < 15; i++) {
            setReels([
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)]
            ]);
            if (i % 3 === 0) playSound('click');
            await new Promise(r => setTimeout(r, 60 + (i * 10)));
        }

        // Rigged RTP: 90%
        const winChance = 0.15;
        const isWin = Math.random() < winChance;

        if (isWin) {
            const sym = symbols[Math.floor(Math.random() * symbols.length)];
            setReels([sym, sym, sym]);
            const payout = betSize * 6;
            setResult(`BIG WIN! +$${payout}`);
            setBalance((b: number) => b + payout);
            onAction(payout - betSize);
            playSound('win');
            playSound('bell');
        } else {
            // Near miss simulation
            const sym1 = symbols[Math.floor(Math.random() * symbols.length)];
            const sym2 = symbols[Math.floor(Math.random() * symbols.length)];
            setReels([sym1, sym1, sym2]);
            setResult('NEAR MISS!');
            playSound('loss');
        }

        setIsSpinning(false);
    };

    return (
        <div className="max-w-md w-full text-center">
            <div className="flex justify-center gap-4 mb-12 p-8 bg-slate-900 border-4 border-yellow-500/50 rounded-[3rem] shadow-[0_0_30px_rgba(234,179,8,0.3)] relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg">90% RTP RIGGED</div>
                {reels.map((s, i) => (
                    <motion.div
                        key={i}
                        animate={isSpinning ? { y: [0, 10, -10, 0], scale: [1, 1.1, 0.9, 1] } : {}}
                        transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.1 }}
                        className="w-24 h-32 bg-slate-950 border-2 border-slate-800 rounded-2xl flex items-center justify-center text-5xl shadow-inner shadow-yellow-500/5"
                    >
                        {s}
                    </motion.div>
                ))}
            </div>

            <button
                onClick={spin}
                disabled={isSpinning || balance < betSize}
                className={`w-full py-5 rounded-3xl font-black text-3xl uppercase tracking-[0.2em] transition-all shadow-[0_10px_40px_-10px_rgba(234,179,8,0.5)] active:scale-95 ${isSpinning ? 'bg-slate-800 text-slate-600' : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                    }`}
            >
                {isSpinning ? 'Spinning...' : 'SPIN $10'}
            </button>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className={`mt-8 text-4xl font-black drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] ${result.includes('WIN') ? 'text-yellow-400' : 'text-slate-500'}`}
                    >
                        {result}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-12 text-center">
                <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto italic">
                    Notice the &quot;Near Misses&quot;? They are mathematically tuned to keep you clicking while your balance trends to zero.
                </p>
            </div>
        </div>
    );
}

function BlackjackEngine({ onAction, balance, setBalance, playSound }: GameEngineProps) {
    type CardType = { suit: Suit; rank: Rank };
    const [gameState, setGameState] = useState<'betting' | 'playing' | 'result'>('betting');
    const [playerHand, setPlayerHand] = useState<CardType[]>([]);
    const [dealerHand, setDealerHand] = useState<CardType[]>([]);
    const [result, setResult] = useState('');
    const [isDealing, setIsDealing] = useState(false);

    const betSize = 50;

    const getRandomCard = (): CardType => {
        const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        return {
            suit: suits[Math.floor(Math.random() * suits.length)],
            rank: ranks[Math.floor(Math.random() * ranks.length)]
        };
    };

    const getCardValue = (card: CardType): number => {
        if (card.rank === 'A') return 11;
        if (['J', 'Q', 'K'].includes(card.rank)) return 10;
        return parseInt(card.rank);
    };

    const getHandTotal = (hand: CardType[]): number => {
        let total = hand.reduce((sum, card) => sum + getCardValue(card), 0);
        let aces = hand.filter(c => c.rank === 'A').length;
        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }
        return total;
    };

    const startDeal = async () => {
        if (balance < betSize || isDealing) return;
        setIsDealing(true);
        setBalance((b: number) => b - betSize);
        onAction(-betSize);
        playSound('chip');

        const p1 = getRandomCard();
        const d1 = getRandomCard();
        const p2 = getRandomCard();

        setPlayerHand([p1]);
        playSound('deal');
        await new Promise(r => setTimeout(r, 400));
        setDealerHand([d1]);
        playSound('deal');
        await new Promise(r => setTimeout(r, 400));
        setPlayerHand([p1, p2]);
        playSound('deal');

        setGameState('playing');
        setIsDealing(false);
    };

    const hit = () => {
        const card = getRandomCard();
        const newHand = [...playerHand, card];
        setPlayerHand(newHand);
        playSound('deal');

        if (getHandTotal(newHand) > 21) {
            setResult('BUST! (LOSE)');
            setGameState('result');
            playSound('loss');
        }
    };

    const stand = async () => {
        setIsDealing(true);
        let dHand = [...dealerHand];
        let dSum = getHandTotal(dHand);

        while (dSum < 17) {
            const card = getRandomCard();
            dHand.push(card);
            dSum = getHandTotal(dHand);
            setDealerHand([...dHand]);
            playSound('deal');
            await new Promise(r => setTimeout(r, 600));
        }

        const pSum = getHandTotal(playerHand);
        if (dSum > 21 || pSum > dSum) {
            setResult('YOU WIN! +$100');
            setBalance((b: number) => b + betSize * 2);
            onAction(betSize);
            playSound('win');
        } else if (pSum === dSum) {
            setResult('PUSH (TIE)');
            setBalance((b: number) => b + betSize);
            onAction(0);
            playSound('deal');
        } else {
            setResult('DEALER WINS');
            playSound('loss');
        }
        setGameState('result');
        setIsDealing(false);
    };

    return (
        <div className="max-w-3xl w-full text-center">
            {/* Chip Stacks */}
            <div className="flex justify-center gap-4 mb-8">
                <PokerChip value={100} count={3} size="md" />
                <PokerChip value={25} count={2} size="md" />
                <PokerChip value={5} count={5} size="md" />
            </div>

            {/* Table */}
            <div className="p-10 bg-gradient-to-br from-emerald-900/30 to-green-950/50 rounded-[3rem] border-4 border-emerald-800/30 shadow-[0_0_60px_rgba(16,185,129,0.2)] mb-12 min-h-[400px] relative overflow-hidden">
                {/* Felt Texture */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234ade80' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />

                {/* Dealer's Hand */}
                <div className="relative z-10 mb-20">
                    <div className="text-[10px] font-black text-emerald-300/60 uppercase tracking-widest mb-6">Dealer ({gameState === 'result' ? getHandTotal(dealerHand) : '?'})</div>
                    <div className="flex justify-center gap-3 h-36 items-center">
                        {dealerHand.map((c, i) => (
                            <PlayingCard key={i} suit={c.suit} rank={c.rank} size="md" />
                        ))}
                        {gameState === 'playing' && <PlayingCard faceDown size="md" />}
                    </div>
                </div>

                {/* Player's Hand */}
                <div className="relative z-10">
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Your Hand ({getHandTotal(playerHand)})</div>
                    <div className="flex justify-center gap-3 h-36 items-center">
                        {playerHand.map((c, i) => (
                            <PlayingCard key={i} suit={c.suit} rank={c.rank} size="md" />
                        ))}
                    </div>
                </div>
            </div>

            {gameState === 'betting' && (
                <button onClick={startDeal} disabled={isDealing || balance < betSize} className="px-16 py-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-3xl uppercase tracking-[0.3em] transition-all shadow-[0_15px_40px_-10px_rgba(16,185,129,0.6)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                    {isDealing ? 'Dealing...' : 'DEAL $50'}
                </button>
            )}

            {gameState === 'playing' && (
                <div className="flex justify-center gap-8">
                    <button onClick={hit} className="px-12 py-5 bg-emerald-500/10 hover:bg-emerald-500/20 border-4 border-emerald-500 text-emerald-500 font-black rounded-3xl uppercase tracking-widest transition-all shadow-[0_10px_30px_-5px_rgba(16,185,129,0.4)] active:scale-95">Hit</button>
                    <button onClick={stand} className="px-12 py-5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-3xl uppercase tracking-widest transition-all shadow-2xl active:scale-95">Stand</button>
                </div>
            )}

            {gameState === 'result' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className={`text-6xl font-black italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] ${result.includes('WIN') ? 'text-emerald-400' : 'text-red-500'}`}>{result}</div>
                    <button onClick={() => { setPlayerHand([]); setDealerHand([]); setResult(''); setGameState('betting'); }} className="px-16 py-5 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-3xl uppercase tracking-widest transition-all shadow-2xl active:scale-95">Next Hand</button>
                </motion.div>
            )}

            <div className="mt-16 px-6 py-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 max-w-lg mx-auto">
                <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-emerald-500">The 0.5% Trap:</strong> Even with &quot;perfect strategy,&quot; you are statistically guaranteed to hit $0 if you stay at this table long enough. The house always wins in the long run.
                </p>
            </div>
        </div>
    );
}

function RouletteEngine({ onAction, balance, setBalance, playSound }: GameEngineProps) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [lastNumber, setLastNumber] = useState<number | null>(null);
    const [bet, setBet] = useState<'red' | 'black' | null>(null);
    const [result, setResult] = useState('');

    const betSize = 25;

    const spin = async () => {
        if (!bet || balance < betSize || isSpinning) return;

        setIsSpinning(true);
        setResult('');
        setBalance((b: number) => b - betSize);
        onAction(-betSize);
        playSound('spin');

        await new Promise(r => setTimeout(r, 1500));

        const num = Math.floor(Math.random() * 38);
        setLastNumber(num);

        const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(num);
        const isBlack = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35].includes(num);
        const isGreen = num === 0 || num === 37;

        if ((bet === 'red' && isRed) || (bet === 'black' && isBlack)) {
            setResult('WIN! +$50');
            setBalance((b: number) => b + betSize * 2);
            onAction(betSize);
            playSound('win');
            playSound('bell');
        } else {
            setResult(isGreen ? 'HOUSE WINS (0/00)' : 'LOSE');
            playSound('loss');
        }

        setIsSpinning(false);
    };

    return (
        <div className="max-w-md w-full text-center">
            <div className={`w-56 h-56 rounded-full border-[12px] border-slate-900 mx-auto mb-16 flex items-center justify-center text-7xl font-black relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-slate-950 ${isSpinning ? 'animate-spin-slow' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent z-10" />
                <div className={`absolute inset-0 ${isSpinning ? 'opacity-20 transition-opacity' : 'opacity-100'}`}>
                    <div className="absolute inset-0 border-[20px] border-green-900/10 rounded-full" />
                </div>
                <motion.span
                    key={lastNumber}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`relative z-20 ${lastNumber === 0 || lastNumber === 37 ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]' : [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(lastNumber as number) ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'text-slate-200'}`}
                >
                    {lastNumber === 37 ? '00' : lastNumber ?? '?'}
                </motion.span>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-12">
                <button
                    onClick={() => { setBet('red'); playSound('click'); }}
                    className={`py-8 rounded-[2rem] border-4 transition-all font-black text-2xl uppercase tracking-[0.2em] relative overflow-hidden ${bet === 'red' ? 'bg-red-600 border-white shadow-[0_0_30px_rgba(239,68,68,0.5)] text-white' : 'bg-red-900/10 border-red-900/30 text-red-500/40 hover:bg-red-900/20'}`}
                >
                    Red
                </button>
                <button
                    onClick={() => { setBet('black'); playSound('click'); }}
                    className={`py-8 rounded-[2rem] border-4 transition-all font-black text-2xl uppercase tracking-[0.2em] relative overflow-hidden ${bet === 'black' ? 'bg-slate-900 border-white shadow-[0_0_30px_rgba(255,255,255,0.1)] text-white' : 'bg-slate-950 border-slate-900/50 text-slate-700 hover:bg-slate-900'}`}
                >
                    Black
                </button>
            </div>

            <button
                onClick={spin}
                disabled={!bet || isSpinning || balance < betSize}
                className={`w-full py-5 rounded-3xl font-black text-3xl uppercase tracking-[0.3em] transition-all active:scale-95 shadow-2xl ${isSpinning || !bet ? 'bg-slate-800 text-slate-600' : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
                    }`}
            >
                {isSpinning ? 'Spinning...' : 'SPIN $25'}
            </button>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-10 text-4xl font-black italic ${result.includes('WIN') ? 'text-emerald-400' : 'text-red-500'}`}
                    >
                        {result}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-12 p-4 bg-slate-900 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-500">
                    <strong>The Green Advantage:</strong> American Roulette has two green slots (0 and 00). This is why &quot;Red or Black&quot; is never a 50/50 bet—the house always has a 5.26% edge.
                </p>
            </div>
        </div>
    );
}

function CrapsEngine({ onAction, balance, setBalance, playSound }: GameEngineProps) {
    const [gameState, setGameState] = useState<'comeout' | 'point'>('comeout');
    const [point, setPoint] = useState<number | null>(null);
    const [lastRoll, setLastRoll] = useState<number[]>([1, 1]);
    const [result, setResult] = useState('');
    const [isRolling, setIsRolling] = useState(false);

    const betSize = 25;

    const rollDice = async () => {
        if (balance < betSize || isRolling) return;

        setIsRolling(true);
        setResult('');
        setBalance((b: number) => b - betSize);
        onAction(-betSize);
        playSound('spin');

        await new Promise(r => setTimeout(r, 1000));

        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const sum = d1 + d2;
        setLastRoll([d1, d2]);
        playSound('click');

        if (gameState === 'comeout') {
            if (sum === 7 || sum === 11) {
                setResult('PASS! (WIN) +$50');
                setBalance((b: number) => b + betSize * 2);
                onAction(betSize);
                playSound('win');
                playSound('bell');
            } else if (sum === 2 || sum === 3 || sum === 12) {
                setResult('CRAPS! (LOSE)');
                playSound('loss');
            } else {
                setPoint(sum);
                setGameState('point');
                setResult(`POINT IS ${sum}`);
                playSound('deal');
            }
        } else {
            if (sum === point) {
                setResult('MADE POINT! (WIN) +$50');
                setBalance((b: number) => b + betSize * 2);
                onAction(betSize);
                setGameState('comeout');
                setPoint(null);
                playSound('win');
                playSound('bell');
            } else if (sum === 7) {
                setResult('SEVEN OUT! (LOSE)');
                setGameState('comeout');
                setPoint(null);
                playSound('loss');
            } else {
                playSound('click');
            }
        }

        setIsRolling(false);
    };

    return (
        <div className="max-w-md w-full text-center">
            <div className="flex justify-center gap-8 mb-16">
                {lastRoll.map((d, i) => (
                    <motion.div
                        key={i}
                        animate={isRolling ? {
                            rotate: [0, 90, 180, 270, 360],
                            scale: [1, 1.3, 0.7, 1],
                            x: [0, 20, -20, 0],
                            y: [0, -30, 30, 0]
                        } : {}}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="w-24 h-24 bg-white rounded-[1.5rem] flex items-center justify-center text-5xl text-slate-900 font-bold shadow-[0_15px_40px_-10px_rgba(255,255,255,0.3)] border-4 border-slate-200"
                    >
                        {d}
                    </motion.div>
                ))}
            </div>

            <div className="bg-slate-950 border-2 border-indigo-500/30 rounded-[2.5rem] p-8 mb-10 shadow-inner">
                <div className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-3">Table Status</div>
                <div className="text-3xl font-black text-white uppercase italic tracking-tighter">
                    {gameState === 'comeout' ? 'Come Out Roll' : `Point is: ${point}`}
                </div>
            </div>

            <button
                onClick={rollDice}
                disabled={isRolling || balance < betSize}
                className={`w-full py-6 rounded-3xl font-black text-3xl uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 ${isRolling ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                    }`}
            >
                {isRolling ? 'Rolling...' : 'ROLL DICE $25'}
            </button>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, rotateX: 90 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                        className={`mt-10 text-4xl font-black italic tracking-tight ${result.includes('WIN') || result.includes('MADE') || result.includes('PASS') ? 'text-emerald-400' : result.includes('POINT') ? 'text-indigo-400' : 'text-red-500'}`}
                    >
                        {result}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-12 p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                <p className="text-xs text-slate-500 leading-relaxed italic">
                    <strong>The Complexity Trap:</strong> Craps energy hides the drain. While the &quot;Pass Line&quot; is okay, the side bets are pure math suicide for your bankroll.
                </p>
            </div>
        </div>
    );
}

function BaccaratEngine({ onAction, balance, setBalance, playSound }: GameEngineProps) {
    const [isDealing, setIsDealing] = useState(false);
    const [playerHand, setPlayerHand] = useState<number[]>([]);
    const [bankerHand, setBankerHand] = useState<number[]>([]);
    const [bet, setBet] = useState<'player' | 'banker' | null>(null);
    const [result, setResult] = useState('');

    const betSize = 100;

    const deal = async () => {
        if (!bet || balance < betSize || isDealing) return;

        setIsDealing(true);
        setResult('');
        setBalance((b: number) => b - betSize);
        onAction(-betSize);
        playSound('chip');

        await new Promise(r => setTimeout(r, 1200));

        const pHand = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
        const bHand = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
        const pSum = (pHand[0] + pHand[1]) % 10;
        const bSum = (bHand[0] + bHand[1]) % 10;

        setPlayerHand(pHand);
        playSound('deal');
        await new Promise(r => setTimeout(r, 400));
        setBankerHand(bHand);
        playSound('deal');

        if (pSum > bSum) {
            setResult('PLAYER WINS');
            if (bet === 'player') {
                setBalance((b: number) => b + betSize * 2);
                onAction(betSize);
                playSound('win');
            } else {
                playSound('loss');
            }
        } else if (bSum > pSum) {
            setResult('BANKER WINS');
            if (bet === 'banker') {
                const winAmount = betSize * 1.95;
                setResult('BANKER WINS (5% COMM.)');
                setBalance((b: number) => b + winAmount);
                onAction(winAmount - betSize);
                playSound('win');
                playSound('chip');
            } else {
                playSound('loss');
            }
        } else {
            setResult('TIE');
            setBalance((b: number) => b + betSize);
            onAction(0);
            playSound('deal');
        }

        setIsDealing(false);
    };

    return (
        <div className="max-w-2xl w-full text-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="p-8 bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] shadow-inner">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Player Hand</div>
                    <div className="flex justify-center gap-4">
                        {playerHand.map((c, i) => (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} key={i} className="w-16 h-24 bg-white rounded-xl flex items-center justify-center text-slate-900 font-bold text-2xl shadow-xl">{c}</motion.div>
                        ))}
                    </div>
                </div>
                <div className="p-8 bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] shadow-inner">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Banker Hand</div>
                    <div className="flex justify-center gap-4">
                        {bankerHand.map((c, i) => (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} key={i} className="w-16 h-24 bg-white rounded-xl flex items-center justify-center text-slate-900 font-bold text-2xl shadow-lg border-2 border-blue-500/20">{c}</motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                    onClick={() => { setBet('player'); playSound('click'); }}
                    className={`py-5 rounded-2xl font-black text-xl uppercase transition-all border-4 ${bet === 'player' ? 'bg-slate-100 text-slate-950 border-white shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                    Bet Player
                </button>
                <button
                    onClick={() => { setBet('banker'); playSound('click'); }}
                    className={`py-5 rounded-2xl font-black text-xl uppercase transition-all border-4 ${bet === 'banker' ? 'bg-slate-100 text-slate-950 border-white shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                    Bet Banker
                </button>
            </div>

            <button
                onClick={deal}
                disabled={!bet || isDealing || balance < betSize}
                className={`w-full py-6 rounded-3xl font-black text-3xl uppercase tracking-widest transition-all shadow-2xl active:scale-95 ${!bet || isDealing ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                    }`}
            >
                {isDealing ? 'Dealing...' : 'DEAL $100'}
            </button>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-10 text-4xl font-black italic tracking-tighter drop-shadow-lg ${result.includes('WIN') || result === 'PLAYER WINS' || result === 'BANKER WINS' ? 'text-blue-400' : 'text-red-500'}`}
                    >
                        {result}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-12 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10 max-w-sm mx-auto">
                <p className="text-xs text-slate-500 italic">
                    <strong>The Commission Trap:</strong> Notice the &quot;Banker Wins&quot; payout? The house takes a 5% commission on every winning Banker bet. Over time, this &quot;small&quot; tax destroys your bankroll.
                </p>
            </div>
        </div>
    );
}

function PaiGowEngine({ onAction, balance, setBalance, playSound }: GameEngineProps) {
    const [isDealing, setIsDealing] = useState(false);
    const [result, setResult] = useState('');

    const betSize = 50;

    const play = async () => {
        if (balance < betSize || isDealing) return;

        setIsDealing(true);
        setResult('');
        setBalance((b: number) => b - betSize);
        onAction(-betSize);
        playSound('chip');

        await new Promise(r => setTimeout(r, 1500));

        const outcome = Math.random();

        if (outcome < 0.6) {
            setResult('PUSH (TIE)');
            setBalance((b: number) => b + betSize);
            onAction(0);
            playSound('deal');
        } else if (outcome < 0.8) {
            setResult('WIN! (+$47.50 after commission)');
            setBalance((b: number) => b + betSize * 1.95);
            onAction(betSize * 0.95);
            playSound('win');
            playSound('chip');
        } else {
            setResult('HOUSE WINS');
            playSound('loss');
        }

        setIsDealing(false);
    };

    return (
        <div className="max-w-md w-full text-center">
            <div className="p-12 bg-slate-900 border-4 border-emerald-900/40 rounded-[3rem] mb-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                <Dices className="mx-auto text-emerald-500 mb-6 opacity-40 group-hover:scale-110 transition-transform" size={64} />
                <h4 className="text-xl font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">The Slow Grinder</h4>
                <p className="text-slate-500 text-xs italic">60% Push Frequency</p>
            </div>

            <button
                onClick={play}
                disabled={isDealing || balance < betSize}
                className={`w-full py-6 rounded-3xl font-black text-3xl uppercase tracking-widest transition-all shadow-2xl active:scale-95 ${isDealing ? 'bg-slate-800 text-slate-600' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    }`}
            >
                {isDealing ? 'Dealing...' : 'DEAL $50'}
            </button>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`mt-10 text-3xl font-black uppercase tracking-tighter italic ${result.includes('WIN') ? 'text-emerald-400' : result.includes('PUSH') ? 'text-slate-400' : 'text-red-500'}`}
                    >
                        {result}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-12 p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                <p className="text-xs text-slate-400 leading-relaxed">
                    <strong>The Time Trap:</strong> Pai Gow is designed to have many &quot;pushes&quot; (ties). This keeps you at the table for hours, slowly bleeding you via the commission and exposing you to the house edge longer than any other game.
                </p>
            </div>
        </div>
    );
}

function VideoPokerEngine({ onAction, balance, setBalance, playSound }: GameEngineProps) {
    const [isDealing, setIsDealing] = useState(false);
    const [result, setResult] = useState('');

    const betSize = 5;

    const deal = async () => {
        if (balance < betSize || isDealing) return;

        setIsDealing(true);
        setResult('');
        setBalance((b: number) => b - betSize);
        onAction(-betSize);
        playSound('chip');

        await new Promise(r => setTimeout(r, 600));

        const roll = Math.random();
        if (roll < 0.2) {
            setResult('JACKS OR BETTER (PUSH)');
            setBalance((b: number) => b + betSize);
            onAction(0);
            playSound('deal');
        } else if (roll < 0.25) {
            setResult('TWO PAIR! WIN $10');
            setBalance((b: number) => b + 10);
            onAction(5);
            playSound('win');
        } else if (roll < 0.26) {
            setResult('THREE OF A KIND! WIN $15');
            setBalance((b: number) => b + 15);
            onAction(10);
            playSound('win');
            playSound('bell');
        } else {
            setResult('LOSING HAND');
            playSound('loss');
        }

        setIsDealing(false);
    };

    return (
        <div className="max-w-md w-full text-center">
            <div className="bg-blue-900/10 border-4 border-blue-500/50 rounded-[3rem] p-10 mb-10 shadow-[0_0_40px_rgba(59,130,246,0.2)]">
                <div className="grid grid-cols-5 gap-3 mb-12">
                    {[1, 2, 3, 4, 5].map(i => (
                        <motion.div
                            key={i}
                            animate={isDealing ? { rotateY: 180 } : { rotateY: 0 }}
                            className="aspect-[2/3] bg-white rounded-xl flex items-center justify-center text-slate-950 font-black shadow-xl text-3xl border-2 border-blue-100"
                        >
                            {isDealing ? '' : '?'}
                        </motion.div>
                    ))}
                </div>
                <button
                    onClick={deal}
                    disabled={isDealing || balance < betSize}
                    className={`w-full py-5 rounded-2xl font-black text-3xl uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 ${isDealing ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                >
                    {isDealing ? 'Dealing...' : 'DEAL $5'}
                </button>
            </div>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-3xl font-black italic tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] ${result.includes('WIN') || result.includes('PUSH') ? 'text-blue-400' : 'text-red-500'}`}
                    >
                        {result}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-12 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                <p className="text-xs text-slate-400 leading-relaxed italic">
                    <strong>The Paytable Trap:</strong> Subtle math changes everything. A "9/6" machine pays 9 for a Full House, while an "8/5" pays 8. Most players never notice, but the house edge doubles.
                </p>
            </div>
        </div>
    );
}

function KenoEngine({ onAction, balance, setBalance, playSound }: GameEngineProps) {
    const [selected, setSelected] = useState<number[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawn, setDrawn] = useState<number[]>([]);
    const [matches, setMatches] = useState(0);
    const [result, setResult] = useState('');

    const betSize = 10;

    const toggle = (num: number) => {
        if (isDrawing) return;
        playSound('click');
        if (selected.includes(num)) {
            setSelected(selected.filter(n => n !== num));
        } else if (selected.length < 5) {
            setSelected([...selected, num]);
        }
    };

    const draw = async () => {
        if (selected.length === 0 || isDrawing || balance < betSize) return;

        setIsDrawing(true);
        setDrawn([]);
        setMatches(0);
        setResult('');
        setBalance((b: number) => b - betSize);
        onAction(-betSize);
        playSound('spin');

        let drawResults: number[] = [];
        for (let i = 0; i < 15; i++) {
            let num;
            do { num = Math.floor(Math.random() * 80) + 1; } while (drawResults.includes(num));
            drawResults.push(num);
            setDrawn([...drawResults]);
            playSound('click');
            await new Promise(r => setTimeout(r, 100));
        }

        const matchCount = drawResults.filter(n => selected.includes(n)).length;
        setMatches(matchCount);

        if (matchCount >= 2) {
            const win = matchCount === 2 ? 10 : matchCount === 3 ? 30 : matchCount === 4 ? 100 : 500;
            setResult(`WIN! ${matchCount} MATCHES: +$${win}`);
            setBalance((b: number) => b + win);
            onAction(win - betSize);
            playSound('win');
            playSound('bell');
        } else {
            setResult('NO LUCK');
            playSound('loss');
        }

        setIsDrawing(false);
    };

    return (
        <div className="max-w-lg w-full text-center">
            <div className="grid grid-cols-10 gap-1 mb-10 p-4 bg-slate-900 rounded-[2rem] border-2 border-slate-800 shadow-inner">
                {Array.from({ length: 80 }, (_, i) => i + 1).map(num => (
                    <button
                        key={num}
                        onClick={() => toggle(num)}
                        disabled={isDrawing}
                        className={`aspect-square text-[10px] font-bold rounded-md transition-all flex items-center justify-center ${selected.includes(num) ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.5)] z-10' :
                            drawn.includes(num) ? 'bg-red-500/50 text-white z-20 scale-110' :
                                'bg-slate-950 text-slate-600 hover:bg-slate-800'
                            } ${selected.includes(num) && drawn.includes(num) ? 'bg-green-500 text-white ring-2 ring-white scale-125' : ''}`}
                    >
                        {num}
                    </button>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
                <div className="flex-1 text-left px-6 py-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Selections</div>
                    <div className="text-xl font-mono text-yellow-500 font-bold tracking-tighter">{selected.length}/5 Picked</div>
                </div>
                <button
                    onClick={draw}
                    disabled={selected.length === 0 || isDrawing || balance < betSize}
                    className={`px-12 py-5 rounded-2xl font-black text-2xl uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 ${isDrawing || selected.length === 0 ? 'bg-slate-800 text-slate-600' : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                        }`}
                >
                    {isDrawing ? 'Drawing...' : 'DRAW $10'}
                </button>
            </div>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`text-3xl font-black italic tracking-tighter ${result.includes('WIN') ? 'text-yellow-400' : 'text-slate-500'}`}
                    >
                        {result}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-12 p-5 bg-yellow-500/5 rounded-2xl border border-yellow-500/10">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                    <strong>The Donation Trap:</strong> Keno is statistically the worst game in any casino. With a house edge often exceeding 25%, it is effectively a voluntary "donation" to the house while you wait for other results.
                </p>
            </div>
        </div>
    );
}
