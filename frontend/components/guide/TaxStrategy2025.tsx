import React, { useState } from 'react';
import { CheckCircle, Circle, FileText, AlertTriangle, ChevronRight, DollarSign, Calculator, Calendar } from 'lucide-react';

const TaxStrategy2025 = () => {
    const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({});

    const toggleItem = (id: string) => {
        setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const docItems = [
        { id: 'w2', label: 'W-2 (Employer Income)', cat: 'Income' },
        { id: '1099nec', label: '1099-NEC (Freelance/Gig)', cat: 'Income' },
        { id: '1099int', label: '1099-INT/DIV (Investments)', cat: 'Income' },
        { id: '1099k', label: '1099-K (Venmo/PayPal Sales)', cat: 'Income' },
        { id: '1098', label: 'Form 1098 (Mortgage Interest)', cat: 'Deductions' },
        { id: '1098e', label: 'Form 1098-E (Student Loan Interest)', cat: 'Deductions' },
        { id: 'vehicle', label: 'Vehicle Loan Info (New for 2025)', cat: 'Deductions' },
        { id: 'medical', label: 'Medical Receipts (>7.5% AGI)', cat: 'Deductions' },
    ];

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900 border border-emerald-500/20 p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-2 mb-2">
                    <Calendar className="text-emerald-400" />
                    2025 Tax Strategy Guide
                </h3>
                <p className="text-slate-300">
                    Filing Year: <strong>Jan 1, 2025 – Dec 31, 2025</strong> • Due Date: <strong>April 15, 2026</strong>
                </p>
                <div className="mt-4 flex gap-3 text-sm">
                    <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">OBBBA Act Active</span>
                    <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">Standard Deduction Increased</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. The "OBBBA" Changes */}
                <div className="space-y-6">
                    <h4 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                        <AlertTriangle className="text-amber-400" size={20} />
                        Key Changes (New for 2025)
                    </h4>

                    <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700 hover:border-amber-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <div className="text-amber-400 font-bold">Standard Deduction Hike</div>
                            <div className="bg-amber-500/10 px-2 py-0.5 rounded text-xs text-amber-300 border border-amber-500/20">OBBBA</div>
                        </div>
                        <div className="space-y-2 text-sm text-slate-300">
                            <div className="flex justify-between border-b border-slate-700/50 pb-1">
                                <span>Single</span>
                                <span className="font-mono text-white">$15,750</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-700/50 pb-1">
                                <span>Married Filing Jointly</span>
                                <span className="font-mono text-white">$31,500</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Head of Household</span>
                                <span className="font-mono text-white">$23,625</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700 hover:border-blue-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <div className="text-blue-400 font-bold">SALT Cap Raised</div>
                            <div className="bg-blue-500/10 px-2 py-0.5 rounded text-xs text-blue-300 border border-blue-500/20">Huge Win</div>
                        </div>
                        <p className="text-sm text-slate-300 mb-2">
                            The limit for deducting State and Local Taxes (SALT) has quadrupled.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="text-xs line-through text-slate-500">$10,000</div>
                            <ChevronRight size={14} className="text-slate-600" />
                            <div className="text-lg font-bold text-emerald-400">$40,000</div>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700 hover:border-purple-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <div className="text-purple-400 font-bold">New Deductions</div>
                            <div className="bg-purple-500/10 px-2 py-0.5 rounded text-xs text-purple-300 border border-purple-500/20">Detailed</div>
                        </div>
                        <ul className="space-y-3">
                            <li className="text-sm text-slate-300">
                                <strong className="text-white block mb-0.5">Overtime Pay Deduction</strong>
                                Deduct the "premium" portion of overtime. Up to $12.5k (Single) / $25k (Joint).
                            </li>
                            <li className="text-sm text-slate-300">
                                <strong className="text-white block mb-0.5">Tip Income Deduction</strong>
                                Deduct qualified tips up to $25k for service industry roles.
                            </li>
                            <li className="text-sm text-slate-300">
                                <strong className="text-white block mb-0.5">Auto Loan Interest</strong>
                                Deduct interest on personal car loans (originated after Dec 31, 2024). Max $10k.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* 2. Interactive Checklist */}
                <div className="space-y-6">
                    <h4 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                        <FileText className="text-cyan-400" size={20} />
                        Document Checklist
                    </h4>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
                        <div className="mb-4 text-xs text-slate-500 uppercase font-bold tracking-wider">Tap to mark collected</div>
                        <div className="space-y-3">
                            {docItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => toggleItem(item.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${checklist[item.id]
                                            ? 'bg-emerald-500/10 border-emerald-500/30'
                                            : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800'
                                        }`}
                                >
                                    {checklist[item.id] ? (
                                        <CheckCircle className="text-emerald-400 shrink-0" size={20} />
                                    ) : (
                                        <Circle className="text-slate-600 shrink-0" size={20} />
                                    )}
                                    <div>
                                        <div className={`text-sm font-medium ${checklist[item.id] ? 'text-emerald-200 line-through opacity-70' : 'text-slate-200'}`}>
                                            {item.label}
                                        </div>
                                        <div className="text-[10px] text-slate-500">{item.cat}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700">
                        <h5 className="font-bold text-slate-200 mb-3 flex items-center gap-2">
                            <Calculator size={16} className="text-slate-400" />
                            Tax Credits (Better than Deductions)
                        </h5>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li className="flex gap-2">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span><strong>Energy Efficient Home:</strong> 30% credit for windows, doors, heat pumps.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span><strong>Residential Clean Energy:</strong> 30% uncapped for solar/batteries.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span><strong>Child Tax Credit:</strong> Up to $2,200 per child under 17.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxStrategy2025;
