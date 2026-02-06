"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const CryptoDashboard = dynamic(() => import('@/components/crypto/CryptoDashboard'), {
    loading: () => <div className="h-96 w-full glass-panel animate-pulse flex items-center justify-center text-slate-500">Loading Crypto Command...</div>,
    ssr: false
});

import DashboardLayout from '@/components/DashboardLayout';

export default function CryptoPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6 relative z-10">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                        Crypto & DeFi Command
                    </h1>
                    <p className="text-gray-400">
                        Learn about cryptocurrency, blockchain technology, and decentralized finance.
                    </p>
                </div>

                <CryptoDashboard />
            </div>
        </DashboardLayout>
    );
}
