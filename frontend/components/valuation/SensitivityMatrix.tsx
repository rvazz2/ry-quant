"use client";

import React from 'react';

interface SensitivityMatrixProps {
    baseRevenue: number;
    revenueGrowth: number;
    ebitMargin: number;
    taxRate: number;
    wacc: number;
    terminalGrowth: number;
    sharesOutstanding: number;
    currentPrice: number;
}

const SensitivityMatrix = ({
    baseRevenue,
    revenueGrowth,
    ebitMargin,
    taxRate,
    wacc,
    terminalGrowth,
    sharesOutstanding,
    currentPrice
}: SensitivityMatrixProps) => {

    const calculateIntrinsicValue = (w: number, g: number) => {
        if (!baseRevenue || !sharesOutstanding) return 0;

        let futureRevenue = baseRevenue;
        let sumPV = 0;

        // 5 Year Projection
        for (let i = 1; i <= 5; i++) {
            futureRevenue = futureRevenue * (1 + revenueGrowth / 100);
            const ebit = futureRevenue * (ebitMargin / 100);
            const nopat = ebit * (1 - taxRate / 100);
            const fcf = nopat;

            const discountFactor = Math.pow(1 + w / 100, i);
            sumPV += fcf / discountFactor;
        }

        // Terminal Value
        // Ensure denominator is not zero or negative
        const denominator = (w / 100) - (g / 100);
        if (denominator <= 0) return 0;

        const terminalValue = (futureRevenue * (1 + g / 100)) / denominator;
        const pvTerminal = terminalValue / Math.pow(1 + w / 100, 5);

        const enterpriseValue = sumPV + pvTerminal;
        const equityValue = enterpriseValue;
        const perShare = equityValue / sharesOutstanding;

        return perShare;
    };

    // Generate Ranges
    // WACC: Center +/- 0.5% steps (5 rows)
    const waccSteps = [-1.0, -0.5, 0, 0.5, 1.0].map(step => wacc + step);

    // Terminal Growth: Center +/- 0.25% steps (5 cols)
    const growthSteps = [-0.5, -0.25, 0, 0.25, 0.5].map(step => terminalGrowth + step);

    return (
        <div className="glass-panel p-6 overflow-x-auto">
            <h3 className="text-lg font-bold text-slate-200 mb-4">Sensitivity Analysis (Price Target)</h3>
            <p className="text-xs text-slate-500 mb-4">
                Matrix shows Intrinsic Value based on varying WACC (Rows) and Terminal Growth (Columns).
            </p>

            <table className="w-full text-center border-collapse">
                <thead>
                    <tr>
                        <th className="p-2 text-xs text-slate-500 font-medium border-b border-slate-700 bg-slate-900/50">
                            WACC \ Growth
                        </th>
                        {growthSteps.map(g => (
                            <th key={g} className="p-2 text-xs text-slate-300 font-bold border-b border-slate-700 bg-slate-900/50">
                                {g.toFixed(2)}%
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {waccSteps.map(w => (
                        <tr key={w}>
                            <td className="p-2 text-xs text-slate-300 font-bold border-r border-slate-700 bg-slate-900/50">
                                {w.toFixed(1)}%
                            </td>
                            {growthSteps.map(g => {
                                const val = calculateIntrinsicValue(w, g);
                                const diff = ((val - currentPrice) / currentPrice) * 100;

                                // Color Logic
                                let bgClass = "bg-slate-800/30";
                                let textClass = "text-slate-300";

                                if (currentPrice > 0) {
                                    if (diff > 15) { bgClass = "bg-emerald-500/20"; textClass = "text-emerald-400"; }
                                    else if (diff > 0) { bgClass = "bg-emerald-500/10"; textClass = "text-emerald-200"; }
                                    else if (diff > -15) { bgClass = "bg-rose-500/10"; textClass = "text-rose-200"; }
                                    else { bgClass = "bg-rose-500/20"; textClass = "text-rose-400"; }
                                }

                                return (
                                    <td key={`${w}-${g}`} className={`p-3 border border-slate-800 ${bgClass}`}>
                                        <div className={`font-mono font-bold ${textClass}`}>${val.toFixed(2)}</div>
                                        {currentPrice > 0 && (
                                            <div className="text-[10px] opacity-60">
                                                {diff > 0 ? "+" : ""}{diff.toFixed(0)}%
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SensitivityMatrix;
