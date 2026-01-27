"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface CopilotContextType {
    isOpen: boolean;
    toggleOpen: () => void;
    messages: Message[];
    addMessage: (role: 'user' | 'assistant', content: string) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    currentContext: any;
    setContext: (context: any) => void;
}

const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

export function CopilotProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(() => [
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm The Wise Luc 🪙. I see what you verify. Ask me anything about the markets or this page!",
            timestamp: Date.now()
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentContext, setCurrentContext] = useState<any>({});
    const pathname = usePathname();

    const setContext = (context: any) => {
        setCurrentContext((prev: any) => ({ ...prev, ...context }));
    };

    // Auto-update context based on route (basic implementation)
    useEffect(() => {
        setContext({ ...currentContext, path: pathname });
    }, [pathname]);

    const toggleOpen = () => setIsOpen(prev => !prev);

    const addMessage = (role: 'user' | 'assistant', content: string) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role,
            content,
            timestamp: Date.now()
        }]);
    };


    return (
        <CopilotContext.Provider value={{
            isOpen,
            toggleOpen,
            messages,
            addMessage,
            isLoading,
            setIsLoading,
            currentContext,
            setContext
        }}>
            {children}
        </CopilotContext.Provider>
    );
}

export function useCopilot() {
    const context = useContext(CopilotContext);
    if (context === undefined) {
        throw new Error('useCopilot must be used within a CopilotProvider');
    }
    return context;
}
