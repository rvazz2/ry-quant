import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Check, X } from 'lucide-react';

const SCENARIOS = [
    {
        id: 1,
        text: "You bought a stock at $100. It drops to $80. You buy more to 'lower your average' without re-evaluating the company.",
        answer: "Sunk Cost / Escalation",
        options: ["Resulting", "Sunk Cost / Escalation", "Hindsight Bias"]
    },
    {
        id: 2,
        text: "You see your neighbor get rich on Dogecoin, so you put your life savings into it.",
        answer: "Herding / FOMO",
        options: ["Herding / FOMO", "Anchoring", "Gambler's Fallacy"]
    },
    {
        id: 3,
        text: "You sold a stock and it went up 10%. You tell yourself 'I knew I should have held it!' even though you were nervous at the time.",
        answer: "Hindsight Bias",
        options: ["Confirmation Bias", "Hindsight Bias", "Availability Heuristic"]
    },
    {
        id: 4,
        text: "You believe Tesla will perform well ONLY because you see so many Teslas on the road in your wealthy neighborhood.",
        answer: "Availability Heuristic",
        options: ["Availability Heuristic", "Mental Accounting", "Overconfidence"]
    }
];

export default function BiasesCasino() {
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const handleGuess = (option: string) => {
        if (selected) return; // Prevent double guess
        setSelected(option);
        if (option === SCENARIOS[round].answer) {
            setScore(score + 100);
            setIsCorrect(true);
        } else {
            setIsCorrect(false);
        }

        setTimeout(() => {
            if (round < SCENARIOS.length - 1) {
                setRound(round + 1);
                setSelected(null);
                setIsCorrect(null);
            } else {
                // Game Over state handled in render
                setRound(SCENARIOS.length);
            }
        }, 1500);
    };

    const resetGame = () => {
        setScore(0);
        setRound(0);
        setSelected(null);
        setIsCorrect(null);
    };

    const isGameOver = round >= SCENARIOS.length;

    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col h-full relative overflow-hidden shadow-xl group">
            {/* Green Felt Texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            <div className="flex justify-between items-center mb-6 z-10">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                    <Dices className="w-5 h-5 text-green-400" />
                    Biases Casino
                </h3>
                <div className="px-3 py-1 bg-slate-800 rounded-full text-green-400 font-mono font-bold border border-green-500/20">
                    ${score}
                </div>
            </div>

            {!isGameOver ? (
                <div className="flex-1 z-10 flex flex-col justify-center perspective-1000">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={round}
                            initial={{ opacity: 0, rotateX: -90 }}
                            animate={{ opacity: 1, rotateX: 0 }}
                            exit={{ opacity: 0, rotateX: 90 }}
                            transition={{ duration: 0.4 }}
                            className="mb-8 p-6 bg-slate-950/50 border border-white/5 rounded-2xl backdrop-blur-sm"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <div className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em]">Scenario {round + 1}</div>
                                <div className="text-[10px] text-slate-500 font-mono">1/{SCENARIOS.length}</div>
                            </div>
                            <p className="text-lg md:text-xl text-white font-medium leading-relaxed font-serif italic">
                                "{SCENARIOS[round].text}"
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    <div className="space-y-3">
                        {SCENARIOS[round].options.map((option) => {
                            let bgClass = "bg-slate-800 hover:bg-slate-700 border-slate-700";
                            if (selected === option) {
                                bgClass = isCorrect ? "bg-green-900/50 border-green-500 text-green-200" : "bg-red-900/50 border-red-500 text-red-200";
                            }
                            // Show correct answer if wrong
                            if (selected && !isCorrect && option === SCENARIOS[round].answer) {
                                bgClass = "bg-green-900/50 border-green-500 text-green-200";
                            }

                            return (
                                <button
                                    key={option}
                                    onClick={() => handleGuess(option)}
                                    disabled={selected !== null}
                                    className={`w-full p-4 rounded-xl border text-left transition-all relative group overflow-hidden ${bgClass}`}
                                >
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {option}
                                    {selected === option && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {isCorrect ? <Check className="w-5 h-5 text-green-400" /> : <X className="w-5 h-5 text-red-400" />}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex-1 z-10 flex flex-col items-center justify-center text-center">
                    <h2 className="text-3xl font-black text-white mb-2">Game Over!</h2>
                    <p className="text-slate-400 mb-6">You earned <span className="text-green-400 font-bold">${score}</span> logic points.</p>
                    <button
                        onClick={resetGame}
                        className="px-8 py-3 bg-green-500 hover:bg-green-600 text-slate-900 font-bold rounded-lg transition-colors"
                    >
                        Play Again
                    </button>
                </div>
            )}

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 blur-[80px] -z-1" />
        </div>
    );
}
