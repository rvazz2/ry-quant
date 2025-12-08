"use client";

import React, { useState } from 'react';
import { calculateOptionPrice } from '@/lib/api';
import { BookOpen } from 'lucide-react';
import AnalysisCard from './AnalysisCard';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const PayoffChart = React.memo(({ data }: { data: any[] }) => (
    <div className="h-64 bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h4 className="text-slate-200 font-bold mb-2">Profit/Loss at Expiration</h4>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="price" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Stock Price', position: 'bottom', fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} formatter={(val: number) => `$${val.toFixed(2)}`} />
                <ReferenceLine y={0} stroke="#94a3b8" />
                <Line type="monotone" dataKey="call_pl" name="Call P/L" stroke="#6ee7b7" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="put_pl" name="Put P/L" stroke="#fda4af" dot={false} strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
    </div>
));
PayoffChart.displayName = 'PayoffChart';

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
            <h4 className="text-slate-200 font-bold mb-2">Strategy Insight</h4>
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
    const [result, setResult] = useState<any>(null);

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

    return (
        <div className="glass-panel p-6 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-slate-100 mb-6">Black-Scholes Calculator</h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Stock Price (S)', name: 'S', step: '1' },
                            { label: 'Strike Price (K)', name: 'K', step: '1' },
                            { label: 'Time (Years) (T)', name: 'T', step: '0.1' },
                            { label: 'Risk-free Rate (r)', name: 'r', step: '0.01' },
                            { label: 'Implied Volatility (σ)', name: 'sigma', step: '0.01' }
                        ].map((field) => (
                            <div key={field.name}>
                                <label className="block text-xs text-slate-500 mb-1">{field.label}</label>
                                <input
                                    type="number"
                                    name={field.name}
                                    value={inputs[field.name as keyof typeof inputs]}
                                    onChange={handleChange}
                                    step={field.step}
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 focus:border-cyan-500 outline-none"
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleCalculate}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3 rounded font-bold shadow-lg shadow-cyan-500/20 transition-all"
                    >
                        Calculate Price
                    </button>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {result ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 text-center">
                                    <div className="text-sm text-slate-400 mb-1">Call Option Price</div>
                                    <div className="text-4xl font-extrabold text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                                        ${result.call_price.toFixed(2)}
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 text-center">
                                    <div className="text-sm text-slate-400 mb-1">Put Option Price</div>
                                    <div className="text-4xl font-extrabold text-rose-300 drop-shadow-[0_0_15px_rgba(251,113,133,0.3)]">
                                        ${result.put_price.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* Greeks Grid */}
                            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                                <h4 className="text-slate-200 font-bold mb-3 border-b border-slate-700 pb-2">Option Greeks</h4>
                                <div className="grid grid-cols-5 gap-2 text-center text-sm">
                                    <div>
                                        <div className="text-slate-500 text-xs uppercase">Delta</div>
                                        <div className="text-cyan-300 font-mono font-bold">{result.greeks.delta.call.toFixed(3)}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500 text-xs uppercase">Gamma</div>
                                        <div className="text-purple-300 font-mono font-bold">{result.greeks.gamma.toFixed(3)}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500 text-xs uppercase">Theta</div>
                                        <div className="text-yellow-300 font-mono font-bold">{result.greeks.theta.call.toFixed(3)}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500 text-xs uppercase">Vega</div>
                                        <div className="text-blue-300 font-mono font-bold">{result.greeks.vega.toFixed(3)}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500 text-xs uppercase">Rho</div>
                                        <div className="text-pink-300 font-mono font-bold">{result.greeks.rho.call.toFixed(3)}</div>
                                    </div>
                                </div>
                            </div>

                            <PayoffChart data={result.payoff} />
                            <DeepDiveSection result={result} inputs={inputs} />
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-600 border border-dashed border-slate-800 rounded-xl">
                            Enter parameters to calculate option prices.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OptionCalculator;
