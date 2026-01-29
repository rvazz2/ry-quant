"use client";

import React, { useEffect, useState } from 'react';
import { getCryptoTrending, getCryptoMovers } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface TrendingCoin {
    symbol: string;
    name: string;
    thumb: string;
    market_cap_rank: number;
}

interface Mover {
    symbol: string;
    price: number;
    change_24h: number;
}

export default function TrendingAssets() {
    const [trending, setTrending] = useState<TrendingCoin[]>([]);
    const [movers, setMovers] = useState<{ gainers: Mover[], losers: Mover[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trendingData, moversData] = await Promise.all([
                    getCryptoTrending(),
                    getCryptoMovers()
                ]);
                setTrending(trendingData);
                setMovers(moversData);
            } catch (error) {
                console.error("Failed to fetch trending/movers", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="h-48 glass-panel animate-pulse" />;

    return (
        <div className="space-y-4">
            {/* Trending Section */}
            <Card className="bg-[#111] border-[#222]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-gray-200 text-sm flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" /> Trending Assets
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {trending.map((coin, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#0A0A0A] border border-[#222]/50">
                            <div className="flex items-center gap-2">
                                <img src={coin.thumb} alt={coin.name} className="w-5 h-5 rounded-full" />
                                <span className="text-xs font-bold text-gray-200">{coin.symbol}</span>
                            </div>
                            <span className="text-[10px] text-gray-500">Rank #{coin.market_cap_rank}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Price Movers Section */}
            <Card className="bg-[#111] border-[#222]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-gray-200 text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-cyan-400" /> Top Movers (24h)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <div className="text-[10px] font-bold text-green-500/70 border-b border-green-500/20 pb-1 mb-2">GAINERS</div>
                            {movers?.gainers.map((coin, idx) => (
                                <div key={idx} className="flex flex-col p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                                    <span className="text-xs font-bold text-gray-200">{coin.symbol.split('/')[0]}</span>
                                    <div className="flex items-center text-[10px] text-green-400">
                                        <ArrowUpRight className="w-2.5 h-2.5" />
                                        {coin.change_24h.toFixed(1)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <div className="text-[10px] font-bold text-red-500/70 border-b border-red-500/20 pb-1 mb-2">LOSERS</div>
                            {movers?.losers.map((coin, idx) => (
                                <div key={idx} className="flex flex-col p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                                    <span className="text-xs font-bold text-gray-200">{coin.symbol.split('/')[0]}</span>
                                    <div className="flex items-center text-[10px] text-red-400">
                                        <ArrowDownRight className="w-2.5 h-2.5" />
                                        {coin.change_24h.toFixed(1)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
