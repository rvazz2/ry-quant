import React from 'react';
import { X, TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Calendar } from 'lucide-react';
import PriceChart from './PriceChart';
import { IndexDetails } from '@/lib/types';

interface IndexDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: IndexDetails | null;
}

const IndexDetailModal: React.FC<IndexDetailModalProps> = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    const isPositive = data.change >= 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 border border-slate-700 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            {data.name}
                            <span className="text-sm font-normal text-slate-400 px-2 py-1 bg-slate-800 rounded-md border border-slate-700">
                                {data.symbol}
                            </span>
                        </h2>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-4xl font-black text-white">
                                {data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <div className={`flex items-center px-3 py-1 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {isPositive ? <TrendingUp size={20} className="mr-1" /> : <TrendingDown size={20} className="mr-1" />}
                                <span className="font-bold">
                                    {isPositive ? '+' : ''}{data.change.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Chart Section */}
                <div className="mb-8 bg-slate-900/50 rounded-xl p-4 border border-white/5">
                    <div className="h-[400px] w-full">
                        {data.chart_data && data.chart_data.length > 0 ? (
                            <PriceChart symbol={data.symbol} initialData={data.chart_data} prevClose={data.prev_close} />
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center text-slate-500">
                                <Activity size={48} className="mb-2 opacity-20" />
                                <p>No chart data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Key Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        label="Open"
                        value={data.open}
                        icon={<Activity size={16} />}
                    />
                    <StatCard
                        label="Previous Close"
                        value={data.prev_close}
                        icon={<Activity size={16} />}
                    />
                    <StatCard
                        label="Day High"
                        value={data.high}
                        icon={<TrendingUp size={16} />}
                        highlight="text-emerald-400"
                    />
                    <StatCard
                        label="Day Low"
                        value={data.low}
                        icon={<TrendingDown size={16} />}
                        highlight="text-rose-400"
                    />
                    <StatCard
                        label="Volume"
                        value={data.volume}
                        format="compact"
                        icon={<BarChart3 size={16} />}
                    />
                    <StatCard
                        label="52W High"
                        value={data.fifty_two_week_high}
                        icon={<Calendar size={16} />}
                    />
                    <StatCard
                        label="52W Low"
                        value={data.fifty_two_week_low}
                        icon={<Calendar size={16} />}
                    />
                </div>
            </div>
        </div>
    );
};

// Helper Component for Stats
const StatCard = ({ label, value, icon, highlight = "text-white", format = "currency" }: any) => {
    let displayValue = "-";

    if (value !== undefined && value !== null) {
        if (format === "currency") {
            displayValue = value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (format === "compact") {
            displayValue = Intl.NumberFormat('en-US', {
                notation: "compact",
                maximumFractionDigits: 1
            }).format(value);
        } else {
            displayValue = value.toString();
        }
    }

    return (
        <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                {icon}
                {label}
            </div>
            <div className={`text-lg font-bold ${highlight}`}>
                {displayValue}
            </div>
        </div>
    );
};

export default IndexDetailModal;
