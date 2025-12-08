"use client";

import React from 'react';
import StressDashboard from '@/components/stress/StressDashboard';

export default function StressTestPage() {
    return (
        <div className="w-full min-h-screen pt-20 bg-[#000000] text-gray-200">
            <div className="px-8 py-6 max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 mb-2">
                        Portfolio Stress Lab
                    </h1>
                    <p className="text-gray-400">
                        Simulate extreme market events and Monte Carlo outcomes to battle-test your portfolio.
                    </p>
                </header>

                <StressDashboard />
            </div>
        </div>
    );
}
