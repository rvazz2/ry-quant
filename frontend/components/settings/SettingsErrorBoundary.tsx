"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary for Settings Page
 * Catches errors and displays a graceful fallback UI
 */
export default class SettingsErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error for debugging
        console.error('Settings Error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        // Attempt to reset settings to defaults
        try {
            localStorage.removeItem('userSettings');
            window.location.reload();
        } catch (e) {
            console.error('Failed to reset settings:', e);
        }
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-screen bg-black flex items-center justify-center p-4">
                    <div className="max-w-md w-full">
                        <div className="p-0.5 bg-gradient-to-r from-red-500/20 via-amber-500/20 to-orange-500/20 rounded-xl">
                            <div className="p-8 bg-slate-950 rounded-[10px]">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-red-500/10 rounded-lg">
                                        <AlertTriangle className="text-red-400" size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Settings Error</h2>
                                        <p className="text-sm text-slate-400">Something went wrong</p>
                                    </div>
                                </div>

                                <div className="mb-6 p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                                    <p className="text-sm text-slate-300 mb-2">
                                        The settings panel encountered an unexpected error and couldn't load properly.
                                    </p>
                                    {this.state.error && (
                                        <details className="mt-3">
                                            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
                                                Technical Details
                                            </summary>
                                            <pre className="mt-2 text-xs text-red-400 font-mono overflow-x-auto">
                                                {this.state.error.message}
                                            </pre>
                                        </details>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={this.handleReset}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
                                    >
                                        <RefreshCw size={18} />
                                        Reset Settings & Reload
                                    </button>

                                    <a
                                        href="/"
                                        className="block w-full text-center px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors"
                                    >
                                        Return to Dashboard
                                    </a>
                                </div>

                                <p className="mt-4 text-xs text-center text-slate-500">
                                    Your settings data will be reset to defaults
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
