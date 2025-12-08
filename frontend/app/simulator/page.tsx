"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getCompanyInfo } from '@/lib/api';
import { api } from '@/lib/api';
import { Search, Activity, AlertCircle, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';

const PriceChart = dynamic(() => import('@/components/PriceChart'), { ssr: false, loading: () => <div className="h-64 bg-slate-900 animate-pulse rounded" /> });

interface Position {
    symbol: string;
    shares: number;
    avgCost: number;
    currentPrice?: number; // Optional as it comes from live data, not DB
}

export default function SimulatorPage() {
    // Simulator State
    const [cash, setCash] = useState(100000);
    const [portfolio, setPortfolio] = useState<Position[]>([]);

    // Trading State
    const [ticker, setTicker] = useState('AAPL');
    const [shares, setShares] = useState(10);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [priceData, setPriceData] = useState<any>([]);
    const [prevClose, setPrevClose] = useState<number | undefined>(undefined);
    const [error, setError] = useState('');

    // Load initial data
    useEffect(() => {
        fetchTickerData(ticker);
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const res = await api.get('/simulator/portfolio');
            setCash(res.data.cash);
            setPortfolio(res.data.portfolio);
        } catch (e) {
            console.error("Failed to load portfolio", e);
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
        setIsLoading(true);
        try {
            const res = await api.post('/simulator/trade', {
                symbol: ticker,
                action: side,
                shares: shares,
                price: currentPrice
            });
            setCash(res.data.cash);
            setPortfolio(res.data.portfolio);
            setError('');
            // Refresh prices after trade to show correct P&L
            refreshPortfolioValues(res.data.portfolio);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Trade failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async () => {
        if (confirm("Are you sure you want to reset your portfolio? This cannot be undone.")) {
            try {
                const res = await api.post('/simulator/reset');
                setCash(res.data.cash);
                setPortfolio(res.data.portfolio);
            } catch (e) {
                console.error("Failed to reset", e);
            }
        }
    };

    // Refresh Portfolio Prices
    const refreshPortfolioValues = async (currentPortfolio: Position[] = portfolio) => {
        // setIsLoading(true); // Don't block UI for price partial updates
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

    // Explicit wrapper for button click
    const refreshPortfolio = () => refreshPortfolioValues();

    // Calculate Portfolio Value
    const portfolioValue = portfolio.reduce((acc, pos) => acc + (pos.shares * (pos.currentPrice || pos.avgCost)), 0);
    const totalEquity = cash + portfolioValue;
    const totalReturn = totalEquity - 100000;
    const returnPct = (totalReturn / 100000) * 100;

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 1. Account Summary Card */}
                    <div className="col-span-1 lg:col-span-3 glass-panel p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Activity className="text-cyan-400" /> Paper Trading Simulator
                            </h1>
                            <div className="flex items-center gap-2">
                                <button onClick={handleReset} className="text-xs text-rose-500 hover:text-rose-400 flex items-center gap-1 border border-rose-500/30 px-2 py-1 rounded hover:bg-rose-500/10 transition-colors">
                                    <RotateCcw size={12} /> Reset Acct
                                </button>
                            </div>
                            <p className="text-slate-400 text-sm">Practice trading with $100,000 virtual cash.</p>
                        </div>
                        <div className="flex bg-slate-900/50 rounded-lg border border-slate-700 p-4 gap-8">
                            <div>
                                <div className="text-xs text-slate-500 uppercase">Total Equity</div>
                                <div className="text-2xl font-mono font-bold text-white">${totalEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 uppercase">Buying Power</div>
                                <div className="text-2xl font-mono font-bold text-emerald-400">${cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 uppercase">Total P&L</div>
                                <div className={`text-2xl font-mono font-bold ${totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {totalReturn >= 0 ? '+' : ''}{totalReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({returnPct.toFixed(2)}%)
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Order Entry & Chart */}
                    <div className="col-span-1 lg:col-span-2 space-y-6">
                        <div className="glass-panel p-6 h-[500px] flex flex-col">
                            {/* Search Bar */}
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

                            {/* Chart Area */}
                            <div className="flex-1 bg-slate-900/50 rounded border border-slate-800 relative min-h-0">
                                {isLoading ? (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 animate-pulse">Fetching Market Data...</div>
                                ) : (
                                    <PriceChart symbol={ticker} initialData={priceData} prevClose={prevClose} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. Trade Execution Panel */}
                    <div className="col-span-1 space-y-6">
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
                                        disabled={!currentPrice}
                                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                                    >
                                        BUY
                                    </button>
                                    <button
                                        onClick={() => handleExecuteOrder('SELL')}
                                        disabled={!currentPrice}
                                        className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2"
                                    >
                                        SELL
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Holdings List */}
                        <div className="glass-panel p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Positions</h3>
                                <button onClick={refreshPortfolio} className="text-xs text-cyan-400 hover:text-cyan-300">Refresh Prices</button>
                            </div>
                            <div className="space-y-2 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                                {portfolio.length === 0 ? (
                                    <div className="text-center text-slate-600 py-8 italic">No positions yet.</div>
                                ) : (
                                    portfolio.map((pos) => {
                                        const marketVal = pos.shares * (pos.currentPrice || 0);
                                        const costBasis = pos.shares * pos.avgCost;
                                        const gain = marketVal - costBasis;
                                        const gainPct = (gain / costBasis) * 100;

                                        return (
                                            <div key={pos.symbol} className="bg-slate-900/50 p-3 rounded border border-slate-800 flex justify-between items-center">
                                                <div>
                                                    <div className="font-bold text-white">{pos.symbol}</div>
                                                    <div className="text-xs text-slate-500">{pos.shares} shs @ ${pos.avgCost.toFixed(2)}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-mono text-white">${marketVal.toLocaleString()}</div>
                                                    <div className={`text-xs font-bold ${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {gain >= 0 ? '+' : ''}{gain.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({gainPct.toFixed(1)}%)
                                                    </div>
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
