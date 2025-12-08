"use client";

import React, { useState } from 'react';
import { Network, Search, Zap, Globe, Cpu } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from 'recharts';

// Mock Data for "Apple Supply Chain"
const mockNodes = [
    { x: 50, y: 50, z: 1000, name: "Apple (HQ)", type: "OEM", fill: "#fff" }, // Center
    { x: 80, y: 80, z: 500, name: "TSMC (Chips)", type: "Tier 1", fill: "#ef4444" }, // Taiwan
    { x: 20, y: 70, z: 400, name: "Foxconn (Assembly)", type: "Tier 1", fill: "#f97316" }, // China
    { x: 60, y: 20, z: 300, name: "Samsung (Screens)", type: "Tier 1", fill: "#3b82f6" }, // Korea
    { x: 30, y: 30, z: 200, name: "Qualcomm (Modems)", type: "Tier 1", fill: "#8b5cf6" }, // USA
    { x: 90, y: 40, z: 150, name: "Murata (Capacitors)", type: "Tier 2", fill: "#10b981" }, // Japan
    { x: 10, y: 50, z: 100, name: "Sony (Cameras)", type: "Tier 1", fill: "#ec4899" }, // Japan
];

const SupplyChainMap = () => {
    const [ticker, setTicker] = useState("AAPL");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [nodes, setNodes] = useState(mockNodes);

    // Search functionality
    React.useEffect(() => {
        const search = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }
            try {
                // Dynamic import to avoid SSR issues if api isn't ready, though direct import is fine here usually
                const { searchTickers } = await import('@/lib/api');
                const data = await searchTickers(query);
                setResults(data);
            } catch (error) {
                console.error("Search failed:", error);
            }
        };

        const timeoutId = setTimeout(search, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    // "Generates" a new mock supply chain for the selected ticker
    const loadSupplyChain = (symbol: string, name: string) => {
        setTicker(symbol);
        setQuery("");
        setShowResults(false);

        // Procedural generation of mock suppliers for demo purposes
        // In a real app, this would hit a specific supply chain API
        const newNodes = [
            { x: 50, y: 50, z: 1000, name: `${symbol} (HQ)`, type: "OEM", fill: "#fff" }, // Center
            { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10, z: 500, name: "Key Supplier A", type: "Tier 1", fill: "#ef4444" },
            { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10, z: 450, name: "Assembly Partner", type: "Tier 1", fill: "#f97316" },
            { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10, z: 400, name: "Chip Fabs", type: "Tier 2", fill: "#3b82f6" },
            { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10, z: 300, name: "Logistics Hub", type: "Logistics", fill: "#8b5cf6" },
            { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10, z: 250, name: "Raw Materials", type: "Tier 2", fill: "#10b981" },
        ];
        setNodes(newNodes);
    };

    return (
        <div className="glass-panel p-6 border-l-4 border-l-cyan-500 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Network className="text-cyan-500" />
                        Supply Chain Galaxy
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Force-directed mapping of suppliers, manufacturers, and logistics.
                    </p>
                </div>

                <div className="flex items-center gap-2 relative z-50">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 text-slate-500" size={14} />
                        <input
                            type="text"
                            value={query}
                            placeholder={ticker}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setShowResults(true);
                            }}
                            onFocus={() => setShowResults(true)}
                            className="bg-slate-900 border border-slate-700 rounded pl-8 pr-2 py-2 text-white text-sm w-48 focus:border-cyan-500 outline-none transition-colors"
                        />
                        {/* Search Dropdown */}
                        {showResults && results.length > 0 && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden z-50">
                                {results.slice(0, 5).map((r) => (
                                    <button
                                        key={r.symbol}
                                        onClick={() => loadSupplyChain(r.symbol, r.name)}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors flex justify-between items-center group"
                                    >
                                        <div>
                                            <div className="font-bold text-slate-200">{r.symbol}</div>
                                            <div className="text-xs text-slate-500 group-hover:text-slate-400 truncate w-32">{r.name}</div>
                                        </div>
                                        <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700">{r.exch}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="relative h-[400px] bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden group">
                {/* Background Grid Effect */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <XAxis type="number" dataKey="x" name="Geography (East/West)" hide domain={[0, 100]} />
                        <YAxis type="number" dataKey="y" name="Complexity (Up/Down)" hide domain={[0, 100]} />
                        <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Importance" />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
                                            <div className="font-bold text-white flex items-center gap-2">
                                                <Cpu size={14} className="text-cyan-400" />
                                                {data.name}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">{data.type} Supplier</div>
                                            <div className="text-xs text-slate-500">Criticality Score: {data.z}</div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Scatter name="Suppliers" data={nodes}>
                            {nodes.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>

                {/* Connecting Lines (Simulated via overlay for visual flair) - Dynamic based on nodes would be better but CSS overlay is safer for now */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                    {/* Static lines for now, or we could calculate if we had real coords mapped to pixels */}
                    <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="#fff" strokeWidth="1" />
                    <line x1="50%" y1="50%" x2="20%" y2="30%" stroke="#fff" strokeWidth="1" />
                    <line x1="50%" y1="50%" x2="60%" y2="80%" stroke="#fff" strokeWidth="1" />
                    <line x1="50%" y1="50%" x2="30%" y2="70%" stroke="#fff" strokeWidth="1" />
                </svg>

                <div className="absolute bottom-4 left-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div> Chips (Global)
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div> Assembly (Asia)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplyChainMap;
