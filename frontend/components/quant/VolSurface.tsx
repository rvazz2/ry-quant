"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader2, AlertTriangle } from "lucide-react";

// Dynamically import Plot for client-side only rendering
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

import { getVolSurface } from '@/lib/api';

const VolSurface = ({ ticker = "SPY" }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchSurface = React.useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const json = await getVolSurface(ticker);
            setData(json);
        } catch (error) {
            console.error("Failed to fetch vol surface", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [ticker]);

    useEffect(() => {
        fetchSurface();
    }, [fetchSurface]);

    if (loading) {
        return (
            <div className="h-[500px] flex items-center justify-center bg-slate-900/50 border border-slate-800 rounded-xl">
                <Loader2 className="animate-spin text-cyan-400" size={32} />
                <span className="ml-2 text-slate-400">Calibrating Volatility Surface...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[500px] flex flex-col items-center justify-center bg-slate-900/50 border border-slate-800 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                    <AlertTriangle className="text-red-400" size={24} />
                </div>
                <span className="text-slate-300 font-medium">Failed to load Volatility Surface</span>
                <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">
                    Unable to calibrate Black-Scholes model. Market data may be unavailable.
                </p>
                <button
                    onClick={() => { setError(false); setLoading(true); fetchSurface(); }}
                    className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg transition-colors border border-slate-700"
                >
                    Retry Calibration
                </button>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="glass-panel p-1 rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl relative group">
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <h3 className="text-lg font-bold text-slate-100 drop-shadow-md">Implied Volatility Surface</h3>
                <p className="text-xs text-cyan-400 drop-shadow-md font-mono">Black-Scholes Model</p>
            </div>

            <VolatilityChart data={data} />
        </div>
    );
};

// Memoized Chart Component
const VolatilityChart = React.memo(({ data }: { data: any }) => {
    return (
        <Plot
            data={[
                {
                    x: data.x, // Strikes
                    y: data.y, // Time
                    z: data.z, // Price (or Vol)
                    type: "surface",
                    colorscale: "Viridis",
                    showscale: false,
                    contours: {
                        z: {
                            show: true,
                            usecolormap: true,
                            highlightcolor: "#42f5e6",
                            project: { z: true },
                        },
                    },
                } as any,
            ]}
            layout={{
                width: undefined, // Responsive
                height: 500,
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                scene: {
                    xaxis: { title: { text: "Strike ($)" }, color: "#94a3b8", gridcolor: "#334155" },
                    yaxis: { title: { text: "Time (Yrs)" }, color: "#94a3b8", gridcolor: "#334155" },
                    zaxis: { title: { text: "Price" }, color: "#94a3b8", gridcolor: "#334155" },
                    camera: {
                        eye: { x: 1.5, y: 1.5, z: 1.2 },
                    },
                },
                margin: { l: 0, r: 0, b: 0, t: 0 },
            }}
            config={{ displayModeBar: false }}
            className="w-full h-full"
            useResizeHandler={true}
        />
    );
});
VolatilityChart.displayName = 'VolatilityChart';

import ErrorBoundary from '../ErrorBoundary';

const VolSurfaceWidget = (props: { ticker?: string }) => (
    <ErrorBoundary name="Vol Surface">
        <VolSurface {...props} />
    </ErrorBoundary>
);

export default VolSurfaceWidget;
