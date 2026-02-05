"use client";

import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
    Calculator, DollarSign, ArrowRight, TrendingUp, BookOpen, FileText,
    PiggyBank, Briefcase, MapPin, CheckCircle, Circle, HelpCircle,
    Users, User, Home, CreditCard, Building, Wallet, Target, Clock,
    AlertTriangle, Lightbulb, ChevronRight, Info, LucideIcon
} from 'lucide-react';

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`glass-panel p-6 md:p-8 ${className}`}>{children}</div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: LucideIcon, title: string, subtitle?: string }) => (
    <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
            <Icon className="text-cyan-400" size={24} />
            {title}
        </h2>
        {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
    </div>
);

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

// Sub-navigation tabs
type SubTab = 'basics' | 'documents' | 'saving' | 'calculators' | 'advanced';

const subTabs: { id: SubTab; label: string; icon: LucideIcon }[] = [
    { id: 'basics', label: 'Tax Basics', icon: BookOpen },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'saving', label: 'Save Money', icon: PiggyBank },
    { id: 'calculators', label: 'Calculators', icon: Calculator },
    { id: 'advanced', label: 'Advanced', icon: Target },
];

// ==================== TAX BASICS 101 ====================
const TaxBasics101 = () => {
    const [step, setStep] = useState(0);
    const brackets = [
        { rate: 10, limit: 11600, color: '#10b981' },
        { rate: 12, limit: 47150, color: '#22c55e' },
        { rate: 22, limit: 100525, color: '#eab308' },
        { rate: 24, limit: 191950, color: '#f97316' },
        { rate: 32, limit: 243725, color: '#ef4444' },
        { rate: 35, limit: 609350, color: '#dc2626' },
        { rate: 37, limit: Infinity, color: '#991b1b' },
    ];

    const myths = [
        { myth: "If I get a raise into a higher bracket, I'll lose money", truth: "Only the income ABOVE the threshold is taxed at the higher rate. You always take home more with a raise." },
        { myth: "I should avoid overtime to stay in a lower bracket", truth: "Overtime is taxed at your marginal rate, but you still keep 60-78% of every extra dollar." },
        { myth: "A big refund means I'm winning", truth: "A big refund means you gave the government an interest-free loan all year." },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <SectionHeader icon={BookOpen} title="How Progressive Taxation Works" subtitle="Your dollar's journey through the tax brackets" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <p className="text-slate-300 text-sm">
                            The US uses a <strong className="text-cyan-400">progressive</strong> tax system.
                            Each bracket only applies to income <em>within that range</em>.
                        </p>
                        <div className="space-y-2">
                            {brackets.slice(0, 5).map((b, i) => (
                                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${step === i ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 bg-slate-800/50'}`}
                                    onClick={() => setStep(i)}>
                                    <div className="w-12 h-8 rounded flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: b.color }}>
                                        {b.rate}%
                                    </div>
                                    <div className="text-sm text-slate-300">
                                        ${i === 0 ? '0' : brackets[i - 1].limit.toLocaleString()} - ${b.limit === Infinity ? '∞' : b.limit.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                        <h4 className="text-white font-bold mb-4">Example: $75,000 Income</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-slate-400">First $11,600</span><span className="text-emerald-400">× 10% = $1,160</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">$11,600 - $47,150</span><span className="text-emerald-400">× 12% = $4,266</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">$47,150 - $75,000</span><span className="text-yellow-400">× 22% = $6,127</span></div>
                            <div className="border-t border-slate-700 pt-3 flex justify-between font-bold">
                                <span className="text-white">Total Tax</span><span className="text-cyan-400">$11,553 (15.4% effective)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
                <SectionHeader icon={AlertTriangle} title="Common Tax Myths - Debunked" subtitle="Misconceptions that cost you money" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {myths.map((m, i) => (
                        <div key={i} className="bg-slate-900 rounded-xl p-5 border border-slate-700">
                            <div className="text-rose-400 font-bold text-sm mb-2 flex items-center gap-2">
                                <span className="bg-rose-500/20 px-2 py-0.5 rounded">MYTH</span>
                            </div>
                            <p className="text-slate-300 text-sm mb-3 line-through opacity-70">{m.myth}</p>
                            <div className="text-emerald-400 font-bold text-sm mb-2 flex items-center gap-2">
                                <span className="bg-emerald-500/20 px-2 py-0.5 rounded">TRUTH</span>
                            </div>
                            <p className="text-slate-300 text-sm">{m.truth}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

// ==================== FILING STATUS COMPARISON ====================
const FilingStatusComparison = ({ salary }: { salary: number }) => {
    const calculateTax = (income: number, status: 'single' | 'married' | 'hoh') => {
        const brackets = {
            single: [{ r: 0.10, l: 11600 }, { r: 0.12, l: 47150 }, { r: 0.22, l: 100525 }, { r: 0.24, l: 191950 }],
            married: [{ r: 0.10, l: 23200 }, { r: 0.12, l: 94300 }, { r: 0.22, l: 201050 }, { r: 0.24, l: 383900 }],
            hoh: [{ r: 0.10, l: 16550 }, { r: 0.12, l: 63100 }, { r: 0.22, l: 100500 }, { r: 0.24, l: 191950 }],
        };
        let tax = 0, remaining = income, prev = 0;
        for (const b of brackets[status]) {
            const amt = Math.min(remaining, b.l - prev);
            if (amt > 0) { tax += amt * b.r; remaining -= amt; }
            prev = b.l;
        }
        return tax;
    };

    const statuses = [
        { id: 'single' as const, label: 'Single', icon: User, color: 'cyan' },
        { id: 'married' as const, label: 'Married Filing Jointly', icon: Users, color: 'emerald' },
        { id: 'hoh' as const, label: 'Head of Household', icon: Home, color: 'purple' },
    ];

    return (
        <Card>
            <SectionHeader icon={Users} title="Filing Status Comparison" subtitle={`How $${salary.toLocaleString()} is taxed differently`} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statuses.map(s => {
                    const tax = calculateTax(salary, s.id);
                    const eff = (tax / salary * 100).toFixed(1);
                    return (
                        <div key={s.id} className={`bg-slate-900 rounded-xl p-5 border border-${s.color}-500/30 hover:border-${s.color}-500/60 transition-colors`}>
                            <div className={`flex items-center gap-2 text-${s.color}-400 font-bold mb-4`}>
                                <s.icon size={20} />{s.label}
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-slate-400">Federal Tax</span><span className="text-white">${tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-400">Effective Rate</span><span className={`text-${s.color}-400 font-bold`}>{eff}%</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-400">Take Home</span><span className="text-emerald-400">${(salary - tax).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

// ==================== DOCUMENT CHECKLIST ====================
const DocumentChecklist = () => {
    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const toggle = (id: string) => setChecked(p => ({ ...p, [id]: !p[id] }));

    const docs = [
        { cat: 'Income', items: [{ id: 'w2', name: 'W-2', desc: 'From employer(s)' }, { id: '1099nec', name: '1099-NEC', desc: 'Freelance/contract' }, { id: '1099int', name: '1099-INT/DIV', desc: 'Bank interest, dividends' }, { id: '1099k', name: '1099-K', desc: 'PayPal, Venmo sales' }] },
        { cat: 'Deductions', items: [{ id: '1098', name: '1098', desc: 'Mortgage interest' }, { id: '1098e', name: '1098-E', desc: 'Student loan interest' }, { id: 'charity', name: 'Charity Receipts', desc: 'Donations $250+' }] },
        { cat: 'Investments', items: [{ id: '1099b', name: '1099-B', desc: 'Stock sales' }, { id: 'cost', name: 'Cost Basis', desc: 'Purchase records' }] },
        { cat: 'Healthcare', items: [{ id: '1095a', name: '1095-A', desc: 'Marketplace insurance' }] },
    ];

    const total = docs.flatMap(d => d.items).length;
    const done = Object.values(checked).filter(Boolean).length;

    return (
        <Card>
            <SectionHeader icon={FileText} title="Tax Document Checklist" subtitle="Track what you need to file" />
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2"><span className="text-slate-400">Progress</span><span className="text-cyan-400">{done}/{total}</span></div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all" style={{ width: `${(done / total) * 100}%` }} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {docs.map(cat => (
                    <div key={cat.cat} className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                        <h4 className="text-white font-bold mb-3">{cat.cat}</h4>
                        <div className="space-y-2">
                            {cat.items.map(item => (
                                <div key={item.id} onClick={() => toggle(item.id)} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${checked[item.id] ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'}`}>
                                    {checked[item.id] ? <CheckCircle className="text-emerald-400" size={18} /> : <Circle className="text-slate-600" size={18} />}
                                    <div><div className={`text-sm font-medium ${checked[item.id] ? 'text-emerald-300 line-through' : 'text-white'}`}>{item.name}</div><div className="text-xs text-slate-500">{item.desc}</div></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Clock size={16} className="text-cyan-400" /> Key Dates</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><div className="text-slate-500">W-2s Due</div><div className="text-white font-bold">Jan 31</div></div>
                    <div><div className="text-slate-500">1099s Due</div><div className="text-white font-bold">Feb 15</div></div>
                    <div><div className="text-slate-500">Filing Opens</div><div className="text-white font-bold">Jan 29</div></div>
                    <div><div className="text-slate-500">Filing Deadline</div><div className="text-rose-400 font-bold">Apr 15</div></div>
                </div>
            </div>
        </Card>
    );
};

// ==================== DEDUCTION VS CREDIT ====================
const DeductionVsCredit = ({ salary }: { salary: number }) => {
    const [amount, setAmount] = useState(1000);
    const marginalRate = salary < 47150 ? 0.12 : salary < 100525 ? 0.22 : 0.24;
    const deductionSaving = amount * marginalRate;
    const creditSaving = amount;

    return (
        <Card className="border-t-4 border-t-emerald-500">
            <SectionHeader icon={Lightbulb} title="Deduction vs Credit" subtitle="Why credits are worth more" />
            <div className="mb-6">
                <label className="text-xs text-slate-400 block mb-2">Amount ($)</label>
                <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                    <h4 className="text-amber-400 font-bold mb-4">${amount.toLocaleString()} Deduction</h4>
                    <p className="text-slate-400 text-sm mb-4">Reduces your <em>taxable income</em></p>
                    <div className="text-3xl font-black text-amber-400">${deductionSaving.toFixed(0)}</div>
                    <div className="text-sm text-slate-500">saved at {(marginalRate * 100).toFixed(0)}% bracket</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-6 border border-emerald-500/30 ring-2 ring-emerald-500/20">
                    <h4 className="text-emerald-400 font-bold mb-4">${amount.toLocaleString()} Credit</h4>
                    <p className="text-slate-400 text-sm mb-4">Reduces your <em>tax bill directly</em></p>
                    <div className="text-3xl font-black text-emerald-400">${creditSaving.toFixed(0)}</div>
                    <div className="text-sm text-emerald-500">dollar-for-dollar savings</div>
                </div>
            </div>
            <div className="mt-6 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                <div className="text-cyan-400 font-bold mb-2">Credits are {(creditSaving / deductionSaving).toFixed(1)}x more valuable!</div>
                <p className="text-sm text-slate-300">A $1,000 credit saves you $1,000. A $1,000 deduction only saves you ${deductionSaving.toFixed(0)} (your marginal rate).</p>
            </div>
        </Card>
    );
};

// ==================== TAX WATERFALL (existing, enhanced) ====================
const TaxWaterfall = ({ salary }: { salary: number }) => {
    const brackets = [{ rate: 0.10, limit: 11600 }, { rate: 0.12, limit: 47150 }, { rate: 0.22, limit: 100525 }, { rate: 0.24, limit: 191950 }, { rate: 0.32, limit: 243725 }, { rate: 0.35, limit: 609350 }, { rate: 0.37, limit: Infinity }];
    let remaining = salary, totalTax = 0, prev = 0;
    const buckets: { rate: string; amount: number; tax: number; fill: string }[] = [];

    for (const b of brackets) {
        const size = b.limit - prev;
        const taxable = Math.min(remaining, size);
        if (taxable > 0) {
            const tax = taxable * b.rate;
            totalTax += tax;
            buckets.push({ rate: `${b.rate * 100}%`, amount: taxable, tax, fill: b.rate <= 0.12 ? '#10b981' : b.rate <= 0.24 ? '#f59e0b' : '#ef4444' });
            remaining -= taxable;
        } else break;
        prev = b.limit;
    }

    const effectiveRate = (totalTax / salary) * 100;
    const marginalRate = buckets[buckets.length - 1]?.rate || "0%";

    return (
        <Card>
            <SectionHeader icon={Calculator} title="Marginal vs. Effective Rate" subtitle="Why you dont actually pay 22% tax." />
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
                    <BarChart data={buckets} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="rate" tick={{ fill: '#94a3b8' }} />
                        <YAxis tick={{ fill: '#94a3b8' }} tickFormatter={(val) => `$${val / 1000}k`} />
                        <RechartsTooltip content={({ active, payload }) => active && payload?.length ? (
                            <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl">
                                <p className="text-white font-bold">{payload[0].payload.rate} Bracket</p>
                                <p className="text-slate-300 text-sm">Income: ${payload[0].payload.amount.toLocaleString()}</p>
                                <p className="text-rose-400 text-sm">Tax: ${payload[0].payload.tax.toLocaleString()}</p>
                            </div>
                        ) : null} />
                        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>{buckets.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

// ==================== PAYCHECK SIMULATOR (existing, enhanced) ====================
const PaycheckSimulator = ({ salary }: { salary: number }) => {
    const federalTax = salary * 0.14;
    const stateTax = salary * 0.05;
    const fica = salary * 0.0765;
    const takeHome = salary - federalTax - stateTax - fica;
    const mGross = salary / 12;
    const mNet = takeHome / 12;

    const data = [
        { name: 'Federal', value: federalTax, color: '#f43f5e' },
        { name: 'FICA', value: fica, color: '#f97316' },
        { name: 'State', value: stateTax, color: '#eab308' },
        { name: 'Take Home', value: takeHome, color: '#10b981' },
    ];

    return (
        <Card>
            <SectionHeader icon={DollarSign} title="Paycheck Reality Check" subtitle="Where your money actually goes" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                <div className="text-center"><div className="text-slate-500 text-xs uppercase">Gross Monthly</div><div className="text-2xl font-bold text-slate-300">${mGross.toFixed(0)}</div></div>
                <ArrowRight className="text-slate-600 rotate-90 md:rotate-0" />
                <div className="text-center"><div className="text-slate-500 text-xs uppercase">Taxes & FICA</div><div className="text-2xl font-bold text-rose-400">-${(mGross - mNet).toFixed(0)}</div></div>
                <ArrowRight className="text-slate-600 rotate-90 md:rotate-0" />
                <div className="text-center"><div className="text-emerald-500 text-xs uppercase font-bold">Net Pay</div><div className="text-4xl font-black text-emerald-400">${mNet.toFixed(0)}</div></div>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                        {data.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie></PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
                <TooltipTrigger label="Federal Tax" text="Funds military, highways, federal programs. Progressive bracket system." />
                <TooltipTrigger label="FICA" text="Social Security (6.2%) + Medicare (1.45%). Funds retirement and healthcare." />
                <TooltipTrigger label="State Tax" text="Varies by state (0% in TX/FL, high in CA/NY). Funds schools, police." />
            </div>
        </Card>
    );
};

// ==================== CAPITAL GAINS (existing) ====================
const CapitalGainsSandbox = () => {
    const [profit, setProfit] = useState(1000);
    const [income, setIncome] = useState(60000);
    const shortTermRate = 0.22;
    const longTermRate = income < 47000 ? 0.0 : 0.15;
    const taxShort = profit * shortTermRate;
    const taxLong = profit * longTermRate;
    const savings = taxShort - taxLong;

    return (
        <Card className="border-t-4 border-t-cyan-500">
            <SectionHeader icon={TrendingUp} title="Capital Gains Sandbox" subtitle="Wait a year, keep the profit." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div><label className="text-xs text-slate-400 block mb-1">Stock Profit ($)</label><input type="number" value={profit} onChange={(e) => setProfit(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" /></div>
                    <div><label className="text-xs text-slate-400 block mb-1">Your Annual Income ($)</label><input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" /></div>
                </div>
                <div className="space-y-4">
                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                        <div className="flex justify-between items-center mb-1"><span className="font-bold text-rose-400">Sell Now (&lt; 1 Year)</span><span className="text-rose-400 font-bold">-${taxShort.toFixed(0)}</span></div>
                        <div className="text-xs text-slate-400">Taxed as Ordinary Income</div>
                    </div>
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <div className="flex justify-between items-center mb-1"><span className="font-bold text-emerald-400">Sell Later (&gt; 1 Year)</span><span className="text-emerald-400 font-bold">-${taxLong.toFixed(0)}</span></div>
                        <div className="text-xs text-slate-400">Taxed as Capital Gains</div>
                    </div>
                    <div className="text-center pt-2"><span className="text-slate-300 text-sm">Patience saves you </span><span className="text-cyan-400 font-black text-xl">${savings.toFixed(0)}</span></div>
                </div>
            </div>
        </Card>
    );
};

// ==================== W-4 OPTIMIZER ====================
const W4Optimizer = ({ salary }: { salary: number }) => {
    const [withholding, setWithholding] = useState(15);
    const [additionalIncome, setAdditionalIncome] = useState(0);

    const estimatedTax = salary * 0.20; // Simplified estimate
    const withheld = salary * (withholding / 100);
    const diff = withheld - estimatedTax;

    return (
        <Card>
            <SectionHeader icon={Wallet} title="W-4 Withholding Optimizer" subtitle="Dont give the IRS an interest-free loan" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="text-xs text-slate-400 block mb-2">Current Withholding Rate (%)</label>
                        <input type="range" min="10" max="35" value={withholding} onChange={e => setWithholding(Number(e.target.value))} className="w-full" />
                        <div className="text-right text-cyan-400 font-bold">{withholding}%</div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-2">Side Income / Freelance ($)</label>
                        <input type="number" value={additionalIncome} onChange={e => setAdditionalIncome(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" />
                    </div>
                </div>
                <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                    <div className="space-y-4">
                        <div className="flex justify-between"><span className="text-slate-400">Estimated Tax Owed</span><span className="text-white">${estimatedTax.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Amount Withheld</span><span className="text-white">${withheld.toLocaleString()}</span></div>
                        <div className="border-t border-slate-700 pt-4">
                            {diff > 1000 ? (
                                <div className="text-amber-400"><div className="font-bold text-lg">Refund: ${diff.toFixed(0)}</div><div className="text-sm">Consider reducing withholding to keep more each paycheck</div></div>
                            ) : diff < -500 ? (
                                <div className="text-rose-400"><div className="font-bold text-lg">You may owe: ${Math.abs(diff).toFixed(0)}</div><div className="text-sm">Consider increasing withholding to avoid penalty</div></div>
                            ) : (
                                <div className="text-emerald-400"><div className="font-bold text-lg">Well optimized!</div><div className="text-sm">Your withholding is close to your actual tax liability</div></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

// ==================== SELF EMPLOYMENT ====================
const SelfEmploymentCorner = () => {
    const [selfIncome, setSelfIncome] = useState(50000);
    const seTax = selfIncome * 0.153;
    const qbiDeduction = selfIncome * 0.20;
    const quarterly = seTax / 4;

    return (
        <Card className="border-l-4 border-l-purple-500">
            <SectionHeader icon={Briefcase} title="Self-Employment Tax Corner" subtitle="For freelancers, contractors & business owners" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="text-xs text-slate-400 block mb-2">Self-Employment Income ($)</label>
                    <input type="number" value={selfIncome} onChange={e => setSelfIncome(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" />
                    <div className="mt-6 space-y-4">
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                            <div className="text-slate-400 text-sm">Self-Employment Tax (15.3%)</div>
                            <div className="text-rose-400 font-bold text-xl">${seTax.toLocaleString()}</div>
                            <div className="text-xs text-slate-500 mt-1">12.4% Social Security + 2.9% Medicare</div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-emerald-500/30">
                            <div className="text-slate-400 text-sm">QBI Deduction (20%)</div>
                            <div className="text-emerald-400 font-bold text-xl">-${qbiDeduction.toLocaleString()}</div>
                            <div className="text-xs text-slate-500 mt-1">Qualified Business Income deduction</div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                    <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Clock size={18} className="text-cyan-400" /> Quarterly Estimated Payments</h4>
                    <div className="space-y-3">
                        {['Apr 15', 'Jun 15', 'Sep 15', 'Jan 15'].map((date, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                                <span className="text-slate-300">Q{i + 1}: {date}</span>
                                <span className="text-cyan-400 font-bold">${quarterly.toFixed(0)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};

// ==================== TAX ADVANTAGED ACCOUNTS ====================
const TaxAdvantagedAccounts = ({ salary }: { salary: number }) => {
    const accounts = [
        { name: '401(k)', limit: 23000, benefit: 'Pre-tax', color: 'cyan', desc: 'Employer-sponsored, often with match' },
        { name: 'Traditional IRA', limit: 7000, benefit: 'Pre-tax', color: 'blue', desc: 'Tax deduction now, taxed in retirement' },
        { name: 'Roth IRA', limit: 7000, benefit: 'Post-tax', color: 'purple', desc: 'No deduction now, tax-free in retirement' },
        { name: 'HSA', limit: 4150, benefit: 'Triple Tax', color: 'emerald', desc: 'Tax-free in, growth, and out (for medical)' },
    ];

    const marginalRate = salary < 47150 ? 0.12 : salary < 100525 ? 0.22 : 0.24;
    const maxSavings = 23000 * marginalRate;

    return (
        <Card>
            <SectionHeader icon={PiggyBank} title="Tax-Advantaged Accounts" subtitle="Shelter your income from taxes legally" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {accounts.map(a => (
                    <div key={a.name} className={`bg-slate-900 rounded-xl p-5 border border-${a.color}-500/30 hover:border-${a.color}-500/60 transition-colors`}>
                        <div className={`text-${a.color}-400 font-bold text-lg mb-2`}>{a.name}</div>
                        <div className="text-2xl font-black text-white mb-1">${a.limit.toLocaleString()}</div>
                        <div className="text-xs text-slate-500 mb-2">2024 limit</div>
                        <div className={`inline-block px-2 py-1 rounded text-xs bg-${a.color}-500/20 text-${a.color}-300`}>{a.benefit}</div>
                        <p className="text-xs text-slate-400 mt-2">{a.desc}</p>
                    </div>
                ))}
            </div>
            <div className="bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/30 rounded-xl p-6">
                <div className="flex items-center gap-4">
                    <div className="text-4xl">💰</div>
                    <div>
                        <div className="text-white font-bold">Max your 401(k) and save up to</div>
                        <div className="text-3xl font-black text-emerald-400">${maxSavings.toLocaleString()}/year</div>
                        <div className="text-sm text-slate-400">at your {(marginalRate * 100).toFixed(0)}% marginal rate</div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

// ==================== STATE TAX MAP ====================
const StateTaxMap = () => {
    const states = [
        { name: 'Texas', rate: 0, color: 'emerald' },
        { name: 'Florida', rate: 0, color: 'emerald' },
        { name: 'Washington', rate: 0, color: 'emerald' },
        { name: 'Nevada', rate: 0, color: 'emerald' },
        { name: 'California', rate: 13.3, color: 'rose' },
        { name: 'New York', rate: 10.9, color: 'rose' },
        { name: 'New Jersey', rate: 10.75, color: 'rose' },
        { name: 'Illinois', rate: 4.95, color: 'amber' },
    ];

    return (
        <Card>
            <SectionHeader icon={MapPin} title="State Tax Comparison" subtitle="Location matters for your tax bill" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {states.map(s => (
                    <div key={s.name} className={`bg-slate-900 rounded-xl p-4 border border-${s.color}-500/30 text-center`}>
                        <div className="text-white font-bold">{s.name}</div>
                        <div className={`text-2xl font-black text-${s.color}-400`}>{s.rate === 0 ? 'No Tax' : `${s.rate}%`}</div>
                    </div>
                ))}
            </div>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h4 className="text-white font-bold mb-4">What If I Moved? (On $100k income)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                        <div className="text-slate-400 text-sm">Move to Texas</div>
                        <div className="text-emerald-400 font-bold text-xl">Save $5,000+/yr</div>
                    </div>
                    <div className="text-center p-4 bg-rose-500/10 rounded-lg border border-rose-500/30">
                        <div className="text-slate-400 text-sm">Stay in California</div>
                        <div className="text-rose-400 font-bold text-xl">Pay ~$9,300/yr</div>
                    </div>
                    <div className="text-center p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                        <div className="text-slate-400 text-sm">Move to Illinois</div>
                        <div className="text-amber-400 font-bold text-xl">Pay ~$4,950/yr</div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

// ==================== MAIN TAX TAB ====================
export default function TaxTab({ salary, filingStatus, setSalary }: { salary: number, filingStatus: string, setSalary: (v: number) => void }) {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('basics');

    const renderSubTab = () => {
        switch (activeSubTab) {
            case 'basics':
                return (<><TaxBasics101 /><FilingStatusComparison salary={salary} /></>);
            case 'documents':
                return <DocumentChecklist />;
            case 'saving':
                return (<><DeductionVsCredit salary={salary} /><TaxAdvantagedAccounts salary={salary} /></>);
            case 'calculators':
                return (<><TaxWaterfall salary={salary} /><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><PaycheckSimulator salary={salary} /><CapitalGainsSandbox /></div><W4Optimizer salary={salary} /><SelfEmploymentCorner /></>);
            case 'advanced':
                return <StateTaxMap />;
            default:
                return <TaxBasics101 />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sub-Navigation */}
            <div className="flex flex-wrap gap-2 p-2 bg-slate-900/50 rounded-xl border border-slate-800">
                {subTabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveSubTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSubTab === tab.id ? 'bg-cyan-500 text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <tab.icon size={16} />{tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-6">{renderSubTab()}</div>
        </div>
    );
}
