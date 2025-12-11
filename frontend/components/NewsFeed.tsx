"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ExternalLink, Clock } from 'lucide-react';
import { ShimmerSkeleton } from './LoadingSkeleton';
import { getMarketNews } from '@/lib/api';
import { NewsItem } from '@/lib/types';




const NewsFeed = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchNews = async () => {
            try {
                const data = await getMarketNews();
                setNews(data || []);
            } catch (err) {
                console.error("Failed to fetch market news", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
        // Refresh every 5 minutes
        const interval = setInterval(fetchNews, 300000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="glass-panel p-6 h-full">
                <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    Market Wires
                </h3>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex flex-col gap-2">
                            <ShimmerSkeleton className="h-4 w-3/4" />
                            <div className="flex gap-2">
                                <ShimmerSkeleton className="h-3 w-16" />
                                <ShimmerSkeleton className="h-3 w-12" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel p-6 h-full flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none opacity-50" />

            <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-3 relative z-10">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></span>
                </span>
                <span className="tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 font-bold">Market Wires</span>
            </h3>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 relative z-10">
                {news.length === 0 ? (
                    <div className="text-slate-500 text-sm text-center py-10 italic">No recent wires found.</div>
                ) : (
                    news.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="block group/item p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-cyan-500/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] relative overflow-hidden"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/0 group-hover/item:bg-cyan-500 transition-all duration-300" />

                            <div className="flex justify-between items-start gap-3">
                                <h4 className="text-sm font-medium text-slate-300 group-hover/item:text-cyan-100 transition-colors line-clamp-2 leading-relaxed">
                                    {item.title}
                                </h4>
                                <ExternalLink size={14} className="text-slate-600 group-hover/item:text-cyan-400 shrink-0 mt-1 opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0" />
                            </div>
                            <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 group-hover/item:text-slate-400 transition-colors">
                                <span className={`font-bold px-2 py-0.5 rounded-md border backdrop-blur-sm ${item.ticker === 'SPY' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
                                    item.ticker === 'QQQ' ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                                    }`}>
                                    {item.ticker}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={11} />
                                    {new Date(item.providerPublishTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="truncate max-w-[100px] opacity-70 ml-auto border-l border-white/10 pl-3">{item.publisher}</span>
                            </div>
                        </a>
                    ))
                )}
            </div>
        </div>
    );
};

export default NewsFeed;
