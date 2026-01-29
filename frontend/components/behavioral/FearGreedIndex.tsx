import React, { useEffect, useState } from 'react';
import { getFearGreedIndex } from '@/lib/api';
import { RefreshCw, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface FearGreedData {
    score: number;
    label: string;
    components?: {
        momentum?: number;
        volatility?: number;
    };
    error?: string;
}

export default function FearGreedIndex() {
    const [data, setData] = useState<FearGreedData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getFearGreedIndex();
            setData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getColor = (score: number) => {
        if (score < 25) return '#ef4444'; // Extreme Fear (Red)
        if (score < 45) return '#f97316'; // Fear (Orange)
        if (score > 75) return '#22c55e'; // Extreme Greed (Green)
        if (score > 55) return '#84cc16'; // Greed (Lime)
        return '#eab308'; // Neutral (Yellow)
    };

    const score = data?.score || 50;
    const angle = (score / 100) * 180; // 0 to 180 degrees
    const color = getColor(score);

    if (loading) {
        return <div className="h-64 w-full bg-slate-900/50 animate-pulse rounded-xl" />;
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl flex flex-col items-center relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-50" />

            <div className="flex justify-between w-full items-center mb-6">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    Fear & Greed Index
                </h3>
                <button onClick={loadData} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <RefreshCw className="w-4 h-4 text-slate-400" />
                </button>
            </div>

            {/* Gauge */}
            <div className="relative w-64 h-32 mb-8">
                {/* Background Arc */}
                <div className="w-full h-full rounded-t-full border-[20px] border-slate-800 border-b-0" />

                {/* Colored Gradient Arc (Simulated with simple CSS or SVG for better control, using simple SVG here) */}
                <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 50">
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#334155"
                        strokeWidth="10"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="url(#gauge-gradient)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray="126" /* Approximate arc length */
                        strokeDashoffset={126 - (126 * (score / 100))}
                        className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                        <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="50%" stopColor="#eab308" />
                            <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Needle */}
                <motion.div
                    className="absolute bottom-0 left-1/2 w-1 h-24 bg-white origin-bottom -ml-0.5 rounded-full z-10 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: angle - 90 }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                />

                {/* Center Point */}
                <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-slate-100 rounded-full -ml-2 -mb-2 z-20 border-2 border-slate-900" />
            </div>

            {/* Score & Label */}
            <div className="text-center mb-6">
                <div className="text-5xl font-black tracking-tight" style={{ color }}>
                    {score}
                </div>
                <div className="text-xl font-medium text-slate-300 mt-1">
                    {data?.label}
                </div>
            </div>

            {/* Drivers */}
            <div className="w-full grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm text-slate-400 mb-1">
                        <span>Momentum</span>
                        <span>{data?.components?.momentum || 0}/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${data?.components?.momentum || 0}%` }}
                        />
                    </div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm text-slate-400 mb-1">
                        <span>Volatility</span>
                        <span>{data?.components?.volatility || 0}/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${data?.components?.volatility || 0}%` }}
                        />
                    </div>
                </div>
            </div>

            {data?.error && (
                <div className="mt-4 flex items-center gap-2 text-xs text-red-400 bg-red-900/20 px-3 py-2 rounded-lg">
                    <AlertTriangle className="w-3 h-3" />
                    {data.error}
                </div>
            )}
        </div>
    );
}
