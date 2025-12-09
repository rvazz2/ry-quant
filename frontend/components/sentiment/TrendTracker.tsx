"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Twitter, TrendingUp, ThumbsUp, ThumbsDown, Zap } from 'lucide-react';
import { getTrendingTickers } from '@/lib/api';

export default function TrendTracker() {
    const [trending, setTrending] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const data = await getTrendingTickers();
                setTrending(data || []);
            } catch (error) {
                console.error("Failed to fetch trending data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">Scanning Social Feeds...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Top Trending Tickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trending.map((item) => (
                    <Card key={item.ticker} className="bg-[#111] border-[#222] hover:border-blue-500/50 transition-all group overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <h3 className="text-lg font-bold text-gray-100">{item.ticker}</h3>
                                <p className="text-xs text-gray-500">{item.name}</p>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-bold ${item.sentiment === 'Bullish' ? 'bg-green-500/20 text-green-400' :
                                item.sentiment === 'Bearish' ? 'bg-red-500/20 text-red-400' :
                                    'bg-gray-500/20 text-gray-400'
                                }`}>
                                {item.sentiment}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3" /> Mentions
                                    </div>
                                    <div className="text-xl font-mono text-gray-200">{item.mentions.toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 mb-1">24h Change</div>
                                    <div className={`text-sm font-bold ${item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                        {item.change}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-[#222] flex justify-between items-center">
                                <span className="text-xs text-blue-400 flex items-center gap-1">
                                    <Twitter className="w-3 h-3" /> Trending on Twitter
                                </span>
                                <button className="text-xs bg-[#222] hover:bg-[#333] text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
                                    Analyze Details
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Hype Heatmap Placeholder */}
            <div className="p-6 rounded-2xl bg-[#080808] border border-[#222]">
                <h3 className="text-gray-300 font-medium mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" /> Real-Time Sentiment Stream
                </h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4 p-3 rounded-xl bg-[#111] border border-[#222]/50">
                            <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 font-bold">
                                {i === 1 ? 'WSB' : i === 2 ? 'TW' : 'RD'}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-200">User_{Math.floor(Math.random() * 1000)} <span className="text-xs font-normal text-gray-600">@WallStreetBets • 2m ago</span></h4>
                                <p className="text-sm text-gray-400 mt-1">
                                    Just loaded up on more $NVDA calls. The AI revolution is just starting. 🚀🚀🚀
                                </p>
                                <div className="flex gap-4 mt-2 text-xs text-gray-600">
                                    <span className="flex items-center gap-1 hover:text-green-500 cursor-pointer"><ThumbsUp className="w-3 h-3" /> 42</span>
                                    <span className="flex items-center gap-1 hover:text-red-500 cursor-pointer"><ThumbsDown className="w-3 h-3" /> 2</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
