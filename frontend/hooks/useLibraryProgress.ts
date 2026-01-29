"use client";

import { useState, useEffect } from 'react';

export interface LibraryProgress {
    bookmarkedTerms: Set<string>;
    studiedTerms: Set<string>;
    masteredTerms: Set<string>;
    lastStudied: Record<string, number>;
}

export const useLibraryProgress = () => {
    const [bookmarkedTerms, setBookmarkedTerms] = useState<Set<string>>(new Set());
    const [studiedTerms, setStudiedTerms] = useState<Set<string>>(new Set());
    const [masteredTerms, setMasteredTerms] = useState<Set<string>>(new Set());
    const [lastStudied, setLastStudied] = useState<Record<string, number>>({});

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedBookmarks = localStorage.getItem('library-bookmarks');
            const savedStudied = localStorage.getItem('library-studied');
            const savedMastered = localStorage.getItem('library-mastered');
            const savedLastStudied = localStorage.getItem('library-last-studied');

            if (savedBookmarks) setBookmarkedTerms(new Set(JSON.parse(savedBookmarks)));
            if (savedStudied) setStudiedTerms(new Set(JSON.parse(savedStudied)));
            if (savedMastered) setMasteredTerms(new Set(JSON.parse(savedMastered)));
            if (savedLastStudied) setLastStudied(JSON.parse(savedLastStudied));
        }
    }, []);

    const toggleBookmark = (termId: string) => {
        setBookmarkedTerms(prev => {
            const newSet = new Set(prev);
            if (newSet.has(termId)) {
                newSet.delete(termId);
            } else {
                newSet.add(termId);
            }
            localStorage.setItem('library-bookmarks', JSON.stringify([...newSet]));
            return newSet;
        });
    };

    const markAsStudied = (termId: string) => {
        setStudiedTerms(prev => {
            const newSet = new Set(prev);
            newSet.add(termId);
            localStorage.setItem('library-studied', JSON.stringify([...newSet]));
            return newSet;
        });

        setLastStudied(prev => {
            const updated = { ...prev, [termId]: Date.now() };
            localStorage.setItem('library-last-studied', JSON.stringify(updated));
            return updated;
        });
    };

    const markAsMastered = (termId: string) => {
        setMasteredTerms(prev => {
            const newSet = new Set(prev);
            newSet.add(termId);
            localStorage.setItem('library-mastered', JSON.stringify([...newSet]));
            return newSet;
        });
        markAsStudied(termId);
    };

    const resetProgress = () => {
        setStudiedTerms(new Set());
        setMasteredTerms(new Set());
        setLastStudied({});
        localStorage.removeItem('library-studied');
        localStorage.removeItem('library-mastered');
        localStorage.removeItem('library-last-studied');
    };

    const getProgress = (totalTerms: number) => {
        const studiedCount = studiedTerms.size;
        const masteredCount = masteredTerms.size;
        return {
            studied: studiedCount,
            mastered: masteredCount,
            total: totalTerms,
            studiedPercentage: totalTerms ? Math.round((studiedCount / totalTerms) * 100) : 0,
            masteredPercentage: totalTerms ? Math.round((masteredCount / totalTerms) * 100) : 0,
        };
    };

    return {
        bookmarkedTerms,
        studiedTerms,
        masteredTerms,
        lastStudied,
        toggleBookmark,
        markAsStudied,
        markAsMastered,
        resetProgress,
        getProgress,
    };
};
