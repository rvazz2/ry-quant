"use client";

import React from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowRight, ShieldAlert, Clock, Wallet, GraduationCap, Zap } from 'lucide-react';
import FinancialQuiz from './FinancialQuiz';
import PremiumCard from '../ui/premium/PremiumCard';

export default function FinancialLiteracyDashboard() {
    return (
        <div className="space-y-24 pb-20">
            {/* Header */}
            <div className="text-center pt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-8">
                    Our Philosophy
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
                    The Financial System <br />
                    Is Not <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Designed For You</span>.
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                    Colleges teach you how to work for money. We teach you how to make money work for you.
                    It&apos;s time to level the playing field.
                </p>
            </div>

            {/* The Reality Check */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PremiumCard className="p-8 group hover:border-red-500/30">
                    <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-6 text-red-400 group-hover:scale-110 transition-transform">
                        <ShieldAlert size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">The Debt Trap</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Applying for a $100k non-bankruptable student loan is easier than getting a business loan. The system profits when you are in debt.
                    </p>
                </PremiumCard>
                <PremiumCard className="p-8 group hover:border-amber-500/30">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-6 text-amber-400 group-hover:scale-110 transition-transform">
                        <Clock size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">The Cost of Waiting</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Every year you wait to start investing costs you tens of thousands in future compound interest. Time is the one asset you have more of than billionaires.
                    </p>
                </PremiumCard>
                <PremiumCard className="p-8 group hover:border-cyan-500/30">
                    <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform">
                        <GraduationCap size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">The Education Gap</h3>
                    <p className="text-slate-400 leading-relaxed">
                        You know vector calculus but not how to read a 10-K. We bridge the gap between academic theory and real-world wealth generation.
                    </p>
                </PremiumCard>
            </div>

            {/* Financial Quiz Section */}
            <div id="quiz" className="scroll-mt-24">
                <FinancialQuiz />
            </div>

            {/* Wise Quotes Section */}
            <div>
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">Words of Wisdom</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        The principles of wealth creation haven&apos;t changed in centuries.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        {
                            quote: "Compound interest is the eighth wonder of the world. He who understands it, earns it... he who doesn&apos;t... pays it.",
                            author: "Albert Einstein",
                            role: "Theoretical Physicist"
                        },
                        {
                            quote: "The stock market is a device for transferring money from the impatient to the patient.",
                            author: "Warren Buffett",
                            role: "Chairman, Berkshire Hathaway"
                        },
                        {
                            quote: "The big money is not in the buying and the selling, but in the waiting.",
                            author: "Charlie Munger",
                            role: "Vice Chairman, Berkshire Hathaway"
                        },
                        {
                            quote: "Know what you own, and know why you own it.",
                            author: "Peter Lynch",
                            role: "Legendary Investor"
                        },
                        {
                            quote: "An investment in knowledge pays the best interest.",
                            author: "Benjamin Franklin",
                            role: "Founding Father"
                        },
                        {
                            quote: "It’s not how much money you make, but how much money you keep, how hard it works for you, and how many generations you keep it for.",
                            author: "Robert Kiyosaki",
                            role: "Author, Rich Dad Poor Dad"
                        }
                    ].map((item, i) => (
                        <PremiumCard key={i} className="p-8 hover:bg-slate-900/60 transition-all hover:-translate-y-1 relative group">
                            <div className="absolute top-6 left-6 text-cyan-500/20 text-6xl font-serif leading-none select-none group-hover:text-cyan-500/30 transition-colors">&quot;</div>
                            <div className="relative z-10 pt-6">
                                <p className="text-slate-300 text-lg leading-relaxed mb-6 italic">
                                    {item.quote}
                                </p>
                                <div>
                                    <h4 className="text-white font-bold">{item.author}</h4>
                                    <p className="text-cyan-500 text-xs uppercase tracking-wider font-bold mt-1">{item.role}</p>
                                </div>
                            </div>
                        </PremiumCard>
                    ))}
                </div>
            </div>

            {/* The Solution / Section */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-[3rem] p-8 md:p-20 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent" />

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-4xl font-bold text-white">Compound Interest: <br />The 8th Wonder</h2>
                        <div className="space-y-6 text-lg text-slate-300 font-light">
                            <p>
                                If you invest <span className="text-white font-bold">$100/month</span> starting at age 20 (assuming 8% return), you&apos;ll have <span className="text-emerald-400 font-bold">~$500,000</span> by retirement.
                            </p>
                            <p>
                                Wait until age 30, and you&apos;d need to invest <span className="text-rose-400 font-bold">$220/month</span> to reach the same goal.
                            </p>
                            <p>
                                The &quot;poor student&quot; mindset is expensive. Even small habits now create massive freedom later.
                            </p>
                        </div>
                        <Link href="/planning" className="inline-flex items-center gap-2 text-cyan-400 font-bold hover:gap-4 transition-all">
                            Build Your Plan <ArrowRight size={18} />
                        </Link>
                    </div>

                    {/* Simple Chart Visualization placeholder */}
                    <div className="relative h-64 bg-slate-800/50 rounded-xl border border-white/10 overflow-hidden flex items-end p-8 gap-4">
                        <div className="w-1/2 bg-gradient-to-t from-slate-600 to-slate-500 h-[30%] rounded-t-lg relative group">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-slate-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Start at 30</div>
                        </div>
                        <div className="w-1/2 bg-gradient-to-t from-emerald-600 to-cyan-400 h-[80%] rounded-t-lg relative group shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-emerald-400 text-xs font-bold">Start at 20</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actionable Steps */}
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Your Cheat Sheet</h2>
                    <p className="text-slate-400">Practical steps you can take today, not in 10 years.</p>
                </div>

                <div className="space-y-4">
                    {[
                        { icon: <Wallet size={20} />, title: "Open a Roth IRA", desc: "Tax-free growth. The government's gift to young people." },
                        { icon: <Zap size={20} />, title: "Kill High-Interest Debt", desc: "Credit card debt is a financial emergency. Treat it like one." },
                        { icon: <TrendingUp size={20} />, title: "Buy the S&P 500", desc: "Don't pick stocks until you have a foundation. Bet on America." }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-6 p-6 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:scale-[1.02] transition-all">
                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                                {item.icon}
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white">{item.title}</h4>
                                <p className="text-slate-400 text-sm">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
