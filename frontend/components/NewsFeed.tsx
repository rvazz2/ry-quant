"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ExternalLink, Clock } from 'lucide-react';
import { ShimmerSkeleton } from './LoadingSkeleton';
import { getMarketNews } from '@/lib/api';
import { ShimmerSkeleton } from './LoadingSkeleton';

interface NewsItem {
    title: string;
    link: string;
    publisher: string;
    providerPublishTime: number;
    ticker: string;
}

const NewsFeed = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
            <div className="glass-panel p-6 h-full flex flex-col">
                <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]"></span>
                    Market Wires
                </h3>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    {news.length === 0 ? (
                        <div className="text-slate-500 text-sm text-center py-10">No recent wires found.</div>
                    ) : (
                        news.map((item, idx) => (
                            <a
                                key={idx}
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="block group p-3 rounded-lg hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-700"
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <h4 className="text-sm font-medium text-slate-300 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-relaxed">
                                        {item.title}
                                    </h4>
                                    <ExternalLink size={14} className="text-slate-600 group-hover:text-cyan-500 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                    <span className={`font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 ${item.ticker === 'SPY' ? 'text-green-400' :
                                        item.ticker === 'QQQ' ? 'text-blue-400' : 'text-amber-400'
                                        }`}>
                                        {item.ticker}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={10} />
                                        {new Date(item.providerPublishTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="truncate max-w-[100px] opacity-70">{item.publisher}</span>
                                </div>
                            </a>
                        ))
                    )}
                </div>
            </div>
        );
    };

    export default NewsFeed;
