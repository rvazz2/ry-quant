"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { getIndexDetails } from '@/lib/api';
import { useDashboard } from '@/contexts/DashboardContext';
import { ArrowUp, ArrowDown, Activity } from 'lucide-react';
import IndexDetailModal from './IndexDetailModal';
import { ShimmerSkeleton } from './LoadingSkeleton';
import ErrorBoundary from './ErrorBoundary';
import GlobalErrorFallback from './GlobalErrorFallback';
import DailyBriefing from './DailyBriefing';

import { IndexDetails, MarketOverviewItem } from '@/lib/types';

// Memoized Index Card Component
const IndexCard = React.memo(({ item, isLoading, onClick }: { item: MarketOverviewItem, isLoading: boolean, onClick: () => void }) => (
    <div
        onClick={onClick}
        className="glass-panel p-6 flex flex-col justify-between h-36 cursor-pointer relative group overflow-hidden border-t border-white/5 hover:border-cyan-500/30 transition-all duration-500"
    >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500" />

        <div className="flex justify-between items-start relative z-10 w-full">
            <h3 className="text-sm font-medium text-slate-400 tracking-wider uppercase group-hover:text-cyan-200 transition-colors">{item.name}</h3>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-md shadow-lg ${item.change >= 0
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 shadow-emerald-900/20'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300 shadow-rose-900/20'}`}>
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
            </span>
        </div>

        <div className="flex items-end gap-3 relative z-10 mt-auto">
            <span className="text-3xl font-black bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight group-hover:from-white group-hover:to-cyan-200 transition-all">{item.price.toFixed(2)}</span>
            {item.change >= 0
                ? <ArrowUp size={22} className="text-emerald-400 mb-1.5 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)] animate-pulse-slow" />
                : <ArrowDown size={22} className="text-rose-400 mb-1.5 drop-shadow-[0_0_10px_rgba(251,113,133,0.6)] animate-pulse-slow" />
            }
        </div>

        {isLoading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-2xl animate-fade-in-up z-20">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
            </div>
        )}
    </div>
));
IndexCard.displayName = 'IndexCard';



const MarketNews = dynamic(() => import('./MarketNews'), {
    loading: () => <ShimmerSkeleton className="h-96 w-full" />,
    ssr: false
});

const MarketOverview = () => {
    // Force rebuild: MarketOverview Layout Update - v2
    const { overview, overviewLoading } = useDashboard();
    const [modalData, setModalData] = useState<IndexDetails | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loadingTicker, setLoadingTicker] = useState<string | null>(null);

    const handleTickerClick = React.useCallback(async (ticker: string) => {
        setLoadingTicker(ticker);
        try {
            const data = await getIndexDetails(ticker);
            setModalData(data);
            setModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch ticker details", error);
        } finally {
            setLoadingTicker(null);
        }
    }, []);

    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Hydration Fix: Ensure we match server (loading) until client mounts
    const showLoading = !mounted || overviewLoading;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" suppressHydrationWarning>
                {/* Index Cards */}
                {showLoading ? (
                    <>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="glass-panel p-5 h-36 flex flex-col justify-between">
                                <div className="flex justify-between">
                                    <ShimmerSkeleton className="h-4 w-24" />
                                    <ShimmerSkeleton className="h-6 w-16 rounded-full" />
                                </div>
                                <div className="flex items-end gap-2">
                                    <ShimmerSkeleton className="h-8 w-32" />
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        {overview.map((item) => (
                            <IndexCard
                                key={item.symbol}
                                item={item}
                                isLoading={loadingTicker === item.symbol}
                                onClick={() => handleTickerClick(item.symbol)}
                            />
                        ))}
                    </>
                )}


            </div>

            {/* AI Daily Briefing Section */}
            <div className="w-full">
                <DailyBriefing />
            </div>

            {/* Market News Section - RESTORED */}
            <div className="w-full">
                <MarketNews />
            </div>

            <IndexDetailModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                data={modalData}
            />
        </div>
    );
};

const MarketOverviewWidget = () => (
    <ErrorBoundary fallback={<GlobalErrorFallback title="Market Data Unavailable" message="We couldn't connect to the market data feed." />}>
        <MarketOverview />
    </ErrorBoundary>
);

export default MarketOverviewWidget;
