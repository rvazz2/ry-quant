"use client";

import React, { useState } from 'react';
import { LIBRARY_TOPICS, LibraryTopic } from '@/lib/library-data';
import { Search, BookOpen, ChevronRight, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';


import { createPortal } from 'react-dom';

interface LibraryContentProps {
    isDrawer?: boolean;
}

const LibraryContent = ({ isDrawer = false }: LibraryContentProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTopic, setSelectedTopic] = useState<LibraryTopic | null>(null);
    const [mounted, setMounted] = useState(false);

    const searchParams = useSearchParams();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Deep Linking Effect
    React.useEffect(() => {
        if (!mounted) return;

        const topicId = searchParams.get('topic');
        const termName = searchParams.get('term');

        if (topicId) {
            const foundTopic = LIBRARY_TOPICS.find(t => t.id === topicId);
            if (foundTopic) {
                setSelectedTopic(foundTopic);

                // If there's a term, wait for modal to open/render then scroll to it
                if (termName) {
                    setTimeout(() => {
                        const element = document.getElementById(`term-${termName.replace(/\s+/g, '-').toLowerCase()}`);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            // Highlight effect
                            element.classList.add('ring-2', 'ring-cyan-500', 'bg-cyan-900/40');
                            setTimeout(() => element.classList.remove('ring-2', 'ring-cyan-500', 'bg-cyan-900/40'), 3000);
                        }
                    }, 500); // Small delay to ensure modal animation completes
                }
            }
        }
    }, [searchParams, mounted]);

    // Add Escape key handler for modal
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedTopic) {
                // Clear URL params on close logic could go here but might be annoying if navigating back
                setSelectedTopic(null);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [selectedTopic]);

    // Filter topics based on search and category
    const filteredTopics = LIBRARY_TOPICS.filter(topic => {
        const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            topic.terms.some(t => t.term.toLowerCase().includes(searchQuery.toLowerCase()) || t.definition.toLowerCase().includes(searchQuery.toLowerCase()));

        // Simple category logic - in a real app, topics might have a 'category' field
        // For now, we'll just show all if "all" is selected, otherwise we could implement specific logic
        // Since the current data structure doesn't have explicit categories, we'll skip the category filter logic for now
        // or we could infer it. Let's stick to search for simplicity unless we refactor data.
        return matchesSearch;
    });

    return (
        <div className="space-y-8">
            {!isDrawer && (
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl rounded-full -z-10" />
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-end mb-10">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                                Knowledge Library
                            </h1>
                            <p className="text-slate-400 text-lg max-w-2xl">
                                Master individual financial concepts, detailed terminology, and advanced market mechanics.
                            </p>
                        </div>

                        <div className="relative w-full md:w-96 group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                            <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-800 p-1">
                                <Search className="ml-3 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search 150+ terms..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 py-2.5 px-3"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isDrawer && (
                <div className="relative w-full mb-6">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-20"></div>
                    <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-800">
                        <Search className="ml-3 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search library..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-100 placeholder-slate-500 py-3 px-3"
                        />
                    </div>
                </div>
            )}

            <div className={`grid gap-5 ${isDrawer ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {filteredTopics.map((topic) => {
                    const Icon = topic.icon;
                    return (
                        <motion.div
                            key={topic.id}
                            layoutId={`card-${topic.id}`}
                            onClick={() => setSelectedTopic(topic)}
                            whileHover={{ y: -5 }}
                            className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-900/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-5">
                                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-cyan-400 group-hover:bg-cyan-500/10 group-hover:scale-110 group-hover:border-cyan-500/20 transition-all duration-300 shadow-lg shadow-black/20">
                                        <Icon size={24} />
                                    </div>
                                    <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-400 group-hover:text-cyan-300 group-hover:border-cyan-500/20 transition-colors">
                                        {topic.terms.length} Terms
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-200 group-hover:text-white mb-2 transition-colors">{topic.title}</h3>
                                <p className="text-sm text-slate-500 group-hover:text-slate-400 line-clamp-2 leading-relaxed transition-colors">
                                    {topic.description}
                                </p>

                                <div className="mt-6 flex items-center text-xs font-bold text-cyan-500/70 group-hover:text-cyan-400 uppercase tracking-wider transition-colors">
                                    Expand Topic <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {mounted && createPortal(
                <AnimatePresence>
                    {selectedTopic && (
                        <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedTopic(null)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                            />
                            <motion.div
                                layoutId={`card-${selectedTopic.id}`} // Shared layout transition if possible, mostly for entry
                                initial={{ x: "100%", opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: "100%", opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="relative w-full max-w-2xl h-full bg-[#0a0c10] border-l border-slate-800 shadow-2xl overflow-hidden flex flex-col z-10 pointer-events-auto"
                            >
                                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none" />

                                <div className="relative p-8 border-b border-slate-800/60 flex items-start justify-between bg-slate-900/30 backdrop-blur-md z-20">
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-xl text-cyan-400">
                                            {(() => {
                                                const SelectedIcon = selectedTopic.icon;
                                                return <SelectedIcon size={32} />;
                                            })()}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-white mb-1">{selectedTopic.title}</h2>
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <BookOpen size={14} />
                                                <span>{selectedTopic.terms.length} Definitions</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                const url = new URL(window.location.href);
                                                url.searchParams.set('topic', selectedTopic.id);
                                                navigator.clipboard.writeText(url.toString());
                                            }}
                                            className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-cyan-400 transition-all active:scale-95"
                                            title="Copy Link to Topic"
                                        >
                                            <Search size={20} className="rotate-90" />
                                        </button>
                                        <button
                                            onClick={() => setSelectedTopic(null)}
                                            className="p-2.5 hover:bg-rose-500/10 rounded-xl text-slate-500 hover:text-rose-400 transition-all active:scale-95"
                                        >
                                            <X size={22} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 relative z-10">
                                    <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 mb-8 text-slate-300 leading-relaxed text-lg">
                                        {selectedTopic.description}
                                    </div>

                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2 ml-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                        Dictionary Terms
                                    </h3>

                                    <div className="space-y-4">
                                        {selectedTopic.terms.map((term, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={idx}
                                                id={`term-${term.term.replace(/\s+/g, '-').toLowerCase()}`}
                                                className="group bg-slate-900/20 border border-slate-800/50 hover:border-cyan-500/30 rounded-xl p-5 hover:bg-slate-800/40 transition-all duration-300"
                                            >
                                                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2">
                                                    <h4 className="text-lg font-bold text-cyan-100 group-hover:text-cyan-400 transition-colors">{term.term}</h4>
                                                    <div className="hidden md:block h-px flex-1 bg-slate-800 group-hover:bg-slate-700/50 transition-colors" />
                                                </div>
                                                <p className="text-slate-300 leading-relaxed text-base font-light">
                                                    {term.definition}
                                                </p>
                                                {term.example && (
                                                    <div className="mt-4 p-4 bg-gradient-to-r from-cyan-950/20 to-transparent rounded-lg border-l-2 border-cyan-500/50">
                                                        <span className="text-xs font-bold text-cyan-500 uppercase tracking-wide block mb-1">Example</span>
                                                        <span className="text-sm text-cyan-100/80 italic font-medium">
                                                            &quot;{term.example}&quot;
                                                        </span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
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
