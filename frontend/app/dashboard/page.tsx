"use client";

import React, { Suspense } from 'react';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { DashboardProvider } from '@/contexts/DashboardContext';

// Lazy load heavy components
const MarketOverview = dynamic(() => import('@/components/MarketOverview'), {
    loading: () => <div className="h-96 flex items-center justify-center text-slate-500">Loading Market Overview...</div>
});
const PortfolioBuilder = dynamic(() => import('@/components/PortfolioBuilder'), {
    loading: () => <div className="h-96 flex items-center justify-center text-slate-500">Loading Optimizer...</div>
});
const Backtester = dynamic(() => import('@/components/Backtester'), {
    loading: () => <div className="h-96 flex items-center justify-center text-slate-500">Loading Backtester...</div>
});
const OptionCalculator = dynamic(() => import('@/components/OptionCalculator'), {
    loading: () => <div className="h-96 flex items-center justify-center text-slate-500">Loading Options Lab...</div>
});
const QuantDashboard = dynamic(() => import('@/components/QuantDashboard'), {
    loading: () => <div className="h-96 flex items-center justify-center text-slate-500">Loading Quant Lab...</div>
});

function DashboardContent() {
    const searchParams = useSearchParams();
    const view = searchParams.get('view') || 'overview';

    return (
        <DashboardProvider>
            <DashboardLayout>
                <div className="space-y-8 animate-in fade-in duration-300">
                    {view === 'overview' && (
                        <section>
                            <MarketOverview />
                        </section>
                    )}

                    {view === 'efficient-frontier' && (
                        <section>
                            <PortfolioBuilder />
                        </section>
                    )}

                    {view === 'backtester' && (
                        <section>
                            <Backtester />
                        </section>
                    )}

                    {view === 'options' && (
                        <section>
                            <OptionCalculator />
                        </section>
                    )}

                    {view === 'quant' && (
                        <section>
                            <QuantDashboard />
                        </section>
                    )}
                </div>
            </DashboardLayout>
        </DashboardProvider>
    );
}

export default function DashboardPage() {
    // Force Rebuild: v2.3 (Final Hydration Fix)
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading Dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
