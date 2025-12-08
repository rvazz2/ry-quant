"use client";

import React, { useState } from 'react';
import { X, BookOpen, Activity, BarChart2, TrendingUp, Database, Cpu, Globe, Search, Layers, Zap, GraduationCap, Lightbulb, AlertTriangle, Landmark, Shield, Book, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';

import TaxStrategy2025 from './guide/TaxStrategy2025';
import SupplyChain2025 from './guide/SupplyChain2025';

interface FinancialGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

import { createPortal } from 'react-dom';

const FinancialGuide = ({ isOpen, onClose }: FinancialGuideProps) => {
    const [activeSection, setActiveSection] = useState('tax2025');
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
        // Prevent scrolling when modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const sections = [
        { id: 'tax2025', label: '2025 Tax Strategy', icon: <Calendar size={18} className="text-emerald-400" /> },
        { id: 'supply', label: 'Global Supply Chain', icon: <Globe size={18} className="text-blue-400" /> },
        { id: 'chart', label: 'Technical Analysis', icon: <Activity size={18} /> },
        { id: 'stats', label: 'Fundamental Stats', icon: <BarChart2 size={18} /> },
        { id: 'macro', label: 'Macroeconomics', icon: <Globe size={18} /> },
        { id: 'risk', label: 'Risk Management', icon: <Shield size={18} /> },
        { id: 'algo', label: 'Algo Trading', icon: <Cpu size={18} /> },
        { id: 'glossary', label: 'Glossary', icon: <Book size={18} /> },
    ];

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-6xl h-[85vh] shadow-2xl animate-in fade-in zoom-in duration-200 flex overflow-hidden">

                {/* Sidebar Navigation */}
                <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
                    <div className="p-6 border-b border-slate-800">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xl mb-1">
                            <GraduationCap />
                            Masterclass
                        </div>
                        <p className="text-xs text-slate-500">Professional Trading Guide</p>
                    </div>
                    <div className="flex-1 overflow-y-auto py-4 space-y-1">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all border-l-2 ${activeSection === section.id
                                    ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                    }`}
                            >
                                {section.icon}
                                {section.label}
                            </button>
                        ))}
                    </div>
                    <div className="p-4 border-t border-slate-800">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex gap-3 items-start">
                            <Lightbulb className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                            <p className="text-xs text-yellow-200/80">
                                <strong>Pro Tip:</strong> Real traders focus on risk management, not just returns.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/95 backdrop-blur z-10">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-100">
                                {sections.find(s => s.id === activeSection)?.label}
                            </h2>
                            <p className="text-slate-400 text-sm">Comprehensive guide for institutional-grade analysis.</p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {activeSection === 'tax2025' && <TaxStrategy2025 />}
                        {activeSection === 'supply' && <SupplyChain2025 />}

                        {activeSection === 'chart' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <Section title="Price Action & Candlesticks" icon={<Activity className="text-cyan-400" />}>
                                    <p className="text-slate-300 mb-6 leading-relaxed">
                                        The chart is the heartbeat of the market. Professional traders read <strong>Japanese Candlesticks</strong> to understand the psychology of buyers and sellers at a glance.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card title="Green (Bullish) Candle" icon={<TrendingUp size={16} />} color="emerald">
                                            <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
                                                <li><strong>Close &gt; Open:</strong> Buyers won the session.</li>
                                                <li><strong>Body:</strong> The "meat" of the move. Large body = Strong conviction.</li>
                                                <li><strong>Lower Wick:</strong> "Buying the Dip." Price dropped but was rejected.</li>
                                            </ul>
                                        </Card>
                                        <Card title="Red (Bearish) Candle" icon={<TrendingUp size={16} className="rotate-180" />} color="rose">
                                            <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
                                                <li><strong>Close &lt; Open:</strong> Sellers took control.</li>
                                                <li><strong>Upper Wick:</strong> "Selling the Rip." Price rallied but failed.</li>
                                                <li><strong>Doji:</strong> Tiny body. Indecision. Often signals a reversal.</li>
                                            </ul>
                                        </Card>
                                    </div>
                                </Section>

                                <Section title="Chart Patterns" icon={<Layers className="text-purple-400" />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card title="Reversal Patterns" icon={<ArrowUpRight size={16} />} color="yellow">
                                            <ul className="text-sm text-slate-300 space-y-2">
                                                <li><strong>Head & Shoulders:</strong> Classic bearish reversal. Price makes a higher high (head) between two lower highs (shoulders).</li>
                                                <li><strong>Double Bottom:</strong> "W" shape. Bullish reversal indicating support is holding.</li>
                                            </ul>
                                        </Card>
                                        <Card title="Continuation Patterns" icon={<ArrowUpRight size={16} />} color="cyan">
                                            <ul className="text-sm text-slate-300 space-y-2">
                                                <li><strong>Bull Flag:</strong> Sharp rally (pole) followed by a consolidation channel (flag). Usually breaks out higher.</li>
                                                <li><strong>Cup & Handle:</strong> Long-term bullish consolidation. Looks like a tea cup.</li>
                                            </ul>
                                        </Card>
                                    </div>
                                </Section>

                                <Section title="Trend & Momentum" icon={<Zap className="text-yellow-400" />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <MetricDefinition
                                            label="RSI (Relative Strength Index)"
                                            desc="Momentum oscillator (0-100)."
                                            sub="&gt;70 = Overbought (Risk of pullback). &lt;30 = Oversold (Potential bounce)."
                                        />
                                        <MetricDefinition
                                            label="MACD"
                                            desc="Trend-following momentum."
                                            sub="Signal Line Crossover = Buy/Sell trigger. Histogram shows strength."
                                        />
                                        <MetricDefinition
                                            label="Moving Averages (SMA)"
                                            desc="Smoothed price history."
                                            sub="200-Day SMA is the 'Line in the Sand' for Bull vs Bear markets."
                                        />
                                        <MetricDefinition
                                            label="Volume"
                                            desc="The fuel of the market."
                                            sub="Price up + Volume up = Strong trend. Price up + Volume down = Weakness."
                                        />
                                    </div>
                                </Section>
                            </div>
                        )}

                        {activeSection === 'stats' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <Section title="The Three Statements" icon={<BookOpen className="text-indigo-400" />}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card title="Income Statement" icon={<Activity size={16} />} color="emerald">
                                            <p className="text-xs text-slate-300"><strong>"The Scorecard"</strong>. Revenue, Expenses, and Net Income (Profit). Shows performance over a period.</p>
                                        </Card>
                                        <Card title="Balance Sheet" icon={<Layers size={16} />} color="blue">
                                            <p className="text-xs text-slate-300"><strong>"The Snapshot"</strong>. Assets = Liabilities + Equity. Shows financial health at a specific moment.</p>
                                        </Card>
                                        <Card title="Cash Flow" icon={<ArrowDownRight size={16} />} color="yellow">
                                            <p className="text-xs text-slate-300"><strong>"The Truth"</strong>. Cash in vs. Cash out. Harder to fake than Net Income.</p>
                                        </Card>
                                    </div>
                                </Section>

                                <Section title="Valuation: Is it Cheap?" icon={<BarChart2 className="text-green-400" />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <MetricDefinition
                                            label="P/E Ratio"
                                            desc="Price per $1 of Earnings."
                                            sub="High (&gt;30) = Growth Stock. Low (&lt;15) = Value Stock."
                                        />
                                        <MetricDefinition
                                            label="PEG Ratio"
                                            desc="P/E adjusted for Growth rate."
                                            sub="&lt;1.0 is the 'Holy Grail' of undervalued growth."
                                        />
                                        <MetricDefinition
                                            label="Enterprise Value (EV)"
                                            desc="Market Cap + Debt - Cash."
                                            sub="The true price tag to buy the entire company."
                                        />
                                        <MetricDefinition
                                            label="Free Cash Flow Yield"
                                            desc="FCF / Market Cap."
                                            sub="The actual cash return you'd get if you bought the whole company."
                                        />
                                    </div>
                                </Section>

                                <Section title="Risk Metrics" icon={<AlertTriangle className="text-orange-400" />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <MetricDefinition
                                            label="Beta"
                                            desc="Volatility relative to S&P 500."
                                            sub="Beta 1.5 = Stock moves 1.5% for every 1% market move."
                                        />
                                        <MetricDefinition
                                            label="Short Interest"
                                            desc="% of float sold short."
                                            sub="&gt;20% is extremely high. Setup for a 'Short Squeeze'."
                                        />
                                    </div>
                                </Section>
                            </div>
                        )}

                        {activeSection === 'macro' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <Section title="The Big Picture" icon={<Globe className="text-blue-400" />}>
                                    <p className="text-slate-300 mb-6">
                                        Macroeconomics drives the bus; individual stocks are just passengers. Understanding the "Macro" environment is crucial for knowing when to be aggressive and when to be defensive.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card title="The Federal Reserve" icon={<Landmark size={16} />} color="slate">
                                            <ul className="text-sm text-slate-300 space-y-2">
                                                <li><strong>Interest Rates:</strong> The "Cost of Money". Higher rates hurt stocks (especially tech) but help savers.</li>
                                                <li><strong>QE / QT:</strong> "Printing Money" (QE) boosts assets. "Burning Money" (QT) depresses them.</li>
                                                <li><strong>"Don't Fight the Fed":</strong> If they are easing, buy. If they are tightening, beware.</li>
                                            </ul>
                                        </Card>
                                        <Card title="Key Indicators" icon={<Activity size={16} />} color="cyan">
                                            <ul className="text-sm text-slate-300 space-y-2">
                                                <li><strong>GDP:</strong> Economic growth. Two negative quarters = Recession.</li>
                                                <li><strong>CPI / PCE:</strong> Inflation. The Fed raises rates to kill inflation.</li>
                                                <li><strong>Unemployment:</strong> Low is good for people, but can cause inflation (wage spiral).</li>
                                            </ul>
                                        </Card>
                                    </div>
                                </Section>
                            </div>
                        )}

                        {activeSection === 'risk' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <Section title="Defense Wins Championships" icon={<Shield className="text-emerald-400" />}>
                                    <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl mb-6">
                                        <h4 className="text-red-400 font-bold text-lg mb-2">Rule #1: Don't Lose Money</h4>
                                        <p className="text-slate-300 text-sm">
                                            If you lose 50% of your account, you need a 100% gain just to get back to even. Capital preservation is the primary job of a trader.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card title="Position Sizing" icon={<Layers size={16} />} color="blue">
                                            <p className="text-xs text-slate-300">Never risk more than 1-2% of your total account on a single trade. This prevents "blowing up".</p>
                                        </Card>
                                        <Card title="Stop Losses" icon={<AlertTriangle size={16} />} color="yellow">
                                            <p className="text-xs text-slate-300">Know your exit BEFORE you enter. A mental or hard stop loss is your insurance policy.</p>
                                        </Card>
                                        <Card title="Psychology" icon={<Zap size={16} />} color="purple">
                                            <p className="text-xs text-slate-300"><strong>FOMO</strong> (Fear Of Missing Out) and <strong>Revenge Trading</strong> are account killers. Stay disciplined.</p>
                                        </Card>
                                    </div>
                                </Section>
                            </div>
                        )}



                        {activeSection === 'algo' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <Section title="The Black Box" icon={<Cpu className="text-pink-400" />}>
                                    <p className="text-slate-300 mb-6">
                                        Algorithmic trading removes human emotion. It executes strict mathematical rules at lightning speed.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card title="Mean Reversion" icon={<Activity size={16} />} color="cyan">
                                            <p className="text-xs text-slate-400">"What goes up must come down." Betting on price returning to average.</p>
                                        </Card>
                                        <Card title="Momentum" icon={<Zap size={16} />} color="yellow">
                                            <p className="text-xs text-slate-400">"The trend is your friend." Buying breakouts and riding the wave.</p>
                                        </Card>
                                        <Card title="Arbitrage" icon={<Globe size={16} />} color="green">
                                            <p className="text-xs text-slate-400">Risk-free profit from price differences across exchanges.</p>
                                        </Card>
                                    </div>
                                </Section>

                                <Section title="Key Metrics" icon={<Layers className="text-slate-400" />}>
                                    <div className="space-y-2">
                                        <MetricDefinition label="Sharpe Ratio" desc="Return per unit of risk. &gt;2.0 is excellent." />
                                        <MetricDefinition label="Max Drawdown" desc="Worst peak-to-valley loss. The 'Pain' metric." />
                                        <MetricDefinition label="Win Rate" desc="% of profitable trades. Even 55% can make millions." />
                                    </div>
                                </Section>
                            </div>
                        )}

                        {activeSection === 'glossary' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <Section title="Financial Glossary" icon={<Book className="text-slate-400" />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <MetricDefinition label="Alpha" desc="Return generated above the market benchmark." />
                                        <MetricDefinition label="Beta" desc="Measure of a stock's volatility relative to the market." />
                                        <MetricDefinition label="CAGR" desc="Compound Annual Growth Rate. The smoothed annual return." />
                                        <MetricDefinition label="Delta" desc="Option greek. How much option price moves for $1 stock move." />
                                        <MetricDefinition label="EBITDA" desc="Earnings Before Interest, Taxes, Depreciation, Amortization. Proxy for cash flow." />
                                        <MetricDefinition label="EPS" desc="Earnings Per Share. Net Income divided by share count." />
                                        <MetricDefinition label="Float" desc="Number of shares available for trading by the public." />
                                        <MetricDefinition label="Gamma" desc="Rate of change of Delta. Acceleration of the option price." />
                                        <MetricDefinition label="Hedge" desc="A trade designed to reduce the risk of adverse price movements." />
                                        <MetricDefinition label="IPO" desc="Initial Public Offering. When a private company goes public." />
                                        <MetricDefinition label="Liquidity" desc="How easily an asset can be bought or sold without moving the price." />
                                        <MetricDefinition label="Market Cap" desc="Total value of a company's shares (Price x Shares Outstanding)." />
                                        <MetricDefinition label="NAV" desc="Net Asset Value. The value of a fund's assets minus liabilities." />
                                        <MetricDefinition label="P/E Ratio" desc="Price-to-Earnings. A valuation ratio." />
                                        <MetricDefinition label="ROI" desc="Return on Investment. Profit divided by cost." />
                                        <MetricDefinition label="Short Selling" desc="Betting a stock will go down by borrowing and selling it." />
                                        <MetricDefinition label="Theta" desc="Time decay. How much an option loses value each day." />
                                        <MetricDefinition label="Volatility" desc="The magnitude of price movements (Standard Deviation)." />
                                        <MetricDefinition label="Yield" desc="Income return on an investment (Dividend / Price)." />
                                        <MetricDefinition label="Z-Score" desc="Statistical measure of how far a data point is from the mean." />
                                    </div>
                                </Section>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-800">
            {icon}
            {title}
        </h3>
        {children}
    </div>
);

const Card = ({ title, icon, color, children }: { title: string, icon: React.ReactNode, color: string, children: React.ReactNode }) => {
    const colorClasses = {
        emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
        rose: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
        cyan: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
        yellow: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5',
        green: 'text-green-400 border-green-500/20 bg-green-500/5',
        blue: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
        purple: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
        slate: 'text-slate-400 border-slate-500/20 bg-slate-500/5',
    }[color] || 'text-slate-400 border-slate-700 bg-slate-800/50';

    return (
        <div className={`p-4 rounded-lg border ${colorClasses}`}>
            <h4 className="font-bold mb-2 flex items-center gap-2">{icon} {title}</h4>
            {children}
        </div>
    );
};

const MetricDefinition = ({ label, desc, sub }: { label: string, desc: string, sub?: string }) => (
    <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
        <h4 className="text-cyan-400 font-bold text-sm mb-1">{label}</h4>
        <p className="text-slate-300 text-sm mb-1">{desc}</p>
        {sub && <p className="text-slate-500 text-xs italic">{sub}</p>}
    </div>
);

export default FinancialGuide;
