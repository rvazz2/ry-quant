import React, { useState, useEffect } from 'react';
import { getPersonalityTest } from '@/lib/api';
import { motion } from 'framer-motion';
import { User, CheckCircle2, ArrowRight } from 'lucide-react';

export default function TraderPersonalityTest() {
    const [quiz, setQuiz] = useState<any>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<any>({});
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuiz();
    }, []);

    const loadQuiz = async () => {
        setLoading(true);
        try {
            const data = await getPersonalityTest();
            setQuiz(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (points: any) => {
        // Accumulate points
        const newAnswers = { ...answers };
        for (const [key, value] of Object.entries(points)) {
            newAnswers[key] = (newAnswers[key] || 0) + (value as number);
        }
        setAnswers(newAnswers);

        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            calculateResult(newAnswers);
        }
    };

    const calculateResult = (finalAnswers: any) => {
        // Simple logic: find max category
        let maxCategory = "Balanced";
        let maxScore = -1;

        for (const [category, score] of Object.entries(finalAnswers)) {
            if ((score as number) > maxScore) {
                maxScore = score as number;
                maxCategory = category;
            }
        }

        // Map category to Title
        const titles: any = {
            risk_taker: "The Maverick",
            risk_averse: "The Guardian",
            analytical: "The Strategist",
            emotional: "The Sentiment Trader",
            investor: "The Warren Buffett",
            impulsive: "The Gunslinger",
            disciplined: "The Monk"
        };

        setResult(titles[maxCategory] || "The Pragmatist");
    };

    const resetQuiz = () => {
        setCurrentQuestion(0);
        setAnswers({});
        setResult(null);
    };

    if (loading) return <div className="h-64 w-full bg-slate-900/50 animate-pulse rounded-xl" />;
    if (!quiz) return null;

    return (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl h-full flex flex-col items-center justify-center relative overflow-hidden">
            <div className="flex w-full justify-between items-center mb-6 z-10">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    Trader Archetype
                </h3>
            </div>

            {!result ? (
                <div className="w-full max-w-md z-10">
                    <div className="mb-4 text-sm text-slate-400">
                        Question {currentQuestion + 1} of {quiz.questions.length}
                    </div>

                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <h4 className="text-xl font-medium text-white mb-6">
                            {quiz.questions[currentQuestion].text}
                        </h4>

                        <div className="space-y-3">
                            {quiz.questions[currentQuestion].options.map((option: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(option.points)}
                                    className="w-full text-left p-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-300 group-hover:text-white transition-colors">
                                            {option.text}
                                        </span>
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            ) : (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center z-10"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                        {result}
                    </h2>
                    <p className="text-slate-400 mb-8 max-w-xs mx-auto">
                        Your trading style is defined by your choices.
                    </p>
                    <button
                        onClick={resetQuiz}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-medium transition-colors"
                    >
                        Retake Test
                    </button>
                </motion.div>
            )}

            {/* Background Decoration */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -z-1" />
        </div>
    );
}
