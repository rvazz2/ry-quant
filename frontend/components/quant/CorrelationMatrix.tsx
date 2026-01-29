"use client";

import React, { useState, useEffect } from 'react';
import { Network, RefreshCw } from 'lucide-react';

interface CorrelationData {
    [key: string]: {
        [key: string]: number;
    };
}

const DEFAULT_TICKERS = ['SPY', 'QQQ', 'IWM', 'TLT', 'GLD'];

export default function CorrelationMatrix() {
    const [tickers, setTickers] = useState<string[]>(DEFAULT_TICKERS);
    const [correlations, setCorrelations] = useState<CorrelationData>({});
    const [loading, setLoading] = useState(true);

    const fetchCorrelations = React.useCallback(async () => {
        setLoading(true);

        // Simulated correlation matrix data
        const mockCorrelations: CorrelationData = {};
        tickers.forEach((ticker1, i) => {
            mockCorrelations[ticker1] = {};
            tickers.forEach((ticker2, j) => {
                if (i === j) {
                    mockCorrelations[ticker1][ticker2] = 1.0;
                } else {
                    // Generate realistic correlation values
                    const base = Math.random() * 0.8 - 0.2; // Range: -0.2 to 0.6
                    mockCorrelations[ticker1][ticker2] = Number(base.toFixed(2));
                }
            });
        });

        setTimeout(() => {
            setCorrelations(mockCorrelations);
            setLoading(false);
        }, 500);
    }, [tickers]);

    useEffect(() => {
        fetchCorrelations();
    }, [fetchCorrelations]);

    const getCorrelationColor = (value: number) => {
        if (value === 1) return 'bg-purple-600 text-white';
        if (value > 0.7) return 'bg-emerald-600 text-white';
        if (value > 0.3) return 'bg-emerald-500/50 text-white';
        if (value > 0) return 'bg-slate-600 text-slate-200';
        if (value > -0.3) return 'bg-rose-500/50 text-white';
        return 'bg-rose-600 text-white';
    };

    if (loading) {
        return (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="h-64 flex items-center justify-center">
                    <RefreshCw className="text-slate-600 animate-spin" size={32} />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                        <Network className="text-cyan-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-100">Correlation Matrix</h2>
                        <p className="text-slate-400 text-sm">Asset correlation heatmap (30-day rolling)</p>
                    </div>
                </div>
                <button
                    onClick={fetchCorrelations}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-cyan-400 font-bold transition-all flex items-center gap-2"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Correlation Matrix Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="p-2"></th>
                            {tickers.map(ticker => (
                                <th key={ticker} className="p-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                    {ticker}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tickers.map((ticker1) => (
                            <tr key={ticker1}>
                                <td className="p-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                    {ticker1}
                                </td>
                                {tickers.map((ticker2) => {
                                    const value = correlations[ticker1]?.[ticker2] ?? 0;
                                    return (
                                        <td key={ticker2} className="p-1">
                                            <div
                                                className={`p-3 rounded text-center font-bold text-sm transition-all hover:scale-110 cursor-pointer ${getCorrelationColor(value)}`}
                                                title={`${ticker1} vs ${ticker2}: ${value.toFixed(2)}`}
                                            >
                                                {value.toFixed(2)}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="text-xs text-slate-400 font-bold">Correlation Strength:</div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded bg-rose-600"></div>
                            <span className="text-xs text-slate-400">Strong Negative</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded bg-slate-600"></div>
                            <span className="text-xs text-slate-400">Weak</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded bg-emerald-600"></div>
                            <span className="text-xs text-slate-400">Strong Positive</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insight Box */}
            <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-400 text-xs font-bold">i</span>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-1 text-sm">Portfolio Diversification Tip</h4>
                        <p className="text-slate-300 text-sm">
                            Look for assets with low or negative correlations to reduce portfolio risk.
                            TLT (bonds) typically has negative correlation with equities during market stress.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
