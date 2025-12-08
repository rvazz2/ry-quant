"use client";

import React, { useState } from "react";
import { Split, ArrowDown } from "lucide-react";

const DuPontTree = ({ ticker }: { ticker: string }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const analyze = React.useCallback(async () => {
        if (!ticker) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8000/api/accounting/dupont/${ticker}`);
            if (!res.ok) throw new Error("Fetch failed");
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [ticker]);

    React.useEffect(() => {
        analyze();
    }, [analyze]);

    return (
        <div className="glass-panel p-6 border-l-4 border-emerald-500 space-y-6 h-full">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Split className="text-emerald-500" />
                        DuPont Decomposition
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Break down Return on Equity (ROE) into Efficiency, Profitability, and Leverage.
                    </p>
                </div>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
                    <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                    <span className="text-xs font-bold uppercase tracking-wider">Unpacking ROE Drivers...</span>
                </div>
            )}

            {data && (
                <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
                    {/* Top Level: ROE */}
                    <div className="p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-center w-48 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <div className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Return on Equity</div>
                        <div className="text-3xl font-black text-white">{(data.roe * 100).toFixed(2)}%</div>
                    </div>

                    <ArrowDown className="text-slate-600 my-2" />

                    <div className="flex justify-between w-full max-w-2xl relative">
                        {/* Connecting Lines (Manual SVG or Border Glue) */}
                        <div className="absolute top-0 left-1/6 right-1/6 h-[1px] bg-slate-600 -z-10 w-2/3 mx-auto translate-y-[-12px] hidden md:block"></div>

                        {/* 1. Net Margin */}
                        <div className="flex flex-col items-center">
                            <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-center w-36 hover:border-emerald-500/50 transition-colors">
                                <div className="text-[10px] text-slate-400 font-bold uppercase">Net Profit Margin</div>
                                <div className="text-xl font-bold text-cyan-400">{(data.net_margin * 100).toFixed(2)}%</div>
                                <div className="text-[10px] text-slate-500 mt-1">Profitability</div>
                            </div>
                        </div>

                        <div className="text-slate-600 text-xl font-bold pt-4">x</div>

                        {/* 2. Asset Turnover */}
                        <div className="flex flex-col items-center">
                            <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-center w-36 hover:border-emerald-500/50 transition-colors">
                                <div className="text-[10px] text-slate-400 font-bold uppercase">Asset Turnover</div>
                                <div className="text-xl font-bold text-purple-400">{data.asset_turnover.toFixed(2)}x</div>
                                <div className="text-[10px] text-slate-500 mt-1">Efficiency</div>
                            </div>
                        </div>

                        <div className="text-slate-600 text-xl font-bold pt-4">x</div>

                        {/* 3. Equity Multiplier */}
                        <div className="flex flex-col items-center">
                            <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-center w-36 hover:border-emerald-500/50 transition-colors">
                                <div className="text-[10px] text-slate-400 font-bold uppercase">Equity Multiplier</div>
                                <div className="text-xl font-bold text-amber-400">{data.leverage.toFixed(2)}x</div>
                                <div className="text-[10px] text-slate-500 mt-1">Leverage</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DuPontTree;
