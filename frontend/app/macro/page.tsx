"use client";

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/DashboardLayout';
import { getMacroSummary, getYieldCurves, getGlobalMacroData } from '@/lib/api';
import MacroIndicators from '@/components/macro/MacroIndicators';
import { Globe, RefreshCw, TrendingDown } from 'lucide-react';
import DebtClock from '@/components/macro/DebtClock';

const YieldCurveChart = dynamic(() => import('@/components/macro/YieldCurveChart'), {
    loading: () => <div className="h-64 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});
const MacroGlobe = dynamic(() => import('@/components/macro/MacroGlobe').then(mod => mod.MacroGlobe), {
    loading: () => <div className="h-[500px] w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});
const MacroWeatherMap = dynamic(() => import('@/components/macro/MacroWeatherMap'), {
    loading: () => <div className="h-[500px] w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});
const EconomicCalendar = dynamic(() => import('@/components/macro/EconomicCalendar'), {
    loading: () => <div className="h-96 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});
const SupplyChainMap = dynamic(() => import('@/components/macro/SupplyChainMap'), {
    loading: () => <div className="h-96 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});

export default function MacroPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [summary, setSummary] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [curves, setCurves] = useState<any>(null);
    const [globalData, setGlobalData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            // Fetch independently so one failure doesn't block the other
            const summaryPromise = getMacroSummary().catch(() => []);
            const curvesPromise = getYieldCurves().catch(() => null);
            const globalPromise = getGlobalMacroData().catch(() => []);

            const [summaryData, curvesData, globalRes] = await Promise.all([
                summaryPromise,
                curvesPromise,
                globalPromise
            ]);

            setSummary(summaryData);
            setCurves(curvesData);
            setGlobalData(globalRes);
        } catch (e) {
            console.error("Failed to fetch macro data", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <DashboardLayout>
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-500/20 rounded-xl">
                                <Globe className="text-purple-400" size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-100">Tharunomics</h1>
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

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                        <DebtClock />
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
                            <YieldCurveChart data={curves} />
                        </div>

                        {/* Macro Globe and Calendar */}
                        <div className="flex flex-col gap-8">
                            {/* View Toggle */}
                            <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                                <h3 className="text-sm font-bold text-slate-400 pl-2">Global Visualization</h3>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setViewMode('2d')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === '2d' ? 'bg-cyan-500 text-black' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        2D Weather Map
                                    </button>
                                    <button
                                        onClick={() => setViewMode('3d')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === '3d' ? 'bg-purple-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        3D Globe
                                    </button>
                                </div>
                            </div>

                            {viewMode === '3d' ? (
                                <MacroGlobe />
                            ) : (
                                <MacroWeatherMap data={globalData} />
                            )}

                            <EconomicCalendar />
                        </div>
                    </div>

                    {/* Supply Chain Map */}
                    <div className="pb-8">
                        <SupplyChainMap />
                    </div>
                </div>
            </DashboardLayout>
        </Suspense>
    );
}
