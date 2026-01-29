import yfinance as yf
import pandas as pd
import requests
import httpx
from dateutil import parser as date_parser
import asyncio
from functools import wraps
import os
import time
from typing import Callable, Any
from cache import timed_cache, cache



# Pre-seed cache if empty (Instant Load Fix)
# We can do this with a separate initialization function or just rely on the first run
def init_cache():
    # Only seed if completely empty to avoid overwriting valid data
    if len(cache) == 0:
        pass # Let the scheduled tasks handle it


@timed_cache(seconds=600)
def get_market_overview():
    """
    Fetches data for major indices and returns percent changes.
    Cached for performance (clears on restart).
    """
    tickers = ["^GSPC", "^IXIC", "^DJI", "^RUT"]
    names = {
        "^GSPC": "S&P 500",
        "^IXIC": "NASDAQ",
        "^DJI": "Dow Jones",
        "^RUT": "Russell 2000"
    }
    
    overview = []
    
    # 1. Try Bulk Fetch
    try:
        data = yf.download(tickers, period="5d", interval="1d", progress=False, threads=False)
        
        # Handle MultiIndex columns (Price, Ticker) or (Ticker, Price)
        if isinstance(data.columns, pd.MultiIndex):
            # Try to find Close or Adj Close
            if 'Adj Close' in data.columns.get_level_values(0):
                data = data['Adj Close']
            elif 'Close' in data.columns.get_level_values(0):
                data = data['Close']
        elif 'Adj Close' in data:
            data = data['Adj Close']
        elif 'Close' in data:
            data = data['Close']
            
    except Exception as e:
        print(f"Error bulk fetching market overview: {e}")
        data = pd.DataFrame()

    # 2. Process and Retry if needed
    for ticker in tickers:
        price = 0.0
        change = 0.0
        
        # Check if we have valid data from bulk fetch
        if not data.empty and ticker in data.columns and len(data) >= 2:
            series = data[ticker]
            if not series.isna().iloc[-1]:
                latest = float(series.iloc[-1])
                prev = float(series.iloc[-2])
                price = latest
                change = ((latest - prev) / prev) * 100
        
        # 3. Retry Individually if missing
        if price == 0:
            try:
                print(f"Retrying fetch for {ticker}...")
                ticker_obj = yf.Ticker(ticker)
                hist = ticker_obj.history(period="2d")
                if len(hist) >= 2:
                    latest = float(hist['Close'].iloc[-1])
                    prev = float(hist['Close'].iloc[-2])
                    price = latest
                    change = ((latest - prev) / prev) * 100
            except Exception as e:
                print(f"Retry failed for {ticker}: {e}")

        overview.append({
            "symbol": ticker,
            "name": names.get(ticker, ticker),
            "price": price,
            "change": change
        })
        
    return overview



@timed_cache(seconds=300)
def _get_ticker_details_sync(symbol: str):
    """
    Fetches detailed information and historical data for a specific ticker.
    """
    try:
        ticker = yf.Ticker(symbol)
        
        # Get historical data for chart (1 month, daily)
        # Get historical data for chart (1 month, daily)
        hist = ticker.history(period="1mo", interval="1d")
        
        # Optimization: Vectorized conversion (Sardine Packing)
        # Avoid iterrows() which is slow. Use to_dict('records')
        if not hist.empty:
            hist_reset = hist.reset_index()
            # Ensure Date is string
            hist_reset['date'] = hist_reset['Date'].dt.strftime("%Y-%m-%d")
            
            # Fill NaNs to avoid JSON errors
            columns_to_fix = ['Open', 'High', 'Low', 'Close', 'Volume']
            for col in columns_to_fix:
                if col in hist_reset.columns:
                    hist_reset[col] = hist_reset[col].fillna(0)
            
            # Rename for frontend API contract
            rename_map = {
                'Open': 'open', 'High': 'high', 'Low': 'low', 'Close': 'close', 'Volume': 'volume'
            }
            # Only select available columns
            available_cols = [c for c in rename_map.keys() if c in hist_reset.columns]
            chart_data = hist_reset[['date'] + available_cols].rename(columns=rename_map).to_dict('records')
            
            # Add 'price' alias for 'close' (frontend expects this)
            for row in chart_data:
                row['price'] = row['close']
        else:
            chart_data = []
            
        # Get info
        info = ticker.info
        if not info:
             print(f"Warning: No info found for {symbol}")
             # Try to construct minimal info from history if possible
             if chart_data:
                 last = chart_data[-1]
                 return {
                     "symbol": symbol,
                     "name": symbol,
                     "price": last["close"],
                     "change": 0,
                     "open": last["open"],
                     "high": last["high"],
                     "low": last["low"],
                     "volume": last["volume"],
                     "prev_close": last["close"], # Approx
                     "fifty_two_week_high": last["high"],
                     "fifty_two_week_low": last["low"],
                     "chart_data": chart_data
                 }
             return None
        
        details = {
            "symbol": symbol,
            "name": info.get("longName", info.get("shortName", symbol)),
            "price": info.get("currentPrice", info.get("regularMarketPrice", 0)),
            "change": info.get("regularMarketChangePercent", 0) * 100, # yfinance returns decimal
            "open": info.get("open", 0),
            "high": info.get("dayHigh", 0),
            "low": info.get("dayLow", 0),
            "volume": info.get("volume", 0),
            "prev_close": info.get("previousClose", 0),
            "fifty_two_week_high": info.get("fiftyTwoWeekHigh", 0),
            "fifty_two_week_low": info.get("fiftyTwoWeekLow", 0),
            "chart_data": chart_data
        }
        
        # Fallback for price/change if not in info (common for indices)
        if details["price"] == 0 and not hist.empty:
            latest = hist.iloc[-1]
            prev = hist.iloc[-2] if len(hist) > 1 else latest
            details["price"] = float(latest["Close"])
            details["change"] = ((float(latest["Close"]) - float(prev["Close"])) / float(prev["Close"])) * 100
            details["open"] = float(latest["Open"])
            details["high"] = float(latest["High"])
            details["low"] = float(latest["Low"])
            
        return details
        
    except Exception as e:
        print(f"Error fetching ticker details for {symbol}: {e}")
        # Return a minimal valid object to prevent frontend crashes, or None if strictly required
        return None

async def get_ticker_details(symbol: str):
    return await asyncio.to_thread(_get_ticker_details_sync, symbol)

@timed_cache(seconds=60)
def _get_ticker_history_sync(symbol: str, period: str = "1mo", interval: str = "1d"):
    """
    Fetches historical data for a specific ticker with dynamic period and interval.
    """
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period, interval=interval)
        
        # Optimization: Vectorized conversion
        if not hist.empty:
            hist_reset = hist.reset_index()
            
            # Vectorized Date Formatting
            if interval in ["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h"]:
                hist_reset['date'] = hist_reset['Datetime'].dt.strftime("%Y-%m-%d %H:%M") # standardized name for frontend
            else:
                hist_reset['date'] = hist_reset['Date'].dt.strftime("%Y-%m-%d")

            # Handle NaNs and Types
            cols = ['Open', 'High', 'Low', 'Close', 'Volume']
            for col in cols:
                if col in hist_reset.columns:
                    hist_reset[col] = hist_reset[col].fillna(0).astype(float)
            
            # Rename
            rename_map = {
                'Open': 'open', 'High': 'high', 'Low': 'low', 'Close': 'close', 'Volume': 'volume'
            }
             # Only select available columns
            available_cols = [c for c in rename_map.keys() if c in hist_reset.columns]
            
            chart_data = hist_reset[['date'] + available_cols].rename(columns=rename_map).to_dict('records')
            
            # Add 'price' alias (frontend compat)
            for row in chart_data:
                row['price'] = row['close']
        else:
            chart_data = []
                
        return chart_data
    except Exception as e:
        print(f"Error fetching history for {symbol}: {e}")
        return []

async def get_ticker_history(symbol: str, period: str = "1mo", interval: str = "1d"):
    return await asyncio.to_thread(_get_ticker_history_sync, symbol, period, interval)


@timed_cache(seconds=300)
def _search_tickers_sync(query: str):
    """
    Searches for tickers using Yahoo Finance's autocomplete API.
    Cached synchronous implementation.
    """
    try:
        url = f"https://query2.finance.yahoo.com/v1/finance/search?q={query}&quotesCount=10&newsCount=0"
        headers = {'User-Agent': 'Mozilla/5.0'}
        
        # Use simple requests for sync
        response = requests.get(url, headers=headers, timeout=5)
        data = response.json()
        
        # Exchanges to allow: NYSE, NASDAQ, AMEX, ARCA, Indices
        allowed_exchanges = {'NMS', 'NGM', 'NCM', 'NYQ', 'PCX', 'ASE', 'NIM', 'SNP', 'DJI', 'CBO'}
        
        results = []
        if 'quotes' in data:
            for quote in data['quotes']:
                exch = quote.get('exchange', '')
                # Filter for equity and indices mostly, but allow others
                if 'symbol' in quote and 'shortname' in quote and exch in allowed_exchanges:
                    results.append({
                        "symbol": quote['symbol'],
                        "name": quote['shortname'],
                        "exch": exch,
                        "type": quote.get('quoteType', '')
                    })
        return results
    except Exception as e:
        print(f"Error searching tickers: {e}")
        return []

async def search_tickers(query: str):
    return await asyncio.to_thread(_search_tickers_sync, query)

@timed_cache(seconds=600)
def _get_market_news_sync(symbol: str = None):
    """
    Fetches market news. If symbol is provided, fetches specific news.
    Otherwise, aggregates news from major ETFs (SPY, QQQ, DIA).
    """
    news_items = []
    seen_titles = set()
    
    import concurrent.futures

    # If symbol provided, just fetch that one
    if symbol:
        tickers = [symbol]
    else:
        # Use SPY, QQQ, DIA as proxies for general market news
        tickers = ["SPY", "QQQ", "DIA"]
    
    def fetch_news_for_ticker(ticker):
        try:
            t = yf.Ticker(ticker)
            return t.news, ticker
        except Exception:
            return [], ticker

    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_to_ticker = {executor.submit(fetch_news_for_ticker, t): t for t in tickers}
        
        for future in concurrent.futures.as_completed(future_to_ticker):
            try:
                t_news, ticker = future.result()
                if t_news:
                    for item in t_news:
                        # Handle new nested structure from yahoo finance
                        content = item.get('content', {})
                        title = item.get('title') or content.get('title', '')
                        
                        # Handle link
                        link = item.get('link')
                        if not link and 'clickThroughUrl' in content and content['clickThroughUrl']:
                             link = content['clickThroughUrl'].get('url')
                        if not link:
                             link = '#'

                        # Handle time
                        pub_time = item.get('providerPublishTime')
                        if not pub_time and 'content' in item:
                             # Try to get from content
                             content = item.get('content', {})
                             pub_time = content.get('providerPublishTime')
                             
                             if not pub_time and 'pubDate' in content:
                                 # Parse ISO string to timestamp
                                 try:
                                     dt = date_parser.parse(content['pubDate'])
                                     pub_time = int(dt.timestamp())
                                 except Exception:
                                     pass

                        # Sometimes it's in pubDate but parsing is complex, stick to providerPublishTime if available
                        if not pub_time:
                             pub_time = 0

                        if title and title not in seen_titles:
                            news_items.append({
                                "title": title,
                                "link": link,
                                "publisher": item.get('publisher', 'Yahoo Finance'),
                                "providerPublishTime": pub_time,
                                "ticker": ticker
                            })
                            seen_titles.add(title)
            except Exception as exc:
                print(f"News fetch generated an exception: {exc}")
            
    # Sort by time, newest first
    news_items.sort(key=lambda x: x['providerPublishTime'], reverse=True)
    return news_items[:10]

async def get_market_news(symbol: str = None):
    return await asyncio.to_thread(_get_market_news_sync, symbol)
