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

import { AnimatedContent } from '@/components/AnimatedContent';

function DashboardContent() {
    const searchParams = useSearchParams();
    const view = searchParams.get('view') || 'overview';

    return (
        <DashboardProvider>
            <DashboardLayout>
                <div className="space-y-8">
                    <AnimatedContent viewKey={view}>
                        {view === 'overview' && (
                            <section>
                                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-4">
                                    <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-amber-400 font-bold mb-1">Beta Disclaimer</h4>
                                        <p className="text-amber-200/80 text-sm leading-relaxed">
                                            Please note that not all information displayed here may be 100% correct at this time.
                                            Our team is actively working on verifying data accuracy and improving system stability.
                                        </p>
                                    </div>
                                </div>
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
                    </AnimatedContent>
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
