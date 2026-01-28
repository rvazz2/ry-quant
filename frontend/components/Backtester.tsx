"use client";

import React, { useState } from 'react';
import { runBacktest } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from 'recharts';
import { Download, Rocket, TrendingUp, Calendar, Zap } from 'lucide-react';

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

const MetricsGrid = React.memo(({ metrics }: { metrics: any }) => {
    // Calculate Sharpe Ratio (simplified - assuming risk-free rate of 2%)
    const sharpeRatio = ((metrics.total_return - 0.02) / (metrics.volatility || 0.15)).toFixed(2);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center hover:border-cyan-500/30 transition-all">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Total Return</div>
                <div className={`text-2xl font-bold ${metrics.total_return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(metrics.total_return * 100).toFixed(2)}%
                </div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center hover:border-rose-500/30 transition-all">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Max Drawdown</div>
                <div className="text-2xl font-bold text-red-400">
                    {(metrics.max_drawdown * 100).toFixed(2)}%
                </div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center hover:border-cyan-500/30 transition-all">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Win/Loss Ratio</div>
                <div className="text-2xl font-bold text-cyan-400">
                    {metrics.win_loss_ratio.toFixed(2)}
                </div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center hover:border-purple-500/30 transition-all">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Sharpe Ratio</div>
                <div className="text-2xl font-bold text-purple-400">
                    {sharpeRatio}
                </div>
            </div>
        </div>
    );
});
MetricsGrid.displayName = 'MetricsGrid';

interface StrategyPreset {
    name: string;
    shortWindow: number;
    longWindow: number;
    description: string;
}

const STRATEGY_PRESETS: StrategyPreset[] = [
    { name: 'Fast', shortWindow: 20, longWindow: 50, description: 'Quick reactions, more trades' },
    { name: 'Medium', shortWindow: 50, longWindow: 200, description: 'Balanced approach' },
    { name: 'Slow', shortWindow: 100, longWindow: 300, description: 'Long-term trends' },
    { name: 'Ultra-Fast', shortWindow: 10, longWindow: 30, description: 'Day trading style' }
];

export default function Backtester() {
    const [ticker, setTicker] = useState("SPY");
    const [shortWindow, setShortWindow] = useState(50);
    const [longWindow, setLongWindow] = useState(200);
    const [dateRange, setDateRange] = useState('1y'); // 1y, 2y, 5y, max
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

    const applyPreset = (preset: StrategyPreset) => {
        setShortWindow(preset.shortWindow);
        setLongWindow(preset.longWindow);
    };

    const exportResults = () => {
        if (!data) return;

        const csvContent = [
            ['Date', 'Close', 'Short SMA', 'Long SMA'],
            ...data.chart_data.map((row: any) => [
                row.date,
                row.close,
                row.short_sma,
                row.long_sma
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backtest_${ticker}_${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="glass-panel p-6 space-y-6">
            {/* Strategy Presets */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <Zap size={18} className="text-yellow-400" />
                    <span className="text-sm font-bold text-slate-300">Quick Presets:</span>
                </div>
                {STRATEGY_PRESETS.map(preset => (
                    <button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-yellow-500/50 rounded-lg text-sm font-medium text-slate-300 transition-all"
                        title={preset.description}
                    >
                        {preset.name} ({preset.shortWindow}/{preset.longWindow})
                    </button>
                ))}
            </div>

            {/* Main Controls */}
            <div className="flex flex-wrap gap-4 items-end border-b border-slate-800 pb-6">
                <div>
                    <label className="block text-xs text-slate-500 mb-1 flex items-center gap-1">
                        <TrendingUp size={12} />
                        Ticker
                    </label>
                    <input
                        type="text"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                        placeholder="SPY"
                        className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 w-28 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1">Short Window</label>
                    <input
                        type="number"
                        value={shortWindow}
                        onChange={(e) => setShortWindow(parseInt(e.target.value))}
                        min="1"
                        className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 w-24 focus:outline-none focus:border-cyan-500"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1">Long Window</label>
                    <input
                        type="number"
                        value={longWindow}
                        onChange={(e) => setLongWindow(parseInt(e.target.value))}
                        min="2"
                        className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 w-24 focus:outline-none focus:border-cyan-500"
                    />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 mb-1 flex items-center gap-1">
                        <Calendar size={12} />
                        Date Range
                    </label>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 w-24 focus:outline-none focus:border-cyan-500"
                    >
                        <option value="1y">1 Year</option>
                        <option value="2y">2 Years</option>
                        <option value="5y">5 Years</option>
                        <option value="max">Max</option>
                    </select>
                </div>
                <button
                    onClick={handleRun}
                    disabled={loading}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2 rounded text-sm font-bold transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2"
                >
                    <Rocket size={16} />
                    {loading ? 'Backtesting...' : 'Run Strategy'}
                </button>
                {data && (
                    <button
                        onClick={exportResults}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 text-emerald-400 px-4 py-2 rounded text-sm font-medium transition-all flex items-center gap-2"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-rose-500/10 border border-rose-500/50 rounded-lg p-4 text-rose-400 text-sm">
                    {error}
                </div>
            )}

            {data && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <MetricsGrid metrics={data.metrics} />
                    <StrategyChart data={data.chart_data} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ReturnsChart data={data.monthly_returns} />

                        {/* Trade List */}
                        <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-800 overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-slate-200 font-bold">Recent Trades</h4>
                                <span className="text-xs text-slate-500">
                                    {data.trades.length} total trades
                                </span>
                            </div>
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
                                            <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
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

                    {/* Strategy Summary */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                            <Rocket size={20} className="text-blue-400" />
                            Strategy Summary
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                            <div>
                                <span className="text-slate-500">Symbol:</span>{' '}
                                <span className="font-mono font-bold text-cyan-400">{ticker}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">Strategy:</span>{' '}
                                <span className="font-medium">SMA Crossover ({shortWindow}/{longWindow})</span>
                            </div>
                            <div>
                                <span className="text-slate-500">Total Trades:</span>{' '}
                                <span className="font-medium">{data.trades.length}</span>
                            </div>
                            <div>
                                <span className="text-slate-500">Win Rate:</span>{' '}
                                <span className="font-medium text-emerald-400">
                                    {((data.metrics.win_loss_ratio / (1 + data.metrics.win_loss_ratio)) * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
