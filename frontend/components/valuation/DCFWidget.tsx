"use client";

import React, { useState, useEffect } from 'react';
import { getCompanyInfo, getTreasuryRates } from '@/lib/api';
import { Search, TrendingUp, TrendingDown, DollarSign, Percent, Info, RefreshCw, Activity } from 'lucide-react';
import SensitivityMatrix from './SensitivityMatrix';
import CompsWidget from './CompsWidget';

const DCFWidget = ({ ticker }: { ticker: string }) => {
    const [loading, setLoading] = useState(false);
    const [company, setCompany] = useState<any>(null);

    // DCF Inputs (Defaults)
    const [revenueGrowth, setRevenueGrowth] = useState(10); // 10%
    const [ebitMargin, setEbitMargin] = useState(25); // 25%
    const [testWacc, setTestWacc] = useState(9); // 9%
    const [terminalGrowth, setTerminalGrowth] = useState(3); // 3%
    const [taxRate, setTaxRate] = useState(21); // 21%

    // Financial Data (from API)
    const [baseRevenue, setBaseRevenue] = useState(0);
    const [sharesOutstanding, setSharesOutstanding] = useState(0); // Need to estimate or fetch
    const [currentPrice, setCurrentPrice] = useState(0);

    // Calculated Output
    const [intrinsicValue, setIntrinsicValue] = useState(0);
    const [projections, setProjections] = useState<any[]>([]);

    const [tenYearYield, setTenYearYield] = useState<number | null>(null);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const rates = await getTreasuryRates();
                const tnx = rates.find((r: any) => r.symbol === '^TNX');
                if (tnx) setTenYearYield(tnx.yield);
            } catch (e) { console.error(e); }
        };
        fetchRates();
    }, []);

    // Recalculate whenever inputs change
    useEffect(() => {
        calculateDCF();
    }, [revenueGrowth, ebitMargin, testWacc, terminalGrowth, baseRevenue, sharesOutstanding]);

    const handleSearch = React.useCallback(async () => {
        setLoading(true);
        try {
            const info = await getCompanyInfo(ticker);
            if (info) {
                setCompany(info);
                // Auto-fill assumptions based on real data if possible, or reasonable defaults
                setBaseRevenue(info.total_revenue || 50000000000); // Default $50B if missing
                setCurrentPrice(info.current_price || 150); // Default $150
                // Estimate shares if needed
                if (info.market_cap && info.current_price) {
                    setSharesOutstanding(info.market_cap / info.current_price);
                } else {
                    setSharesOutstanding(1000000000); // Default 1B shares
                }

                if (info.revenue_growth) setRevenueGrowth(Math.round(info.revenue_growth * 100));
                if (info.ebitda_margins) setEbitMargin(Math.round(info.ebitda_margins * 100)); // Proxy for EBIT
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [ticker]);

    // React to ticker prop change
    useEffect(() => {
        if (ticker) {
            handleSearch();
        }
    }, [ticker, handleSearch]);

    const calculateDCF = () => {
        if (!baseRevenue || !sharesOutstanding) return;

        let futureRevenue = baseRevenue;
        let sumPV = 0;
        const proj = [];

        // 5 Year Projection
        for (let i = 1; i <= 5; i++) {
            futureRevenue = futureRevenue * (1 + revenueGrowth / 100);
            const ebit = futureRevenue * (ebitMargin / 100);
            const nopat = ebit * (1 - taxRate / 100);
            const fcf = nopat; // Simplified: Assuming Capex = D&A and dWC = 0 for "2-Minute" version

            const discountFactor = Math.pow(1 + testWacc / 100, i);
            sumPV += fcf / discountFactor;

            proj.push({
                year: i,
                revenue: futureRevenue,
                ebit: ebit,
                fcf: fcf,
                pv: fcf / discountFactor
            });
        }
        setProjections(proj);

        // Terminal Value
        const terminalValue = (futureRevenue * (1 + terminalGrowth / 100)) / ((testWacc / 100) - (terminalGrowth / 100));
        const pvTerminal = terminalValue / Math.pow(1 + testWacc / 100, 5);

        const enterpriseValue = sumPV + pvTerminal;
        const equityValue = enterpriseValue; // SImplified: Assuming Net Debt = 0 for this widget
        const perShare = equityValue / sharesOutstanding;

        setIntrinsicValue(perShare);
    };

    // Tab State
    const [activeTab, setActiveTab] = useState<'dcf' | 'comps'>('dcf');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Inputs Panel */}
            <div className="lg:col-span-1 space-y-6">
                <div className="glass-panel p-6 h-full">
                    <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                        <RefreshCw size={20} className="text-cyan-400" /> Inputs
                    </h3>

                    {/* View Switcher */}
                    <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 mb-6">
                        <button
                            onClick={() => setActiveTab('dcf')}
                            className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${activeTab === 'dcf' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            DCF Valuation
                        </button>
                        <button
                            onClick={() => setActiveTab('comps')}
                            className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${activeTab === 'comps' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Relative Comps
                        </button>
                    </div>

                    {loading && <div className="text-sm text-cyan-400 animate-pulse mb-4">Fetching financial data...</div>}

                    {/* Sliders (Only show if DCF tab is active) */}
                    {activeTab === 'dcf' && (
                        <div className="animate-in fade-in duration-300">
                            <SliderControl label="Revenue Growth" value={revenueGrowth} onChange={setRevenueGrowth} min={0} max={50} unit="%" />
                            <SliderControl label="EBIT Margin" value={ebitMargin} onChange={setEbitMargin} min={0} max={60} unit="%" />
                            <div className="relative">
                                <SliderControl label="WACC (Discount Rate)" value={testWacc} onChange={setTestWacc} min={5} max={20} unit="%" />
                                {tenYearYield && (
                                    <div className="absolute top-0 right-0 -mt-1 mr-16 flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                        <Activity size={10} className="text-yellow-400" />
                                        10Y Risk-Free: <span className="text-white font-mono">{tenYearYield.toFixed(2)}%</span>
                                    </div>
                                )}
                            </div>
                            <SliderControl label="Terminal Growth" value={terminalGrowth} onChange={setTerminalGrowth} min={1} max={5} unit="%" />
                        </div>
                    )}
                </div>
            </div>

            {/* Output Panel */}
            <div className="lg:col-span-2 space-y-6">
                {activeTab === 'dcf' ? (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="glass-panel p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                            <h2 className="text-slate-400 text-lg uppercase tracking-widest font-bold mb-2">Intrinsic Value per Share</h2>
                            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
                                ${intrinsicValue.toFixed(2)}
                            </div>

                            {currentPrice > 0 && (
                                <div className="flex items-center gap-4 bg-slate-800/50 px-6 py-3 rounded-full border border-slate-700">
                                    <span className="text-slate-400">Current Price: <span className="text-white font-mono">${currentPrice.toFixed(2)}</span></span>
                                    <div className={`h-4 w-[1px] bg-slate-600`}></div>
                                    <span className={`${intrinsicValue > currentPrice ? "text-emerald-400" : "text-rose-400"} font-bold flex items-center gap-1`}>
                                        {intrinsicValue > currentPrice ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                        {Math.abs(((intrinsicValue - currentPrice) / currentPrice) * 100).toFixed(1)}% {intrinsicValue > currentPrice ? "Undervalued" : "Overvalued"}
                                    </span>
                                </div>
                            )}

                        </div>

                        {/* Sensitivity Matrix */}
                        <div className="mt-8">
                            <SensitivityMatrix
                                baseRevenue={baseRevenue}
                                revenueGrowth={revenueGrowth}
                                ebitMargin={ebitMargin}
                                taxRate={taxRate}
                                wacc={testWacc}
                                terminalGrowth={terminalGrowth}
                                sharesOutstanding={sharesOutstanding}
                                currentPrice={currentPrice}
                            />
                        </div>
                        {/* Projections Table */}
                        {projections.length > 0 && (
                            <div className="w-full mt-8 border-t border-slate-800 pt-6">
                                <h4 className="text-slate-300 font-bold mb-4 text-left">Projected Cash Flows</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="text-slate-500 uppercase bg-slate-800/50">
                                            <tr>
                                                <th className="px-2 py-2">Year</th>
                                                <th className="px-2 py-2">Revenue</th>
                                                <th className="px-2 py-2">EBIT</th>
                                                <th className="px-2 py-2">FCF</th>
                                                <th className="px-2 py-2">PV</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {projections.map((p) => (
                                                <tr key={p.year}>
                                                    <td className="px-2 py-2 font-mono text-slate-400">Year {p.year}</td>
                                                    <td className="px-2 py-2 text-slate-300">${(p.revenue / 1e9).toFixed(1)}B</td>
                                                    <td className="px-2 py-2 text-slate-300">${(p.ebit / 1e9).toFixed(1)}B</td>
                                                    <td className="px-2 py-2 font-bold text-cyan-400">${(p.fcf / 1e9).toFixed(1)}B</td>
                                                    <td className="px-2 py-2 text-slate-500">${(p.pv / 1e9).toFixed(1)}B</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <CompsWidget ticker={ticker} />
                    </div>
                )}
            </div>
        </div>
    );
};

interface SliderControlProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    min: number;
    max: number;
    unit: string;
}

const SliderControl = ({ label, value, onChange, min, max, unit }: SliderControlProps) => (
    <div className="mb-6 last:mb-0">
        <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-300 font-medium">{label}</span>
            <span className="text-sm font-mono text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-500/20">{value}{unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
    </div>
);

export default DCFWidget;
