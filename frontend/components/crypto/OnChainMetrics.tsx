"use client";

import React, { useEffect, useState } from 'react';
import { getCryptoOnChain } from '@/lib/api';
import { Zap, Gauge, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OnChainData {
    btc_hashrate?: number;
    eth_gas_safe?: number;
    eth_gas_propose?: number;
    eth_gas_fast?: number;
}

export default function OnChainMetrics() {
    const [metrics, setMetrics] = useState<OnChainData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMetrics = async () => {
        try {
            const data = await getCryptoOnChain();
            setMetrics(data);
        } catch (error) {
            console.error("Failed to fetch on-chain metrics", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 120000); // Update every 2 minutes
        return () => clearInterval(interval);
    }, []);

    if (loading || !metrics) {
        return (
            <Card className="bg-[#111] border-[#222]">
                <CardHeader>
                    <CardTitle className="text-gray-200 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" /> On-Chain Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-slate-800/50 rounded-lg" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const gasColor = (gwei: number) => {
        if (gwei < 20) return 'text-green-400';
        if (gwei < 40) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <Card className="bg-[#111] border-[#222]">
            <CardHeader>
                <CardTitle className="text-gray-200 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" /> On-Chain Metrics
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* BTC Hash Rate */}
                {(metrics.btc_hashrate ?? 0) > 0 && (
                    <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#222] hover:border-orange-500/30 transition-colors group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-orange-400" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 neon">Bitcoin Network</div>
                                    <div className="text-sm font-medium text-gray-200">Hash Rate</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-orange-400">
                                    {(metrics.btc_hashrate ?? 0).toFixed(1)}
                                </div>
                                <div className="text-[10px] text-gray-600">EH/s</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ETH Gas Prices */}
                {(metrics.eth_gas_safe ?? 0) > 0 && (
                    <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#222] hover:border-blue-500/30 transition-colors group">
                        <div className="mb-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Gauge className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium text-gray-200">Ethereum Gas Tracker</span>
                            </div>
                            <div className="text-[10px] text-gray-500">Gwei (Gas Price)</div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                                <div className={`text-sm font-bold ${gasColor(metrics.eth_gas_safe ?? 0)}`}>
                                    {metrics.eth_gas_safe}
                                </div>
                                <div className="text-[9px] text-gray-600 mt-0.5">Safe</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-sm font-bold ${gasColor(metrics.eth_gas_propose ?? 0)}`}>
                                    {metrics.eth_gas_propose}
                                </div>
                                <div className="text-[9px] text-gray-600 mt-0.5">Standard</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-sm font-bold ${gasColor(metrics.eth_gas_fast ?? 0)}`}>
                                    {metrics.eth_gas_fast}
                                </div>
                                <div className="text-[9px] text-gray-600 mt-0.5">Fast</div>
                            </div>
                        </div>
                    </div>
                )}

                {(!metrics.btc_hashrate && !metrics.eth_gas_safe) && (
                    <div className="p-6 text-center text-gray-500 text-sm">
                        Metrics temporarily unavailable
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
