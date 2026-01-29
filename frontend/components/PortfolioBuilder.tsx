"use client";

import React, { useState } from 'react';
import { getEfficientFrontier, Constraints } from '@/lib/api';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Search } from 'lucide-react';

interface View {
    ticker: string;
    return: string;
}

const PortfolioBuilder = () => {
    const [tickers, setTickers] = useState("AAPL,MSFT,GOOG,AMZN,TSLA");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Constraints State
    const [minWeight, setMinWeight] = useState("0");
    const [maxWeight, setMaxWeight] = useState("1.0");
    const [cashDrag, setCashDrag] = useState("0");

    // Black-Litterman Views
    const [views, setViews] = useState<View[]>([]);
    const [newViewTicker, setNewViewTicker] = useState("");
    const [newViewReturn, setNewViewReturn] = useState("");

    const addView = () => {
        if (newViewTicker && newViewReturn) {
            setViews([...views, { ticker: newViewTicker.toUpperCase(), return: newViewReturn }]);
            setNewViewTicker("");
            setNewViewReturn("");
        }
    };

    const removeView = (index: number) => {
        setViews(views.filter((_, i) => i !== index));
    };

    const handleRun = async () => {
        setLoading(true);
        setError(null);
        try {
            const tickerList = tickers.split(',').map(t => t.trim());
            if (tickerList.length < 2) {
                setError("Please enter at least 2 tickers.");
                return;
            }

            const constraints: Constraints = {
                min_weight: parseFloat(minWeight),
                max_weight: parseFloat(maxWeight),
                cash_drag: parseFloat(cashDrag) / 100 // Convert % to decimal
            };

            const viewsDict: { [key: string]: number } = {};
            views.forEach(v => {
                viewsDict[v.ticker] = parseFloat(v.return) / 100;
            });

            // Use longer timeframe (2020-2024) to capture bear markets
            const result = await getEfficientFrontier(
                tickerList,
                "2020-01-01",
                "2024-01-01",
                constraints,
                Object.keys(viewsDict).length > 0 ? viewsDict : undefined
            );
            setData(result);
        } catch (error) {
            console.error("Error calculating frontier", error);
            setError("Failed to optimize portfolio. Please check tickers and try again.");
        } finally {
            setLoading(false);
        }
    };

    const COLORS = [
        '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981',
        '#f59e0b', '#ec4899', '#6366f1', '#14b8a6',
    ];

    const renderPieChart = (weights: any, title: string) => {
        const pieData = Object.entries(weights)
            .map(([name, value]: [string, any]) => ({ name, value }))
            .filter(item => item.value > 0.001);

        return (
            <div className="h-64 relative">
                <h5 className="text-center text-slate-300 text-sm mb-2">{title}</h5>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                            itemStyle={{ color: '#f8fafc' }}
                            formatter={(val: number) => `${(val * 100).toFixed(1)}%`}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-slate-500 text-xs font-mono">ALLOCATION</span>
                </div>
            </div>
        );
    };

    const renderCorrelationMatrix = (matrix: any) => {
        if (!matrix) return null;
        const tickers = Object.keys(matrix);

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                    <thead>
                        <tr>
                            <th className="p-2 bg-slate-900 border border-slate-800"></th>
                            {tickers.map(t => (
                                <th key={t} className="p-2 bg-slate-900/50 border border-slate-800 text-slate-400 font-bold">{t}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tickers.map(rowTicker => (
                            <tr key={rowTicker}>
                                <td className="p-2 bg-slate-900/50 border border-slate-800 text-slate-400 font-bold">{rowTicker}</td>
                                {tickers.map(colTicker => {
                                    const val = matrix[rowTicker][colTicker];
                                    // Color scale: -1 (Green) to 1 (Red)
                                    // But actually: High correlation (>0.7) is Red (Bad for diversification), Low (<0.3) is Green (Good)
                                    let bg = "";
                                    let text = "text-slate-200";

                                    if (rowTicker === colTicker) {
                                        bg = "bg-slate-800";
                                        text = "text-slate-600";
                                    } else if (val > 0.8) {
                                        bg = "bg-red-500/20";
                                        text = "text-red-400";
                                    } else if (val > 0.5) {
                                        bg = "bg-orange-500/20";
                                        text = "text-orange-400";
                                    } else if (val < 0.3) {
                                        bg = "bg-emerald-500/20";
                                        text = "text-emerald-400";
                                    } else {
                                        bg = "bg-slate-800/30";
                                        text = "text-slate-400";
                                    }

                                    return (
                                        <td key={colTicker} className={`p-2 border border-slate-800 text-center ${bg}`}>
                                            <span className={text}>{val.toFixed(2)}</span>
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

    const getActionableInsights = (optimalWeights: any) => {
        const currentWeight = 1 / Object.keys(optimalWeights).length;
        return Object.entries(optimalWeights).map(([ticker, weight]: [string, any]) => {
            const diff = weight - currentWeight;
            const action = diff > 0.01 ? 'BUY' : diff < -0.01 ? 'SELL' : 'HOLD';
            const color = diff > 0.01 ? 'text-green-400' : diff < -0.01 ? 'text-red-400' : 'text-slate-400';
            return { ticker, action, diff, color, target: weight };
        }).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
    };



    return (
        <div className="glass-panel p-6 animate-in fade-in duration-500 flex flex-col xl:flex-row gap-8">
            {/* LEFT SIDEBAR: Controls */}
            <div className="w-full xl:w-80 flex-shrink-0 space-y-6">
                <div>
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Portfolio Architect
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Design your optimal strategy.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-500 uppercase">Universe</label>
                            <select
                                className="bg-slate-900 border border-slate-700 text-xs text-cyan-400 rounded px-2 py-1 outline-none focus:border-cyan-500"
                                onChange={(e) => {
                                    if (e.target.value) setTickers(e.target.value);
                                }}
                            >
                                <option value="">Load Preset...</option>
                                <option value="AAPL,MSFT,GOOG,AMZN,NVDA,META,TSLA">Magnificent Seven</option>
                                <option value="KO,PEP,JNJ,PG,VZ,MCD,WMT">Defensive Yield</option>
                                <option value="NVDA,AMD,TSM,AVGO,INTC,QCOM,MU">Semiconductors</option>
                                <option value="PLTR,COIN,DKNG,ROKU,SQ,TSLA,ARKK">High Goth/Beta</option>
                                <option value="TLT,GLD,SPY,EEM,VNQ,DBC">Macro Asset Class</option>
                            </select>
                        </div>
                        <textarea
                            value={tickers}
                            onChange={(e) => setTickers(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 h-24 focus:border-cyan-500 transition-colors resize-none font-mono"
                            placeholder="AAPL, MSFT..."
                        />
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-800">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            Constraints
                            <span className="text-[10px] bg-slate-700 px-1.5 rounded text-white">Advanced</span>
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-slate-400">Min Weight</label>
                                <div className="relative">
                                    <input type="number" step="0.05" value={minWeight} onChange={e => setMinWeight(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm pl-2" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Max Weight</label>
                                <div className="relative">
                                    <input type="number" step="0.05" value={maxWeight} onChange={e => setMaxWeight(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-sm pl-2" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400">Cash Drag (%)</label>
                            <input type="range" min="0" max="50" value={cashDrag} onChange={e => setCashDrag(e.target.value)} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2" />
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>0%</span>
                                <span className="text-cyan-400">{cashDrag}% Cash</span>
                                <span>50%</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-800">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            Black-Litterman
                            <span className="text-[10px] bg-purple-900 text-purple-200 px-1.5 rounded">Pro</span>
                        </label>
                        <p className="text-xs text-slate-500">Add subjective views to adjust the model.</p>

                        <div className="flex gap-2">
                            <input placeholder="Ticker" value={newViewTicker} onChange={e => setNewViewTicker(e.target.value)} className="w-16 bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-center uppercase" />
                            <input placeholder="Exp Ret %" type="number" value={newViewReturn} onChange={e => setNewViewReturn(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-xs" />
                            <button onClick={addView} className="bg-slate-700 hover:bg-slate-600 px-3 rounded text-xs">+</button>
                        </div>

                        <div className="space-y-1">
                            {views.map((v, i) => (
                                <div key={i} className="flex justify-between items-center text-xs bg-slate-900/50 p-2 rounded border border-slate-800">
                                    <span className="font-bold text-purple-400">{v.ticker}</span>
                                    <span className="text-slate-300">Target: {v.return}%</span>
                                    <button onClick={() => removeView(i)} className="text-slate-500 hover:text-red-400">×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleRun}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3 rounded-lg text-sm font-bold shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Optimizing...' : 'Build Strategy'}
                    </button>

                    {error && <p className="text-xs text-rose-400 bg-rose-900/20 p-2 rounded">{error}</p>}
                </div>
            </div>

            {/* RIGHT MAIN PANEL: Results */}
            <div className="flex-1 min-w-0 space-y-8">
                {!data ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-2xl min-h-[400px]">
                        <div className="text-4xl mb-4 opacity-50">📊</div>
                        <p>Configure constraints and click "Build Strategy"</p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                        {/* 1. The Efficient Frontier Curve */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 h-[350px] bg-slate-900/30 rounded-xl p-4 border border-slate-800/50 relative overflow-hidden group">
                                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                                    <h4 className="text-slate-200 font-bold flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        Efficient Frontier
                                    </h4>
                                </div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 40, right: 20, bottom: 20, left: 20 }}>
                                        <XAxis type="number" dataKey="volatility" name="Risk" unit="" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                                        <YAxis type="number" dataKey="return" name="Return" unit="" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                                        <Scatter name="Portfolios" data={data.scatter_data} fill="#3b82f6" fillOpacity={0.4} />
                                        <Scatter data={[data.max_sharpe]} fill="#22d3ee" shape="star" name="Max Sharpe" />
                                        <Scatter data={[data.min_volatility]} fill="#4ade80" shape="triangle" name="Min Volatility" />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-4">
                                <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-cyan-500/30 shadow-lg relative">
                                    <h4 className="text-cyan-400 font-bold mb-4 flex items-center gap-2 text-sm">MAX SHARPE</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end border-b border-slate-700/50 pb-2">
                                            <span className="text-slate-400 text-xs">Return</span>
                                            <span className="text-xl font-bold text-slate-100">{(data.max_sharpe.return * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between items-end border-b border-slate-700/50 pb-2">
                                            <span className="text-slate-400 text-xs">Risk</span>
                                            <span className="text-lg font-mono text-slate-100">{(data.max_sharpe.volatility * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-slate-400 text-xs">Sharpe</span>
                                            <span className="text-lg font-mono text-cyan-400">{data.max_sharpe.sharpe.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Portfolio Builder & Action Plan */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
                            <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-800">
                                <h4 className="text-slate-200 font-bold mb-4 text-sm uppercase tracking-wider">Optimal Allocation</h4>
                                {renderPieChart(data.max_sharpe.weights, "Weight Distribution")}
                            </div>

                            <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-800">
                                <h4 className="text-slate-200 font-bold mb-4 text-sm uppercase tracking-wider">Rebalancing Plan</h4>
                                <div className="overflow-x-auto max-h-[250px] custom-scrollbar">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2">Ticker</th>
                                                <th className="px-4 py-2">Action</th>
                                                <th className="px-4 py-2">Target</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {getActionableInsights(data.max_sharpe.weights).map((item) => (
                                                <tr key={item.ticker} className="hover:bg-slate-800/30">
                                                    <td className="px-4 py-2 font-bold text-slate-200">{item.ticker}</td>
                                                    <td className={`px-4 py-2 font-bold ${item.color} text-xs`}>{item.action} <span className="opacity-50 ml-1">{Math.abs(item.diff * 100).toFixed(0)}%</span></td>
                                                    <td className="px-4 py-2 font-mono text-slate-400 text-xs">{(item.target * 100).toFixed(1)}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>


                        {/* 3. AI Strategy Consultant */}
                        <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 rounded-xl p-6 border border-indigo-500/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="text-6xl">🧠</span>
                            </div>
                            <h4 className="text-indigo-400 font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                AI Strategy Consultant
                            </h4>
                            <div className="space-y-3 text-sm text-slate-300">
                                {data.max_sharpe.volatility > 0.25 && (
                                    <div className="flex gap-3 items-start">
                                        <span className="text-amber-400">⚠️</span>
                                        <p><strong>High Volatility Detected ({(data.max_sharpe.volatility * 100).toFixed(1)}%):</strong> This portfolio is aggressive. Consider adding uncorrelated assets like Gold (GLD) or Utilities (XLU) to dampen drawdowns.</p>
                                    </div>
                                )}
                                {data.max_sharpe.sharpe < 1.0 && (
                                    <div className="flex gap-3 items-start">
                                        <span className="text-blue-400">ℹ️</span>
                                        <p><strong>Suboptimal Efficiency:</strong> Sharpe ratio is below 1.0. The selected assets may be highly correlated. Try mixing sectors (e.g., Tech + Healthcare).</p>
                                    </div>
                                )}
                                {Math.max(...Object.values(data.max_sharpe.weights) as number[]) > 0.4 && (
                                    <div className="flex gap-3 items-start">
                                        <span className="text-rose-400">🚨</span>
                                        <p><strong>Concentration Risk:</strong> One position exceeds 40% weight. This creates single-stock failure risk regardless of the mathematical optimum.</p>
                                    </div>
                                )}
                                <div className="flex gap-3 items-start">
                                    <span className="text-emerald-400">✅</span>
                                    <p><strong>Optimization Complete:</strong> Searched {data.scatter_data.length} potential combinations to find the mathematical ceiling for risk-adjusted returns.</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-800/50 flex gap-4">
                                <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">
                                    Generate Report
                                </button>
                                <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border border-slate-700">
                                    Run Backtest
                                </button>
                            </div>
                        </div>

                        {/* 4. Correlation Matrix */}
                        <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-800">
                            <h4 className="text-slate-200 font-bold mb-4 text-sm uppercase tracking-wider flex justify-between items-center">
                                Correlation Matrix
                                <span className="text-[10px] normal-case bg-slate-800 text-slate-400 px-2 py-1 rounded">Lower is better for diversification</span>
                            </h4>
                            {renderCorrelationMatrix(data.correlation_matrix)}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default PortfolioBuilder;
