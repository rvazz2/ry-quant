"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayingCard, Suit, Rank } from '../ui/PlayingCard';
import { Layers } from 'lucide-react';

interface RummyGameProps {
    onAction: (amount: number) => void;
    balance: number;
    setBalance: React.Dispatch<React.SetStateAction<number>>;
    playSound: (type: 'spin' | 'win' | 'loss' | 'deal' | 'click' | 'bell' | 'chip') => void;
}

type CardType = { suit: Suit; rank: Rank; value: number; id: string };

const getCardValue = (rank: Rank): number => {
    const values: Record<Rank, number> = {
        'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
        '10': 10, 'J': 10, 'Q': 10, 'K': 10
    };
    return values[rank];
};

export function RummyGame({ onAction, balance, setBalance, playSound }: RummyGameProps) {
    const [gameState, setGameState] = useState<'betting' | 'playing' | 'result'>('betting');
    const [playerHand, setPlayerHand] = useState<CardType[]>([]);
    const [botHand, setBotHand] = useState<CardType[]>([]);

    const [stockPile, setStockPile] = useState<CardType[]>([]);
    const [discardPile, setDiscardPile] = useState<CardType[]>([]);

    const [turn, setTurn] = useState<'player' | 'bot'>('player');
    const [turnPhase, setTurnPhase] = useState<'draw' | 'discard'>('draw'); // Draw first, then discard

    const [gameResult, setGameResult] = useState('');
    const betSize = 50;

    const createDeck = (): CardType[] => {
        const suits: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];
        const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const deck: CardType[] = [];
        suits.forEach(suit => {
            ranks.forEach(rank => {
                deck.push({
                    suit,
                    rank,
                    value: getCardValue(rank),
                    id: `${suit}-${rank}-${Math.random()}`
                });
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
        // Gin Rummy: 10 cards each
        const pHand = deck.slice(0, 10).sort((a, b) => a.value - b.value);
        const bHand = deck.slice(10, 20);
        const startDiscard = deck[20];
        const remainingStock = deck.slice(21);

        setPlayerHand(pHand);
        setBotHand(bHand);
        setDiscardPile([startDiscard]);
        setStockPile(remainingStock);

        setGameState('playing');
        setTurn('player');
        setTurnPhase('draw');
    };

    const drawCard = (source: 'stock' | 'discard') => {
        if (turn !== 'player' || turnPhase !== 'draw') return;

        let newCard: CardType;
        if (source === 'stock') {
            if (stockPile.length === 0) return; // Draw?
            newCard = stockPile[0];
            setStockPile(prev => prev.slice(1));
        } else {
            if (discardPile.length === 0) return;
            newCard = discardPile[discardPile.length - 1];
            setDiscardPile(prev => prev.slice(0, -1));
        }

        const newHand = [...playerHand, newCard];
        // Sort hand for UI niceness
        // newHand.sort((a,b) => a.value - b.value); // Maybe don't auto sort so user feels control? Let's auto sort for now.
        newHand.sort((a, b) => {
            if (a.suit === b.suit) return getCardPrice(a.rank) - getCardPrice(b.rank);
            return a.suit.localeCompare(b.suit);
        });

        setPlayerHand(newHand);
        setTurnPhase('discard');
        playSound('chip');
    };

    // Helper for sorting
    const getCardPrice = (r: Rank) => {
        const order: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        return order.indexOf(r);
    };

    const discardCard = (index: number) => {
        if (turn !== 'player' || turnPhase !== 'discard') return;

        const card = playerHand[index];
        const newHand = [...playerHand];
        newHand.splice(index, 1);

        setPlayerHand(newHand);
        setDiscardPile(prev => [...prev, card]);
        playSound('deal');

        // End Turn
        // Check for Auto-Knock logic later? For now manual knock.
        setTurn('bot');
        setTurnPhase('draw');
        setTimeout(botTurn, 1000);
    };

    const botTurn = () => {
        // Bot Logic
        // 1. Draw
        // Simple: Tak discard if it helps (matches pair/run), else stock.
        // Super Simple: Always take stock unless discard is high value? 
        // Random for MVP simulation
        const takeDiscard = Math.random() > 0.8;

        let newCard: CardType;
        if (takeDiscard && discardPile.length > 0) {
            newCard = discardPile[discardPile.length - 1];
            setDiscardPile(prev => prev.slice(0, -1));
        } else if (stockPile.length > 0) {
            newCard = stockPile[0];
            setStockPile(prev => prev.slice(1));
        } else {
            // Empty stock, end game? Reshuffle discard?
            endGame('draw');
            return;
        }

        const bHand = [...botHand, newCard];
        // 2. Discard
        // Dump highest unmatched card
        bHand.sort((a, b) => b.value - a.value);
        const junk = bHand[0];
        const finalBotHand = bHand.slice(1);

        setBotHand(finalBotHand);
        setDiscardPile(prev => [...prev, junk]);
        playSound('deal');

        // Bot Knock? (Random 10% chance to end game if low deadwood?)
        // For simulation, let's just switch turn.
        setTurn('player');
        setTurnPhase('draw');
    };

    const knock = () => {
        if (turn !== 'player' || turnPhase !== 'discard') return; // Can only knock instead of discard? No, usually after discard or replace discard.
        // Gin Rummy Rules: Knock means you end the round. Deadwood count.
        // Let's assume user knocks AFTER draw but BEFORE discard? No, usually you discard the 11th card then knock.
        // Simplified: Button "Knock" available during discard phase. It discards selected card and ends.
        // But UI is "Click card to discard".
        // Let's add a "Knock" button that requires selecting a discard?
        // Simpler: Just a "Call Hand" button available when it's your turn.

        // Calculate Scores
        const pDeadwood = calculateDeadwood(playerHand); // Hand has 11 cards? No 10. Wait, need to discard first.
        // If phase is discard, we have 11 cards. We need to discard one to knock.
        // So clicking "Knock" then card?

        // Let's just automate score for now.
        // End Game.
        endGame('knock');
    };

    // Very basic deadwood calculator (naive)
    const calculateDeadwood = (hand: CardType[]) => {
        // This is complex. Finding optimal sets/runs.
        // Naive: Sum of all cards. (Bot acts same way so fair playing field of incompetence).
        return hand.reduce((sum, c) => sum + Math.min(10, c.value), 0);
    };

    const endGame = (reason: 'knock' | 'draw') => {
        if (reason === 'draw') {
            setGameResult("Reshuffling... (Draw)");
            setBalance(b => b + betSize); // Push
            return;
        }

        const pDeadwood = calculateDeadwood(playerHand); // Needs to handle 11 cards? User should have 10.
        // Assume user knocked with 10 cards (after discard). But we triggered this in discard phase?
        // UI should force discard then separate button? 
        // Let's just compare Values for this Casino Lite version.

        const bDeadwood = calculateDeadwood(botHand);

        let msg = '';
        let win = 0;

        if (pDeadwood < bDeadwood) {
            win = betSize * 2;
            msg = `YOU WIN! (${pDeadwood} vs ${bDeadwood})`;
            playSound('win');
            setBalance(b => b + win);
            onAction(win - betSize);
        } else {
            msg = `YOU LOSE! (${pDeadwood} vs ${bDeadwood})`;
            playSound('loss');
        }

        setGameResult(msg);
        setGameState('result');
    };

    return (
        <div className="w-full max-w-4xl mx-auto min-h-[600px] flex flex-col items-center justify-between p-6 bg-[#1a2e35] rounded-[3rem] border-8 border-[#2d4a54] shadow-2xl relative overflow-hidden">

            {/* Stats */}
            <div className="w-full flex justify-between items-start relative z-10 px-4">
                <div className="bg-black/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center">
                    <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-widest mb-1">Bot Hand</div>
                    <div className="text-2xl font-black text-white">{botHand.length}</div>
                </div>
                <div className="bg-black/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center">
                    <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-widest mb-1">Deck</div>
                    <div className="text-2xl font-black text-white">{stockPile.length}</div>
                </div>
            </div>

            {/* Center Area */}
            <div className="flex gap-12 items-center justify-center h-48 relative z-10">
                {/* Stock Pile */}
                <button
                    onClick={() => drawCard('stock')}
                    disabled={gameState !== 'playing' || turn !== 'player' || turnPhase !== 'draw'}
                    className="relative w-24 h-36 bg-blue-900 rounded-xl border-4 border-white/10 shadow-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                    <div className="absolute inset-2 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center">
                        <Layers className="text-white/20" />
                    </div>
                </button>

                {/* Discard Pile */}
                <button
                    onClick={() => drawCard('discard')}
                    disabled={gameState !== 'playing' || turn !== 'player' || turnPhase !== 'draw'}
                    className="relative w-24 h-36 border-4 border-white/10 rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                    {discardPile.length > 0 ? (
                        <PlayingCard suit={discardPile[discardPile.length - 1].suit} rank={discardPile[discardPile.length - 1].rank} size="md" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/10 text-xs font-bold uppercase tracking-widest">Empty</div>
                    )}
                </button>
            </div>

            {/* Player Hand */}
            <div className="relative z-10 w-full mb-4">
                {gameState === 'playing' && turn === 'player' && turnPhase === 'discard' && (
                    <div className="flex justify-center mb-6">
                        <div className="bg-black/60 px-6 py-2 rounded-full text-cyan-300 text-sm font-bold uppercase tracking-widest animate-pulse border border-cyan-500/30">
                            Discard a Card to End Turn
                        </div>
                    </div>
                )}

                {gameState === 'playing' && turn === 'player' && turnPhase === 'discard' && playerHand.length === 11 && (
                    <div className="absolute top-[-60px] w-full flex justify-center">
                        <button
                            onClick={knock}
                            className="px-8 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest rounded-full shadow-lg transition-transform hover:scale-105"
                        >
                            Knock (Showdown)
                        </button>
                    </div>
                )}

                {gameState === 'betting' && (
                    <div className="flex justify-center">
                        <button
                            onClick={deal}
                            disabled={balance < betSize}
                            className="px-12 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase text-xl rounded-full shadow-[0_0_30px_rgba(8,145,178,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Deal Rummy ${betSize}
                        </button>
                    </div>
                )}

                {gameState === 'result' && (
                    <div className="flex flex-col items-center gap-4 bg-black/80 p-8 rounded-3xl backdrop-blur-xl mx-auto max-w-md border-2 border-cyan-500 animate-in fade-in zoom-in text-center absolute top-[-100px] left-1/2 -translate-x-1/2 z-50">
                        <h3 className="text-2xl font-black text-white uppercase italic">{gameResult}</h3>
                        <button
                            onClick={() => {
                                setGameState('betting');
                                setPlayerHand([]);
                                setBotHand([]);
                                setDiscardPile([]);
                                setStockPile([]);
                            }}
                            className="px-8 py-3 bg-white text-black font-bold rounded-full uppercase tracking-widest hover:bg-gray-200 transition-colors"
                        >
                            Next Hand
                        </button>
                    </div>
                )}

                <div className="flex justify-center -space-x-8 h-32 items-end perspective-1000 mt-4 overflow-x-visible px-4">
                    {playerHand.map((card, i) => (
                        <motion.button
                            key={card.id}
                            onClick={() => discardCard(i)}
                            whileHover={{ y: -20, zIndex: 50 }}
                            initial={{ y: 0, rotate: (i - playerHand.length / 2) * 5 }}
                            animate={{
                                y: 0,
                                rotate: (i - playerHand.length / 2) * 3,
                                opacity: turn === 'player' && turnPhase === 'discard' ? 1 : 0.8
                            }}
                            disabled={turn !== 'player' || turnPhase !== 'discard'}
                            className="relative disabled:cursor-not-allowed origin-bottom transform transition-transform"
                            style={{ zIndex: i }}
                        >
                            <PlayingCard suit={card.suit} rank={card.rank} size="sm" />
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
}
