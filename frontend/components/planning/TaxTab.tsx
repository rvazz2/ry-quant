"use client";

import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    Sankey
} from 'recharts';
import {
    Calculator, DollarSign, ArrowRight, TrendingUp, AlertCircle
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

// --- Features ---

const TaxWaterfall = ({ salary, filingStatus }: { salary: number, filingStatus: string }) => {
    // 2024 Tax Brackets (Simplified for Single)
    const brackets = [
        { rate: 0.10, limit: 11600 },
        { rate: 0.12, limit: 47150 },
        { rate: 0.22, limit: 100525 },
        { rate: 0.24, limit: 191950 },
        { rate: 0.32, limit: 243725 },
        { rate: 0.35, limit: 609350 },
        { rate: 0.37, limit: Infinity }
    ];

    let remainingIncome = salary;
    let totalTax = 0;
    const taxBuckets = [];

    let prevLimit = 0;

    for (const bracket of brackets) {
        const bucketSize = bracket.limit - prevLimit;
        const taxableInBucket = Math.min(remainingIncome, bucketSize);

        if (taxableInBucket > 0) {
            const taxInBucket = taxableInBucket * bracket.rate;
            totalTax += taxInBucket;

            taxBuckets.push({
                rate: `${bracket.rate * 100}%`,
                amount: taxableInBucket,
                tax: taxInBucket,
                fill: bracket.rate <= 0.12 ? '#10b981' : bracket.rate <= 0.24 ? '#f59e0b' : '#ef4444'
            });

            remainingIncome -= taxableInBucket;
        } else {
            break;
        }
        prevLimit = bracket.limit;
    }

    const effectiveRate = (totalTax / salary) * 100;
    const marginalRate = taxBuckets[taxBuckets.length - 1]?.rate || "0%";

    return (
        <Card>
            <SectionHeader icon={Calculator} title="Marginal vs. Effective Rate" subtitle="Why you don't actually pay 22% tax." />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
                    <div className="text-slate-500 text-xs uppercase mb-1">Total Tax Bill</div>
                    <div className="text-2xl font-bold text-white">${totalTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
                    <div className="text-slate-500 text-xs uppercase mb-1">Top Bracket (Marginal)</div>
                    <div className="text-2xl font-bold text-rose-400">{marginalRate}</div>
                    <div className="text-xs text-rose-500/50">Only paid on the last dollar</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center ring-2 ring-emerald-500/20">
                    <div className="text-slate-500 text-xs uppercase mb-1">Real Rate (Effective)</div>
                    <div className="text-3xl font-black text-emerald-400">{effectiveRate.toFixed(1)}%</div>
                    <div className="text-xs text-emerald-500/50">What you actually pay</div>
                </div>
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={taxBuckets} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="rate" tick={{ fill: '#94a3b8' }} label={{ value: 'Tax Bracket', position: 'bottom', fill: '#64748b' }} />
                        <YAxis tick={{ fill: '#94a3b8' }} tickFormatter={(val) => `$${val / 1000}k`} />
                        <RechartsTooltip
                            cursor={{ fill: 'transparent' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl">
                                            <p className="text-white font-bold">{payload[0].payload.rate} Bracket</p>
                                            <p className="text-slate-300 text-sm">Income in bucket: ${payload[0].payload.amount.toLocaleString()}</p>
                                            <p className="text-rose-400 text-sm">Tax paid: ${payload[0].payload.tax.toLocaleString()}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="amount" name="Income in Bracket" radius={[4, 4, 0, 0]}>
                            {taxBuckets.map((entry, index) => (
                                <Bar key={`cell-${index}`} dataKey="amount" fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="text-center text-slate-500 text-xs mt-4">
                *Comparison shows standard Single filer deduction applied implicitly or standard brackets.
            </div>
        </Card>
    );
};

const TooltipTrigger = ({ label, text }: { label: string, text: string }) => (
    <div className="group relative inline-flex items-center gap-1 cursor-help">
        <span className="text-slate-400 border-b border-dotted border-slate-600 group-hover:text-cyan-400 transition-colors">{label}</span>
        <div className="bg-slate-700/50 rounded-full w-4 h-4 flex items-center justify-center text-[10px] text-slate-300 border border-slate-600">?</div>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
        </div>
    </div>
);

const PaycheckSimulator = ({ salary }: { salary: number }) => {
    // Estimations
    const federalTax = salary * 0.14; // Approximate effective
    const stateTax = salary * 0.05; // Avg
    const fica = salary * 0.0765; // 6.2% SS + 1.45% Medicare
    const takeHome = salary - federalTax - stateTax - fica;

    // Monthly
    const mGross = salary / 12;
    const mNet = takeHome / 12;

    // Sankey Dimensions
    const width = 600;
    const height = 300;
    const padding = 20;

    // Nodes
    const xStart = 50;
    const xEnd = 450;
    const barWidth = 20;

    // Y Calcs
    const scale = (height - padding * 2) / salary;
    const hTotal = salary * scale;

    // End Nodes Heights
    const hFed = federalTax * scale;
    const hFica = fica * scale;
    const hState = stateTax * scale;
    const hNet = takeHome * scale;

    const gap = 15;
    let currentY = padding;

    const yFed = currentY;
    currentY += hFed + gap;

    const yFica = currentY;
    currentY += hFica + gap;

    const yState = currentY;
    currentY += hState + gap;

    const yNet = currentY;

    // Flow Path Helper
    const drawFlow = (y1: number, h1: number, y2: number, h2: number, color: string) => {
        return (
            <path
                d={`M ${xStart + barWidth} ${y1} C ${xStart + 150} ${y1}, ${xEnd - 150} ${y2}, ${xEnd} ${y2} L ${xEnd} ${y2 + h2} C ${xEnd - 150} ${y2 + h2}, ${xStart + 150} ${y1 + h1}, ${xStart + barWidth} ${y1 + h1} Z`}
                fill={color}
                opacity={0.5}
                className="hover:opacity-80 transition-opacity"
            />
        );
    };

    return (
        <Card>
            <SectionHeader icon={DollarSign} title="Paycheck Reality Check" subtitle="The flow of your hard-earned money." />

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                <div className="text-center">
                    <div className="text-slate-500 text-xs uppercase">Gross Monthly</div>
                    <div className="text-2xl font-bold text-slate-300 strike decoration-rose-500/50">${mGross.toFixed(0)}</div>
                </div>
                <ArrowRight className="text-slate-600 rotate-90 md:rotate-0" />
                <div className="text-center">
                    <div className="text-slate-500 text-xs uppercase">Taxes & FICA</div>
                    <div className="text-2xl font-bold text-rose-400">-${((mGross - mNet)).toFixed(0)}</div>
                </div>
                <ArrowRight className="text-slate-600 rotate-90 md:rotate-0" />
                <div className="text-center">
                    <div className="text-emerald-500 text-xs uppercase font-bold">Net Pay (Bank)</div>
                    <div className="text-4xl font-black text-emerald-400">${mNet.toFixed(0)}</div>
                </div>
            </div>

            <div className="relative w-full overflow-hidden">
                <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="font-sans text-xs">
                    {/* Source: Gross Salary */}
                    <rect x={xStart} y={padding} width={barWidth} height={hTotal} fill="#94a3b8" rx={4} />
                    <text x={xStart} y={padding - 10} fill="#94a3b8" fontWeight="bold">Gross Salary</text>

                    {/* Flows */}
                    {drawFlow(padding, hTotal * (federalTax / salary), yFed, hFed, "#f43f5e")}
                    {drawFlow(padding + hTotal * (federalTax / salary), hTotal * (fica / salary), yFica, hFica, "#f97316")}
                    {drawFlow(padding + hTotal * ((federalTax + fica) / salary), hTotal * (stateTax / salary), yState, hState, "#eab308")}
                    {drawFlow(padding + hTotal * ((federalTax + fica + stateTax) / salary), hTotal * (takeHome / salary), yNet, hNet, "#10b981")}

                    {/* Sinks */}
                    <rect x={xEnd} y={yFed} width={barWidth} height={hFed} fill="#f43f5e" rx={4} />
                    <text x={xEnd + 25} y={yFed + hFed / 2} fill="#f43f5e" dominantBaseline="middle">Federal Tax</text>
                    <text x={xEnd + 25} y={yFed + hFed / 2 + 12} fill="#64748b" fontSize={10}>${(federalTax).toLocaleString()}</text>

                    <rect x={xEnd} y={yFica} width={barWidth} height={hFica} fill="#f97316" rx={4} />
                    <text x={xEnd + 25} y={yFica + hFica / 2} fill="#f97316" dominantBaseline="middle">FICA</text>
                    <text x={xEnd + 25} y={yFica + hFica / 2 + 12} fill="#64748b" fontSize={10}>${(fica).toLocaleString()}</text>

                    <rect x={xEnd} y={yState} width={barWidth} height={hState} fill="#eab308" rx={4} />
                    <text x={xEnd + 25} y={yState + hState / 2} fill="#eab308" dominantBaseline="middle">State Tax</text>
                    <text x={xEnd + 25} y={yState + hState / 2 + 12} fill="#64748b" fontSize={10}>${(stateTax).toLocaleString()}</text>

                    <rect x={xEnd} y={yNet} width={barWidth} height={hNet} fill="#10b981" rx={4} />
                    <text x={xEnd + 25} y={yNet + hNet / 2} fill="#10b981" fontSize={14} fontWeight="bold" dominantBaseline="middle">Net Pay</text>
                    <text x={xEnd + 25} y={yNet + hNet / 2 + 15} fill="#64748b" fontSize={10}>${(takeHome).toLocaleString()}</text>
                </svg>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 justify-center">
                <TooltipTrigger label="Federal Tax" text="This funds the military, highways, and federal programs. It uses a progressive bracket system." />
                <TooltipTrigger label="FICA" text="Federal Insurance Contributions Act. Checks are split between Social Security (Retirement) and Medicare (Health for Seniors)." />
                <TooltipTrigger label="State Tax" text="Varies by state (0% in TX/FL, high in CA/NY). Funds schools, police, and local infrastructure." />
            </div>
        </Card>
    );
};

const CapitalGainsSandbox = () => {
    const [profit, setProfit] = useState(1000);
    const [income, setIncome] = useState(60000);

    // Rates
    const shortTermRate = 0.22; // Assumed marginal based on likely income
    const longTermRate = income < 47000 ? 0.0 : 0.15;

    const taxShort = profit * shortTermRate;
    const taxLong = profit * longTermRate;
    const savings = taxShort - taxLong;

    return (
        <Card className="border-t-4 border-t-cyan-500">
            <SectionHeader icon={TrendingUp} title="Capital Gains Sandbox" subtitle="Wait a year, keep the profit." />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Stock Profit ($)</label>
                        <input type="number" value={profit} onChange={(e) => setProfit(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Your Annual Income ($)</label>
                        <input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
                        <p className="text-[10px] text-slate-500 mt-1">Determines your Long Term rate (0%, 15%, or 20%)</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-rose-400">Sell Now (&lt; 1 Year)</span>
                            <span className="text-rose-400 font-bold">-${taxShort.toFixed(0)} Tax</span>
                        </div>
                        <div className="text-xs text-slate-400">Taxed as Ordinary Income (max rate)</div>
                    </div>

                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-emerald-400">Sell Later (&gt; 1 Year)</span>
                            <span className="text-emerald-400 font-bold">-${taxLong.toFixed(0)} Tax</span>
                        </div>
                        <div className="text-xs text-slate-400">Taxed as Capital Gains (privileged rate)</div>
                    </div>

                    <div className="text-center pt-2">
                        <span className="text-slate-300 text-sm">Patience saves you </span>
                        <span className="text-cyan-400 font-black text-xl ml-1">${savings.toFixed(0)}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default function TaxTab({ salary, filingStatus, setSalary }: { salary: number, filingStatus: string, setSalary: (v: number) => void }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TaxWaterfall salary={salary} filingStatus={filingStatus} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PaycheckSimulator salary={salary} />
                <CapitalGainsSandbox />
            </div>
        </div>
    );
}
