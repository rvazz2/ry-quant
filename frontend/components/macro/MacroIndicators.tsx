"use client";

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Droplet, Zap } from 'lucide-react';
import IndexDetailModal from '../IndexDetailModal';
import { getIndexDetails } from '@/lib/api';

interface MacroIndicatorsProps {
    data: any[];
}

const MacroIndicators = ({ data }: MacroIndicatorsProps) => {
    const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
    const [modalData, setModalData] = useState<any>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const getIcon = (symbol: string) => {
        if (symbol.includes("GC")) return <div className="text-yellow-400 font-bold text-lg">Au</div>;
        if (symbol.includes("CL")) return <Droplet size={20} className="text-orange-400" />;
        if (symbol.includes("HG")) return <Zap size={20} className="text-amber-500" />;
        if (symbol.includes("VIX")) return <Activity size={20} className="text-purple-400" />;
        if (symbol.includes("DX")) return <DollarSign size={20} className="text-green-400" />;
        if (symbol.includes("SI")) return <div className="text-slate-300 font-bold text-lg">Ag</div>;
        if (symbol.includes("BTC")) return <div className="text-orange-500 font-bold text-sm">₿</div>;
        return <Activity size={20} className="text-slate-400" />;
    };

    const getLabel = (symbol: string, name: string) => {
        if (symbol.includes("GC")) return "Gold";
        if (symbol.includes("CL")) return "Crude Oil";
        if (symbol.includes("HG")) return "Copper";
        if (symbol.includes("VIX")) return "VIX";
        if (symbol.includes("DX")) return "DXY";
        return name;
    };

    const handleCardClick = async (symbol: string) => {
        try {
            const data = await getIndexDetails(symbol);
            setModalData(data);
            setSelectedTicker(symbol);
            setModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch macro details", error);
        }
    };

    // Separate primary and secondary indicators
    const primaryData = data.filter(item => item.priority === 1);
    const secondaryData = data.filter(item => item.priority === 2);

    const CommodityCard = ({ item }: { item: any }) => {
        const isVIX = item.symbol.includes("VIX");
        const isYield = item.symbol.includes("TNX");
        const showDollar = !isVIX && !isYield;

        return (
            <div
                onClick={() => handleCardClick(item.symbol)}
                className="glass-panel p-4 flex flex-col justify-between cursor-pointer hover:bg-slate-800/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-slate-400 font-medium">{getLabel(item.symbol, item.name)}</span>
                    {getIcon(item.symbol)}
                </div>
                <div>
                    <div className="text-xl font-bold text-slate-100">
                        {showDollar && "$"}{item.price.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 mb-1">{item.unit}</div>
                    <div className={`text-xs font-medium flex items-center gap-1 ${item.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(item.pct_change).toFixed(2)}%
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Primary Commodities (Top Row) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {primaryData.map((item) => (
                    <CommodityCard key={item.symbol} item={item} />
                ))}
            </div>

            {/* Secondary Indicators (Bottom Row) */}
            {secondaryData.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 opacity-80">
                    {secondaryData.map((item) => (
                        <CommodityCard key={item.symbol} item={item} />
                    ))}
                </div>
            )}

            <IndexDetailModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                data={modalData}
            />
        </>
    );
};

import ErrorBoundary from '../ErrorBoundary';
import GlobalErrorFallback from '../GlobalErrorFallback';

const MacroIndicatorsWidget = (props: MacroIndicatorsProps) => (
    <ErrorBoundary fallback={<GlobalErrorFallback title="Market Metrics Unavailable" message="Unable to load market indicators." />}>
        <MacroIndicators {...props} />
    </ErrorBoundary>
);

export default MacroIndicatorsWidget;
