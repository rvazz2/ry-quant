"use client";

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Activity, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PriceChart from '@/components/PriceChart';

// Dynamic import for Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false, loading: () => <div className="h-[500px] w-full bg-slate-900/50 animate-pulse rounded-xl" /> });

interface CountryData {
    country: string;
    city: string;
    lat: number;
    lon: number;
    performance: number;
    inflation: number;
    gdp: number;
    etf: string;
    color: string;
    code: string;
}

interface MacroWeatherMapProps {
    data: CountryData[];
    className?: string;
}

type MetricType = 'inflation' | 'gdp' | 'performance';

const METRICS = {
    inflation: { label: 'Inflation Heatmap', icon: Activity, color: '#f59e0b', description: 'Annual % Change (CPI)' },
    gdp: { label: 'GDP Growth', icon: DollarSign, color: '#10b981', description: '2025 Est. Growth Rate %' },
    performance: { label: 'Market Momentum', icon: TrendingUp, color: '#3b82f6', description: '5-Day Index Performance' },
};

export default function MacroWeatherMap({ data, className }: MacroWeatherMapProps) {
    const [selectedMetric, setSelectedMetric] = useState<MetricType>('performance');
    const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

    // Prepare Plotly Data
    const plotData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const locations = data.map(d => d.code);
        const z = data.map(d => {
            if (selectedMetric === 'inflation') return d.inflation;
            if (selectedMetric === 'gdp') return d.gdp;
            return d.performance;
        });
        const text = data.map(d => {
            const val = selectedMetric === 'inflation' ? d.inflation : selectedMetric === 'gdp' ? d.gdp : d.performance;
            return `${d.country}<br>${METRICS[selectedMetric].label}: ${val}%<br>ETF: ${d.etf}`;
        });

        // Color Scales
        // Inflation: Green (Low) -> Red (High)
        // GDP/Perf: Red (Low) -> Green (High)
        const colorscale = selectedMetric === 'inflation'
            ? [
                [0, '#10b981'], // Low Inflation = Green
                [0.5, '#fbbf24'],
                [1, '#ef4444']  // High Inflation = Red
            ]
            : [
                [0, '#ef4444'], // Low Growth/Perf = Red
                [0.5, '#71717a'], // Neutral
                [1, '#10b981']  // High Growth/Perf = Green
            ];

        return [{
            type: 'choropleth',
            locations: locations,
            z: z,
            text: text,
            colorscale: colorscale,
            autocolorscale: false,
            reversescale: false,
            marker: {
                line: {
                    color: '#1e293b',
                    width: 0.5
                }
            },
            showscale: true,
            colorbar: {
                title: {
                    text: '%',
                    side: 'right',
                    font: { color: '#94a3b8' }
                },
                tickfont: { color: '#94a3b8' },
                bgcolor: 'rgba(0,0,0,0)'
            },
            hoverinfo: 'text'
        }];
    }, [data, selectedMetric]);

    // Layout Configuration
    const layout = useMemo(() => ({
        geo: {
            scope: 'world',
            projection: { type: 'natural earth' },
            showlakes: false,
            showocean: true,
            oceancolor: '#020617',
            landcolor: '#0f172a',
            bgcolor: 'rgba(0,0,0,0)',
            showframe: false,
            showcountries: true,
            countrycolor: '#1e293b',
            coastlinecolor: '#1e293b',
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 0, b: 0, l: 0, r: 0 },
        height: 500,
        font: {
            family: 'Inter, sans-serif'
        },
        dragmode: false // Disable panning for cleaner UX? Or keep it?
    }), []);

    // Handle Click
    const handlePlotClick = (event: any) => {
        const pointIndex = event.points[0].pointIndex;
        const country = data[pointIndex];
        if (country && country.etf) {
            setSelectedCountry(country);
        }
    };

    return (
        <div className={`relative w-full ${className}`}>

            {/* Controls */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <div className="bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl inline-flex gap-1">
                    {(Object.keys(METRICS) as MetricType[]).map((m) => {
                        const Icon = METRICS[m].icon;
                        const active = selectedMetric === m;
                        return (
                            <button
                                key={m}
                                onClick={() => setSelectedMetric(m)}
                                className={`
                                    px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all
                                    ${active ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
                                `}
                            >
                                <Icon size={14} className={active ? 'text-cyan-400' : ''} />
                                {METRICS[m].label}
                            </button>
                        );
                    })}
                </div>

                {/* Description Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={selectedMetric}
                    className="bg-black/50 backdrop-blur text-slate-300 text-[10px] px-3 py-1 rounded-full border border-white/5 w-fit"
                >
                    Showing: <span className="text-white font-medium">{METRICS[selectedMetric].description}</span>
                </motion.div>
            </div>


            {/* The Map */}
            <div className="w-full h-[500px] bg-slate-950/50 rounded-xl border border-slate-800/50 overflow-hidden relative">
                {/* @ts-expect-error - types for plotly can be tricky */}
                <Plot
                    data={plotData}
                    layout={layout}
                    config={{ displayModeBar: false, responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                    onClick={handlePlotClick}
                />

                {/* Hint Overlay */}
                <div className="absolute bottom-4 left-4 text-[10px] text-slate-500 pointer-events-none">
                    * Click a country to view its ETF chart
                </div>
            </div>

            {/* Drill Down Modal */}
            <AnimatePresence>
                {selectedCountry && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl">
                                        {/* Simple Flag Emoji mapping could go here, for now just initial */}
                                        {selectedCountry.code.slice(0, 2)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{selectedCountry.country}</h2>
                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                            <span>GDP Growth: <span className="text-emerald-400">{selectedCountry.gdp}%</span></span>
                                            <span>Inflation: <span className={selectedCountry.inflation > 3 ? "text-red-400" : "text-emerald-400"}>{selectedCountry.inflation}%</span></span>
                                            <span>ETF: <span className="text-cyan-400 font-mono">{selectedCountry.etf}</span></span>
                                        </div>
                                    </div>
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => setSelectedCountry(null)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Chart */}
                            <div className="p-6 bg-slate-950/30">
                                <PriceChart
                                    symbol={selectedCountry.etf}
                                    height={400}
                                    color="#22d3ee"
                                    showEvents={false}
                                />
                            </div>
                        </motion.div>

                        {/* Backdrop Click to Close */}
                        <div className="absolute inset-0 -z-10" onClick={() => setSelectedCountry(null)} />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
