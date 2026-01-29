"use client";

import React, { useState, useEffect } from 'react';
import { Star, Trash2, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '@/lib/api';
import { ShimmerSkeleton } from '@/components/LoadingSkeleton';

interface WatchlistItem {
    symbol: string;
    price: number;
    change: number;
}

interface SimulatorWatchlistProps {
    onSelectTicker: (ticker: string) => void;
}

const SimulatorWatchlist: React.FC<SimulatorWatchlistProps> = ({ onSelectTicker }) => {
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [marketData, setMarketData] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState('');

    // Load initial watchlist
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sim_watchlist');
            const initialList = saved ? JSON.parse(saved) : ['AAPL', 'NVDA', 'TSLA', 'SPY', 'BTC-USD'];
            setWatchlist(initialList);
        }
    }, []);

    // Fetch data whenever watchlist changes
    useEffect(() => {
        if (watchlist.length === 0) {
            setMarketData([]);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch data for alltickers (could optimize with batch endpoint if available, but doing parallel requests for now)
                // In a real app, use a batch quote endpoint
                const promises = watchlist.map(sym => api.get(`/market/ticker/${sym}`));
                const results = await Promise.allSettled(promises);

                const data: WatchlistItem[] = results.map((res, index) => {
                    const symbol = watchlist[index];
                    if (res.status === 'fulfilled') {
                        return {
                            symbol,
                            price: res.value.data.price,
                            change: res.value.data.change
                        };
                    }
                    return { symbol, price: 0, change: 0 };
                });

                setMarketData(data);
            } catch (err) {
                console.error("Failed to fetch watchlist data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Refresh every 30s
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);

    }, [watchlist]);

    const addToWatchlist = (e: React.FormEvent) => {
        e.preventDefault();
        const symbol = input.toUpperCase().trim();
        if (symbol && !watchlist.includes(symbol)) {
            const newList = [...watchlist, symbol];
            setWatchlist(newList);
            localStorage.setItem('sim_watchlist', JSON.stringify(newList));
            setInput('');
        }
    };

    const removeFromWatchlist = (symbol: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newList = watchlist.filter(s => s !== symbol);
        setWatchlist(newList);
        localStorage.setItem('sim_watchlist', JSON.stringify(newList));
    };

    return (
        <div className="glass-panel p-4 h-full flex flex-col">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Star className="text-yellow-500" size={16} /> Watchlist
            </h3>

            <form onSubmit={addToWatchlist} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Add Ticker..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white uppercase focus:border-cyan-500 outline-none"
                />
                <button type="submit" className="bg-cyan-500/20 text-cyan-400 p-1.5 rounded hover:bg-cyan-500/30 transition-colors">
                    <Plus size={16} />
                </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                {loading && marketData.length === 0 ? (
                    [...Array(5)].map((_, i) => (
                        <ShimmerSkeleton key={i} className="h-12 w-full rounded" />
                    ))
                ) : (
                    marketData.map((item) => (
                        <div
                            key={item.symbol}
                            onClick={() => onSelectTicker(item.symbol)}
                            className="bg-slate-900/40 hover:bg-slate-800 p-3 rounded cursor-pointer group border border-transparent hover:border-slate-700 transition-all"
                        >
                            <div className="flex justify-between items-center">
                                <div className="font-bold text-white text-sm">{item.symbol}</div>
                                <div className="text-xs font-mono text-white">${item.price.toFixed(2)}</div>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <div className={`text-xs flex items-center ${item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {item.change >= 0 ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
                                    {item.change.toFixed(2)}%
                                </div>
                                <button
                                    onClick={(e) => removeFromWatchlist(item.symbol, e)}
                                    className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SimulatorWatchlist;
