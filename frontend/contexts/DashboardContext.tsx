"use client";

import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMarketOverview, getSectorPerformance } from '@/lib/api';
import { MarketOverviewItem, SectorPerformanceItem } from '@/lib/types';

interface DashboardContextType {
    overview: MarketOverviewItem[];
    sectors: SectorPerformanceItem[];
    loading: boolean;
    overviewLoading: boolean;
    sectorsLoading: boolean;
    sectorsError: any;
    isSectorsError: boolean;
    refreshData: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType>({
    overview: [],
    sectors: [],
    loading: true,
    overviewLoading: true,
    sectorsLoading: true,
    sectorsError: null,
    isSectorsError: false,
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

    const { data: sectors = [], isLoading: sectorsLoading, error: sectorsError, isError: isSectorsError, refetch: refetchSectors } = useQuery({
        queryKey: ['sectorPerformance'],
        queryFn: getSectorPerformance,
        refetchInterval: 60000,
        staleTime: 30000,
    });

    const refreshData = React.useCallback(async () => {
        await Promise.all([refetchOverview(), refetchSectors()]);
    }, [refetchOverview, refetchSectors]);

    const contextValue = React.useMemo(() => ({
        overview,
        sectors,
        loading: overviewLoading || sectorsLoading,
        overviewLoading,
        sectorsLoading,
        sectorsError,
        isSectorsError,
        refreshData
    }), [overview, sectors, overviewLoading, sectorsLoading, sectorsError, isSectorsError, refreshData]);

    return (
        <DashboardContext.Provider value={contextValue}>
            {children}
        </DashboardContext.Provider>
    );
};
