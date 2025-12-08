"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { TrendingUp, RefreshCw, Info } from 'lucide-react';

interface PortfolioPoint {
    volatility: number;
    return: number;
    sharpe: number;
    weights: number[]; // Simulation weights
    id: number;
}

const EfficientFrontier = () => {
    const [portfolios, setPortfolios] = useState<PortfolioPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState<PortfolioPoint | null>(null);

    // Simulation Parameters
    const ASSETS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
    const NUM_SIMULATIONS = 500;

    const runSimulation = () => {
        setLoading(true);
        // Simulate async calculation
        setTimeout(() => {
            const newPortfolios: PortfolioPoint[] = [];

            for (let i = 0; i < NUM_SIMULATIONS; i++) {
                // Random weights
                let weights = ASSETS.map(() => Math.random());
                const sum = weights.reduce((a, b) => a + b, 0);
                weights = weights.map(w => w / sum); // Normalize

                // Mock calculations based on simplified assumptions
                // Return = weighted sum of asset returns (randomized around varied means)
                // Volatility = simplified interaction (less than sum of parts due to diversification)

                const expReturns = [0.12, 0.15, 0.10, 0.08, 0.25]; // Annualized returns
                const vols = [0.18, 0.22, 0.15, 0.20, 0.45]; // Annualized vols

                let portReturn = 0;
                let portVol = 0; // Simplified vol calculation

                weights.forEach((w, idx) => {
                    portReturn += w * expReturns[idx];
                    // Very rough approximation for vol to create the curve shape
                    // In reality, would use covariance matrix
                    portVol += (w * vols[idx]) * (1 - 0.3); // 0.3 correlation benefit factor
                });

                // Add some non-linear diversification benefit
                portVol = portVol * (0.8 + Math.random() * 0.1);

                // Ensure curve shape (higher return usually requires higher risk)
                // Adjust points to look like a bullet
                const randomNoise = (Math.random() - 0.5) * 0.02;
                if (portVol < 0.1) portVol = 0.1;

                newPortfolios.push({
                    id: i,
                    volatility: portVol,
                    return: portReturn + randomNoise,
                    sharpe: (portReturn - 0.04) / portVol, // Assuming 4% risk-free
                    weights
                });
            }

            setPortfolios(newPortfolios);
            setLoading(false);
        }, 800);
    };

    useEffect(() => {
        runSimulation();
    }, []);

    // Find Max Sharpe Portfolio
    const maxSharpe = useMemo(() => {
        if (!portfolios.length) return null;
        return portfolios.reduce((prev, current) => (prev.sharpe > current.sharpe) ? prev : current);
    }, [portfolios]);

    return (
        <div className="glass-panel p-6 space-y-6 relative overflow-hidden group">
            {/* Header */}
            <div className="flex justify-between items-start z-10 relative">
                <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <TrendingUp className="text-emerald-400" />
                        Efficient Frontier
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Modern Portfolio Theory (MPT) Optimization.
                    </p>
                </div>
                <button
                    onClick={runSimulation}
                    disabled={loading}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg transition-all"
                    title="Re-run Monte Carlo"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Chart Area */}
            <div className="h-[400px] w-full bg-slate-900/50 rounded-xl border border-slate-800 p-2 relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-20 backdrop-blur-sm rounded-xl">
                        <div className="text-emerald-400 font-mono animate-pulse">OPTIMIZING PORTFOLIOS...</div>
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                        <XAxis
                            type="number"
                            dataKey="volatility"
                            name="Risk (Vol)"
                            unit="σ"
                            stroke="#64748b"
                            fontSize={12}
                            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                            domain={['dataMin - 0.02', 'dataMax + 0.02']}
                        />
                        <YAxis
                            type="number"
                            dataKey="return"
                            name="Return"
                            unit=""
                            stroke="#64748b"
                            fontSize={12}
                            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                            domain={['dataMin - 0.02', 'dataMax + 0.02']}
                        />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl text-xs">
                                            <div className="font-bold text-emerald-400 mb-1">Portfolio #{data.id}</div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                <span className="text-slate-400">Return:</span>
                                                <span className="text-white text-right">{(data.return * 100).toFixed(2)}%</span>
                                                <span className="text-slate-400">Risk (Vol):</span>
                                                <span className="text-white text-right">{(data.volatility * 100).toFixed(2)}%</span>
                                                <span className="text-slate-400">Sharpe:</span>
                                                <span className="text-amber-400 text-right">{data.sharpe.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Scatter name="Portfolios" data={portfolios} onClick={(p: any) => setSelectedPoint(p)}>
                            {portfolios.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry === maxSharpe ? '#f59e0b' : `rgba(52, 211, 153, ${0.3 + (entry.sharpe * 0.2)})`}
                                    stroke={entry === maxSharpe ? '#fff' : 'none'}
                                    strokeWidth={entry === maxSharpe ? 2 : 0}
                                />
                            ))}
                        </Scatter>
                        {maxSharpe && (
                            <ReferenceLine x={maxSharpe.volatility} stroke="#f59e0b" strokeDasharray="3 3" />
                        )}
                        {maxSharpe && (
                            <ReferenceLine y={maxSharpe.return} stroke="#f59e0b" strokeDasharray="3 3" />
                        )}
                    </ScatterChart>
                </ResponsiveContainer>

                {/* Max Sharpe Label */}
                {maxSharpe && !loading && (
                    <div className="absolute top-4 right-4 bg-slate-900/90 border border-amber-500/50 p-2 rounded text-xs backdrop-blur-md">
                        <div className="text-amber-500 font-bold mb-1 flex items-center gap-1">
                            <Info size={12} /> Max Sharpe Ratio
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 text-slate-300">
                            <span>Ret: {(maxSharpe.return * 100).toFixed(1)}%</span>
                            <span>Vol: {(maxSharpe.volatility * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Asset Allocation Weights */}
            <div className="grid grid-cols-5 gap-2 text-center">
                {ASSETS.map((asset, idx) => (
                    <div key={asset} className="bg-slate-900/50 p-2 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-bold">{asset}</div>
                        <div className="text-emerald-400 font-mono text-sm">
                            {((selectedPoint ? selectedPoint.weights[idx] : (maxSharpe?.weights[idx] || 0)) * 100).toFixed(0)}%
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center text-[10px] text-slate-600 mt-2">
                *Viewing {selectedPoint ? 'Selected' : 'Optimal'} Portfolio Allocation
            </div>
        </div>
    );
};

export default EfficientFrontier;
