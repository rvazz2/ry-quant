"use client";

import React, { useState, useMemo } from 'react';
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
    Skull
} from 'lucide-react';

type TabType = 'slots' | 'tables' | 'electronic' | 'other' | 'reality';

export default function CasinoGuide() {
    const [activeTab, setActiveTab] = useState<TabType>('slots');

    // Loss Calculator State
    const [bankroll, setBankroll] = useState(100);
    const [hours, setHours] = useState(1);
    const [betSize, setBetSize] = useState(10);

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

    const renderSlots = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gold-500/10 rounded-lg">
                    <Zap className="text-yellow-500" size={24} />
                </div>
                <div>
                    <h4 className="text-xl font-bold text-white">The Floor Anchors</h4>
                    <p className="text-sm text-slate-400">High-energy machines designed for max engagement.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {[
                    { title: "Classic Slots", desc: "The old-school 'three-reel' mechanical machines. Simple, direct, and fast-paced." },
                    { title: "Video Slots", desc: "Immersive screens themed after movies and TV like Wheel of Fortune or Buffalo. Heavy on audio-visual 'wins' that hide net losses." },
                    { title: "Progressives", desc: "Linked machines where a portion of every bet goes into a massive, life-changing jackpot. These offer the worst base odds." }
                ].map((s, i) => (
                    <div key={i} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-yellow-500/30 transition-all">
                        <div className="font-bold text-yellow-500 mb-1">{s.title}</div>
                        <p className="text-sm text-slate-400">{s.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTables = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Dices className="text-emerald-500" size={24} />
                </div>
                <div>
                    <h4 className="text-xl font-bold text-white">Table Games</h4>
                    <p className="text-sm text-slate-400">Skill meets luck in the heart of the casino floor.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { name: "Blackjack", desc: "Play against dealer to 21. Best odds using 'basic strategy'." },
                    { name: "Roulette", desc: "Iconic spinning wheel. Pure luck, zero skill involved." },
                    { name: "Craps", desc: "High-energy dice game. Built on momentum and complex odds." },
                    { name: "Baccarat", desc: "Player vs Banker. Lowest house edges on the floor." },
                    { name: "Pai Gow Poker", desc: "Two-handed poker. Slow pace, frequent 'pushes' (ties)." }
                ].map((t, i) => (
                    <div key={i} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-emerald-500/30 transition-all">
                        <div className="font-bold text-emerald-400 mb-1">{t.name}</div>
                        <p className="text-xs text-slate-400">{t.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderReality = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="p-6 bg-red-950/20 border border-red-500/30 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <Skull className="text-red-500" size={28} />
                    <h4 className="text-2xl font-black text-white tracking-tight">WHY THE HOUSE ALWAYS WINS</h4>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-red-400 border-b border-red-500/20">
                                <th className="text-left py-3">Game</th>
                                <th className="text-center py-3">House Edge</th>
                                <th className="text-right py-3">Outcome Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300">
                            {[
                                { name: "Blackjack (Perfect)", edge: "0.5%", status: "Inevitable Loss" },
                                { name: "Baccarat (Banker)", edge: "1.06%", status: "Slow Drain" },
                                { name: "Roulette (American)", edge: "5.26%", status: "High Risk" },
                                { name: "Slot Machines", edge: "10-15%", status: "Extreme Churn" },
                                { name: "Keno", edge: "25-30%", status: "Pure Donation" }
                            ].map((row, i) => (
                                <tr key={i} className="border-b border-red-500/10 last:border-0 hover:bg-red-500/5 transition-colors">
                                    <td className="py-3 font-bold text-white">{row.name}</td>
                                    <td className="py-3 text-center text-red-400 font-mono">{row.edge}</td>
                                    <td className="py-3 text-right font-bold text-red-500/80">{row.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="p-8 bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Calculator size={80} />
                </div>

                <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Calculator className="text-cyan-400" size={20} />
                    The Expected Loss Calculator
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Starting Bankroll</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                            <input
                                type="number"
                                value={bankroll}
                                onChange={(e) => setBankroll(Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-8 pr-4 text-white font-mono focus:border-cyan-500 transition-all outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bet Size (Per Hand)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                            <input
                                type="number"
                                value={betSize}
                                onChange={(e) => setBetSize(Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-8 pr-4 text-white font-mono focus:border-cyan-500 transition-all outline-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hours Played</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="number"
                                value={hours}
                                onChange={(e) => setHours(Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white font-mono focus:border-cyan-500 transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <div className="text-xs font-medium text-red-400 mb-1">Expected Mathematical Loss</div>
                        <div className="text-4xl font-black text-red-500 font-mono">-${calculation.expectedLoss.toLocaleString()}</div>
                        <div className="text-xs text-slate-500 mt-2">Based on 60 hands/hr and 1.5% edge</div>
                    </div>
                    <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                        <div className="text-xs font-medium text-slate-400 mb-1">Likely Remaining Funds</div>
                        <div className="text-4xl font-black text-white font-mono">${calculation.remaining.toLocaleString()}</div>
                        <div className="text-xs text-slate-500 mt-2">The Law of Large Numbers at work</div>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-red-600/10 border-l-4 border-red-600 rounded-r-lg">
                    <div className="flex gap-3">
                        <TrendingDown className="text-red-500 flex-shrink-0" size={20} />
                        <p className="text-sm text-slate-300 leading-relaxed">
                            <strong className="text-red-400">The Mathematical Truth:</strong> You don't just lose your initial ${bankroll}. You bet, win small, then bet that money again. This "churn" means the house edge eats your wealth every single time a chip touches the table. Even with perfect play, you are playing against infinite bankroll (the house).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-10 text-center">
                <div className="inline-flex p-3 bg-yellow-500/10 rounded-2xl mb-4 border border-yellow-500/20">
                    <Dices className="text-yellow-500" size={32} />
                </div>
                <h2 className="text-5xl font-black text-white tracking-tight mb-2 italic">Casino</h2>
                <p className="text-2xl font-bold text-yellow-500/80 tracking-wide">"Good Luck,"</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full lg:w-72 flex-shrink-0 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all border-2 uppercase tracking-widest ${activeTab === tab.id
                                    ? tab.id === 'reality'
                                        ? 'bg-red-500/10 border-red-500 text-red-500 shadow-lg shadow-red-500/10'
                                        : 'bg-yellow-500/10 border-yellow-600 text-yellow-500 shadow-lg shadow-yellow-500/10'
                                    : 'bg-slate-950 border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900 border-slate-800'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}

                    <div className="mt-10 p-6 bg-slate-950 border border-slate-800 rounded-3xl hidden lg:block">
                        <p className="text-xs text-slate-500 font-bold mb-4 uppercase tracking-tighter">Pro Tip</p>
                        <p className="text-sm text-slate-400 leading-relaxed italic">
                            "Many hotels like The Venetian offer free lessons at 10:00 AM. They teach you the rules because they know once you know how to play, you’re more likely to give them your money."
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
                            {activeTab === 'electronic' && (
                                <div className="space-y-6">
                                    <h4 className="text-xl font-bold text-white mb-4">Electronic & Machine Games</h4>
                                    <div className="space-y-4">
                                        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                                            <div className="font-bold text-cyan-400 mb-2">Video Poker</div>
                                            <p className="text-sm text-slate-400 leading-relaxed">Found at almost every casino bar. Unlike slots, it involves skill; you choose which cards to "hold." However, pay tables are often adjusted to maintain the house edge.</p>
                                        </div>
                                        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                                            <div className="font-bold text-cyan-400 mb-2">Electronic Table Games (ETGs)</div>
                                            <p className="text-sm text-slate-400 leading-relaxed">"Stadium Gaming" terminals where you play roulette or blackjack on a screen while a central machine handles the action. Faster play = faster loss.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'other' && (
                                <div className="space-y-6">
                                    <h4 className="text-xl font-bold text-white mb-4">Other Options</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { name: "Poker Rooms", desc: "Play Texas Hold 'em against other people, not the house. The house takes a 'rake' (cut)." },
                                            { name: "Sportsbooks", desc: "Lounges for betting on NFL, horse racing, and more. High social engagement." },
                                            { name: "Keno/Bingo", desc: "Lottery-style games. Statistically some of the worst odds in existence." }
                                        ].map((o, i) => (
                                            <div key={i} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                                                <div className="font-bold text-indigo-400 mb-2">{o.name}</div>
                                                <p className="text-xs text-slate-400 leading-loose">{o.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
