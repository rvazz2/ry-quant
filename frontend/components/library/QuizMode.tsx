"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Shuffle, CheckCircle, XCircle, RotateCcw, Award } from 'lucide-react';
import { LibraryTopic } from '@/lib/library-data';

interface QuizModeProps {
    topics: LibraryTopic[];
    onClose: () => void;
    onMarkStudied: (termId: string) => void;
    onMarkMastered: (termId: string) => void;
}

interface FlashCard {
    id: string;
    topicId: string;
    topicTitle: string;
    term: string;
    definition: string;
    example?: string;
}

const QuizMode: React.FC<QuizModeProps> = ({ topics, onClose, onMarkStudied, onMarkMastered }) => {
    const [cards, setCards] = useState<FlashCard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
    const [studyMoreCards, setStudyMoreCards] = useState<Set<string>>(new Set());
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (showResults && cards.length > 0) {
            try {
                const savedHistory = localStorage.getItem('library-quiz-history');
                const history = savedHistory ? JSON.parse(savedHistory) : [];
                
                const newRecord = {
                    id: `quiz-${Date.now()}`,
                    date: Date.now(),
                    totalCards: cards.length,
                    masteredCount: knownCards.size,
                    reviewCount: studyMoreCards.size,
                    score: Math.round((knownCards.size / cards.length) * 100)
                };
                
                history.unshift(newRecord);
                localStorage.setItem('library-quiz-history', JSON.stringify(history.slice(0, 50)));
            } catch (e) {
                console.error("Failed to save quiz history", e);
            }
        }
    }, [showResults, cards.length, knownCards.size, studyMoreCards.size]);

    useEffect(() => {
        // Flatten all terms into flashcards
        const allCards: FlashCard[] = [];
        topics.forEach(topic => {
            topic.terms.forEach(term => {
                allCards.push({
                    id: `${topic.id}-${term.term}`,
                    topicId: topic.id,
                    topicTitle: topic.title,
                    term: term.term,
                    definition: term.definition,
                    example: term.example,
                });
            });
        });
        setCards(allCards);
    }, [topics]);

    const currentCard = cards[currentIndex];

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        if (!isFlipped) {
            onMarkStudied(currentCard.id);
        }
    };

    const handleNext = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        } else {
            setShowResults(true);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
        }
    };

    const handleKnowIt = () => {
        setKnownCards(prev => new Set([...prev, currentCard.id]));
        onMarkMastered(currentCard.id);
        handleNext();
    };

    const handleStudyMore = () => {
        setStudyMoreCards(prev => new Set([...prev, currentCard.id]));
        handleNext();
    };

    const handleShuffle = () => {
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setKnownCards(new Set());
        setStudyMoreCards(new Set());
        setShowResults(false);
    };

    if (cards.length === 0) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center">
                <div className="text-slate-400">Loading flashcards...</div>
            </div>
        );
    }

    if (showResults) {
        const masteryPercentage = Math.round((knownCards.size / cards.length) * 100);
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl w-full"
                >
                    <div className="text-center space-y-6">
                        <div className="inline-flex p-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full">
                            <Award className="text-cyan-400" size={48} />
                        </div>
                        <h2 className="text-3xl font-bold text-white">Quiz Complete!</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-800/50 rounded-xl p-4">
                                <div className="text-3xl font-bold text-cyan-400">{knownCards.size}</div>
                                <div className="text-sm text-slate-400">Mastered</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4">
                                <div className="text-3xl font-bold text-orange-400">{studyMoreCards.size}</div>
                                <div className="text-sm text-slate-400">Review</div>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4">
                                <div className="text-3xl font-bold text-purple-400">{masteryPercentage}%</div>
                                <div className="text-sm text-slate-400">Score</div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={handleRestart}
                                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                            >
                                <RotateCcw className="inline mr-2" size={20} />
                                Restart Quiz
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 bg-slate-800 text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-700 transition-all"
                            >
                                Exit
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="absolute top-6 right-6 flex items-center gap-4">
                <button
                    onClick={handleShuffle}
                    className="p-2 bg-slate-800 text-slate-400 hover:text-cyan-400 rounded-xl transition-colors"
                    title="Shuffle"
                >
                    <Shuffle size={20} />
                </button>
                <button
                    onClick={onClose}
                    className="p-2 bg-slate-800 text-slate-400 hover:text-rose-400 rounded-xl transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="max-w-4xl w-full space-y-6">
                {/* Progress Bar */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                        <span>Progress</span>
                        <span>{currentIndex + 1} / {cards.length}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Flashcard */}
                <div className="relative h-[400px] perspective-1000">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ rotateY: 90, opacity: 0 }}
                            animate={{ rotateY: isFlipped ? 180 : 0, opacity: 1 }}
                            exit={{ rotateY: -90, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            onClick={handleFlip}
                            className="absolute inset-0 cursor-pointer preserve-3d"
                        >
                            <div className={`absolute inset-0 backface-hidden ${isFlipped ? 'invisible' : 'visible'}`}>
                                <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-500/50 rounded-3xl p-12 flex flex-col items-center justify-center shadow-2xl shadow-cyan-500/20">
                                    <div className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-4">{currentCard.topicTitle}</div>
                                    <h3 className="text-5xl font-bold text-white text-center mb-8">{currentCard.term}</h3>
                                    <div className="text-sm text-slate-500">Click to reveal definition</div>
                                </div>
                            </div>
                            <div className={`absolute inset-0 backface-hidden rotate-y-180 ${isFlipped ? 'visible' : 'invisible'}`}>
                                <div className="h-full bg-gradient-to-br from-purple-900 to-slate-900 border-2 border-purple-500/50 rounded-3xl p-12 flex flex-col justify-center shadow-2xl shadow-purple-500/20">
                                    <p className="text-xl text-slate-200 leading-relaxed mb-6">{currentCard.definition}</p>
                                    {currentCard.example && (
                                        <div className="bg-slate-800/50 rounded-xl p-4 border-l-4 border-cyan-500">
                                            <div className="text-xs font-bold text-cyan-400 uppercase mb-2">Example</div>
                                            <p className="text-sm text-slate-300 italic">&quot;{currentCard.example}&quot;</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    {isFlipped && (
                        <div className="flex gap-4">
                            <button
                                onClick={handleStudyMore}
                                className="flex items-center gap-2 px-6 py-3 bg-orange-500/20 border border-orange-500/50 text-orange-400 rounded-xl hover:bg-orange-500/30 transition-all font-bold"
                            >
                                <XCircle size={20} />
                                Study More
                            </button>
                            <button
                                onClick={handleKnowIt}
                                className="flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded-xl hover:bg-green-500/30 transition-all font-bold"
                            >
                                <CheckCircle size={20} />
                                Know It!
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleNext}
                        disabled={currentIndex === cards.length - 1 && !isFlipped}
                        className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizMode;
