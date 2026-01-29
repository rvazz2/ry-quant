"use client";

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import PriceChart from '../../components/PriceChart';
import MarketNews from '../../components/MarketNews';
import { api, getTickerHistory, checkBackendHealth } from '../../lib/api';
import { Position, TradeHistoryItem } from '../../lib/types';
import SimulatorWatchlist from '@/components/simulator/SimulatorWatchlist';
import OrderForm from '@/components/simulator/OrderForm';
import TradeHistory from '@/components/simulator/TradeHistory';
import { RefreshCw, Wallet, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function SimulatorPage() {
    // --- State ---
    const [ticker, setTicker] = useState('AAPL');
    const [cash, setCash] = useState(100000);
    const [portfolio, setPortfolio] = useState<Position[]>([]);
    const [options, setOptions] = useState<any[]>([]);
    const [history, setHistory] = useState<TradeHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isBackendHealthy, setIsBackendHealthy] = useState(true);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [prevClose, setPrevClose] = useState<number | null>(null);

    // Tab state for bottom section
    const [bottomTab, setBottomTab] = useState<'positions' | 'options' | 'history'>('positions');

    // --- Data Fetching ---

    const fetchPortfolio = useCallback(async () => {
        try {
            const res = await api.get('/simulator/portfolio');
            setCash(res.data.cash);
            setPortfolio(res.data.portfolio);

            const ops = await api.get('/simulator/options');
            setOptions(ops.data.options);

            const hist = await api.get('/simulator/history');
            setHistory(hist.data.history);
        } catch (e) {
            console.error("Failed to load portfolio", e);
        }
    }, []);

    const fetchTickerData = useCallback(async () => {
        setLoading(true);
        try {
            // Check if backend is up
            const health = await checkBackendHealth();
            setIsBackendHealthy(health);

            if (!health) {
                toast.error("Backend is offline. Simulator features limited.");
                setLoading(false);
                return;
            }

            // Get live price
            const details = await api.get(`/market/ticker/${ticker}`);
            if (details.data) {
                setCurrentPrice(details.data.price);
                setPrevClose(details.data.prev_close || details.data.price);
            }
        } catch (error) {
            console.error(error);
            toast.error(`Failed to fetch data for ${ticker}`);
        } finally {
            setLoading(false);
        }
    }, [ticker]);

    // Initial Load
    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]);

    // Update data when ticker changes
    useEffect(() => {
        fetchTickerData();
        const interval = setInterval(fetchTickerData, 60000); // 1 min refresh
        return () => clearInterval(interval);
    }, [fetchTickerData]);


    // --- Actions ---

    const handleExecuteOrder = async (action: 'BUY' | 'SELL', shares: number) => {
        if (!currentPrice) return;
        setLoading(true);
        try {
            const res = await api.post('/simulator/trade', {
                symbol: ticker,
                action,
                shares,
                price: currentPrice
            });

            setCash(res.data.cash);
            setPortfolio(res.data.portfolio);
            toast.success(res.data.message);
            fetchPortfolio(); // Refresh all
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.detail || "Trade failed");
        } finally {
            setLoading(false);
        }
    };

    const handleExecuteOption = async (action: 'BUY' | 'SELL', optionData: any) => {
        setLoading(true);
        try {
            const res = await api.post('/simulator/trade/option', {
                symbol: ticker,
                action,
                ...optionData
            });

            setCash(res.data.cash);
            setOptions(res.data.options);
            toast.success(res.data.message);
            fetchPortfolio();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.detail || "Option Trade failed");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (confirm("Reset paper trading account to $100,000? This cannot be undone.")) {
            try {
                const res = await api.post('/simulator/reset');
                setCash(res.data.cash);
                setPortfolio(res.data.portfolio);
                setHistory([]);
                setOptions([]);
                toast.success("Account reset successfully");
            } catch {
                toast.error("Failed to reset account");
            }
        }
    };

    // Calculates
    const calculateEquity = () => {
        let eq = cash;
        portfolio.forEach(p => {
            // Use current price if available, here we approximate with latest fetch or avg cost if offline
            // Ideally we should fetch live prices for all positions, but for now use avgCost as proxy if live price unknown
            // Or better, just sum up (in a real app, you'd batch fetch all prices)
            eq += p.shares * (p.symbol === ticker && currentPrice ? currentPrice : p.avgCost);
        });
        return eq;
    };


    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto p-4 space-y-4">

                {/* 1. Header & Account Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="glass-panel p-4 flex items-center justify-between col-span-3">
                        <div className="flex items-center gap-8">
                            <div>
                                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Buying Power</div>
                                <div className="text-3xl font-mono font-bold text-white flex items-center gap-2">
                                    <Wallet className="text-emerald-400" />
                                    ${cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>

                            <div className="h-10 w-px bg-slate-700/50"></div>

                            <div>
                                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Equity (Est)</div>
                                <div className="text-3xl font-mono font-bold text-white">
                                    ${calculateEquity().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>

                        {!isBackendHealthy && (
                            <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20">
                                <AlertTriangle size={20} />
                                <span className="font-bold">System Offline</span>
                            </div>
                        )}
                    </div>

                    <button onClick={handleReset} className="glass-panel hover:bg-rose-900/10 transition-colors p-4 flex flex-col items-center justify-center gap-2 group cursor-pointer border-rose-500/10 hover:border-rose-500/50">
                        <RefreshCw className="text-rose-400 group-hover:rotate-180 transition-transform duration-500" size={24} />
                        <span className="text-rose-400 font-bold uppercase text-xs tracking-wider">Reset Account</span>
                    </button>
                </div>

                {/* 2. Main Workspace */}
                <div className="grid grid-cols-12 gap-4 h-[600px]">
                    {/* Left Sidebar: Watchlist */}
                    <div className="col-span-12 md:col-span-2 h-full">
                        <SimulatorWatchlist onSelectTicker={setTicker} />
                    </div>

                    {/* Center: Chart */}
                    <div className="col-span-12 md:col-span-7 h-full flex flex-col gap-4">
                        <div className="glass-panel p-1 flex-1">
                            <PriceChart
                                symbol={ticker}
                                height={350}
                                prevClose={prevClose || undefined}
                            />
                        </div>
                        <div className="glass-panel p-4 flex-1 overflow-y-auto custom-scrollbar">
                            <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">News: {ticker}</h3>
                            <MarketNews symbol={ticker} />
                        </div>
                    </div>

                    {/* Right: Order Form */}
                    <div className="col-span-12 md:col-span-3 h-full">
                        <OrderForm
                            ticker={ticker}
                            currentPrice={currentPrice}
                            isLoading={loading}
                            onExecuteTrade={handleExecuteOrder}
                            onExecuteOption={handleExecuteOption}
                        />
                    </div>
                </div>

                {/* 3. Bottom Tabs: Positions & History */}
                <div className="glass-panel min-h-[400px]">
                    <div className="border-b border-slate-700 flex px-4 pt-2 gap-4">
                        <button
                            onClick={() => setBottomTab('positions')}
                            className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${bottomTab === 'positions' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-500 hover:text-white'}`}
                        >
                            Stock Positions
                        </button>
                        <button
                            onClick={() => setBottomTab('options')}
                            className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${bottomTab === 'options' ? 'border-purple-400 text-purple-400' : 'border-transparent text-slate-500 hover:text-white'}`}
                        >
                            Option Positions
                        </button>
                        <button
                            onClick={() => setBottomTab('history')}
                            className={`pb-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${bottomTab === 'history' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-500 hover:text-white'}`}
                        >
                            History
                        </button>
                    </div>

                    <div className="p-4">
                        {bottomTab === 'positions' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-slate-500 text-xs uppercase border-b border-slate-700">
                                            <th className="py-2 px-4">Symbol</th>
                                            <th className="py-2 px-4 text-right">Shares</th>
                                            <th className="py-2 px-4 text-right">Avg Cost</th>
                                            <th className="py-2 px-4 text-right">Current Price</th>
                                            <th className="py-2 px-4 text-right">Market Value</th>
                                            <th className="py-2 px-4 text-right">Return</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {portfolio.length === 0 ? (
                                            <tr><td colSpan={6} className="py-8 text-center text-slate-500 italic">No active positions</td></tr>
                                        ) : (
                                            portfolio.map((pos) => {
                                                // We don't have real-time stream for all positions yet, so use AvgCost or currentTicker price if matches
                                                const price = pos.symbol === ticker && currentPrice ? currentPrice : pos.avgCost; // Fallback to avgCost to not show wrong data
                                                const mktValue = pos.shares * price;
                                                const gain = (price - pos.avgCost) * pos.shares;
                                                const gainPct = ((price - pos.avgCost) / pos.avgCost) * 100;

                                                return (
                                                    <tr key={pos.symbol} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                                        <td className="py-3 px-4 font-bold text-white cursor-pointer hover:text-cyan-400" onClick={() => setTicker(pos.symbol)}>{pos.symbol}</td>
                                                        <td className="py-3 px-4 text-right font-mono text-slate-300">{pos.shares}</td>
                                                        <td className="py-3 px-4 text-right font-mono text-slate-400 ml-4">${pos.avgCost.toFixed(2)}</td>
                                                        <td className="py-3 px-4 text-right font-mono text-white">${price.toFixed(2)}</td>
                                                        <td className="py-3 px-4 text-right font-mono text-white font-bold">${mktValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                        <td className={`py-3 px-4 text-right font-mono font-bold ${gain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                            {gain >= 0 ? '+' : ''}{gain.toFixed(2)} ({gainPct.toFixed(2)}%)
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {bottomTab === 'options' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {options.length === 0 ? (
                                    <div className="col-span-3 text-center py-8 text-slate-500 italic">No active options contracts</div>
                                ) : (
                                    options.map((opt, idx) => (
                                        <div key={idx} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => setTicker(opt.symbol)}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-bold text-white">{opt.symbol}</div>
                                                <div className={`text-xs font-bold px-2 py-0.5 rounded ${opt.option_type === 'CALL' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                    {opt.option_type}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="text-xl font-mono text-white font-bold">${opt.strike}</div>
                                                <div className="text-xs text-slate-400">{opt.expiry}</div>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                                                <div className="text-sm text-slate-300">{opt.contracts} <span className="text-slate-500 text-xs">contracts</span></div>
                                                <div className="text-sm font-mono text-white">${opt.premium.toFixed(2)} <span className="text-slate-500 text-xs">prem</span></div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {bottomTab === 'history' && (
                            <TradeHistory history={history} />
                        )}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
