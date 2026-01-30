"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Landmark, Skull, Handshake } from 'lucide-react';

interface LoanSharkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: (amount: number, interestRate: number) => void;
    debt: number;
}

export function LoanSharkModal({ isOpen, onClose, onAccept, debt }: LoanSharkModalProps) {
    const [loanAmount, setLoanAmount] = useState(1000);
    const interestRate = 0.50; // 50% interest

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[800] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="max-w-lg w-full bg-zinc-950 border border-zinc-800 rounded-[3rem] p-10 relative overflow-hidden text-center shadow-2xl"
                >
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-600 to-transparent" />

                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-zinc-700 shadow-xl">
                        <Landmark className="text-rose-600" size={40} />
                    </div>

                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 italic">The Liquidity Provider</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-8">"Bad credit? No problem."</p>

                    <div className="space-y-6 mb-10">
                        <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 text-left">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Loan Amount</span>
                                <span className="text-xl font-mono font-bold text-white">${loanAmount}</span>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="5000"
                                step="100"
                                value={loanAmount}
                                onChange={(e) => setLoanAmount(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-rose-600"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Interest Rate</div>
                                <div className="text-xl font-black text-rose-500">50% <span className="text-[10px] text-slate-600">/ Session</span></div>
                            </div>
                            <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Repayment</div>
                                <div className="text-xl font-black text-white">${(loanAmount * (1 + interestRate)).toFixed(0)}</div>
                            </div>
                        </div>

                        {debt > 0 && (
                            <div className="p-4 bg-rose-950/20 rounded-2xl border border-rose-500/20">
                                <div className="flex items-center gap-3 justify-center text-rose-500">
                                    <Skull size={16} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Existing Debt: ${debt.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => onAccept(loanAmount, interestRate)}
                            className="w-full py-5 bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center gap-3"
                        >
                            <Handshake size={20} />
                            Accept Terms
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-4 text-slate-500 font-bold uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Decline & Stay Broke
                        </button>
                    </div>

                    <p className="mt-8 text-[10px] text-zinc-600 leading-relaxed italic max-w-xs mx-auto">
                        By accepting this loan, you acknowledge that predatory lending is a major contributor to financial ruin. Interest compounds daily. Good luck.
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
