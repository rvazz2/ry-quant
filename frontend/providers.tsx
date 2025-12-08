"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CopilotProvider } from '@/contexts/CopilotContext';
import { useState, ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
                gcTime: 10 * 60 * 1000, // 10 minutes
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <CopilotProvider>
                {children}
            </CopilotProvider>
        </QueryClientProvider>
    );
}
