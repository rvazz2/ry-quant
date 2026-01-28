"use client";

import React, { useState } from 'react';
import { Network, Search, Zap, Globe, Cpu, AlertTriangle } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis, Cell } from 'recharts';

// Real-world Supply Chain Data
const supplyChainDatabase: Record<string, any[]> = {
    "AAPL": [
        { x: 50, y: 50, z: 2500, name: "Apple (HQ)", type: "OEM", fill: "#fff" }, // Cupertino
        { x: 85, y: 75, z: 1200, name: "TSMC", type: "Chip Fab", fill: "#ef4444" }, // Taiwan
        { x: 20, y: 65, z: 1000, name: "Foxconn", type: "Assembly", fill: "#f97316" }, // China
        { x: 75, y: 30, z: 800, name: "Samsung Display", type: "Screens", fill: "#3b82f6" }, // Korea
        { x: 25, y: 35, z: 600, name: "Qualcomm", type: "Modems", fill: "#8b5cf6" }, // USA (San Diego)
        { x: 30, y: 40, z: 550, name: "Broadcom", type: "RF Chips", fill: "#8b5cf6" }, // USA
        { x: 90, y: 45, z: 400, name: "Murata", type: "Capacitors", fill: "#10b981" }, // Japan
        { x: 92, y: 55, z: 450, name: "Sony", type: "Sensors", fill: "#10b981" }, // Japan
        { x: 15, y: 25, z: 300, name: "Corning", type: "Glass", fill: "#ec4899" }, // USA
        { x: 22, y: 70, z: 700, name: "Luxshare", type: "Assembly", fill: "#f97316" }, // China
        { x: 10, y: 10, z: 350, name: "Micron", type: "Memory", fill: "#3b82f6" }, // USA
    ],
    "TSLA": [
        { x: 50, y: 50, z: 2000, name: "Tesla (HQ)", type: "OEM", fill: "#fff" }, // Austin
        { x: 85, y: 60, z: 900, name: "Panasonic", type: "Batteries", fill: "#10b981" }, // Japan/USA
        { x: 20, y: 80, z: 1100, name: "CATL", type: "Batteries", fill: "#ef4444" }, // China
        { x: 70, y: 30, z: 800, name: "LG Energy", type: "Batteries", fill: "#3b82f6" }, // Korea
        { x: 40, y: 20, z: 400, name: "IDRA", type: "Giga Press", fill: "#f97316" }, // Italy
        { x: 30, y: 70, z: 500, name: "Ganfeng Lithium", type: "Raw Materials", fill: "#8b5cf6" }, // China
        { x: 15, y: 40, z: 600, name: "Albemarle", type: "Lithium", fill: "#8b5cf6" }, // USA
        { x: 60, y: 85, z: 450, name: "Vale", type: "Nickel", fill: "#ec4899" }, // Brazil/Canada
    ],
    "NVDA": [
        { x: 50, y: 50, z: 2200, name: "Nvidia (HQ)", type: "OEM", fill: "#fff" }, // Santa Clara
        { x: 88, y: 70, z: 1800, name: "TSMC", type: "Wafer Fab", fill: "#ef4444" }, // Taiwan (Critical)
        { x: 75, y: 35, z: 900, name: "SK Hynix", type: "HBM Memory", fill: "#3b82f6" }, // Korea
        { x: 20, y: 30, z: 800, name: "Micron", type: "Memory", fill: "#3b82f6" }, // USA
        { x: 25, y: 75, z: 700, name: "Foxconn", type: "Server Assembly", fill: "#f97316" }, // Taiwan/China
        { x: 80, y: 50, z: 600, name: "Ibiden", type: "Substrates", fill: "#10b981" }, // Japan
        { x: 40, y: 20, z: 500, name: "Supermicro", type: "Server Integration", fill: "#8b5cf6" }, // USA
    ],
    "MSFT": [
        { x: 50, y: 50, z: 2500, name: "Microsoft (HQ)", type: "OEM", fill: "#fff" },
        { x: 30, y: 30, z: 1200, name: "Intel", type: "CPUs", fill: "#3b82f6" },
        { x: 40, y: 60, z: 1200, name: "AMD", type: "CPUs/GPUs", fill: "#ef4444" },
        { x: 80, y: 70, z: 1000, name: "TSMC", type: "Chip Fab", fill: "#ef4444" },
        { x: 25, y: 75, z: 600, name: "Dell", type: "Hardware", fill: "#f97316" },
        { x: 60, y: 25, z: 800, name: "Samsung", type: "Memory/Screens", fill: "#10b981" },
    ]
};

interface SearchResult {
    symbol: string;
    name: string;
    exch: string;
}

const SupplyChainMap = () => {
    const [ticker, setTicker] = useState("AAPL");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [nodes, setNodes] = useState(supplyChainDatabase["AAPL"]);
    const [isSimulated, setIsSimulated] = useState(false);

    // Search functionality
    React.useEffect(() => {
        const search = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }
            try {
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

    const loadSupplyChain = (symbol: string, name: string) => {
        setTicker(symbol);
        setQuery("");
        setShowResults(false);

        if (supplyChainDatabase[symbol]) {
            setNodes(supplyChainDatabase[symbol]);
            setIsSimulated(false);
        } else {
            // Fallback for companies not in our manual database
            setIsSimulated(true);
            const newNodes = [
                { x: 50, y: 50, z: 1000, name: `${symbol} (HQ)`, type: "OEM", fill: "#fff" },
                { x: 85, y: 75, z: 500, name: "Primary Mfg (Asia)", type: "Tier 1", fill: "#ef4444" },
                { x: 20, y: 65, z: 450, name: "Assembly Partner", type: "Tier 1", fill: "#f97316" },
                { x: 75, y: 30, z: 400, name: "Component Supplier", type: "Tier 2", fill: "#3b82f6" },
                { x: 25, y: 35, z: 300, name: "Global Logistics", type: "Logistics", fill: "#8b5cf6" },
                { x: 90, y: 45, z: 250, name: "Raw Materials", type: "Tier 3", fill: "#10b981" },
            ];
            setNodes(newNodes);
        }
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
                        {/* ... dropdown code remains same but uses loadSupplyChain ... */}
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
                                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl z-50">
                                            <div className="font-bold text-white flex items-center gap-2">
                                                <Cpu size={14} className="text-cyan-400" />
                                                {data.name}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">{data.type}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">Impact Score: {data.z}</div>
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

                {isSimulated && (
                    <div className="absolute top-4 left-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                        <AlertTriangle size={12} />
                        Simulated Data
                    </div>
                )}

                <div className="absolute bottom-4 left-4 text-xs text-slate-500">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div> Critical (Chip/Fab)
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div> Assembly/Mfg
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div> Components
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Materials
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Globe size={18} className="text-purple-400" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Tharunomics Insight: The Fragility Trap</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <strong className="text-slate-200">Just-in-Time is Dead:</strong> COVID-19 killed the zero-inventory model. We are shifting to <span className="text-cyan-400">&quot;Just-in-Case&quot;</span>, where redundancy is priced in as an insurance premium.
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            This map represents a <span className="text-red-400">Heat Map of Geopolitical Risk</span>. A single node failure (e.g., TSMC blockade) creates a systemic cascade.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Baltic Dry Index</div>
                            <div className="text-lg font-mono text-emerald-400">1,540</div>
                            <div className="text-[9px] text-emerald-500/80 mt-1">+2.4% (Shipping Recovery)</div>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Chip Lead Times</div>
                            <div className="text-lg font-mono text-orange-400">12 wks</div>
                            <div className="text-[9px] text-orange-500/80 mt-1">Normalized (Pre-2020: 12wks)</div>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Global PMI</div>
                            <div className="text-lg font-mono text-cyan-400">49.3</div>
                            <div className="text-[9px] text-slate-500 mt-1">Slight Contraction</div>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Geopol Risk</div>
                            <div className="text-lg font-mono text-yellow-400">High</div>
                            <div className="text-[9px] text-yellow-500/80 mt-1">Taiwan/Middle East</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplyChainMap;
