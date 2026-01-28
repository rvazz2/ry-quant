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

const FearGreedIndex = dynamic(() => import('@/components/behavioral/FearGreedIndex'), {
    loading: () => <div className="h-64 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});
const CognitiveBiasExplorer = dynamic(() => import('@/components/behavioral/CognitiveBiasExplorer'), {
    loading: () => <div className="h-64 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});
const TraderPersonalityTest = dynamic(() => import('@/components/behavioral/TraderPersonalityTest'), {
    loading: () => <div className="h-64 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});
const BiasesCasino = dynamic(() => import('@/components/behavioral/BiasesCasino'), {
    loading: () => <div className="h-64 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});
const CasinoGuide = dynamic(() => import('@/components/behavioral/CasinoGuide').then(mod => mod.CasinoGuide), {
    loading: () => <div className="h-64 w-full bg-slate-900/50 animate-pulse rounded-xl" />,
    ssr: false
});

const PsychologyOfMoney = dynamic(() => import('@/components/behavioral/PsychologyOfMoney'), {
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                    {/* Row 1: Sentiment & Fear/Greed */}
                    <div className="lg:col-span-8">
                        <SentimentTracker />
                    </div>
                    <div className="lg:col-span-4">
                        <FearGreedIndex />
                    </div>

                    {/* Row 2: Personality & Biases */}
                    <div className="lg:col-span-4">
                        <TraderPersonalityTest />
                    </div>
                    <div className="lg:col-span-4">
                        <CognitiveBiasExplorer />
                    </div>
                    <div className="lg:col-span-4">
                        <BiasesCasino />
                    </div>

                    {/* Row 3: Technicals & Whales */}
                    <div className="lg:col-span-8">
                        <MarketPsychologyCycle />
                    </div>
                    <div className="lg:col-span-4">
                        <SuperinvestorRadar />
                    </div>

                    {/* Row 4: Hype & Strategies */}
                    <div className="lg:col-span-8">
                        <SocialHypeRadar />
                    </div>
                    <div className="lg:col-span-4">
                        <InverseCramer />
                    </div>

                    {/* Full Width Section: Psychology of Money */}
                    <div className="lg:col-span-12">
                        <PsychologyOfMoney />
                    </div>

                    {/* Full Width Section: Casino Guide */}
                    <div className="lg:col-span-12 mt-12 bg-black/40 p-8 rounded-[3rem] border border-yellow-500/10">
                        <CasinoGuide />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
