"use client";

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceDot, LabelList } from 'recharts';
import { Info } from 'lucide-react';
import { motion } from 'framer-motion';

// Simulate the Market Psychology Curve (The "Bubble" Pattern)
const data = [
    { name: "Stealth", price: 10, phase: "Smart Money" },
    { name: "Awareness", price: 20, phase: "Institutional" },
    { name: "Sell Off", price: 15, phase: "Bear Trap" },
    { name: "Media", price: 35, phase: "Public" },
    { name: "Enthusiasm", price: 60, phase: "Greed" },
    { name: "Greed", price: 85, phase: "Delusion" },
    { name: "Euphoria", price: 100, phase: "New Paradigm" }, // Peak
    { name: "Bull Trap", price: 85, phase: "Denial" },
    { name: "Fear", price: 60, phase: "Bull Trap" },
    { name: "Capitulation", price: 30, phase: "Panic" },
    { name: "Despair", price: 15, phase: "Depression" },
    { name: "Return", price: 25, phase: "Hope" },
];

// Interpolate for smooth curve
const generateCurve = () => {
    const curve = [];
    for (let i = 0; i < data.length - 1; i++) {
        const start = data[i];
        const end = data[i + 1];
        const steps = 10;
        for (let j = 0; j < steps; j++) {
            const t = j / steps;
            // Linear-ish interpolation for simplicity, or could use Bezier math
            // Using slight smoothstep
            const smoothT = t * t * (3 - 2 * t);
            curve.push({
                name: start.name,
                price: start.price + (end.price - start.price) * smoothT,
                originalPoint: j === 0 ? start : null
            });
        }
    }
    curve.push({ name: data[data.length - 1].name, price: data[data.length - 1].price, originalPoint: data[data.length - 1] });
    return curve;
};

const curveData = generateCurve();

const MarketPsychologyCycle = () => {
    return (
        <div className="glass-panel p-8 space-y-6 relative overflow-hidden h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <BrainIcon />
                        Market Psychology Cycle
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">
                        The emotional rollercoaster of the average investor.
                    </p>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={curveData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="50%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" hide />
                        <YAxis hide domain={[0, 110]} />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const pt = payload[0].payload.originalPoint;
                                    if (!pt) return null;
                                    return (
                                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
                                            <p className="text-white font-bold mb-1">{pt.name}</p>
                                            <p className="text-xs text-purple-300 font-mono">{pt.phase}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="url(#lineGradient)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                        />
                        {/* Highlights for Key Stages */}
                        {data.map((pt, i) => (
                            <ReferenceDot
                                key={i}
                                x={pt.name} // Note: This mapping matches interpolation index if using category axis correctly, but here we used generated curve.
                            // Quick fix: Recharts category axis uses index. We need to find the index in curveData.
                            // Actually, simpler: Just use ReferenceDot with x as index if using category? 
                            // Let's simplify: Just render labels manually or use Customized dot.
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>

                {/* Manual overlays for key phases because Recharts ReferenceDot on interpolated data is tricky */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <PhaseLabel top="85%" left="5%" text="Disbelief" color="text-slate-500" />
                    <PhaseLabel top="60%" left="20%" text="Optimism" color="text-green-400" />
                    <PhaseLabel top="10%" left="45%" text="Euphoria" color="text-purple-400" />
                    <PhaseLabel top="30%" left="70%" text="Anxiety" color="text-orange-400" />
                    <PhaseLabel top="85%" left="85%" text="Panic" color="text-red-500" />
                </div>
            </div>
        </div>
    );
};

const PhaseLabel = ({ top, left, text, color }: { top: string, left: string, text: string, color: string }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className={`absolute font-bold text-xs ${color} bg-slate-900/80 px-2 py-1 rounded backdrop-blur-sm border border-white/5`}
        style={{ top, left }}
    >
        {text}
    </motion.div>
);

const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
        <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
        <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
        <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
        <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
        <path d="M3.477 12.578a4 4 0 0 1-.375-1.789" />
        <path d="M20.52 10.789c.12.583.184 1.185.184 1.789" />
    </svg>
);

export default MarketPsychologyCycle;
