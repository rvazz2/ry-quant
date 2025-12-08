"use client";

import React, { useState } from 'react';
import { runBacktest } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from 'recharts';

const StrategyChart = React.memo(({ data }: { data: any[] }) => (
    <div className="h-[400px] w-full bg-slate-900/50 rounded-lg p-4 border border-slate-800">
        <h4 className="text-slate-200 font-bold mb-4">Strategy Performance</h4>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <XAxis
                    dataKey="date"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                    minTickGap={30}
                />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                <Legend />
                <Line type="monotone" dataKey="close" stroke="#94a3b8" dot={false} strokeWidth={1} name="Price" />
                <Line type="monotone" dataKey="short_sma" stroke="#22d3ee" dot={false} strokeWidth={1} name="Short SMA" />
                <Line type="monotone" dataKey="long_sma" stroke="#f472b6" dot={false} strokeWidth={1} name="Long SMA" />
            </LineChart>
        </ResponsiveContainer>
    </div>
));
StrategyChart.displayName = 'StrategyChart';

const ReturnsChart = React.memo(({ data }: { data: any[] }) => (
    <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-800">
        <h4 className="text-slate-200 font-bold mb-4">Monthly Returns</h4>
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis
                        dataKey="date"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                    />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                        formatter={(val: number) => [`${(val * 100).toFixed(2)}%`, 'Return']}
                    />
                    <Bar dataKey="return" fill="#3b82f6">
                        {data.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.return >= 0 ? '#4ade80' : '#f87171'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
));
ReturnsChart.displayName = 'ReturnsChart';

const MetricsGrid = React.memo(({ metrics }: { metrics: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Total Return</div>
            <div className={`text-2xl font-bold ${metrics.total_return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {(metrics.total_return * 100).toFixed(2)}%
            </div>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Max Drawdown</div>
            <div className="text-2xl font-bold text-red-400">
                {(metrics.max_drawdown * 100).toFixed(2)}%
            </div>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Win/Loss Ratio</div>
            <div className="text-2xl font-bold text-cyan-400">
                {metrics.win_loss_ratio.toFixed(2)}
            </div>
        </div>
    </div>
));
MetricsGrid.displayName = 'MetricsGrid';

export default function Backtester() {
    const [ticker, setTicker] = useState("SPY");
    const [shortWindow, setShortWindow] = useState(50);
    const [longWindow, setLongWindow] = useState(200);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRun = async () => {
        if (!ticker.trim()) {
            setError("Please enter a ticker symbol");
            return;
        }
        if (shortWindow >= longWindow) {
            setError("Short window must be less than long window");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const result = await runBacktest({ ticker, short_window: shortWindow, long_window: longWindow });
            setData(result);
        } catch (error: any) {
            console.error("Error running backtest", error);
            setError(error.response?.data?.detail || "Failed to run backtest. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel p-6 space-y-6">
            <div className="flex flex-wrap gap-4 items-end border-b border-slate-800 pb-6">
                <div>
                    <label className="block text-xs text-slate-500 mb-1">Ticker</label>
                    <input
                        type="text"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 w-24 focus:outline-none focus:border-cyan-500"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1">Short Window</label>
                    <input
                        type="number"
                        value={shortWindow}
                        onChange={(e) => setShortWindow(parseInt(e.target.value))}
                        className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 w-24 focus:outline-none focus:border-cyan-500"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1">Long Window</label>
                    <input
                        type="number"
                        value={longWindow}
                        onChange={(e) => setLongWindow(parseInt(e.target.value))}
                        className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 w-24 focus:outline-none focus:border-cyan-500"
                    />
                </div>
                <button
                    onClick={handleRun}
                    disabled={loading}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 mb-[1px]"
                >
                    {loading ? 'Backtesting...' : 'Run Strategy'}
                </button>
            </div>

            {data && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <MetricsGrid metrics={data.metrics} />
                    <StrategyChart data={data.chart_data} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ReturnsChart data={data.monthly_returns} />

                        {/* Trade List */}
                        <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-800 overflow-hidden flex flex-col">
                            <h4 className="text-slate-200 font-bold mb-4">Recent Trades</h4>
                            <div className="overflow-y-auto flex-1 custom-scrollbar max-h-64">
                                <table className="w-full text-sm text-left text-slate-400">
                                    <thead className="text-xs text-slate-200 uppercase bg-slate-800 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3 text-right">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.trades.slice().reverse().map((trade: any, idx: number) => (
                                            <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                                                <td className="px-4 py-3">{trade.date}</td>
                                                <td className={`px-4 py-3 font-bold ${trade.type === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>
                                                    {trade.type}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-200">
                                                    ${trade.price.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
