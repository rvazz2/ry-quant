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
    Skull,
    X
} from 'lucide-react';

type TabType = 'slots' | 'tables' | 'electronic' | 'other' | 'reality';

export default function CasinoGuide() {
    const [activeTab, setActiveTab] = useState<TabType>('slots');

    // Session State
    const [balance, setBalance] = useState(1000);
    const [totalLost, setTotalLost] = useState(0);
    const [actionCount, setActionCount] = useState(0);
    const [activeGame, setActiveGame] = useState<string | null>(null);
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
                    { title: "Classic Slots", desc: "The old-school 'three-reel' mechanical machines. Simple, direct, and fast-paced.", id: 'slots' },
                    { title: "Video Slots", desc: "Immersive screens themed after movies and TV like Wheel of Fortune or Buffalo. Heavy on audio-visual 'wins' that hide net losses.", id: 'slots' },
                    { title: "Progressives", desc: "Linked machines where a portion of every bet goes into a massive, life-changing jackpot. These offer the worst base odds.", id: 'slots' }
                ].map((s, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveGame('slots')}
                        className="p-4 text-left bg-slate-900/50 border border-slate-800 rounded-xl hover:border-yellow-500/30 transition-all group"
                    >
                        <div className="flex justify-between items-center">
                            <div className="font-bold text-yellow-500 mb-1 group-hover:text-yellow-400 transition-colors">{s.title}</div>
                            <Zap size={14} className="text-yellow-500/0 group-hover:text-yellow-500/50 transition-all" />
                        </div>
                        <p className="text-sm text-slate-400">{s.desc}</p>
                    </button>
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
                    { name: "Blackjack", desc: "Play against dealer to 21. Best odds using 'basic strategy'.", id: 'blackjack' },
                    { name: "Roulette", desc: "Iconic spinning wheel. Pure luck, zero skill involved.", id: 'roulette' },
                    { name: "Craps", desc: "High-energy dice game. Built on momentum and complex odds.", id: 'craps' },
                    { name: "Baccarat", desc: "Player vs Banker. Lowest house edges on the floor.", id: 'baccarat' },
                    { name: "Pai Gow Poker", desc: "Two-handed poker. Slow pace, frequent 'pushes' (ties).", id: 'paigow' }
                ].map((t, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveGame(t.id)}
                        className="p-4 text-left bg-slate-900/50 border border-slate-800 rounded-xl hover:border-emerald-500/30 transition-all group"
                    >
                        <div className="flex justify-between items-center">
                            <div className="font-bold text-emerald-400 mb-1 group-hover:text-emerald-300 transition-colors">{t.name}</div>
                            <TrendingDown size={14} className="text-emerald-500/0 group-hover:text-emerald-500/50 transition-all" />
                        </div>
                        <p className="text-xs text-slate-400">{t.desc}</p>
                    </button>
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
                                        <button
                                            onClick={() => setActiveGame('videopoker')}
                                            className="p-6 text-left bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-cyan-500/30 transition-all group w-full"
                                        >
                                            <div className="font-bold text-cyan-400 mb-2 group-hover:text-cyan-300">Video Poker</div>
                                            <p className="text-sm text-slate-400 leading-relaxed">Found at almost every casino bar. Unlike slots, it involves skill; you choose which cards to "hold." However, pay tables are often adjusted to maintain the house edge.</p>
                                        </button>
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
                                            { name: "Poker Rooms", desc: "Texas Hold 'em vs others.", id: 'poker' },
                                            { name: "Sportsbooks", desc: "Betting on NFL/Horses.", id: 'sports' },
                                            { name: "Keno/Bingo", desc: "Statistically worst odds (25%+ edge).", id: 'keno' }
                                        ].map((o, i) => (
                                            <button
                                                key={i}
                                                onClick={() => ['poker', 'sports', 'keno'].includes(o.id) && setActiveGame(o.id)}
                                                className="p-4 text-left bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all group"
                                            >
                                                <div className="font-bold text-indigo-400 mb-2 group-hover:text-indigo-300">{o.name}</div>
                                                <p className="text-xs text-slate-400 leading-loose">{o.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Reality Check Overlay */}
            <AnimatePresence>
                {showRealityCheck && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-[2rem] p-8 text-center shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="text-red-500" size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">REALITY CHECK</h3>
                            <p className="text-slate-400 mb-6 font-medium">
                                You just completed <span className="text-red-500 font-bold">{actionCount}</span> actions.
                                In this session, the house edge has already "taxed" your bankroll by
                                <span className="text-red-500 font-bold"> ${totalLost.toLocaleString()}</span>.
                            </p>

                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8">
                                <p className="text-sm text-red-400 italic">
                                    "The only way to win is to not play the Law of Large Numbers."
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setShowRealityCheck(false)}
                                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-red-600/20"
                                >
                                    I understand, keep playing
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRealityCheck(false);
                                        setActiveGame(null);
                                    }}
                                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black rounded-xl transition-all uppercase tracking-widest"
                                >
                                    Exit to Menu
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Game Overlay Container */}
            <AnimatePresence>
                {activeGame && (
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        className="fixed inset-0 z-[80] bg-slate-950 flex flex-col"
                    >
                        {/* Game Header */}
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-black/20">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-yellow-500/10 rounded-lg">
                                    <Dices className="text-yellow-500" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-widest">{activeGame} Floor</h3>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="text-xs font-mono text-emerald-400">Balance: ${balance.toLocaleString()}</div>
                                        <div className="text-xs font-mono text-slate-500">Actions: {actionCount}</div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveGame(null)}
                                className="p-2 hover:bg-red-500/10 rounded-xl text-red-500 transition-all hover:text-red-400"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Game Engine Space */}
                        <div className="flex-1 p-6 flex items-center justify-center">
                            {activeGame === 'slots' && <SlotsEngine onAction={handleAction} balance={balance} setBalance={setBalance} />}
                            {activeGame === 'blackjack' && <BlackjackEngine onAction={handleAction} balance={balance} setBalance={setBalance} />}
                            {activeGame === 'roulette' && <RouletteEngine onAction={handleAction} balance={balance} setBalance={setBalance} />}
                            {activeGame === 'craps' && <CrapsEngine onAction={handleAction} balance={balance} setBalance={setBalance} />}
                            {activeGame === 'baccarat' && <BaccaratEngine onAction={handleAction} balance={balance} setBalance={setBalance} />}
                            {activeGame === 'paigow' && <PaiGowEngine onAction={handleAction} balance={balance} setBalance={setBalance} />}
                            {activeGame === 'videopoker' && <VideoPokerEngine onAction={handleAction} balance={balance} setBalance={setBalance} />}
                            {activeGame === 'keno' && <KenoEngine onAction={handleAction} balance={balance} setBalance={setBalance} />}
                            {['poker', 'sports'].includes(activeGame as string) && (
                                <div className="text-center">
                                    <div className="text-4xl font-black text-slate-700 mb-4 opacity-50 uppercase tracking-tighter italic select-none">Social Lobby</div>
                                    <p className="text-slate-500 text-lg">The {activeGame?.toUpperCase()} area is for people-watching. The house edge is in the 'rake' or 'vig', not the game logic itself.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- GAME ENGINES ---

function SlotsEngine({ onAction, balance, setBalance }: any) {
    const [reels, setReels] = useState(['🍒', '🍋', '🔔']);
    const [isSpinning, setIsSpinning] = useState(false);
    const [lastWin, setLastWin] = useState<number | null>(null);

    const symbols = ['🍒', '🍋', '🔔', '💎', '7️⃣', '🎰'];
    const betSize = 10;

    const spin = async () => {
        if (balance < betSize || isSpinning) return;

        setIsSpinning(true);
        setLastWin(null);
        setBalance((b: number) => b - betSize);
        onAction(-betSize);

        // Rigged RTP: 90%
        const winChance = 0.15;
        const isWin = Math.random() < winChance;

        await new Promise(r => setTimeout(r, 800));

        let newReels;
        let winAmount = 0;

        if (isWin) {
            const sym = symbols[Math.floor(Math.random() * symbols.length)];
            newReels = [sym, sym, sym];
            winAmount = betSize * 5;
            setBalance((b: number) => b + winAmount);
            onAction(winAmount - betSize);
        } else {
            const sym1 = symbols[Math.floor(Math.random() * symbols.length)];
            const sym2 = sym1;
            const sym3 = symbols.find(s => s !== sym1) || '🍒';
            newReels = [sym1, sym2, sym3];
        }

        setReels(newReels);
        setLastWin(winAmount > 0 ? winAmount : null);
        setIsSpinning(false);
    };

    return (
        <div className="max-w-md w-full text-center">
            <div className="inline-block p-8 bg-slate-900 border-4 border-yellow-600 rounded-[3rem] shadow-2xl mb-8 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-600 px-6 py-1 rounded-full text-[10px] font-black text-black uppercase tracking-[0.3em]">
                    90% RTP RIGGED
                </div>
                <div className="flex gap-4 mb-8">
                    {reels.map((symbol, i) => (
                        <motion.div
                            key={i}
                            animate={isSpinning ? { y: [0, -20, 20, 0], scale: [1, 1.1, 0.9, 1] } : {}}
                            transition={{ repeat: isSpinning ? Infinity : 0, duration: 0.1 }}
                            className="w-24 h-32 bg-slate-950 border-2 border-slate-800 rounded-2xl flex items-center justify-center text-5xl shadow-inner"
                        >
                            {symbol}
                        </motion.div>
                    ))}
                </div>
                <button
                    onClick={spin}
                    disabled={isSpinning || balance < betSize}
                    className={`w-full py-4 rounded-2xl font-black text-2xl uppercase tracking-widest transition-all ${isSpinning ? 'bg-slate-800 text-slate-600' : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20 active:scale-95'
                        }`}
                >
                    {isSpinning ? 'Spinning...' : 'SPIN $10'}
                </button>
            </div>

            <AnimatePresence>
                {lastWin && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-3xl font-black text-yellow-500 mb-4"
                    >
                        WIN! ${lastWin}
                    </motion.div>
                )}
            </AnimatePresence>

            <p className="text-sm text-slate-500 italic">
                Notice the "Near Misses"? They are mathematically tuned to keep you clicking while your balance trends to zero.
            </p>
        </div>
    );
}

function BlackjackEngine({ onAction, balance, setBalance }: any) {
    const [gameState, setGameState] = useState<'betting' | 'playing' | 'result'>('betting');
    const [playerHand, setPlayerHand] = useState<number[]>([]);
    const [dealerHand, setDealerHand] = useState<number[]>([]);
    const [result, setResult] = useState('');

    const betSize = 50;

    const startHand = () => {
        if (balance < betSize) return;
        setBalance((b: number) => b - betSize);
        onAction(-betSize);

        const p1 = Math.floor(Math.random() * 10) + 2;
        const p2 = Math.floor(Math.random() * 10) + 2;
        const d1 = Math.floor(Math.random() * 10) + 2;

        setPlayerHand([p1, p2]);
        setDealerHand([d1]);
        setGameState('playing');
        setResult('');
    };

    const hit = () => {
        const card = Math.floor(Math.random() * 10) + 2;
        const newHand = [...playerHand, card];
        setPlayerHand(newHand);

        const sum = newHand.reduce((a, b) => a + b, 0);
        if (sum > 21) {
            setResult('BUST!');
            setGameState('result');
        }
    };

    const stand = () => {
        let dHand = [...dealerHand];
        let dSum = dHand.reduce((a, b) => a + b, 0);
        while (dSum < 17) {
            dHand.push(Math.floor(Math.random() * 10) + 2);
            dSum = dHand.reduce((a, b) => a + b, 0);
        }
        setDealerHand(dHand);

        const pSum = playerHand.reduce((a, b) => a + b, 0);
        if (dSum > 21 || pSum > dSum) {
            setResult('YOU WIN!');
            setBalance((b: number) => b + betSize * 2);
            onAction(betSize);
        } else if (pSum === dSum) {
            setResult('PUSH');
            setBalance((b: number) => b + betSize);
            onAction(0);
        } else {
            setResult('DEALER WINS');
        }
        setGameState('result');
    };

    return (
        <div className="max-w-2xl w-full text-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="p-6 bg-slate-900 outline outline-2 outline-emerald-500/20 rounded-3xl">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Dealer's Hand</div>
                    <div className="flex justify-center gap-2 h-24 items-center">
                        {dealerHand.map((c, i) => (
                            <div key={i} className="w-12 h-16 bg-white rounded-lg flex items-center justify-center text-slate-900 font-bold text-xl shadow-lg border-2 border-emerald-500/30">{c}</div>
                        ))}
                        {gameState === 'playing' && <div className="w-12 h-16 bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 font-bold text-xl border-2 border-dashed border-slate-700">?</div>}
                    </div>
                </div>
                <div className="p-6 bg-slate-900 outline outline-4 outline-emerald-500/40 rounded-3xl">
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Your Hand ({playerHand.reduce((a, b) => a + b, 0)})</div>
                    <div className="flex justify-center gap-2 h-24 items-center">
                        {playerHand.map((c, i) => (
                            <div key={i} className="w-12 h-16 bg-white rounded-lg flex items-center justify-center text-slate-900 font-bold text-xl shadow-lg">{c}</div>
                        ))}
                    </div>
                </div>
            </div>

            {gameState === 'betting' && (
                <button onClick={startHand} className="px-12 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl uppercase tracking-[0.2em] transition-all">
                    DEAL $50
                </button>
            )}

            {gameState === 'playing' && (
                <div className="flex justify-center gap-4">
                    <button onClick={hit} className="px-8 py-4 bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 font-black rounded-xl uppercase tracking-widest hover:bg-emerald-500/20 transition-all">Hit</button>
                    <button onClick={stand} className="px-8 py-4 bg-slate-800 text-white font-black rounded-xl uppercase tracking-widest hover:bg-slate-700 transition-all">Stand</button>
                </div>
            )}

            {gameState === 'result' && (
                <div className="space-y-6">
                    <div className={`text-4xl font-black italic tracking-tighter ${result.includes('WIN') ? 'text-emerald-400' : 'text-red-500'}`}>{result}</div>
                    <button onClick={() => setGameState('betting')} className="px-12 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl uppercase tracking-widest transition-all">Next Hand</button>
                </div>
            )}

            <div className="mt-12 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 max-w-sm mx-auto">
                <p className="text-xs text-slate-400">
                    <strong>The 0.5% Trap:</strong> Even with "perfect strategy," you are statically guaranteed to hit $0 if you stay at this table long enough.
                </p>
            </div>
        </div>
    );
}

function RouletteEngine({ onAction, balance, setBalance }: any) {
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

        await new Promise(r => setTimeout(r, 1500));

        const num = Math.floor(Math.random() * 38); // 0-36 + 37 (00)
        setLastNumber(num);

        const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(num);
        const isBlack = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35].includes(num);
        const isGreen = num === 0 || num === 37;

        if ((bet === 'red' && isRed) || (bet === 'black' && isBlack)) {
            setResult('WIN!');
            setBalance((b: number) => b + betSize * 2);
            onAction(betSize);
        } else {
            setResult(isGreen ? 'HOUSE WINS (0/00)' : 'LOSE');
        }

        setIsSpinning(false);
    };

    return (
        <div className="max-w-md w-full text-center">
            <div className={`w-48 h-48 rounded-full border-8 border-slate-800 mx-auto mb-12 flex items-center justify-center text-6xl font-black relative overflow-hidden ${isSpinning ? 'animate-spin-slow' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
                <span className={lastNumber === 0 || lastNumber === 37 ? 'text-emerald-500' : [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(lastNumber as number) ? 'text-red-500' : 'text-slate-500'}>
                    {lastNumber === 37 ? '00' : lastNumber ?? '?'}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                    onClick={() => setBet('red')}
                    className={`py-6 rounded-2xl border-4 transition-all font-black text-xl uppercase tracking-widest ${bet === 'red' ? 'bg-red-600 border-white shadow-lg' : 'bg-red-900/40 border-red-900 text-red-500/50'}`}
                >
                    Red
                </button>
                <button
                    onClick={() => setBet('black')}
                    className={`py-6 rounded-2xl border-4 transition-all font-black text-xl uppercase tracking-widest ${bet === 'black' ? 'bg-slate-900 border-white shadow-lg' : 'bg-slate-950 border-slate-900 text-slate-700'}`}
                >
                    Black
                </button>
            </div>

            <button
                onClick={spin}
                disabled={!bet || isSpinning || balance < betSize}
                className={`w-full py-4 rounded-2xl font-black text-2xl uppercase tracking-widest transition-all ${isSpinning || !bet ? 'bg-slate-800 text-slate-600' : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                    }`}
            >
                {isSpinning ? 'Spinning...' : 'SPIN $25'}
            </button>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-6 text-2xl font-black ${result === 'WIN!' ? 'text-emerald-400' : 'text-red-500'}`}
                    >
                        {result}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-12 p-4 bg-slate-900 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-500">
                    <strong>The Green Advantage:</strong> American Roulette has two green slots (0 and 00). This is why "Red or Black" is never a 50/50 bet—the house always has a 5.26% edge.
                </p>
            </div>
        </div>
    );
}

function CrapsEngine({ onAction, balance, setBalance }: any) {
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

        await new Promise(r => setTimeout(r, 1000));

        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const sum = d1 + d2;
        setLastRoll([d1, d2]);

        if (gameState === 'comeout') {
            if (sum === 7 || sum === 11) {
                setResult('PASS! (WIN)');
                setBalance((b: number) => b + betSize * 2);
                onAction(betSize);
            } else if (sum === 2 || sum === 3 || sum === 12) {
                setResult('CRAPS! (LOSE)');
            } else {
                setPoint(sum);
                setGameState('point');
                setResult(`POINT IS ${sum}`);
            }
        } else {
            if (sum === point) {
                setResult('MADE POINT! (WIN)');
                setBalance((b: number) => b + betSize * 2);
                onAction(betSize);
                setGameState('comeout');
                setPoint(null);
            } else if (sum === 7) {
                setResult('SEVEN OUT! (LOSE)');
                setGameState('comeout');
                setPoint(null);
            }
        }

        setIsRolling(false);
    };

    return (
        <div className="max-w-md w-full text-center">
            <div className="flex justify-center gap-6 mb-12">
                {lastRoll.map((d, i) => (
                    <motion.div
                        key={i}
                        animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.2, 0.8, 1] } : {}}
                        className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl text-slate-900 font-bold shadow-2xl border-4 border-slate-200"
                    >
                        {d}
                    </motion.div>
                ))}
            </div>

            <div className="bg-slate-900 border-2 border-indigo-500/30 rounded-3xl p-6 mb-8">
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Table Status</div>
                <div className="text-2xl font-black text-white uppercase italic">
                    {gameState === 'comeout' ? 'Come Out Roll' : `Point is: ${point}`}
                </div>
            </div>

            <button
                onClick={rollDice}
                disabled={isRolling || balance < betSize}
                className={`w-full py-4 rounded-2xl font-black text-2xl uppercase tracking-widest transition-all ${isRolling ? 'bg-slate-800 text-slate-600' : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20 active:scale-95'
                    }`}
            >
                {isRolling ? 'Rolling...' : 'ROLL DICE $25'}
            </button>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`mt-6 text-3xl font-black ${result.includes('WIN') || result.includes('MADE') || result.includes('PASS') ? 'text-emerald-400' : result.includes('POINT') ? 'text-indigo-400' : 'text-red-500'}`}
                    >
                        {result}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-12 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                <p className="text-xs text-slate-500">
                    <strong>The Complexity Trap:</strong> Craps has dozens of bets. Some have an edge of 1.4%, others (like "Any 7") have edges as high as 16.67%. The noise and energy hides the drain.
                </p>
            </div>
        </div>
    );
}

function BaccaratEngine({ onAction, balance, setBalance }: any) {
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

        await new Promise(r => setTimeout(r, 1200));

        const pHand = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
        const bHand = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
        const pSum = (pHand[0] + pHand[1]) % 10;
        const bSum = (bHand[0] + bHand[1]) % 10;

        setPlayerHand(pHand);
        setBankerHand(bHand);

        if (pSum > bSum) {
            setResult('PLAYER WINS');
            if (bet === 'player') {
                setBalance((b: number) => b + betSize * 2);
                onAction(betSize);
            }
        } else if (bSum > pSum) {
            setResult('BANKER WINS');
            if (bet === 'banker') {
                const winAmount = betSize * 1.95;
                setBalance((b: number) => b + winAmount);
                onAction(winAmount - betSize);
            }
        } else {
            setResult('TIE');
            setBalance((b: number) => b + betSize);
            onAction(0);
        }

        setIsDealing(false);
    };

    return (
        <div className="max-w-2xl w-full text-center">
            <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="space-y-4">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Player ({(playerHand.reduce((a, b) => a + b, 0)) % 10})</div>
                    <div className="flex justify-center gap-2 h-24 items-center">
                        {playerHand.map((c, i) => (
                            <div key={i} className="w-12 h-16 bg-white rounded-lg flex items-center justify-center text-slate-900 font-bold text-xl shadow-lg">{c}</div>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Banker ({(bankerHand.reduce((a, b) => a + b, 0)) % 10})</div>
                    <div className="flex justify-center gap-2 h-24 items-center">
                        {bankerHand.map((c, i) => (
                            <div key={i} className="w-12 h-16 bg-white rounded-lg flex items-center justify-center text-slate-900 font-bold text-xl shadow-lg border-2 border-emerald-500/20">{c}</div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm mx-auto">
                <button
                    onClick={() => setBet('player')}
                    className={`py-4 rounded-2xl border-2 transition-all font-black uppercase tracking-widest ${bet === 'player' ? 'bg-blue-600 border-white text-white' : 'bg-blue-900/10 border-blue-900/30 text-blue-500/50'}`}
                >
                    Bet Player
                </button>
                <button
                    onClick={() => setBet('banker')}
                    className={`py-4 rounded-2xl border-2 transition-all font-black uppercase tracking-widest ${bet === 'banker' ? 'bg-emerald-600 border-white text-white' : 'bg-emerald-900/10 border-emerald-900/30 text-emerald-500/50'}`}
                >
                    Bet Banker
                </button>
            </div>

            <button
                onClick={deal}
                disabled={!bet || isDealing || balance < betSize}
                className={`px-12 py-4 rounded-2xl font-black text-2xl uppercase tracking-widest transition-all active:scale-95 ${isDealing || !bet ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 hover:bg-white text-slate-950 shadow-xl'
                    }`}
            >
                {isDealing ? 'Dealing...' : 'DEAL $100'}
            </button>

            <AnimatePresence>
                {result && (
                    <div className={`mt-8 text-3xl font-black italic ${(result === 'PLAYER WINS' && bet === 'player') || (result === 'BANKER WINS' && bet === 'banker') ? 'text-emerald-400' : result === 'TIE' ? 'text-slate-400' : 'text-red-500'
                        }`}>
                        {result}
                        {result === 'BANKER WINS' && bet === 'banker' && <div className="text-xs text-white/50 not-italic mt-1">(-5% Commission Deducted)</div>}
                    </div>
                )}
            </AnimatePresence>

            <div className="mt-12 p-4 bg-slate-900 rounded-xl border border-slate-800 max-w-md mx-auto">
                <p className="text-xs text-slate-500 italic">
                    "High rollers love Baccarat because of the low house edge (1.06% on Banker), but that 5% commission is how the house stays rich. They shave your profits on every single win."
                </p>
            </div>
        </div>
    );
}

function PaiGowEngine({ onAction, balance, setBalance }: any) {
    const [isDealing, setIsDealing] = useState(false);
    const [result, setResult] = useState('');

    const betSize = 50;

    const deal = async () => {
        if (balance < betSize || isDealing) return;

        setIsDealing(true);
        setResult('');
        setBalance((b: number) => b - betSize);
        onAction(-betSize);

        await new Promise(r => setTimeout(r, 1500));

        // Pai Gow is known for PUSHES. We simulate 70% pushes.
        const roll = Math.random();
        if (roll < 0.7) {
            setResult('PUSH (TIE)');
            setBalance((b: number) => b + betSize);
            onAction(0);
        } else if (roll < 0.85) {
            setResult('YOU WIN!');
            setBalance((b: number) => b + betSize * 1.95); // 5% commission even on wins
            onAction(betSize * 0.95);
        } else {
            setResult('HOUSE WINS');
        }

        setIsDealing(false);
    };

    return (
        <div className="max-w-md w-full text-center">
            <div className="p-12 mb-8 bg-slate-900 border-4 border-slate-800 rounded-[3rem] relative overflow-hidden">
                <div className="flex justify-center gap-4 mb-8">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <div key={i} className="w-10 h-14 bg-white/10 border border-white/20 rounded flex items-center justify-center text-white/20">?</div>
                    ))}
                </div>
                <button
                    onClick={deal}
                    disabled={isDealing || balance < betSize}
                    className={`w-full py-4 rounded-2xl font-black text-2xl uppercase tracking-widest transition-all active:scale-95 ${isDealing ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 hover:bg-white text-slate-950'
                        }`}
                >
                    {isDealing ? 'Dealing...' : 'DEAL $50'}
                </button>
            </div>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-3xl font-black italic ${result === 'YOU WIN!' ? 'text-emerald-400' : result === 'PUSH (TIE)' ? 'text-slate-400' : 'text-red-500'}`}
                    >
                        {result}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-12 p-4 bg-slate-900 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-500">
                    <strong>The Time Trap:</strong> Pai Gow is slow and results in many ties. This keeps you in the seat longer, exposed to the house edge for more hours, and the house takes a 5% cut when you do win.
                </p>
            </div>
        </div>
    );
}

function VideoPokerEngine({ onAction, balance, setBalance }: any) {
    const [isDealing, setIsDealing] = useState(false);
    const [result, setResult] = useState('');

    const betSize = 5;

    const deal = async () => {
        if (balance < betSize || isDealing) return;

        setIsDealing(true);
        setResult('');
        setBalance((b: number) => b - betSize);
        onAction(-betSize);

        await new Promise(r => setTimeout(r, 600));

        // Video Poker: We simulate "Jacks or Better" where you almost win often
        const roll = Math.random();
        if (roll < 0.2) {
            setResult('JACKS OR BETTER! (PUSH)');
            setBalance((b: number) => b + betSize);
            onAction(0);
        } else if (roll < 0.25) {
            setResult('TWO PAIR! (WIN $10)');
            setBalance((b: number) => b + 10);
            onAction(5);
        } else if (roll < 0.26) {
            setResult('THREE OF A KIND! (WIN $15)');
            setBalance((b: number) => b + 15);
            onAction(10);
        } else {
            setResult('LOSING HAND');
        }

        setIsDealing(false);
    };

    return (
        <div className="max-w-md w-full text-center">
            <div className="bg-blue-900/20 border-4 border-blue-600 rounded-[2rem] p-8 mb-8">
                <div className="grid grid-cols-5 gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="aspect-[2/3] bg-white rounded-lg flex items-center justify-center text-slate-950 font-bold shadow-inner text-2xl">?</div>
                    ))}
                </div>
                <button
                    onClick={deal}
                    disabled={isDealing || balance < betSize}
                    className={`w-full py-4 rounded-2xl font-black text-2xl uppercase tracking-widest transition-all active:scale-95 ${isDealing ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                >
                    {isDealing ? 'Dealing...' : 'DEAL $5'}
                </button>
            </div>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`text-2xl font-black italic ${result.includes('WIN') || result.includes('PUSH') ? 'text-emerald-400' : 'text-red-500'}`}
                    >
                        {result}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-12 p-4 bg-blue-900/10 rounded-xl border border-blue-900/20">
                <p className="text-xs text-slate-500 leading-relaxed">
                    <strong>The Paytable Trap:</strong> A "9/6" machine pays 9 for a Full House, while an "8/5" machine pays 8. That tiny difference—often ignored by casual players—is what makes the game unbeatable for 99% of people.
                </p>
            </div>
        </div>
    );
}

function KenoEngine({ onAction, balance, setBalance }: any) {
    const [isDrawing, setIsDrawing] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [drawn, setDrawn] = useState<number[]>([]);
    const [matches, setMatches] = useState<number>(0);
    const [result, setResult] = useState('');

    const betSize = 10;

    const toggleNum = (n: number) => {
        if (isDrawing) return;
        if (selected.includes(n)) {
            setSelected(selected.filter(i => i !== n));
        } else if (selected.length < 5) {
            setSelected([...selected, n]);
        }
    };

    const draw = async () => {
        if (selected.length < 5 || balance < betSize || isDrawing) return;

        setIsDrawing(true);
        setResult('');
        setDrawn([]);
        setMatches(0);
        setBalance((b: number) => b - betSize);
        onAction(-betSize);

        const allNums = Array.from({ length: 80 }, (_, i) => i + 1);
        const tempDrawn: number[] = [];
        let tempMatches = 0;

        for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 50));
            const idx = Math.floor(Math.random() * allNums.length);
            const num = allNums.splice(idx, 1)[0];
            tempDrawn.push(num);
            if (selected.includes(num)) tempMatches++;
            setDrawn([...tempDrawn]);
            setMatches(tempMatches);
        }

        // Keno Paytable: 5 picks
        // 0-2 matches: 0
        // 3 matches: 2x
        // 4 matches: 5x
        // 5 matches: 50x
        if (tempMatches === 3) {
            setResult('3 MATCHES! (WIN $20)');
            setBalance((b: number) => b + 20);
            onAction(10);
        } else if (tempMatches === 4) {
            setResult('4 MATCHES! (WIN $50)');
            setBalance((b: number) => b + 50);
            onAction(40);
        } else if (tempMatches === 5) {
            setResult('JACKPOT! (WIN $500)');
            setBalance((b: number) => b + 500);
            onAction(490);
        } else {
            setResult('NOT ENOUGH MATCHES');
        }

        setIsDrawing(false);
    };

    return (
        <div className="max-w-2xl w-full text-center">
            <div className="grid grid-cols-10 gap-1 mb-6 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                {Array.from({ length: 80 }, (_, i) => i + 1).map(n => (
                    <button
                        key={n}
                        onClick={() => toggleNum(n)}
                        disabled={isDrawing}
                        className={`aspect-square text-[10px] font-bold rounded-sm transition-all ${drawn.includes(n) && selected.includes(n) ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50' :
                            drawn.includes(n) ? 'bg-indigo-600 text-white' :
                                selected.includes(n) ? 'bg-yellow-500 text-black' :
                                    'bg-slate-800 text-slate-500 hover:bg-slate-700'
                            }`}
                    >
                        {n}
                    </button>
                ))}
            </div>

            <div className="flex justify-between items-center mb-8">
                <div className="text-left">
                    <div className="text-[10px] font-black text-slate-500 uppercase">Selected: {selected.length}/5</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase">Matches: {matches}</div>
                </div>
                <button
                    onClick={draw}
                    disabled={selected.length < 5 || isDrawing || balance < betSize}
                    className={`px-12 py-4 rounded-2xl font-black text-2xl uppercase tracking-widest transition-all ${selected.length < 5 || isDrawing ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                >
                    {isDrawing ? 'Drawing...' : 'PLAY $10'}
                </button>
            </div>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-2xl font-black ${result.includes('WIN') || result.includes('JACKPOT') ? 'text-emerald-400' : 'text-red-500'}`}
                    >
                        {result}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-8 p-4 bg-red-900/10 border border-red-900/20 rounded-xl">
                <p className="text-xs text-slate-500">
                    <strong>The Donation Trap:</strong> Keno is statistically a donation to the house. With a house edge of 25-30%, it is mathematically one of the worst bets you can make. You are effectively paying for the air conditioning.
                </p>
            </div>
        </div>
    );
}
