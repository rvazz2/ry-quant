"use client";

import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Trophy, ArrowRight, RefreshCw, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number; // index
    explanation: string;
}

const QUESTIONS: Question[] = [
    {
        id: 1,
        question: "You have a credit card with a $1,000 balance at 20% APR. If you only make the minimum payment ($25) each month, how long will it take to pay off?",
        options: [
            "About 2 years",
            "About 5 years",
            "Forever (seriously, like 9+ years)",
            "6 months"
        ],
        correctAnswer: 2,
        explanation: "Paying only the minimum covers mostly interest. It would take over 9 years and cost you roughly $1,000 in INTEREST alone. Always pay the full balance."
    },
    {
        id: 2,
        question: "When is the best time to start investing for retirement?",
        options: [
            "When I graduate and have a full-time job",
            "When I'm 30 and settle down",
            "Right now (even with $5)",
            "After I pay off all my student loans 100%"
        ],
        correctAnswer: 2,
        explanation: "Time in the market beats timing the market. Compound interest needs TIME. Starting at 20 vs 30 can mean hundreds of thousands of dollars difference."
    },
    {
        id: 3,
        question: "Which of these is generally considered 'Good Debt'?",
        options: [
            "Credit card debt for a vacation",
            "Car loan for a luxury vehicle",
            "Student loans for a high-ROI degree",
            "Payday loan for rent"
        ],
        correctAnswer: 2,
        explanation: "Debt is a tool. If it increases your future earning potential (like a useful degree) or value (like a mortgage), it can be 'good'. High-interest consumption debt is always 'bad'."
    },
    {
        id: 4,
        question: "What is the '50/30/20' rule?",
        options: [
            "50% needs, 30% wants, 20% savings/debt",
            "50% savings, 30% rent, 20% food",
            "50% stocks, 30% bonds, 20% cash",
            "50% chance of rain, 30% chance of sun, 20% chance of snow"
        ],
        correctAnswer: 0,
        explanation: "It's a simple budgeting framework. 50% for essentials (Needs), 30% for fun (Wants), and 20% for your future (Savings & Debt Repayment)."
    },
    {
        id: 5,
        question: "If an investment offers a guaranteed 20% return per year with zero risk, it is likely...",
        options: [
            "A great opportunity",
            "A scam (Ponzi scheme)",
            "A government bond",
            "A standard savings account"
        ],
        correctAnswer: 1,
        explanation: "There is no such thing as high return with zero risk. If it sounds too good to be true, it's a scam. The S&P 500 averages ~10% historically with risk."
    }
];

export default function FinancialQuiz() {
    const [started, setStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const handleStart = () => {
        setStarted(true);
        resetQuiz();
    };

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setShowResult(false);
    };

    const handleOptionSelect = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
    };

    const handleSubmitAnswer = () => {
        if (selectedOption === null) return;

        const isCorrect = selectedOption === QUESTIONS[currentQuestionIndex].correctAnswer;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }
        setIsAnswered(true);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < QUESTIONS.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
        }
    };

    const tryAgain = () => {
        resetQuiz();
    };

    // Render Start Screen
    if (!started) {
        return (
            <div className="w-full max-w-3xl mx-auto my-24 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl rounded-3xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 p-12 rounded-3xl text-center shadow-2xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-lg shadow-cyan-500/30">
                        <Trophy className="text-white w-10 h-10" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-6">Are You Money Smart?</h2>
                    <p className="text-xl text-slate-400 mb-10 max-w-lg mx-auto leading-relaxed">
                        90% of college students fail this basic financial literacy test.
                        See if you can beat the system.
                    </p>
                    <button
                        onClick={handleStart}
                        className="px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-lg font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:scale-105 active:scale-95"
                    >
                        Take the Challenge
                    </button>
                </div>
            </div>
        );
    }

    // Render Result Screen
    if (showResult) {
        let grade = "";
        let message = "";
        let color = "";

        if (score === QUESTIONS.length) {
            grade = "Financial Wizard 🧙‍♂️";
            message = "Incredible! You know more than most adults. You're ready to start building serious wealth.";
            color = "text-emerald-400";
        } else if (score >= 3) {
            grade = "Money Smart 🎓";
            message = "Not bad! You have a solid foundation, but there's still room to sharpen your skills.";
            color = "text-cyan-400";
        } else {
            grade = "Future Broke Person 💸";
            message = "Uh oh. The system is designed to take advantage of you. You need to learn this stuff ASAP.";
            color = "text-rose-400";
        }

        return (
            <div className="w-full max-w-3xl mx-auto my-24 animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-12 rounded-3xl text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 via-cyan-500 to-emerald-500" />

                    <h3 className="text-slate-400 text-lg font-medium uppercase tracking-widest mb-4">Quiz Complete</h3>

                    <div className="text-6xl font-black text-white mb-2">{score} / {QUESTIONS.length}</div>
                    <div className={`text-3xl font-bold mb-8 ${color} drop-shadow-lg`}>{grade}</div>

                    <p className="text-xl text-slate-300 mb-12 max-w-xl mx-auto">{message}</p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={tryAgain}
                            className="flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all font-semibold"
                        >
                            <RefreshCw size={18} /> Try Again
                        </button>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl transition-all font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                        >
                            Start Your Journey <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const question = QUESTIONS[currentQuestionIndex];

    // Render Question Screen
    return (
        <div className="w-full max-w-3xl mx-auto my-24 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]">

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-1.5">
                    <div
                        className="bg-cyan-500 h-full transition-all duration-500 ease-out"
                        style={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
                    />
                </div>

                <div className="p-8 md:p-12 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                            Question {currentQuestionIndex + 1} of {QUESTIONS.length}
                        </span>
                        <span className="text-slate-500 font-mono text-sm">Score: {score}</span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">
                        {question.question}
                    </h3>

                    <div className="space-y-3 flex-1">
                        {question.options.map((option, index) => {
                            let optionClass = "w-full p-4 md:p-5 rounded-xl text-left text-lg transition-all border-2 ";

                            if (isAnswered) {
                                if (index === question.correctAnswer) {
                                    optionClass += "bg-emerald-500/20 border-emerald-500 text-emerald-100";
                                } else if (index === selectedOption) {
                                    optionClass += "bg-rose-500/20 border-rose-500 text-rose-100";
                                } else {
                                    optionClass += "bg-slate-800/30 border-transparent text-slate-500 opacity-50";
                                }
                            } else {
                                if (selectedOption === index) {
                                    optionClass += "bg-cyan-500/10 border-cyan-500 text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.1)]";
                                } else {
                                    optionClass += "bg-slate-800/50 border-transparent text-slate-300 hover:bg-slate-700/50 hover:border-slate-600";
                                }
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleOptionSelect(index)}
                                    disabled={isAnswered}
                                    className={optionClass}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{option}</span>
                                        {isAnswered && index === question.correctAnswer && <CheckCircle2 className="text-emerald-500" />}
                                        {isAnswered && index === selectedOption && index !== question.correctAnswer && <XCircle className="text-rose-500" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation & Next Button */}
                    <div className="mt-8 min-h-[100px] flex flex-col justify-end">
                        {isAnswered ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className={`p-4 rounded-xl border mb-6 flex gap-3 ${selectedOption === question.correctAnswer
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-200'
                                    }`}>
                                    <AlertCircle className="shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="font-bold mb-1">{selectedOption === question.correctAnswer ? 'Correct!' : 'Incorrect'}</p>
                                        <p className="text-sm opacity-90 leading-relaxed">{question.explanation}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleNextQuestion}
                                    className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
                                >
                                    {currentQuestionIndex < QUESTIONS.length - 1 ? 'Next Question' : 'See Results'} <ArrowRight size={20} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={selectedOption === null}
                                className={`w-full py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${selectedOption !== null
                                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                Submit Answer
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
