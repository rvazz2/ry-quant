"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard, Suit, Rank } from '../ui/PlayingCard';

interface PokerGameProps {
    onAction: (amount: number) => void;
    balance: number;
    setBalance: React.Dispatch<React.SetStateAction<number>>;
    playSound: (type: 'spin' | 'win' | 'loss' | 'deal' | 'click' | 'bell' | 'chip') => void;
}

type CardType = { suit: Suit; rank: Rank };

export function PokerGame({ onAction, balance, setBalance, playSound }: PokerGameProps) {
    const [gameState, setGameState] = useState<'betting' | 'playing' | 'result'>('betting');
    const [playerHand, setPlayerHand] = useState<CardType[]>([]);
    const [opponentHand, setOpponentHand] = useState<CardType[]>([]);
    const [result, setResult] = useState('');
    const [pot, setPot] = useState(0);
    const [isDealing, setIsDealing] = useState(false);

    const betSize = 100;
    const rakePct = 0.05;

    const getRandomCard = (): CardType => {
        const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        return {
            suit: suits[Math.floor(Math.random() * suits.length)],
            rank: ranks[Math.floor(Math.random() * ranks.length)]
        };
    };

    const dealCards = async () => {
        if (balance < betSize || isDealing) return;
        setIsDealing(true);
        setBalance((b: number) => b - betSize);
        onAction(-betSize);
        setPot(betSize * 2);
        playSound('chip');

        const pHand: CardType[] = [];
        const oHand: CardType[] = [];
        for (let i = 0; i < 5; i++) {
            pHand.push(getRandomCard());
            oHand.push(getRandomCard());
        }

        setPlayerHand(pHand);
        setOpponentHand(oHand);
        playSound('deal');
        await new Promise(r => setTimeout(r, 800));

        setGameState('playing');
        setIsDealing(false);
    };

    const showdown = () => {
        const playerWins = Math.random() > 0.5;
        const rake = pot * rakePct;
        const winnings = pot - rake;

        if (playerWins) {
            setResult(`YOU WIN! +$${winnings.toFixed(0)} (5% rake taken)`);
            setBalance((b: number) => b + winnings);
            onAction(winnings - betSize);
            playSound('win');
        } else {
            setResult(`OPPONENT WINS (Rake: $${rake.toFixed(0)})`);
            playSound('loss');
        }
        setGameState('result');
    };

    return (
        <div className="max-w-4xl w-full text-center">
            <div className="mb-8 p-6 bg-gradient-to-br from-violet-900/30 to-slate-950 rounded-3xl border-2 border-violet-500/30">
                <div className="text-[10px] font-black text-violet-300 uppercase tracking-widest mb-2">Total Pot</div>
                <div className="text-5xl font-black text-white mb-2">${pot}</div>
                <div className="text-xs text-red-400 font-medium">5% Rake Will Be Taken</div>
            </div>

            <div className="p-8 bg-gradient-to-br from-violet-900/20 to-slate-950 rounded-[3rem] border-4 border-violet-800/20 shadow-[0_0_60px_rgba(124,58,237,0.2)] mb-12 min-h-[500px] relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a78bfa' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />

                <div className="relative z-10 mb-16">
                    <div className="text-[10px] font-black text-violet-300/60 uppercase tracking-widest mb-6">Opponent</div>
                    <div className="flex justify-center gap-2 h-36 items-center">
                        {opponentHand.map((c, i) => (
                            <PlayingCard key={i} suit={c.suit} rank={c.rank} size="sm" />
                        ))}
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-4">Your Hand</div>
                    <div className="flex justify-center gap-2 h-36 items-center">
                        {playerHand.map((c, i) => (
                            <PlayingCard key={i} suit={c.suit} rank={c.rank} size="sm" />
                        ))}
                    </div>
                </div>
            </div>

            {gameState === 'betting' && (
                <button onClick={dealCards} disabled={isDealing || balance < betSize} className="px-16 py-6 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-3xl uppercase tracking-[0.3em] transition-all shadow-[0_15px_40px_-10px_rgba(124,58,237,0.6)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                    {isDealing ? 'Dealing...' : 'JOIN HAND $100'}
                </button>
            )}

            {gameState === 'playing' && (
                <button onClick={showdown} className="px-16 py-6 bg-violet-500/20 hover:bg-violet-500/30 border-4 border-violet-500 text-violet-300 font-black rounded-3xl uppercase tracking-widest transition-all shadow-[0_10px_30px_-5px_rgba(124,58,237,0.4)] active:scale-95">Showdown</button>
            )}

            {gameState === 'result' && (
                <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="space-y-8">
                    <div className={`text-5xl font-black italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] ${result.includes('WIN') ? 'text-violet-400' : 'text-red-500'}`}>{result}</div>
                    <button onClick={() => { setPlayerHand([]); setOpponentHand([]); setResult(''); setPot(0); setGameState('betting'); }} className="px-16 py-5 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-3xl uppercase tracking-widest transition-all shadow-2xl active:scale-95">Next Hand</button>
                </motion.div>
            )}

            <div className="mt-16 px-6 py-4 bg-violet-500/5 rounded-2xl border border-violet-500/10 max-w-lg mx-auto">
                <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-violet-500">The Rake Trap:</strong> Player vs Player. The house takes a &apos;rake&apos; (fee) from every pot. Even if you&apos;re a winning player, the constant rake will slowly drain your bankroll over thousands of hands.
                </p>
            </div>
        </div>
    );
}
