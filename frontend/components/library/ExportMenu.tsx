"use client";

import React, { useState } from 'react';
import { Download, FileText, Printer, Share2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LibraryTopic } from '@/lib/library-data';

interface ExportMenuProps {
    topics: LibraryTopic[];
    categoryFilter: string;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ topics, categoryFilter }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleExportJSON = () => {
        const dataStr = JSON.stringify(topics, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `library-export-${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        setIsOpen(false);
    };

    const handlePrint = () => {
        window.print();
        setIsOpen(false);
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-slate-400 hover:text-cyan-400 transition-all"
            >
                <Download size={18} />
                <span className="hidden sm:inline">Export</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-30"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-40 overflow-hidden"
                        >
                            <div className="p-1">
                                <button
                                    onClick={handleExportJSON}
                                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <FileText size={16} className="text-cyan-400" />
                                    Export JSON
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <Printer size={16} className="text-purple-400" />
                                    Print View
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    {copied ? (
                                        <Check size={16} className="text-green-400" />
                                    ) : (
                                        <Share2 size={16} className="text-blue-400" />
                                    )}
                                    {copied ? 'Copied!' : 'Share Link'}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExportMenu;
