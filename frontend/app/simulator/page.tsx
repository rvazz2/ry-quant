"use client";

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getCompanyInfo } from '@/lib/api';
import { api } from '@/lib/api';
import { Search, Activity, AlertCircle, RotateCcw, TrendingUp, TrendingDown, Download, ChevronDown, ChevronUp, Zap, Award, BarChart3 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const PriceChart = dynamic(() => import('@/components/PriceChart'), { ssr: false, loading: () => <div className="h-64 bg-slate-900 animate-pulse rounded" /> });

interface Position {
    symbol: string;
    shares: number;
    avgCost: number;
    currentPrice?: number;
}

interface TradeHistory {
    timestamp: string;
    action: string;
    symbol: string;
    shares: number;
    price: number;
    total: number;
}

interface Analytics {
    total_equity: number;
    total_return: number;
    return_pct: number;
    total_trades: number;
    buy_trades: number;
    sell_trades: number;
    best_performer: { symbol: string; gain_pct: number } | null;
    worst_performer: { symbol: string; gain_pct: number } | null;
}

export default function SimulatorPage() {
    // Simulator State
    const [cash, setCash] = useState(100000);
    const [portfolio, setPortfolio] = useState<Position[]>([]);
    const [history, setHistory] = useState<TradeHistory[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);

    // Trading State
    const [ticker, setTicker] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sim_last_ticker') || 'AAPL';
        }
        return 'AAPL';
    });
    const [shares, setShares] = useState(10);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [priceData, setPriceData] = useState<any>([]);
    const [prevClose, setPrevClose] = useState<number | undefined>(undefined);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // UI State
    const [showHistory, setShowHistory] = useState(true);
    const [sortBy, setSortBy] = useState<'symbol' | 'value' | 'gain'>('value');

    // Load initial data
    useEffect(() => {
        fetchTickerData(ticker);
        fetchPortfolio();
        fetchHistory();
        fetchAnalytics();
    }, []);

    // Auto-refresh portfolio prices every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refreshPortfolioValues();
        }, 60000);
        return () => clearInterval(interval);
    }, [portfolio]);

    // Save last viewed ticker
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('sim_last_ticker', ticker);
        }
    }, [ticker]);

    const fetchPortfolio = async () => {
        try {
            const res = await api.get('/simulator/portfolio');
            setCash(res.data.cash);
            setPortfolio(res.data.portfolio);
        } catch (e) {
            console.error("Failed to load portfolio", e);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get('/simulator/history');
            const historyData = res.data.history || [];
            setHistory(historyData);
        } catch (e) {
            console.error("Failed to load history", e);
            setHistory([]);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/simulator/analytics');
            setAnalytics(res.data);
        } catch (e) {
            console.error("Failed to load analytics", e);
        }
    };

    const fetchTickerData = async (symbol: string) => {
        setIsLoading(true);
        setError('');
        try {
            const data = await getCompanyInfo(symbol);
            if (data) {
                setCurrentPrice(data.current_price ?? null);
                setPriceData(data.chart_data || []);
                setPrevClose(data.prev_close);
            } else {
                setError('Ticker not found');
            }
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExecuteOrder = async (side: 'BUY' | 'SELL') => {
        if (!currentPrice) return;

        const cost = shares * currentPrice;

        // Confirmation for large trades
        if (cost > 10000) {
            if (!confirm(`Confirm ${side} order: ${shares} shares of ${ticker} for $${cost.toLocaleString()}?`)) {
                return;
            }
        }

        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const res = await api.post('/simulator/trade', {
                symbol: ticker,
                action: side,
                shares: shares,
                price: currentPrice
            });
            setCash(res.data.cash);
            setPortfolio(res.data.portfolio);
            setSuccessMessage(res.data.message);

            // Refresh data
            refreshPortfolioValues(res.data.portfolio);
            fetchHistory();
            fetchAnalytics();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Trade failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickTrade = async (symbol: string, action: 'BUY' | 'SELL', quickShares: number) => {
        try {
            const data = await getCompanyInfo(symbol);
            if (!data.current_price) return;

            const res = await api.post('/simulator/trade', {
                symbol: symbol,
                action: action,
                shares: quickShares,
                price: data.current_price
            });

            setCash(res.data.cash);
            setPortfolio(res.data.portfolio);
            setSuccessMessage(res.data.message);
            refreshPortfolioValues(res.data.portfolio);
            fetchHistory();
            fetchAnalytics();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Quick trade failed');
        }
    };

    const handleReset = async () => {
        if (confirm("Are you sure you want to reset your portfolio? This cannot be undone.")) {
            try {
                const res = await api.post('/simulator/reset');
                setCash(res.data.cash);
                setPortfolio(res.data.portfolio);
                setHistory([]);
                fetchAnalytics();
            } catch (e) {
                console.error("Failed to reset", e);
            }
        }
    };

    const refreshPortfolioValues = async (currentPortfolio: Position[] = portfolio) => {
        try {
            const updatedPortfolio = await Promise.all(currentPortfolio.map(async (pos) => {
                try {
                    const data = await getCompanyInfo(pos.symbol);
                    return { ...pos, currentPrice: data.current_price ?? pos.currentPrice };
                } catch (e) {
                    return pos;
                }
            }));
            setPortfolio(updatedPortfolio);
        } catch (err) {
            console.error("Failed to refresh portfolio", err);
        }
    };

    const refreshPortfolio = () => refreshPortfolioValues();

    const downloadHistory = () => {
        const csv = [
            ['Timestamp', 'Action', 'Symbol', 'Shares', 'Price', 'Total'],
            ...history.map(t => [
                new Date(t.timestamp).toLocaleString(),
                t.action,
                t.symbol,
                t.shares,
                t.price.toFixed(2),
                t.total.toFixed(2)
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trade_history_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Prevent shortcuts when typing in input
            if ((e.target as HTMLElement).tagName === 'INPUT') {
                if (e.key === 'Enter' && (e.target as HTMLInputElement).value && ticker) {
                    fetchTickerData(ticker);
                }
                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                if (currentPrice) handleExecuteOrder('BUY');
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (currentPrice) handleExecuteOrder('SELL');
            }
            if (e.key === 'r' || e.key === 'R') {
                refreshPortfolio();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentPrice, ticker, shares]);

    // Calculate Portfolio Value
    const portfolioValue = portfolio.reduce((acc, pos) => acc + (pos.shares * (pos.currentPrice || pos.avgCost)), 0);
    const totalEquity = cash + portfolioValue;
    const totalReturn = totalEquity - 100000;
    const returnPct = (totalReturn / 100000) * 100;

    // Sort portfolio
    const sortedPortfolio = [...portfolio].sort((a, b) => {
        if (sortBy === 'symbol') return a.symbol.localeCompare(b.symbol);
        if (sortBy === 'value') {
            const aVal = a.shares * (a.currentPrice || a.avgCost);
            const bVal = b.shares * (b.currentPrice || b.avgCost);
            return bVal - aVal;
        }
        if (sortBy === 'gain') {
            const aGain = ((a.currentPrice || a.avgCost) - a.avgCost) / a.avgCost;
            const bGain = ((b.currentPrice || b.avgCost) - b.avgCost) / b.avgCost;
            return bGain - aGain;
        }
        return 0;
    });

    // Prepare pie chart data
    const pieData = portfolio.map(pos => ({
        name: pos.symbol,
        value: pos.shares * (pos.currentPrice || pos.avgCost),
        percentage: ((pos.shares * (pos.currentPrice || pos.avgCost)) / portfolioValue) * 100
    }));

    const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6 pb-20">
                {/* Header */}
                <div className="glass-panel p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Activity className="text-cyan-400" /> Paper Trading Simulator
                            </h1>
                            <p className="text-slate-400 text-sm mt-1">Practice trading with $100,000 virtual cash.</p>
                            <div className="text-xs text-slate-500 mt-2">
                                ⌨️ Shortcuts: Enter (load) • Ctrl+B (buy) • Ctrl+S (sell) • R (refresh)
                            </div>
                        </div>
                        <button onClick={handleReset} className="text-xs text-rose-500 hover:text-rose-400 flex items-center gap-1 border border-rose-500/30 px-3 py-1.5 rounded hover:bg-rose-500/10 transition-colors">
                            <RotateCcw size={12} /> Reset Account
                        </button>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {successMessage && (
                    <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm p-3 rounded animate-in slide-in-from-top">
                        ✓ {successMessage}
                    </div>
                )}

                {/* Account Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="glass-panel p-4">
                        <div className="text-xs text-slate-500 uppercase mb-1">Total Equity</div>
                        <div className="text-2xl font-mono font-bold text-white">${totalEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </div>
                    <div className="glass-panel p-4">
                        <div className="text-xs text-slate-500 uppercase mb-1">Buying Power</div>
                        <div className="text-2xl font-mono font-bold text-emerald-400">${cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </div>
                    <div className="glass-panel p-4">
                        <div className="text-xs text-slate-500 uppercase mb-1">Total P&L</div>
                        <div className={`text-2xl font-mono font-bold ${totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {totalReturn >= 0 ? '+' : ''}${totalReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({returnPct.toFixed(2)}%)
                        </div>
                    </div>
                    <div className="glass-panel p-4">
                        <div className="text-xs text-slate-500 uppercase mb-1">Total Trades</div>
                        <div className="text-2xl font-mono font-bold text-cyan-400">{analytics?.total_trades || 0}</div>
                    </div>
                </div>

                {/* Performance Analytics */}
                {analytics && analytics.total_trades > 0 && (
                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="text-cyan-400" size={20} />
                            Performance Analytics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <div className="text-xs text-slate-400 mb-1">Buy Trades</div>
                                <div className="text-xl font-bold text-emerald-400">{analytics.buy_trades}</div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <div className="text-xs text-slate-400 mb-1">Sell Trades</div>
                                <div className="text-xl font-bold text-rose-400">{analytics.sell_trades}</div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                    <Award className="text-green-400" size={14} />
                                    Best Performer
                                </div>
                                <div className="text-xl font-bold text-green-400">
                                    {analytics.best_performer ? `${analytics.best_performer.symbol} +${analytics.best_performer.gain_pct.toFixed(1)}%` : 'N/A'}
                                </div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                    <TrendingDown className="text-red-400" size={14} />
                                    Worst Performer
                                </div>
                                <div className="text-xl font-bold text-red-400">
                                    {analytics.worst_performer ? `${analytics.worst_performer.symbol} ${analytics.worst_performer.gain_pct.toFixed(1)}%` : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart & Order Entry */}
                    <div className="col-span-1 lg:col-span-2 space-y-6">
                        <div className="glass-panel p-6 h-[500px] flex flex-col">
                            <div className="flex gap-4 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        value={ticker}
                                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                                        onKeyDown={(e) => e.key === 'Enter' && fetchTickerData(ticker)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded pl-10 pr-4 py-2 text-white font-mono uppercase focus:border-cyan-500 outline-none"
                                        placeholder="Enter Ticker (e.g. NVDA)"
                                    />
                                </div>
                                <button
                                    onClick={() => fetchTickerData(ticker)}
                                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded transition-colors"
                                >
                                    Load
                                </button>
                            </div>
                            <div className="flex-1 bg-slate-900/50 rounded border border-slate-800 relative min-h-0">
                                {isLoading ? (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 animate-pulse">Fetching Market Data...</div>
                                ) : (
                                    <PriceChart symbol={ticker} initialData={priceData} prevClose={prevClose} />
                                )}
                            </div>
                        </div>

                        {/* Trade History */}
                        <div className="glass-panel p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Activity className="text-cyan-400" size={20} />
                                    Trade History ({history.length})
                                </h3>
                                <div className="flex gap-2">
                                    {history.length > 0 && (
                                        <button onClick={downloadHistory} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                                            <Download size={14} /> Export CSV
                                        </button>
                                    )}
                                    <button onClick={() => setShowHistory(!showHistory)} className="text-xs text-slate-400 hover:text-white">
                                        {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                </div>
                            </div>
                            {showHistory && (
                                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                                    {history.length === 0 ? (
                                        <div className="text-center text-slate-600 py-4 italic text-sm">No trades yet.</div>
                                    ) : (
                                        [...history].reverse().slice(0, 50).map((trade, idx) => (
                                            <div key={idx} className="bg-slate-900/50 p-3 rounded border border-slate-800 flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className={`px-2 py-1 rounded text-xs font-bold ${trade.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                        {trade.action}
                                                    </div>
                                                    <div>
                                                        <div className="font-mono font-bold text-white">{trade.symbol}</div>
                                                        <div className="text-xs text-slate-500">{new Date(trade.timestamp).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-mono text-white">{trade.shares} shs @ ${trade.price.toFixed(2)}</div>
                                                    <div className="text-xs text-slate-400">${trade.total.toLocaleString()}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-span-1 space-y-6">
                        {/* Order Execution */}
                        <div className="glass-panel p-6">
                            <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Execute Order</h3>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded mb-4 flex items-center gap-2">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Symbol</span>
                                    <span className="font-mono font-bold text-xl text-white">{ticker}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Market Price</span>
                                    <span className="font-mono font-bold text-xl text-cyan-400">${currentPrice?.toFixed(2) || '---'}</span>
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-500 uppercase mb-1">Quantity (Shares)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={shares}
                                        onChange={(e) => setShares(Number(e.target.value))}
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white font-mono text-lg text-right"
                                    />
                                </div>

                                <div className="flex justify-between items-center py-2 border-t border-slate-800">
                                    <span className="text-slate-400">Estimated Cost</span>
                                    <span className="font-mono font-bold text-white">${(shares * (currentPrice || 0)).toLocaleString()}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <button
                                        onClick={() => handleExecuteOrder('BUY')}
                                        disabled={!currentPrice || isLoading}
                                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded shadow-lg shadow-emerald-900/20 transition-all hover:scale-105"
                                    >
                                        BUY
                                    </button>
                                    <button
                                        onClick={() => handleExecuteOrder('SELL')}
                                        disabled={!currentPrice || isLoading}
                                        className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded shadow-lg shadow-rose-900/20 transition-all hover:scale-105"
                                    >
                                        SELL
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Portfolio Allocation Pie Chart */}
                        {portfolio.length > 0 && (
                            <div className="glass-panel p-6">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Portfolio Allocation</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                                formatter={(value: number) => `$${value.toLocaleString()}`}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-2 space-y-1">
                                    {pieData.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                <span className="font-mono text-white">{item.name}</span>
                                            </div>
                                            <span className="text-slate-400">{item.percentage.toFixed(1)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Holdings */}
                        <div className="glass-panel p-4 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Positions</h3>
                                <div className="flex gap-2 items-center">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="text-xs bg-slate-800 text-slate-400 border border-slate-700 rounded px-2 py-1"
                                    >
                                        <option value="value">By Value</option>
                                        <option value="gain">By Gain</option>
                                        <option value="symbol">By Symbol</option>
                                    </select>
                                    <button onClick={refreshPortfolio} className="text-xs text-cyan-400 hover:text-cyan-300">Refresh</button>
                                </div>
                            </div>
                            <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
                                {sortedPortfolio.length === 0 ? (
                                    <div className="text-center text-slate-600 py-8 italic">No positions yet.</div>
                                ) : (
                                    sortedPortfolio.map((pos) => {
                                        const isShort = pos.shares < 0;
                                        const shares = Math.abs(pos.shares);
                                        const currentPrice = pos.currentPrice || 0;

                                        // Market Value
                                        // If Long: Shares * Price
                                        // If Short: Liability = Shares * Price (Displayed as positive liability usually, or negative value)
                                        // For UI consistency, let's show the "Value" of the position as signed.
                                        const marketVal = pos.shares * currentPrice;

                                        // Cost Basis
                                        // If Long: Shares * AvgCost
                                        // If Short: -Shares * AvgCost (The proceeds we got) -> displayed as signed
                                        const costBasis = pos.shares * pos.avgCost;

                                        // Gain
                                        // Long: Market - Cost
                                        // Short: Cost - Market (Entry - Current) * Shares? 
                                        // Actually: (EntryPrice - CurrentPrice) * Shares
                                        // Existing Math: 
                                        // gain = marketVal - costBasis
                                        // If Short: (-10 * 80) - (-10 * 100) = -800 - (-1000) = -800 + 1000 = +200.
                                        // So the Math holds up!
                                        const gain = marketVal - costBasis;

                                        // Gain %
                                        // Long: Gain / CostBasis
                                        // Short: Gain / |CostBasis| (Return on exposure/margin used?)
                                        // Usually Short Return = (Entry - Current) / Entry
                                        const gainPct = isShort
                                            ? ((pos.avgCost - currentPrice) / pos.avgCost) * 100
                                            : (gain / costBasis) * 100;

                                        return (
                                            <div key={pos.symbol} className={`p-3 rounded border ${isShort ? 'bg-rose-900/10 border-rose-900/30' : 'bg-slate-900/50 border-slate-800'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="font-bold text-white flex items-center gap-2">
                                                            {pos.symbol}
                                                            {isShort && <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Short</span>}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {shares} shs @ ${pos.avgCost.toFixed(2)}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-mono text-white">${Math.abs(marketVal).toLocaleString()} {isShort && <span className="text-slate-500 text-[10px]">(Liab)</span>}</div>
                                                        <div className={`text-xs font-bold ${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {gain >= 0 ? '+' : ''}${gain.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({gainPct.toFixed(1)}%)
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleQuickTrade(pos.symbol, 'BUY', 10)}
                                                        className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs py-1.5 rounded border border-emerald-500/30 transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <Zap size={12} /> {isShort ? 'Cover 10' : 'Buy 10'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            // If Short: We are adding to short, so just Sell 10 (or whatever amount).
                                                            // If Long: We are selling to close, so max is current shares.
                                                            const sharesToSell = isShort ? 10 : Math.min(10, pos.shares);
                                                            handleQuickTrade(pos.symbol, 'SELL', sharesToSell);
                                                        }}
                                                        className="flex-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs py-1.5 rounded border border-rose-500/30 transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <Zap size={12} /> {isShort ? 'Short More 10' : 'Sell 10'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
