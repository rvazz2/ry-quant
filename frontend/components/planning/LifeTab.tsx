"use client";

import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import {
    Home, Building, GraduationCap
} from 'lucide-react';

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

const Slider = ({
    label, value, min, max, step = 1, onChange, prefix = "", suffix = ""
}: {
    label: string,
    value: number,
    min: number,
    max: number,
    step?: number,
    onChange: (val: number) => void,
    prefix?: string,
    suffix?: string
}) => (
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

const RentVsBuy = React.memo(() => {
    const [homePrice, setHomePrice] = useState(400000);
    const [years, setYears] = useState(5);
    const [rent, setRent] = useState(2500);

    // Memoize heavy calculations and object creation
    const { decision, chartData } = React.useMemo(() => {
        const rentCost = rent * 12 * years;
        const mortgageRate = 0.065;
        const taxRate = 0.012;
        const maintRate = 0.01;
        const hoa = 3600; // Annual
        const closingCosts = homePrice * 0.06;

        const loan = homePrice * 0.8;
        const annualInterest = loan * mortgageRate;
        const annualTax = homePrice * taxRate;
        const annualMaint = homePrice * maintRate;

        const annualOwnerCost = annualInterest + annualTax + annualMaint + hoa;
        const totalOwnerCost = (annualOwnerCost * years) + closingCosts;
        const decision = totalOwnerCost < rentCost ? "BUY" : "RENT";

        const chartData = [
            { name: 'Renting', cost: rentCost, fill: '#f59e0b' },
            { name: 'Owning (Unrecoverable)', cost: totalOwnerCost, fill: '#06b6d4' },
        ];

        return { decision, chartData };
    }, [homePrice, years, rent]);

    return (
        <Card>
            <SectionHeader icon={Home} title="Rent vs. Buy Analyzer" subtitle="Focus on unrecoverable costs, not just monthly payment." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Slider label="Home Price" value={homePrice} min={200000} max={1000000} step={10000} onChange={setHomePrice} prefix="$" />
                    <Slider label="Monthly Rent Alternative" value={rent} min={1000} max={6000} step={100} onChange={setRent} prefix="$" />
                    <Slider label="Years You'll Stay" value={years} min={1} max={30} onChange={setYears} suffix=" years" />
                    <div className={`p-4 rounded-lg border flex items-center gap-4 ${decision === 'BUY' ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                        {decision === 'BUY' ? <Building size={32} className="text-cyan-400" /> : <Home size={32} className="text-amber-400" />}
                        <div>
                            <div className="font-bold text-white text-lg">Verdict: {decision}</div>
                            <div className="text-xs text-slate-300">Based on unrecoverable costs only.</div>
                        </div>
                    </div>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={chartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                            <Bar dataKey="cost" radius={[0, 4, 4, 0]} barSize={30}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
});

RentVsBuy.displayName = 'RentVsBuy';

// Pure calculation function moved outside
const calculatePayoff = (principal: number, annualRate: number, extra: number) => {
    const r = annualRate / 100 / 12;
    const nStandard = 120;
    const minPayment = (principal * r * Math.pow(1 + r, nStandard)) / (Math.pow(1 + r, nStandard) - 1);
    const actualPayment = minPayment + extra;
    const nActual = -Math.log(1 - (r * principal) / actualPayment) / Math.log(1 + r);
    const totalInterest = (actualPayment * nActual) - principal;
    const yearsSaved = (120 - nActual) / 12;
    return { years: nActual / 12, interest: totalInterest, payment: actualPayment, yearsSaved };
};

const StudentLoanCrusher = React.memo(() => {
    const [loanAmount, setLoanAmount] = useState(30000);
    const [rate, setRate] = useState(6.5);
    const [extraPayment, setExtraPayment] = useState(0);

    // Derived state (fast enough to not need memo, but good practice if it grows)
    const standard = calculatePayoff(loanAmount, rate, 0);
    const accelerated = calculatePayoff(loanAmount, rate, extraPayment);

    return (
        <Card className="border-l-4 border-l-red-500">
            <SectionHeader icon={GraduationCap} title="Student Loan Crusher" subtitle="See how fast you can be free." />
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Slider label="Loan Balance" value={loanAmount} min={5000} max={200000} step={1000} onChange={setLoanAmount} prefix="$" />
                    <Slider label="Rate %" value={rate} min={2} max={15} step={0.1} onChange={setRate} suffix="%" />
                    <Slider label="Extra Payment" value={extraPayment} min={0} max={2000} step={50} onChange={setExtraPayment} prefix="$" />
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center flex justify-around">
                    <div>
                        <div className="text-slate-500 text-xs mb-1">Debt Free In</div>
                        <div className={`text-2xl font-bold ${extraPayment > 0 ? 'text-green-400' : 'text-slate-200'}`}>
                            {accelerated.years.toFixed(1)} <span className="text-sm text-slate-500">years</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-slate-500 text-xs mb-1">Interest Saved</div>
                        <div className="text-2xl font-bold text-green-400">${(standard.interest - accelerated.interest).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </div>
                </div>
            </div>
        </Card>
    );
});

StudentLoanCrusher.displayName = 'StudentLoanCrusher';

export default function LifeTab() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RentVsBuy />
                <StudentLoanCrusher />
            </div>
        </div>
    );
}
