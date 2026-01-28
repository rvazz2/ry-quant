"use client";

import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function NewsletterSignup() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        // Simulate API call (replace with actual newsletter API)
        setTimeout(() => {
            if (email.includes('@')) {
                setStatus('success');
                setMessage('Welcome aboard! Check your inbox for confirmation.');
                setEmail('');
            } else {
                setStatus('error');
                setMessage('Please enter a valid email address.');
            }

            // Reset status after 5 seconds
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 5000);
        }, 1000);
    };

    return (
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-3xl p-8 md:p-12 border border-cyan-500/20 relative overflow-hidden mb-24">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                    <Mail className="text-cyan-400" size={32} />
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Stay Sharp. Stay Ahead.
                </h2>
                <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
                    Join 5,000+ students getting weekly market insights, trading tips, and financial wisdom delivered to your inbox.
                </p>

                <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@university.edu"
                            className="flex-1 px-6 py-4 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                            disabled={status === 'loading' || status === 'success'}
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.8)] flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            {status === 'loading' ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                    Subscribing...
                                </>
                            ) : status === 'success' ? (
                                <>
                                    <CheckCircle size={20} />
                                    Subscribed!
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Subscribe
                                </>
                            )}
                        </button>
                    </div>

                    {message && (
                        <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${status === 'success'
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                            }`}>
                            {status === 'success' ? (
                                <CheckCircle size={20} className="shrink-0" />
                            ) : (
                                <AlertCircle size={20} className="shrink-0" />
                            )}
                            <p className="text-sm font-medium">{message}</p>
                        </div>
                    )}
                </form>

                <p className="text-xs text-slate-500 mt-6">
                    No spam. Unsubscribe anytime. Your data is safe with us.
                </p>
            </div>
        </div>
    );
}
