"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, TrendingDown, Layers, Activity } from 'lucide-react';

const SCENARIOS = [
    { id: 'tech_crash', name: 'Tech Bubble Burst', color: '#EF4444' },
    { id: 'rate_hike', name: 'Fed Rate Hike (+1%)', color: '#F59E0B' },
    { id: 'recession', name: 'Global Recession', color: '#6366F1' },
    { id: 'inflation', name: 'Inflation Spike', color: '#10B981' },
];

export default function StressDashboard() {
    const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Mock Portfolio
    const portfolio = { "AAPL": 0.3, "MSFT": 0.3, "GOOGL": 0.2, "SPY": 0.2 };

    const runScenario = async (scenarioId: string) => {
        setSelectedScenario(scenarioId);
        setLoading(true);
        try {
            // In a real app, use axios to call /api/stress/run_scenario
            // Mocking response for UI development speed
            await new Promise(r => setTimeout(r, 800)); // Simulate lag

            const mockLoss = scenarioId === 'recession' ? -28000 :
                scenarioId === 'tech_crash' ? -15000 : -10000;

            setResults({
                scenario: SCENARIOS.find(s => s.id === scenarioId)?.name,
                initial_portfolio_value: 100000,
                final_portfolio_value: 100000 + mockLoss,
                loss_amount: mockLoss,
                loss_percent: mockLoss / 100000,
                details: [
                    { ticker: "AAPL", loss: scenarioId === 'tech_crash' ? -20 : -5 },
                    { ticker: "MSFT", loss: scenarioId === 'tech_crash' ? -18 : -4 },
                    { ticker: "GOOGL", loss: scenarioId === 'tech_crash' ? -22 : -6 },
                    { ticker: "SPY", loss: -5 },
                ]
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Scenarios Panel */}
            <div className="col-span-1 space-y-4">
                <h2 className="text-xl font-semibold text-gray-300 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Select Stress Scenario
                </h2>
                <div className="grid gap-3">
                    {SCENARIOS.map((scenario) => (
                        <button
                            key={scenario.id}
                            onClick={() => runScenario(scenario.id)}
                            className={`p-4 rounded-xl border transition-all text-left group relative overflow-hidden ${selectedScenario === scenario.id
                                    ? 'bg-white/5 border-white/20 shadow-lg'
                                    : 'bg-[#111] border-[#222] hover:bg-[#1A1A1A]'
                                }`}
                        >
                            <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${selectedScenario === scenario.id ? 'bg-gradient-to-b from-transparent via-' + scenario.color + ' to-transparent opacity-100' : 'opacity-0'}`} style={{ backgroundColor: scenario.color }} />
                            <h3 className="font-bold text-gray-200 group-hover:text-white transition-colors">{scenario.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">Simulate impact on current holdings.</p>
                        </button>
                    ))}
                </div>

                <div className="mt-8 p-6 bg-[#111] rounded-2xl border border-[#222]">
                    <h3 className="text-gray-400 text-sm font-medium mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Monte Carlo Simulation
                    </h3>
                    <div className="h-32 flex items-center justify-center text-gray-600 border border-dashed border-[#333] rounded-lg">
                        ChartPlaceholder (Line)
                    </div>
                    <button className="w-full mt-4 py-2 bg-[#222] hover:bg-[#333] text-gray-300 rounded-lg text-sm transition-colors">
                        Run 1,000 Simulations
                    </button>
                </div>
            </div>

            {/* Results Panel */}
            <div className="col-span-1 lg:col-span-2 space-y-6">
                {results ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-[#111] border-[#222]">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-400">Projected Loss</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-500">
                                        ${results.loss_amount.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-red-400/70 mt-1">
                                        {(results.loss_percent * 100).toFixed(2)}% of Portfolio
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="bg-[#111] border-[#222]">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-400">Final Value</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-200">
                                        ${results.final_portfolio_value.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        from ${results.initial_portfolio_value.toLocaleString()}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="bg-[#111] border-[#222]">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-400">Risk Score</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-orange-400">
                                        High
                                    </div>
                                    <p className="text-xs text-orange-400/50 mt-1">
                                        Beta exposure: 1.2
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Impact Chart */}
                        <Card className="bg-[#111] border-[#222] h-[400px]">
                            <CardHeader>
                                <CardTitle className="text-gray-200">Impact by Ticker</CardTitle>
                            </CardHeader>
                            <CardContent className="h-full pb-10">
                                <ResponsiveContainer width="100%" height="90%">
                                    <BarChart data={results.details}>
                                        <XAxis dataKey="ticker" stroke="#444" tick={{ fill: '#888' }} />
                                        <YAxis stroke="#444" tick={{ fill: '#888' }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="loss" fill="#EF4444" radius={[4, 4, 0, 0]}>
                                            {results.details.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.loss < -15 ? '#DC2626' : '#EF4444'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-[#222] rounded-3xl bg-[#050505] min-h-[400px]">
                        <Layers className="w-16 h-16 mb-4 text-[#333]" />
                        <h3 className="text-lg font-medium text-gray-400">No Scenario Selected</h3>
                        <p className="text-sm max-w-md text-center mt-2">
                            Select a stress scenario from the left panel to simulate its impact on your portfolio.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
