import React, { useEffect, useState } from 'react';
import { getCognitiveBiases } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronLeft, ChevronRight, Lightbulb, Zap } from 'lucide-react';

interface CognitiveBias {
    id: string;
    name: string;
    definition: string;
    example: string;
    tip: string;
}

export default function CognitiveBiasExplorer() {
    const [biases, setBiases] = useState<CognitiveBias[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBiases();
    }, []);

    const loadBiases = async () => {
        setLoading(true);
        try {
            const data = await getCognitiveBiases();
            if (data && data.length > 0) {
                setBiases(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const nextBias = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % biases.length);
        }, 200);
    };

    const prevBias = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + biases.length) % biases.length);
        }, 200);
    };

    if (loading) return <div className="h-64 w-full bg-slate-900/50 animate-pulse rounded-xl" />;

    if (biases.length === 0) return null;

    const currentBias = biases[currentIndex];

    return (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl flex flex-col h-full relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 z-10">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-pink-500" />
                    Cognitive Bias Explorer
                </h3>
                <div className="text-xs text-slate-500">
                    {currentIndex + 1} / {biases.length}
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center perspective-1000 relative z-10 min-h-[200px]">
                <div
                    className="relative w-full h-full cursor-pointer group"
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <AnimatePresence mode='wait'>
                        {!isFlipped ? (
                            <motion.div
                                key="front"
                                initial={{ opacity: 0, rotateY: 90 }}
                                animate={{ opacity: 1, rotateY: 0 }}
                                exit={{ opacity: 0, rotateY: -90 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-800/80 rounded-xl border border-slate-700 hover:border-pink-500/50 transition-colors"
                            >
                                <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-4">
                                    {currentBias.name}
                                </h4>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {currentBias.definition}
                                </p>
                                <div className="mt-6 text-xs text-slate-500 flex items-center gap-1 animate-bounce">
                                    <Zap className="w-3 h-3" /> Click to reveal example
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="back"
                                initial={{ opacity: 0, rotateY: 90 }}
                                animate={{ opacity: 1, rotateY: 0 }}
                                exit={{ opacity: 0, rotateY: -90 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-800/80 rounded-xl border border-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.1)]"
                            >
                                <div className="mb-4">
                                    <div className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-1">Example</div>
                                    <p className="text-slate-200 text-sm italic">"{currentBias.example}"</p>
                                </div>

                                <div className="bg-pink-900/20 p-3 rounded-lg border border-pink-500/20">
                                    <div className="text-xs font-bold text-pink-300 flex items-center justify-center gap-1 mb-1">
                                        <Lightbulb className="w-3 h-3" /> Pro Tip
                                    </div>
                                    <p className="text-xs text-slate-300">{currentBias.tip}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between w-full mt-6 z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); prevBias(); }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-1 items-center">
                    {biases.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-pink-500' : 'bg-slate-700'}`}
                        />
                    ))}
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); nextBias(); }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-pink-500/10 blur-[80px] -z-1" />
        </div>
    );
}
