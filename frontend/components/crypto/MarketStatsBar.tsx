"use client";

import React, { useEffect, useState } from 'react';
import { getCryptoGlobalStats } from '@/lib/api';
import { TrendingUp, TrendingDown, Globe, DollarSign, Bitcoin, Activity } from 'lucide-react';

interface GlobalStats {
    total_market_cap_usd: number;
    total_volume_24h_usd: number;
    btc_dominance: number;
    eth_dominance: number;
    market_cap_change_24h: number;
    active_cryptocurrencies: number;
    markets: number;
}

export default function MarketStatsBar() {
    const [stats, setStats] = useState<GlobalStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [unavailable, setUnavailable] = useState(false);

    const fetchStats = async () => {
        try {
            const data = await getCryptoGlobalStats();
            // Validate that we got real data
            if (data && data.total_market_cap_usd && data.total_market_cap_usd > 0) {
                setStats(data);
                setUnavailable(false);
            } else {
                setUnavailable(true);
            }
        } catch (error) {
            console.error("Failed to fetch global stats", error);
            setUnavailable(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 animate-pulse">
                        <div className="h-4 bg-slate-800 rounded w-20 mb-2" />
                        <div className="h-8 bg-slate-800 rounded w-32" />
                    </div>
                ))}
            </div>
        );
    }

    if (unavailable || !stats) {
        return (
            <div className="bg-slate-900/50 border border-amber-500/30 rounded-xl p-4 mb-6 text-center">
                <div className="text-amber-400 text-sm font-medium">Market data temporarily unavailable</div>
                <div className="text-slate-500 text-xs mt-1">Reconnecting to data feed...</div>
            </div>
        );
    }

    const marketCapChange = stats?.market_cap_change_24h || 0;
    const marketCapChangeColor = marketCapChange >= 0 ? 'text-green-400' : 'text-red-400';

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Market Cap */}
            <div className="group bg-gradient-to-br from-slate-900/80 to-slate-900/50 border border-slate-800 hover:border-cyan-500/30 rounded-xl p-4 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                        <Globe className="w-3.5 h-3.5" />
                        MARKET CAP
                    </div>
                    <div className="text-2xl font-bold text-white">
                        ${(stats.total_market_cap_usd / 1e12).toFixed(2)}T
                    </div>
                    <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${marketCapChangeColor}`}>
                        {marketCapChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(marketCapChange).toFixed(2)}% 24h
                    </div>
                </div>
            </div>

            {/* 24h Volume */}
            <div className="group bg-gradient-to-br from-slate-900/80 to-slate-900/50 border border-slate-800 hover:border-purple-500/30 rounded-xl p-4 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                        <Activity className="w-3.5 h-3.5" />
                        24H VOLUME
                    </div>
                    <div className="text-2xl font-bold text-white">
                        ${(stats.total_volume_24h_usd / 1e9).toFixed(0)}B
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        {stats.markets || 0} markets
                    </div>
                </div>
            </div>

            {/* BTC Dominance */}
            <div className="group bg-gradient-to-br from-slate-900/80 to-slate-900/50 border border-slate-800 hover:border-orange-500/30 rounded-xl p-4 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                        <Bitcoin className="w-3.5 h-3.5" />
                        BTC DOMINANCE
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {stats.btc_dominance?.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        ETH {stats.eth_dominance?.toFixed(1)}%
                    </div>
                </div>
            </div>

            {/* Active Cryptos */}
            <div className="group bg-gradient-to-br from-slate-900/80 to-slate-900/50 border border-slate-800 hover:border-blue-500/30 rounded-xl p-4 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        ACTIVE ASSETS
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {stats.active_cryptocurrencies?.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        Tracked globally
                    </div>
                </div>
            </div>
        </div>
    );
}
