"use client";

import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area
} from 'recharts';
import { Activity, ArrowRightLeft, TrendingUp, TrendingDown, GitCompare } from 'lucide-react';

const PairsTrading = () => {
    const [ticker1, setTicker1] = useState("KO");
    const [ticker2, setTicker2] = useState("PEP");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const { getPairsAnalysis } = await import('@/lib/api');
            const json = await getPairsAnalysis(ticker1, ticker2);
            setData(json);
        } catch (error) {
            console.error("Failed to analyze pair", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <GitCompare className="text-indigo-400" />
                        Statistical Arbitrage Scanner
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Find mean-reversion opportunities in correlated pairs (e.g., Coke vs. Pepsi).
                    </p>
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-900/20 transition-all flex items-center gap-2"
                >
                    {loading ? <Activity className="animate-spin" /> : <ArrowRightLeft size={18} />}
                    {loading ? 'Scanning...' : 'Analyze Pair'}
                </button>
            </div>

            {/* Inputs */}
            <div className="flex gap-4 items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="flex-1">
                    <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Ticker A (Long?)</label>
                    <input
                        type="text"
                        value={ticker1}
                        onChange={(e) => setTicker1(e.target.value.toUpperCase())}
                        className="w-full bg-slate-800 border-none rounded p-2 text-white font-mono text-center font-bold"
                    />
                </div>
                <div className="text-slate-500 font-bold text-xl">/</div>
                <div className="flex-1">
                    <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Ticker B (Short?)</label>
                    <input
                        type="text"
                        value={ticker2}
                        onChange={(e) => setTicker2(e.target.value.toUpperCase())}
                        className="w-full bg-slate-800 border-none rounded p-2 text-white font-mono text-center font-bold"
                    />
                </div>
            </div>

            {data && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    {/* Signal Box */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={`p-4 rounded-xl border-l-4 ${Math.abs(data.current_z_score) > 2 ? 'bg-indigo-500/10 border-indigo-500' : 'bg-slate-800/50 border-slate-600'} flex flex-col justify-center`}>
                            <div className="text-xs text-slate-400 uppercase font-bold">Z-Score Signal</div>
                            <div className={`text-xl font-bold ${Math.abs(data.current_z_score) > 2 ? 'text-indigo-400' : 'text-slate-200'}`}>
                                {data.current_z_score.toFixed(2)} σ
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                {Math.abs(data.current_z_score) > 2 ? 'Extreme Divergence!' : 'Normal Range'}
                            </div>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col justify-center">
                            <div className="text-xs text-slate-400 uppercase font-bold">Correlation (30d)</div>
                            <div className={`text-xl font-bold ${data.current_correlation > 0.8 ? 'text-emerald-400' : data.current_correlation < 0.5 ? 'text-rose-400' : 'text-yellow-400'}`}>
                                {data.current_correlation.toFixed(2)}
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl border flex flex-col justify-center items-center text-center ${data.signal.includes('BUY') ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                            <div className="text-xs text-slate-400 uppercase font-bold mb-1">Action</div>
                            <div className="font-bold text-white text-sm">{data.signal}</div>
                        </div>
                    </div>

                    {/* Z-Score Chart */}
                    <div className="h-[300px] bg-slate-900/30 rounded-xl p-4 border border-slate-800">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-4">Z-Score History (Mean Reversion)</div>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.series}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short' })} />
                                <YAxis stroke="#64748b" fontSize={10} domain={[-3, 3]} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                                <ReferenceLine y={2} stroke="#f87171" strokeDasharray="3 3" label={{ value: '+2σ (Sell)', fill: '#f87171', fontSize: 10, position: 'right' }} />
                                <ReferenceLine y={0} stroke="#94a3b8" />
                                <ReferenceLine y={-2} stroke="#34d399" strokeDasharray="3 3" label={{ value: '-2σ (Buy)', fill: '#34d399', fontSize: 10, position: 'right' }} />
                                <Line type="monotone" dataKey="z_score" stroke="#818cf8" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Spread Chart */}
                    <div className="h-48 bg-slate-900/30 rounded-xl p-4 border border-slate-800">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-4">Price Ratio (Spread)</div>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.series}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="date" hide />
                                <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                                <Line type="monotone" dataKey="spread" stroke="#22d3ee" strokeWidth={1} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PairsTrading;
