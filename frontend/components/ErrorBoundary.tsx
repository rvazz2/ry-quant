"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
    name?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10 dark:border-red-800">
                    <h2 className="text-lg font-semibold text-red-800 dark:text-red-400">
                        Something went wrong
                    </h2>
                    {this.props.name && (
                        <p className="text-sm text-red-600 dark:text-red-300 mb-2">in {this.props.name}</p>
                    )}
                    <details className="mt-2 text-xs text-red-500 whitespace-pre-wrap">
                        <summary className="cursor-pointer font-medium hover:text-red-700">Error Details</summary>
                        {this.state.error?.toString()}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
