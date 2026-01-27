"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

const stages = [
    { name: "Disbelief", x: 5, y: 85, color: "#64748b", tier: "Fear", desc: "This rally will fail like the others." },
    { name: "Hope", x: 15, y: 75, color: "#94a3b8", tier: "Fear", desc: "A recovery is possible." },
    { name: "Optimism", x: 30, y: 55, color: "#4ade80", tier: "Neutral", desc: "This performance is real." },
    { name: "Belief", x: 45, y: 35, color: "#22c55e", tier: "Greed", desc: "Time to buy the dip." },
    { name: "Thrilling", x: 60, y: 15, color: "#16a34a", tier: "Greed", desc: "I will buy more on margin." },
    { name: "Euphoria", x: 75, y: 5, color: "#34d399", tier: "Mania", desc: "I am a genius! We are all gonna be rich!" },
    { name: "Complacency", x: 82, y: 20, color: "#fbbf24", tier: "Greed", desc: "We just need to cool off." },
    { name: "Anxiety", x: 88, y: 45, color: "#f59e0b", tier: "Neutral", desc: "Why am I getting margin calls?" },
    { name: "Denial", x: 92, y: 65, color: "#ef4444", tier: "Fear", desc: "My investments are with good companies." },
    { name: "Panic", x: 96, y: 85, color: "#dc2626", tier: "Fear", desc: "Sell everything! Get me out!" },
    { name: "Anger", x: 98, y: 92, color: "#b91c1c", tier: "Fear", desc: "Why did the government allow this?!" },
    { name: "Depression", x: 100, y: 98, color: "#7f1d1d", tier: "Fear", desc: "My retirement is gone. I'm a failure." },
];

const MarketPsychologyCycle = () => {
    const [activeStage, setActiveStage] = useState<number | null>(null);

    // Updated smooth curve path - more accurate to Wall Street Cheat Sheet
    const pathD = "M 0 92 Q 10 92, 20 80 T 40 50 T 60 20 T 75 5 Q 80 5, 85 25 T 95 80 T 100 100";

    return (
        <div className="glass-panel p-8 space-y-6 relative overflow-hidden group">
            {/* Background Aesthetic */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight italic uppercase">
                        <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                            <Info className="text-cyan-400" size={20} />
                        </div>
                        Market Psychology Cycle
                    </h2>
                    <p className="text-slate-500 text-xs mt-2 font-bold uppercase tracking-[0.2em] opacity-80">
                        The "Wall Street Cheat Sheet" visualized.
                    </p>
                </div>
            </div>

            <div className="relative h-96 w-full bg-slate-950/40 backdrop-blur-md rounded-3xl border border-white/5 p-10 overflow-hidden group/graph">
                {/* Sentiment Zones Background Overlays */}
                <div className="absolute inset-x-0 top-0 h-[25%] bg-emerald-500/5 border-b border-emerald-500/10 pointer-events-none flex items-center justify-end px-6">
                    <span className="text-[10px] font-black text-emerald-500/30 uppercase tracking-[0.3em]">Extreme Greed / Mania</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-[25%] bg-red-500/5 border-t border-red-500/10 pointer-events-none flex items-center justify-end px-6">
                    <span className="text-[10px] font-black text-red-500/30 uppercase tracking-[0.3em]">Extreme Fear / Depression</span>
                </div>

                <svg viewBox="-5 -10 110 120" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#64748b" />
                            <stop offset="30%" stopColor="#22c55e" />
                            <stop offset="70%" stopColor="#34d399" />
                            <stop offset="85%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#b91c1c" />
                        </linearGradient>
                        <filter id="highGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* The Cycle Line */}
                    <motion.path
                        d={pathD}
                        fill="none"
                        stroke="url(#curveGradient)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        filter="url(#highGlow)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                    />

                    {/* Interaction Points */}
                    {stages.map((stage, i) => {
                        const isRightSide = stage.x > 80;
                        const labelYOffset = isRightSide ? 10 : -8;
                        const textAnchor = isRightSide ? "start" : stage.x < 10 ? "start" : "middle";
                        const labelXOffset = isRightSide ? 4 : 0;

                        return (
                            <g key={i}
                                onMouseEnter={() => { setActiveStage(i); }}
                                onMouseLeave={() => setActiveStage(null)}
                                className="cursor-pointer group/node"
                            >
                                <motion.circle
                                    cx={stage.x}
                                    cy={stage.y}
                                    r={activeStage === i ? 5 : 2.5}
                                    fill={stage.color}
                                    stroke="white"
                                    strokeWidth={activeStage === i ? 1.5 : 0}
                                    className="transition-all duration-300"
                                />

                                <text
                                    x={stage.x + labelXOffset}
                                    y={stage.y + labelYOffset}
                                    fontSize="4"
                                    fill={activeStage === i ? "#ffffff" : "#64748b"}
                                    textAnchor={textAnchor}
                                    className={`transition-all duration-300 pointer-events-none uppercase tracking-tighter ${activeStage === i ? 'font-black' : 'font-bold'}`}
                                >
                                    {stage.name}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Popover Description - Professional Style */}
                <AnimatePresence>
                    {activeStage !== null && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] z-20 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-black text-white italic uppercase tracking-widest text-lg">{stages[activeStage].name}</h4>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${stages[activeStage].tier === 'Mania' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' :
                                    stages[activeStage].tier === 'Greed' ? 'bg-green-500/20 border-green-500/50 text-green-400' :
                                        stages[activeStage].tier === 'Fear' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                                            'bg-slate-500/20 border-slate-500/50 text-slate-400'
                                    }`}>
                                    {stages[activeStage].tier} TIER
                                </span>
                            </div>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed italic">"{stages[activeStage].desc}"</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] justify-center">
                <span>Stealth Phase</span>
                <div className="w-12 h-[1px] bg-slate-800" />
                <span>Awareness</span>
                <div className="w-12 h-[1px] bg-slate-800" />
                <span>Enthusiasm</span>
                <div className="w-12 h-[1px] bg-slate-800" />
                <span>Greed</span>
                <div className="w-12 h-[1px] bg-slate-800" />
                <span className="text-red-900">Blow-off</span>
            </div>
        </div>
    );
};

export default MarketPsychologyCycle;
