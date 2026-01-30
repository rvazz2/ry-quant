"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard, Suit, Rank } from '../ui/PlayingCard';
import { Spade } from 'lucide-react';
import { useCasinoSFX } from '@/hooks/useCasinoSFX';
import { WinParticles } from '../ui/WinParticles';
import { triggerConfetti } from '@/lib/confetti';

interface SpadesGameProps {
    onAction: (amount: number) => void;
    balance: number;
    setBalance: React.Dispatch<React.SetStateAction<number>>;
}

type CardType = { suit: Suit; rank: Rank; value: number };

// Helper to get value
const getCardValue = (rank: Rank): number => {
    const values: Record<Rank, number> = {
        '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
        '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return values[rank];
};

export function SpadesGame({ onAction, balance, setBalance }: SpadesGameProps) {
    const { playSound } = useCasinoSFX();
    const [gameState, setGameState] = useState<'betting' | 'bidding' | 'playing' | 'result'>('betting');
    const [playerHand, setPlayerHand] = useState<CardType[]>([]);
    const [botHand, setBotHand] = useState<CardType[]>([]);
    const [tableCards, setTableCards] = useState<{ card: CardType, playedBy: 'player' | 'bot' }[]>([]);

    // Game State
    const [playerBid, setPlayerBid] = useState(0);
    const [botBid, setBotBid] = useState(0);
    const [playerTricks, setPlayerTricks] = useState(0);
    const [botTricks, setBotTricks] = useState(0);
    const [turn, setTurn] = useState<'player' | 'bot'>('player');
    const [spadesBroken, setSpadesBroken] = useState(false);
    const [leadSuit, setLeadSuit] = useState<Suit | null>(null);
    const [gameResult, setGameResult] = useState('');
    const [winnings, setWinnings] = useState(0);

    const betSize = 50;

    // Deck Generation
    const createDeck = (): CardType[] => {
        const suits: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];
        const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const deck: CardType[] = [];
        suits.forEach(suit => {
            ranks.forEach(rank => {
                deck.push({ suit, rank, value: getCardValue(rank) });
            });
        });
        return deck.sort(() => Math.random() - 0.5);
    };

    const deal = () => {
        if (balance < betSize) return;
        setBalance(prev => prev - betSize);
        onAction(-betSize);
        playSound('deal');

        const deck = createDeck();
        const pHand = deck.slice(0, 13).sort((a, b) => b.value - a.value);
        const bHand = deck.slice(13, 26);

        setPlayerHand(pHand);
        setBotHand(bHand);
        setPlayerTricks(0);
        setBotTricks(0);
        setSpadesBroken(false);
        setGameState('bidding');
    };

    const placeBid = (bid: number) => {
        setPlayerBid(bid);
        playSound('chip');

        let bBid = 0;
        botHand.forEach(c => {
            if (c.value >= 12) bBid++;
            if (c.suit === 'spades' && c.value >= 11) bBid++;
        });
        bBid = Math.max(1, Math.min(13, bBid + (Math.random() > 0.5 ? 1 : 0)));
        setBotBid(bBid);

        setGameState('playing');
        setTurn('player');
    };

    const playCard = async (cardIndex: number) => {
        if (turn !== 'player') return;

        const card = playerHand[cardIndex];

        // Validation Rules
        if (leadSuit && card.suit !== leadSuit) {
            const hasLeadSuit = playerHand.some(c => c.suit === leadSuit);
            if (hasLeadSuit) return;
            if (card.suit === 'spades') setSpadesBroken(true);
        } else if (!leadSuit) {
            if (card.suit === 'spades' && !spadesBroken) {
                const hasNonSpades = playerHand.some(c => c.suit !== 'spades');
                if (hasNonSpades) return;
            }
        }

        playSound('deal');
        const newHand = [...playerHand];
        newHand.splice(cardIndex, 1);
        setPlayerHand(newHand);
        setTableCards(prev => [...prev, { card, playedBy: 'player' }]);

        if (!leadSuit) {
            setLeadSuit(card.suit);
            setTurn('bot');
            setTimeout(botTurn, 1000);
        } else {
            await resolveTrick({ card, playedBy: 'player' });
        }
    };

    const botTurn = async () => {
        let playable = [];
        if (leadSuit) {
            playable = botHand.filter(c => c.suit === leadSuit);
            if (playable.length === 0) playable = botHand;
        } else {
            playable = botHand;
            if (!spadesBroken && botHand.some(c => c.suit !== 'spades')) {
                playable = botHand.filter(c => c.suit !== 'spades');
            }
        }

        let cardToPlay;
        if (tableCards.length > 0) {
            const playerCard = tableCards[0].card;
            const winningCards = playable.filter(c => {
                if (c.suit === leadSuit && c.value > playerCard.value) return true;
                if (c.suit === 'spades' && playerCard.suit !== 'spades') return true;
                return false;
            });

            if (winningCards.length > 0) {
                winningCards.sort((a, b) => a.value - b.value);
                cardToPlay = winningCards[0];
            } else {
                playable.sort((a, b) => a.value - b.value);
                cardToPlay = playable[0];
            }
        } else {
            playable.sort((a, b) => b.value - a.value);
            cardToPlay = playable[0];
        }

        if (!cardToPlay) cardToPlay = playable[0];

        if (cardToPlay.suit === 'spades') setSpadesBroken(true);

        const newBotHand = botHand.filter(c => c !== cardToPlay);
        setBotHand(newBotHand);
        setTableCards(prev => [...prev, { card: cardToPlay, playedBy: 'bot' }]);
        playSound('deal');

        if (!leadSuit) {
            setLeadSuit(cardToPlay.suit);
            setTurn('player');
        } else {
            await resolveTrick({ card: cardToPlay, playedBy: 'bot' });
        }
    };

    const resolveTrick = async (lastPlay: { card: CardType, playedBy: 'player' | 'bot' }) => {
        await new Promise(r => setTimeout(r, 1200));

        const firstPlay = tableCards[0];
        const secondPlay = lastPlay;
        const c1 = firstPlay.card;
        const c2 = secondPlay.card;

        // Correct winner logic
        let winner: 'player' | 'bot' = firstPlay.playedBy; // Default to leader wins

        // If follower played suit
        if (c2.suit === c1.suit) {
            if (c2.value > c1.value) winner = secondPlay.playedBy;
        } else {
            // Follower played off suit. Only wind if spades
            if (c2.suit === 'spades') winner = secondPlay.playedBy;
        }

        if (winner === 'player') {
            setPlayerTricks(p => p + 1);
            playSound('chip'); // Simple visual feedback
        } else {
            setBotTricks(p => p + 1);
        }

        // Slight cleanup animation delay
        setTableCards([]);
        setLeadSuit(null);

        const totalTricks = playerTricks + botTricks + 1;
        if (totalTricks === 13) {
            endRound(playerTricks + (winner === 'player' ? 1 : 0), botTricks + (winner === 'bot' ? 1 : 0));
        } else {
            setTurn(winner);
            if (winner === 'bot') {
                setTimeout(botTurn, 1000);
            }
        }
    };

    const endRound = (pTricks: number, bTricks: number) => {
        setGameState('result');
        let msg = '';
        let win = 0;

        const madeBid = pTricks >= playerBid;
        if (madeBid) {
            win = betSize * 2;
            msg = `SUCCESS! Made Bid (${playerBid}) vs Bot (${bTricks})`;
            if (pTricks > playerBid) msg += ` + ${pTricks - playerBid} Overtricks`;

            playSound('win');
            triggerConfetti('win');
            setBalance(b => b + win);
            onAction(win - betSize);
        } else {
            msg = `FAILED! Bid ${playerBid} (Got ${pTricks}) vs Bot (${bTricks})`;
            playSound('loss');
        }

        setGameResult(msg);
        setWinnings(win);
    };

    return (
        <div className="w-full max-w-4xl mx-auto min-h-[600px] flex flex-col items-center justify-between p-6 bg-[#0f2e1b] rounded-[3rem] border-8 border-[#1a4a2e] shadow-2xl relative overflow-hidden">
            {/* Win Celebration */}
            {gameState === 'result' && winnings > 0 && <WinParticles />}

            {/* Felt Texture */}
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            {/* Top Bar: Stats */}
            <div className="w-full flex justify-between items-start relative z-10 px-4">

                <div className="bg-black/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center shadow-lg">
                    <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest mb-1">Bot Bid</div>
                    <div className="text-2xl font-black text-white">{botBid > 0 ? botBid : '-'}</div>
                    <div className="text-xs text-emerald-600 font-mono">Tricks: {botTricks}</div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2 p-3 bg-black/20 rounded-full border border-white/5">
                        <Spade className={`w-6 h-6 ${spadesBroken ? 'text-white animate-pulse' : 'text-white/20'}`} />
                        <span className={`text-xs font-bold uppercase tracking-widest ${spadesBroken ? 'text-white' : 'text-white/40'}`}>
                            {spadesBroken ? 'Spades Broken' : 'Spades Intact'}
                        </span>
                    </div>
                </div>

                <div className="bg-black/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center shadow-lg">
                    <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest mb-1">Your Bid</div>
                    <div className="text-2xl font-black text-white">{playerBid > 0 ? playerBid : '-'}</div>
                    <div className="text-xs text-emerald-600 font-mono">Tricks: {playerTricks}</div>
                </div>
            </div>

            {/* Opponent Area */}
            <div className="relative z-10 h-24 w-full flex justify-center items-center my-4">
                {botHand.map((_, i) => (
                    <div key={i} className="absolute transition-all duration-300" style={{
                        transform: `translateX(${(i - botHand.length / 2) * 15}px) rotate(${(i - botHand.length / 2) * 2}deg)`,
                        zIndex: i
                    }}>
                        <PlayingCard faceDown size="sm" />
                    </div>
                ))}
            </div>

            {/* Center Field (Table) */}
            <div className="relative z-10 h-48 w-full flex items-center justify-center gap-8">
                <AnimatePresence>
                    {tableCards.map((play, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0.5, opacity: 0, y: play.playedBy === 'player' ? 50 : -50, rotate: Math.random() * 10 - 5 }}
                            animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                            exit={{ scale: 0.5, opacity: 0, scaleY: 0 }}
                            className="relative"
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase text-emerald-300 bg-black/70 px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
                                {play.playedBy === 'player' ? 'You' : 'Bot'}
                            </div>
                            <PlayingCard suit={play.card.suit} rank={play.card.rank} size="md" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Player Hand / Controls */}
            <div className="relative z-10 w-full mb-4">
                {gameState === 'betting' && (
                    <div className="flex justify-center">
                        <button
                            onClick={deal}
                            disabled={balance < betSize}
                            className="px-12 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xl rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
                        >
                            Deal Hand ${betSize}
                        </button>
                    </div>
                )}

                {gameState === 'bidding' && (
                    <div className="flex flex-col items-center gap-4 bg-black/80 p-6 rounded-3xl backdrop-blur-md mx-auto max-w-lg border border-emerald-500/50 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-white uppercase tracking-widest">Place Your Bid</h3>
                        <div className="grid grid-cols-5 gap-2 w-full">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(num => (
                                <button
                                    key={num}
                                    onClick={() => placeBid(num)}
                                    className="p-3 bg-emerald-900/40 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 rounded-xl text-emerald-400 font-bold transition-all transform hover:scale-105"
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => placeBid(0)} className="w-full py-2 bg-emerald-900/30 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 font-bold uppercase text-xs tracking-widest mb-2">
                            Go Nil (Risky)
                        </button>
                    </div>
                )}

                {gameState === 'result' && (
                    <div className="flex flex-col items-center gap-4 bg-black/90 p-8 rounded-3xl backdrop-blur-xl mx-auto max-w-md border-2 border-emerald-500 animate-in fade-in zoom-in text-center absolute top-[-150px] left-1/2 -translate-x-1/2 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                        <h3 className="text-3xl font-black text-white uppercase italic">{winnings > 0 ? "You Won!" : "Round Over"}</h3>
                        <p className="text-emerald-400 font-bold text-lg">{gameResult}</p>
                        {winnings > 0 && <div className="text-white text-4xl font-black drop-shadow-md">+${winnings}</div>}
                        <button
                            onClick={() => {
                                setGameState('betting');
                                setPlayerHand([]);
                                setBotHand([]);
                                setTableCards([]);
                            }}
                            className="px-8 py-3 bg-white text-black font-bold rounded-full uppercase tracking-widest hover:bg-gray-200 transition-colors mt-4"
                        >
                            Next Hand
                        </button>
                    </div>
                )}

                {/* Cards */}
                <div className="flex justify-center -space-x-8 h-32 items-end perspective-1000 mt-4 overflow-x-visible px-4">
                    {playerHand.map((card, i) => {
                        let isPlayable = turn === 'player';
                        if (leadSuit && card.suit !== leadSuit) {
                            const hasLead = playerHand.some(c => c.suit === leadSuit);
                            if (hasLead) isPlayable = false;
                        }
                        if (!leadSuit && card.suit === 'spades' && !spadesBroken) {
                            const hasNonSpades = playerHand.some(c => c.suit !== 'spades');
                            if (hasNonSpades) isPlayable = false;
                        }

                        return (
                            <motion.div
                                key={`${card.suit}-${card.rank}`}
                                initial={{ y: 0, rotate: (i - playerHand.length / 2) * 5 }}
                                animate={{
                                    y: 0,
                                    rotate: (i - playerHand.length / 2) * 3,
                                    opacity: isPlayable || gameState !== 'playing' ? 1 : 0.4,
                                    filter: isPlayable || gameState !== 'playing' ? 'grayscale(0%)' : 'grayscale(100%) blur(1px)'
                                }}
                                style={{ zIndex: i }}
                                className="origin-bottom"
                            >
                                <PlayingCard
                                    suit={card.suit}
                                    rank={card.rank}
                                    size="sm"
                                    onClick={() => isPlayable && playCard(i)}
                                    className={!isPlayable ? 'cursor-not-allowed' : ''}
                                />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
