import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Check, X, AlertCircle } from 'lucide-react';

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
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl flex flex-col h-full relative overflow-hidden">
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
                <div className="flex-1 z-10 flex flex-col justify-center">
                    <motion.div
                        key={round}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-8"
                    >
                        <div className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Scenario {round + 1}</div>
                        <p className="text-lg text-slate-200 font-medium leading-relaxed">
                            "{SCENARIOS[round].text}"
                        </p>
                    </motion.div>

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
                                    className={`w-full p-4 rounded-lg border text-left transition-all relative ${bgClass}`}
                                >
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
