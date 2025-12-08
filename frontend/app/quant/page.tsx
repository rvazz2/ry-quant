"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/DashboardLayout';
import { Brain, Sigma, Activity, TestTube, TrendingUp } from 'lucide-react';

const VolSurface = dynamic(() => import('@/components/quant/VolSurface'), {
    loading: () => <div className="h-96 w-full bg-slate-900/50 animate-pulse rounded-xl border border-slate-800" />,
    ssr: false
});
const PairsTrading = dynamic(() => import('@/components/quant/PairsTrading'), {
    loading: () => <div className="h-96 w-full bg-slate-900/50 animate-pulse rounded-xl border border-slate-800" />,
    ssr: false
});
const EfficientFrontier = dynamic(() => import('@/components/quant/EfficientFrontier'), {
    loading: () => <div className="h-96 w-full bg-slate-900/50 animate-pulse rounded-xl border border-slate-800" />,
    ssr: false
});
const Backtester = dynamic(() => import('@/components/Backtester'), {
    loading: () => <div className="h-96 w-full bg-slate-900/50 animate-pulse rounded-xl border border-slate-800" />,
    ssr: false
});

export default function QuantPage() {
    const [ticker, setTicker] = useState("SPY");

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
                <header>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center gap-3">
                        <Brain className="text-cyan-400" />
                        The Quant Suite
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">
                        Advanced derivatives modeling, portfolio optimization, and algorithmic backtesting.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 1. MPT Optimization (Efficient Frontier) */}
                    <div className="col-span-1 lg:col-span-1">
                        <EfficientFrontier />
                    </div>

                    {/* 2. Statistical Arbitrage Scanner */}
                    <div className="col-span-1 lg:col-span-1">
                        <PairsTrading />
                    </div>

                    {/* 3. The Greeks 4D Visualizer (Full Width) */}
                    <div className="col-span-1 lg:col-span-2">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                                    <Sigma className="text-purple-400" />
                                    Greeks 3D Lab
                                </h2>
                                <p className="text-slate-400 text-sm">Real-time Black-Scholes Volatility Surface.</p>
                            </div>
                            <div className="flex bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                                <input
                                    type="text"
                                    value={ticker}
                                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                                    className="bg-transparent text-white px-3 py-1 outline-none w-24 text-center font-bold"
                                />
                            </div>
                        </div>

                        <VolSurface ticker={ticker} />

                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase font-bold">X-Axis</div>
                                <div className="text-slate-200 font-mono">Strike Price ($)</div>
                            </div>
                            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase font-bold">Y-Axis</div>
                                <div className="text-slate-200 font-mono">Time to Expiration (T)</div>
                            </div>
                            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase font-bold">Z-Axis</div>
                                <div className="text-slate-200 font-mono">Option Price (Premium)</div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Algorithmic Backtester (Full Width) */}
                    <div className="col-span-1 lg:col-span-2">
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                                <TestTube className="text-blue-400" />
                                Strategy Backtester
                            </h2>
                            <p className="text-slate-400 text-sm">Test your alpha against historical data.</p>
                        </div>
                        <Backtester />
                    </div>

                    {/* Placeholder for Monte Carlo (Link to Planning) */}
                    <div className="col-span-1 lg:col-span-2 glass-panel p-8 border-dashed border-2 border-slate-700 flex flex-row items-center justify-between text-left opacity-70 hover:opacity-100 transition-opacity">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Activity size={24} className="text-slate-400" />
                                <h3 className="text-xl font-bold text-slate-300">Monte Carlo War Game</h3>
                            </div>
                            <p className="text-slate-500">Run 5,000 simulations on your financial plan to stress-test your retirement.</p>
                        </div>
                        <a href="/planning" className="px-6 py-3 bg-slate-800 text-cyan-400 hover:text-cyan-300 rounded-lg font-bold border border-slate-700 hover:border-cyan-500 transition-all flex-shrink-0">
                            Go to Planning Lab &rarr;
                        </a>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

