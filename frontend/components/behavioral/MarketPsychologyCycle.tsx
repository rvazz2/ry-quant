"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

const stages = [
    { name: "Disbelief", x: 10, y: 80, color: "#94a3b8", desc: "This rally will fail like the others." },
    { name: "Hope", x: 25, y: 65, color: "#22c55e", desc: "A recovery is possible." },
    { name: "Optimism", x: 40, y: 45, color: "#22c55e", desc: "This performance is real." },
    { name: "Belief", x: 55, y: 30, color: "#22c55e", desc: "Time to buy the dip." },
    { name: "Thrilling", x: 70, y: 15, color: "#22c55e", desc: "I will buy more on margin." },
    { name: "Euphoria", x: 80, y: 5, color: "#10b981", desc: "I am a genius! We are all gonna be rich!" },
    { name: "Complacency", x: 85, y: 25, color: "#facc15", desc: "We just need to cool off." },
    { name: "Anxiety", x: 90, y: 50, color: "#f59e0b", desc: "Why am I getting margin calls?" },
    { name: "Denial", x: 92, y: 70, color: "#ef4444", desc: "My investments are with good companies." },
    { name: "Panic", x: 95, y: 90, color: "#dc2626", desc: "Sell everything! Get me out!" },
];

const MarketPsychologyCycle = () => {
    const [activeStage, setActiveStage] = useState<number | null>(null);

    // Generate a smooth curve path roughly passing through points
    const pathD = "M 0 90 C 20 90, 30 50, 50 40 S 70 0, 80 5 S 90 60, 100 95";

    return (
        <div className="glass-panel p-6 space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Info className="text-cyan-400" />
                        Market Psychology Cycle
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Where are we in the cycle? Drag to explore.
                    </p>
                </div>
            </div>

            <div className="relative h-64 w-full bg-slate-900/50 rounded-xl border border-slate-800 p-4 overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    {/* The Market Line */}
                    <motion.path
                        d={pathD}
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    />

                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#94a3b8" />
                            <stop offset="50%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                    </defs>

                    {/* Nodes */}
                    {stages.map((stage, i) => (
                        <g key={i}
                            onMouseEnter={() => setActiveStage(i)}
                            onMouseLeave={() => setActiveStage(null)}
                            className="cursor-pointer"
                        >
                            <circle
                                cx={stage.x}
                                cy={stage.y}
                                r={activeStage === i ? 3 : 1.5}
                                fill={stage.color}
                                className="transition-all duration-300"
                            />
                            {/* Label */}
                            <text
                                x={stage.x}
                                y={stage.y - 5}
                                fontSize="3"
                                fill={activeStage === i ? "#fff" : stage.color}
                                textAnchor="middle"
                                className={`transition-all duration-300 ${activeStage === i ? 'font-bold' : 'font-normal opacity-70'}`}
                            >
                                {stage.name}
                            </text>
                        </g>
                    ))}
                </svg>

                {/* Popover Description */}
                {activeStage !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-4 left-4 right-4 bg-slate-800/90 backdrop-blur border border-slate-700 p-3 rounded-lg z-10 text-center"
                    >
                        <h4 className="font-bold text-white mb-1">{stages[activeStage].name}</h4>
                        <p className="text-sm text-slate-300">"{stages[activeStage].desc}"</p>
                    </motion.div>
                )}
            </div>

            <div className="text-xs text-slate-500 italic text-center">
                Interactive: Hover over points to see investor sentiment.
            </div>
        </div>
    );
};

export default MarketPsychologyCycle;
