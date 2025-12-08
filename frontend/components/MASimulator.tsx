"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';

const MASimulator = () => {
    // Default: Microsoft (MSFT) buys Netflix (NFLX) scenario
    const [inputs, setInputs] = useState({
        acquirer_price: 400,
        acquirer_eps: 11.0,
        acquirer_shares: 7400, // Millions
        target_price: 600,
        target_eps: 15.0,
        target_shares: 430, // Millions
        offer_premium: 20, // %
        cash_percent: 50, // %
        synergies: 2000, // $ Millions
        interest_rate: 0.05
    });

    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const calculate = async () => {
        setLoading(true);
        try {
            const offer_price = inputs.target_price * (1 + inputs.offer_premium / 100);

            const res = await api.post('/mergers/calculate', {
                ...inputs,
                offer_price
            });
            setResult(res.data);
        } catch (error) {
            console.error("Error calculating merger", error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-calculate on input change (debounced in a real app, but here direct for responsiveness)
    useEffect(() => {
        const timer = setTimeout(calculate, 500);
        return () => clearTimeout(timer);
    }, [inputs]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    return (
        <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <span className="text-purple-400">🤝</span> M&A Simulator
                </h3>
                <div className="text-xs text-slate-500">Accretion / Dilution Model</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inputs Column */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Acquirer */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Acquirer (Buyer)</h4>
                            <div>
                                <label className="text-xs text-slate-400">Share Price ($)</label>
                                <input type="number" name="acquirer_price" value={inputs.acquirer_price} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">EPS ($)</label>
                                <input type="number" name="acquirer_eps" value={inputs.acquirer_eps} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Shares (M)</label>
                                <input type="number" name="acquirer_shares" value={inputs.acquirer_shares} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm" />
                            </div>
                        </div>

                        {/* Target */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-rose-400 uppercase tracking-wider">Target (Seller)</h4>
                            <div>
                                <label className="text-xs text-slate-400">Share Price ($)</label>
                                <input type="number" name="target_price" value={inputs.target_price} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">EPS ($)</label>
                                <input type="number" name="target_eps" value={inputs.target_eps} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Shares (M)</label>
                                <input type="number" name="target_shares" value={inputs.target_shares} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Deal Structure Sliders */}
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                        <h4 className="text-sm font-bold text-slate-300">Deal Structure</h4>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Offer Premium</span>
                                <span className="text-white font-bold">{inputs.offer_premium}%</span>
                            </div>
                            <input type="range" name="offer_premium" min="0" max="100" value={inputs.offer_premium} onChange={handleChange} className="w-full accent-purple-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Cash vs. Stock ({inputs.cash_percent}% Cash)</span>
                            </div>
                            <input type="range" name="cash_percent" min="0" max="100" value={inputs.cash_percent} onChange={handleChange} className="w-full accent-blue-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Synergies ($M)</span>
                                <span className="text-emerald-400 font-bold">${inputs.synergies}M</span>
                            </div>
                            <input type="range" name="synergies" min="0" max="10000" step="100" value={inputs.synergies} onChange={handleChange} className="w-full accent-emerald-500" />
                        </div>
                    </div>
                </div>

                {/* Results Column */}
                <div className="bg-slate-900/50 rounded-lg p-6 flex flex-col justify-center items-center text-center border border-slate-800 relative overflow-hidden">
                    {loading && <div className="absolute inset-0 bg-slate-900/80 z-10 flex items-center justify-center"><RefreshCw className="animate-spin text-purple-500" /></div>}

                    {result && (
                        <>
                            <div className="mb-6">
                                <h4 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Deal Impact</h4>
                                <div className={`text-4xl font-black ${result.is_accretive ? 'text-emerald-400' : 'text-rose-400'} flex items-center justify-center gap-2`}>
                                    {result.is_accretive ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
                                    {result.accretion_dilution_percent.toFixed(1)}%
                                </div>
                                <div className={`text-sm font-bold mt-1 ${result.is_accretive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {result.is_accretive ? 'ACCRETIVE' : 'DILUTIVE'}
                                </div>
                            </div>

                            <div className="w-full space-y-3 text-sm">
                                <div className="flex justify-between border-b border-slate-800 pb-2">
                                    <span className="text-slate-500">Pro Forma EPS</span>
                                    <span className="text-white font-mono">${result.pro_forma_eps.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-2">
                                    <span className="text-slate-500">Deal Value</span>
                                    <span className="text-white font-mono">${(result.deal_value / 1000).toFixed(1)}B</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-2">
                                    <span className="text-slate-500">New Shares Issued</span>
                                    <span className="text-white font-mono">{result.new_shares_issued.toFixed(1)}M</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MASimulator;
