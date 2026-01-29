"use client";

import React from 'react';
import { Activity, Download, ChevronUp, ChevronDown } from 'lucide-react';

export interface TradeHistoryItem {
    timestamp: string;
    action: string;
    symbol: string;
    shares: number;
    price: number;
    total: number;
}

interface TradeHistoryProps {
    history: TradeHistoryItem[];
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ history }) => {
    const [showHistory, setShowHistory] = React.useState(true);

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

    return (
        <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="text-cyan-400" size={20} />
                    Trade History ({history.length})
                </h3>
                <div className="flex gap-2">
                    {history.length > 0 && (
                        <button onClick={downloadHistory} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/10 px-2 py-1 rounded transition-colors">
                            <Download size={14} /> Export CSV
                        </button>
                    )}
                    <button onClick={() => setShowHistory(!showHistory)} className="text-xs text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800">
                        {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>
            {showHistory && (
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {history.length === 0 ? (
                        <div className="text-center text-slate-600 py-8 italic text-sm border border-dashed border-slate-800 rounded-lg">
                            No trades recorded yet. Start trading to see history here.
                        </div>
                    ) : (
                        [...history].reverse().slice(0, 100).map((trade, idx) => (
                            <div key={idx} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/50 flex justify-between items-center text-sm hover:bg-slate-800 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className={`px-2 py-1 rounded text-xs font-black uppercase tracking-wider w-14 text-center ${trade.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                        {trade.action}
                                    </div>
                                    <div>
                                        <div className="font-mono font-bold text-white text-base">{trade.symbol}</div>
                                        <div className="text-[10px] text-slate-500">{new Date(trade.timestamp).toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-white text-sm">
                                        {trade.shares} <span className="text-slate-500 text-xs">shs</span> @ ${trade.price.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-slate-400 font-mono opacity-80 group-hover:opacity-100">
                                        Total: ${trade.total.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default TradeHistory;
