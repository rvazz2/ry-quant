"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SportsGameProps {
    onAction: (amount: number) => void;
    balance: number;
    setBalance: React.Dispatch<React.SetStateAction<number>>;
    playSound: (type: 'spin' | 'win' | 'loss' | 'deal' | 'click' | 'bell' | 'chip') => void;
}

export function SportsGame({ onAction, balance, setBalance, playSound }: SportsGameProps) {
    const [selectedBet, setSelectedBet] = useState<string | null>(null);
    const [result, setResult] = useState('');
    const [isBetting, setIsBetting] = useState(false);
    const [ticketId] = useState(() => Math.floor(Math.random() * 999999));

    const betSize = 110;

    const bets = [
        { id: '1', team: 'Chiefs', opponent: 'Bills', odds: '-110', payout: 100 },
        { id: '2', team: 'Lakers', opponent: 'Warriors', odds: '+150', payout: 165 },
        { id: '3', team: 'Yankees', opponent: 'Red Sox', odds: '-150', payout: 66 },
    ];

    const placeBet = async () => {
        if (!selectedBet || balance < betSize || isBetting) return;
        setIsBetting(true);
        setBalance((b: number) => b - betSize);
        onAction(-betSize);
        playSound('chip');

        await new Promise(r => setTimeout(r, 2000));

        const winChance = 0.4;
        const isWin = Math.random() < winChance;

        const bet = bets.find(b => b.id === selectedBet);
        if (isWin && bet) {
            setResult(`WIN! +$${bet.payout}`);
            setBalance((b: number) => b + betSize + bet.payout);
            onAction(bet.payout);
            playSound('win');
        } else {
            setResult('LOSS (-$110)');
            playSound('loss');
        }

        setIsBetting(false);
    };

    return (
        <div className="max-w-2xl w-full text-center">
            <div className="p-8 bg-slate-900 rounded-[3rem] border-4 border-slate-800 shadow-2xl mb-12 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgdmlld0JveD0iMCAwIDE1IDE1Ij48cGF0aCBkPSJNOSA3LjUgMTUgMTUgMTUgMCA5IDcuNSAyMi41IDAgMCAwIDAgMTUgNy41IDcuNSAxNSAwIDE1IDE1IDAgMCAwIDAgMTV6IiBmaWxsPSIjMWUxZTFlIi8+PC9zdmc+')] bg-repeat-x opacity-50"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <h3 className="text-3xl font-black text-slate-200 uppercase tracking-widest mb-2 font-mono">SPORTSBOOK</h3>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-8">Ticket #{ticketId}</div>

                    <div className="space-y-4 mb-8 w-full">
                        {bets.map((bet) => (
                            <button
                                key={bet.id}
                                onClick={() => { setSelectedBet(bet.id); playSound('click'); }}
                                className={`w-full p-6 rounded transition-all text-left relative overflow-hidden group/ticket ${selectedBet === bet.id
                                    ? 'bg-orange-500 text-slate-950 shadow-lg scale-[1.02]'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex justify-between items-center relative z-10">
                                    <div className="flex flex-col items-start">
                                        <div className="text-xl font-black uppercase italic tracking-tighter">{bet.team} <span className="text-xs opacity-50 not-italic align-middle mx-1">vs</span> {bet.opponent}</div>
                                        <div className="text-[10px] font-bold opacity-70 mt-1 uppercase tracking-widest">Risk $110 / Win ${bet.payout}</div>
                                    </div>
                                    <div className={`text-2xl font-mono font-black tracking-tighter ${selectedBet === bet.id ? 'text-slate-900' : 'text-orange-500'}`}>
                                        {bet.odds}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 mb-8 text-xs text-slate-400 font-mono w-full text-left">
                        <span className="text-orange-500 font-bold uppercase mr-2">WARN:</span>
                        The VIG (Juice) requires a 52.4% win rate to break even. Most "sharps" only hit 55%. The math is against you.
                    </div>

                    <button
                        onClick={placeBet}
                        disabled={!selectedBet || isBetting || balance < betSize}
                        className={`w-full py-6 rounded-xl font-black text-2xl uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${isBetting || !selectedBet
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-400 text-slate-900'
                            }`}
                    >
                        {isBetting ? <span className="animate-pulse">PROCESSING...</span> : <span>PRINT TICKET ($110)</span>}
                    </button>

                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                className={`absolute inset-0 bg-slate-900/95 flex items-center justify-center z-50 backdrop-blur-sm`}
                            >
                                <div className={`px-12 py-8 rounded-2xl border-4 text-5xl font-black italic uppercase tracking-tighter transform -rotate-12 shadow-2xl ${result.includes('WIN') ? 'border-orange-500 text-orange-500 rotate-12' : 'border-red-500 text-red-500'}`}>
                                    {result.includes('WIN') ? 'WINNER' : 'VOID'}
                                    <div className="text-lg font-bold tracking-widest mt-2 text-center opacity-80 not-italic font-mono">
                                        {result.includes('WIN') ? `PAID: $${bets.find(b => b.id === selectedBet)?.payout}` : '-$110.00'}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="px-6 py-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 max-w-lg mx-auto">
                <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-orange-500">The Vig Trap:</strong> The &apos;Vig&apos; (juice) makes winning long-term extremely difficult. Even professional bettors struggle to maintain a 53%+ win rate needed to overcome the house edge.
                </p>
            </div>
        </div>
    );
}
