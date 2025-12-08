"use client";

import React, { useEffect, useState } from 'react';
import { getFinancials } from '@/lib/api';
import { ShimmerSkeleton } from './LoadingSkeleton';

interface FinancialSankeyProps {
    ticker: string;
    data?: any; // Optional passed data
}

const FinancialSankey: React.FC<FinancialSankeyProps> = ({ ticker, data: initialData }) => {
    const [data, setData] = useState<any>(initialData?.sankey_data || null);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<string | null>(null);

    const fetchFinancials = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getFinancials(ticker);
            if (!result || !result.sankey_data) {
                setData(null); // Explicitly set null to trigger "No data" UI instead of error
                // Don't throw here if we want to show the "No financial data" message
                return;
            }
            setData(result.sankey_data);
        } catch (error) {
            console.error("Failed to fetch financials", error);
            setError("Failed to load financial data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialData?.sankey_data) {
            setData(initialData.sankey_data);
        } else {
            fetchFinancials();
        }
    }, [initialData, ticker]);

    if (loading) return <ShimmerSkeleton className="h-[400px] w-full rounded-xl" />;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                <p className="mb-4">{error}</p>
                <button
                    onClick={fetchFinancials}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-bold transition-colors"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    if (!data) return <div className="text-slate-500 text-sm">No financial data available for Sankey diagram.</div>;

    // Memoize heavy calculations
    const {
        revenue, cogs, gross_profit, rd, sga, other_opex, op_income, tax, interest, net_income,
        x1, x2, x3, x4, y1,
        hRevenue, hCOGS, hGross, hRD, hSGA, hOther, hOpIncome, hTax, hInterest, hNet,
        scale
    } = React.useMemo(() => {
        if (!data) return {} as any;

        const { revenue, cogs, gross_profit, rd, sga, other_opex, op_income, tax, interest, net_income } = data;

        // Dimensions
        const width = 800;
        const height = 400;
        const padding = 20;

        // Scale factor (pixels per dollar)
        const scale = (height - padding * 2) / revenue;

        // X Positions
        const x1 = 50;
        const x2 = 300;
        const x3 = 550;
        const x4 = 750;
        const y1 = padding;

        return {
            revenue, cogs, gross_profit, rd, sga, other_opex, op_income, tax, interest, net_income,
            x1, x2, x3, x4, y1,
            hRevenue: revenue * scale,
            hCOGS: cogs * scale,
            hGross: gross_profit * scale,
            hRD: rd * scale,
            hSGA: sga * scale,
            hOther: other_opex * scale,
            hOpIncome: op_income * scale,
            hTax: tax * scale,
            hInterest: interest * scale,
            hNet: net_income * scale,
            scale
        };
    }, [data]);

    const formatCurrency = (val: number) => {
        if (val === undefined || val === null) return "-";
        if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
        if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
        return `$${val.toLocaleString()}`;
    };

    // Colors
    const cRevenue = "#3b82f6"; // Blue
    const cCost = "#ef4444"; // Red
    const cProfit = "#10b981"; // Green
    const cExp = "#f59e0b"; // Amber

    return (
        <div className="w-full overflow-x-auto">
            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <span className="text-cyan-400">🌊</span> Cash Flow Sankey
            </h3>
            <svg width="100%" height={400} viewBox={`0 0 800 400`} className="font-sans text-xs">
                {/* Level 1: Revenue */}
                <rect x={x1} y={y1} width={20} height={hRevenue} fill={cRevenue} rx={4} />
                <text x={x1} y={y1 - 10} fill="#94a3b8" fontWeight="bold">Revenue</text>
                <text x={x1} y={y1 + hRevenue / 2} fill="white" fontWeight="bold" transform={`rotate(-90, ${x1 + 10}, ${y1 + hRevenue / 2})`} textAnchor="middle">{formatCurrency(revenue)}</text>

                {/* Flow: Revenue -> COGS */}
                <path d={`M ${x1 + 20} ${y1} C ${x1 + 150} ${y1}, ${x2 - 100} ${y1}, ${x2} ${y1} L ${x2} ${y1 + hCOGS} C ${x2 - 100} ${y1 + hCOGS}, ${x1 + 150} ${y1 + hCOGS}, ${x1 + 20} ${y1 + hCOGS} Z`} fill={cCost} opacity={0.4} />

                {/* Flow: Revenue -> Gross Profit */}
                <path d={`M ${x1 + 20} ${y1 + hCOGS} C ${x1 + 150} ${y1 + hCOGS}, ${x2 - 100} ${y1 + hCOGS + 20}, ${x2} ${y1 + hCOGS + 20} L ${x2} ${y1 + hCOGS + 20 + hGross} C ${x2 - 100} ${y1 + hCOGS + 20 + hGross}, ${x1 + 150} ${y1 + hRevenue}, ${x1 + 20} ${y1 + hRevenue} Z`} fill={cProfit} opacity={0.4} />

                {/* Level 2: COGS */}
                <rect x={x2} y={y1} width={20} height={hCOGS} fill={cCost} rx={4} />
                <text x={x2} y={y1 - 10} fill="#f87171" textAnchor="middle">COGS</text>
                <text x={x2 + 10} y={y1 + hCOGS / 2} fill="white" fontSize={10} textAnchor="middle" transform={`rotate(-90, ${x2 + 10}, ${y1 + hCOGS / 2})`}>{formatCurrency(cogs)}</text>

                {/* Level 2: Gross Profit */}
                <rect x={x2} y={y1 + hCOGS + 20} width={20} height={hGross} fill={cProfit} rx={4} />
                <text x={x2} y={y1 + hCOGS + 15} fill="#4ade80" textAnchor="middle">Gross Profit</text>

                {/* Flow: Gross Profit -> R&D */}
                <path d={`M ${x2 + 20} ${y1 + hCOGS + 20} C ${x2 + 150} ${y1 + hCOGS + 20}, ${x3 - 100} ${y1}, ${x3} ${y1} L ${x3} ${y1 + hRD} C ${x3 - 100} ${y1 + hRD}, ${x2 + 150} ${y1 + hCOGS + 20 + hRD}, ${x2 + 20} ${y1 + hCOGS + 20 + hRD} Z`} fill={cExp} opacity={0.4} />

                {/* Flow: Gross Profit -> SG&A */}
                <path d={`M ${x2 + 20} ${y1 + hCOGS + 20 + hRD} C ${x2 + 150} ${y1 + hCOGS + 20 + hRD}, ${x3 - 100} ${y1 + hRD + 10}, ${x3} ${y1 + hRD + 10} L ${x3} ${y1 + hRD + 10 + hSGA} C ${x3 - 100} ${y1 + hRD + 10 + hSGA}, ${x2 + 150} ${y1 + hCOGS + 20 + hRD + hSGA}, ${x2 + 20} ${y1 + hCOGS + 20 + hRD + hSGA} Z`} fill={cExp} opacity={0.4} />

                {/* Flow: Gross Profit -> Op Income */}
                <path d={`M ${x2 + 20} ${y1 + hCOGS + 20 + hRD + hSGA + hOther} C ${x2 + 150} ${y1 + hCOGS + 20 + hRD + hSGA + hOther}, ${x3 - 100} ${y1 + hRD + hSGA + hOther + 40}, ${x3} ${y1 + hRD + hSGA + hOther + 40} L ${x3} ${y1 + hRD + hSGA + hOther + 40 + hOpIncome} C ${x3 - 100} ${y1 + hRD + hSGA + hOther + 40 + hOpIncome}, ${x2 + 150} ${y1 + hCOGS + 20 + hGross}, ${x2 + 20} ${y1 + hCOGS + 20 + hGross} Z`} fill={cProfit} opacity={0.4} />


                {/* Level 3: Expenses Nodes */}
                <rect x={x3} y={y1} width={20} height={hRD} fill={cExp} rx={4} />
                <text x={x3} y={y1 - 10} fill="#fbbf24" textAnchor="middle">R&D</text>

                <rect x={x3} y={y1 + hRD + 10} width={20} height={hSGA} fill={cExp} rx={4} />
                <text x={x3 + 25} y={y1 + hRD + 10 + hSGA / 2} fill="#fbbf24" fontSize={10}>SG&A</text>

                {/* Level 3: Op Income */}
                <rect x={x3} y={y1 + hRD + hSGA + hOther + 40} width={20} height={hOpIncome} fill={cProfit} rx={4} />
                <text x={x3} y={y1 + hRD + hSGA + hOther + 30} fill="#4ade80" textAnchor="middle">Op Income</text>

                {/* Flow: Op Income -> Net Income */}
                <path d={`M ${x3 + 20} ${y1 + hRD + hSGA + hOther + 40 + hTax + hInterest} C ${x3 + 100} ${y1 + hRD + hSGA + hOther + 40 + hTax + hInterest}, ${x4 - 50} ${y1 + hRD + hSGA + hOther + 40 + hTax + hInterest}, ${x4} ${y1 + hRD + hSGA + hOther + 40 + hTax + hInterest} L ${x4} ${y1 + hRD + hSGA + hOther + 40 + hTax + hInterest + hNet} C ${x4 - 50} ${y1 + hRD + hSGA + hOther + 40 + hTax + hInterest + hNet}, ${x3 + 100} ${y1 + hRD + hSGA + hOther + 40 + hOpIncome}, ${x3 + 20} ${y1 + hRD + hSGA + hOther + 40 + hOpIncome} Z`} fill={cProfit} opacity={0.6} />

                {/* Level 4: Net Income */}
                <rect x={x4} y={y1 + hRD + hSGA + hOther + 40 + hTax + hInterest} width={20} height={hNet} fill={cProfit} rx={4} />
                <text x={x4} y={y1 + hRD + hSGA + hOther + 40 + hTax + hInterest - 10} fill="#4ade80" fontWeight="bold">Net Income</text>
                <text x={x4 + 25} y={y1 + hRD + hSGA + hOther + 40 + hTax + hInterest + hNet / 2} fill="white" fontWeight="bold">{formatCurrency(net_income)}</text>

            </svg>
        </div>
    );
};

// Memoize the main component
const MemoizedFinancialSankey = React.memo(FinancialSankey);
MemoizedFinancialSankey.displayName = 'FinancialSankey';

import ErrorBoundary from './ErrorBoundary';

const FinancialSankeyWidget: React.FC<FinancialSankeyProps> = (props) => (
    <ErrorBoundary name="Cash Flow Sankey">
        <MemoizedFinancialSankey {...props} />
    </ErrorBoundary>
);

export default FinancialSankeyWidget;
