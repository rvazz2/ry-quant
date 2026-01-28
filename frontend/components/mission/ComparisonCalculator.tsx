"use client";

import React, { useState } from 'react';
import { Calculator, TrendingUp, Calendar } from 'lucide-react';

export default function ComparisonCalculator() {
    const [monthlyInvestment, setMonthlyInvestment] = useState(200);
    const [startAge, setStartAge] = useState(22);
    const retirementAge = 65;
    const annualReturn = 0.08;

    const calculateFutureValue = (monthly: number, years: number) => {
        const monthlyRate = annualReturn / 12;
        const months = years * 12;
        return monthly * (((1 + monthlyRate) ** months - 1) / monthlyRate);
    };

    const yearsInvesting = retirementAge - startAge;
    const futureValue = calculateFutureValue(monthlyInvestment, yearsInvesting);
    const totalContributed = monthlyInvestment * yearsInvesting * 12;
    const gains = futureValue - totalContributed;

    // Compare with starting 10 years later
    const lateStartValue = startAge < 55 ? calculateFutureValue(monthlyInvestment, Math.max(0, retirementAge - (startAge + 10))) : 0;
    const costOfWaiting = futureValue - lateStartValue;

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 md:p-12 border border-white/10 relative overflow-hidden mb-24">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                        <Calculator className="text-cyan-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Compound Interest Calculator</h2>
                        <p className="text-slate-400 text-sm mt-1">See the power of starting early</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Input Controls */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                                <DollarSign className="text-cyan-400" size={16} />
                                Monthly Investment
                            </label>
                            <input
                                type="range"
                                min="50"
                                max="1000"
                                step="50"
                                value={monthlyInvestment}
                                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                            <div className="text-3xl font-black text-white mt-3 tabular-nums">
                                ${monthlyInvestment.toLocaleString()}/month
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                                <Calendar className="text-cyan-400" size={16} />
                                Starting Age
                            </label>
                            <input
                                type="range"
                                min="18"
                                max="40"
                                value={startAge}
                                onChange={(e) => setStartAge(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                            <div className="text-3xl font-black text-white mt-3 tabular-nums">
                                Age {startAge}
                            </div>
                        </div>

                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <p className="text-xs text-blue-300">
                                <strong>Assumptions:</strong> 8% annual return (S&P 500 historic average), retirement at 65
                            </p>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="space-y-4">
                        <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="text-emerald-400" size={20} />
                                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">By Age 65</h3>
                            </div>
                            <div className="text-5xl font-black text-white mb-2 tabular-nums">
                                ${Math.floor(futureValue).toLocaleString()}
                            </div>
                            <p className="text-slate-400 text-sm">
                                You invested: ${totalContributed.toLocaleString()}
                            </p>
                            <p className="text-emerald-400 text-sm font-bold">
                                You gained: ${Math.floor(gains).toLocaleString()}
                            </p>
                        </div>

                        {costOfWaiting > 0 && (
                            <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                                <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-2">Cost of Waiting 10 Years</h3>
                                <div className="text-4xl font-black text-rose-400 tabular-nums">
                                    -${Math.floor(costOfWaiting).toLocaleString()}
                                </div>
                                <p className="text-slate-400 text-sm mt-2">
                                    Starting at {startAge + 10} instead of {startAge}
                                </p>
                            </div>
                        )}

                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <p className="text-sm text-amber-200">
                                <strong>💡 Pro Tip:</strong> Time in the market beats timing the market. Start small, start now.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DollarSign({ size, className }: { size: number; className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
    );
}
