import axios from 'axios';

const getApiUrl = () => {
    // Check environment variable
    let url = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

    // Ensure it doesn't end with a slash for consistency
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }

    // If it doesn't end with /api, we should probably warn or append it, 
    // but the previous code actively stripped it which was wrong.
    // For now, we trust the env var or default.
    return url;
};

const API_URL = getApiUrl();

export const api = axios.create({
    baseURL: API_URL,
    timeout: 60000, // 60 seconds timeout (increased for Render cold starts)
});

// Add retry logic
api.interceptors.response.use(undefined, async (err) => {
    const { config, message } = err;
    if (!config || !config.retry) {
        config.retry = 0;
    }

    // Retry up to 3 times for Network Errors, Timeouts, or 5xx errors
    if (config.retry < 3 && (
        message === 'Network Error' ||
        (err.code === 'ECONNABORTED') ||
        (err.response && err.response.status >= 500)
    )) {
        config.retry += 1;
        console.warn(`Retry attempt #${config.retry} for ${config.url} (Reason: ${message || err.code})`);
        const backoff = Math.pow(2, config.retry) * 1000; // Exponential backoff: 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, backoff));
        return api(config);
    }
    return Promise.reject(err);
});

export const checkBackendHealth = async (): Promise<boolean> => {
    try {
        // Health endpoint is at root, not under /api
        const baseUrl = API_URL.replace('/api', '');
        const response = await axios.get(`${baseUrl}/health`, { timeout: 2000 });
        return response.status === 200;
    } catch (e) {
        return false;
    }
};

import {
    MarketOverviewItem,
    EfficientFrontierResult,
    BacktestResult,
    OptionPriceResult,
    CompanyInfo,
    TreasuryRate,
    IndexDetails,
    MacroSummary,
    YieldCurveData,
    SearchResult,
    Financials,
    OptionDate,
    OptionChainItem,
    ChartPoint,
    NewsItem
} from './types';

// Client-side cache to prevent re-fetching on tab switching
// Client-side cache with localStorage persistence
class PersistentCache {
    private memCache = new Map<string, { data: any, timestamp: number }>();
    private ttl: number;
    private storageKeyPrefix = 'ry_cache_';

    constructor(ttlSeconds: number = 60) {
        this.ttl = ttlSeconds * 1000;
    }

    get(key: string) {
        // 1. Try memory first (fastest)
        const memItem = this.memCache.get(key);
        if (memItem) {
            if (Date.now() - memItem.timestamp < this.ttl) {
                return memItem.data;
            } else {
                this.memCache.delete(key);
            }
        }

        // 2. Try localStorage (persistence)
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(this.storageKeyPrefix + key);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Date.now() - parsed.timestamp < this.ttl) {
                        // Hydrate memory cache
                        this.memCache.set(key, parsed);
                        return parsed.data;
                    } else {
                        // Clean up stale
                        localStorage.removeItem(this.storageKeyPrefix + key);
                    }
                }
            } catch (e) {
                console.warn('Cache read error', e);
            }
        }
        return null;
    }

    set(key: string, data: any) {
        const item = { data, timestamp: Date.now() };
        this.memCache.set(key, item);

        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(this.storageKeyPrefix + key, JSON.stringify(item));
            } catch (e) {
                console.warn('Cache write failed (storage full?)', e);
            }
        }
    }
}


const reqCache = new PersistentCache(60); // 1 minute cache (default)
const cacheInstances = new Map<number, PersistentCache>();

const fetchWithCache = async (key: string, fetcher: () => Promise<any>, ttlSeconds: number = 60) => {
    // Get or create cache instance for this TTL
    let cache = cacheInstances.get(ttlSeconds);
    if (!cache) {
        cache = new PersistentCache(ttlSeconds);
        cacheInstances.set(ttlSeconds, cache);
    }

    const cached = cache.get(key);
    if (cached) return cached;
    try {
        const data = await fetcher();
        cache.set(key, data);
        return data;
    } catch (err) {
        throw err;
    }
};

export const getMarketOverview = async (): Promise<MarketOverviewItem[]> => {
    return fetchWithCache('market_overview', async () => {
        const response = await api.get('/market/overview');
        return response.data;
    }, 300); // 5 min cache - market data changes slowly
};



export interface Constraints {
    min_weight?: number;
    max_weight?: number;
    cash_drag?: number;
}
export const getEfficientFrontier = async (
    tickers: string[],
    startDate: string,
    endDate: string,
    constraints?: Constraints,
    views?: { [key: string]: number }
): Promise<EfficientFrontierResult> => {
    const response = await api.post('/quant/efficient-frontier', {
        tickers,
        start_date: startDate,
        end_date: endDate,
        constraints,
        views
    }, { timeout: 60000 });
    return response.data;
};

export const runBacktest = async (params: any): Promise<BacktestResult> => {
    const response = await api.post('/quant/backtest', params);
    return response.data;
};

export const calculateOptionPrice = async (S: number, K: number, T: number, r: number, sigma: number): Promise<OptionPriceResult> => {
    const response = await api.post('/quant/option-pricing', {
        S, K, T, r, sigma
    });
    return response.data;
};

export const getCompanyInfo = async (ticker: string): Promise<CompanyInfo> => {
    return fetchWithCache(`company_info_${ticker}`, async () => {
        const response = await api.get(`/research/company/${ticker}`);
        return response.data;
    });
};

export const getComps = async (ticker: string): Promise<any[]> => {
    return fetchWithCache(`comps_${ticker}`, async () => {
        const response = await api.get(`/research/comps/${ticker}`);
        return response.data;
    });
};

export const getDeepResearch = async (ticker: string): Promise<any> => {
    return fetchWithCache(`deep_research_${ticker}`, async () => {
        const response = await api.get(`/research/deep-research/${ticker}`);
        return response.data;
    }, 600); // 10 min cache - analyst data doesn't change frequently
};

export const getTreasuryRates = async (): Promise<TreasuryRate[]> => {
    return fetchWithCache('treasury_rates', async () => {
        const response = await api.get('/research/treasury');
        return response.data;
    }, 600); // 10 min cache - treasury rates update very slowly
};

export const getIndexDetails = async (symbol: string): Promise<IndexDetails> => {
    const response = await api.get(`/market/ticker/${encodeURIComponent(symbol)}`);
    return response.data;
};

export const getTickerHistory = async (symbol: string, period: string = "1mo", interval: string = "1d"): Promise<ChartPoint[]> => {
    const response = await api.get(`/market/ticker/${symbol}/history?period=${period}&interval=${interval}`);
    return response.data;
};

export const getMacroSummary = async (): Promise<any[]> => {
    try {
        return await fetchWithCache('macro_summary', async () => {
            const response = await api.get('/macro/summary');
            return response.data;
        }, 300); // 5 min cache
    } catch (error) {
        console.error("Error fetching macro summary:", error);
        return [];
    }
};

export const getMarketNews = async (): Promise<NewsItem[]> => {
    return fetchWithCache('market_news', async () => {
        const response = await api.get('/market/news');
        return response.data;
    });
};

export const getYieldCurves = async (): Promise<YieldCurveData[]> => {
    const response = await api.get('/macro/yield-curves');
    return response.data;
};

export const searchTickers = async (query: string): Promise<SearchResult[]> => {
    const response = await api.get(`/market/search?q=${query}`);
    return response.data;
};

export const getFinancials = async (ticker: string): Promise<Financials> => {
    const response = await api.get(`/research/financials/${ticker}`);
    return response.data;
};

export const getOptionDates = async (ticker: string): Promise<string[]> => {
    const response = await api.get(`/quant/options/dates/${ticker}`);
    return response.data;
};

export const getOptionChain = async (ticker: string, date: string): Promise<{ calls: OptionChainItem[], puts: OptionChainItem[] }> => {
    const response = await api.get(`/quant/options/chain/${ticker}?date=${date}`);
    return response.data;
};

export const getEconomicCalendar = async (): Promise<any[]> => {
    const response = await api.get('/macro/calendar');
    return response.data;
};

export const getFedProjections = async (): Promise<any> => {
    const response = await api.get('/macro/fed-projections');
    return response.data;
};

// Analyst Track Record
export const logTrade = async (trade: { ticker: string, action: string, price: number, quantity: number, rationale: string }) => {
    const res = await api.post('/quant/analyst/trade', trade);
    return res.data;
};

export const getAnalystRecord = async () => {
    const res = await api.get('/quant/analyst/record');
    return res.data;
};

// AI Chat
export const getAIChatResponse = async (message: string, context: any = null): Promise<{ response: string }> => {
    const res = await api.post('/ai/chat', { message, context });
    return res.data;
};

export const generateAIAnalystReport = async (ticker: string): Promise<{ report_content: string }> => {
    // LLM generation can be slow, increase timeout to 90s
    const res = await api.post('/ai/generate_report', { ticker }, { timeout: 90000 });
    return res.data;
};

export const getAIAnalysis = async (ticker: string): Promise<any> => {
    const res = await api.get(`/research/ai-analysis/${ticker}`);
    return res.data;
};

// Surface & Pairs
export const getVolSurface = async (ticker: string, r: number = 0.05, sigma: number = 0.2): Promise<any> => {
    // Surface calculation can be heavy, caching recommended
    return fetchWithCache(`vol_surface_${ticker}`, async () => {
        const response = await api.get(`/quant/surface?ticker=${ticker}&r=${r}&sigma=${sigma}`);
        return response.data;
    });
};

export const getPairsAnalysis = async (ticker1: string, ticker2: string, period: string = "1y"): Promise<any> => {
    return fetchWithCache(`pairs_${ticker1}_${ticker2}`, async () => {
        const response = await api.get(`/quant/pairs?ticker1=${ticker1}&ticker2=${ticker2}&period=${period}`);
        return response.data;
    });
};

export const getSentimentAnalysis = async (ticker: string): Promise<any> => {
    const response = await api.get(`/behavioral/sentiment/${ticker}`);
    return response.data;
};

export const getInverseCramer = async (): Promise<any> => {
    return fetchWithCache('inverse_cramer', async () => {
        const response = await api.get('/behavioral/inverse-cramer');
        return response.data;
    }, 1800); // 30 min cache - Cramer's picks don't change that often
};

export const getTrendingTickers = async (): Promise<any[]> => {
    return fetchWithCache('trending_tickers', async () => {
        const response = await api.get('/behavioral/trending');
        return response.data;
    }, 120); // 2 min cache - trending updates moderately
};

export const getSuperinvestorData = async (): Promise<any[]> => {
    return fetchWithCache('superinvestor_data', async () => {
        const response = await api.get('/behavioral/whales');
        return response.data;
    }, 3600); // 1 hour cache
};

export const getCryptoTop = async (): Promise<any[]> => {
    return fetchWithCache('crypto_top', async () => {
        const response = await api.get('/crypto/top');
        return response.data;
    }, 10); // 10s cache
};

export const getCryptoDefi = async (): Promise<any[]> => {
    return fetchWithCache('crypto_defi', async () => {
        const response = await api.get('/crypto/defi');
        return response.data;
    }, 60); // 1 min cache
};

export const getCryptoWhaleAlerts = async (): Promise<any[]> => {
    return fetchWithCache('crypto_whales', async () => {
        const response = await api.get('/crypto/whales');
        return response.data;
    }, 30); // 30s cache
};

export const getCryptoArbitrage = async (): Promise<any[]> => {
    return fetchWithCache('crypto_arbitrage', async () => {
        const response = await api.get('/crypto/arbitrage');
        return response.data;
    }, 15); // 15s cache
};

export const getBeneishScore = async (ticker: string) => {
    const response = await api.get(`/accounting/beneish/${ticker}`);
    return response.data;
};

export const generatePDFReport = async (ticker: string) => {
    const response = await api.get(`/reports/generate/${ticker}`, {
        responseType: 'blob'
    });
    return response.data;
};

export const getFearGreedIndex = async (): Promise<any> => {
    return fetchWithCache('fear_greed', async () => {
        const response = await api.get('/behavioral/fear-greed');
        return response.data;
    }, 1800); // 30 min cache
};

export const getCognitiveBiases = async (): Promise<any[]> => {
    return fetchWithCache('biases', async () => {
        const response = await api.get('/behavioral/biases');
        return response.data;
    }, 86400); // 24hr cache (static content)
};

export const getPersonalityTest = async (): Promise<any> => {
    return fetchWithCache('personality_test', async () => {
        const response = await api.get('/behavioral/personality');
        return response.data;
    }, 86400); // 24hr cache
};
