"use client";

import React, { useState } from 'react';
import { X, Send, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';


const QUESTIONS = [
    {
        id: 'q1_answer',
        text: "How intuitive is the navigation?",
        options: ["Very Intuitive", "Somewhat Intuitive", "Neutral", "Confusing", "Very Confusing"]
    },
    {
        id: 'q2_answer',
        text: "How would you rate the visual design?",
        options: ["Premium / Excellent", "Good", "Average", "Needs Improvement", "Poor"]
    },
    {
        id: 'q3_answer',
        text: "Is the data loading speed acceptable?",
        options: ["Very Fast", "Fast", "Acceptable", "Slow", "Very Slow"]
    },
    {
        id: 'q4_answer',
        text: "Which feature do you use the most?",
        options: ["Market Overview", "Behavioral Finance", "Planning Tools", "Macro Globe", "Other"]
    }
];

export default function FeedbackModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleInputChange = (id: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        // Simple validation
        if (Object.keys(formData).length < 4) { // Assuming 4 required choice questions
            // In a real app, stronger validation needed.
        }

        try {
            const response = await api.post('/feedback/submit', {
                q1_answer: formData.q1_answer || "Skipped",
                q2_answer: formData.q2_answer || "Skipped",
                q3_answer: formData.q3_answer || "Skipped",
                q4_answer: formData.q4_answer || "Skipped",
                open_feedback: formData.open_feedback || "",
                // email: "user@example.com" // Optional: Capture if logged in
            });

            setSubmitStatus('success');
            setTimeout(() => {
                setIsOpen(false);
                setSubmitStatus('idle');
                setFormData({});
            }, 2000);
        } catch (error) {
            console.error(error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Trigger Button - Fixed Floating */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-[9999] group inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-all border border-white/10 hover:border-cyan-500/50 shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]"
            >
                <div className="relative">
                    <MessageSquare size={20} className="group-hover:text-cyan-400 transition-colors" />
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                    </span>
                </div>
                <span className="font-bold tracking-wide">Mission Debrief</span>
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/50">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <MessageSquare className="text-cyan-400" size={20} />
                                        Mission Debrief
                                    </h2>
                                    <p className="text-slate-400 text-sm">Help us improve the system for all agents.</p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {submitStatus === 'success' ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                                            <CheckCircle size={32} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Feedback Received</h3>
                                        <p className="text-slate-400">Thank you for your contribution, Agent.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        {/* Performance Tip */}
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
                                            <div className="text-blue-400 shrink-0 mt-0.5">
                                                <AlertCircle size={18} />
                                            </div>
                                            <div className="text-sm">
                                                <p className="text-white font-medium mb-1">Experiencing lag or issues?</p>
                                                <p className="text-slate-300">
                                                    Try a hard refresh to clear the cache: <br />
                                                    <span className="text-blue-200 font-mono">Ctrl + Shift + R</span> (Windows) or <span className="text-blue-200 font-mono">Cmd + Shift + R</span> (Mac)
                                                </p>
                                            </div>
                                        </div>

                                        {/* Multiple Choice Questions */}
                                        {QUESTIONS.map((q) => (
                                            <div key={q.id} className="space-y-3">
                                                <label className="block text-sm font-medium text-slate-300">
                                                    {q.text}
                                                </label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {q.options.map((option) => (
                                                        <button
                                                            key={option}
                                                            type="button"
                                                            onClick={() => handleInputChange(q.id, option)}
                                                            className={`px-4 py-3 rounded-lg text-sm text-left transition-all border ${formData[q.id] === option
                                                                ? 'bg-cyan-500/20 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                                                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                                                                }`}
                                                        >
                                                            {option}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Open Text Feedback */}
                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-slate-300">
                                                What features would you like to see next?
                                            </label>
                                            <textarea
                                                value={formData.open_feedback || ''}
                                                onChange={(e) => handleInputChange('open_feedback', e.target.value)}
                                                placeholder="Describe your requested feature or improvement..."
                                                className="w-full h-32 bg-slate-950 border border-white/10 rounded-xl p-4 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                                            />
                                        </div>

                                        {/* Error Message */}
                                        {submitStatus === 'error' && (
                                            <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 p-4 rounded-lg border border-rose-500/20">
                                                <AlertCircle size={18} />
                                                <span className="text-sm">Failed to submit feedback. Please try again.</span>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/5">
                                            <button
                                                type="button"
                                                onClick={() => setIsOpen(false)}
                                                className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="inline-flex items-center gap-2 px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? 'Transmitting...' : (
                                                    <>
                                                        Submit Feedback <Send size={16} />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
