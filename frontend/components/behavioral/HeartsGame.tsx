"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard, Suit, Rank } from '../ui/PlayingCard';
import { Heart, Skull } from 'lucide-react';

import { useCasinoSFX } from '@/hooks/useCasinoSFX';
import { WinParticles } from '../ui/WinParticles';

interface HeartsGameProps {
    onAction: (amount: number) => void;
    balance: number;
    setBalance: React.Dispatch<React.SetStateAction<number>>;
}

type CardType = { suit: Suit; rank: Rank; value: number };

const getCardValue = (rank: Rank): number => {
    const values: Record<Rank, number> = {
        '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
        '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return values[rank];
};

export function HeartsGame({ onAction, balance, setBalance }: HeartsGameProps) {
    const { playSound } = useCasinoSFX();
    const [gameState, setGameState] = useState<'betting' | 'playing' | 'result'>('betting');
    const [playerHand, setPlayerHand] = useState<CardType[]>([]);
    const [botHand, setBotHand] = useState<CardType[]>([]);
    const [tableCards, setTableCards] = useState<{ card: CardType, playedBy: 'player' | 'bot' }[]>([]);

    const [turn, setTurn] = useState<'player' | 'bot'>('player');
    const [heartsBroken, setHeartsBroken] = useState(false);
    const [leadSuit, setLeadSuit] = useState<Suit | null>(null);
    const [playerPile, setPlayerPile] = useState<CardType[]>([]);
    const [botPile, setBotPile] = useState<CardType[]>([]);
    const [gameResult, setGameResult] = useState('');

    const betSize = 50;

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
        // 1v1 Hearts: Deal 13 cards each? 
        // Standard Hearts is 4 players. For 1v1, we can deal 13 to each and leave rest unused, 
        // OR deal 26 to each? 13 is good for quick game.
        // We'll deal 13 each and discard the rest (dead pile).
        const pHand = deck.slice(0, 13).sort((a, b) => {
            if (a.suit === b.suit) return b.value - a.value;
            return a.suit.localeCompare(b.suit);
        });
        const bHand = deck.slice(13, 26);

        setPlayerHand(pHand);
        setBotHand(bHand);
        setPlayerPile([]);
        setBotPile([]);
        setHeartsBroken(false);
        setGameState('playing');

        // Find 2 of Clubs to start? Or random?
        // Standard rules: 2 of Clubs leads. If neither has it, non-dealer leads. 
        // Let's just have player lead for simplicity in betting game.
        setTurn('player');
    };

    const playCard = async (cardIndex: number) => {
        if (turn !== 'player') return;

        const card = playerHand[cardIndex];

        // Validation
        if (leadSuit && card.suit !== leadSuit) {
            const hasLead = playerHand.some(c => c.suit === leadSuit);
            if (hasLead) return; // Must follow
            if (card.suit === 'hearts') setHeartsBroken(true);
        } else if (!leadSuit) {
            // Leading
            if (card.suit === 'hearts' && !heartsBroken) {
                const hasNonHearts = playerHand.some(c => c.suit !== 'hearts');
                if (hasNonHearts) return; // Cannot lead hearts unless broken or only hearts
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
        // AI Logic
        let playable = [];
        if (leadSuit) {
            playable = botHand.filter(c => c.suit === leadSuit);
            if (playable.length === 0) playable = botHand;
        } else {
            // Bot Leading
            playable = botHand;
            if (!heartsBroken && botHand.some(c => c.suit !== 'hearts')) {
                playable = botHand.filter(c => c.suit !== 'hearts');
            }
        }

        // Strategy: Try to LOSE tricks (Low Cards) unless sticking opponent with points
        // In Hearts, you want to avoid taking Hearts or QS. taking regular cards is fine.
        // 1v1 strategy: If leader played a Heart or QS, do not take it!
        // If leader played a safe card, maybe take it to lead next? 
        // Simplified: Play Lowest valid card. 
        // Exception: If playing off-suit, dump High Hearts or QS.

        let cardToPlay;

        if (tableCards.length > 0) {
            const opponentCard = tableCards[0].card;
            // If following suit, try to play lower than opponent.
            // If cant play lower, play highest (to get rid of high cards) since we are taking the trick anyway?
            // Wait, if following suit and we play higher, we take the trick.
            // So try to play lower.
            playable.sort((a, b) => a.value - b.value);
            const lowerCards = playable.filter(c => c.suit === leadSuit && c.value < opponentCard.value);

            if (lowerCards.length > 0) {
                cardToPlay = lowerCards[lowerCards.length - 1]; // Highest card that is still lower? No, highest safe card.
            } else {
                // Must take trick? If we must take, dump highest card of that suit to save low ones?
                // Or if off-suit, dump QS or High Heart.
                // Check for off-suit opportunity
                if (playable.some(c => c.suit !== leadSuit)) {
                    // Dump QS
                    const qs = playable.find(c => c.suit === 'spades' && c.rank === 'Q');
                    if (qs) {
                        cardToPlay = qs;
                    } else {
                        // Dump high heart
                        const hearts = playable.filter(c => c.suit === 'hearts').sort((a, b) => b.value - a.value);
                        if (hearts.length > 0) cardToPlay = hearts[0];
                        else cardToPlay = playable[playable.length - 1]; // Highest card (dump)
                    }
                } else {
                    // Must follow suit and take trick (played higher)
                    // Play highest to burn it?
                    cardToPlay = playable[playable.length - 1];
                }
            }
        } else {
            // Leading
            // Lead low non-heart
            const safeLeads = playable.filter(c => c.suit !== 'hearts' && !(c.suit === 'spades' && c.rank === 'Q'));
            if (safeLeads.length > 0) {
                safeLeads.sort((a, b) => a.value - b.value);
                cardToPlay = safeLeads[0];
            } else {
                playable.sort((a, b) => a.value - b.value);
                cardToPlay = playable[0];
            }
        }

        if (!cardToPlay) cardToPlay = playable[0]; // Fallback

        if (cardToPlay.suit === 'hearts') setHeartsBroken(true);
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
        await new Promise(r => setTimeout(r, 1500));

        const firstPlay = tableCards[0];
        const secondPlay = lastPlay;

        // Winner is highest card of lead suit
        let winner: 'player' | 'bot';

        if (secondPlay.card.suit === firstPlay.card.suit) {
            if (secondPlay.card.value > firstPlay.card.value) winner = secondPlay.playedBy;
            else winner = firstPlay.playedBy;
        } else {
            winner = firstPlay.playedBy;
        }

        const trickCards = [firstPlay.card, secondPlay.card];

        if (winner === 'player') setPlayerPile(prev => [...prev, ...trickCards]);
        else setBotPile(prev => [...prev, ...trickCards]);

        playSound('chip');
        setTableCards([]);
        setLeadSuit(null);

        if (playerHand.length === 0 && botHand.length === 0) { // Check current state - logic flaw fixed by using piles
            // Just wait for next render cycle check or check pile size?
            // Since state updates async, check logic:
            // We dealt 13 cards. 13 tricks. 
            // Total cards in piles = 26.
        }

        const totalPlayed = playerPile.length + botPile.length + 2;
        if (totalPlayed === 26) {
            // Game Over
            calculateScore(
                [...playerPile, ...(winner === 'player' ? trickCards : [])],
                [...botPile, ...(winner === 'bot' ? trickCards : [])]
            );
        } else {
            setTurn(winner);
            if (winner === 'bot') setTimeout(botTurn, 1000);
        }
    };

    const calculateScore = (pPile: CardType[], bPile: CardType[]) => {
        const calculatePoints = (pile: CardType[]) => {
            let pts = 0;
            pile.forEach(c => {
                if (c.suit === 'hearts') pts += 1;
                if (c.suit === 'spades' && c.rank === 'Q') pts += 13;
            });
            return pts;
        };

        const pPoints = calculatePoints(pPile);
        const bPoints = calculatePoints(bPile);

        // Shoot the moon logic
        let finalP = pPoints;
        let finalB = bPoints;

        if (pPoints === 26) { finalP = 0; finalB = 26; } // In 1v1, does opponent take 26? Usually 26 pts is max.
        if (bPoints === 26) { finalB = 0; finalP = 26; }

        // Determine Winner (Lowest Score)
        let win = 0;
        let msg = '';

        if (finalP < finalB) {
            win = betSize * 2;
            msg = `YOU WIN! (Score: ${finalP} vs ${finalB})`;
            playSound('win');
            setBalance(b => b + win);
            onAction(win - betSize);
        } else if (finalP > finalB) {
            msg = `YOU LOSE! (Score: ${finalP} vs ${finalB})`;
            playSound('loss');
        } else {
            msg = `DRAW! (Score: ${finalP})`;
            setBalance(b => b + betSize); // Push
        }

        setGameResult(msg);
        setGameState('result');
    };

    return (
        <div className="w-full max-w-4xl mx-auto min-h-[600px] flex flex-col items-center justify-between p-6 bg-[#361313] rounded-[3rem] border-8 border-[#5c1a1a] shadow-2xl relative overflow-hidden">
            {/* Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`
            }} />

            {/* Top Bar: Stats */}
            <div className="w-full flex justify-between items-start relative z-10 px-4">
                <div className="bg-black/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center">
                    <div className="text-[10px] uppercase font-bold text-rose-400 tracking-widest mb-1">Bot Pile</div>
                    <div className="text-2xl font-black text-white">{botPile.length / 2}</div>
                    <div className="text-xs text-rose-600 font-mono">Tricks</div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2 p-2 bg-black/20 rounded-full">
                        <Heart className={`w-5 h-5 ${heartsBroken ? 'text-rose-500' : 'text-white/20'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${heartsBroken ? 'text-rose-400' : 'text-white/40'}`}>
                            {heartsBroken ? 'Hearts Broken' : 'No Hearts Yet'}
                        </span>
                    </div>
                </div>

                <div className="bg-black/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center">
                    <div className="text-[10px] uppercase font-bold text-rose-400 tracking-widest mb-1">Your Pile</div>
                    <div className="text-2xl font-black text-white">{playerPile.length / 2}</div>
                    <div className="text-xs text-rose-600 font-mono">Tricks</div>
                </div>
            </div>

            {/* Opponent Hand (Hidden) */}
            <div className="relative z-10 h-24 w-full flex justify-center items-center my-4">
                {botHand.map((_, i) => (
                    <div key={i} className="absolute transition-all duration-300" style={{
                        transform: `translateX(${(i - botHand.length / 2) * 15}px) rotate(${(i - botHand.length / 2) * 2}deg)`,
                        zIndex: i
                    }}>
                        <div className="w-12 h-20 bg-rose-950 rounded-lg border-2 border-rose-800 shadow-xl" />
                    </div>
                ))}
            </div>

            {/* Table */}
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
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase text-rose-300 bg-black/50 px-2 py-0.5 rounded-full whitespace-nowrap">
                                {play.playedBy === 'player' ? 'You' : 'Bot'}
                            </div>
                            <PlayingCard suit={play.card.suit} rank={play.card.rank} size="md" />
                            {/* Warning indicator for point cards */}
                            {(play.card.suit === 'hearts' || (play.card.suit === 'spades' && play.card.rank === 'Q')) && (
                                <div className="absolute -right-2 -top-2 bg-rose-600 rounded-full p-1 animate-pulse shadow-lg">
                                    <Skull size={12} className="text-white" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Player Hand */}
            <div className="relative z-10 w-full mb-4">
                {gameState === 'betting' && (
                    <div className="flex justify-center">
                        <button
                            onClick={deal}
                            disabled={balance < betSize}
                            className="px-12 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase text-xl rounded-full shadow-[0_0_30px_rgba(225,29,72,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Play Hearts ${betSize}
                        </button>
                    </div>
                )}

                {gameState === 'result' && (
                    <div className="flex flex-col items-center gap-4 bg-black/80 p-8 rounded-3xl backdrop-blur-xl mx-auto max-w-md border-2 border-rose-500 animate-in fade-in zoom-in text-center absolute top-[-100px] left-1/2 -translate-x-1/2">
                        <div className="text-rose-500 text-4xl mb-2"><Skull size={48} className="mx-auto" /></div>
                        <h3 className="text-2xl font-black text-white uppercase italic">{gameResult}</h3>
                        <button
                            onClick={() => {
                                setGameState('betting');
                                setPlayerHand([]);
                                setBotHand([]);
                                setTableCards([]);
                            }}
                            className="px-8 py-3 bg-white text-black font-bold rounded-full uppercase tracking-widest hover:bg-gray-200 transition-colors"
                        >
                            Next Game
                        </button>
                    </div>
                )}

                <div className="flex justify-center -space-x-8 h-32 items-end perspective-1000 mt-4 overflow-x-visible px-4">
                    {playerHand.map((card, i) => {
                        let isPlayable = turn === 'player';
                        if (leadSuit && card.suit !== leadSuit) {
                            const hasLead = playerHand.some(c => c.suit === leadSuit);
                            if (hasLead) isPlayable = false;
                        }
                        if (!leadSuit && card.suit === 'hearts' && !heartsBroken) {
                            const hasNonHearts = playerHand.some(c => c.suit !== 'hearts');
                            if (hasNonHearts) isPlayable = false;
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
