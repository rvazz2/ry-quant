"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Star, Target, TrendingUp, Award, Flame, Trophy, Clock, CheckCircle } from 'lucide-react';

interface LibraryStatsProps {
    totalTerms: number;
    studiedTerms: number;
    masteredTerms: number;
    bookmarkedTerms: number;
    categoryBreakdown: { category: string; count: number; studied: number }[];
}

interface QuizRecord {
    id: string;
    date: number;
    totalCards: number;
    masteredCount: number;
    reviewCount: number;
    score: number;
}

const LibraryStats: React.FC<LibraryStatsProps> = ({
    totalTerms,
    studiedTerms,
    masteredTerms,
    bookmarkedTerms,
    categoryBreakdown,
}) => {
    const [quizHistory, setQuizHistory] = useState<QuizRecord[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('library-quiz-history');
            if (saved) {
                try {
                    setQuizHistory(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to load quiz history inside stats", e);
                }
            }
        }
    }, []);

    const studiedPercentage = totalTerms ? Math.round((studiedTerms / totalTerms) * 100) : 0;
    const masteredPercentage = totalTerms ? Math.round((masteredTerms / totalTerms) * 100) : 0;

    // Calculate Quiz Metrics
    const totalQuizzes = quizHistory.length;
    const avgQuizScore = totalQuizzes
        ? Math.round(quizHistory.reduce((sum, q) => sum + q.score, 0) / totalQuizzes)
        : 0;
    const bestQuizScore = totalQuizzes
        ? Math.max(...quizHistory.map(q => q.score))
        : 0;

    const stats = [
        {
            icon: BookOpen,
            label: 'Total Terms',
            value: totalTerms,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            iconColor: 'text-blue-400',
        },
        {
            icon: Target,
            label: 'Studied',
            value: studiedTerms,
            percentage: studiedPercentage,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            iconColor: 'text-purple-400',
        },
        {
            icon: Award,
            label: 'Mastered',
            value: masteredTerms,
            percentage: masteredPercentage,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-500/10',
            iconColor: 'text-green-400',
        },
        {
            icon: Star,
            label: 'Bookmarked',
            value: bookmarkedTerms,
            color: 'from-yellow-500 to-orange-500',
            bgColor: 'bg-yellow-500/10',
            iconColor: 'text-yellow-400',
        },
    ];

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-400 bg-green-500/10 border-green-500/20';
        if (score >= 70) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
        return 'text-red-400 bg-red-500/10 border-red-500/20';
    };

    return (
        <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative group"
                        >
                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500`} />
                            <div className="relative bg-slate-900 rounded-2xl p-5 border border-slate-800">
                                <div className={`inline-flex p-3 rounded-xl ${stat.bgColor} mb-4`}>
                                    <Icon className={stat.iconColor} size={24} />
                                </div>
                                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-400">{stat.label}</div>
                                {stat.percentage !== undefined && (
                                    <div className="mt-3">
                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full bg-gradient-to-r ${stat.color}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stat.percentage}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">{stat.percentage}%</div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Mastery Level */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <TrendingUp className="text-cyan-400" size={20} />
                        Overall Mastery
                    </h3>
                    <div className="text-2xl font-bold text-cyan-400">{masteredPercentage}%</div>
                </div>
                <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full flex">
                        <motion.div
                            className="bg-gradient-to-r from-green-500 to-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${masteredPercentage}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                        />
                        <motion.div
                            className="bg-gradient-to-r from-purple-500 to-pink-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${studiedPercentage - masteredPercentage}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                        />
                    </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
                        <span className="text-slate-400">Mastered ({masteredTerms})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                        <span className="text-slate-400">In Progress ({studiedTerms - masteredTerms})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-700" />
                        <span className="text-slate-400">Not Started ({totalTerms - studiedTerms})</span>
                    </div>
                </div>
            </motion.div>

            {/* Grid of Breakdown & Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                {categoryBreakdown.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Flame className="text-orange-400" size={20} />
                            Category Progress
                        </h3>
                        <div className="space-y-3">
                            {categoryBreakdown.slice(0, 5).map((cat, idx) => {
                                const progress = cat.count ? Math.round((cat.studied / cat.count) * 100) : 0;
                                return (
                                    <div key={cat.category}>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-slate-300 font-medium">{cat.category}</span>
                                            <span className="text-slate-500">{cat.studied}/{cat.count}</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 1, delay: 0.6 + idx * 0.1 }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Quiz Achievements */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between"
                >
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Trophy className="text-yellow-400" size={20} />
                            Quiz Performance & Achievements
                        </h3>

                        {totalQuizzes > 0 ? (
                            <div className="space-y-6">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                                        <div className="text-2xl font-bold text-cyan-400">{totalQuizzes}</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Completed</div>
                                    </div>
                                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                                        <div className="text-2xl font-bold text-purple-400">{avgQuizScore}%</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Average</div>
                                    </div>
                                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
                                        <div className="text-2xl font-bold text-yellow-400">{bestQuizScore}%</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-semibold">High Score</div>
                                    </div>
                                </div>

                                {/* Recent History */}
                                <div className="space-y-2.5">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Recent Activity</span>
                                    {quizHistory.slice(0, 3).map((record) => (
                                        <div
                                            key={record.id}
                                            className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-900 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">
                                                    <Clock size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-slate-300">
                                                        {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {record.masteredCount} of {record.totalCards} mastered
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border ${getScoreColor(record.score)}`}>
                                                {record.score}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                                <Award className="text-slate-600" size={40} />
                                <p className="text-sm text-slate-400 max-w-[280px]">
                                    No quiz performance history found. Start Quiz Mode to earn stats and achievements!
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LibraryStats;
