import yfinance as yf
import pandas as pd
import asyncio
from functools import lru_cache

@lru_cache(maxsize=32)
def get_company_info(ticker: str):
    """
    Fetches fundamental data and news for a company.
    Cached for performance.
    """
    stock = yf.Ticker(ticker)
    info = stock.info
    news = stock.news
    
    # Process news to ensure required fields exist
    processed_news = []
    if news:
        for item in news[:5]:
            # Check for nested content structure (new yfinance format)
            content = item.get('content', item)
            
            title = content.get("title", "No Title")
            
            # Handle URL
            link = content.get("link", "#")
            if "clickThroughUrl" in content and content["clickThroughUrl"]:
                link = content["clickThroughUrl"].get("url", link)
            
            # Handle Publisher
            publisher = content.get("publisher", "Unknown")
            if "provider" in content and content["provider"]:
                publisher = content["provider"].get("displayName", publisher)
                
            # Handle Date
            pub_time = 0
            if "providerPublishTime" in content:
                pub_time = content.get("providerPublishTime", 0)
            elif "pubDate" in content:
                try:
                    # Convert ISO string to timestamp
                    import dateutil.parser
                    dt = dateutil.parser.parse(content["pubDate"])
                    pub_time = int(dt.timestamp())
                except Exception:
                    pass
            
            processed_news.append({
                "title": title,
                "link": link,
                "publisher": publisher,
                "providerPublishTime": pub_time
            })

    # Validation: Ensure we actually got data back
    if not info or (not info.get("marketCap") and not info.get("longName")):
        return None

    # Extract relevant fields safely
    data = {
        "symbol": info.get("symbol", ticker),
        "name": info.get("longName", "N/A"),
        "sector": info.get("sector", "N/A"),
        "industry": info.get("industry", "N/A"),
        "currency": info.get("currency", "USD"),
        "summary": info.get("longBusinessSummary", "No summary available."),
        # Use fast_info for more real-time price if available, fallback to info
        "current_price": stock.fast_info.get("last_price", info.get("currentPrice", info.get("regularMarketPrice", 0))),
        "market_cap": info.get("marketCap", 0),
        "pe_ratio": info.get("trailingPE", 0),
        "dividend_yield": info.get("dividendYield", 0) if info.get("dividendYield", 0) < 0.20 else (info.get("dividendRate", 0) / info.get("currentPrice", 1) if info.get("currentPrice", 1) > 0 else 0),
        "beta": info.get("beta", 0),
        "fifty_two_week_high": info.get("fiftyTwoWeekHigh", 0),
        "fifty_two_week_low": info.get("fiftyTwoWeekLow", 0),
        "free_cash_flow": info.get("freeCashflow", 0),
        "total_revenue": info.get("totalRevenue", 0),
        "revenue_growth": info.get("revenueGrowth", 0),
        "ebitda_margins": info.get("ebitdaMargins", 0),
        "news": processed_news,
        "technical_indicators": calculate_technical_indicators(stock)
    }
    return data

def calculate_technical_indicators(stock):
    """
    Calculates RSI and MACD for a given ticker object.
    """
    try:
        # Fetch enough data for MACD (26 periods + signal)
        # Use history() on the existing Ticker object to potentially reuse session
        data = stock.history(period="3mo", interval="1d")
        
        if data.empty:
            return None
            
        if 'Close' in data:
            prices = data['Close']
        else:
            return None

        # RSI Calculation (14-day)
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        # MACD Calculation (12, 26, 9)
        exp1 = prices.ewm(span=12, adjust=False).mean()
        exp2 = prices.ewm(span=26, adjust=False).mean()
        macd = exp1 - exp2
        signal = macd.ewm(span=9, adjust=False).mean()
        
        return {
            "rsi": float(rsi.iloc[-1]) if not pd.isna(rsi.iloc[-1]) else 50.0,
            "macd": float(macd.iloc[-1]) if not pd.isna(macd.iloc[-1]) else 0.0,
            "macd_signal": float(signal.iloc[-1]) if not pd.isna(signal.iloc[-1]) else 0.0,
            "sentiment": "Bullish" if macd.iloc[-1] > signal.iloc[-1] else "Bearish"
        }
    except Exception as e:
        print(f"Error calculating technicals: {e}")
        # Return neutral defaults instead of None to prevent frontend crashes
        return {
            "rsi": 50.0,
            "macd": 0.0,
            "macd_signal": 0.0,
            "sentiment": "Neutral"
        }

@lru_cache(maxsize=1)
def get_treasury_rates():
    """
    Fetches current yields for US Treasury Bonds.
    ^IRX: 13 Week
    ^FVX: 5 Year
    ^TNX: 10 Year
    ^TYX: 30 Year
    """
    tickers = ["^IRX", "^FVX", "^TNX", "^TYX"]
    names = {
        "^IRX": "13 Week Bill",
        "^FVX": "5 Year Note",
        "^TNX": "10 Year Note",
        "^TYX": "30 Year Bond"
    }
    
    try:
        # threads=False to prevent asyncio/threading conflicts
        data = yf.download(tickers, period="5d", interval="1d", threads=False, progress=False)
        
        if 'Adj Close' in data:
            prices = data['Adj Close']
        elif 'Close' in data:
            prices = data['Close']
        else:
            return []

        if prices.empty:
            return []

        latest = prices.iloc[-1]
        prev = prices.iloc[-2]
        
        rates = []
        for ticker in tickers:
            if ticker in latest:
                val = float(latest[ticker])
                # Handle potential NaN
                if pd.isna(val):
                    continue
                    
                prev_val = float(prev[ticker])
                change = val - prev_val if not pd.isna(prev_val) else 0.0
                
                rates.append({
                    "symbol": ticker,
                    "name": names.get(ticker, ticker),
                    "yield": val,
                    "change": change
                })
                
        return rates
    except Exception as e:
        print(f"Error fetching treasury rates: {e}")
        return []

@lru_cache(maxsize=32)
def get_financials(ticker: str):
    """
    Fetches detailed financial statements (Income, Balance, Cash Flow).
    Returns last 4 years of data.
    """
    try:
        stock = yf.Ticker(ticker)
        
        # Helper to process dataframe
        def process_df(df):
            if df.empty: return []
            
            # Optimization: Vectorized JSON conversion
            # yfinance returns dates as columns. Transpose to make dates rows.
            df_T = df.T
            df_T.index.name = 'date'
            df_reset = df_T.reset_index()
            
            # Ensure date formatting
            # Check if index was DatetimeIndex before reset
            if pd.api.types.is_datetime64_any_dtype(df_reset['date']):
                 df_reset['date'] = df_reset['date'].dt.strftime("%Y-%m-%d")
            else:
                 df_reset['date'] = df_reset['date'].astype(str)
                 
            # Fill NaNs
            df_reset = df_reset.fillna(0.0)
            
            # Convert to dict records
            return df_reset.to_dict('records')

        income = process_df(stock.income_stmt)
        balance = process_df(stock.balance_sheet)
        cash_flow = process_df(stock.cashflow)
        
        # Also construct the simplified Sankey data from the MOST RECENT year of income statement
        sankey_data = None
        if income:
            recent = income[0] # Assuming sorted desc by date, which yfinance usually does
            sankey_data = {
                "revenue": recent.get("Total Revenue", 0.0),
                "cogs": recent.get("Cost Of Revenue", 0.0),
                "gross_profit": recent.get("Gross Profit", 0.0),
                "rd": recent.get("Research And Development", 0.0),
                "sga": recent.get("Selling General And Administration", 0.0),
                "other_opex": recent.get("Other Operating Expenses", 0.0),
                "op_income": recent.get("Operating Income", 0.0),
                "tax": recent.get("Tax Provision", 0.0),
                "interest": recent.get("Interest Expense", 0.0),
                "net_income": recent.get("Net Income", 0.0)
            }

        return {
            "income_statement": income,
            "balance_sheet": balance,
            "cash_flow": cash_flow,
            "sankey_data": sankey_data
        }
        
    except Exception as e:
        print(f"Error fetching financials for {ticker}: {e}")
        return None

@lru_cache(maxsize=32)
def get_comparable_companies(ticker: str):
    """
    Fetches comparable companies and their key valuation metrics.
    Currently uses a hardcoded map for major tickers due to API limitations,
    fallback to same-sector logic would require a database.
    """
    try:
        # Predefined peers map (Expanded)
        peers_map = {
            # TECH - BIG 7
            "AAPL": ["MSFT", "GOOGL", "AMZN", "NVDA", "META"],
            "MSFT": ["AAPL", "GOOGL", "AMZN", "ORCL", "IBM"],
            "GOOGL": ["MSFT", "META", "AMZN", "AAPL", "SNAP"],
            "AMZN": ["WMT", "MSFT", "GOOGL", "BABA", "EBAY"],
            "NVDA": ["AMD", "INTC", "TSM", "AVGO", "QCOM"],
            "TSLA": ["F", "GM", "TM", "BYDDF", "RIVN"],
            "META": ["GOOGL", "SNAP", "PINS", "TTD", "TWTR"],
            
            # SEMI
            "AMD": ["NVDA", "INTC", "TSM", "QCOM", "AVGO"],
            "INTC": ["AMD", "NVDA", "TSM", "TXN", "QCOM"],
            "AVGO": ["QCOM", "NVDA", "AMD", "TXN", "ADI"],
            "QCOM": ["AVGO", "AMD", "INTC", "NXPI", "TXN"],
            "TSM": ["INTC", "AMD", "NVDA", "UMC", "ASX"],
            "MU": ["WDC", "STX", "INTC", "AMD"],
            
            # SOFTWARE
            "ORCL": ["MSFT", "CRM", "SAP", "IBM", "NOW"],
            "CRM": ["ORCL", "SAP", "MSFT", "ADBE", "NOW"],
            "ADBE": ["CRM", "MSFT", "ORCL", "INTU", "ADSK"],
            "NOW": ["CRM", "WDAY", "SNOW", "DDOG", "TEAM"],
            "SNOW": ["DDOG", "MDB", "PLTR", "NOW"],
            "PLTR": ["SNOW", "DDOG", "AI", "MDB"],

            # FINANCE
            "JPM": ["BAC", "WFC", "C", "GS", "MS"],
            "BAC": ["JPM", "WFC", "C", "USB", "PNC"],
            "WFC": ["JPM", "BAC", "C", "USB", "SCHW"],
            "C": ["JPM", "BAC", "WFC", "GS", "MS"],
            "GS": ["MS", "JPM", "BAC", "C", "BLK"],
            "MS": ["GS", "JPM", "BAC", "SCHW", "BLK"],
            "BLK": ["STT", "BEN", "TROW", "IVZ", "GS"],
            "V": ["MA", "AXP", "PYPL", "DFS"],
            "MA": ["V", "AXP", "PYPL", "DFS"],
            "AXP": ["V", "MA", "COF", "DFS"],
            "PYPL": ["SQ", "V", "MA", "AFRM"],
            
            # HEALTHCARE
            "LLY": ["NVO", "JNJ", "PFE", "MRK", "ABBV"],
            "NVO": ["LLY", "JNJ", "PFE", "SNY", "AZN"],
            "JNJ": ["PFE", "MRK", "ABBV", "BMY", "LLY"],
            "PFE": ["JNJ", "MRK", "BMY", "LLY", "ABBV"],
            "MRK": ["JNJ", "PFE", "BMY", "LLY", "ABBV"],
            "UNH": ["ELV", "CVS", "CI", "HUM", "CNC"],
            "CVS": ["WBA", "UNH", "CI", "RAD"],
            
            # CONSUMER
            "WMT": ["TGT", "COST", "AMZN", "KR", "DG"],
            "TGT": ["WMT", "COST", "KR", "DG", "DLTR"],
            "COST": ["WMT", "TGT", "KR", "BJ", "DG"],
            "KO": ["PEP", "MNST", "KDP", "PG"],
            "PEP": ["KO", "MNST", "KDP", "MDLZ"],
            "MCD": ["QSR", "YUM", "CMG", "WEN", "SBUX"],
            "SBUX": ["MCD", "YUM", "CMG", "DNKN"],
            "NKE": ["ADDYY", "UA", "LULU", "ONON", "CROX"],
            
            # ENERGY
            "XOM": ["CVX", "SHEL", "TTE", "BP", "COP"],
            "CVX": ["XOM", "SHEL", "TTE", "BP", "EOG"],
            "SHEL": ["XOM", "CVX", "TTE", "BP"],
            "OXY": ["COP", "EOG", "PXD", "DVN"],

            # INDUSTRIAL
            "BA": ["AIR.PA", "LMT", "GD", "RTX", "NOC"],
            "CAT": ["DE", "CMI", "PCAR", "TEX"],
            "DE": ["CAT", "AGCO", "CNH"],
        }
        
        # Default fallback if not in map
        peers = peers_map.get(ticker.upper(), ["SPY", "QQQ", "DIA", "IWM"])
        
        results = []
        for peer_ticker in peers:
            info = get_company_info(peer_ticker) # Reuse existing cached function
            if info:
                results.append({
                    "symbol": info["symbol"],
                    "name": info["name"],
                    "price": info["current_price"],
                    "market_cap": info["market_cap"],
                    "pe": info["pe_ratio"],
                    "ev_ebitda": info.get("enterpriseToEbitda", 0) if "enterpriseToEbitda" in info else 0, # Note: get_company_info might not have this, check define
                    "price_to_sales": info.get("priceToSalesTrailing12Months", 0),
                    "profit_margin": info.get("profitMargins", 0),
                    "revenue_growth": info["revenue_growth"]
                })
        
        # Self data too?
        self_info = get_company_info(ticker)
        if self_info:
             results.insert(0, {
                "symbol": self_info["symbol"],
                "name": self_info["name"],
                "price": self_info["current_price"],
                "market_cap": self_info["market_cap"],
                "pe": self_info["pe_ratio"],
                "ev_ebitda": 0, # Need to add this to get_company_info
                "price_to_sales": 0,
                "profit_margin": 0,
                "revenue_growth": self_info["revenue_growth"],
                "is_target": True
            })
            
        return results
    except Exception as e:
        print(f"Error fetching comps for {ticker}: {e}")
        return []

@lru_cache(maxsize=32)
def get_ai_analysis(ticker: str):
    """
    Performs 'AI' analysis using real technical indicators.
    Calculates Support/Resistance, Trend, and Signal.
    """
    try:
        stock = yf.Ticker(ticker)
        # Fetch 6 months of data for trend analysis
        hist = stock.history(period="6mo")
        
        if hist.empty:
            return None
            

        
        # 1. Trend Analysis (SMA 50 vs SMA 200)
        sma_50 = hist['Close'].rolling(window=50).mean().iloc[-1]
        sma_200 = hist['Close'].rolling(window=200).mean().iloc[-1]
        
        trend = "Consolidation"
        if pd.notna(sma_50) and pd.notna(sma_200):
            if sma_50 > sma_200:
                trend = "Uptrend"
            elif sma_50 < sma_200:
                trend = "Downtrend"
                
        # 2. Support & Resistance (Simple: Recent Lows/Highs)
        # Look at last 3 months
        recent = hist.tail(60)
        support = recent['Low'].min()
        resistance = recent['High'].max()
        
        # 3. Volatility (Annualized Std Dev)
        daily_returns = hist['Close'].pct_change()
        volatility = daily_returns.std() * (252 ** 0.5) * 100 # Annualized %
        
        # 4. RSI & MACD (Reuse existing logic)
        technicals = calculate_technical_indicators(stock)
        rsi = technicals.get('rsi', 50)
        macd = technicals.get('macd', 0)
        signal_line = technicals.get('macd_signal', 0)
        
        # 5. Composite Signal Generation
        score = 0
        # RSI Scoring
        if rsi < 30: score += 2 # Oversold -> Buy
        elif rsi > 70: score -= 2 # Overbought -> Sell
        
        # MACD Scoring
        if macd > signal_line: score += 1
        else: score -= 1
        
        # Trend Scoring
        if trend == "Uptrend": score += 1
        elif trend == "Downtrend": score -= 1
        
        # Determine Signal
        signal = "HOLD"
        confidence = 60 # Base confidence
        
        if score >= 2:
            signal = "BUY"
            confidence = 75 + (score * 5)
        elif score <= -2:
            signal = "SELL"
            confidence = 75 + (abs(score) * 5)
            
        confidence = min(confidence, 98) # Cap at 98%
        
        # Sentiment
        sentiment = "Neutral"
        if score > 0: sentiment = "Bullish"
        elif score < 0: sentiment = "Bearish"
        
        return {
            "signal": signal,
            "confidence": int(confidence),
            "trend": trend,
            "sentiment": sentiment,
            "volatility": round(volatility, 1),
            "support": round(support, 2),
            "resistance": round(resistance, 2),
            "rsi": round(rsi, 1),
            "beta": stock.info.get('beta', 1.0)
        }
        
    except Exception as e:
        print(f"Error in AI analysis for {ticker}: {e}")
        return None

@lru_cache(maxsize=32)
def get_deep_research(ticker: str):
    """
    Fetches deep-dive research data:
    1. Insider Transactions (Last 6 months)
    2. Analyst Recommendations (Consensus)
    3. Institutional Ownership
    4. Advanced Metrics (PEG, Short Ratio)
    """
    try:
        stock = yf.Ticker(ticker)
        
        # 1. Insider Transactions
        # yfinance returns a DataFrame. need to clean.
        insider_data = []
        try:
            # Note: insider_transactions can be empty or fail
            insiders = stock.insider_transactions
            if insiders is not None and not insiders.empty:
                # Get last 10 transactions
                recent = insiders.sort_index(ascending=False).head(10)
                
                # Optimization: Vectorized conversion
                recent_reset = recent.reset_index()
                
                # Handle Date formatting safely
                # The index might be named 'Date' or something else, or unnamed
                date_col = 'Date' if 'Date' in recent_reset.columns else recent_reset.columns[0]
                
                if pd.api.types.is_datetime64_any_dtype(recent_reset[date_col]):
                    recent_reset['date'] = recent_reset[date_col].dt.strftime("%Y-%m-%d")
                else:
                    recent_reset['date'] = recent_reset[date_col].astype(str)

                # Rename columns to match frontend expectations
                # Row keys: 'Insider', 'Position', 'Shares', 'Value', 'Text'
                rename_map = {
                    'Insider': 'insider',
                    'Position': 'position',
                    'Shares': 'shares',
                    'Value': 'value',
                    'Text': 'transactionText' # Use 'transactionText' not 'Text'
                }
                
                # Fill NaNs
                recent_reset = recent_reset.fillna({'Shares': 0, 'Value': 0.0, 'Text': '', 'Insider': 'Unknown', 'Position': 'Unknown'})
                
                # Select and Rename
                cols_to_keep = ['date'] + [c for c in rename_map.keys() if c in recent_reset.columns]
                insider_data = recent_reset[cols_to_keep].rename(columns=rename_map).to_dict('records')
        except Exception as e:
            print(f"Insider fetch error: {e}")

        # 2. Analyst Recommendations
        analyst_data = {
            "consensus": "Hold",
            "breakdown": {"buy": 0, "hold": 0, "sell": 0, "strongBuy": 0, "strongSell": 0}
        }
        try:
            recs = stock.recommendations_summary
            if recs is not None and not recs.empty:
                # recs usually has columns like 'strongBuy', 'buy', 'hold', 'sell', 'strongSell'
                # and is indexed by period (0m, -1m, etc). We want the latest (row 0).
                latest = recs.iloc[0]
                analyst_data["breakdown"] = {
                    "strongBuy": int(latest.get("strongBuy", 0)),
                    "buy": int(latest.get("buy", 0)),
                    "hold": int(latest.get("hold", 0)),
                    "sell": int(latest.get("sell", 0)),
                    "strongSell": int(latest.get("strongSell", 0))
                }
                
                # Determine Consensus Label
                total = sum(analyst_data["breakdown"].values())
                if total > 0:
                    score = (analyst_data["breakdown"]["strongBuy"] * 2 + analyst_data["breakdown"]["buy"] * 1 - analyst_data["breakdown"]["sell"] * 1 - analyst_data["breakdown"]["strongSell"] * 2) / total
                    if score > 0.5: analyst_data["consensus"] = "Strong Buy"
                    elif score > 0.1: analyst_data["consensus"] = "Buy"
                    elif score < -0.5: analyst_data["consensus"] = "Strong Sell"
                    elif score < -0.1: analyst_data["consensus"] = "Sell"
        except Exception as e:
            print(f"Analyst fetch error: {e}")

        # 3. Ownership
        ownership_data = {"institutions": 0, "insiders": 0, "public": 0}
        try:
            # major_holders returns a DataFrame with index 0, 1... and columns [0, 1] (Value, Breakdown)
            # or different format depending on version.
            # Safer to use info dict for quick summary
            info = stock.info
            ownership_data["institutions"] = info.get("heldPercentInstitutions", 0) * 100
            ownership_data["insiders"] = info.get("heldPercentInsiders", 0) * 100
            ownership_data["public"] = 100 - ownership_data["institutions"] - ownership_data["insiders"]
        except Exception as e:
            print(f"Ownership fetch error: {e}")

        # 4. Advanced Metrics
        info = stock.info
        metrics = {
             "pegRatio": info.get("pegRatio", 0),
             "shortRatio": info.get("shortRatio", 0),
             "shortPercentOfFloat": info.get("shortPercentOfFloat", 0),
             "beta": info.get("beta", 0),
             "bookValue": info.get("bookValue", 0),
             "priceToBook": info.get("priceToBook", 0)
        }

        return {
            "insiderTrading": insider_data,
            "analystRatings": analyst_data,
            "ownership": ownership_data,
            "advancedMetrics": metrics
        }

    except Exception as e:
        print(f"Error fetching deep research for {ticker}: {e}")
        return None
