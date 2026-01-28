"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { calculateOptionPrice } from '@/lib/api';
import { BookOpen, TrendingUp, TrendingDown, Zap, AlertCircle, Info, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import AnalysisCard from './AnalysisCard';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Area, AreaChart } from 'recharts';

// Strategy Definitions
const STRATEGIES = {
    'long_call': { name: 'Long Call', legs: [{ type: 'call', position: 'long', qty: 1, strikeOffset: 0 }] },
    'long_put': { name: 'Long Put', legs: [{ type: 'put', position: 'long', qty: 1, strikeOffset: 0 }] },
    'short_call': { name: 'Short Call (⚠️ Risky)', legs: [{ type: 'call', position: 'short', qty: 1, strikeOffset: 0 }] },
    'short_put': { name: 'Short Put (⚠️ Risky)', legs: [{ type: 'put', position: 'short', qty: 1, strikeOffset: 0 }] },
    'bull_call_spread': { name: 'Bull Call Spread', legs: [{ type: 'call', position: 'long', qty: 1, strikeOffset: 0 }, { type: 'call', position: 'short', qty: 1, strikeOffset: 5 }] },
    'bear_put_spread': { name: 'Bear Put Spread', legs: [{ type: 'put', position: 'long', qty: 1, strikeOffset: 5 }, { type: 'put', position: 'short', qty: 1, strikeOffset: 0 }] },
    'iron_condor': { name: 'Iron Condor', legs: [{ type: 'put', position: 'long', qty: 1, strikeOffset: -10 }, { type: 'put', position: 'short', qty: 1, strikeOffset: -5 }, { type: 'call', position: 'short', qty: 1, strikeOffset: 5 }, { type: 'call', position: 'long', qty: 1, strikeOffset: 10 }] },
    'straddle': { name: 'Long Straddle', legs: [{ type: 'call', position: 'long', qty: 1, strikeOffset: 0 }, { type: 'put', position: 'long', qty: 1, strikeOffset: 0 }] },
    'strangle': { name: 'Long Strangle', legs: [{ type: 'call', position: 'long', qty: 1, strikeOffset: 5 }, { type: 'put', position: 'long', qty: 1, strikeOffset: -5 }] },
    'butterfly': { name: 'Butterfly Spread', legs: [{ type: 'call', position: 'long', qty: 1, strikeOffset: -5 }, { type: 'call', position: 'short', qty: 2, strikeOffset: 0 }, { type: 'call', position: 'long', qty: 1, strikeOffset: 5 }] },
};

const PayoffChart = React.memo(({ data, breakeven, maxProfit, maxLoss, strategy }: { data: any[], breakeven: number[], maxProfit: number, maxLoss: number, strategy: string }) => (
    <div className="h-80 bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex justify-between items-start mb-2">
            <div>
                <h4 className="text-slate-200 font-bold">Profit/Loss at Expiration</h4>
                <p className="text-xs text-slate-500">Strategy: {STRATEGIES[strategy as keyof typeof STRATEGIES]?.name || 'Custom'}</p>
            </div>
            <div className="text-right text-xs space-y-1">
                <div><span className="text-slate-500">Max Profit:</span> <span className="text-green-400 font-bold">${maxProfit.toFixed(2)}</span></div>
                <div><span className="text-slate-500">Max Loss:</span> <span className="text-red-400 font-bold">${Math.abs(maxLoss).toFixed(2)}</span></div>
                <div><span className="text-slate-500">Breakeven:</span> <span className="text-cyan-400 font-mono">{breakeven.map(b => `$${b.toFixed(2)}`).join(', ')}</span></div>
            </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="lossGradient" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="price" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Stock Price', position: 'bottom', fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(val: number) => [`$${val.toFixed(2)}`, 'P/L']}
                    labelFormatter={(label) => `Stock Price: $${label}`}
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                {breakeven.map((be, i) => (
                    <ReferenceLine key={i} x={be} stroke="#06b6d4" strokeDasharray="5 5" label={{ value: 'BE', fill: '#06b6d4', fontSize: 10 }} />
                ))}
                <Area type="monotone" dataKey="total_pl" stroke="#06b6d4" strokeWidth={3} fill="url(#profitGradient)" />
            </AreaChart>
        </ResponsiveContainer>
    </div>
));
PayoffChart.displayName = 'PayoffChart';

const ProbabilitySection = React.memo(({ result, inputs }: { result: any, inputs: any }) => {
    const itmProb = (result.greeks.delta.call * 100);
    const expectedMove = inputs.S * inputs.sigma * Math.sqrt(inputs.T);

    return (
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-6 rounded-xl border border-purple-500/30">
            <h4 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Probability Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-400 mb-1">ITM Probability</div>
                    <div className="text-2xl font-bold text-cyan-400">{itmProb.toFixed(1)}%</div>
                    <div className="text-xs text-slate-500 mt-1">Based on Delta</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-400 mb-1">Expected Move (1σ)</div>
                    <div className="text-2xl font-bold text-purple-400">±${expectedMove.toFixed(2)}</div>
                    <div className="text-xs text-slate-500 mt-1">{(inputs.sigma * 100).toFixed(0)}% IV</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <div className="text-xs text-slate-400 mb-1">Price Range (68%)</div>
                    <div className="text-lg font-bold text-blue-400">
                        ${(inputs.S - expectedMove).toFixed(2)} - ${(inputs.S + expectedMove).toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">1 Standard Deviation</div>
                </div>
            </div>
        </div>
    );
});
ProbabilitySection.displayName = 'ProbabilitySection';

const DeepDiveSection = React.memo(({ result, inputs }: { result: any, inputs: any }) => (
    <div className="space-y-6 border-t border-slate-800 pt-6">
        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen size={20} className="text-cyan-400" />
            Deep Dive Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnalysisCard
                title="Delta (Probability & Hedge)"
                value={result.greeks.delta.call.toFixed(3)}
                color="text-cyan-400"
                desc="Delta measures how much the option price moves for every $1 move in the stock."
                insight={`A Delta of ${result.greeks.delta.call.toFixed(2)} means if the stock goes up $1, your Call option gains $${result.greeks.delta.call.toFixed(2)}. It also roughly implies a ${(result.greeks.delta.call * 100).toFixed(0)}% chance of expiring In-The-Money.`}
            />
            <AnalysisCard
                title="Theta (Time Decay)"
                value={result.greeks.theta.call.toFixed(3)}
                color="text-yellow-400"
                desc="Theta measures how much value the option loses every single day due to time passing."
                insight={`You are losing $${Math.abs(result.greeks.theta.call).toFixed(2)} per day just by holding this position. Time is the enemy of the option buyer.`}
            />
            <AnalysisCard
                title="Gamma (Acceleration)"
                value={result.greeks.gamma.toFixed(3)}
                color="text-purple-400"
                desc="Gamma measures how fast Delta changes. It's the 'acceleration' of your position."
                insight={`High Gamma means your P/L will swing violently. As you get closer to expiration, Gamma risk explodes.`}
            />
            <AnalysisCard
                title="Vega (Volatility Risk)"
                value={result.greeks.vega.toFixed(3)}
                color="text-blue-400"
                desc="Vega measures sensitivity to changes in Implied Volatility (IV)."
                insight={`If volatility increases by 1%, this option gains $${result.greeks.vega.toFixed(2)} in value. Long options love rising volatility.`}
            />
        </div>

        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-800">
            <h4 className="text-slate-200 font-bold mb-2 flex items-center gap-2">
                <Info size={16} className="text-cyan-400" />
                Strategy Insight
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">
                Based on these parameters, this is a <span className="text-white font-bold">Long Volatility</span> trade.
                You need the stock to move significantly (up or down) to overcome the daily time decay (Theta) of <span className="text-rose-300">${Math.abs(result.greeks.theta.call).toFixed(2)}</span>.
                Your breakeven price at expiration is <span className="text-emerald-300 font-bold">${(inputs.K + result.call_price).toFixed(2)}</span> for the Call.
            </p>
        </div>
    </div>
));
DeepDiveSection.displayName = 'DeepDiveSection';

const OptionCalculator = () => {
    const [inputs, setInputs] = useState({
        S: 100, // Stock Price
        K: 100, // Strike Price
        T: 1,   // Time to Maturity (Years)
        r: 0.05,// Risk-free Rate
        sigma: 0.2 // Volatility
    });
    const [strategy, setStrategy] = useState('long_call');
    const [result, setResult] = useState<any>(null);
    const [autoCalculate, setAutoCalculate] = useState(true);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs({ ...inputs, [e.target.name]: parseFloat(e.target.value) });
    };

    const handleCalculate = async () => {
        try {
            const res = await calculateOptionPrice(inputs.S, inputs.K, inputs.T, inputs.r, inputs.sigma);
            setResult(res);
        } catch (error) {
            console.error("Error calculating option price", error);
        }
    };

    // Auto-calculate on input change
    useEffect(() => {
        if (autoCalculate) {
            const timer = setTimeout(() => {
                handleCalculate();
            }, 300); // Debounce
            return () => clearTimeout(timer);
        }
    }, [inputs, autoCalculate]);

    // Initial calculation
    useEffect(() => {
        handleCalculate();
    }, []);

    // Calculate strategy P/L
    const strategyData = useMemo(() => {
        if (!result) return null;

        const selectedStrategy = STRATEGIES[strategy as keyof typeof STRATEGIES];
        if (!selectedStrategy) return null;

        const priceRange = [];
        const minPrice = inputs.S * 0.7;
        const maxPrice = inputs.S * 1.3;
        const step = (maxPrice - minPrice) / 100;

        for (let price = minPrice; price <= maxPrice; price += step) {
            let totalPL = 0;

            selectedStrategy.legs.forEach(leg => {
                const strike = inputs.K + (leg.strikeOffset || 0);
                const optionPrice = leg.type === 'call' ? result.call_price : result.put_price;
                const multiplier = leg.position === 'long' ? 1 : -1;
                const qty = leg.qty || 1;

                let intrinsic = 0;
                if (leg.type === 'call') {
                    intrinsic = Math.max(0, price - strike);
                } else {
                    intrinsic = Math.max(0, strike - price);
                }

                const pl = multiplier * qty * (intrinsic - optionPrice);
                totalPL += pl;
            });

            priceRange.push({
                price: price,
                total_pl: totalPL
            });
        }

        // Calculate breakeven points
        const breakevenPoints: number[] = [];
        for (let i = 1; i < priceRange.length; i++) {
            if ((priceRange[i - 1].total_pl < 0 && priceRange[i].total_pl >= 0) ||
                (priceRange[i - 1].total_pl >= 0 && priceRange[i].total_pl < 0)) {
                breakevenPoints.push(priceRange[i].price);
            }
        }

        const maxProfit = Math.max(...priceRange.map(p => p.total_pl));
        const maxLoss = Math.min(...priceRange.map(p => p.total_pl));

        return { data: priceRange, breakeven: breakevenPoints, maxProfit, maxLoss };
    }, [result, strategy, inputs]);

    return (
        <div className="glass-panel p-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-slate-100">Options Strategy Lab</h3>
                    <p className="text-slate-400 text-sm mt-1">Advanced Black-Scholes calculator with multi-strategy analysis</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                    <Zap size={14} className={autoCalculate ? "text-yellow-400" : "text-slate-600"} />
                    <span className="text-xs text-slate-400">Auto-calc</span>
                    <button
                        onClick={() => setAutoCalculate(!autoCalculate)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${autoCalculate ? 'bg-cyan-600' : 'bg-slate-600'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${autoCalculate ? 'right-0.5' : 'left-0.5'}`}></div>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Inputs */}
                <div className="space-y-4">
                    {/* Strategy Selector */}
                    <div>
                        <label className="block text-xs text-slate-500 mb-2 uppercase font-bold">Strategy</label>
                        <select
                            value={strategy}
                            onChange={(e) => setStrategy(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-white focus:border-cyan-500 outline-none"
                        >
                            {Object.entries(STRATEGIES).map(([key, strat]) => (
                                <option key={key} value={key}>{strat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="border-t border-slate-800 pt-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-slate-500 uppercase font-bold">Parameters</label>
                            <button
                                onClick={() => setInputs({ S: 100, K: 100, T: 1, r: 0.05, sigma: 0.2 })}
                                className="text-xs text-cyan-400 hover:text-cyan-300"
                            >
                                Reset
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Stock Price (S)', name: 'S', step: '1', icon: '$' },
                                { label: 'Strike Price (K)', name: 'K', step: '1', icon: '$' },
                                { label: 'Time (Years) (T)', name: 'T', step: '0.1', icon: '📅' },
                                { label: 'Risk-free Rate (r)', name: 'r', step: '0.01', icon: '%' },
                                { label: 'Implied Volatility (σ)', name: 'sigma', step: '0.01', icon: '📊' }
                            ].map((field) => (
                                <div key={field.name}>
                                    <label className="block text-xs text-slate-500 mb-1">{field.label}</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name={field.name}
                                            value={inputs[field.name as keyof typeof inputs]}
                                            onChange={handleChange}
                                            step={field.step}
                                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none pr-8"
                                        />
                                        <span className="absolute right-2 top-2 text-slate-600 text-xs">{field.icon}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {!autoCalculate && (
                        <button
                            onClick={handleCalculate}
                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3 rounded font-bold shadow-lg shadow-cyan-500/20 transition-all"
                        >
                            Calculate Prices
                        </button>
                    )}

                    {/* Quick Presets */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <h4 className="text-xs text-slate-400 uppercase font-bold mb-2">Quick Presets</h4>
                        <div className="space-y-2">
                            {[
                                { name: 'ATM (30 days)', values: { S: 100, K: 100, T: 0.08, r: 0.05, sigma: 0.25 } },
                                { name: 'OTM Lottery', values: { S: 100, K: 110, T: 0.02, r: 0.05, sigma: 0.50 } },
                                { name: 'LEAPS', values: { S: 100, K: 95, T: 2, r: 0.05, sigma: 0.30 } }
                            ].map((preset, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInputs(preset.values)}
                                    className="w-full text-left text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded border border-slate-700 transition-colors"
                                >
                                    {preset.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Results */}
                <div className="lg:col-span-2 space-y-6">
                    {result ? (
                        <>
                            {/* Option Prices */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-gradient-to-br from-emerald-900/30 to-green-900/20 rounded-xl border border-emerald-700/50 text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 text-6xl opacity-5">📈</div>
                                    <div className="text-sm text-emerald-400 mb-1 flex items-center justify-center gap-1">
                                        <TrendingUp size={14} />
                                        Call Option Price
                                    </div>
                                    <div className="text-4xl font-extrabold text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                                        ${result.call_price.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-emerald-500/70 mt-1">Premium per contract</div>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-rose-900/30 to-red-900/20 rounded-xl border border-rose-700/50 text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 text-6xl opacity-5">📉</div>
                                    <div className="text-sm text-rose-400 mb-1 flex items-center justify-center gap-1">
                                        <TrendingDown size={14} />
                                        Put Option Price
                                    </div>
                                    <div className="text-4xl font-extrabold text-rose-300 drop-shadow-[0_0_15px_rgba(251,113,133,0.3)]">
                                        ${result.put_price.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-rose-500/70 mt-1">Premium per contract</div>
                                </div>
                            </div>

                            {/* Greeks Grid */}
                            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                                <h4 className="text-slate-200 font-bold mb-3 border-b border-slate-700 pb-2 flex items-center gap-2">
                                    <PieChartIcon size={16} className="text-purple-400" />
                                    Option Greeks (Call)
                                </h4>
                                <div className="grid grid-cols-5 gap-3 text-center text-sm">
                                    {[
                                        { name: 'Delta', value: result.greeks.delta.call, color: 'cyan', desc: 'Price sensitivity' },
                                        { name: 'Gamma', value: result.greeks.gamma, color: 'purple', desc: 'Delta change rate' },
                                        { name: 'Theta', value: result.greeks.theta.call, color: 'yellow', desc: 'Time decay/day' },
                                        { name: 'Vega', value: result.greeks.vega, color: 'blue', desc: 'IV sensitivity' },
                                        { name: 'Rho', value: result.greeks.rho.call, color: 'pink', desc: 'Rate sensitivity' }
                                    ].map((greek) => (
                                        <div key={greek.name} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors group">
                                            <div className="text-slate-500 text-xs uppercase mb-1">{greek.name}</div>
                                            <div className={`text-${greek.color}-300 font-mono font-bold text-lg`}>{greek.value.toFixed(3)}</div>
                                            <div className="text-slate-600 text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{greek.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Strategy P/L Chart */}
                            {strategyData && (
                                <PayoffChart
                                    data={strategyData.data}
                                    breakeven={strategyData.breakeven}
                                    maxProfit={strategyData.maxProfit}
                                    maxLoss={strategyData.maxLoss}
                                    strategy={strategy}
                                />
                            )}

                            {/* Probability Analysis */}
                            <ProbabilitySection result={result} inputs={inputs} />

                            {/* Deep Dive */}
                            <DeepDiveSection result={result} inputs={inputs} />
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-600 border border-dashed border-slate-800 rounded-xl min-h-[400px]">
                            <div className="text-center">
                                <AlertCircle size={48} className="mx-auto mb-3 text-slate-700" />
                                <p>Adjust parameters to calculate option prices.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OptionCalculator;
