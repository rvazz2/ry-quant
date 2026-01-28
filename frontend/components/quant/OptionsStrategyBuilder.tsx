"use client";

import React, { useState } from 'react';
import { Coins, TrendingUp, AlertTriangle, Info } from 'lucide-react';

interface Strategy {
    id: string;
    name: string;
    legs: {
        type: 'call' | 'put';
        action: 'buy' | 'sell';
        strike: number;
        quantity: number;
    }[];
    description: string;
}

const PRESET_STRATEGIES: Strategy[] = [
    {
        id: 'bull-call-spread',
        name: 'Bull Call Spread',
        description: 'Moderately bullish strategy with limited risk and reward',
        legs: [
            { type: 'call', action: 'buy', strike: 100, quantity: 1 },
            { type: 'call', action: 'sell', strike: 110, quantity: 1 }
        ]
    },
    {
        id: 'iron-condor',
        name: 'Iron Condor',
        description: 'Neutral strategy profiting from low volatility',
        legs: [
            { type: 'put', action: 'buy', strike: 90, quantity: 1 },
            { type: 'put', action: 'sell', strike: 95, quantity: 1 },
            { type: 'call', action: 'sell', strike: 105, quantity: 1 },
            { type: 'call', action: 'buy', strike: 110, quantity: 1 }
        ]
    },
    {
        id: 'long-straddle',
        name: 'Long Straddle',
        description: 'Benefits from significant price movement in either direction',
        legs: [
            { type: 'call', action: 'buy', strike: 100, quantity: 1 },
            { type: 'put', action: 'buy', strike: 100, quantity: 1 }
        ]
    },
    {
        id: 'protective-put',
        name: 'Protective Put',
        description: 'Downside protection for long stock position',
        legs: [
            { type: 'put', action: 'buy', strike: 95, quantity: 1 }
        ]
    }
];

export default function OptionsStrategyBuilder() {
    const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
    const [spotPrice, setSpotPrice] = useState(100);

    const calculatePL = (price: number) => {
        if (!selectedStrategy) return 0;

        let pl = 0;
        selectedStrategy.legs.forEach(leg => {
            const intrinsic = leg.type === 'call'
                ? Math.max(0, price - leg.strike)
                : Math.max(0, leg.strike - price);

            const legPL = leg.action === 'buy' ? intrinsic - 5 : 5 - intrinsic; // Simplified (assuming $5 premium)
            pl += legPL * leg.quantity;
        });

        return pl;
    };

    //  Generate P/L chart data
    const getPLChartPoints = () => {
        const points = [];
        const start = spotPrice - 30;
        const end = spotPrice + 30;
        const step = 2;

        for (let price = start; price <= end; price += step) {
            points.push({
                x: price,
                y: calculatePL(price)
            });
        }
        return points;
    };

    const chartPoints = selectedStrategy ? getPLChartPoints() : [];
    const maxPL = Math.max(...chartPoints.map(p => p.y), 0);
    const minPL = Math.min(...chartPoints.map(p => p.y), 0);
    const range = maxPL - minPL || 100;

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Coins className="text-purple-400" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-100">Options Strategy Builder</h2>
                    <p className="text-slate-400 text-sm">Build and visualize multi-leg option strategies</p>
                </div>
            </div>

            {/* Strategy Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {PRESET_STRATEGIES.map(strategy => (
                    <button
                        key={strategy.id}
                        onClick={() => setSelectedStrategy(strategy)}
                        className={`p-4 rounded-lg border transition-all text-left ${selectedStrategy?.id === strategy.id
                                ? 'bg-purple-500/20 border-purple-500 text-white'
                                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-purple-500/50 hover:bg-slate-800'
                            }`}
                    >
                        <div className="font-bold text-sm mb-1">{strategy.name}</div>
                        <div className="text-xs text-slate-400">{strategy.legs.length} leg{strategy.legs.length > 1 ? 's' : ''}</div>
                    </button>
                ))}
            </div>

            {selectedStrategy ? (
                <>
                    {/* Strategy Info */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <Info size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-white font-bold mb-1">{selectedStrategy.name}</h3>
                            <p className="text-slate-300 text-sm">{selectedStrategy.description}</p>
                        </div>
                    </div>

                    {/* Legs Table */}
                    <div className="mb-6 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-3">Type</th>
                                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-3">Action</th>
                                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-3">Strike</th>
                                    <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider pb-3">Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedStrategy.legs.map((leg, i) => (
                                    <tr key={i} className="border-b border-slate-800/50">
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${leg.type === 'call' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                                }`}>
                                                {leg.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-3 text-slate-300 font-medium capitalize">{leg.action}</td>
                                        <td className="py-3 text-white font-mono">${leg.strike}</td>
                                        <td className="py-3 text-slate-300">{leg.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* P/L Diagram */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-slate-200">Profit/Loss Diagram</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">Spot Price:</span>
                                <input
                                    type="number"
                                    value={spotPrice}
                                    onChange={(e) => setSpotPrice(Number(e.target.value))}
                                    className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm font-mono"
                                />
                            </div>
                        </div>

                        <div className="relative h-64 bg-slate-900 rounded-lg border border-slate-700 p-4">
                            <svg width="100%" height="100%" className="overflow-visible">
                                {/* Zero line */}
                                <line
                                    x1="0"
                                    x2="100%"
                                    y1="50%"
                                    y2="50%"
                                    stroke="#475569"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />

                                {/* Spot price indicator */}
                                <line
                                    x1="50%"
                                    x2="50%"
                                    y1="0"
                                    y2="100%"
                                    stroke="#06b6d4"
                                    strokeWidth="2"
                                    strokeDasharray="4 4"
                                    opacity="0.5"
                                />

                                {/* P/L line */}
                                <polyline
                                    points={chartPoints.map((p, i) => {
                                        const x = (i / (chartPoints.length - 1)) * 100;
                                        const y = 50 - ((p.y - minPL) / range * 80 - 40);
                                        return `${x}%,${y}%`;
                                    }).join(' ')}
                                    fill="none"
                                    stroke="#a855f7"
                                    strokeWidth="3"
                                    strokeLinejoin="round"
                                />
                            </svg>

                            {/* Labels */}
                            <div className="absolute bottom-2 left-2 text-xs text-slate-500">
                                Stock Price →
                            </div>
                            <div className="absolute top-2 left-2 text-xs text-emerald-400 font-bold">
                                +${maxPL.toFixed(2)}
                            </div>
                            <div className="absolute bottom-2 left-2 text-xs text-rose-400 font-bold">
                                ${minPL.toFixed(2)}
                            </div>
                        </div>

                        {/* Risk/Reward Summary */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                                <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">Max Profit</div>
                                <div className="text-2xl font-black text-emerald-400 tabular-nums">+${maxPL.toFixed(2)}</div>
                            </div>
                            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
                                <div className="text-xs text-rose-400 font-bold uppercase tracking-wider mb-1">Max Loss</div>
                                <div className="text-2xl font-black text-rose-400 tabular-nums">${minPL.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-12">
                    <AlertTriangle size={48} className="text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Select a strategy above to view its P/L diagram</p>
                </div>
            )}
        </div>
    );
}
