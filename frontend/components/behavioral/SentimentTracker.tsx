"use client";

import React, { useState } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown, Meh, Loader2 } from "lucide-react";
import { getSentimentAnalysis } from "@/lib/api";

import { ShimmerSkeleton } from "../LoadingSkeleton";

const SentimentTracker = () => {
    const [ticker, setTicker] = useState("TSLA");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const analyze = async () => {
        setLoading(true);
        setData(null); // Clear previous data to show skeleton
        try {
            const data = await getSentimentAnalysis(ticker);
            setData(data);
        } catch (error) {
            console.error("Failed to fetch sentiment analysis", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-6 border-l-4 border-l-yellow-500 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <MessageSquare className="text-yellow-500" />
                        Fear & Greed NLP
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Sentiment analysis of recent news headlines.
                    </p>
                </div>
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    className="bg-slate-900 border border-slate-700 rounded px-3 w-24 text-center font-bold text-white"
                />
                <button
                    onClick={analyze}
                    disabled={loading}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded flex items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : "Analyze"}
                </button>
            </div>

            <SentimentResults data={data} loading={loading} />
        </div>
    );
};

// Memoized Result Component
const SentimentResults = React.memo(({ data, loading }: { data: any, loading: boolean }) => {
    if (loading) {
        return (
            <div className="animate-in fade-in duration-500 space-y-6">
                <div className="flex items-center gap-4">
                    <ShimmerSkeleton className="w-24 h-24 rounded-full border-4 border-slate-800" />
                    <div className="space-y-2">
                        <ShimmerSkeleton className="w-32 h-8 rounded" />
                        <ShimmerSkeleton className="w-48 h-4 rounded" />
                    </div>
                </div>
                <div className="space-y-3">
                    <ShimmerSkeleton className="w-24 h-3 rounded mb-2" />
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-3 bg-slate-900/50 border border-slate-800 rounded flex justify-between items-start gap-4">
                            <div className="space-y-2 w-full">
                                <ShimmerSkeleton className="w-3/4 h-4 rounded" />
                                <ShimmerSkeleton className="w-1/2 h-4 rounded" />
                            </div>
                            <ShimmerSkeleton className="w-16 h-6 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-full border-4 ${data.score > 0.1 ? 'border-emerald-500 ' : data.score < -0.1 ? 'border-rose-500' : 'border-slate-500'} w-24 h-24 flex flex-col items-center justify-center bg-slate-900`}>
                    <div className="text-2xl font-black text-white">{data.score > 0 ? '+' : ''}{data.score.toFixed(2)}</div>
                    <div className="text-sm text-slate-400 font-bold uppercase text-[10px]">Polarity</div>
                </div>
                <div>
                    <div className="text-3xl font-bold text-white mb-1">{data.label}</div>
                    <div className="text-sm text-slate-400">
                        Based on {data.count} recent headlines.
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Top Headlines</h4>
                {data.headlines.length === 0 ? (
                    <div className="text-slate-500 text-sm italic">No headlines found to analyze.</div>
                ) : (
                    data.headlines.map((h: any, i: number) => (
                        <a key={i} href={h.link} target="_blank" rel="noopener noreferrer" className="block p-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded transition-colors group">
                            <div className="flex justify-between items-start gap-4">
                                <div className="text-sm text-slate-300 group-hover:text-cyan-400 transition-colors line-clamp-2">{h.title}</div>
                                <div className={`text-xs font-bold px-2 py-1 rounded ${h.score > 0.05 ? 'bg-emerald-500/20 text-emerald-400' : h.score < -0.05 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700/50 text-slate-400'}`}>
                                    {h.score > 0 ? 'Positive' : h.score < 0 ? 'Negative' : 'Neutral'}
                                </div>
                            </div>
                        </a>
                    ))
                )}
            </div>
        </div>
    );
});
SentimentResults.displayName = 'SentimentResults';


export default SentimentTracker;
