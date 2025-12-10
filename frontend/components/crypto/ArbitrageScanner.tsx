"use client";

import React, { useState, useEffect } from 'react';
import { getCryptoArbitrage } from '@/lib/api';
import { RefreshCw, ArrowRight, DollarSign, ExternalLink } from 'lucide-react';

interface ArbitrageOpp {
    asset: string;
    buy_exchange: string;
    sell_exchange: string;
    buy_price: number;
    sell_price: number;
    spread_usd: number;
    spread_pct: number;
}

const ArbitrageScanner = () => {
    const [opps, setOpps] = useState<ArbitrageOpp[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getCryptoArbitrage();
            setOpps(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000); // 15s refresh
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-panel p-6 relative overflow-hidden h-full flex flex-col">
            <div className="flex justify-between items-start mb-6 z-10 relative">
                <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <DollarSign className="text-emerald-400" />
                        Arbitrage Scanner
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Real-time price spreads across exchanges.
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    className={`p-2 bg-slate-800/50 hover:bg-slate-700 text-emerald-400 rounded-lg transition-all ${loading ? 'animate-spin' : ''}`}
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
                {loading && opps.length === 0 ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-slate-800/50 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : opps.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">
                        No significant spreads found (&gt;0.05%)
                    </div>
                ) : (
                    <div className="space-y-3">
                        {opps.map((opp, idx) => (
                            <div key={idx} className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex items-center justify-between group hover:border-emerald-500/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-200">
                                        {opp.asset}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-slate-400 font-mono">
                                            <span>{opp.buy_exchange}</span>
                                            <ArrowRight size={14} />
                                            <span>{opp.sell_exchange}</span>
                                        </div>
                                        <div className="font-bold text-slate-200 mt-1">
                                            Spread: <span className="text-emerald-400">+{opp.spread_pct.toFixed(2)}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-xl font-bold text-emerald-400 font-mono">
                                        ${opp.spread_usd.toFixed(2)}
                                    </div>
                                    <button className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded hover:bg-emerald-500/20 mt-1 flex items-center gap-1 ml-auto">
                                        TRADE <ExternalLink size={10} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
                * Prices are indicative. Execution risk applies.
            </div>
        </div>
    );
};

export default ArbitrageScanner;
