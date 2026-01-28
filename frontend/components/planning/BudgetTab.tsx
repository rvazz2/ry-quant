"use client";

import React, { useState } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    Wallet, Coffee, Home, Building, GraduationCap, CreditCard, TrendingUp, AlertCircle
} from 'lucide-react';

// --- Shared Components ---
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

// --- Sub-Features ---

const BudgetCalculator = React.memo(({ salary, setSalary }: { salary: number, setSalary: (val: number) => void }) => {
    const monthly = salary / 12;
    // 50/30/20 Rule
    const needs = monthly * 0.50;
    const wants = monthly * 0.30;
    const savings = monthly * 0.20;

    const data = React.useMemo(() => [
        { name: 'Needs (50%)', value: needs, color: '#f59e0b' },
        { name: 'Wants (30%)', value: wants, color: '#06b6d4' },
        { name: 'Savings (20%)', value: savings, color: '#22c55e' },
    ], [needs, wants, savings]);

    return (
        <Card>
            <SectionHeader icon={Wallet} title="The 50/30/20 Rule" subtitle="The golden ratio for financial stability." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <Slider
                        label="Expected Annual Salary"
                        value={salary}
                        min={30000}
                        max={300000}
                        step={1000}
                        onChange={setSalary}
                        prefix="$"
                    />
                    <div className="mt-8 space-y-4">
                        <div className="bg-slate-800/50 p-4 rounded border border-slate-700 flex justify-between items-center">
                            <div><div className="text-emerald-400 font-bold">Monthly Take-Home (Est)</div><div className="text-xs text-slate-500">Approximate Net Pay</div></div>
                            <div className="text-xl font-bold text-white">~${(monthly * 0.75).toFixed(0)}</div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded border-l-4 border-l-amber-500">
                            <div><div className="text-amber-400 font-bold">Needs (50%)</div></div>
                            <div className="text-lg font-bold text-white">${needs.toFixed(0)}</div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded border-l-4 border-l-cyan-500">
                            <div><div className="text-cyan-400 font-bold">Wants (30%)</div></div>
                            <div className="text-lg font-bold text-white">${wants.toFixed(0)}</div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded border-l-4 border-l-emerald-500">
                            <div><div className="text-emerald-400 font-bold">Savings (20%)</div></div>
                            <div className="text-lg font-bold text-white">${savings.toFixed(0)}</div>
                        </div>
                    </div>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
});
BudgetCalculator.displayName = 'BudgetCalculator';

const LatteFactor = React.memo(() => {
    const [dailySpend, setDailySpend] = useState(6);
    const years = 40;
    const rate = 0.10;

    const fv = React.useMemo(() => {
        const annualContribution = dailySpend * 365;
        return annualContribution * ((Math.pow(1 + rate, years) - 1) / rate) * (1 + rate);
    }, [dailySpend]);

    return (
        <Card className="border-t-4 border-t-amber-500">
            <SectionHeader icon={Coffee} title="The Latte Factor" subtitle="Small habits, massive consequences." />
            <div className="space-y-6">
                <Slider label="Daily Unnecessary Spend" value={dailySpend} min={1} max={50} onChange={setDailySpend} prefix="$" />
                <div className="bg-slate-900 rounded-xl p-6 text-center border border-slate-800">
                    <div className="text-slate-400 mb-2">Opportunity Cost (40 Years)</div>
                    <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500 mb-2">
                        ${fv.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-sm text-slate-500">lost wealth</div>
                </div>
            </div>
        </Card>
    );
});
LatteFactor.displayName = 'LatteFactor';

const CreditCardSection = React.memo(() => {
    const [balance, setBalance] = useState(5000);
    const [apr, setApr] = useState(21.5);
    const [monthlyPayment, setMonthlyPayment] = useState(150);

    // Calculate payoff time and total interest
    const calculatePayoff = React.useMemo(() => {
        const monthlyRate = apr / 100 / 12;
        let currentBalance = balance;
        let months = 0;
        let totalInterest = 0;

        if (monthlyPayment <= currentBalance * monthlyRate) {
            return { months: Infinity, totalInterest: Infinity, totalPaid: Infinity };
        }

        while (currentBalance > 0 && months < 600) {
            const interestCharge = currentBalance * monthlyRate;
            const principalPayment = monthlyPayment - interestCharge;
            totalInterest += interestCharge;
            currentBalance -= principalPayment;
            months++;
        }

        return {
            months: Math.ceil(months),
            totalInterest,
            totalPaid: balance + totalInterest
        };
    }, [balance, apr, monthlyPayment]);

    const ficoRanges = [
        { range: '800-850', rating: 'Exceptional', color: '#22c55e', description: 'Elite credit, best rates available' },
        { range: '740-799', rating: 'Very Good', color: '#3b82f6', description: 'Well above average, great rates' },
        { range: '670-739', rating: 'Good', color: '#06b6d4', description: 'Near average, favorable rates' },
        { range: '580-669', rating: 'Fair', color: '#f59e0b', description: 'Below average, higher rates' },
        { range: '300-579', rating: 'Poor', color: '#ef4444', description: 'Well below average, limited options' },
    ];

    const aprData = [
        { type: 'Excellent (750+)', apr: 16.5 },
        { type: 'Good (700-749)', apr: 20.5 },
        { type: 'Fair (650-699)', apr: 24.5 },
        { type: 'Poor (<650)', apr: 28.5 },
    ];

    return (
        <div className="space-y-6">
            {/* Main Header Card */}
            <Card className="border-t-4 border-t-purple-500">
                <SectionHeader
                    icon={CreditCard}
                    title="Understanding Credit Cards"
                    subtitle="Master the plastic before it masters you."
                />

                <div className="space-y-6">
                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 p-5 rounded-lg border border-purple-500/30">
                            <div className="text-purple-400 text-sm font-semibold mb-1">Average APR (2024)</div>
                            <div className="text-3xl font-bold text-white">21.47%</div>
                            <div className="text-xs text-slate-400 mt-1">National average credit card rate</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-5 rounded-lg border border-blue-500/30">
                            <div className="text-blue-400 text-sm font-semibold mb-1">Average Balance</div>
                            <div className="text-3xl font-bold text-white">$6,501</div>
                            <div className="text-xs text-slate-400 mt-1">Per U.S. cardholder</div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 p-5 rounded-lg border border-emerald-500/30">
                            <div className="text-emerald-400 text-sm font-semibold mb-1">Total U.S. Debt</div>
                            <div className="text-3xl font-bold text-white">$1.13T</div>
                            <div className="text-xs text-slate-400 mt-1">Credit card debt nationwide</div>
                        </div>
                    </div>

                    {/* What is FICO */}
                    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            <TrendingUp className="text-cyan-400" size={20} />
                            What is a FICO Score?
                        </h3>
                        <p className="text-slate-300 text-sm mb-4">
                            Your <strong className="text-cyan-400">FICO score</strong> is a three-digit number (300-850) that represents your creditworthiness.
                            Lenders use it to determine whether to approve you for credit and what interest rate you&apos;ll pay.
                            It&apos;s calculated from five factors: <strong>payment history (35%)</strong>, <strong>amounts owed (30%)</strong>,
                            <strong>length of credit history (15%)</strong>, <strong>new credit (10%)</strong>, and <strong>credit mix (10%)</strong>.
                        </p>

                        <div className="space-y-3">
                            {ficoRanges.map((range, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-24 text-sm font-mono text-slate-300">{range.range}</div>
                                    <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-300"
                                            style={{
                                                width: `${((850 - parseInt(range.range.split('-')[0])) / 550) * 100}%`,
                                                backgroundColor: range.color
                                            }}
                                        ></div>
                                    </div>
                                    <div className="w-32 text-sm">
                                        <div className="font-bold text-white">{range.rating}</div>
                                    </div>
                                    <div className="hidden lg:block w-64 text-xs text-slate-400">{range.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* APR by Credit Score Chart */}
                    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-4">Average APR by Credit Score</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={aprData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="type" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} label={{ value: 'APR (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                        formatter={(value: any) => `${value}%`}
                                    />
                                    <Bar dataKey="apr" fill="#a855f7" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-slate-400 mt-3 text-center">
                            A higher credit score can save you thousands in interest charges over the life of your debt.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Debt Payoff Calculator */}
            <Card className="border-l-4 border-l-red-500">
                <SectionHeader
                    icon={AlertCircle}
                    title="Credit Card Debt Payoff Calculator"
                    subtitle="See the true cost of carrying a balance."
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <Slider
                            label="Current Balance"
                            value={balance}
                            min={500}
                            max={50000}
                            step={100}
                            onChange={setBalance}
                            prefix="$"
                        />
                        <Slider
                            label="Annual Percentage Rate (APR)"
                            value={apr}
                            min={10}
                            max={35}
                            step={0.5}
                            onChange={setApr}
                            suffix="%"
                        />
                        <Slider
                            label="Monthly Payment"
                            value={monthlyPayment}
                            min={50}
                            max={5000}
                            step={10}
                            onChange={setMonthlyPayment}
                            prefix="$"
                        />
                    </div>

                    <div className="space-y-4">
                        {calculatePayoff.months === Infinity ? (
                            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 text-center">
                                <AlertCircle className="mx-auto text-red-400 mb-3" size={48} />
                                <div className="text-red-400 font-bold text-lg">⚠️ Never Paid Off</div>
                                <div className="text-sm text-slate-300 mt-2">
                                    Your payment doesn&apos;t cover the interest! Increase monthly payment.
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                                    <div className="text-slate-400 text-sm mb-2">Time to Payoff</div>
                                    <div className="text-4xl font-bold text-cyan-400">
                                        {Math.floor(calculatePayoff.months / 12)} yrs {calculatePayoff.months % 12} mos
                                    </div>
                                </div>
                                <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                                    <div className="text-slate-400 text-sm mb-2">Total Interest Paid</div>
                                    <div className="text-4xl font-bold text-red-400">
                                        ${calculatePayoff.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                </div>
                                <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                                    <div className="text-slate-400 text-sm mb-2">Total Amount Paid</div>
                                    <div className="text-4xl font-bold text-white">
                                        ${calculatePayoff.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Card>

            {/* Types of Credit Cards */}
            <Card>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="text-purple-400" size={24} />
                    Types of Credit Cards
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div className="font-bold text-cyan-400 mb-2">💳 Rewards Cards</div>
                        <p className="text-sm text-slate-300">Earn cashback, points, or miles on purchases. Best for responsible users who pay off balances monthly. Typical APR: 16-24%.</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div className="font-bold text-blue-400 mb-2">🔄 Balance Transfer Cards</div>
                        <p className="text-sm text-slate-300">Offer 0% intro APR (12-21 months) to consolidate debt. Watch for 3-5% transfer fees. Great for debt payoff strategy.</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div className="font-bold text-emerald-400 mb-2">🔰 Secured Cards</div>
                        <p className="text-sm text-slate-300">Require security deposit. Perfect for building/rebuilding credit. Lower limits, higher APRs (20-27%).</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div className="font-bold text-purple-400 mb-2">🎓 Student Cards</div>
                        <p className="text-sm text-slate-300">Designed for students with limited credit history. Lower limits, moderate APRs (18-25%), often with rewards.</p>
                    </div>
                </div>
            </Card>

            {/* Best Practices */}
            <Card className="bg-gradient-to-br from-slate-800/80 to-cyan-900/20 border border-cyan-500/30">
                <h3 className="text-xl font-bold text-white mb-4">💡 Credit Card Best Practices</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-3">
                        <div className="text-emerald-400 font-bold text-xl">✓</div>
                        <div>
                            <div className="font-bold text-white">Pay in Full Every Month</div>
                            <div className="text-slate-300">Avoid interest charges entirely. This is the golden rule.</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="text-emerald-400 font-bold text-xl">✓</div>
                        <div>
                            <div className="font-bold text-white">Keep Utilization Under 30%</div>
                            <div className="text-slate-300">Use less than 30% of your credit limit to maintain good scores.</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="text-emerald-400 font-bold text-xl">✓</div>
                        <div>
                            <div className="font-bold text-white">Never Miss a Payment</div>
                            <div className="text-slate-300">Payment history is 35% of your FICO score. Set up autopay.</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="text-emerald-400 font-bold text-xl">✓</div>
                        <div>
                            <div className="font-bold text-white">Read the Fine Print</div>
                            <div className="text-slate-300">Know your APR, fees, grace period, and reward program details.</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="text-red-400 font-bold text-xl">✗</div>
                        <div>
                            <div className="font-bold text-white">Don&apos;t Cash Advance</div>
                            <div className="text-slate-300">Cash advances have higher APRs (25-30%) and no grace period.</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="text-red-400 font-bold text-xl">✗</div>
                        <div>
                            <div className="font-bold text-white">Don&apos;t Apply Too Often</div>
                            <div className="text-slate-300">Multiple hard inquiries can temporarily lower your credit score.</div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Debt Payoff Strategies */}
            <Card>
                <h3 className="text-xl font-bold text-white mb-4">🎯 Debt Payoff Strategies</h3>
                <div className="space-y-4">
                    <div className="bg-slate-800/50 p-5 rounded-lg border-l-4 border-l-amber-500">
                        <div className="font-bold text-amber-400 text-lg mb-2">🔥 Avalanche Method</div>
                        <p className="text-slate-300 text-sm mb-2">
                            Pay minimums on all cards, then put extra money toward the <strong>highest APR</strong> card first.
                            Mathematically optimal - saves the most interest.
                        </p>
                        <div className="text-xs text-slate-400">Best for: Maximizing savings, mathematically inclined individuals</div>
                    </div>
                    <div className="bg-slate-800/50 p-5 rounded-lg border-l-4 border-l-cyan-500">
                        <div className="font-bold text-cyan-400 text-lg mb-2">❄️ Snowball Method</div>
                        <p className="text-slate-300 text-sm mb-2">
                            Pay minimums on all cards, then put extra money toward the <strong>smallest balance</strong> first.
                            Psychological wins - build momentum with quick victories.
                        </p>
                        <div className="text-xs text-slate-400">Best for: Staying motivated, building confidence</div>
                    </div>
                    <div className="bg-slate-800/50 p-5 rounded-lg border-l-4 border-l-purple-500">
                        <div className="font-bold text-purple-400 text-lg mb-2">🔄 Balance Transfer Method</div>
                        <p className="text-slate-300 text-sm mb-2">
                            Transfer high-interest debt to a 0% intro APR card. Pay aggressively during the promo period (usually 12-21 months).
                            Watch for 3-5% transfer fees.
                        </p>
                        <div className="text-xs text-slate-400">Best for: Good credit scores (670+), disciplined repayment</div>
                    </div>
                </div>
            </Card>
        </div>
    );
});
CreditCardSection.displayName = 'CreditCardSection';

export default function BudgetTab({ salary, setSalary }: { salary: number, setSalary: (v: number) => void }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <BudgetCalculator salary={salary} setSalary={setSalary} />
                </div>
                <div className="lg:col-span-1">
                    <LatteFactor />
                </div>
            </div>

            {/* Credit Cards Section */}
            <CreditCardSection />
        </div>
    );
}
