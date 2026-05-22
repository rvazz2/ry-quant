"use client";

import React, { useState, useMemo } from 'react';
import { LIBRARY_TOPICS, LibraryTopic } from '@/lib/library-data';
import { Search, BookOpen, ChevronRight, X, Filter, Star, Brain, Trophy, BarChart2, Grid, List, Sparkles, Download, Plus, Trash2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useLibraryProgress } from '@/hooks/useLibraryProgress';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import QuizMode from './QuizMode';
import LibraryStats from './LibraryStats';
import ExportMenu from './ExportMenu';

interface LibraryContentProps {
    isDrawer?: boolean;
}

type ViewMode = 'grid' | 'list' | 'bookmarks';
type CategoryFilter = 'All' | string;
type DifficultyFilter = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';

const LibraryContent = ({ isDrawer = false }: LibraryContentProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTopic, setSelectedTopic] = useState<LibraryTopic | null>(null);
    const [mounted, setMounted] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
    const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('All');
    const [showQuizMode, setShowQuizMode] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    // Custom Terms States
    const [customTerms, setCustomTerms] = useState<{ id: string; topicId: string; term: string; definition: string; example?: string }[]>([]);
    const [showAddCustomModal, setShowAddCustomModal] = useState(false);
    const [newTermName, setNewTermName] = useState("");
    const [newTermDefinition, setNewTermDefinition] = useState("");
    const [newTermExample, setNewTermExample] = useState("");
    const [newTermTopicId, setNewTermTopicId] = useState("corporate-finance");

    const {
        bookmarkedTerms,
        studiedTerms,
        masteredTerms,
        toggleBookmark,
        markAsStudied,
        markAsMastered,
        getProgress,
    } = useLibraryProgress();

    // Keyboard Shortcuts
    useKeyboardShortcuts({
        onSearchFocus: () => searchInputRef.current?.focus(),
        onToggleBookmarks: () => setViewMode(v => v === 'bookmarks' ? 'grid' : 'bookmarks'),
        onStartQuiz: () => setShowQuizMode(true),
    });

    const searchParams = useSearchParams();

    // Initial Load & Load Custom Terms
    React.useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const savedCustom = localStorage.getItem('library-custom-terms');
            if (savedCustom) {
                try {
                    setCustomTerms(JSON.parse(savedCustom));
                } catch (e) {
                    console.error("Error parsing custom terms", e);
                }
            }
        }
    }, []);

    // Deep Linking Effect
    React.useEffect(() => {
        if (!mounted) return;

        const topicId = searchParams.get('topic');
        const termName = searchParams.get('term');

        if (topicId) {
            const foundTopic = mergedTopics.find(t => t.id === topicId);
            if (foundTopic) {
                setSelectedTopic(foundTopic);

                if (termName) {
                    setTimeout(() => {
                        const element = document.getElementById(`term-${termName.replace(/\s+/g, '-').toLowerCase()}`);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element.classList.add('ring-2', 'ring-cyan-500', 'bg-cyan-900/40');
                            setTimeout(() => element.classList.remove('ring-2', 'ring-cyan-500', 'bg-cyan-900/40'), 3000);
                        }
                    }, 500);
                }
            }
        }
    }, [searchParams, mounted]);

    // Escape key handler
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (selectedTopic) setSelectedTopic(null);
                if (showQuizMode) setShowQuizMode(false);
                if (showStats) setShowStats(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [selectedTopic, showQuizMode, showStats]);

    // Merge custom terms into topics dynamically
    const mergedTopics = useMemo(() => {
        const topicsCopy = LIBRARY_TOPICS.map(topic => ({
            ...topic,
            terms: [...topic.terms]
        }));

        customTerms.forEach(ct => {
            const targetTopic = topicsCopy.find(t => t.id === ct.topicId);
            if (targetTopic) {
                if (!targetTopic.terms.some(t => t.term === ct.term)) {
                    targetTopic.terms.push({
                        term: ct.term,
                        definition: ct.definition,
                        example: ct.example
                    });
                }
            } else if (ct.topicId === 'custom-topic') {
                let customTopicObj = topicsCopy.find(t => t.id === 'custom-topic');
                if (!customTopicObj) {
                    customTopicObj = {
                        id: 'custom-topic',
                        title: 'My Vocabulary',
                        icon: Sparkles,
                        description: 'Your personalized collection of finance and trading terms.',
                        category: 'Custom',
                        difficulty: 'Beginner',
                        tags: ['Custom', 'Personalized'],
                        relatedTopics: [],
                        terms: []
                    };
                    topicsCopy.push(customTopicObj);
                }
                if (!customTopicObj.terms.some(t => t.term === ct.term)) {
                    customTopicObj.terms.push({
                        term: ct.term,
                        definition: ct.definition,
                        example: ct.example
                    });
                }
            }
        });

        return topicsCopy;
    }, [customTerms]);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(mergedTopics.map(t => t.category));
        return ['All', ...Array.from(cats).sort()];
    }, [mergedTopics]);

    // Filter topics
    const filteredTopics = useMemo(() => {
        let topics = mergedTopics;

        // Category filter
        if (categoryFilter !== 'All') {
            topics = topics.filter(t => t.category === categoryFilter);
        }

        // Difficulty filter
        if (difficultyFilter !== 'All') {
            topics = topics.filter(t => t.difficulty === difficultyFilter);
        }

        // Bookmarks view
        if (viewMode === 'bookmarks') {
            topics = topics.filter(topic =>
                topic.terms.some(term => bookmarkedTerms.has(`${topic.id}-${term.term}`))
            );
        }

        // Search filter
        if (searchQuery) {
            topics = topics.filter(topic =>
                topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                topic.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                topic.terms.some(t =>
                    t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.definition.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }

        return topics;
    }, [categoryFilter, difficultyFilter, viewMode, bookmarkedTerms, searchQuery, mergedTopics]);

    // Calculate total terms
    const totalTerms = useMemo(() => {
        return mergedTopics.reduce((sum, topic) => sum + topic.terms.length, 0);
    }, [mergedTopics]);

    const progress = getProgress(totalTerms);

    // Get category breakdown for stats
    const categoryBreakdown = useMemo(() => {
        const breakdown: { category: string; count: number; studied: number }[] = [];
        const categoryMap = new Map<string, { count: number; studied: number }>();

        mergedTopics.forEach(topic => {
            const existing = categoryMap.get(topic.category) || { count: 0, studied: 0 };
            const topicStudied = topic.terms.filter(term =>
                studiedTerms.has(`${topic.id}-${term.term}`)
            ).length;
            categoryMap.set(topic.category, {
                count: existing.count + topic.terms.length,
                studied: existing.studied + topicStudied,
            });
        });

        categoryMap.forEach((value, key) => {
            breakdown.push({ category: key, count: value.count, studied: value.studied });
        });

        return breakdown.sort((a, b) => b.count - a.count);
    }, [studiedTerms, mergedTopics]);

    const handleStartQuiz = () => {
        setShowQuizMode(true);
    };

    const handleAddCustomTerm = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTermName || !newTermDefinition) return;

        const newTerm = {
            id: `custom-${Date.now()}`,
            topicId: newTermTopicId,
            term: newTermName.trim(),
            definition: newTermDefinition.trim(),
            example: newTermExample.trim() || undefined
        };

        const updated = [...customTerms, newTerm];
        setCustomTerms(updated);
        localStorage.setItem('library-custom-terms', JSON.stringify(updated));

        // Reset fields
        setNewTermName("");
        setNewTermDefinition("");
        setNewTermExample("");
        setShowAddCustomModal(false);
    };

    const handleDeleteCustomTerm = (topicId: string, termName: string) => {
        const updated = customTerms.filter(ct => !(ct.topicId === topicId && ct.term === termName));
        setCustomTerms(updated);
        localStorage.setItem('library-custom-terms', JSON.stringify(updated));

        // Update selected topic terms live if open
        if (selectedTopic && selectedTopic.id === topicId) {
            setSelectedTopic(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    terms: prev.terms.filter(t => t.term !== termName)
                };
            });
        }
    };

    const highlightText = (text: string | undefined, query: string) => {
        if (!text) return null;
        if (!query) return <span>{text}</span>;

        const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <mark key={i} className="bg-cyan-500/35 text-cyan-200 rounded px-0.5 font-semibold">
                            {part}
                        </mark>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    const difficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'text-green-400';
            case 'Intermediate': return 'text-yellow-400';
            case 'Advanced': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="space-y-8">
            {!isDrawer && (
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl rounded-full -z-10" />
                    <div className="flex flex-col gap-6 mb-10">
                        {/* Header */}
                        <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-end">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                                    Knowledge Library
                                </h1>
                                <p className="text-slate-400 text-lg max-w-2xl">
                                    Master {totalTerms}+ financial concepts with interactive learning tools
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 flex-wrap">
                                <button
                                    onClick={() => setShowAddCustomModal(true)}
                                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300 rounded-xl hover:shadow-lg hover:shadow-green-500/20 transition-all font-bold"
                                >
                                    <Plus size={20} />
                                    <span>Add Term</span>
                                </button>
                                <ExportMenu topics={filteredTopics} categoryFilter={categoryFilter} />
                                <button
                                    onClick={() => setShowStats(!showStats)}
                                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all font-bold"
                                >
                                    <BarChart2 size={20} />
                                    <span className="hidden sm:inline">Stats</span>
                                </button>
                                <button
                                    onClick={handleStartQuiz}
                                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all font-bold"
                                >
                                    <Brain size={20} />
                                    <span className="hidden sm:inline">Quiz Mode</span>
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        {progress.studied > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-900/50 border border-slate-800 rounded-xl p-4"
                            >
                                <div className="flex justify-between text-sm text-slate-400 mb-2">
                                    <span>Your Progress</span>
                                    <span>{progress.masteredPercentage}% Mastered</span>
                                </div>
                                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full flex">
                                        <motion.div
                                            className="bg-gradient-to-r from-green-500 to-emerald-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress.masteredPercentage}%` }}
                                            transition={{ duration: 1 }}
                                        />
                                        <motion.div
                                            className="bg-gradient-to-r from-cyan-500 to-blue-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress.studiedPercentage - progress.masteredPercentage}%` }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-2 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <Trophy className="text-green-400" size={14} />
                                        <span className="text-slate-400">{progress.mastered} Mastered</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Sparkles className="text-cyan-400" size={14} />
                                        <span className="text-slate-400">{progress.studied} Studied</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Search and Filters */}
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Bar */}
                            <div className="relative flex-1 group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
                                <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-800 p-1">
                                    <Search className="ml-3 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search 150+ terms... (Ctrl+K)"
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

                            {/* View Mode Toggle */}
                            <div className="flex gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 justify-end">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
                                    title="Grid View"
                                >
                                    <Grid size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
                                    title="List View"
                                >
                                    <List size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('bookmarks')}
                                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'bookmarks' ? 'bg-yellow-500 text-white' : 'text-slate-400 hover:text-white'}`}
                                    title="Bookmarks"
                                >
                                    <Star size={20} fill={viewMode === 'bookmarks' ? 'currentColor' : 'none'} />
                                </button>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-2.5 rounded-lg transition-all ${showFilters ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
                                    title="Filters"
                                >
                                    <Filter size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Category & Difficulty Filters */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-slate-950/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 space-y-4 overflow-hidden"
                                >
                                    <div className="space-y-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Categories</span>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setCategoryFilter(cat)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${categoryFilter === cat
                                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                                                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Difficulty Level</span>
                                        <div className="flex flex-wrap gap-2">
                                            {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map(diff => (
                                                <button
                                                    key={diff}
                                                    onClick={() => setDifficultyFilter(diff)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${difficultyFilter === diff
                                                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                                                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                                                        }`}
                                                >
                                                    {diff}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Stats Panel */}
            <AnimatePresence>
                {showStats && !isDrawer && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <LibraryStats
                            totalTerms={totalTerms}
                            studiedTerms={progress.studied}
                            masteredTerms={progress.mastered}
                            bookmarkedTerms={bookmarkedTerms.size}
                            categoryBreakdown={categoryBreakdown}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Topics Grid */}
            <div className={`grid gap-5 ${viewMode === 'list' ? 'grid-cols-1' : isDrawer ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {filteredTopics.map((topic) => {
                    const Icon = topic.icon;
                    const bookmarkedCount = topic.terms.filter(term => bookmarkedTerms.has(`${topic.id}-${term.term}`)).length;
                    const studiedCount = topic.terms.filter(term => studiedTerms.has(`${topic.id}-${term.term}`)).length;
                    const studyProgress = Math.round((studiedCount / topic.terms.length) * 100);

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
                                    <div className="flex flex-col gap-2 items-end">
                                        <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-400 group-hover:text-cyan-300 group-hover:border-cyan-500/20 transition-colors">
                                            {topic.terms.length} Terms
                                        </div>
                                        {bookmarkedCount > 0 && (
                                            <div className="flex items-center gap-1 text-xs text-yellow-400">
                                                <Star size={12} fill="currentColor" />
                                                <span>{bookmarkedCount}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-xl font-bold text-slate-200 group-hover:text-white transition-colors">{topic.title}</h3>
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">{topic.category}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${difficultyColor(topic.difficulty)}`}>{topic.difficulty}</span>
                                </div>

                                <p className="text-sm text-slate-500 group-hover:text-slate-400 line-clamp-2 leading-relaxed transition-colors mb-4">
                                    {topic.description}
                                </p>

                                {studiedCount > 0 && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                                            <span>Progress</span>
                                            <span>{studyProgress}%</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                                                style={{ width: `${studyProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center text-xs font-bold text-cyan-500/70 group-hover:text-cyan-400 uppercase tracking-wider transition-colors">
                                    Expand Topic <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {filteredTopics.length === 0 && (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-bold text-slate-300 mb-2">No topics found</h3>
                    <p className="text-slate-500">Try adjusting your filters or search query</p>
                </div>
            )}

            {/* Topic Detail Modal */}
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
                                layoutId={`card-${selectedTopic.id}`}
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
                                                <span>•</span>
                                                <span className={difficultyColor(selectedTopic.difficulty)}>{selectedTopic.difficulty}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedTopic(null)}
                                        className="p-2.5 hover:bg-rose-500/10 rounded-xl text-slate-500 hover:text-rose-400 transition-all active:scale-95"
                                    >
                                        <X size={22} />
                                    </button>
                                </div>

                                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 relative z-10">
                                    <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 mb-8 text-slate-300 leading-relaxed text-lg">
                                        {selectedTopic.description}
                                    </div>

                                    {selectedTopic.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {selectedTopic.tags.map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-cyan-400">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2 ml-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                        Dictionary Terms
                                    </h3>

                                    <div className="space-y-4">
                                        {selectedTopic.terms.map((term, idx) => {
                                            const termId = `${selectedTopic.id}-${term.term}`;
                                            const isBookmarked = bookmarkedTerms.has(termId);
                                            const isStudied = studiedTerms.has(termId);
                                            const isMastered = masteredTerms.has(termId);

                                            return (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    key={idx}
                                                    id={`term-${term.term.replace(/\s+/g, '-').toLowerCase()}`}
                                                    className="group bg-slate-900/20 border border-slate-800/50 hover:border-cyan-500/30 rounded-xl p-5 hover:bg-slate-800/40 transition-all duration-300"
                                                >
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <h4 className="text-lg font-bold text-cyan-100 group-hover:text-cyan-400 transition-colors flex-1">
                                                            {highlightText(term.term, searchQuery)}
                                                        </h4>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleBookmark(termId);
                                                                }}
                                                                className={`p-1.5 rounded-lg transition-all hover:scale-110 ${isBookmarked ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-400'
                                                                    }`}
                                                                title="Bookmark"
                                                            >
                                                                <Star size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                                                            </button>
                                                            {customTerms.some(ct => ct.topicId === selectedTopic.id && ct.term === term.term) && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (confirm(`Are you sure you want to delete the custom term "${term.term}"?`)) {
                                                                            handleDeleteCustomTerm(selectedTopic.id, term.term);
                                                                        }
                                                                    }}
                                                                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:scale-110 transition-all"
                                                                    title="Delete Custom Term"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-300 leading-relaxed text-base font-light">
                                                        {highlightText(term.definition, searchQuery)}
                                                    </p>
                                                    {term.example && (
                                                        <div className="mt-4 p-4 bg-gradient-to-r from-cyan-950/20 to-transparent rounded-lg border-l-2 border-cyan-500/50">
                                                            <span className="text-xs font-bold text-cyan-500 uppercase tracking-wide block mb-1">Example</span>
                                                            <span className="text-sm text-cyan-100/80 italic font-medium">
                                                                &quot;{highlightText(term.example, searchQuery)}&quot;
                                                            </span>
                                                        </div>
                                                    )}
                                                    {(isStudied || isMastered) && (
                                                        <div className="mt-3 flex gap-2">
                                                            {isMastered && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400">
                                                                    <Trophy size={12} />
                                                                    Mastered
                                                                </span>
                                                            )}
                                                            {isStudied && !isMastered && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-xs text-cyan-400">
                                                                    <Sparkles size={12} />
                                                                    Studied
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {selectedTopic.relatedTopics && selectedTopic.relatedTopics.length > 0 && (
                                        <div className="mt-8 p-6 bg-slate-900/30 border border-slate-800 rounded-2xl">
                                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Related Topics</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedTopic.relatedTopics.map(relatedId => {
                                                    const related = mergedTopics.find(t => t.id === relatedId);
                                                    if (!related) return null;
                                                    return (
                                                        <button
                                                            key={relatedId}
                                                            onClick={() => setSelectedTopic(related)}
                                                            className="px-4 py-2 bg-slate-800/50 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-500/30 rounded-lg text-sm text-slate-300 hover:text-cyan-400 transition-all"
                                                        >
                                                            {related.title}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Add Custom Term Modal */}
            {mounted && showAddCustomModal && createPortal(
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowAddCustomModal(false)}
                        className="absolute inset-0 bg-black/75 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative w-full max-w-lg bg-[#0e1117] border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Sparkles className="text-green-400" size={22} />
                                Add Custom Term
                            </h3>
                            <button
                                onClick={() => setShowAddCustomModal(false)}
                                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddCustomTerm} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Topic</label>
                                <select
                                    value={newTermTopicId}
                                    onChange={(e) => setNewTermTopicId(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:border-green-500 focus:ring-0 outline-none"
                                >
                                    {LIBRARY_TOPICS.map(topic => (
                                        <option key={topic.id} value={topic.id}>{topic.title}</option>
                                    ))}
                                    <option value="custom-topic">Personal Collection (New Topic)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Term Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Sharpe Ratio"
                                    value={newTermName}
                                    onChange={(e) => setNewTermName(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:border-green-500 focus:ring-0 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Definition</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Provide a clear explanation of this concept..."
                                    value={newTermDefinition}
                                    onChange={(e) => setNewTermDefinition(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:border-green-500 focus:ring-0 outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Example (Optional)</label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. A Sharpe ratio of 1.5 is considered very good..."
                                    value={newTermExample}
                                    onChange={(e) => setNewTermExample(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:border-green-500 focus:ring-0 outline-none resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddCustomModal(false)}
                                    className="flex-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold py-3 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/20 text-white font-bold py-3 rounded-xl transition-all"
                                >
                                    Add Term
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>,
                document.body
            )}

            {/* Quiz Mode */}
            {showQuizMode && (
                <QuizMode
                    topics={filteredTopics}
                    onClose={() => setShowQuizMode(false)}
                    onMarkStudied={markAsStudied}
                    onMarkMastered={markAsMastered}
                />
            )}
        </div>
    );
};

export default LibraryContent;
