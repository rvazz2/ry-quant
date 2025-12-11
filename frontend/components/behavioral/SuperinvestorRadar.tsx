"use client";

import React, { useState, useEffect } from 'react';
import { getSuperinvestorData } from '@/lib/api';
import { Briefcase, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WhaleTrade {
    name: string;
    firm: string;
    action: "BUY" | "SELL" | "HOLD";
    ticker: string;
    company: string;
    value: string;
    date: string;
    confidence: string;
}

const SuperinvestorRadar = () => {
    const [trades, setTrades] = useState<WhaleTrade[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchWhales = async () => {
        setLoading(true);
        setError(false);
        try {
            const data = await getSuperinvestorData();
            if (Array.isArray(data)) {
                setTrades(data);
            } else {
                setTrades([]);
                setError(true);
            }
        } catch (error) {
            console.error("Failed to fetch whale data", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWhales();
    }, []);

    return (
        <div className="glass-panel p-6 border-l-4 border-l-blue-500 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Briefcase className="text-blue-500" />
                        Superinvestor Radar
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Tracking 13F filings of legendary investors.
                    </p>
                </div>
                <button
                    onClick={fetchWhales}
                    className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors"
                    title="Refresh Data"
                >
                    <Briefcase size={16} />
                </button>
            </div>

            <div className="space-y-3">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-slate-900/50 animate-pulse rounded-lg border border-slate-800/50" />
                    ))
                ) : error ? (
                    <div className="text-center py-8 text-slate-500 bg-slate-900/30 rounded-lg border border-dashed border-slate-800">
                        <p>Failed to load superinvestor data.</p>
                        <button onClick={fetchWhales} className="text-blue-400 hover:text-blue-300 text-sm mt-2 font-medium">Try Again</button>
                    </div>
                ) : trades.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 bg-slate-900/30 rounded-lg border border-dashed border-slate-800">
                        No recent whale trades found.
                    </div>
                ) : (
                    trades.map((trade, idx) => (
                        <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${trade.action === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' :
                                    trade.action === 'SELL' ? 'bg-rose-500/10 text-rose-400' :
                                        'bg-slate-700/20 text-slate-400'
                                    }`}>
                                    {trade.action === 'BUY' ? <TrendingUp size={16} /> :
                                        trade.action === 'SELL' ? <TrendingDown size={16} /> :
                                            <Minus size={16} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-200">{trade.name}</h3>
                                    <div className="text-xs text-slate-500">{trade.firm}</div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="font-mono font-bold text-slate-200 flex items-center justify-end gap-2">
                                    <span className={trade.action === 'BUY' ? 'text-emerald-400' : trade.action === 'SELL' ? 'text-rose-400' : 'text-slate-400'}>
                                        {trade.action}
                                    </span>
                                    <span>{trade.ticker}</span>
                                </div>
                                <div className="text-xs text-slate-500">{trade.value}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="text-xs text-slate-600 text-center pt-2">
                * Based on latest 13F Filings. Data may be delayed.
            </div>
        </div>
    );
};

export default SuperinvestorRadar;
