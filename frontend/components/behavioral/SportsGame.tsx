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
            <div className="p-8 bg-gradient-to-br from-orange-900/20 to-slate-950 rounded-[3rem] border-4 border-orange-800/20 shadow-[0_0_60px_rgba(249,115,22,0.2)] mb-12">
                <h3 className="text-2xl font-black text-orange-400 uppercase tracking-widest mb-8">🏈 Bet Slip</h3>

                <div className="space-y-4 mb-8">
                    {bets.map((bet) => (
                        <button
                            key={bet.id}
                            onClick={() => { setSelectedBet(bet.id); playSound('click'); }}
                            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${selectedBet === bet.id
                                    ? 'bg-orange-600 border-white shadow-[0_0_30px_rgba(249,115,22,0.5)] text-white'
                                    : 'bg-slate-900 border-orange-900/30 text-slate-300 hover:bg-slate-800'
                                }`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-lg font-bold">{bet.team} vs {bet.opponent}</div>
                                    <div className="text-xs text-slate-400 mt-1">Risk $110 to win ${bet.payout}</div>
                                </div>
                                <div className={`text-3xl font-black ${selectedBet === bet.id ? 'text-white' : 'text-orange-500'}`}>{bet.odds}</div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="bg-orange-500/10 border-2 border-orange-500/20 rounded-xl p-4 mb-8 text-sm text-orange-400">
                    <strong>The Vig Explained:</strong> You must risk $110 to win $100. That extra $10 is the &quot;vig&quot; (vigorish) - the house&apos;s cut. You need to win 52.4% of bets just to break even.
                </div>

                <button
                    onClick={placeBet}
                    disabled={!selectedBet || isBetting || balance < betSize}
                    className={`w-full py-6 rounded-3xl font-black text-3xl uppercase tracking-widest transition-all shadow-2xl active:scale-95 ${isBetting || !selectedBet
                            ? 'bg-slate-800 text-slate-600'
                            : 'bg-orange-600 hover:bg-orange-500 text-white'
                        }`}
                >
                    {isBetting ? 'Placing Bet...' : 'PLACE BET ($110)'}
                </button>

                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-10 text-4xl font-black italic ${result.includes('WIN') ? 'text-orange-400' : 'text-red-500'}`}
                        >
                            {result}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="px-6 py-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 max-w-lg mx-auto">
                <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-orange-500">The Vig Trap:</strong> The &apos;Vig&apos; (juice) makes winning long-term extremely difficult. Even professional bettors struggle to maintain a 53%+ win rate needed to overcome the house edge.
                </p>
            </div>
        </div>
    );
}
