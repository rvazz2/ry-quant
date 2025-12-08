'use client';

import React from 'react';
import GlobalErrorFallback from '@/components/GlobalErrorFallback';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    React.useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-950 p-4">
            <div className="max-w-md w-full">
                <GlobalErrorFallback
                    title="Application Error"
                    message="An unexpected error occurred in the application."
                    resetErrorBoundary={reset}
                />
            </div>
        </div>
    );
}
