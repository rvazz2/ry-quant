"use client";

import React from 'react';
import { DeepResearchData, InsiderTransaction, AnalystRatings, OwnershipData, AdvancedMetrics } from '@/lib/types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Users, PieChart as PieIcon, Crosshair } from 'lucide-react';

export const InsiderWidget = ({ data }: { data: InsiderTransaction[] }) => {
    if (!data || data.length === 0) return <div className="text-slate-500 text-sm">No insider data available.</div>;

    const buys = data.filter(d => d.transactionText.toLowerCase().includes("purchase") || d.transactionText.toLowerCase().includes("buy"));
    const sells = data.filter(d => d.transactionText.toLowerCase().includes("sale") || d.transactionText.toLowerCase().includes("sell"));

    return (
        <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Users size={20} className="text-cyan-400" /> Insider Activity (Last 6 Months)
            </h3>
            <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
                    <div className="text-xs text-emerald-400 uppercase font-bold">Buys</div>
                    <div className="text-xl font-mono text-emerald-300">{buys.length}</div>
                </div>
                <div className="flex-1 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-center">
                    <div className="text-xs text-rose-400 uppercase font-bold">Sells</div>
                    <div className="text-xl font-mono text-rose-300">{sells.length}</div>
                </div>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
                {data.map((tx, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2 last:border-0 hover:bg-slate-800/30 p-2 rounded">
                        <div>
                            <div className="font-bold text-slate-300">{tx.insider}</div>
                            <div className="text-xs text-slate-500">{tx.position} • {tx.date}</div>
                        </div>
                        <div className="text-right">
                            <div className={`font-mono font-bold ${tx.transactionText.includes("Sale") ? "text-rose-400" : "text-emerald-400"}`}>
                                {tx.transactionText.includes("Sale") ? "-" : "+"}{tx.shares.toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-500">${(tx.value / 1e6).toFixed(1)}M</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const AnalystWidget = ({ data }: { data: AnalystRatings }) => {
    if (!data) return null;

    const scoreMap = { "Strong Buy": 5, "Buy": 4, "Hold": 3, "Sell": 2, "Strong Sell": 1 };
    const score = scoreMap[data.consensus] || 3;
    const rotation = (score - 1) * 45 - 90; // Map 1..5 to -90..90 degrees

    return (
        <div className="glass-panel p-6 flex flex-col items-center">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2 w-full">
                <Crosshair size={20} className="text-purple-400" /> Analyst Consensus
            </h3>

            {/* Speedometer (Simplified Visual) */}
            <div className="relative w-48 h-24 mb-4 overflow-hidden">
                <div className="absolute w-40 h-40 rounded-full border-[12px] border-slate-700 left-4 top-4 border-b-0 border-l-0 border-r-0"
                    style={{
                        background: "conic-gradient(from 180deg at 50% 100%, #f43f5e 0deg, #fbbf24 70deg, #10b981 180deg)",
                        clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
                        height: "200%"
                    }}
                />
                <div className="absolute bottom-0 left-1/2 w-1 h-20 bg-white origin-bottom rounded-full transition-transform duration-1000 ease-out"
                    style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
                />
                <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-slate-200 rounded-full -translate-x-1/2 translate-y-1/2 border-2 border-slate-900" />
            </div>

            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-6">
                {data.consensus}
            </div>

            {/* Breakdown Bar */}
            <div className="w-full flex h-2 rounded-full overflow-hidden bg-slate-800">
                <div style={{ width: `${(data.breakdown.strongBuy / 30) * 100}%` }} className="bg-emerald-500" />
                <div style={{ width: `${(data.breakdown.buy / 30) * 100}%` }} className="bg-emerald-400/70" />
                <div style={{ width: `${(data.breakdown.hold / 30) * 100}%` }} className="bg-yellow-400" />
                <div style={{ width: `${(data.breakdown.sell / 30) * 100}%` }} className="bg-rose-400/70" />
                <div style={{ width: `${(data.breakdown.strongSell / 30) * 100}%` }} className="bg-rose-500" />
            </div>
            <div className="flex justify-between w-full text-[10px] text-slate-500 mt-2 uppercase font-bold">
                <span>Sell</span>
                <span>Hold</span>
                <span>Buy</span>
            </div>
        </div>
    );
};

export const OwnershipWidget = ({ data }: { data: OwnershipData }) => {
    if (!data) return null;

    const pieData = [
        { name: 'Institutions', value: data.institutions, color: '#8b5cf6' }, // Purple
        { name: 'Insiders', value: data.insiders, color: '#f43f5e' }, // Rose
        { name: 'Public', value: data.public, color: '#06b6d4' } // Cyan 
    ];

    return (
        <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <PieIcon size={20} className="text-yellow-400" /> Ownership Structure
            </h3>
            <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
                                if (percent === undefined || midAngle === undefined) return null;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                return percent > 0.05 ? (
                                    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold pointer-events-none">
                                        {`${(percent * 100).toFixed(0)}%`}
                                    </text>
                                ) : null;
                            }}
                            labelLine={false}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.1)" strokeWidth={2} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                            itemStyle={{ color: 'white', fontWeight: 'bold' }}
                            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Ownership']}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            formatter={(value, entry: any) => <span className="text-slate-300 font-medium ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

interface AdvancedMetricsProps {
    data: AdvancedMetrics;
}

export const AdvancedMetricsWidget = ({ data }: AdvancedMetricsProps) => {
    if (!data) return null;
    return (
        <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-orange-400" /> Advanced Valuation
            </h3>
            <div className="space-y-4">
                <MetricRow label="PEG Ratio" value={data.pegRatio?.toFixed(2)} desc="< 1.0 is undervalued" good={data.pegRatio < 1} />
                <MetricRow label="Short Ratio" value={data.shortRatio?.toFixed(2)} desc="Days to cover" />
                <MetricRow label="Short % Float" value={(data.shortPercentOfFloat * 100)?.toFixed(1) + "%"} desc="Bearish sentiment" inverse />
                <MetricRow label="Price / Book" value={data.priceToBook?.toFixed(2)} desc="Asset value" />
            </div>
        </div>
    );
};

const MetricRow = ({ label, value, desc, good, inverse }: { label: string, value: string, desc: string, good?: boolean, inverse?: boolean }) => {
    let color = "text-slate-200";
    if (good !== undefined) {
        color = good ? "text-emerald-400" : "text-yellow-400";
    }
    // High short float is "bad" (risky) or "good" (squeeze)? Usually red.
    if (inverse) color = "text-rose-400";

    return (
        <div className="flex justify-between items-center bg-slate-800/30 p-2 rounded">
            <div>
                <div className="text-sm font-bold text-slate-300">{label}</div>
                <div className="text-[10px] text-slate-500">{desc}</div>
            </div>
            <div className={`font-mono font-bold ${color}`}>{value || "-"}</div>
        </div>
    )
};
