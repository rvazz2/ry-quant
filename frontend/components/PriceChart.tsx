"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    AreaChart, Area, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label
} from 'recharts';
import { getTickerHistory } from '@/lib/api';
import { ChartPoint } from '@/lib/types';
import { Loader2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import axios from 'axios';

interface PriceChartProps {
    symbol: string;
    color?: string;
    height?: number;
    initialData?: ChartPoint[];
    prevClose?: number;
    showEvents?: boolean; // New Prop
}

const RANGES = [
    { label: '1D', period: '1d', interval: '1m' },
    { label: '5D', period: '5d', interval: '15m' },
    { label: '1M', period: '1mo', interval: '1d' },
    { label: '6M', period: '6mo', interval: '1d' },
    { label: 'YTD', period: 'ytd', interval: '1d' },
    { label: '1Y', period: '1y', interval: '1d' },
    { label: '5Y', period: '5y', interval: '1wk' },
    { label: 'MAX', period: 'max', interval: '1mo' },
];

const TYPES = ['area', 'line', 'candle'];

const PriceChart: React.FC<PriceChartProps> = ({ symbol, color = "#22d3ee", height = 400, initialData = [], prevClose, showEvents = false }) => {
    const [data, setData] = useState<ChartPoint[]>(initialData);
    const [range, setRange] = useState(RANGES[0]); // Default 1D
    const [type, setType] = useState('area');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [events, setEvents] = useState<any[]>([]);

    // Fetch data when range or symbol changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError("");
            try {
                const history = await getTickerHistory(symbol, range.period, range.interval);
                if (history && history.length > 0) {
                    setData(history);
                } else {
                    setError("No data available for this range.");
                }
            } catch (err) {
                console.error("Failed to fetch chart data", err);
                setError("Failed to load chart data.");
            } finally {
                setLoading(false);
            }
        };

        if (data.length === 0 || range.label !== '1M') {
            fetchData();
        }
    }, [symbol, range]);

    // Fetch econ events if enabled
    useEffect(() => {
        if (showEvents) {
            axios.get('http://localhost:8000/api/macro/calendar')
                .then(res => setEvents(res.data))
                .catch(err => console.error("Failed to fetch calendar", err));
        }
    }, [showEvents]);

    // Calculate change for the current view
    const stats = useMemo(() => {
        if (!data || data.length < 2) return { change: 0, percent: 0, price: 0 };

        const last = data[data.length - 1].close;
        let baseline = data[0].close; // Default to first point (for 1M, 1Y etc)

        // CRITICAL FIX: For 1D view, the change must be relative to Previous Close, not Open
        if (range.label === '1D' && prevClose) {
            baseline = prevClose;
        }

        const change = last - baseline;
        const percent = (change / baseline) * 100;

        return { change, percent, price: last };
    }, [data, range.label, prevClose]);

    const isPositive = stats.change >= 0;
    const chartColor = isPositive ? '#4ade80' : '#f87171'; // Green or Red

    // Custom Tooltip
    const CustomTooltip = useCallback(({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div className="glass-panel p-3 min-w-[150px]">
                    <p className="text-slate-400 text-xs mb-1 font-mono uppercase tracking-wider">{label}</p>
                    <div className="space-y-1">
                        <p className="text-white font-bold text-lg font-mono">${d.close?.toFixed(2)}</p>
                        {type === 'candle' && (
                            <div className="text-[10px] text-slate-400 grid grid-cols-2 gap-x-4 font-mono">
                                <span>O: {d.open?.toFixed(2)}</span>
                                <span>H: {d.high?.toFixed(2)}</span>
                                <span>L: {d.low?.toFixed(2)}</span>
                                <span>C: {d.close?.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    }, [type]);

    return (
        <div className="w-full space-y-4">
            {/* Header / Controls */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-4">
                <div className="flex items-baseline gap-4">
                    <h3 className="text-3xl font-bold text-white tracking-tighter">
                        ${stats.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <span className={`flex items-center text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'} px-2 py-0.5 rounded bg-white/5 border border-white/5`}>
                        {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                        {stats.change > 0 ? '+' : ''}{stats.change.toFixed(2)} ({stats.percent.toFixed(2)}%)
                    </span>
                    {showEvents && <span className="text-[10px] text-orange-400 flex items-center bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20"><Calendar className="w-3 h-3 mr-1" /> Events On</span>}
                </div>

                <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/5 overflow-x-auto max-w-full no-scrollbar">
                    {RANGES.map((r) => (
                        <button
                            key={r.label}
                            onClick={() => setRange(r)}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all uppercase tracking-wider ${range.label === r.label
                                ? 'bg-slate-700 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Area */}
            <div className="relative glass-panel p-4 min-w-0" style={{ height }}>
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10 backdrop-blur-sm rounded-xl">
                        <Loader2 className="animate-spin text-cyan-400" size={32} />
                    </div>
                )}

                {error ? (
                    <div className="flex items-center justify-center h-full text-rose-400 text-sm">
                        {error}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
                        {type === 'candle' ? (
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="date" hide />
                                <YAxis domain={['auto', 'auto']} orientation="right" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Bar
                                    dataKey={(d) => [d.open, d.close]}
                                    shape={(props: any) => {
                                        const { x, y, width, height, payload } = props;
                                        const isUp = payload.close > payload.open;
                                        // Min height of 1px to ensure visibility
                                        const safeHeight = Math.max(height, 1);
                                        return <rect x={x} y={y} width={width} height={safeHeight} fill={isUp ? '#4ade80' : '#f87171'} rx={1} />;
                                    }}
                                />
                                {showEvents && events.map((event, idx) => (
                                    <ReferenceLine
                                        key={idx}
                                        x={event.date}
                                        stroke="#F59E0B"
                                        strokeDasharray="3 3"
                                        label={{ position: 'insideTopRight', value: event.event, fill: '#F59E0B', fontSize: 10 }}
                                    />
                                ))}
                            </BarChart>
                        ) : type === 'line' ? (
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="date" hide />
                                <YAxis domain={['auto', 'auto']} orientation="right" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="close" stroke={chartColor} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#fff' }} />
                                {showEvents && events.map((event, idx) => (
                                    <ReferenceLine
                                        key={idx}
                                        x={event.date}
                                        stroke="#F59E0B"
                                        strokeDasharray="3 3"
                                        label={{ position: 'insideTopRight', value: event.event, fill: '#F59E0B', fontSize: 10 }}
                                    />
                                ))}
                            </LineChart>
                        ) : (
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                                        <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                                    minTickGap={40}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                    tickFormatter={(val) => {
                                        if (range.label === '1D' || range.label === '5D') {
                                            return val.split(' ')[1]?.substring(0, 5) || val;
                                        }
                                        return new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                    }}
                                />
                                <YAxis
                                    domain={['auto', 'auto']}
                                    tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                                    width={40}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => `$${val.toFixed(0)}`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'white', strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.2 }} />
                                <Area
                                    type="monotone"
                                    dataKey="close"
                                    stroke={chartColor}
                                    fill="url(#colorGradient)"
                                    strokeWidth={2}
                                />
                                {showEvents && events.map((event, idx) => (
                                    <ReferenceLine
                                        key={idx}
                                        x={event.date}
                                        stroke="#F59E0B"
                                        strokeDasharray="3 3"
                                        label={{ position: 'insideTopRight', value: event.event, fill: '#F59E0B', fontSize: 10 }}
                                    />
                                ))}
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                )}

                {/* Type Toggle */}
                <div className="absolute top-4 right-4 flex bg-black/40 rounded-lg p-0.5 border border-white/10 z-10 backdrop-blur-md">
                    {TYPES.map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`px-2 py-1 text-[9px] font-bold rounded uppercase transition-all tracking-wider ${type === t
                                ? 'bg-white/10 text-cyan-400'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default React.memo(PriceChart);
