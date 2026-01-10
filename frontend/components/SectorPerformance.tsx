"use client";

import React, { useEffect, useState } from 'react';
import { getSectorPerformance } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, Layers, ArrowUp, ArrowDown } from 'lucide-react';
import { ShimmerSkeleton } from './LoadingSkeleton';
import ErrorBoundary from './ErrorBoundary';
import GlobalErrorFallback from './GlobalErrorFallback';

const SectorPerformance = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getSectorPerformance();
                setData(res);
            } catch (error) {
                console.error("Failed to load sectors", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="glass-panel p-6 h-96 flex flex-col gap-4">
                <div className="flex justify-between items-center mb-4">
                    <ShimmerSkeleton className="h-8 w-48" />
                </div>
                <div className="flex-1 flex items-end gap-2">
                    {[...Array(11)].map((_, i) => (
                        <ShimmerSkeleton key={i} className={`w-full rounded-t-lg`} style={{ height: `${Math.random() * 60 + 20}%` }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) return null;

    // Sorting: Winners on top (if vertical) or Left (horizontal)
    // Let's do a horizontal bar chart for readable labels

    return (
        <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Layers className="text-cyan-400" size={24} />
                    Sector Performance
                </h3>
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1 text-emerald-400">
                        <ArrowUp size={16} /> Leaders
                    </div>
                    <div className="flex items-center gap-1 text-rose-400">
                        <ArrowDown size={16} /> Laggards
                    </div>
                </div>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={150}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            interval={0}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                            formatter={(value: number) => [`${value > 0 ? '+' : ''}${value.toFixed(2)}%`, 'Performance']}
                        />
                        <Bar dataKey="change" radius={[0, 4, 4, 0]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.change >= 0 ? '#10b981' : '#f43f5e'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const SectorPerformanceWidget = () => (
    <ErrorBoundary fallback={<GlobalErrorFallback title="Sector Data Unavailable" message="Could not load sector performance." />}>
        <SectorPerformance />
    </ErrorBoundary>
);

export default SectorPerformanceWidget;
