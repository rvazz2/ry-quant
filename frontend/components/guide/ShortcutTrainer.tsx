"use client";

import React, { useState, useEffect } from 'react';
import { Keyboard, Zap, Trophy, RotateCcw, Timer } from 'lucide-react';

interface Shortcut {
    category: string;
    key: string;
    mac?: string;
    description: string;
}

const shortcuts: Shortcut[] = [
    { category: 'Navigation', key: 'Ctrl + Home', mac: 'Cmd + Home', description: 'Jump to cell A1' },
    { category: 'Navigation', key: 'Ctrl + End', mac: 'Cmd + End', description: 'Jump to last used cell' },
    { category: 'Navigation', key: 'Ctrl + Arrow', mac: 'Cmd + Arrow', description: 'Jump to data boundary' },
    { category: 'Navigation', key: 'Ctrl + Page Up/Down', mac: 'Cmd + Page Up/Down', description: 'Switch worksheets' },
    { category: 'Formulas', key: 'Alt + =', mac: 'Cmd + Shift + T', description: 'AutoSum' },
    { category: 'Formulas', key: 'F4', mac: 'F4', description: 'Toggle absolute reference ($)' },
    { category: 'Formulas', key: 'Ctrl + `', mac: 'Ctrl + `', description: 'Show/hide formulas' },
    { category: 'Formulas', key: 'F9', mac: 'F9', description: 'Calculate all worksheets' },
    { category: 'Data Entry', key: 'Ctrl + E', mac: 'Cmd + E', description: 'Flash Fill' },
    { category: 'Data Entry', key: 'Ctrl + D', mac: 'Cmd + D', description: 'Fill Down' },
    { category: 'Data Entry', key: 'Ctrl + ;', mac: 'Cmd + ;', description: 'Insert current date' },
    { category: 'Data Entry', key: 'Ctrl + Enter', mac: 'Cmd + Enter', description: 'Fill selected range' },
    { category: 'Formatting', key: 'Ctrl + 1', mac: 'Cmd + 1', description: 'Format Cells dialog' },
    { category: 'Formatting', key: 'Ctrl + B', mac: 'Cmd + B', description: 'Bold' },
    { category: 'Formatting', key: 'Ctrl + I', mac: 'Cmd + I', description: 'Italic' },
    { category: 'Formatting', key: 'Ctrl + U', mac: 'Cmd + U', description: 'Underline' },
    { category: 'Selection', key: 'Ctrl + A', mac: 'Cmd + A', description: 'Select All' },
    { category: 'Selection', key: 'Shift + Space', mac: 'Shift + Space', description: 'Select entire row' },
    { category: 'Selection', key: 'Ctrl + Space', mac: 'Cmd + Space', description: 'Select entire column' },
    { category: 'Selection', key: 'Ctrl + Shift + Arrow', mac: 'Cmd + Shift + Arrow', description: 'Select to data boundary' },
];

export default function ShortcutTrainer() {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [currentShortcut, setCurrentShortcut] = useState<Shortcut | null>(null);
    const [userInput, setUserInput] = useState<string[]>([]);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [gameMode, setGameMode] = useState<'practice' | 'timed' | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(60);
    const [isActive, setIsActive] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    const categories = ['All', ...Array.from(new Set(shortcuts.map(s => s.category)))];

    useEffect(() => {
        const saved = localStorage.getItem('excel_shortcut_score');
        if (saved) {
            setScore(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        if (gameMode === 'timed' && isActive && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            setIsActive(false);
            setGameMode(null);
        }
    }, [gameMode, isActive, timeLeft]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!currentShortcut || !isActive) return;

            const keys: string[] = [];
            if (e.ctrlKey) keys.push('Ctrl');
            if (e.shiftKey) keys.push('Shift');
            if (e.altKey) keys.push('Alt');
            if (e.metaKey) keys.push('Cmd');

            // Add the actual key if it's not a modifier
            if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
                const keyName = e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toUpperCase() : e.key;
                keys.push(keyName);
            }

            setUserInput(keys);

            // Check if correct
            e.preventDefault();
            const correctKeys = currentShortcut.key.split(' + ').map(k => k.trim());
            const isCorrect = keys.length === correctKeys.length && keys.every(k => correctKeys.includes(k));

            setFeedback(isCorrect ? 'correct' : null);

            if (isCorrect) {
                const newScore = { correct: score.correct + 1, total: score.total + 1 };
                setScore(newScore);
                localStorage.setItem('excel_shortcut_score', JSON.stringify(newScore));

                setTimeout(() => {
                    nextShortcut();
                }, 500);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentShortcut, isActive, score]);

    const filteredShortcuts = selectedCategory === 'All'
        ? shortcuts
        : shortcuts.filter(s => s.category === selectedCategory);

    const nextShortcut = () => {
        const randomShortcut = filteredShortcuts[Math.floor(Math.random() * filteredShortcuts.length)];
        setCurrentShortcut(randomShortcut);
        setUserInput([]);
        setFeedback(null);
    };

    const startGame = (mode: 'practice' | 'timed') => {
        setGameMode(mode);
        setIsActive(true);
        setTimeLeft(60);
        setScore({ correct: 0, total: 0 });
        nextShortcut();
    };

    const resetScore = () => {
        setScore({ correct: 0, total: 0 });
        localStorage.removeItem('excel_shortcut_score');
    };

    return (
        <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-cyan-500/20 p-2 rounded-lg border border-cyan-500/30">
                        <Keyboard className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Shortcut Trainer</h2>
                        <p className="text-sm text-slate-400">Master Excel keyboard shortcuts</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {gameMode === 'timed' && (
                        <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700 flex items-center gap-2">
                            <Timer className="text-amber-400" size={18} />
                            <span className="font-mono font-bold text-amber-400">{timeLeft}s</span>
                        </div>
                    )}
                    <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700">
                        <div className="text-xs text-slate-400">All-Time Score</div>
                        <div className="text-lg font-bold text-cyan-400">{score.correct}/{score.total}</div>
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

            {!gameMode ? (
                <div className="space-y-6">
                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm text-slate-400 mb-3">Select Category:</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                        : 'bg-slate-900/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Game Mode Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => startGame('practice')}
                            className="group p-6 bg-emerald-500/10 border-2 border-emerald-500/30 hover:border-emerald-500 rounded-xl transition-all hover:bg-emerald-500/20"
                        >
                            <Zap className="text-emerald-400 mb-3 group-hover:scale-110 transition-transform" size={32} />
                            <h3 className="text-xl font-bold text-white mb-2">Practice Mode</h3>
                            <p className="text-slate-400 text-sm">Learn shortcuts at your own pace</p>
                        </button>
                        <button
                            onClick={() => startGame('timed')}
                            className="group p-6 bg-amber-500/10 border-2 border-amber-500/30 hover:border-amber-500 rounded-xl transition-all hover:bg-amber-500/20"
                        >
                            <Timer className="text-amber-400 mb-3 group-hover:scale-110 transition-transform" size={32} />
                            <h3 className="text-xl font-bold text-white mb-2">Timed Challenge</h3>
                            <p className="text-slate-400 text-sm">60 seconds - how many can you get?</p>
                        </button>
                    </div>

                    {/* Shortcut Reference */}
                    <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-4">
                        <h3 className="font-bold text-white mb-3">Quick Reference ({filteredShortcuts.length} shortcuts)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                            {filteredShortcuts.map((shortcut, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-slate-950/50 rounded">
                                    <span className="text-xs text-slate-400">{shortcut.description}</span>
                                    <code className="text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-1 rounded">{shortcut.key}</code>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {currentShortcut && (
                        <>
                            {/* Current Challenge */}
                            <div className="bg-gradient-to-br from-cyan-950/30 to-transparent p-8 rounded-xl border border-cyan-500/30 text-center">
                                <div className="text-sm text-slate-400 mb-2">Press the shortcut for:</div>
                                <h3 className="text-3xl font-bold text-white mb-6">{currentShortcut.description}</h3>

                                {/* Keyboard Visualization */}
                                <div className="flex items-center justify-center gap-3 mb-6">
                                    {userInput.length > 0 ? (
                                        userInput.map((key, idx) => (
                                            <div key={idx} className={`px-6 py-4 rounded-lg font-mono font-bold text-lg border-2 ${feedback === 'correct'
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                                : 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                                }`}>
                                                {key}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-6 py-4 rounded-lg bg-slate-900/50 border-2 border-dashed border-slate-700 text-slate-500 font-mono">
                                            Waiting for input...
                                        </div>
                                    )}
                                </div>

                                <div className="text-sm text-slate-500">
                                    Category: <span className="text-cyan-400">{currentShortcut.category}</span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex gap-3">
                                <button
                                    onClick={nextShortcut}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-all"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={() => {
                                        setGameMode(null);
                                        setIsActive(false);
                                    }}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all"
                                >
                                    End Game
                                </button>
                            </div>

                            {/* Hint (Mac users) */}
                            {currentShortcut.mac && (
                                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-center text-sm text-slate-400">
                                    Mac users: <code className="text-cyan-400 font-mono">{currentShortcut.mac}</code>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
