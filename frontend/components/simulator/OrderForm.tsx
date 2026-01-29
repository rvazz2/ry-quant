"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, Bitcoin } from 'lucide-react';
import { api } from '@/lib/api';

export interface OptionTradeData {
    optionType: 'CALL' | 'PUT';
    strike: number;
    expiry: string;
    contracts: number;
    premium: number;
}

interface OrderFormProps {
    ticker: string;
    currentPrice: number | null;
    isLoading: boolean;
    onExecuteTrade: (action: 'BUY' | 'SELL', shares: number) => Promise<void>;
    onExecuteOption: (action: 'BUY' | 'SELL', optionData: OptionTradeData) => Promise<void>;
}

const OrderForm: React.FC<OrderFormProps> = ({
    ticker,
    currentPrice,
    isLoading,
    onExecuteTrade,
    onExecuteOption
}) => {
    const [activeTab, setActiveTab] = useState<'stocks' | 'options'>('stocks');

    // Stock State
    const [shares, setShares] = useState(10);

    // Option State
    const [optionType, setOptionType] = useState<'CALL' | 'PUT'>('CALL');
    const [strike, setStrike] = useState('');
    const [expiry, setExpiry] = useState('');
    const [contracts, setContracts] = useState(1);
    const [premium, setPremium] = useState('');

    const isCrypto = ticker.includes('-') || ticker === 'BTC' || ticker === 'ETH';

    const handleStockSubmit = (action: 'BUY' | 'SELL') => {
        onExecuteTrade(action, shares);
    };

    const handleOptionSubmit = (action: 'BUY' | 'SELL') => {
        onExecuteOption(action, {
            optionType,
            strike: parseFloat(strike),
            expiry,
            contracts,
            premium: parseFloat(premium)
        });
    };

    return (
        <div className="glass-panel p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Execute Value
                    {isCrypto && <Bitcoin className="text-orange-500" size={16} />}
                </h3>

                {!isCrypto ? (
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                        <button
                            onClick={() => setActiveTab('stocks')}
                            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${activeTab === 'stocks' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Stock
                        </button>
                        <button
                            onClick={() => setActiveTab('options')}
                            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${activeTab === 'options' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Option
                        </button>
                    </div>
                ) : (
                    <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">Crypto Mode</span>
                )}
            </div>

            {activeTab === 'stocks' ? (
                <div className="space-y-6 flex-1 flex flex-col">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                            <span className="text-slate-400 text-sm">Symbol</span>
                            <span className="font-mono font-bold text-xl text-white tracking-wider">{ticker}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                            <span className="text-slate-400 text-sm">Market Price</span>
                            {isLoading ? (
                                <span className="text-slate-500 text-sm animate-pulse">Loading...</span>
                            ) : (
                                <div className="text-right">
                                    <span className="font-mono font-bold text-xl text-cyan-400 shadow-glow block">
                                        ${currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '---'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs text-slate-500 uppercase mb-2 font-bold tracking-wider">Quantity ({isCrypto ? 'Units' : 'Shares'})</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0.000001"
                                    step={isCrypto ? "0.001" : "1"}
                                    value={shares}
                                    onChange={(e) => setShares(Number(e.target.value))}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white font-mono text-xl text-right focus:border-cyan-500 outline-none transition-colors"
                                />
                                <span className="absolute left-3 top-4 text-slate-600 text-xs font-bold">QTY</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-3 border-t border-slate-800/50">
                            <span className="text-slate-400 text-sm">Estimated Cost</span>
                            <span className="font-mono font-bold text-white text-lg border-b border-dashed border-slate-700">
                                ${(shares * (currentPrice || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-auto">
                        <button
                            onClick={() => handleStockSubmit('BUY')}
                            disabled={!currentPrice || isLoading}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span className="block text-xs opacity-80 mb-0.5">LONG</span>
                            BUY
                        </button>
                        <button
                            onClick={() => handleStockSubmit('SELL')}
                            disabled={!currentPrice || isLoading}
                            className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span className="block text-xs opacity-80 mb-0.5">SHORT</span>
                            SELL
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-slate-400 text-sm">Underlying</span>
                        <span className="font-mono text-white font-bold">{ticker}</span>
                    </div>

                    <div>
                        <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Position Type</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setOptionType('CALL')}
                                className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all ${optionType === 'CALL' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-sm' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700'}`}
                            >
                                CALL
                            </button>
                            <button
                                onClick={() => setOptionType('PUT')}
                                className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all ${optionType === 'PUT' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-sm' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700'}`}
                            >
                                PUT
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Strike ($)</label>
                            <input
                                type="number"
                                value={strike}
                                onChange={(e) => setStrike(e.target.value)}
                                placeholder="100.00"
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Expiration</label>
                            <input
                                type="date"
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Contracts</label>
                            <input
                                type="number"
                                value={contracts}
                                onChange={(e) => setContracts(parseInt(e.target.value) || 1)}
                                min="1"
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Premium ($)</label>
                            <input
                                type="number"
                                value={premium}
                                onChange={(e) => setPremium(e.target.value)}
                                placeholder="2.50"
                                step="0.01"
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {premium && contracts && (
                        <div className="bg-purple-900/10 p-3 rounded-lg border border-purple-500/20 mt-2">
                            <div className="text-xs text-purple-300 mb-0.5">Total Premium Value</div>
                            <div className="font-mono text-purple-100 font-bold text-lg">
                                ${(parseFloat(premium) * contracts * 100).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-purple-400 opacity-70 mt-1">
                                {contracts} contract(s) × 100 shares × ${premium}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => handleOptionSubmit('BUY')}
                            disabled={isLoading}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:cursor-not-allowed shadow-lg shadow-emerald-900/10"
                        >
                            Buy Open
                        </button>
                        <button
                            onClick={() => handleOptionSubmit('SELL')}
                            disabled={isLoading}
                            className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:cursor-not-allowed shadow-lg shadow-rose-900/10"
                        >
                            Sell/Write
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderForm;
