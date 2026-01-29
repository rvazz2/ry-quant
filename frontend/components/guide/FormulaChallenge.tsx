"use client";

import React, { useState, useEffect } from 'react';
import { Trophy, Target, CheckCircle2, XCircle, Lightbulb, RotateCcw } from 'lucide-react';

interface Challenge {
    id: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    title: string;
    description: string;
    data: Record<string, string | number>[];
    correctAnswer: string;
    hint: string;
    explanation: string;
}

const challenges: Challenge[] = [
    {
        id: '1',
        difficulty: 'Easy',
        title: 'Sum Monthly Sales',
        description: 'Calculate the total sales from January to March.',
        data: [
            { Month: 'January', Sales: 5000 },
            { Month: 'February', Sales: 6200 },
            { Month: 'March', Sales: 5800 }
        ],
        correctAnswer: '=SUM(B2:B4)',
        hint: 'Use the SUM function with a range',
        explanation: '=SUM(B2:B4) adds all values in cells B2 through B4. You can also use =B2+B3+B4, but SUM is more efficient for larger ranges.'
    },
    {
        id: '2',
        difficulty: 'Easy',
        title: 'Average Test Score',
        description: 'Find the average score across all tests.',
        data: [
            { Test: 'Quiz 1', Score: 85 },
            { Test: 'Quiz 2', Score: 92 },
            { Test: 'Midterm', Score: 88 }
        ],
        correctAnswer: '=AVERAGE(B2:B4)',
        hint: 'AVERAGE function calculates the mean',
        explanation: '=AVERAGE(B2:B4) calculates the arithmetic mean of the scores. The result would be (85+92+88)/3 = 88.33.'
    },
    {
        id: '3',
        difficulty: 'Medium',
        title: 'Pass or Fail',
        description: 'Create a formula that shows "Pass" if score >= 70, otherwise "Fail".',
        data: [
            { Student: 'Alice', Score: 85 },
            { Student: 'Bob', Score: 62 },
            { Student: 'Carol', Score: 78 }
        ],
        correctAnswer: '=IF(B2>=70,"Pass","Fail")',
        hint: 'Use IF function with a condition',
        explanation: '=IF(B2>=70,"Pass","Fail") tests if the score in B2 is 70 or higher. If TRUE, it returns "Pass"; otherwise "Fail". This is a basic logical function.'
    },
    {
        id: '4',
        difficulty: 'Medium',
        title: 'Find Product Price',
        description: 'Look up the price for Product ID "P102" from the table.',
        data: [
            { ID: 'P101', Product: 'Widget', Price: 25 },
            { ID: 'P102', Product: 'Gadget', Price: 40 },
            { ID: 'P103', Product: 'Tool', Price: 15 }
        ],
        correctAnswer: '=VLOOKUP("P102",A2:C4,3,FALSE)',
        hint: 'VLOOKUP searches the first column and returns a value from a specified column',
        explanation: '=VLOOKUP("P102",A2:C4,3,FALSE) searches for "P102" in column A, then returns the value from the 3rd column (C) of that row. FALSE means exact match.'
    },
    {
        id: '5',
        difficulty: 'Hard',
        title: 'Conditional Sum',
        description: 'Sum only the sales values that are greater than $5,000.',
        data: [
            { Region: 'East', Sales: 4500 },
            { Region: 'West', Sales: 7200 },
            { Region: 'North', Sales: 6100 },
            { Region: 'South', Sales: 3800 }
        ],
        correctAnswer: '=SUMIF(B2:B5,">5000")',
        hint: 'SUMIF allows you to sum based on a condition',
        explanation: '=SUMIF(B2:B5,">5000") sums only the values in B2:B5 that are greater than 5000. Result: 7200 + 6100 = 13,300.'
    },
    {
        id: '6',
        difficulty: 'Hard',
        title: 'Performance Tier',
        description: 'Assign tier: "Elite" if sales > $100K, "Pro" if > $50K, otherwise "Standard".',
        data: [
            { Rep: 'John', Sales: 105000 },
            { Rep: 'Jane', Sales: 65000 },
            { Rep: 'Mike', Sales: 42000 }
        ],
        correctAnswer: '=IFS(B2>100000,"Elite",B2>50000,"Pro",TRUE,"Standard")',
        hint: 'IFS function tests multiple conditions in order',
        explanation: '=IFS(B2>100000,"Elite",B2>50000,"Pro",TRUE,"Standard") checks conditions sequentially. First check: >100K → Elite. Second: >50K → Pro. Otherwise (TRUE) → Standard. This is cleaner than nested IFs.'
    }
];

export default function FormulaChallenge() {
    const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
    const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
    const [userFormula, setUserFormula] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    useEffect(() => {
        const saved = localStorage.getItem('excel_challenge_score');
        if (saved) {
            setScore(JSON.parse(saved));
        }
    }, []);

    const filteredChallenges = selectedDifficulty === 'All'
        ? challenges
        : challenges.filter(c => c.difficulty === selectedDifficulty);

    const selectChallenge = (challenge: Challenge) => {
        setCurrentChallenge(challenge);
        setUserFormula('');
        setFeedback(null);
        setShowHint(false);
    };

    const checkAnswer = () => {
        if (!currentChallenge) return;

        const normalizeFormula = (formula: string) => formula.toUpperCase().replace(/\s/g, '');
        const isCorrect = normalizeFormula(userFormula) === normalizeFormula(currentChallenge.correctAnswer);

        setFeedback(isCorrect ? 'correct' : 'incorrect');

        const newScore = { correct: score.correct + (isCorrect ? 1 : 0), total: score.total + 1 };
        setScore(newScore);
        localStorage.setItem('excel_challenge_score', JSON.stringify(newScore));
    };

    const resetScore = () => {
        setScore({ correct: 0, total: 0 });
        localStorage.removeItem('excel_challenge_score');
    };

    return (
        <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
                        <Target className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Formula Challenge</h2>
                        <p className="text-sm text-slate-400">Test your Excel formula skills</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700">
                        <div className="text-xs text-slate-400">Score</div>
                        <div className="text-lg font-bold text-emerald-400">{score.correct}/{score.total}</div>
                    </div>
                    <button
                        onClick={resetScore}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                        title="Reset Score"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
            </div>

            {/* Difficulty Filter */}
            <div className="flex gap-2 mb-6">
                {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                    <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedDifficulty === diff
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                : 'bg-slate-900/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                            }`}
                    >
                        {diff}
                    </button>
                ))}
            </div>

            {!currentChallenge ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredChallenges.map((challenge) => (
                        <button
                            key={challenge.id}
                            onClick={() => selectChallenge(challenge)}
                            className="group p-4 bg-slate-900/50 border border-slate-700 hover:border-emerald-500/50 rounded-lg transition-all text-left hover:bg-slate-900"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{challenge.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded ${challenge.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
                                        challenge.difficulty === 'Medium' ? 'bg-cyan-500/20 text-cyan-400' :
                                            'bg-purple-500/20 text-purple-400'
                                    }`}>
                                    {challenge.difficulty}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400">{challenge.description}</p>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Challenge Header */}
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-bold text-white">{currentChallenge.title}</h3>
                            <button
                                onClick={() => setCurrentChallenge(null)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <p className="text-slate-300 mb-4">{currentChallenge.description}</p>

                        {/* Sample Data Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left p-2 text-slate-500">Cell</th>
                                        {Object.keys(currentChallenge.data[0]).map((key) => (
                                            <th key={key} className="text-left p-2 text-slate-400 font-bold">{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentChallenge.data.map((row, idx) => (
                                        <tr key={idx} className="border-b border-slate-800">
                                            <td className="p-2 text-slate-500 font-mono text-xs">{idx + 2}</td>
                                            {Object.values(row).map((val, i) => (
                                                <td key={i} className="p-2 text-slate-200 font-mono">{val}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Formula Input */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Your Formula:</label>
                        <input
                            type="text"
                            value={userFormula}
                            onChange={(e) => setUserFormula(e.target.value)}
                            placeholder="=SUM(A1:A10)"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-emerald-500"
                            onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={checkAnswer}
                            disabled={!userFormula}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={20} />
                            Check Answer
                        </button>
                        <button
                            onClick={() => setShowHint(!showHint)}
                            className="px-6 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-all flex items-center gap-2"
                        >
                            <Lightbulb size={20} />
                            {showHint ? 'Hide' : 'Show'} Hint
                        </button>
                    </div>

                    {/* Hint */}
                    {showHint && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="text-amber-400" size={18} />
                                <span className="font-bold text-amber-400">Hint:</span>
                            </div>
                            <p className="text-slate-300">{currentChallenge.hint}</p>
                        </div>
                    )}

                    {/* Feedback */}
                    {feedback && (
                        <div className={`border rounded-lg p-4 ${feedback === 'correct'
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : 'bg-red-500/10 border-red-500/30'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                                {feedback === 'correct' ? (
                                    <CheckCircle2 className="text-emerald-400" size={24} />
                                ) : (
                                    <XCircle className="text-red-400" size={24} />
                                )}
                                <span className={`font-bold text-lg ${feedback === 'correct' ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                    {feedback === 'correct' ? 'Correct!' : 'Not quite right'}
                                </span>
                            </div>
                            <p className="text-slate-300 mb-2">{currentChallenge.explanation}</p>
                            <div className="bg-slate-900/50 p-3 rounded border border-slate-700 mt-3">
                                <div className="text-xs text-slate-400 mb-1">Correct Answer:</div>
                                <code className="text-emerald-400 font-mono">{currentChallenge.correctAnswer}</code>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
