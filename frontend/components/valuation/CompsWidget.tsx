"use client";

import React, { useEffect, useState } from 'react';
import { getComps } from '@/lib/api';
import { ComparableCompany } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Users, AlertCircle } from 'lucide-react';

const CompsWidget = ({ ticker }: { ticker: string }) => {
    const [comps, setComps] = useState<ComparableCompany[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!ticker) return;
        const fetchComps = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getComps(ticker);
                setComps(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load comparable companies.");
            } finally {
                setLoading(false);
            }
        };
        fetchComps();
    }, [ticker]);

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Scanning peer group...</div>;
    if (error) return <div className="p-8 text-center text-rose-400 flex items-center justify-center gap-2"><AlertCircle size={16} />{error}</div>;
    if (comps.length === 0) return null;

    const target = comps.find(c => c.is_target) || comps[0];
    const peers = comps.filter(c => !c.is_target);

    // Calculate Averages
    const avgPE = peers.reduce((acc, c) => acc + (c.pe || 0), 0) / (peers.filter(c => c.pe > 0).length || 1);
    const avgEVEBITDA = peers.reduce((acc, c) => acc + (c.ev_ebitda || 0), 0) / (peers.filter(c => c.ev_ebitda > 0).length || 1);

    // Prepare Chart Data (Premium/Discount)
    const chartData = [
        { metric: "P/E", value: target.pe, benchmark: avgPE, diff: ((target.pe - avgPE) / avgPE) * 100 },
        { metric: "EV/EBITDA", value: target.ev_ebitda, benchmark: avgEVEBITDA, diff: avgEVEBITDA ? ((target.ev_ebitda - avgEVEBITDA) / avgEVEBITDA) * 100 : 0 }
    ].filter(d => d.value > 0 && d.benchmark > 0);

    return (
        <div className="space-y-8">
            <div className="glass-panel p-6">
                <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                    <Users size={20} className="text-purple-400" /> Comparable Analysis
                </h3>

                {/* Table */}
                <div className="overflow-x-auto mb-8">
                    <table className="w-full text-sm text-left">
                        <thead className="text-slate-500 uppercase bg-slate-900/50 border-b border-slate-700">
                            <tr>
                                <th className="px-4 py-3">Company</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3 text-right">Market Cap</th>
                                <th className="px-4 py-3 text-right">P/E</th>
                                <th className="px-4 py-3 text-right">EV/EBITDA</th>
                                <th className="px-4 py-3 text-right">P/S</th>
                                <th className="px-4 py-3 text-right">Margins</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {comps.map((c) => (
                                <tr key={c.symbol} className={c.is_target ? "bg-cyan-900/20" : "hover:bg-slate-800/50"}>
                                    <td className="px-4 py-3 font-medium text-slate-200">
                                        {c.symbol} <span className="text-xs text-slate-500 ml-1">{c.is_target ? "(Target)" : ""}</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">${c.price?.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right text-slate-400">${(c.market_cap / 1e9).toFixed(1)}B</td>
                                    <td className="px-4 py-3 text-right font-mono text-cyan-300">{c.pe > 0 ? c.pe.toFixed(1) + "x" : "-"}</td>
                                    <td className="px-4 py-3 text-right font-mono text-slate-300">{c.ev_ebitda > 0 ? c.ev_ebitda.toFixed(1) + "x" : "-"}</td>
                                    <td className="px-4 py-3 text-right font-mono text-slate-300">{c.price_to_sales?.toFixed(1)}x</td>
                                    <td className="px-4 py-3 text-right font-mono text-slate-300">{(c.profit_margin * 100).toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Relative Valuation Chart */}
                {chartData.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-slate-800 pt-8">
                        <div>
                            <h4 className="text-slate-300 font-bold mb-2">Relative Valuation (Premium/Discount)</h4>
                            <p className="text-xs text-slate-500 mb-4">
                                Determines if {target.symbol} is trading at a premium (bars to right) or discount (bars to left) relative to peer average.
                            </p>
                        </div>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="metric" stroke="#94a3b8" fontSize={12} width={80} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                                        formatter={(val: number) => [`${val.toFixed(1)}%`, 'Premium/Discount']}
                                    />
                                    <ReferenceLine x={0} stroke="#475569" />
                                    <Bar dataKey="diff" radius={[0, 4, 4, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.diff > 0 ? "#f43f5e" : "#10b981"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompsWidget;
