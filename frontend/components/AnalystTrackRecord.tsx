"use client";

import React, { useState, useEffect } from 'react';
import { getAnalystRecord, logTrade, logOptionTrade, getOptionDates } from '@/lib/api';
import { Trophy, TrendingUp, History, PlusCircle, Filter } from 'lucide-react';

const AnalystTrackRecord = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [tradeType, setTradeType] = useState("STOCK"); // STOCK or OPTION
    const [filterType, setFilterType] = useState("ALL"); // ALL, STOCK, OPTION

    // Stock Form State
    const [ticker, setTicker] = useState("");
    const [action, setAction] = useState("BUY");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [rationale, setRationale] = useState("");

    // Option Form State
    const [optionType, setOptionType] = useState("CALL");
    const [strike, setStrike] = useState("");
    const [expiry, setExpiry] = useState("");
    const [contracts, setContracts] = useState("");
    const [premium, setPremium] = useState("");
    const [expiryDates, setExpiryDates] = useState<string[]>([]);

    const fetchData = async () => {
        try {
            const res = await getAnalystRecord();
            setData(res);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch option dates when ticker changes (for options)
    useEffect(() => {
        if (tradeType === "OPTION" && ticker.trim().length > 0) {
            const fetchDates = async () => {
                try {
                    const dates = await getOptionDates(ticker);
                    setExpiryDates(dates);
                    if (dates.length > 0) setExpiry(dates[0]);
                } catch (err) {
                    console.error("Error fetching expiry dates", err);
                    setExpiryDates([]);
                }
            };
            fetchDates();
        }
    }, [ticker, tradeType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (tradeType === "STOCK") {
                await logTrade({
                    ticker,
                    action,
                    price: parseFloat(price),
                    quantity: parseInt(quantity),
                    rationale
                });
            } else {
                await logOptionTrade({
                    ticker,
                    action,
                    option_type: optionType,
                    strike: parseFloat(strike),
                    expiry,
                    contracts: parseInt(contracts),
                    premium: parseFloat(premium),
                    rationale
                });
            }
            setShowForm(false);
            resetForm();
            fetchData(); // Refresh
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setTicker("");
        setPrice("");
        setQuantity("");
        setStrike("");
        setContracts("");
        setPremium("");
        setRationale("");
    };

    const filteredHistory = data?.history?.filter((trade: any) => {
        if (filterType === "ALL") return true;
        return trade.trade_type === filterType;
    }) || [];

    if (loading) return <div className="animate-pulse h-64 bg-slate-900/50 rounded-xl" />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-amber-400" />
                        Analyst Track Record
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Your career stats and trade journal (Stocks & Options).</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-slate-700"
                >
                    <PlusCircle className="w-4 h-4" />
                    Log Trade
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total PnL</div>
                    <div className={`text-xl font-bold font-mono ${data?.metrics.total_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ${data?.metrics.total_pnl.toLocaleString()}
                    </div>
                </div>
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Win Rate</div>
                    <div className="text-xl font-bold font-mono text-cyan-400">
                        {(data?.metrics.win_rate * 100).toFixed(1)}%
                    </div>
                </div>
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Stock Trades</div>
                    <div className="text-xl font-bold font-mono text-blue-400">
                        {data?.metrics.stock_trades}
                    </div>
                </div>
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Options Trades</div>
                    <div className="text-xl font-bold font-mono text-purple-400">
                        {data?.metrics.options_trades}
                    </div>
                </div>
            </div>

            {/* Log Trade Form */}
            {showForm && (
                <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-700 animate-in fade-in slide-in-from-top-4">
                    <h4 className="text-sm font-bold text-slate-200 mb-4">New Trade Entry</h4>

                    {/* Trade Type Selector */}
                    <div className="mb-4">
                        <label className="text-xs text-slate-500 block mb-2">Trade Type</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setTradeType("STOCK")}
                                className={`flex-1 py-2 px-4 rounded text-sm font-bold transition-colors ${tradeType === "STOCK"
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                📈 Stock
                            </button>
                            <button
                                type="button"
                                onClick={() => setTradeType("OPTION")}
                                className={`flex-1 py-2 px-4 rounded text-sm font-bold transition-colors ${tradeType === "OPTION"
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                ⚡ Option
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Ticker</label>
                                <input required value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white" placeholder="AAPL" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Action</label>
                                <select value={action} onChange={e => setAction(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white">
                                    <option value="BUY">BUY</option>
                                    <option value="SELL">SELL</option>
                                </select>
                            </div>

                            {tradeType === "STOCK" ? (
                                <>
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Price</label>
                                        <input required type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white" placeholder="150.00" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Quantity</label>
                                        <input required type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white" placeholder="100" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Option Type</label>
                                        <select value={optionType} onChange={e => setOptionType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white">
                                            <option value="CALL">🟢 CALL</option>
                                            <option value="PUT">🔴 PUT</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Strike Price</label>
                                        <input required type="number" step="0.01" value={strike} onChange={e => setStrike(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white" placeholder="150.00" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Expiry Date</label>
                                        <select value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white" disabled={expiryDates.length === 0}>
                                            {expiryDates.length === 0 ? (
                                                <option>Enter ticker first</option>
                                            ) : (
                                                expiryDates.map(date => <option key={date} value={date}>{date}</option>)
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 block mb-1">Contracts</label>
                                        <input required type="number" value={contracts} onChange={e => setContracts(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white" placeholder="10" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-slate-500 block mb-1">Premium (per contract)</label>
                                        <input required type="number" step="0.01" value={premium} onChange={e => setPremium(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white" placeholder="5.50" />
                                    </div>
                                </>
                            )}
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Rationale</label>
                            <textarea value={rationale} onChange={e => setRationale(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white h-20" placeholder="Why did you take this trade?" />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded text-sm font-bold text-white hover:opacity-90">Log Entry</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter Controls */}
            <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-500" />
                <span className="text-xs text-slate-500">Filter:</span>
                <div className="flex gap-2">
                    {["ALL", "STOCK", "OPTION"].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${filterType === type
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Trade History */}
            <div className="bg-slate-900/30 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-900/50 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Ticker</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Action</th>
                            <th className="px-4 py-3 text-right">Details</th>
                            <th className="px-4 py-3">Rationale</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredHistory.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-slate-500 italic">No trades logged yet. Start your career!</td>
                            </tr>
                        ) : (
                            filteredHistory.map((trade: any) => (
                                <tr key={trade.id} className="hover:bg-slate-800/20">
                                    <td className="px-4 py-3 font-mono text-slate-400">{new Date(trade.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 font-bold text-slate-200">{trade.ticker}</td>
                                    <td className="px-4 py-3">
                                        {trade.trade_type === "STOCK" ? (
                                            <span className="text-blue-400 text-xs font-bold">📈 STOCK</span>
                                        ) : (
                                            <span className={`text-xs font-bold ${trade.option_type === 'CALL' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {trade.option_type === 'CALL' ? '🟢' : '🔴'} {trade.option_type}
                                            </span>
                                        )}
                                    </td>
                                    <td className={`px-4 py-3 font-bold text-xs ${trade.action === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>{trade.action}</td>
                                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                                        {trade.trade_type === "STOCK" ? (
                                            <>{trade.quantity} @ ${trade.price.toFixed(2)}</>
                                        ) : (
                                            <>
                                                <div className="text-xs text-slate-400">Strike: ${trade.strike?.toFixed(2)}</div>
                                                <div className="text-xs text-slate-400">Exp: {trade.expiry}</div>
                                                <div className="text-xs">{trade.contracts}x @ ${trade.premium?.toFixed(2)}</div>
                                            </>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 italic truncate max-w-xs">{trade.rationale}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AnalystTrackRecord;
