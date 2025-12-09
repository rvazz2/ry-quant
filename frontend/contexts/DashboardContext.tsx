"use client";

import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMarketOverview } from '@/lib/api';
import { MarketOverviewItem } from '@/lib/types';

interface DashboardContextType {
    overview: MarketOverviewItem[];
    loading: boolean;
    overviewLoading: boolean;
    refreshData: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType>({
    overview: [],
    loading: true,
    overviewLoading: true,
    refreshData: async () => { },
});

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const { data: overview = [], isLoading: overviewLoading, refetch: refetchOverview } = useQuery({
        queryKey: ['marketOverview'],
        queryFn: getMarketOverview,
        refetchInterval: 60000,
        staleTime: 30000,
    });

    const refreshData = React.useCallback(async () => {
        await refetchOverview();
    }, [refetchOverview]);

    const contextValue = React.useMemo(() => ({
        overview,
        loading: overviewLoading,
        overviewLoading,
        refreshData
    }), [overview, overviewLoading, refreshData]);

    return (
        <DashboardContext.Provider value={contextValue}>
            {children}
        </DashboardContext.Provider>
    );
};
