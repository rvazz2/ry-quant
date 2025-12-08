import React, { useMemo } from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';

// Approximate S&P 500 Sector Weights (as of late 2024/2025) to give realistic box sizes
const SECTOR_WEIGHTS: Record<string, number> = {
    "Technology": 31.5,
    "Financials": 13.0,
    "Health Care": 12.0,
    "Consumer Discretionary": 10.5,
    "Communication Services": 9.0,
    "Industrials": 8.5,
    "Consumer Staples": 6.0,
    "Energy": 3.5,
    "Utilities": 2.5,
    "Real Estate": 2.5,
    "Materials": 2.5,
};

const SectorChart = React.memo(({ sectors }: { sectors: any[] }) => {
    // Merge backend data with specific weights/sizes for the Treemap
    const data = useMemo(() => {


        if (!sectors || sectors.length === 0) {
            console.warn('[SectorChart] No sectors data provided');
            return [];
        }

        const mapped = sectors
            .map(s => {
                if (!s || !s.sector || s.change === undefined || s.change === null) {
                    console.warn('[SectorChart] Invalid sector object:', s);
                    return null;
                }
                return {
                    ...s,
                    size: SECTOR_WEIGHTS[s.sector] || 5, // Default weight if name mismatch
                };
            })
            .filter(s => s !== null) // Remove invalid entries
            .sort((a, b) => b.size - a.size); // Sort by size for better packing


        return mapped;
    }, [sectors]);

    if (!data || data.length === 0) {
        console.warn('[SectorChart] No valid data to display');
        return (
            <div className="h-full flex items-center justify-center text-slate-500">
                <div className="text-center">
                    <p className="mb-2">No sector data available</p>
                    <p className="text-xs text-slate-600">Waiting for market data...</p>
                </div>
            </div>
        );
    }


    return (
        <ResponsiveContainer width="100%" height="100%">
            <Treemap
                data={data}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#0f172a"
                content={<CustomizedContent />}
            >
                <Tooltip content={<CustomTooltip />} />
            </Treemap>
        </ResponsiveContainer>
    );
});
SectorChart.displayName = 'SectorChart';

// Custom Cell Renderer for the Heatmap look
const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, index, payload, colors, rank, name } = props;

    // Safety check
    if (!payload) return null;

    const change = payload.change || 0;
    const isPositive = change >= 0;

    // Premium Color Logic
    // Using gradient-like solid colors for better readability
    const bgColor = isPositive
        ? (change > 1.5 ? '#10b981' : '#34d399') // Emerald-500 : Emerald-400
        : (change < -1.5 ? '#f43f5e' : '#fb7185'); // Rose-500 : Rose-400

    // Only show text if box is big enough
    const showText = width > 50 && height > 35;
    const showPercent = width > 60 && height > 50;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={6} // Rounded corners
                ry={6}
                style={{
                    fill: bgColor,
                    stroke: 'rgba(13, 16, 28, 0.5)', // bg-dark
                    strokeWidth: 3,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    transition: 'all 0.3s ease'
                }}
            />
            {showText && (
                <>
                    <text
                        x={x + width / 2}
                        y={y + height / 2 - (showPercent ? 8 : 0)}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={11}
                        fontWeight="700"
                        style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                    >
                        {payload.ticker}
                    </text>
                    {showPercent && (
                        <text
                            x={x + width / 2}
                            y={y + height / 2 + 8}
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.9)"
                            fontSize={10}
                            fontWeight="600"
                            style={{ pointerEvents: 'none' }}
                        >
                            {isPositive ? '+' : ''}{change.toFixed(2)}%
                        </text>
                    )}
                </>
            )}
        </g>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-sm">
                <p className="text-white font-bold mb-1">{data.sector}</p>
                <div className="flex justify-between gap-4 text-sm">
                    <span className="text-slate-400">Ticker: {data.ticker}</span>
                    <span className={`font-mono font-bold ${data.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export default SectorChart;
