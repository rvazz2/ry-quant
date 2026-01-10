"use client";

import React, { useState } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    Wallet, Coffee, Home, Building, GraduationCap
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
        </div>
    );
}
