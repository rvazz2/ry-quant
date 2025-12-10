"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/DashboardLayout';
import { BrainCircuit } from 'lucide-react';

const SentimentTracker = dynamic(() => import('@/components/behavioral/SentimentTracker'), {
    loading: () => <div className="h-64 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});
const InverseCramer = dynamic(() => import('@/components/behavioral/InverseCramer'), {
    loading: () => <div className="h-64 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});
const SocialHypeRadar = dynamic(() => import('@/components/behavioral/SocialHypeRadar'), {
    loading: () => <div className="h-64 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});
const SuperinvestorRadar = dynamic(() => import('@/components/behavioral/SuperinvestorRadar'), {
    loading: () => <div className="h-64 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});
const MarketPsychologyCycle = dynamic(() => import('@/components/behavioral/MarketPsychologyCycle'), {
    loading: () => <div className="h-64 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});

export default function BehavioralPage() {
    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
                <header>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-600 flex items-center gap-3">
                        <BrainCircuit className="text-yellow-400" />
                        Behavioral Finance Engine
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">
                        Quantifying market psychology, sentiment, and contrarian indicators.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Tool 1: Fear & Greed */}
                    <div className="lg:col-span-2">
                        <SentimentTracker />
                    </div>

                    {/* Tool 2: Superinvestor Radar (New) */}
                    <div className="lg:col-span-1">
                        <SuperinvestorRadar />
                    </div>

                    {/* Tool 3: Inverse Cramer */}
                    <div className="lg:col-span-1">
                        <InverseCramer />
                    </div>

                    {/* Tool 4: Market Psychology Cycle (New) */}
                    <div className="lg:col-span-2">
                        <MarketPsychologyCycle />
                    </div>

                    {/* Tool 5: Social Hype Radar */}
                    <div className="md:col-span-2 lg:col-span-3">
                        <SocialHypeRadar />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
