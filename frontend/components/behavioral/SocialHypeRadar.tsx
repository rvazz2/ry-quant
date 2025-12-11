"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTrendingTickers } from '@/lib/api';
import { ShimmerSkeleton } from '@/components/LoadingSkeleton';
import { MessageCircle, Zap, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SocialHypeRadar = () => {
    const router = useRouter();
    const { data: trending, isLoading } = useQuery({
        queryKey: ['trending'],
        queryFn: getTrendingTickers
    });

    if (isLoading) {
        return (
            <div className="glass-panel p-6">
                <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                    <Zap className="text-yellow-400 fill-yellow-400" /> Market Movers & Sentiment
                </h3>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <ShimmerSkeleton key={i} className="h-16 w-full" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel p-6 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />

            <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2 relative z-10">
                <Zap className="text-yellow-400 fill-yellow-400" /> Market Movers & News Volume
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 relative z-10">
                {trending?.map((item: any) => (
                    <div
                        key={item.ticker}
                        onClick={() => router.push(`/research?ticker=${item.ticker}`)}
                        className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800/80 hover:border-purple-500/50 cursor-pointer transition-all duration-300 group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center font-bold text-white shadow-lg border border-white/5">
                                    {item.ticker}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-200 group-hover:text-purple-400 transition-colors">{item.name}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        <Activity size={12} /> {item.sentiment}
                                    </div>
                                </div>
                            </div>
                            <div className={`text-sm font-bold ${item.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                {item.change}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mt-3 text-xs text-slate-400">
                            <div className="flex items-center gap-1.5" title="News Importance Score">
                                <MessageCircle size={14} className="text-orange-400" />
                                <span className="font-mono">Vol: {item.mentions.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                    style={{ width: `${Math.min(item.mentions / 500, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-500 italic">
                    Real-time analysis of News Volume & Price Action
                </p>
            </div>
        </div>
    );
};

export default SocialHypeRadar;
