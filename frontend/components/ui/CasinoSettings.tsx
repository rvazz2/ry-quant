"use client";

import React from 'react';
import { useCasinoSettings } from '@/contexts/CasinoSettingsContext';
import { motion } from 'framer-motion';
import { PlayingCard } from './PlayingCard';
import { Settings, Shield, Wand2 } from 'lucide-react';

export function CasinoSettings() {
    const { deckStyle, setDeckStyle } = useCasinoSettings();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-slate-500/10 rounded-2xl border border-slate-500/20 shadow-[0_0_20px_rgba(100,116,139,0.1)]">
                    <Settings className="text-slate-400" size={28} />
                </div>
                <div>
                    <h4 className="text-2xl font-black text-white tracking-tight uppercase italic">Casino Settings</h4>
                    <p className="text-slate-400 text-sm font-medium tracking-wide">Customize your experience on the floor.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="p-6 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[2rem]">
                        <div className="flex items-center gap-3 mb-6">
                            <Wand2 className="text-indigo-400" size={20} />
                            <h5 className="text-lg font-bold text-white uppercase tracking-wider">Card Deck Style</h5>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => setDeckStyle('classic')}
                                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${deckStyle === 'classic' ? 'bg-indigo-500/10 border-indigo-500' : 'bg-transparent border-white/10 hover:border-white/20'}`}
                            >
                                <span className={`font-bold ${deckStyle === 'classic' ? 'text-indigo-400' : 'text-slate-400'}`}>Classic Standard</span>
                                {deckStyle === 'classic' && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]" />}
                            </button>

                            <button
                                onClick={() => setDeckStyle('luxury')}
                                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${deckStyle === 'luxury' ? 'bg-yellow-500/10 border-yellow-500' : 'bg-transparent border-white/10 hover:border-white/20'}`}
                            >
                                <div className="text-left">
                                    <span className={`block font-bold ${deckStyle === 'luxury' ? 'text-yellow-400' : 'text-slate-400'}`}>Viper Luxury</span>
                                    <span className="text-[10px] text-slate-500 font-medium italic">Matte Black & Gold Leaf</span>
                                </div>
                                {deckStyle === 'luxury' && <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,1)]" />}
                            </button>

                            <button
                                onClick={() => setDeckStyle('jungle')}
                                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${deckStyle === 'jungle' ? 'bg-emerald-500/10 border-emerald-500' : 'bg-transparent border-white/10 hover:border-white/20'}`}
                            >
                                <div className="text-left">
                                    <span className={`block font-bold ${deckStyle === 'jungle' ? 'text-emerald-400' : 'text-slate-400'}`}>Jungle Royale</span>
                                    <span className="text-[10px] text-slate-500 font-medium italic">The King of the Wild</span>
                                </div>
                                {deckStyle === 'jungle' && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative p-8 bg-slate-950/60 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center gap-8 min-h-[400px]">
                    <div className="absolute top-6 left-6 text-xs font-black text-slate-600 uppercase tracking-widest">Preview</div>

                    <div className="flex gap-4">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-b from-white/5 to-transparent blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <PlayingCard faceDown size="lg" />
                        </div>
                        <PlayingCard suit="spades" rank="A" size="lg" />
                    </div>

                    <p className="text-xs text-slate-500 font-medium italic max-w-xs text-center">
                        {deckStyle === 'classic' && 'Standard casino grade cards. Reliable, visible, and honest.'}
                        {deckStyle === 'luxury' && 'Premium matte finish with gold foil embossing. For the high rollers.'}
                        {deckStyle === 'jungle' && 'Apex predator aesthetics. Black, Gold, and the spirit of the wild.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
