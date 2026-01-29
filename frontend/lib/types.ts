export interface MarketOverviewItem {
    symbol: string;
    name: string;
    price: number;
    change: number;
}


export interface CompanyInfo {
    symbol: string;
    name: string;
    currency?: string;
    sector: string;
    industry: string;
    summary: string;
    market_cap: number;
    pe_ratio: number | null;
    dividend_yield: number | null;
    beta: number | null;
    fifty_two_week_high: number | null;
    fifty_two_week_low: number | null;
    prev_close?: number;
    news: NewsItem[];
    technical_indicators?: TechnicalIndicators;
    chart_data?: ChartPoint[];
    total_revenue?: number;
    current_price?: number;
    price?: number;
    revenue_growth?: number;
    ebitda_margins?: number;
}

export interface ComparableCompany {
    symbol: string;
    name: string;
    price: number;
    market_cap: number;
    pe: number;
    ev_ebitda: number;
    price_to_sales: number;
    profit_margin: number;
    revenue_growth: number;
    is_target?: boolean;
}



export interface DeepResearchData {
    insiderTrading: InsiderTransaction[];
    analystRatings: AnalystRatings;
    ownership: OwnershipData;
    advancedMetrics: AdvancedMetrics;
}

export interface InsiderTransaction {
    date: string;
    insider: string;
    position: string;
    shares: number;
    value: number;
    transactionText: string;
}

export interface AnalystRatings {
    consensus: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell";
    breakdown: {
        buy: number;
        hold: number;
        sell: number;
        strongBuy: number;
        strongSell: number;
    };
}

export interface OwnershipData {
    institutions: number;
    insiders: number;
    public: number;
}

export interface AdvancedMetrics {
    pegRatio: number;
    shortRatio: number;
    shortPercentOfFloat: number;
    beta: number;
    bookValue: number;
    priceToBook: number;
}

export interface NewsItem {
    title: string;
    link: string;
    publisher: string;
    providerPublishTime: number;
    ticker: string;
}

export interface TechnicalIndicators {
    rsi: number;
    macd: number;
    macd_signal: number;
    sentiment: "Bullish" | "Bearish" | "Neutral";
    signal: "Buy" | "Sell" | "Hold";
}

export interface TreasuryRate {
    symbol: string;
    name: string;
    yield: number;
    change: number;
}

export interface IndexDetails {
    symbol: string;
    name: string;
    price: number;
    change: number;
    open: number;
    high: number;
    low: number;
    volume: number;
    prev_close: number;
    fifty_two_week_high: number;
    fifty_two_week_low: number;
    chart_data: ChartPoint[];
}

export interface ChartPoint {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    price: number;
}

export interface EfficientFrontierResult {
    efficient_frontier: {
        volatility: number[];
        return: number[];
        sharpe_ratio: number[];
    };
    max_sharpe_portfolio: PortfolioMetrics;
    min_vol_portfolio: PortfolioMetrics;
}

export interface PortfolioMetrics {
    return: number;
    volatility: number;
    sharpe_ratio: number;
    weights: { [ticker: string]: number };
}

export interface BacktestResult {
    returns: number[];
    metrics: {
        total_return: number;
        annualized_return: number;
        volatility: number;
        sharpe_ratio: number;
        max_drawdown: number;
    };
    equity_curve: { date: string; equity: number }[];
}

export interface OptionPriceResult {
    call_price: number;
    put_price: number;
    greeks: {
        delta: { call: number; put: number };
        gamma: number;
        theta: { call: number; put: number };
        vega: number;
        rho: { call: number; put: number };
    };
}

export interface OptionDate {
    date: string;
}

export interface OptionChainItem {
    contractSymbol: string;
    strike: number;
    bid: number;
    ask: number;
    lastPrice: number;
    change: number;
    percentChange: number;
    volume: number;
    openInterest: number;
    impliedVolatility: number;
    inTheMoney: boolean;
}

export interface OptionChainResponse {
    calls: OptionChainItem[];
    puts: OptionChainItem[];
}

export interface ProcessedOptionsChain {
    sortedStrikes: number[];
    callMap: Map<number, OptionChainItem>;
    putMap: Map<number, OptionChainItem>;
}

export interface SearchResult {
    symbol: string;
    name: string;
    exch: string;
    type: string;
}

export interface FinancialStatementItem {
    date: string;
    [key: string]: string | number;
}

export interface Financials {
    income_statement: FinancialStatementItem[];
    balance_sheet: FinancialStatementItem[];
    cash_flow: FinancialStatementItem[];
    sankey_data?: {
        revenue: number;
        cogs: number;
        gross_profit: number;
        rd: number;
        sga: number;
        other_opex: number;
        op_income: number;
        tax: number;
        interest: number;
        net_income: number;
    };
}

export interface MacroSummary {
    gdp_growth: number;
    inflation_rate: number;
    unemployment_rate: number;
    interest_rate: number;
}

export interface YieldCurveData {
    date: string;
    rates: { [maturity: string]: number };
}

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}
