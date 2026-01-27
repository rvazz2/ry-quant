"use client";

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertTriangle, TrendingUp, Activity } from 'lucide-react';

interface YieldCurveProps {
    data: any; // Dictionary of curves
    isLoading?: boolean;
}

// Standalone MetricCard Component
const MetricCard = React.memo(({ icon: Icon, label, value, subtext, highlight = false, riskColors }: any) => (
    <div className={`glass-panel p-3 border-l-4 ${highlight && riskColors ? riskColors.border : 'border-slate-700'}`}>
        <div className="flex items-center gap-2 mb-1">
            <Icon size={14} className="text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">{label}</span>
        </div>
        <div className={`text-2xl font-bold ${highlight && riskColors ? riskColors.text : 'text-slate-100'}`}>
            {value}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">{subtext}</div>
    </div>
));
MetricCard.displayName = 'MetricCard';

const YieldCurveChart = React.memo(({ data, isLoading }: YieldCurveProps & { isLoading?: boolean }) => {
    const [visibleCurves, setVisibleCurves] = useState({
        current: true,
        yearAgo: true,
        peak2007: false,
        peak2000: false
    });

    // Toggle logic
    const toggleCurve = (curve: keyof typeof visibleCurves) => {
        setVisibleCurves(prev => ({ ...prev, [curve]: !prev[curve] }));
    };

    // Maturities are standardized in the backend: "3 Mo", "5 Yr", "10 Yr", "30 Yr"
    const maturities = ["3 Mo", "5 Yr", "10 Yr", "30 Yr"];

    // Memoize heavy calculations
    const { spread10Y2Y, spread10Y3M, steepness, recessionProb, riskColors, chartData } = React.useMemo(() => {
        if (!data || !data.current) {
            return {
                spread10Y2Y: 0,
                spread10Y3M: 0,
                steepness: 0,
                recessionProb: 0,
                riskColors: { bg: '', border: '', text: '', dot: '' },
                chartData: []
            };
        }

        // Helper to get yield value for a specific maturity
        const getYieldVal = (curve: any[], mat: string) => curve?.find((x: any) => x.maturity === mat)?.yield || 0;

        // Calculate key metrics
        const current10Y = getYieldVal(data.current, "10 Yr");
        const current5Y = getYieldVal(data.current, "5 Yr");
        const current3M = getYieldVal(data.current, "3 Mo");
        const current30Y = getYieldVal(data.current, "30 Yr");

        // Spreads
        const s10Y2Y = current10Y - current5Y; // Using 5Y as proxy
        const s10Y3M = current10Y - current3M;
        const steep = current30Y - current3M;

        // Recession probability heuristic
        const calculateRecessionProb = () => {
            const primarySpread = Math.min(s10Y2Y, s10Y3M);
            if (primarySpread >= 0) return 5; // Normal curve
            if (primarySpread >= -0.1) return 25; // Slight inversion
            if (primarySpread >= -0.3) return 50; // Moderate inversion
            if (primarySpread >= -0.5) return 75; // Deep inversion
            return 90; // Very deep inversion
        };

        const prob = calculateRecessionProb();

        // Get risk level color
        const getRiskColor = (p: number) => {
            if (p < 20) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-500' };
            if (p < 40) return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-500' };
            if (p < 60) return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-500' };
            return { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', dot: 'bg-rose-500' };
        };

        const colors = getRiskColor(prob);

        // Transform data for Recharts
        const cData = maturities.map(m => {
            const point: any = { name: m };

            const findYield = (curve: any[]) => {
                const item = curve?.find((x: any) => x.maturity === m);
                return item ? item.yield : null;
            };

            if (data.current) point["Current"] = findYield(data.current);
            if (data["2007_peak"]) point["2007 Peak"] = findYield(data["2007_peak"]);
            if (data["2000_peak"]) point["2000 Peak"] = findYield(data["2000_peak"]);
            if (data.year_ago) point["1 Year Ago"] = findYield(data.year_ago);

            return point;
        });

        return {
            spread10Y2Y: s10Y2Y,
            spread10Y3M: s10Y3M,
            steepness: steep,
            recessionProb: prob,
            riskColors: colors,
            chartData: cData
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    if (isLoading) {
        return (
            <div className="h-[400px] w-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/10 rounded-xl border border-slate-800/50">
                <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-3"></div>
                <span className="text-sm">Loading yield curve data...</span>
            </div>
        );
    }

    if (!data || !data.current) {
        return (
            <div className="h-[400px] w-full flex flex-col items-center justify-center text-slate-400 bg-slate-900/10 rounded-xl border border-slate-800/50">
                <AlertTriangle className="mb-2 text-amber-500/50" size={32} />
                <span>Yield Curve Data Unavailable</span>
                <span className="text-xs text-slate-500 mt-1">Unable to fetch Treasury yields</span>
            </div>
        );
    }

    // Derived state for inversion (cheap)
    const isInverted = spread10Y2Y < 0 || spread10Y3M < 0;

    return (
        <div className="space-y-4">
            {/* Key Metrics Panel */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <MetricCard
                    icon={TrendingUp}
                    label="10Y-5Y Spread"
                    value={`${spread10Y2Y >= 0 ? '+' : ''}${spread10Y2Y.toFixed(2)}%`}
                    subtext={spread10Y2Y < 0 ? "INVERTED" : "Normal"}
                    highlight={spread10Y2Y < 0}
                    riskColors={riskColors}
                />
                <MetricCard
                    icon={TrendingUp}
                    label="10Y-3M Spread"
                    value={`${spread10Y3M >= 0 ? '+' : ''}${spread10Y3M.toFixed(2)}%`}
                    subtext={spread10Y3M < 0 ? "INVERTED" : "Normal"}
                    highlight={spread10Y3M < 0}
                    riskColors={riskColors}
                />
                <MetricCard
                    icon={Activity}
                    label="Curve Steepness"
                    value={steepness.toFixed(2)}
                    subtext={steepness < 1 ? "Flat" : steepness < 2 ? "Moderate" : "Steep"}
                    riskColors={riskColors}
                />
                <MetricCard
                    icon={AlertTriangle}
                    label="Recession Risk"
                    value={`${recessionProb}%`}
                    subtext={recessionProb < 20 ? "Low" : recessionProb < 40 ? "Elevated" : recessionProb < 60 ? "High" : "Very High"}
                    highlight={recessionProb >= 40}
                    riskColors={riskColors}
                />
            </div>

            {/* Curve Toggle Controls */}
            <div className="flex flex-wrap gap-2 text-sm">
                <button
                    onClick={() => toggleCurve('current')}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${visibleCurves.current ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
                >
                    <span className="inline-block w-3 h-3 rounded-full bg-cyan-400 mr-2"></span>
                    Current
                </button>
                <button
                    onClick={() => toggleCurve('yearAgo')}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${visibleCurves.yearAgo ? 'bg-slate-600/20 border-slate-500/50 text-slate-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
                >
                    <span className="inline-block w-3 h-3 rounded-full bg-slate-400 mr-2"></span>
                    1 Year Ago
                </button>
                <button
                    onClick={() => toggleCurve('peak2007')}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${visibleCurves.peak2007 ? 'bg-red-500/20 border-red-500/50 text-red-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
                >
                    <span className="inline-block w-3 h-3 rounded-full bg-red-400 mr-2"></span>
                    2007 Peak
                </button>
                <button
                    onClick={() => toggleCurve('peak2000')}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${visibleCurves.peak2000 ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
                >
                    <span className="inline-block w-3 h-3 rounded-full bg-purple-400 mr-2"></span>
                    2000 Dot-com
                </button>
            </div>

            {/* Chart */}
            <div className="glass-panel p-4">
                <div className="w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" domain={['auto', 'auto']} unit="%" />

                            {/* Reference line at 0% to highlight inversions */}
                            <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} />

                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                itemStyle={{ color: '#f8fafc' }}
                                labelStyle={{ color: '#cbd5e1', fontWeight: 'bold' }}
                            />
                            <Legend />

                            {/* Current - Cyan/Bold */}
                            {visibleCurves.current && (
                                <Line
                                    type="monotone"
                                    dataKey="Current"
                                    stroke="#22d3ee"
                                    strokeWidth={3}
                                    dot={{ r: 6, fill: '#22d3ee' }}
                                    activeDot={{ r: 8 }}
                                />
                            )}

                            {/* 2007 - Red/Warning */}
                            {visibleCurves.peak2007 && (
                                <Line
                                    type="monotone"
                                    dataKey="2007 Peak"
                                    stroke="#f87171"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={{ r: 4 }}
                                />
                            )}

                            {/* 2000 - Purple */}
                            {visibleCurves.peak2000 && (
                                <Line
                                    type="monotone"
                                    dataKey="2000 Peak"
                                    stroke="#c084fc"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={{ r: 4 }}
                                />
                            )}

                            {/* 1 Year Ago - Gray/Context */}
                            {visibleCurves.yearAgo && (
                                <Line
                                    type="monotone"
                                    dataKey="1 Year Ago"
                                    stroke="#94a3b8"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Inversion Warning */}
                {isInverted && (
                    <div className={`mt-4 p-3 rounded-lg border ${riskColors.bg} ${riskColors.border}`}>
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={16} className={riskColors.text} />
                            <span className={`text-sm font-bold ${riskColors.text}`}>
                                Yield Curve Inversion Detected
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Historically, inversions have preceded every recession since 1955, typically 6-24 months in advance.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
});

YieldCurveChart.displayName = 'YieldCurveChart';

export default YieldCurveChart;
