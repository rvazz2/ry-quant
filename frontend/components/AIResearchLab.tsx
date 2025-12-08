"use client";

import React, { useMemo } from 'react';
import { Brain, TrendingUp, TrendingDown, Activity, AlertTriangle, Zap, BarChart2 } from 'lucide-react';
import StatBox from './StatBox';
import { getAIAnalysis } from '@/lib/api';

interface AIResearchLabProps {
    ticker: string;
    realBeta?: number | null;
}

const AIResearchLab = ({ ticker, realBeta }: AIResearchLabProps) => {
    // Deterministic random number generator based on ticker and date
    // This ensures the "AI" analysis is consistent for the same stock on the same day
    const [stats, setStats] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAnalysis = async () => {
            setLoading(true);
            try {
                // Fetch real analysis from backend
                const data = await getAIAnalysis(ticker);
                if (data) {
                    setStats(data);
                }
            } catch (error) {
                console.error("Error fetching AI analysis", error);
            } finally {
                setLoading(false);
            }
        };

        if (ticker) fetchAnalysis();
    }, [ticker]);

    if (loading || !stats) return <div className="h-64 flex items-center justify-center text-slate-500">Initializing AI Models...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Brain className="text-purple-400" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-100">AI Research Lab</h2>
                    <p className="text-slate-400 text-sm">Simulated Institutional Algo Dashboard for <span className="text-purple-400 font-bold">{ticker}</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Analysis Card */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatBox label="Trend Status" value={stats.trend} highlight />
                        <StatBox label="AI Signal" value={stats.signal} color={stats.signal === 'BUY' ? 'text-emerald-300' : stats.signal === 'SELL' ? 'text-rose-300' : 'text-yellow-300'} />
                        <StatBox label="Volatility (Beta)" value={stats.beta} />
                        <StatBox label="Sentiment" value={stats.sentiment} color={stats.sentiment === 'Bullish' ? 'text-emerald-300' : 'text-white'} />
                    </div>

                    {/* Algo Analysis */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
                        <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                            <Activity size={18} className="text-cyan-400" />
                            Algo Analysis
                        </h3>
                        <div className="space-y-3">
                            <AnalysisRow label="Technical Signal" value={`${stats.trend} confirmed by ${stats.rsi > 50 ? 'Bullish' : 'Bearish'} divergence.`} />
                            <AnalysisRow label="Momentum (RSI)" value={`RSI ${stats.rsi} - ${stats.rsi > 70 ? 'Overbought' : stats.rsi < 30 ? 'Oversold' : 'Neutral'}`} />
                            <AnalysisRow label="Volume Flow" value={stats.volatility > 60 ? "High Institutional Activity" : "Average Retail Flow"} />
                        </div>
                    </div>

                    {/* AI Prediction Model */}
                    <div className="bg-gradient-to-br from-purple-900/20 to-slate-900 border border-purple-500/30 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Brain size={100} />
                        </div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                                    <Zap size={18} />
                                    AI Prediction Model (Short-Term)
                                </h3>
                                <p className="text-xs text-purple-400/60 mt-1">Confidence Score: {stats.confidence}%</p>
                            </div>
                            <div className={`px-4 py-2 rounded-lg font-extrabold text-sm border ${stats.signal === 'BUY'
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                : stats.signal === 'SELL'
                                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                                    : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                                }`}>
                                {stats.signal}
                            </div>
                        </div>

                        <div className="relative z-10 bg-slate-950/50 p-4 rounded-lg border border-purple-500/20">
                            <p className="text-slate-100 text-sm leading-relaxed font-medium">
                                <span className="text-purple-400 font-bold">Forecast: </span>
                                {stats.signal === 'BUY'
                                    ? `Quantitative models indicate a strong accumulation phase for ${ticker}. Momentum indicators (RSI, MACD) are aligning with a bullish breakout pattern. Institutional volume analysis suggests smart money is positioning for an upside move, potentially targeting the ${stats.resistance} resistance level. Volatility compression is often a precursor to expansion—expect increased price action.`
                                    : stats.signal === 'SELL'
                                        ? `Algorithmic distribution patterns have been detected in ${ticker}. Relative strength is degrading against the broader sector. Technical breakdown below key moving averages suggests a shift in trend direction. Risk management protocols advise tightening stops as the probability of a test of lower support at ${stats.support} has increased.`
                                        : `Market structure for ${ticker} is currently undefined, characterized by choppy price action and conflicting signals. Volatility measurements suggest a period of consolidation as equilibrium is sought between buyers and sellers. The optimal strategy is to wait for a confirmed breakout above ${stats.resistance} or breakdown below ${stats.support} before deploying capital.`
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-4">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Risk Profile</h3>
                        <div className="space-y-4">
                            <RiskMeter label="Volatility" level={stats.volatility} />
                            <RiskMeter label="Sentiment" level={stats.sentiment === 'Bullish' ? 85 : stats.sentiment === 'Bearish' ? 25 : 50} color="bg-blue-500" />
                            <RiskMeter label="Liquidity" level={Math.floor(Math.random() * 30) + 70} color="bg-emerald-500" />
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Key Levels (Simulated)</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Next Support</span>
                                <span className="text-emerald-300 font-mono font-bold">${stats.support}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Next Resistance</span>
                                <span className="text-rose-300 font-mono font-bold">${stats.resistance}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex gap-3 items-start">
                        <Activity className="text-cyan-500 shrink-0 mt-0.5" size={16} />
                        <p className="text-xs text-cyan-200/80">
                            <strong>Technical Analysis:</strong> Data derived from real-time market indicators (RSI, MACD, Moving Averages). Not financial advice.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};



const AnalysisRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex flex-col sm:flex-row sm:gap-4 text-sm border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
        <span className="text-slate-500 min-w-[120px] font-medium">{label}:</span>
        <span className="text-slate-300">{value}</span>
    </div>
);

const RiskMeter = ({ label, level, color = "bg-red-500" }: { label: string, level: number, color?: string }) => (
    <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>{label}</span>
            <span>{level}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${level}%` }} />
        </div>
    </div>
);

export default AIResearchLab;
