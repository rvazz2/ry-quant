"use client";

import React, { useState } from 'react';
import { LIBRARY_TOPICS, LibraryTopic } from '@/lib/library-data';
import { Search, BookOpen, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


import { createPortal } from 'react-dom';

const LibraryContent = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTopic, setSelectedTopic] = useState<LibraryTopic | null>(null);
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Add Escape key handler for modal
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedTopic) {
                setSelectedTopic(null);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [selectedTopic]);

    const filteredTopics = LIBRARY_TOPICS.filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.terms.some(t => t.term.toLowerCase().includes(searchQuery.toLowerCase()) || t.definition.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Knowledge Library
                    </h1>
                    <p className="text-slate-400 mt-1">Master financial concepts and terminology</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search topics or terms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTopics.map((topic) => (
                    <motion.div
                        layoutId={`topic-${topic.id}`}
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic)}
                        className="group bg-slate-900/40 border border-slate-800/60 hover:border-cyan-500/30 rounded-xl p-5 cursor-pointer transition-all hover:bg-slate-800/60 hover:shadow-lg hover:shadow-cyan-900/10"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all duration-300">
                                <topic.icon size={24} />
                            </div>
                            <div className="bg-slate-800/50 px-2 py-1 rounded text-xs font-mono text-slate-500 group-hover:text-cyan-400/70 transition-colors">
                                {topic.terms.length} Terms
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-slate-200 group-hover:text-cyan-100 mb-2">{topic.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2">{topic.description}</p>

                        <div className="mt-4 flex items-center text-xs font-medium text-cyan-500/70 group-hover:text-cyan-400 transition-colors">
                            Explore Topic <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {mounted && createPortal(
                <AnimatePresence>
                    {selectedTopic && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedTopic(null)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div
                                layoutId={`topic-${selectedTopic.id}`}
                                className="relative w-full max-w-2xl bg-[#0f1115] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col z-10"
                            >
                                <div className="p-6 border-b border-slate-800/60 bg-slate-900/50 flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                                            <selectedTopic.icon size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{selectedTopic.title}</h2>
                                            <p className="text-slate-400 text-sm mt-1">{selectedTopic.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedTopic(null)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto custom-scrollbar">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Key Terms & Concepts</h3>
                                    <div className="space-y-4">
                                        {selectedTopic.terms.map((term, idx) => (
                                            <div key={idx} className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-4 hover:border-cyan-500/20 transition-colors">
                                                <div className="flex items-baseline gap-2 mb-2">
                                                    <h4 className="text-lg font-semibold text-cyan-100">{term.term}</h4>
                                                    <div className="h-px bg-slate-800 flex-1 ml-2"></div>
                                                </div>
                                                <p className="text-slate-300 leading-relaxed text-sm">
                                                    {term.definition}
                                                </p>
                                                {term.example && (
                                                    <div className="mt-3 p-3 bg-cyan-950/20 rounded border border-cyan-900/30 text-xs text-cyan-200/80 italic">
                                                        Example: {term.example}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 border-t border-slate-800/60 bg-slate-900/30 text-center text-xs text-slate-500">
                                    Learning content provided by QuantDash Academy
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default LibraryContent;
