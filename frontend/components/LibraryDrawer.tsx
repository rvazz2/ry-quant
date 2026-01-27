"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import LibraryContent from '@/components/library/LibraryContent';

export const LibraryDrawer = () => {
    const { isLibraryOpen, setLibraryOpen } = useSettings();

    // Close on escape
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isLibraryOpen) {
                setLibraryOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isLibraryOpen, setLibraryOpen]);

    return (
        <AnimatePresence>
            {isLibraryOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLibraryOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 bottom-0 w-full md:w-[85vw] lg:w-[90vw] bg-[#0d1117] border-l border-slate-800 shadow-2xl z-[95] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
                            <div>
                                <h2 className="text-lg font-bold text-slate-100">Knowledge Library</h2>
                                <p className="text-xs text-slate-400">Master financial terminology</p>
                            </div>
                            <button
                                onClick={() => setLibraryOpen(false)}
                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50">
                            <LibraryContent isDrawer={true} />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
