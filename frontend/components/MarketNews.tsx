"use client";

import React, { useEffect, useState } from 'react';
import { getMarketNews } from '../lib/api';
import { NewsItem } from '../lib/types';
import { Newspaper, ExternalLink, Clock } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import { ShimmerSkeleton } from './LoadingSkeleton';

interface MarketNewsProps {
    symbol?: string;
}

const MarketNews = ({ symbol }: MarketNewsProps) => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchNews = async () => {
            setLoading(true);
            try {
                const data = await getMarketNews(symbol);
                setNews(data);
            } catch (error) {
                console.error("Failed to fetch market news", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [symbol]);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    // Safe Hydration Pattern:
    // 1. Server & Initial Client: Render Loading State
    // 2. Client (After Mount): Render Content (or Loading if fetching)

    if (!mounted) {
        return (
            <div className="space-y-4">
                <div className="animate-in fade-in duration-500">
                    <div className="flex items-center gap-2 mb-4">
                        <ShimmerSkeleton className="w-9 h-9 rounded-lg" />
                        <ShimmerSkeleton className="w-48 h-7 rounded" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 h-[160px] flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <ShimmerSkeleton className="w-24 h-5 rounded-full" />
                                        <ShimmerSkeleton className="w-4 h-4 rounded" />
                                    </div>
                                    <ShimmerSkeleton className="w-full h-4 mb-2 rounded" />
                                    <ShimmerSkeleton className="w-3/4 h-4 rounded" />
                                </div>
                                <div className="pt-3 border-t border-slate-800/50">
                                    <ShimmerSkeleton className="w-20 h-3 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {loading ? (
                <div className="animate-in fade-in duration-500">
                    <div className="flex items-center gap-2 mb-4">
                        <ShimmerSkeleton className="w-9 h-9 rounded-lg" />
                        <ShimmerSkeleton className="w-48 h-7 rounded" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 h-[160px] flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <ShimmerSkeleton className="w-24 h-5 rounded-full" />
                                        <ShimmerSkeleton className="w-4 h-4 rounded" />
                                    </div>
                                    <ShimmerSkeleton className="w-full h-4 mb-2 rounded" />
                                    <ShimmerSkeleton className="w-3/4 h-4 rounded" />
                                </div>
                                <div className="pt-3 border-t border-slate-800/50">
                                    <ShimmerSkeleton className="w-20 h-3 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (!news || news.length === 0) ? (
                // NO NEWS STATE
                <div className="text-center p-8 text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
                    <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No market news available at the moment.</p>
                </div>
            ) : (
                // SUCCESS STATE
                <>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Newspaper className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-100">Latest Market News</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {news.map((item, index) => (
                            <a
                                key={index}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group glass-panel glass-panel-hover p-5 flex flex-col justify-between h-full min-h-[180px] relative overflow-hidden"
                            >
                                {/* Hover Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="label-text text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                                            {item.publisher}
                                        </span>
                                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                                    </div>
                                    <h4 className="text-base font-semibold text-slate-100 group-hover:text-white line-clamp-3 mb-4 leading-relaxed tracking-tight">
                                        {item.title}
                                    </h4>
                                </div>

                                <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500 mt-auto pt-3 border-t border-slate-700/30">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="font-medium">{formatTime(item.providerPublishTime)}</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default function MarketNewsData(props: MarketNewsProps) {
    return (
        <ErrorBoundary name="Market News">
            <MarketNews {...props} />
        </ErrorBoundary>
    );
}
