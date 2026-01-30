"use client";

import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, RefreshCw, TrendingUp, DollarSign, Globe } from 'lucide-react';

const AI_SUMMARIES = [
    {
        category: "Markets",
        icon: <TrendingUp size={16} className="text-cyan-400" />,
        content: "Global markets are showing mixed signals today as investors digest the latest inflation data. The S&P 500 opened slightly lower, while tech stocks continue to show resilience. Bond yields have stabilized after yesterday's volatility."
    },
    {
        category: "Economy",
        icon: <DollarSign size={16} className="text-emerald-400" />,
        content: "The Federal Reserve's latest minutes suggest a cautious approach to rate cuts, emphasizing data dependence. Consumer spending remains robust, though manufacturing output has seen a slight contraction in the latest quarter."
    },
    {
        category: "Geopolitics",
        icon: <Globe size={16} className="text-purple-400" />,
        content: "Energy markets are reacting to increased tensions in the Middle East, with oil prices ticking upward. Meanwhile, trade talks between major economies are progressing, potentially reducing tariff uncertainties."
    }
];

const DailyBriefing = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [displayText, setDisplayText] = useState<string[]>([]);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const mountedRef = React.useRef(false);

    useEffect(() => {
        mountedRef.current = true;
        generateBriefing();
        return () => {
            mountedRef.current = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const generateBriefing = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setIsGenerating(true);
        setDisplayText([]); // Clear text

        let currentSectionIndex = 0;

        const streamSection = () => {
            if (!mountedRef.current) return;

            if (currentSectionIndex >= AI_SUMMARIES.length) {
                setIsGenerating(false);
                return;
            }

            timeoutRef.current = setTimeout(() => {
                if (!mountedRef.current) return;

                setDisplayText(prev => {
                    // Prevent duplicates in strict mode if somehow double triggered
                    if (prev.length > currentSectionIndex) return prev;
                    return [...prev, AI_SUMMARIES[currentSectionIndex].content];
                });

                currentSectionIndex++;
                streamSection();
            }, 800);
        };

        streamSection();
    };

    return (
        <div className="glass-panel p-6 relative overflow-hidden group">
            {/* AI Background Glow */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-all duration-700" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                            <Bot size={20} className="text-cyan-300" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                Market Intelligence
                                <Sparkles size={14} className="text-yellow-400 animate-pulse" />
                            </h2>
                            <p className="text-xs text-slate-400 font-medium tracking-wide">AI-Generated Daily Briefing</p>
                        </div>
                    </div>

                    <button
                        onClick={generateBriefing}
                        disabled={isGenerating}
                        className={`p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-slate-400 hover:text-cyan-300 ${isGenerating ? 'animate-spin opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="space-y-4">
                    {AI_SUMMARIES.map((summary, idx) => (
                        <div
                            key={summary.category}
                            className={`transition-all duration-700 transform ${displayText.length > idx
                                ? 'translate-y-0 opacity-100'
                                : 'translate-y-4 opacity-0'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-1 shrink-0 p-1.5 rounded-lg bg-slate-800/50 border border-white/5 text-slate-300">
                                    {summary.icon}
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                                        {summary.category}
                                        {displayText.length <= idx && isGenerating && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                        )}
                                    </h3>
                                    <p className="text-sm text-slate-300 leading-relaxed font-light">
                                        {displayText.length > idx ? (
                                            summary.content
                                        ) : (
                                            <span className="h-4 w-full bg-slate-800/50 rounded animate-pulse inline-block" />
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {displayText.length === 0 && isGenerating && (
                        <div className="flex items-center gap-2 text-xs text-cyan-400/70 font-mono animate-pulse mt-4">
                            <div className="w-2 h-2 rounded-full bg-cyan-400" />
                            Analyzing market sentiment...
                        </div>
                    )}
                </div>

                {/* Footer Metadata */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        <span>Live Feed Active</span>
                    </div>
                    <div>
                        Source: Global News Aggregate (Simulated)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyBriefing;
