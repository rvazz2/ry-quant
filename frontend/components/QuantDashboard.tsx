"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';

// Lazy Load Heavy Components
const OptionsChain = dynamic(() => import('./OptionsChain'), {
    loading: () => <div className="h-64 bg-slate-900/50 rounded-xl animate-pulse" />
});
const OptionCalculator = dynamic(() => import('./OptionCalculator'), {
    loading: () => <div className="h-64 bg-slate-900/50 rounded-xl animate-pulse" />
});
const MASimulator = dynamic(() => import('./MASimulator'), {
    loading: () => <div className="h-64 bg-slate-900/50 rounded-xl animate-pulse" />
});
const MacroWarRoom = dynamic(() => import('./macro/MacroWarRoom'), {
    loading: () => <div className="h-96 bg-slate-900/50 rounded-xl animate-pulse" />
});
const AnalystTrackRecord = dynamic(() => import('./AnalystTrackRecord'), {
    loading: () => <div className="h-64 bg-slate-900/50 rounded-xl animate-pulse" />
});

const QuantDashboard = () => {
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        setLastUpdated(new Date());
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        window.location.reload();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Quant Research Lab
                    </h1>
                    <p className="text-slate-400 mt-2">Advanced derivatives analysis and portfolio optimization.</p>
                </div>

                <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 text-xs text-slate-400 px-2">
                        <Clock className="w-3 h-3" />
                        <span>Last updated: {lastUpdated?.toLocaleTimeString()}</span>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={`p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                        title="Refresh Data"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Left Column: Options */}
                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-slate-200 mb-4 border-l-4 border-cyan-500 pl-3">Real-Time Options Chain</h2>
                        <ErrorBoundary name="Options Chain">
                            <OptionsChain />
                        </ErrorBoundary>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-200 mb-4 border-l-4 border-blue-500 pl-3">Black-Scholes Pricing</h2>
                        <ErrorBoundary name="Option Calculator">
                            <OptionCalculator />
                        </ErrorBoundary>
                    </section>
                </div>

                {/* Right Column: Portfolio & Backtesting */}
                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-slate-200 mb-4 border-l-4 border-indigo-500 pl-3">M&A Simulator</h2>
                        <ErrorBoundary name="M&A Simulator">
                            <MASimulator />
                        </ErrorBoundary>
                    </section>
                </div>
            </div>

            <div className="border-t border-slate-800 pt-8">
                <ErrorBoundary name="Tharunomics">
                    <MacroWarRoom />
                </ErrorBoundary>
            </div>

            <div className="border-t border-slate-800 pt-8">
                <ErrorBoundary name="Analyst Track Record">
                    <AnalystTrackRecord />
                </ErrorBoundary>
            </div>
        </div >
    );
};

export default QuantDashboard;
