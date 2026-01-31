"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type DeckStyle = 'classic' | 'luxury' | 'jungle';

interface CasinoSettingsContextType {
    deckStyle: DeckStyle;
    setDeckStyle: (style: DeckStyle) => void;
}

const CasinoSettingsContext = createContext<CasinoSettingsContextType | undefined>(undefined);

export const CasinoSettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [deckStyle, setDeckStyle] = useState<DeckStyle>('classic');

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('ryans-casino-settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.deckStyle) {
                    setDeckStyle(parsed.deckStyle);
                }
            } catch (e) {
                console.error("Failed to load casino settings", e);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        const settings = {
            deckStyle
        };
        localStorage.setItem('ryans-casino-settings', JSON.stringify(settings));
    }, [deckStyle]);

    return (
        <CasinoSettingsContext.Provider value={{ deckStyle, setDeckStyle }}>
            {children}
        </CasinoSettingsContext.Provider>
    );
};

export const useCasinoSettings = () => {
    const context = useContext(CasinoSettingsContext);
    if (!context) {
        throw new Error('useCasinoSettings must be used within a CasinoSettingsProvider');
    }
    return context;
};
