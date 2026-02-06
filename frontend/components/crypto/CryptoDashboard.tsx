"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CryptoEducation from './CryptoEducation';
import OnChainMetrics from './OnChainMetrics';
import CryptoNews from './CryptoNews';
import CryptoFearGreed from './CryptoFearGreed';
import TrendingAssets from './TrendingAssets';
import { getCryptoTop, getCryptoDefi, getCryptoWhaleAlerts } from '@/lib/api';
import { TrendingUp, TrendingDown, Layers, Wallet, ArrowUpRight } from 'lucide-react';

export default function CryptoDashboard() {
    const [coins, setCoins] = useState<any[]>([]);
    const [yields, setYields] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchData = async () => {
        try {
            setError(false);
            const [coinsData, yieldsData, alertsData] = await Promise.all([
                getCryptoTop(),
                getCryptoDefi(),
                getCryptoWhaleAlerts()
            ]);

            // Validate coins data - must have proper market_cap (real data)
            if (coinsData && coinsData.length > 0 && coinsData[0].market_cap && coinsData[0].market_cap > 0) {
                setCoins(coinsData);
            } else {
                // Don't show fake data - show error instead
                setError(true);
            }

            setYields(yieldsData || []);
            setAlerts(alertsData || []);
        } catch (error) {
            console.error("Failed to fetch crypto data", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll every 10 seconds for live prices
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    if (error) {
        return (
            <div className="p-8 text-center glass-panel border-amber-500/30">
                <div className="text-amber-400 font-bold text-xl mb-2">Live Data Feed Connecting...</div>
                <p className="text-slate-400 mb-4">Crypto market data is temporarily unavailable. We only display verified live prices.</p>
                <button
                    onClick={() => { setLoading(true); setError(false); fetchData(); }}
                    className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition-colors"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    if (loading && coins.length === 0) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">Connecting to Exchange Feeds...</div>;
    }

    return (
        <div className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Market Prices */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <Card className="bg-[#111] border-[#222]">
                        <CardHeader>
                            <CardTitle className="text-gray-200">Top 15 Assets (Live)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-xs text-gray-500 border-b border-[#333]">
                                            <th className="pb-3 pl-2">Asset</th>
                                            <th className="pb-3 text-right">Price</th>
                                            <th className="pb-3 text-right">24h</th>
                                            <th className="pb-3 text-right hidden md:table-cell">Market Cap</th>
                                            <th className="pb-3 text-center hidden lg:table-cell">7D</th>
                                            <th className="pb-3 text-right hidden xl:table-cell">ATH</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {coins.map((coin) => {
                                            const athDist = coin.ath_distance || 0;
                                            const athColor = athDist > -20 ? 'text-green-500' : athDist > -50 ? 'text-yellow-500' : 'text-red-500';

                                            return (
                                                <tr key={coin.symbol} className="border-b border-[#222]/50 hover:bg-[#1A1A1A] transition-colors">
                                                    <td className="py-4 pl-2 font-medium text-gray-200 flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-[10px] text-white font-bold">
                                                            {coin.symbol.split('/')[0].substring(0, 1)}
                                                        </div>
                                                        <div>
                                                            <div>{coin.symbol}</div>
                                                            {coin.name && (
                                                                <div className="text-[9px] text-gray-600">{coin.name}</div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-right font-mono text-gray-300">
                                                        ${parseFloat(coin.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                                    </td>
                                                    <td className={`py-4 text-right font-medium ${parseFloat(coin.change_24h) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        <div className="flex items-center justify-end gap-1">
                                                            {parseFloat(coin.change_24h) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                            {parseFloat(coin.change_24h).toFixed(2)}%
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-right text-gray-500 hidden md:table-cell">
                                                        {coin.market_cap ? `$${(coin.market_cap / 1e9).toFixed(1)}B` : 'N/A'}
                                                    </td>
                                                    <td className="py-4 hidden lg:table-cell">
                                                        {coin.sparkline && coin.sparkline.length > 0 && (
                                                            <svg viewBox="0 0 100 30" className="w-20 h-6 mx-auto">
                                                                <polyline
                                                                    fill="none"
                                                                    stroke={parseFloat(coin.change_24h) >= 0 ? '#22c55e' : '#ef4444'}
                                                                    strokeWidth="2"
                                                                    points={
                                                                        coin.sparkline
                                                                            .slice(-24)
                                                                            .map((p: number, i: number, arr: number[]) => {
                                                                                const min = Math.min(...arr);
                                                                                const max = Math.max(...arr);
                                                                                const range = max - min || 1;
                                                                                const x = (i / (arr.length - 1)) * 100;
                                                                                const y = 30 - ((p - min) / range) * 28;
                                                                                return `${x},${y}`;
                                                                            })
                                                                            .join(' ')
                                                                    }
                                                                />
                                                            </svg>
                                                        )}
                                                    </td>
                                                    <td className={`py-4 text-right text-xs hidden xl:table-cell ${athColor}`}>
                                                        {athDist.toFixed(1)}%
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info Section */}
                <div className="col-span-1 space-y-6">
                    <Card className="bg-[#111] border-[#222]">
                        <CardHeader>
                            <CardTitle className="text-gray-200 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-purple-500" /> Top DeFi Yields
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {yields.map((pool, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#0A0A0A] border border-[#222]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-gray-400">
                                            <Wallet className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-200">{pool.protocol}</div>
                                            <div className="text-[10px] text-gray-500">{pool.chain} • {pool.asset}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-green-400">{pool.apy}%</div>
                                        <div className="text-[10px] text-gray-600">APY</div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <CryptoFearGreed />
                        <TrendingAssets />
                        <OnChainMetrics />

                        {/* Dynamic Whale Alerts */}
                        <div className="space-y-3">
                            <h3 className="text-zinc-500 text-[10px] font-black tracking-widest flex items-center gap-2 uppercase px-1">
                                <ArrowUpRight className="w-3 h-3 text-indigo-400" /> Live Whale Watch
                            </h3>
                            {alerts.length > 0 ? (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                                    {alerts.map((alert, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/5 to-purple-900/5 border border-indigo-500/10 hover:bg-white/5 transition-all group">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-sm ${alert.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {alert.side.toUpperCase()}
                                                </span>
                                                <span className="text-[9px] text-gray-600 font-mono">
                                                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-300">
                                                <span className="font-mono text-white font-bold">{parseFloat(alert.amount).toFixed(2)} {alert.symbol.split('/')[0]}</span>
                                                <span className="text-gray-600 mx-1">→</span>
                                                <span className="text-indigo-300 font-mono font-bold">${(alert.value_usd / 1000).toFixed(1)}k</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#222] text-center text-gray-500 text-[10px]">
                                    Scanning blockchain for large movements...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Sections */}
            <div className="space-y-8">
                <div className="border-t border-[#222] pt-8">
                    <CryptoNews />
                </div>
                <div className="border-t border-[#222] pt-8">
                    <CryptoEducation />
                </div>
            </div>
        </div>
    );
}
