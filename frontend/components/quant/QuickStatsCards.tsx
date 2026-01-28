"use client";

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity, AlertCircle, BarChart } from 'lucide-react';

interface MarketStats {
    vix: number;
    spyChange: number;
    marketStatus: 'open' | 'closed' | 'pre' | 'post';
    timestamp: string;
}

export default function QuickStatsCards() {
    const [stats, setStats] = useState<MarketStats>({
        vix: 0,
        spyChange: 0,
        marketStatus: 'closed',
        timestamp: new Date().toISOString()
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarketStats = async () => {
            try {
                // Simulated data - replace with real API call
                const mockData: MarketStats = {
                    vix: 14.52,
                    spyChange: 0.34,
                    marketStatus: new Date().getHours() >= 9 && new Date().getHours() < 16 ? 'open' : 'closed',
                    timestamp: new Date().toISOString()
                };

                setTimeout(() => {
                    setStats(mockData);
                    setLoading(false);
                }, 500);
            } catch (error) {
                console.error('Failed to fetch market stats:', error);
                setLoading(false);
            }
        };

        fetchMarketStats();
        const interval = setInterval(fetchMarketStats, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const getMarketStatusColor = () => {
        switch (stats.marketStatus) {
            case 'open': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'closed': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            case 'pre': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'post': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const getVIXStatus = (vix: number) => {
        if (vix < 15) return { label: 'Low Fear', color: 'text-emerald-400' };
        if (vix < 25) return { label: 'Moderate', color: 'text-yellow-400' };
        return { label: 'High Fear', color: 'text-rose-400' };
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-900/50 animate-pulse rounded-xl border border-slate-800" />
                ))}
            </div>
        );
    }

    const vixStatus = getVIXStatus(stats.vix);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-in fade-in duration-300">
            {/* Market Status */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/30 transition-all group">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <BarChart size={20} className="text-cyan-400" />
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Market Status</h3>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${stats.marketStatus === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                </div>
                <div className={`inline-flex px-3 py-1.5 rounded-full text-sm font-bold border ${getMarketStatusColor()}`}>
                    {stats.marketStatus?.toUpperCase()}
                </div>
            </div>

            {/* VIX (Fear Index) */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-purple-500/30 transition-all group">
                <div className="flex items-center gap-2 mb-3">
                    <Activity size={20} className="text-purple-400" />
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">VIX (Fear Index)</h3>
                </div>
                <div className="flex items-end gap-3">
                    <div className="text-3xl font-black text-white tabular-nums">
                        {stats.vix.toFixed(2)}
                    </div>
                    <div className={`text-sm font-bold pb-1 ${vixStatus.color}`}>
                        {vixStatus.label}
                    </div>
                </div>
            </div>

            {/* SPY Performance */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/30 transition-all group">
                <div className="flex items-center gap-2 mb-3">
                    {stats.spyChange >= 0 ? (
                        <TrendingUp size={20} className="text-emerald-400" />
                    ) : (
                        <TrendingDown size={20} className="text-rose-400" />
                    )}
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">SPY Today</h3>
                </div>
                <div className="flex items-end gap-3">
                    <div className={`text-3xl font-black tabular-nums ${stats.spyChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {stats.spyChange >= 0 ? '+' : ''}{stats.spyChange.toFixed(2)}%
                    </div>
                </div>
            </div>
        </div>
    );
}
