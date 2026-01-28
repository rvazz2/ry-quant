"use client";

import React, { useState, useMemo } from 'react';
import { getCompanyInfo, getTreasuryRates, searchTickers, getFinancials, getDeepResearch, generateAIAnalystReport, getTrendingTickers } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { Search, TrendingUp, DollarSign, Activity, Newspaper, BookOpen, X, Globe, Clock, Flame } from 'lucide-react';
import FinancialGuide from './FinancialGuide';
import AIResearchLab from './AIResearchLab';
import { InsiderWidget, AnalystWidget, OwnershipWidget, AdvancedMetricsWidget } from './research/DeepResearchWidgets';
import { ShimmerSkeleton } from './LoadingSkeleton';
import { useSearchParams } from 'next/navigation';
import ErrorBoundary from './ErrorBoundary';
import GlobalErrorFallback from './GlobalErrorFallback';

// Lazy load heavy visualization components
const FinancialSankey = dynamic(() => import('./FinancialSankey'), {
    loading: () => <ShimmerSkeleton className="h-96 w-full" />,
    ssr: false
});
const FinancialStatements = dynamic(() => import('./FinancialStatements'), {
    loading: () => <ShimmerSkeleton className="h-96 w-full" />
});
const PriceChart = dynamic(() => import('./PriceChart'), {
    loading: () => <ShimmerSkeleton className="h-96 w-full" />,
    ssr: false
});

const MetricCard = React.memo(({ label, value, icon, valueColor = "text-white" }: { label: string, value: string | number, icon: React.ReactNode, valueColor?: string }) => (
    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800/60 hover:border-cyan-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-900/10 group">
        <div className="flex items-center gap-2 mb-2 group-hover:translate-x-1 transition-transform">
            {icon}
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</span>
        </div>
        <div className={`text-2xl font-black tracking-tight ${valueColor} drop-shadow-sm`}>{value}</div>
    </div>
));
MetricCard.displayName = "MetricCard";

const Research = () => {
    const searchParams = useSearchParams();
    const initialTicker = searchParams.get('ticker') || "AAPL";

    const [inputTicker, setInputTicker] = useState(initialTicker);
    const [selectedTicker, setSelectedTicker] = useState(initialTicker);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showRecent, setShowRecent] = useState(false);

    // Load recent searches on mount
    React.useEffect(() => {
        const saved = localStorage.getItem('recent_searches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse recent searches", e);
            }
        }
    }, []);

    const addToRecent = (ticker: string) => {
        const upper = ticker.toUpperCase();
        setRecentSearches(prev => {
            const newRecent = [upper, ...prev.filter(t => t !== upper)].slice(0, 5);
            localStorage.setItem('recent_searches', JSON.stringify(newRecent));
            return newRecent;
        });
    };

    // UI State
    const [guideOpen, setGuideOpen] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // 1. Treasury Rates Query
    const { data: treasury = [], isLoading: treasuryLoading } = useQuery({
        queryKey: ['treasury'],
        queryFn: getTreasuryRates,
        staleTime: 5 * 60 * 1000,
    });

    // 2. Company Info Query
    const { data: company, isLoading: companyLoading, error: companyError } = useQuery({
        queryKey: ['company', selectedTicker],
        queryFn: () => getCompanyInfo(selectedTicker),
        enabled: !!selectedTicker,
        retry: 0, // Fail fast for 404s
        refetchOnWindowFocus: false,
    });

    // 3. Financials Query
    const { data: financials, isLoading: financialsLoading } = useQuery({
        queryKey: ['financials', selectedTicker],
        queryFn: () => getFinancials(selectedTicker),
        enabled: !!selectedTicker,
        retry: 1
    });

    // 4. Deep Research Query
    const { data: deepResearch, isLoading: deepResearchLoading } = useQuery({
        queryKey: ['deepResearch', selectedTicker],
        queryFn: () => getDeepResearch(selectedTicker),
        enabled: !!selectedTicker,
        retry: 1,
        staleTime: 5 * 60 * 1000
    });

    // 5. Suggestions Query (Debounced)
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Simple debounce effect
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (inputTicker.length > 1) setDebouncedSearch(inputTicker);
        }, 300);
        return () => clearTimeout(timer);
    }, [inputTicker]);

    const { data: suggestions = [] } = useQuery({
        queryKey: ['search', debouncedSearch],
        queryFn: () => searchTickers(debouncedSearch),
        enabled: debouncedSearch.length > 1,
        staleTime: 60 * 1000
    });

    // 6. Trending Tickers
    const { data: trending = [] } = useQuery({
        queryKey: ['trending'],
        queryFn: getTrendingTickers,
        staleTime: 5 * 60 * 1000
    });

    const handleSearch = (symbol?: string) => {
        const target = symbol || inputTicker;
        if (target) {
            setSelectedTicker(target);
            setInputTicker(target);
            setShowSuggestions(false);
            addToRecent(target);

            // Update URL shallowly
            const params = new URLSearchParams(window.location.search);
            params.set('ticker', target);
            window.history.replaceState(null, '', `?${params.toString()}`);
        }
    };

    const priceChart = useMemo(() => {
        if (!company) return null;
        return (
            <div className="mb-8">
                <PriceChart
                    symbol={company.symbol}
                    initialData={company.chart_data}
                    prevClose={company.prev_close}
                />
            </div>
        );
    }, [company]);

    const loading = companyLoading || financialsLoading;
    const error = companyError ? `Could not find data for "${selectedTicker}". Please check the ticker symbol.` : "";

    return (
        <ErrorBoundary fallback={<GlobalErrorFallback title="Research Module Unavailable" message="We couldn't load the research data at this time." />}>
            <div className={`transition-all duration-500 ${guideOpen ? 'pr-[400px]' : ''}`}>
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-100">Market Research</h2>
                        <button
                            onClick={() => setGuideOpen(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transform hover:scale-105"
                        >
                            <BookOpen size={20} className="text-slate-900" />
                            How to Analyze
                        </button>
                    </div>

                    {/* AI Research Lab Section */}
                    {company && !loading && (
                        <div className="mt-12 border-t border-slate-800 pt-8">
                            <AIResearchLab ticker={company.symbol} realBeta={company.beta} />
                        </div>
                    )}

                    <FinancialGuide isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

                    <div className="glass-panel p-6 overflow-visible relative z-50">
                        <div className="flex gap-4 relative">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 text-slate-500" size={20} />
                                <input
                                    type="text"
                                    value={inputTicker}
                                    onChange={(e) => {
                                        setInputTicker(e.target.value.toUpperCase());
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => {
                                        if (inputTicker.length > 1) setShowSuggestions(true);
                                        setShowRecent(true);
                                    }}
                                    onBlur={() => setTimeout(() => { setShowSuggestions(false); setShowRecent(false); }, 200)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-10 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 transition-all"
                                    placeholder="Search Ticker (e.g., NVDA, TSLA)"
                                    autoComplete="off"
                                />
                                {inputTicker && (
                                    <button
                                        onClick={() => { setInputTicker(""); setShowSuggestions(false); }}
                                        className="absolute right-3 top-2.5 text-slate-500 hover:text-white transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                                {/* Autocomplete Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                                        {suggestions.map((s) => (
                                            <div
                                                key={s.symbol}
                                                onClick={() => handleSearch(s.symbol)}
                                                className="px-4 py-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800/50 last:border-0 flex justify-between items-center group"
                                            >
                                                <div>
                                                    <div className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{s.symbol}</div>
                                                    <div className="text-xs text-slate-500">{s.name}</div>
                                                </div>
                                                <div className="text-xs text-slate-600 border border-slate-800 px-2 py-0.5 rounded">{s.exch}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => handleSearch()}
                                disabled={loading}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Searching...' : 'Research'}
                            </button>
                            {company && (
                                <button
                                    onClick={async () => {
                                        const btn = document.getElementById('report-btn');
                                        if (btn) {
                                            btn.innerText = "Generating...";
                                            btn.setAttribute('disabled', 'true');
                                        }
                                        try {
                                            const res = await generateAIAnalystReport(company.symbol);

                                            // Create a Blob and download it
                                            const blob = new Blob([res.report_content], { type: 'text/markdown' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `${company.symbol}_Analyst_Report.md`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(url);
                                        } catch (e) {
                                            console.error("Report generation failed", e);
                                            alert("Failed to generate report.");
                                        } finally {
                                            if (btn) {
                                                btn.innerText = "Generate AI Report";
                                                btn.removeAttribute('disabled');
                                            }
                                        }
                                    }}
                                    id="report-btn"
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Newspaper size={16} />
                                    Generate AI Report
                                </button>
                            )}
                        </div>

                        {/* Recent & Trending */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {recentSearches.length > 0 && (
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-slate-500 flex items-center gap-1"><Clock size={14} /> Recent:</span>
                                    <div className="flex gap-2">
                                        {recentSearches.map(t => (
                                            <button
                                                key={t}
                                                onClick={() => handleSearch(t)}
                                                className="bg-slate-800/50 hover:bg-slate-700/80 text-cyan-400/80 hover:text-cyan-300 px-3 py-1 rounded-full transition-colors border border-slate-700/50 hover:border-cyan-500/30 font-medium"
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                                <div className="p-2 bg-red-500/20 rounded-full text-red-400">
                                    <X size={24} />
                                </div>
                                <div>
                                    <h4 className="text-red-400 font-bold">Search Failed</h4>
                                    <p className="text-red-300/80 text-sm">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Company Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {loading ? (
                                <div className="glass-panel p-6 space-y-6">
                                    <ShimmerSkeleton className="h-8 w-48 mb-2" />
                                    <ShimmerSkeleton className="h-24 w-full" />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[1, 2, 3, 4].map(i => <ShimmerSkeleton key={i} className="h-20 w-full" />)}
                                    </div>
                                </div>
                            ) : company && (
                                <>
                                    <div className="glass-panel p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-100">{company.name}</h2>
                                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                    <span className="bg-slate-800 px-2 py-1 rounded">{company.symbol}</span>
                                                    <span>{company.sector}</span>
                                                    <span>•</span>
                                                    <span>{company.industry}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-slate-500">Market Cap</div>
                                                <div className="text-xl font-mono text-slate-200">
                                                    ${(company.market_cap / 1e9).toFixed(2)}B
                                                </div>
                                            </div>
                                        </div>

                                        {priceChart}

                                        <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                            {company.summary.length > 500 ? company.summary.substring(0, 500) + "..." : company.summary}
                                        </p>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <MetricCard
                                                label="P/E Ratio"
                                                value={company.pe_ratio?.toFixed(2) || "N/A"}
                                                icon={<Activity size={16} className="text-cyan-400" />}
                                            />
                                            <MetricCard
                                                label="Div Yield"
                                                value={company.dividend_yield ? (company.dividend_yield * 100).toFixed(2) + "%" : "N/A"}
                                                icon={<DollarSign size={16} className="text-green-400" />}
                                                valueColor="text-green-400"
                                            />
                                            <MetricCard
                                                label="Beta"
                                                value={company.beta?.toFixed(2) || "N/A"}
                                                icon={<Activity size={16} className={(company.beta || 1) > 1.5 ? "text-red-400" : (company.beta || 1) < 0.8 ? "text-green-400" : "text-yellow-400"} />}
                                                valueColor={(company.beta || 1) > 1.5 ? "text-red-400" : (company.beta || 1) < 0.8 ? "text-green-400" : "text-white"}
                                            />
                                            <MetricCard
                                                label="52W High"
                                                value={company.fifty_two_week_high?.toFixed(2) || "N/A"}
                                                icon={<TrendingUp size={16} className="text-green-400" />}
                                            />
                                        </div>

                                        {/* Cash Flow Sankey */}
                                        <div className="mt-8 pt-6 border-t border-slate-800">
                                            {financials && <FinancialSankey ticker={company.symbol} data={financials} />}
                                        </div>

                                        {/* Detailed Financial Statements */}
                                        {financials && <FinancialStatements data={financials} />}
                                    </div>

                                    {/* AI Technical Analysis */}
                                    {company.technical_indicators && (
                                        <div className="glass-panel p-6">
                                            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                                                <Activity size={20} className="text-purple-400" />
                                                AI Technical Analysis
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <MetricCard
                                                    label="RSI (14D)"
                                                    value={company.technical_indicators.rsi.toFixed(2)}
                                                    icon={<Activity size={16} className={company.technical_indicators.rsi > 70 ? "text-red-400" : company.technical_indicators.rsi < 30 ? "text-green-400" : "text-slate-400"} />}
                                                />
                                                <MetricCard
                                                    label="MACD"
                                                    value={company.technical_indicators.macd.toFixed(2)}
                                                    icon={<TrendingUp size={16} className={company.technical_indicators.macd > 0 ? "text-green-400" : "text-red-400"} />}
                                                />
                                                <MetricCard
                                                    label="Signal"
                                                    value={company.technical_indicators.macd_signal.toFixed(2)}
                                                    icon={<Activity size={16} className="text-slate-400" />}
                                                />
                                                <MetricCard
                                                    label="Sentiment"
                                                    value={company.technical_indicators.sentiment}
                                                    icon={<TrendingUp size={16} className={company.technical_indicators.sentiment === "Bullish" ? "text-green-400" : "text-red-400"} />}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Deep Research Section */}
                                    {deepResearch && (
                                        <div className="mt-8 pt-6 border-t border-slate-800">
                                            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                                                <Globe size={20} className="text-blue-400" /> Professional Analysis
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <AnalystWidget data={deepResearch.analystRatings} />
                                                <OwnershipWidget data={deepResearch.ownership} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                                <AdvancedMetricsWidget data={deepResearch.advancedMetrics} />
                                                <InsiderWidget data={deepResearch.insiderTrading} />
                                            </div>
                                        </div>
                                    )}

                                    {/* News Section */}
                                    <div className="glass-panel p-6">
                                        <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                                            <Newspaper size={20} className="text-cyan-400" />
                                            Recent News
                                        </h3>
                                        <div className="space-y-4">
                                            {company.news && company.news.map((item: any, idx: number) => (
                                                <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="block group">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div>
                                                            <h4 className="text-slate-300 group-hover:text-cyan-400 transition-colors font-medium text-sm">
                                                                {item.title}
                                                            </h4>
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                {item.publisher} • {new Date(item.providerPublishTime * 1000).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Treasury Rates Sidebar */}
                        <div className="space-y-6">
                            <div className="glass-panel p-6">
                                <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                                    <Activity size={20} className="text-yellow-400" />
                                    Treasury Yields
                                </h3>
                                <div className="space-y-3">
                                    {treasury.map((rate: any) => (
                                        <div key={rate.symbol} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:bg-slate-800/80 hover:border-cyan-500/20 transition-all duration-300 group cursor-default">
                                            <div>
                                                <div className="text-sm font-bold text-slate-300 group-hover:text-cyan-400 transition-colors">{rate.name}</div>
                                                <div className="text-[10px] text-slate-500 font-mono tracking-wider">{rate.symbol}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-mono font-bold text-slate-200">{rate.yield.toFixed(3)}%</div>
                                                <div className={`text-xs ${rate.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {rate.change >= 0 ? '+' : ''}{rate.change.toFixed(3)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {treasuryLoading && (
                                        <div className="text-slate-500 text-sm text-center py-4">
                                            Loading rates...
                                        </div>
                                    )}
                                    {!treasuryLoading && treasury.length === 0 && (
                                        <div className="text-slate-500 text-sm text-center py-4">
                                            Rates unavailable
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default Research;
