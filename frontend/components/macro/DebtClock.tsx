"use client";

import React, { useEffect, useState } from 'react';
import { DollarSign, User, TrendingUp, AlertTriangle, LucideIcon } from 'lucide-react';

const Card = ({ label, value, subtext, color = "red", icon: Icon }: { label: string, value: string, subtext?: string, color?: "red" | "green" | "white", icon: LucideIcon }) => (
    <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5 relative overflow-hidden group">
        <div className={`absolute top-0 left-0 w-1 h-full ${color === 'red' ? 'bg-red-500' : color === 'green' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</h3>
            <Icon className={`w-5 h-5 ${color === 'red' ? 'text-red-500' : color === 'green' ? 'text-emerald-500' : 'text-slate-400'}`} />
        </div>
        <div className={`text-2xl md:text-3xl font-mono font-bold tabular-nums tracking-tight ${color === 'red' ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : color === 'green' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-slate-100'}`}>
            {value}
        </div>
        {subtext && <p className="text-xs text-slate-500 mt-2 font-medium">{subtext}</p>}
    </div>
);

export default function DebtClock() {
    // Initial estimates for typical 2026 values (Projections)
    // US Debt: ~$37 Trillion
    // Revenue: ~$5.2 Trillion
    // Spending: ~$7.1 Trillion

    // Growth rates per second (Annual / 31536000)
    // Debt growth: ~$2T / year -> ~$63,419 per second
    // Revenue growth (flow): ~$5.2T / year -> ~$164,890 per second (rate of collection)
    // Spending rate: ~$7.1T / year -> ~$225,140 per second

    const [stats, setStats] = useState({
        nationalDebt: 37_105_420_000_000,
        spending: 7_120_500_000_000,
        revenue: 5_250_100_000_000,
        debtPerCitizen: 109520,
        debtPerTaxpayer: 284100
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                nationalDebt: prev.nationalDebt + 2100, // ~$70k/sec / 30fps = ~2300 per tick (actually running at 50ms)
                // Let's assume 10 updates per second for smoothness
                spending: prev.spending + 7500,
                revenue: prev.revenue + 5200,
                debtPerCitizen: prev.debtPerCitizen + 0.006,
                debtPerTaxpayer: prev.debtPerTaxpayer + 0.015
            }));
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const formatMoney = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <div className="p-2 bg-red-900/20 rounded-lg border border-red-500/20">
                    <AlertTriangle className="text-red-500" size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-100">U.S. National Debt Clock <span className="text-xs font-normal text-slate-500 ml-2">(Real-time Estimate)</span></h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card
                    label="US National Debt"
                    value={formatMoney(stats.nationalDebt)}
                    subtext="The total debt owed by the federal government."
                    color="red"
                    icon={TrendingUp}
                />

                <Card
                    label="Debt Per Citizen"
                    value={formatMoney(stats.debtPerCitizen)}
                    subtext="Your share of the national debt."
                    color="white"
                    icon={User}
                />

                <Card
                    label="Debt Per Taxpayer"
                    value={formatMoney(stats.debtPerTaxpayer)}
                    subtext="Share per actual taxpayer."
                    color="white"
                    icon={User}
                />

                <Card
                    label="Federal Spending (YTD)"
                    value={formatMoney(stats.spending)}
                    subtext="Rate: ~$225k per second."
                    color="red"
                    icon={DollarSign}
                />

                <Card
                    label="Federal Revenue (YTD)"
                    value={formatMoney(stats.revenue)}
                    subtext="Rate: ~$165k per second."
                    color="green"
                    icon={DollarSign}
                />

                <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-5 flex items-center justify-center text-center">
                    <div>
                        <div className="text-4xl font-black text-slate-800 mb-2">FAIL</div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">Fiscal Grade</p>
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-slate-600 mt-4 text-center uppercase tracking-widest">
                * Simulated real-time growth based on CBO projections. NOT investment advice.
            </p>
        </div>
    );
}
