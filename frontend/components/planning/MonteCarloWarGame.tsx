"use client";

import React, { useState, useMemo } from 'react';
import { api } from '@/lib/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Play, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react';

const SimulationChart = React.memo(({ result, chartData }: { result: any, chartData: any[] }) => {
    if (!result) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 border-2 border-dashed border-slate-700 rounded-xl p-8">
                <ShieldCheck size={48} className="opacity-20" />
                <p>Enter your details and run the War Game to see if your plan survives 5,000 simulations.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border ${result.success_rate >= 90 ? 'bg-emerald-500/10 border-emerald-500/30' : result.success_rate >= 75 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30'} flex flex-col items-center justify-center text-center`}>
                    <div className="text-xs text-slate-400 uppercase font-bold mb-1">Success Rate</div>
                    <div className={`text-3xl font-bold ${result.success_rate >= 90 ? 'text-emerald-400' : result.success_rate >= 75 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {result.success_rate.toFixed(1)}%
                    </div>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center">
                    <div className="text-xs text-slate-400 uppercase font-bold mb-1">Median Ending Wealth</div>
                    <div className="text-xl font-mono text-cyan-400">
                        ${result.median_final_balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center">
                    <div className="text-xs text-slate-400 uppercase font-bold mb-1">Worst Case (10%)</div>
                    <div className="text-xl font-mono text-slate-300">
                        ${result.worst_case_final_balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                </div>
            </div>

            <div className="h-64 w-full bg-slate-900/30 rounded-xl p-4 border border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} tickFormatter={(val) => `$${val / 1000}k`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                            formatter={(value: number) => [`$${Math.round(value).toLocaleString()}`, '']}
                        />
                        <Legend />
                        <defs>
                            <linearGradient id="rangeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="p90" stroke="none" fill="url(#rangeGradient)" fillOpacity={1} stackId="1" />
                        <Area type="monotone" dataKey="p10" stroke="none" fill="#0f172a" fillOpacity={1} stackId="1" />
                        <Line type="monotone" dataKey="p90" stroke="#8b5cf6" strokeWidth={1} strokeDasharray="5 5" name="90th Percentile" dot={false} />
                        <Line type="monotone" dataKey="median" stroke="#22d3ee" strokeWidth={2} name="Median Outcome" dot={false} />
                        <Line type="monotone" dataKey="p10" stroke="#f43f5e" strokeWidth={1} name="10th Percentile (Risk)" dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </>
    );
});
SimulationChart.displayName = 'SimulationChart';

const MonteCarloWarGame = () => {
    // Inputs
    const [balance, setBalance] = useState(100000);
    const [contribution, setContribution] = useState(12000);
    const [withdrawal, setWithdrawal] = useState(60000); // Future withdrawal
    const [years, setYears] = useState(30);
    const [risk, setRisk] = useState(0.8); // 0.0 to 1.0

    // Results
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const runSimulation = async () => {
        setLoading(true);
        try {
            const res = await api.post('/planning/simulate', {
                initial_balance: balance,
                annual_contribution: contribution,
                annual_withdrawal: withdrawal,
                years: years,
                risk_level: risk
            });
            setResult(res.data);
        } catch (error) {
            console.error("Simulation failed", error);
        } finally {
            setLoading(false);
        }
    };

    // Prepare Chart Data
    const chartData = useMemo(() => result ? result.years.map((year: number, i: number) => ({
        year,
        median: result.percentiles.median[i],
        p10: result.percentiles.p10[i],
        p90: result.percentiles.p90[i]
    })) : [], [result]);

    return (
        <div className="glass-panel p-6 space-y-8 border-l-4 border-l-purple-500">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <ShieldAlert className="text-purple-400" />
                        Retirement War Game (Monte Carlo)
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Simulate 5,000 market scenarios. Will you run out of money?
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Inputs */}
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-500 uppercase font-bold">Current Savings</label>
                        <input
                            type="number"
                            value={balance}
                            onChange={(e) => setBalance(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 uppercase font-bold">Annual Savings</label>
                        <input
                            type="number"
                            value={contribution}
                            onChange={(e) => setContribution(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 uppercase font-bold">Desired Spending</label>
                        <input
                            type="number"
                            value={withdrawal}
                            onChange={(e) => setWithdrawal(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 uppercase font-bold">Years</label>
                        <input
                            type="range" min="10" max="60"
                            value={years}
                            onChange={(e) => setYears(Number(e.target.value))}
                            className="w-full accent-purple-500"
                        />
                        <div className="text-right text-xs text-slate-400">{years} Years</div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 uppercase font-bold">Risk Level (Allocation)</label>
                        <input
                            type="range" min="0" max="1" step="0.1"
                            value={risk}
                            onChange={(e) => setRisk(Number(e.target.value))}
                            className="w-full accent-cyan-500"
                        />
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Conservative</span>
                            <span>{Math.round(risk * 100)}% Equity</span>
                            <span>Aggressive</span>
                        </div>
                    </div>

                    <button
                        onClick={runSimulation}
                        disabled={loading}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 transition-all"
                    >
                        {loading ? <RotateCcw className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                        Run 5,000 Simulations
                    </button>
                </div>

                {/* 2. Visualization */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <SimulationChart result={result} chartData={chartData} />
                </div>
            </div>
        </div>
    );
};

export default MonteCarloWarGame;
