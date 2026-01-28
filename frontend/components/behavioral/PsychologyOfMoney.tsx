"use client";

import React, { useState } from 'react';
import {
    Wallet,
    Clock,
    Brain,
    Scale,
    ShoppingBag,
    TrendingUp,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';

const concepts = [
    {
        title: "The Diderot Effect",
        description: "The tendency for obtaining a new possession to create a spiral of consumption which leads you to acquire more new things. As a result, we end up buying things that our previous selves never needed to feel happy or fulfilled.",
        icon: ShoppingBag,
        color: "text-rose-400",
        borderColor: "border-rose-500/50"
    },
    {
        title: "Mentla Accounting",
        description: "Treating money differently depending on where it came from. We might blow a $100 bonus on a fancy dinner but agonize over a $100 grocery bill, even though money is fungible.",
        icon: Brain,
        color: "text-purple-400",
        borderColor: "border-purple-500/50"
    },
    {
        title: "Hedonic Adaptation",
        description: "The observed tendency of humans to quickly return to a relatively stable level of happiness despite major positive or negative events or life changes. The 'new car smell' of happiness fades quickly.",
        icon: TrendingUp,
        color: "text-emerald-400",
        borderColor: "border-emerald-500/50"
    },
    {
        title: "Anchoring Bias",
        description: "Relying too heavily on the first piece of information offered (the 'anchor') when making decisions. Stores use high 'original prices' to make the sale price seem like a steal.",
        icon: Scale,
        color: "text-cyan-400",
        borderColor: "border-cyan-500/50"
    }
];

const spendingTriggers = [
    "Stress or Anxiety",
    "Boredom",
    "Social Pressure (FOMO)",
    "Celebration / Reward",
    "Sadness / 'Retail Therapy'",
    "Sales / Perceived Scarcity"
];

const PsychologyOfMoney = () => {
    const [salary, setSalary] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [selectedTriggers, setSelectedTriggers] = useState<Set<string>>(new Set());

    const toggleTrigger = (trigger: string) => {
        const next = new Set(selectedTriggers);
        if (next.has(trigger)) {
            next.delete(trigger);
        } else {
            next.add(trigger);
        }
        setSelectedTriggers(next);
    };

    // Calculate "Life Energy" cost
    const hourlyRate = parseFloat(salary) || 0;
    const itemCost = parseFloat(price) || 0;
    const hoursCost = hourlyRate > 0 ? (itemCost / hourlyRate).toFixed(1) : "0.0";
    const daysCost = hourlyRate > 0 ? (itemCost / (hourlyRate * 8)).toFixed(1) : "0.0";

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
                    <Wallet className="text-yellow-400" />
                    The Psychology of Spending
                </h2>
                <p className="text-slate-400">
                    Understanding the hidden forces that drive our financial decisions.
                </p>
            </header>

            {/* Concept Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {concepts.map((concept, idx) => (
                    <div key={idx} className={`p-4 bg-slate-900/40 border rounded-xl backdrop-blur-sm ${concept.borderColor} hover:bg-slate-900/60 transition-colors`}>
                        <div className="flex items-start gap-3">
                            <div className={`p-3 rounded-lg bg-slate-950 shadow-inner ${concept.color}`}>
                                <concept.icon size={24} />
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg mb-1 text-slate-200`}>{concept.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {concept.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* True Cost Calculator */}
                <div className="glass-panel p-6 border border-slate-800 rounded-2xl bg-black/20">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Clock className="text-cyan-400" />
                        "True Cost" Calculator
                    </h3>
                    <p className="text-sm text-slate-400 mb-6">
                        Convert a price tag into hours of your life. Is it worth the time you traded for it?
                    </p>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Hourly Wage ($)</label>
                                <input
                                    type="number"
                                    value={salary}
                                    onChange={(e) => setSalary(e.target.value)}
                                    placeholder="25.00"
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Item Price ($)</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="80.00"
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-around text-center">
                            <div>
                                <div className="text-2xl font-bold text-white">{hoursCost}</div>
                                <div className="text-xs text-slate-500 uppercase font-bold">Hours of Work</div>
                            </div>
                            <div className="w-px bg-slate-800 mx-4"></div>
                            <div>
                                <div className="text-2xl font-bold text-white">{daysCost}</div>
                                <div className="text-xs text-slate-500 uppercase font-bold">Work Days (8h)</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Spending Triggers */}
                <div className="glass-panel p-6 border border-slate-800 rounded-2xl bg-black/20">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="text-yellow-400" />
                        Spending Trigger Check
                    </h3>
                    <p className="text-sm text-slate-400 mb-6">
                        Identify what emotional states usually lead you to spend money impulsively.
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {spendingTriggers.map((trigger) => (
                            <button
                                key={trigger}
                                onClick={() => toggleTrigger(trigger)}
                                className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${selectedTriggers.has(trigger)
                                        ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                                        : "bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800"
                                    }`}
                            >
                                {selectedTriggers.has(trigger) && <CheckCircle2 size={14} className="inline mr-2" />}
                                {trigger}
                            </button>
                        ))}
                    </div>

                    {selectedTriggers.size > 0 && (
                        <div className="mt-6 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-sm text-purple-200">
                            <strong>Insight:</strong> Awareness is the first step. Next time you feel <span className="text-white font-bold">{Array.from(selectedTriggers)[0]}</span>, try pausing for 24 hours before buying.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PsychologyOfMoney;
