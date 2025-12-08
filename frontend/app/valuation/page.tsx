"use client";

import React, { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/DashboardLayout';
import { Calculator, Search } from 'lucide-react';

const DCFWidget = dynamic(() => import('@/components/valuation/DCFWidget'), {
    loading: () => <div className="h-96 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});
const CompsWidget = dynamic(() => import('@/components/valuation/CompsWidget'), {
    loading: () => <div className="h-96 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});
const FraudDetector = dynamic(() => import('@/components/accounting/FraudDetector'), {
    loading: () => <div className="h-96 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});
const DuPontTree = dynamic(() => import('@/components/accounting/DuPontTree'), {
    loading: () => <div className="h-96 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});

export default function ValuationPage() {
    const [ticker, setTicker] = useState("NVDA");
    const [inputValue, setInputValue] = useState("NVDA");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.length > 0) {
            setTicker(inputValue.toUpperCase());
        }
    };

    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Valuation...</div>}>
            <DashboardLayout>
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-500/20 rounded-xl">
                                <Calculator className="text-blue-400" size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-100">Valuation Sandbox</h1>
                                <p className="text-slate-400">Interactive financial models to determine intrinsic value.</p>
                            </div>
                        </div>

                        {/* Shared Ticker Search */}
                        <form onSubmit={handleSearch} className="flex gap-2 relative z-10">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Enter Ticker..."
                                className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white font-bold w-40 focus:w-64 transition-all outline-none focus:border-cyan-500"
                            />
                            <button
                                type="submit"
                                className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-cyan-500/20"
                            >
                                <Search size={20} />
                            </button>
                        </form>
                    </div>

                    {/* Module 1: 2-Minute DCF */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-200 border-l-4 border-cyan-500 pl-4 py-1">
                            Module 1: The "2-Minute DCF"
                        </h2>
                        <p className="text-slate-400 text-sm max-w-3xl mb-6">
                            A Discounted Cash Flow (DCF) analysis determines the value of an investment based on its expected future cash flows.
                            Adjust the levers below to see how Growth and Profitability impact the fair value of <span className="text-cyan-400 font-bold">{ticker}</span>.
                        </p>
                        <DCFWidget ticker={ticker} />
                    </div>

                    {/* Module 2: Comparable Analysis */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-200 border-l-4 border-purple-500 pl-4 py-1">
                            Module 2: Comparable Analysis
                        </h2>
                        <p className="text-slate-400 text-sm max-w-3xl mb-6">
                            Compare valuation multiples against industry peers to identify relative mispricing for <span className="text-purple-400 font-bold">{ticker}</span>.
                        </p>
                        <CompsWidget ticker={ticker} />
                    </div>

                    {/* Module 3: Forensic Accounting Lab */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-200 border-l-4 border-rose-500 pl-4 py-1">
                            Module 3: Forensic Accounting Lab
                        </h2>
                        <p className="text-slate-400 text-sm max-w-3xl mb-6">
                            Advanced tools to detect earnings manipulation and decompose return drivers.
                            Use these to "sanity check" a company before investing.
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <FraudDetector ticker={ticker} />
                            <DuPontTree ticker={ticker} />
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </Suspense>
    );
}
