"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";

interface Settings {
    // Risk & Execution
    maxOrderValue: number;
    defaultQuantity: number;
    oneClickTrading: boolean;
    maxDailyLoss: number;
    stopLossDefault: number;
    takeProfitDefault: number;
    maxSlippage: number;
    confirmLargeOrders: number;
    positionSizingMethod: "fixed" | "percentage" | "kelly";

    // Data & Regional
    baseCurrency: string;
    timezone: "local" | "exchange";
    dataMode: "realtime" | "saver";
    numberFormat: "US" | "EU";
    dateFormat: "US" | "EU" | "ISO";
    marketDataSource: "primary" | "backup" | "aggregated";

    // Visual
    density: "comfortable" | "compact";
    theme: "standard" | "colorblind" | "hollow";
    rowHeight: "small" | "medium" | "large";
    fontSize: number;

    // System & Updates
    autoUpdate: boolean;
    betaFeatures: boolean;
    errorReporting: boolean;
    cacheSize: "small" | "medium" | "large";

    // Alerts & Notifications
    marginAlertThreshold: number;
    emailAlerts: boolean;
    pushNotifications: boolean;
    tradeConfirmations: boolean;
    riskAlerts: boolean;
    aiBriefingTime: string;

    // Security
    twoFactorEnabled: boolean;
    sessionTimeout: number; // in minutes
    biometricLogin: boolean;
}

interface SettingsContextType {
    settings: Settings;
    updateSetting: (key: keyof Settings, value: string | number | boolean) => void;
    resetSettings: () => void;
    updateAvailable: boolean;
    setUpdateAvailable: (available: boolean) => void;
    triggerUpdate: () => void;
    registerUpdateHandler: (handler: () => void) => void;
    hasError: boolean;
    // New UI States
    isLibraryOpen: boolean;
    setLibraryOpen: (open: boolean) => void;
}

const defaultSettings: Settings = {
    // Risk & Execution
    maxOrderValue: 50000,
    defaultQuantity: 100,
    oneClickTrading: false,
    maxDailyLoss: 10000,
    stopLossDefault: 2.0,
    takeProfitDefault: 5.0,
    maxSlippage: 0.5,
    confirmLargeOrders: 25000,
    positionSizingMethod: "fixed",

    // Data & Regional
    baseCurrency: "USD",
    timezone: "exchange",
    dataMode: "realtime",
    numberFormat: "US",
    dateFormat: "US",
    marketDataSource: "primary",

    // Visual
    density: "compact",
    theme: "standard",
    rowHeight: "medium",
    fontSize: 14,

    // System & Updates
    autoUpdate: true,
    betaFeatures: false,
    errorReporting: true,
    cacheSize: "medium",

    // Alerts & Notifications
    marginAlertThreshold: 80,
    emailAlerts: true,
    pushNotifications: false,
    tradeConfirmations: true,
    riskAlerts: true,
    aiBriefingTime: "08:00",

    // Security
    twoFactorEnabled: false,
    sessionTimeout: 30,
    biometricLogin: false
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [initialized, setInitialized] = useState(false);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [updateHandler, setUpdateHandler] = useState<(() => void) | null>(null);
    const [isLibraryOpen, setLibraryOpen] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Load settings from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('userSettings');
        if (saved) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSettings({ ...defaultSettings, ...JSON.parse(saved) });
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
        setInitialized(true);
    }, []);

    // Debounced save to localStorage - only after 500ms of inactivity
    useEffect(() => {
        if (!initialized) return;

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout to save after 500ms
        saveTimeoutRef.current = setTimeout(() => {
            try {
                localStorage.setItem('userSettings', JSON.stringify(settings));
                setHasError(false);
            } catch (error) {
                // Handle quota exceeded or other localStorage errors
                if (error instanceof Error && error.name === 'QuotaExceededError') {
                    console.error('localStorage quota exceeded. Settings may not be saved.');
                } else {
                    console.error('Failed to save settings:', error);
                }
                setHasError(true);
            }
        }, 500);

        // Cleanup timeout on unmount
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [settings, initialized]);

    const updateSetting = useCallback((key: keyof Settings, value: string | number | boolean) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(defaultSettings);
    }, []);

    const registerUpdateHandler = useCallback((handler: () => void) => {
        setUpdateHandler(() => handler);
    }, []);


    // Actually, to fully solve the loop, registerUpdateHandler MUST be stable.
    // triggerUpdate changing is fine as long as consumers don't loop on it.

    // Better implementation for triggerUpdate to access latest state without changing identity?
    // Use a Ref for the handler?
    // Let's stick to standard state for now but use callback.

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        settings,
        updateSetting,
        resetSettings,
        updateAvailable,
        setUpdateAvailable,
        triggerUpdate: () => {
            if (updateHandler) updateHandler();
        },
        registerUpdateHandler,
        hasError,
        isLibraryOpen,
        setLibraryOpen
    }), [settings, updateSetting, resetSettings, updateAvailable, registerUpdateHandler, updateHandler, hasError, isLibraryOpen]);

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
};
