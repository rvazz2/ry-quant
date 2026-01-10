"use client";

import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import {
    Briefcase, PiggyBank, Flame, TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react';
import MonteCarloWarGame from './MonteCarloWarGame';

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`glass-panel p-6 md:p-8 ${className}`}>{children}</div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
    <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
            <Icon className="text-cyan-400" size={24} />
            {title}
        </h2>
        {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
    </div>
);

const Slider = ({ label, value, min, max, step = 1, onChange, prefix = "", suffix = "" }: any) => (
    <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-300">{label}</span>
            <span className="font-bold text-cyan-400">{prefix}{value.toLocaleString()}{suffix}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-cyan-500"
        />
    </div>
);

// --- Features ---

const MatchVisualizer = React.memo(({ salary }: { salary: number }) => {
    const [contributionPercent, setContributionPercent] = useState(3);
    const [matchLimit, setMatchLimit] = useState(3); // Employer matches up to 3%

    const myContribution = salary * (contributionPercent / 100);
    const employerContribution = salary * (Math.min(contributionPercent, matchLimit) / 100);
    const totalInvested = myContribution + employerContribution;

    // Warning if leaving money on table
    const missedMatch = contributionPercent < matchLimit;

    const data = [
        { name: 'Your Money', amount: myContribution, fill: '#3b82f6' },
        { name: 'FREE MONEY', amount: employerContribution, fill: '#10b981' },
    ];

    return (
        <Card>
            <SectionHeader icon={Briefcase} title="The 401(k) Match" subtitle="Do not leave free money on the table." />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Slider label="Your Contribution %" value={contributionPercent} min={0} max={15} onChange={setContributionPercent} suffix="%" />
                    <Slider label="Employer Match Limit %" value={matchLimit} min={0} max={10} onChange={setMatchLimit} suffix="%" />

                    {missedMatch ? (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
                            <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                            <div>
                                <div className="font-bold text-amber-500">WARNING</div>
                                <div className="text-sm text-slate-300">
                                    You are contributing {contributionPercent}%, but your boss matches up to {matchLimit}%.
                                    You are literally throwing away ${(salary * ((matchLimit - contributionPercent) / 100)).toFixed(0)}/year.
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-3">
                            <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                            <div>
                                <div className="font-bold text-emerald-500">MAXIMIZED</div>
                                <div className="text-sm text-slate-300">
                                    You are capturing the full employer match. That's a 100% immediate ROI on your first {matchLimit}%.
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                    <div className="text-center mb-4">
                        <div className="text-slate-500 text-xs uppercase tracking-widest">Total Annual Investment</div>
                        <div className="text-3xl font-black text-white">${totalInvested.toLocaleString()}</div>
                    </div>
                    <div className="h-40 w-full relative">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={[
                                { name: 'Total', user: myContribution, match: employerContribution }
                            ]} layout="vertical" barSize={30}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" hide width={10} />
                                <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                                <Legend />
                                <Bar dataKey="user" name="You Put In" stackId="a" fill="#3b82f6" radius={[4, 0, 0, 4]} />
                                <Bar dataKey="match" name="Boss Puts In (Free)" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </Card>
    );
});
MatchVisualizer.displayName = 'MatchVisualizer';

const RothVsTrad = React.memo(() => {
    // Assumptions: 30 years growth, 7% return
    // Tax Rates: Current Low (12%), Future High (25%)
    const principal = 6500; // IRA Limit approx
    const years = 30;
    const rate = 0.07;
    const currentTax = 0.12;
    const futureTax = 0.25;

    // Helper to calc growth
    const calcGrowth = (initial: number, r: number, y: number) => initial * Math.pow(1 + r, y);

    // Roth: Pay tax NOW, grow tax free
    const rothStart = principal * (1 - currentTax);
    const rothEnd = calcGrowth(rothStart, rate, years); // No tax at end

    // Traditional: Grow full amount, pay tax LATER
    const tradStart = principal; // Deductible now
    const tradEndRaw = calcGrowth(tradStart, rate, years);
    const tradEnd = tradEndRaw * (1 - futureTax); // Pay tax at end

    const diff = rothEnd - tradEnd;

    // Chart Data Generation
    const chartData = [];
    for (let i = 0; i <= years; i += 5) {
        chartData.push({
            year: `Year ${i}`,
            Roth: calcGrowth(rothStart, rate, i),
            Traditional: calcGrowth(tradStart, rate, i) * (1 - futureTax) // Net value if withdrawn
        });
    }

    return (
        <Card>
            <SectionHeader icon={PiggyBank} title="Roth vs. Traditional IRA" subtitle="The battle of 'Tax Now' vs 'Tax Later'." />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div className="text-purple-400 font-bold mb-1">Roth IRA (Winner)</div>
                    <div className="text-2xl font-bold text-white">${rothEnd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className="text-xs text-slate-500 mt-1">Net value after 30 years</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div className="text-blue-400 font-bold mb-1">Traditional IRA</div>
                    <div className="text-2xl font-bold text-white">${tradEnd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className="text-xs text-slate-500 mt-1">Net value after 30 years</div>
                </div>
                <div className="flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-slate-400 text-xs">Advantage</div>
                        <div className="text-3xl font-black text-emerald-400">+${diff.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <div className="text-xs text-emerald-500/70">by choosing Roth</div>
                    </div>
                </div>
            </div>

            <div className="h-64 mt-4 w-full relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRoth" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorTrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `$${val / 1000}k`} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} formatter={(val: number) => `$${val.toFixed(0)}`} />
                        <Legend />
                        <Area type="monotone" dataKey="Roth" stroke="#a855f7" fillOpacity={1} fill="url(#colorRoth)" strokeWidth={3} />
                        <Area type="monotone" dataKey="Traditional" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTrad)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <h4 className="text-purple-400 font-bold flex items-center gap-2 mb-2"><Flame size={16} /> Why Roth Wins for Students</h4>
                <p className="text-sm text-slate-300">
                    Right now, you are likely in the lowest tax bracket of your life (10-12%). It is cheap to pay taxes now.
                    In 30 years, you will likely be in a higher bracket. Locking in a 0% tax rate on all future growth is mathematically superior.
                </p>
            </div>
        </Card>
    );
});
RothVsTrad.displayName = 'RothVsTrad';

const FireCalculator = React.memo(({ salary }: { salary: number }) => {
    // Simple FI Calc: (Annual Spend * 25) = Target.
    // Years to goal = ln((Accumulation + c/r) / (Target + c/r)) / ln(1+r) ... simplistic
    // Easier: N = ln(1 + (Target * r) / AnnualSave) / ln(1+r) assuming 0 start

    // Inputs
    const [savingsRate, setSavingsRate] = useState(20); // %
    const [annualReturn, setAnnualReturn] = useState(8); // %
    const [currentAge, setCurrentAge] = useState(25);

    const annualSave = salary * (savingsRate / 100);
    const annualSpend = salary - annualSave; // Assuming spend is the rest (ignoring tax to keep simple)
    const targetPortfolio = annualSpend * 25; // 4% rule

    // Calculation: FV of annuity. Solve for n.
    // Target = AnnualSave * ((1+r)^n - 1) / r
    // Target * r / AnnualSave = (1+r)^n - 1
    // (Target * r / AnnualSave) + 1 = (1+r)^n
    // n = log((Target * r / AnnualSave) + 1) / log(1+r)

    const r = annualReturn / 100;
    const numerator = Math.log(((targetPortfolio * r) / annualSave) + 1);
    const denominator = Math.log(1 + r);
    const yearsToFi = numerator / denominator;

    const fiAge = currentAge + yearsToFi;

    return (
        <Card className="border-t-4 border-t-emerald-500">
            <SectionHeader icon={Flame} title="FIRE Calculator" subtitle="Financial Independence, Retire Early." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                    <Slider label="Savings Rate" value={savingsRate} min={5} max={80} onChange={setSavingsRate} suffix="%" />
                    <Slider label="Current Age" value={currentAge} min={18} max={60} onChange={setCurrentAge} />
                    <div className="text-sm text-slate-400">
                        Based on ${salary.toLocaleString()} salary and ${annualSpend.toLocaleString()} annual spending.
                    </div>
                </div>

                <div className="text-center">
                    <div className="text-slate-500 uppercase text-xs tracking-widest mb-4">You will be free at age</div>
                    <div className="relative inline-block">
                        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            {Number.isFinite(fiAge) ? fiAge.toFixed(0) : "Never"}
                        </div>
                        {Number.isFinite(fiAge) && (
                            <div className="absolute -right-12 top-0 bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700">
                                {(fiAge.toFixed(0) as any) - 65 < 0 ? `${65 - (fiAge.toFixed(0) as any)} yrs early!` : 'Standard'}
                            </div>
                        )}
                    </div>
                    <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800 inline-block">
                        <span className="text-slate-400 text-sm">Target Portfolio: </span>
                        <span className="text-white font-bold text-lg">${(targetPortfolio / 1000000).toFixed(2)}M</span>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000" style={{ width: `${Math.min(savingsRate, 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>Spend Everything</span>
                    <span>The "Sweet Spot" (20-30%)</span>
                    <span>Monk Mode (50%+)</span>
                </div>
            </div>
        </Card>
    );
});
FireCalculator.displayName = 'FireCalculator';

export default function RetirementTab({ salary }: { salary: number }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MatchVisualizer salary={salary} />

            <section>
                <MonteCarloWarGame />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FireCalculator salary={salary} />
                <RothVsTrad />
            </div>
        </div>
    );
}
