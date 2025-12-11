"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, RefreshCcw, Skull } from 'lucide-react';
import { getInverseCramer } from '@/lib/api';

const InverseCramer = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCramer = async () => {
            try {
                const data = await getInverseCramer();
                setData(data);
            } catch (error) {
                console.error("Failed to fetch Strategy data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCramer();
    }, []);

    if (loading) return (
        <div className="glass-panel p-6 h-64 flex flex-col items-center justify-center gap-4">
            <RefreshCcw className="animate-spin text-purple-500 w-8 h-8" />
            <p className="text-slate-500 text-sm animate-pulse">Calculating Alpha strategies...</p>
        </div>
    );

    if (!data) return (
        <div className="glass-panel p-6 h-64 flex flex-col items-center justify-center gap-4 border-l-4 border-rose-500/50">
            <Skull className="text-rose-500 w-12 h-12 opacity-50" />
            <p className="text-slate-400">Unable to load Strategy data.</p>
        </div>
    );

    return (
        <div className="glass-panel p-6 border-l-4 border-l-purple-600 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <TrendingUp className="text-purple-500" />
                        Smart Money vs. Hype
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        comparing Value (Smart) vs. Growth (Hype) performance.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
                    <div className="text-xs text-slate-500 uppercase font-bold">SPY Return</div>
                    <div className="text-xl font-bold text-slate-300">{data.summary.SPY_Return}</div>
                </div>
                <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/50 text-center">
                    <div className="text-xs text-purple-400 uppercase font-bold">Value (Safe)</div>
                    <div className="text-2xl font-black text-white">{data.summary.InverseCramer_Return}</div>
                </div>
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
                    <div className="text-xs text-slate-500 uppercase font-bold">Alpha (Spread)</div>
                    <div className="text-xl font-bold text-emerald-400">{data.summary.Alpha}</div>
                </div>
            </div>

            <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.series}>
                        <XAxis dataKey="date" hide />
                        <YAxis domain={['auto', 'auto']} hide />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                        <Legend />
                        <Line name="SPY" type="monotone" dataKey="SPY" stroke="#64748b" strokeWidth={2} dot={false} />
                        <Line name="Value (Smart)" type="monotone" dataKey="InverseCramer" stroke="#a855f7" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                        <Line name="Growth (Hype)" type="monotone" dataKey="JimCramer" stroke="#f43f5e" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="text-xs text-slate-500 italic text-center">
                * Real-time comparison of S&P 500 Value (IKE) vs Growth (IVW) ETFs.
            </div>
        </div>
    );
};

export default InverseCramer;
