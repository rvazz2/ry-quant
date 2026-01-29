"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const CryptoDashboard = dynamic(() => import('@/components/crypto/CryptoDashboard'), {
    loading: () => <div className="h-96 w-full glass-panel animate-pulse flex items-center justify-center text-slate-500">Loading Crypto Command...</div>,
    ssr: false
});

const ArbitrageScanner = dynamic(() => import('@/components/crypto/ArbitrageScanner'), {
    loading: () => <div className="h-64 glass-panel animate-pulse" />,
    ssr: false
});

const MarketStatsBar = dynamic(() => import('@/components/crypto/MarketStatsBar'), {
    loading: () => <div className="h-24 animate-pulse" />,
    ssr: false
});

import DashboardLayout from '@/components/DashboardLayout';

export default function CryptoPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                            Crypto & DeFi Command
                        </h1>
                        <p className="text-gray-400">
                            Live prices, on-chain metrics, and yield farming intelligence.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-mono">
                            ● BINANCE LIVE
                        </span>
                    </div>
                </div>

                {/* Market Stats Bar */}
                <MarketStatsBar />

                {/* Arbitrage Scanner Section */}
                <div className="h-[400px]">
                    <ArbitrageScanner />
                </div>

                <CryptoDashboard />
            </div>
        </DashboardLayout>
    );
}
