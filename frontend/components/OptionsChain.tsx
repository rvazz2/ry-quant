"use client";

import React, { useState, useEffect } from 'react';
import { getOptionDates, getOptionChain } from '@/lib/api';
import { Search, Calendar, RefreshCw } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import { ProcessedOptionsChain, OptionChainItem, OptionChainResponse } from '@/lib/types';

// Header stored outside to be static
const TableHeader = () => (
    <thead className="sticky top-0 bg-slate-900 z-10 text-slate-400 font-medium border-b border-slate-800">
        <tr>
            <th colSpan={4} className="py-2 px-2 text-center border-r border-slate-800 text-emerald-400">CALLS</th>
            <th className="py-2 px-4 text-center bg-slate-800 text-white font-bold w-24">STRIKE</th>
            <th colSpan={4} className="py-2 px-2 text-center border-l border-slate-800 text-rose-400">PUTS</th>
        </tr>
        <tr className="text-[10px] uppercase tracking-wider">
            <th className="py-1 px-2 text-right">Bid</th>
            <th className="py-1 px-2 text-right">Ask</th>
            <th className="py-1 px-2 text-right">Vol</th>
            <th className="py-1 px-2 text-right border-r border-slate-800">IV</th>

            <th className="py-1 px-2 bg-slate-800"></th>

            <th className="py-1 px-2 text-left border-l border-slate-800">Bid</th>
            <th className="py-1 px-2 text-left">Ask</th>
            <th className="py-1 px-2 text-left">Vol</th>
            <th className="py-1 px-2 text-left">IV</th>
        </tr>
    </thead>
);

// Memoized Table Component
const ChainTable = React.memo(({ processedChain, loadingChain, chain }: { processedChain: ProcessedOptionsChain | null, loadingChain: boolean, chain: any }) => {
    return (
        <div className="flex-1 overflow-auto border border-slate-800 rounded-lg bg-slate-900/50 relative">
            {loadingChain && (
                <div className="absolute inset-0 bg-slate-900/80 z-10 flex items-center justify-center">
                    <RefreshCw size={32} className="text-cyan-400 animate-spin" />
                </div>
            )}

            {!chain && !loadingChain && (
                <div className="h-full flex items-center justify-center text-slate-500">
                    Select a ticker and date to view the chain.
                </div>
            )}

            {processedChain && (
                <table className="w-full text-xs text-left">
                    <TableHeader />
                    <tbody className="divide-y divide-slate-800/50">
                        {processedChain.sortedStrikes.map((strike: number) => {
                            const call = processedChain.callMap.get(strike);
                            const put = processedChain.putMap.get(strike);
                            const isITMCall = call?.inTheMoney;
                            const isITMPut = put?.inTheMoney;

                            return (
                                <tr key={strike} className="hover:bg-slate-800/30 transition-colors">
                                    {/* CALLS */}
                                    <td className={`py-1 px-2 text-right ${isITMCall ? 'bg-emerald-900/10' : ''}`}>{call ? call.bid.toFixed(2) : '-'}</td>
                                    <td className={`py-1 px-2 text-right ${isITMCall ? 'bg-emerald-900/10' : ''}`}>{call ? call.ask.toFixed(2) : '-'}</td>
                                    <td className={`py-1 px-2 text-right text-slate-400 ${isITMCall ? 'bg-emerald-900/10' : ''}`}>{call ? call.volume : '-'}</td>
                                    <td className={`py-1 px-2 text-right text-slate-500 border-r border-slate-800 ${isITMCall ? 'bg-emerald-900/10' : ''}`}>{call ? (call.impliedVolatility * 100).toFixed(1) + '%' : '-'}</td>

                                    {/* STRIKE */}
                                    <td className="py-1 px-4 text-center font-bold text-slate-200 bg-slate-800/50">{strike.toFixed(1)}</td>

                                    {/* PUTS */}
                                    <td className={`py-1 px-2 text-left border-l border-slate-800 ${isITMPut ? 'bg-rose-900/10' : ''}`}>{put ? put.bid.toFixed(2) : '-'}</td>
                                    <td className={`py-1 px-2 text-left ${isITMPut ? 'bg-rose-900/10' : ''}`}>{put ? put.ask.toFixed(2) : '-'}</td>
                                    <td className={`py-1 px-2 text-left text-slate-400 ${isITMPut ? 'bg-rose-900/10' : ''}`}>{put ? put.volume : '-'}</td>
                                    <td className={`py-1 px-2 text-left text-slate-500 ${isITMPut ? 'bg-rose-900/10' : ''}`}>{put ? (put.impliedVolatility * 100).toFixed(1) + '%' : '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
});
ChainTable.displayName = 'ChainTable';

const OptionsChain = () => {
    const [ticker, setTicker] = useState("SPY");
    const [dates, setDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [chain, setChain] = useState<OptionChainResponse | null>(null);
    const [loadingDates, setLoadingDates] = useState(false);
    const [loadingChain, setLoadingChain] = useState(false);

    // Fetch dates when ticker changes (debounced or on submit)
    const fetchDates = async () => {
        setLoadingDates(true);
        setChain(null);
        try {
            const res = await getOptionDates(ticker);
            setDates(res);
            if (res.length > 0) {
                setSelectedDate(res[0]);
            } else {
                setSelectedDate("");
            }
        } catch (error) {
            console.error("Error fetching dates", error);
        } finally {
            setLoadingDates(false);
        }
    };

    // Fetch chain when date changes
    useEffect(() => {
        if (!ticker || !selectedDate) return;

        const fetchChain = async () => {
            setLoadingChain(true);
            try {
                const res = await getOptionChain(ticker, selectedDate);
                setChain(res);
            } catch (error) {
                console.error("Error fetching chain", error);
            } finally {
                setLoadingChain(false);
            }
        };

        fetchChain();
    }, [selectedDate, ticker]);

    // Initial load
    useEffect(() => {
        fetchDates();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchDates();
    };

    // Memoize chain processing for performance
    const processedChain: ProcessedOptionsChain | null = React.useMemo(() => {
        if (!chain) return null;

        const strikes = new Set([...chain.calls.map(c => c.strike), ...chain.puts.map(p => p.strike)]);
        const sortedStrikes = Array.from(strikes).sort((a, b) => a - b);

        const callMap = new Map(chain.calls.map(c => [c.strike, c]));
        const putMap = new Map(chain.puts.map(p => [p.strike, p]));

        return { sortedStrikes, callMap, putMap };
    }, [chain]);

    return (
        <div className="glass-panel p-6 h-[800px] flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <span className="text-cyan-400">⛓️</span> Options Chain
                </h3>

                <div className="flex gap-4 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="relative flex-1 md:w-48 group">
                        <input
                            type="text"
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value.toUpperCase())}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-8 py-2 text-sm text-white focus:border-cyan-500 outline-none uppercase transition-all"
                            placeholder="Ticker..."
                        />
                        <Search size={16} className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                        {ticker && (
                            <button
                                type="button"
                                onClick={() => setTicker("")}
                                className="absolute right-2 top-2.5 text-slate-500 hover:text-white"
                            >
                                <div className="bg-slate-700 rounded-full p-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </div>
                            </button>
                        )}
                    </form>

                    <div className="relative flex-1 md:w-48">
                        <select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            disabled={loadingDates || dates.length === 0}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-cyan-500 outline-none appearance-none disabled:opacity-50"
                        >
                            {dates.map(d => <option key={d} value={d}>{d}</option>)}
                            {dates.length === 0 && <option>No dates found</option>}
                        </select>
                        <Calendar size={16} className="absolute left-3 top-2.5 text-slate-500" />
                    </div>

                    <button onClick={fetchDates} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                        <RefreshCw size={18} className={`text-cyan-400 ${loadingDates ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Memoized Table to prevent re-renders on input typing */}
            <ChainTable processedChain={processedChain} loadingChain={loadingChain} chain={chain} />
        </div>
    );
};

export default function OptionsChainWidget() {
    return (
        <ErrorBoundary name="Options Chain">
            <OptionsChain />
        </ErrorBoundary>
    );
}
