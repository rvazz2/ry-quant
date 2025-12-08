"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getMacroSummary, getYieldCurves } from '@/lib/api';
import MacroIndicators from './MacroIndicators';
import { Globe, RefreshCw, TrendingDown } from 'lucide-react';

const YieldCurveChart = dynamic(() => import('./YieldCurveChart'), {
    loading: () => <div className="h-64 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});
const SupplyChainMap = dynamic(() => import('./SupplyChainMap'), {
    loading: () => <div className="h-96 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});

const MacroWarRoom = () => {
    const [summary, setSummary] = useState<any[]>([]);
    const [curves, setCurves] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch independently so one failure doesn't block the other
            const summaryPromise = getMacroSummary().catch(e => []);
            const curvesPromise = getYieldCurves().catch(e => null);

            const [summaryData, curvesData] = await Promise.all([
                summaryPromise,
                curvesPromise
            ]);

            setSummary(summaryData);
            setCurves(curvesData);
        } catch (e) {
            console.error("Failed to fetch macro data", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                        <Globe className="text-purple-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100">Macro War Room</h1>
                        <p className="text-slate-400">Global economic indicators and recession signals.</p>
                    </div>
                </div>
                <button onClick={fetchData} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                    <RefreshCw size={20} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Indicators Row */}
            <div>
                <h2 className="text-lg font-bold text-slate-200 mb-4 border-l-4 border-purple-500 pl-3">Key Commodities & Indices</h2>
                <MacroIndicators data={summary} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Yield Curve */}
                <div className="glass-panel p-6 border-l-4 border-l-cyan-500">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                            <TrendingDown className="text-cyan-400" />
                            Yield Curve Recession Predictor
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            10Y-2Y Spread Analysis. Inversions have predicted every recession since 1955.
                        </p>
                    </div>
                    <YieldCurveChart data={curves} isLoading={loading} />
                </div>

                {/* Supply Chain Map */}
                <SupplyChainMap />
            </div>
        </div>
    );
};

export default MacroWarRoom;
