"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard, Suit, Rank } from '../ui/PlayingCard';
import { Trophy, TrendingDown } from 'lucide-react';
import { triggerConfetti } from '@/lib/confetti';

interface PokerGameProps {
    onAction: (amount: number) => void;
    balance: number;
    setBalance: React.Dispatch<React.SetStateAction<number>>;
    playSound: (type: 'spin' | 'win' | 'loss' | 'deal' | 'click' | 'bell' | 'chip') => void;
}

type CardType = { suit: Suit; rank: Rank };

// Hand ranking detection
function getHandRank(hand: CardType[]): { rank: string; description: string } {
    if (hand.length !== 5) return { rank: 'Incomplete', description: 'Need 5 cards' };

    const ranks = hand.map(c => c.rank);
    const suits = hand.map(c => c.suit);

    // Check for flush
    const isFlush = suits.every(s => s === suits[0]);

    // Count rank occurrences
    const rankCounts: { [key: string]: number } = {};
    ranks.forEach(r => rankCounts[r] = (rankCounts[r] || 0) + 1);
    const counts = Object.values(rankCounts).sort((a, b) => b - a);

    // Determine hand
    if (counts[0] === 4) return { rank: 'Four of a Kind', description: '⭐⭐⭐⭐' };
    if (counts[0] === 3 && counts[1] === 2) return { rank: 'Full House', description: '⭐⭐⭐' };
    if (isFlush) return { rank: 'Flush', description: '⭐⭐⭐' };
    if (counts[0] === 3) return { rank: 'Three of a Kind', description: '⭐⭐' };
    if (counts[0] === 2 && counts[1] === 2) return { rank: 'Two Pair', description: '⭐' };
    if (counts[0] === 2) return { rank: 'One Pair', description: '—' };

    return { rank: 'High Card', description: 'No hand' };
}

export function PokerGame({ onAction, balance, setBalance, playSound }: PokerGameProps) {
    const [gameState, setGameState] = useState<'betting' | 'playing' | 'result'>('betting');
    const [playerHand, setPlayerHand] = useState<CardType[]>([]);
    const [opponentHand, setOpponentHand] = useState<CardType[]>([]);
    const [result, setResult] = useState('');
    const [pot, setPot] = useState(0);
    const [isDealing, setIsDealing] = useState(false);
    const [playerHandRank, setPlayerHandRank] = useState({ rank: '', description: '' });
    const [opponentHandRank, setOpponentHandRank] = useState({ rank: '', description: '' });

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
        setPlayerHandRank(getHandRank(pHand));
        setOpponentHandRank(getHandRank(oHand));
        playSound('deal');
        await new Promise(r => setTimeout(r, 800));

        setGameState('playing');
        setIsDealing(false);
    };

    const fold = () => {
        setResult('YOU FOLDED - Opponent Wins');
        playSound('loss');
        setGameState('result');
    };

    const showdown = () => {
        const playerWins = Math.random() > 0.5;
        const rake = pot * rakePct;
        const winnings = pot - rake;

        if (playerWins) {
            setResult(`YOU WIN! +$${winnings.toFixed(0)}`);
            setBalance((b: number) => b + winnings);
            onAction(winnings - betSize);
            playSound('win');
            playSound('chip');
            triggerConfetti('win');
        } else {
            setResult(`OPPONENT WINS`);
            playSound('loss');
        }
        setGameState('result');
    };

    return (
        <div className="max-w-4xl w-full text-center">
            {/* Pot Display with Rake Warning */}
            <div className="mb-8 p-6 bg-gradient-to-br from-violet-900/30 to-slate-950 rounded-3xl border-2 border-violet-500/30 relative overflow-hidden flex flex-col items-center">
                <div className="absolute inset-0 bg-violet-500/5 animate-pulse" />

                {/* 3D Chip Stack Visual (CSS) */}
                <div className="relative z-10 mb-4 flex -space-x-2">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-violet-700 border-4 border-dashed border-white/20 shadow-xl flex items-center justify-center transform hover:-translate-y-2 transition-transform">
                            <div className="w-8 h-8 rounded-full border border-white/30 bg-violet-600/50" />
                        </div>
                    ))}
                </div>

                <div className="relative z-10">
                    <div className="text-[10px] font-black text-violet-300 uppercase tracking-widest mb-2">Total Pot</div>
                    <div className="text-5xl font-black text-white mb-2 filter drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">${pot}</div>
                    <div className="flex items-center justify-center gap-2 text-xs text-red-400 font-medium bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                        <TrendingDown size={14} />
                        <span>5% Rake: ${(pot * rakePct).toFixed(0)}</span>
                    </div>
                </div>
            </div>

            {/* Poker Table */}
            <div className="p-8 bg-gradient-to-br from-violet-900/20 to-slate-950 rounded-[3rem] border-4 border-violet-800/20 shadow-[0_0_60px_rgba(124,58,237,0.2)] mb-12 min-h-[500px] relative overflow-hidden">
                {/* Felt Pattern */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a78bfa' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />

                {/* Opponent's Hand */}
                <div className="relative z-10 mb-16">
                    <div className="text-[10px] font-black text-violet-300/60 uppercase tracking-widest mb-2">Opponent</div>
                    {opponentHand.length > 0 && (
                        <div className="mb-3">
                            <div className="inline-block px-4 py-1.5 bg-violet-500/10 border border-violet-500/30 rounded-full">
                                <span className="text-xs font-bold text-violet-300">{opponentHandRank.rank}</span>
                                <span className="text-xs text-violet-400 ml-2">{opponentHandRank.description}</span>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-center gap-2 h-36 items-center perspective-1000">
                        <AnimatePresence mode="popLayout">
                            {opponentHand.map((c, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: -100, rotateY: 180, scale: 0.5 }}
                                    animate={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
                                    transition={{ delay: i * 0.15, type: 'spring', damping: 12 }}
                                >
                                    <PlayingCard suit={c.suit} rank={c.rank} size="sm" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Player's Hand */}
                <div className="relative z-10">
                    <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2">Your Hand</div>
                    {playerHand.length > 0 && (
                        <div className="mb-3">
                            <div className="inline-block px-4 py-1.5 bg-violet-600/20 border-2 border-violet-400/50 rounded-full">
                                <Trophy className="inline-block mr-1.5 text-violet-400" size={14} />
                                <span className="text-sm font-black text-violet-100">{playerHandRank.rank}</span>
                                <span className="text-xs text-violet-300 ml-2">{playerHandRank.description}</span>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-center gap-2 h-36 items-center perspective-1000">
                        <AnimatePresence mode="popLayout">
                            {playerHand.map((c, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 150, rotateY: 180, scale: 0.5 }}
                                    animate={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
                                    transition={{ delay: i * 0.15 + 0.5, type: 'spring', damping: 12 }}
                                    whileHover={{ y: -10, scale: 1.05 }}
                                >
                                    <PlayingCard suit={c.suit} rank={c.rank} size="sm" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            {gameState === 'betting' && (
                <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={dealCards}
                    disabled={isDealing || balance < betSize}
                    className="px-16 py-6 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-black rounded-3xl uppercase tracking-[0.3em] transition-all shadow-[0_15px_40px_-10px_rgba(124,58,237,0.6)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isDealing ? 'Dealing...' : 'JOIN HAND $100'}
                </motion.button>
            )}

            {gameState === 'playing' && (
                <div className="flex gap-4 justify-center">
                    <motion.button
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        onClick={fold}
                        className="px-12 py-5 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-slate-300 font-black rounded-3xl uppercase tracking-widest transition-all active:scale-95"
                    >
                        Fold
                    </motion.button>
                    <motion.button
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        onClick={showdown}
                        className="px-12 py-5 bg-violet-500/20 hover:bg-violet-500/30 border-4 border-violet-500 text-violet-300 font-black rounded-3xl uppercase tracking-widest transition-all shadow-[0_10px_30px_-5px_rgba(124,58,237,0.4)] active:scale-95"
                    >
                        Call & Reveal
                    </motion.button>
                </div>
            )}

            {gameState === 'result' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className={`text-5xl font-black italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] ${result.includes('WIN') ? 'text-violet-400' : 'text-red-500'}`}>
                        {result}
                    </div>
                    {result.includes('WIN') && (
                        <div className="text-sm text-violet-300/70">
                            Rake Taken: ${(pot * rakePct).toFixed(0)} • You Received: ${(pot - pot * rakePct).toFixed(0)}
                        </div>
                    )}
                    <button
                        onClick={() => {
                            setPlayerHand([]);
                            setOpponentHand([]);
                            setResult('');
                            setPot(0);
                            setPlayerHandRank({ rank: '', description: '' });
                            setOpponentHandRank({ rank: '', description: '' });
                            setGameState('betting');
                        }}
                        className="px-16 py-5 bg-gradient-to-r from-white to-slate-100 hover:from-slate-100 hover:to-white text-slate-950 font-black rounded-3xl uppercase tracking-widest transition-all shadow-2xl active:scale-95"
                    >
                        Next Hand
                    </button>
                </motion.div>
            )}

            {/* Educational Info */}
            <div className="mt-16 px-6 py-4 bg-violet-500/5 rounded-2xl border border-violet-500/10 max-w-lg mx-auto">
                <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-violet-500">The Rake Trap:</strong> Player vs Player. The house takes a 5% &apos;rake&apos; (fee) from every pot. Even if you&apos;re a winning player, the constant rake will slowly drain your bankroll over thousands of hands.
                </p>
            </div>
        </div>
    );
}
