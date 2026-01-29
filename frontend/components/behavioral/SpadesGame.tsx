"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard, Suit, Rank } from '../ui/PlayingCard';
import { Spade } from 'lucide-react';

interface SpadesGameProps {
    onAction: (amount: number) => void;
    balance: number;
    setBalance: React.Dispatch<React.SetStateAction<number>>;
    playSound: (type: 'spin' | 'win' | 'loss' | 'deal' | 'click' | 'bell' | 'chip') => void;
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

export function SpadesGame({ onAction, balance, setBalance, playSound }: SpadesGameProps) {
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
        // 1v1 Spades: Deal 13 cards each. (Standard 2-player rules actually involve drawing, but for speed we'll deal full hands)
        const pHand = deck.slice(0, 13).sort((a, b) => b.value - a.value); // Auto sort for player convenience
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

        // Simple Bot Logic: Bid based on high cards + spades
        let bBid = 0;
        botHand.forEach(c => {
            if (c.value >= 12) bBid++; // K or A
            if (c.suit === 'spades' && c.value >= 11) bBid++; // High spades
        });
        // Randomize slightly
        bBid = Math.max(1, Math.min(13, bBid + (Math.random() > 0.5 ? 1 : 0)));
        setBotBid(bBid);

        setGameState('playing');
        setTurn('player'); // Player starts
    };

    const playCard = async (cardIndex: number) => {
        if (turn !== 'player') return;

        const card = playerHand[cardIndex];

        // Validation Rules
        if (leadSuit && card.suit !== leadSuit) {
            // Must follow suit if possible
            const hasLeadSuit = playerHand.some(c => c.suit === leadSuit);
            if (hasLeadSuit) {
                // Must play lead suit
                // Visual shake or warning could go here
                return;
            }
            // Playing off-suit
            if (card.suit === 'spades') setSpadesBroken(true);
        } else if (!leadSuit) {
            // Leading
            if (card.suit === 'spades' && !spadesBroken) {
                // Can only lead spades if broken or only have spades
                const hasNonSpades = playerHand.some(c => c.suit !== 'spades');
                if (hasNonSpades) {
                    return;
                }
            }
        }

        // Valid Move
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
            // Trick Complete
            await resolveTrick({ card, playedBy: 'player' });
        }
    };

    const botTurn = async () => {
        // Simple Bot Logic
        let playable = [];
        if (leadSuit) {
            playable = botHand.filter(c => c.suit === leadSuit);
            if (playable.length === 0) {
                // Can play anything (spades if wants to win)
                playable = botHand;
            }
        } else {
            // Bot Leading
            playable = botHand;
            if (!spadesBroken && botHand.some(c => c.suit !== 'spades')) {
                playable = botHand.filter(c => c.suit !== 'spades');
            }
        }

        // Pick best card (dumb logic: random valid card)
        // Improvement: Try to win if card on table
        let cardToPlay;

        // Basic AI to make it playable
        if (tableCards.length > 0) {
            // Trying to beat player?
            const playerCard = tableCards[0].card;
            const winningCards = playable.filter(c => {
                if (c.suit === leadSuit && c.value > playerCard.value) return true;
                if (c.suit === 'spades' && playerCard.suit !== 'spades') return true;
                return false;
            });

            if (winningCards.length > 0) {
                // Win cheaply
                winningCards.sort((a, b) => a.value - b.value);
                cardToPlay = winningCards[0];
            } else {
                // Can't win, dump low
                playable.sort((a, b) => a.value - b.value);
                cardToPlay = playable[0];
            }
        } else {
            // Leading high
            playable.sort((a, b) => b.value - a.value);
            cardToPlay = playable[0];
        }

        if (!cardToPlay) cardToPlay = playable[0]; // Fallback

        // Execute Bot Play
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
        // Wait a moment to show cards
        await new Promise(r => setTimeout(r, 1500));

        const firstPlay = tableCards[0];
        const secondPlay = lastPlay;

        let winner: 'player' | 'bot' = 'player';
        const lead = tableCards.length === 1 ? tableCards[0].card : tableCards[1].card; // Logic flaw in how I stored state, fixing below
        // Actually tableCards has 1. lastPlay is the 2nd.

        const c1 = tableCards[0].card;
        const c2 = lastPlay.card;
        const currentLeadSuit = c1.suit; // The first card played set the suit

        // Determine Winner
        if (c2.suit === 'spades' && c1.suit !== 'spades') {
            winner = tableCards[0].playedBy === 'player' ? 'bot' : 'player'; // wait, no.
            // If c2 is second play and it spaded, c2 wins unless c1 was spades higher.
            // Let's simplify:
            // The one who played c2 is lastPlay.playedBy
            winner = lastPlay.playedBy;
        } else if (c1.suit === 'spades' && c2.suit !== 'spades') {
            winner = tableCards[0].playedBy;
        } else if (c2.suit === currentLeadSuit && c2.value > c1.value) {
            winner = lastPlay.playedBy;
        } else {
            winner = tableCards[0].playedBy;
        }

        if (winner === 'player') setPlayerTricks(p => p + 1);
        else setBotTricks(p => p + 1);

        playSound('chip');
        setTableCards([]);
        setLeadSuit(null);

        if (playerHand.length === 0 && botHand.length === 0) { // Check if this was last trick (requires logic update)
            // Actually hands are empty NOW? No, we just spliced.
            // Check remaining cards.
        }

        // If hands empty, end game
        if (playerHand.length === 0 && botHand.length === 0) { // Wait, splice happens before this func. 
            // We need to check if that was the last card. 
        }

        // Correct check: We just played the last cards.
        const handsEmpty = (playerHand.length === 0 && lastPlay.playedBy === 'player') ||
            (botHand.length === 0 && lastPlay.playedBy === 'bot') ||
            (playerHand.length === 0 && botHand.length === 0); // Logic tricky due to async state update.

        // Better: Use a counter or check state next tick. 
        // For now, let's assume if 13 tricks played.
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

        // Scoring: 
        // Bid met? 10 pts per bid + 1 per extra.
        // Bid missed? -10 pts per bid.
        // Casino Version: You bet against the house. If you beat your bid AND beat the bot's score relative to bid?
        // Simple Casino Rules: 
        // 1. You MUST make your bid. If you fail, you lose your bet.
        // 2. If you make your bid, you win proportional to difficulty.
        // 3. Bonus: If you beat the bot (more tricks or better efficiency), small bonus.

        const madeBid = pTricks >= playerBid;
        if (madeBid) {
            // Payout
            // Payout
            // Multiplier based on bid height
            // Bid 1: 1.1x, Bid 13: 10x?
            // Let's stick to simple: Win = Bet * 2 if made bid. + Bonus for nil.
            win = betSize * 2;
            // Sandbagging penalty? (Overtricks > 2?) - In casino, maybe we just pay for tricks won.

            msg = `SUCCESS! Made Bid (${playerBid}) vs Bot (${bTricks})`;
            if (pTricks > playerBid) msg += ` + ${pTricks - playerBid} Overtricks`;

            playSound('win');
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
            {/* Felt Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            {/* Top Bar: Stats */}
            <div className="w-full flex justify-between items-start relative z-10 px-4">

                <div className="bg-black/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center">
                    <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest mb-1">Bot Bid</div>
                    <div className="text-2xl font-black text-white">{botBid > 0 ? botBid : '-'}</div>
                    <div className="text-xs text-emerald-600 font-mono">Tricks: {botTricks}</div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                        <Spade className={`w-6 h-6 ${spadesBroken ? 'text-white' : 'text-white/20'}`} />
                        <span className={`text-xs font-bold uppercase tracking-widest ${spadesBroken ? 'text-white' : 'text-white/40'}`}>
                            {spadesBroken ? 'Spades Broken' : 'Spades Intact'}
                        </span>
                    </div>
                </div>

                <div className="bg-black/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center">
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
                        <div className="w-12 h-20 bg-emerald-800 rounded-lg border-2 border-emerald-600 shadow-xl" />
                    </div>
                ))}
            </div>

            {/* Center Field (Table) */}
            <div className="relative z-10 h-48 w-full flex items-center justify-center gap-8">
                <AnimatePresence>
                    {tableCards.map((play, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0.5, opacity: 0, y: play.playedBy === 'player' ? 50 : -50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="relative"
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase text-emerald-300 bg-black/50 px-2 py-0.5 rounded-full whitespace-nowrap">
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
                            className="px-12 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xl rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Deal Hand ${betSize}
                        </button>
                    </div>
                )}

                {gameState === 'bidding' && (
                    <div className="flex flex-col items-center gap-4 bg-black/60 p-6 rounded-3xl backdrop-blur-md mx-auto max-w-lg border border-emerald-500/30">
                        <h3 className="text-xl font-bold text-white uppercase tracking-widest">Place Your Bid</h3>
                        <div className="grid grid-cols-5 gap-2 w-full">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(num => (
                                <button
                                    key={num}
                                    onClick={() => placeBid(num)}
                                    className="p-3 bg-emerald-900/50 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 rounded-xl text-emerald-400 font-bold transition-all"
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => placeBid(0)} className="w-full py-2 bg-emerald-900/30 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 font-bold uppercase text-xs tracking-widest">
                            Go Nil (Risky)
                        </button>
                    </div>
                )}

                {gameState === 'result' && (
                    <div className="flex flex-col items-center gap-4 bg-black/80 p-8 rounded-3xl backdrop-blur-xl mx-auto max-w-md border-2 border-emerald-500 animate-in fade-in zoom-in text-center absolute top-[-100px] left-1/2 -translate-x-1/2">
                        <h3 className="text-2xl font-black text-white uppercase italic">{gameResult}</h3>
                        {winnings > 0 && <div className="text-emerald-400 text-lg font-bold">Won ${winnings}</div>}
                        <button
                            onClick={() => {
                                setGameState('betting');
                                setPlayerHand([]);
                                setBotHand([]);
                                setTableCards([]);
                            }}
                            className="px-8 py-3 bg-white text-black font-bold rounded-full uppercase tracking-widest hover:bg-gray-200 transition-colors"
                        >
                            Next Hand
                        </button>
                    </div>
                )}

                {/* Cards */}
                <div className="flex justify-center -space-x-8 h-32 items-end perspective-1000 mt-4 overflow-x-visible px-4">
                    {playerHand.map((card, i) => {
                        // Check if playable
                        let isPlayable = turn === 'player';
                        if (leadSuit && card.suit !== leadSuit) {
                            // Can only play if no lead suit cards
                            const hasLead = playerHand.some(c => c.suit === leadSuit);
                            if (hasLead) isPlayable = false;
                        }
                        if (!leadSuit && card.suit === 'spades' && !spadesBroken) {
                            const hasNonSpades = playerHand.some(c => c.suit !== 'spades');
                            if (hasNonSpades) isPlayable = false;
                        }

                        return (
                            <motion.button
                                key={`${card.suit}-${card.rank}`}
                                onClick={() => isPlayable && playCard(i)}
                                whileHover={{ y: -20, zIndex: 50 }}
                                initial={{ y: 0, rotate: (i - playerHand.length / 2) * 5 }}
                                animate={{
                                    y: 0,
                                    rotate: (i - playerHand.length / 2) * 3,
                                    opacity: isPlayable || gameState !== 'playing' ? 1 : 0.5,
                                    filter: isPlayable || gameState !== 'playing' ? 'grayscale(0%)' : 'grayscale(100%)'
                                }}
                                disabled={!isPlayable}
                                className="relative disabled:cursor-not-allowed origin-bottom transform transition-transform"
                                style={{ zIndex: i }}
                            >
                                <PlayingCard suit={card.suit} rank={card.rank} size="sm" />
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
