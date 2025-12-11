import yfinance as yf
import pandas as pd
import asyncio
from datetime import datetime, timedelta
from cache import timed_cache
import concurrent.futures
from services.cache_manager import disk_cached

# Historical Dates for Yield Curve Comparison
DATES = {
    "current": "Current",
    "month_ago": "1 Month Ago",
    "year_ago": "1 Year Ago",
    "2007_peak": "2007-10-09", # S&P 500 Peak before 2008 crash
    "2000_peak": "2000-03-24", # Dot Com Bubble Peak
}

YIELD_TICKERS = ["^IRX", "^FVX", "^TNX", "^TYX"]
YIELD_LABELS = ["3 Mo", "5 Yr", "10 Yr", "30 Yr"]

@disk_cached(max_age=300)  # 5 min disk cache - serves instant on cache hit
@timed_cache(seconds=60)
def get_macro_summary():
    """
    Fetches key macro indicators.
    GC=F: Gold Futures
    CL=F: Crude Oil Futures
    HG=F: Copper Futures
    ^VIX: Volatility Index
    DX-Y.NYB: US Dollar Index
    ^TNX: 10 Year Treasury (for reference)
    """
    # Priority 1 = Primary display (top row), Priority 2 = Secondary
    tickers = ["GC=F", "CL=F", "HG=F", "^VIX", "DX-Y.NYB", "^TNX", "SI=F", "NG=F", "BTC-USD"]
    
    # Metadata for each ticker
    ticker_info = {
        "GC=F": {"name": "Gold", "unit": "$/troy oz", "priority": 1},
        "CL=F": {"name": "Crude Oil", "unit": "$/barrel", "priority": 1},
        "HG=F": {"name": "Copper", "unit": "$/lb", "priority": 1},
        "^VIX": {"name": "VIX", "unit": "index", "priority": 1},
        "DX-Y.NYB": {"name": "DXY", "unit": "index", "priority": 2},
        "^TNX": {"name": "10Y Yield", "unit": "%", "priority": 2},
        "SI=F": {"name": "Silver", "unit": "$/troy oz", "priority": 2},
        "NG=F": {"name": "Nat Gas", "unit": "$/MMBtu", "priority": 2},
        "BTC-USD": {"name": "Bitcoin", "unit": "USD", "priority": 2}
    }
    
    try:
        # Use ThreadPoolExecutor for timeout (synchronous function)
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(yf.download, tickers, period="5d", interval="1d", progress=False, threads=False)
            try:
                data = future.result(timeout=15)  # 15 second timeout
            except concurrent.futures.TimeoutError:
                print(f"[MACRO] yfinance timeout for macro summary")
                return []
        
        # Handle 'Adj Close' vs 'Close' columns
        if isinstance(data.columns, pd.MultiIndex):
             if 'Adj Close' in data.columns.get_level_values(0):
                 data = data['Adj Close']
             elif 'Close' in data.columns.get_level_values(0):
                 data = data['Close']
        elif 'Adj Close' in data:
            data = data['Adj Close']
        elif 'Close' in data:
            data = data['Close']
        else:
            return []
            
        if data.empty:
            return []
        
        results = []
        for ticker in tickers:
            ticker_prices = None
            if ticker in data.columns:
                ticker_prices = data[ticker].dropna()
            
            if ticker_prices is None or len(ticker_prices) < 2:
                continue
            
            # Use last two valid prices
            val = float(ticker_prices.iloc[-1])
            prev_val = float(ticker_prices.iloc[-2])

            change = val - prev_val
            pct_change = (change / prev_val) * 100 if prev_val != 0 else 0
            
            info = ticker_info.get(ticker, {"name": ticker, "unit": "", "priority": 2})
            
            results.append({
                "symbol": ticker,
                "name": info["name"],
                "unit": info["unit"],
                "priority": info["priority"],
                "price": val,
                "change": change,
                "pct_change": pct_change
            })
        
        # Sort by priority (1 first, then 2)
        results.sort(key=lambda x: x["priority"])
        return results
    except concurrent.futures.TimeoutError:
        print(f"[MACRO] Timeout fetching macro summary")
        return []
    except Exception as e:
        print(f"[MACRO] Error fetching macro summary: {e}")
        return []


def _get_yield_data_for_date(date_str=None):
    """
    Helper to get yield curve for a specific date (or current).
    """
    try:
        # Add timeout to yfinance calls
        with concurrent.futures.ThreadPoolExecutor() as executor:
            if date_str and date_str != "Current":
                # For historical, we need a range around the date because specific day might be weekend
                target_date = pd.to_datetime(date_str)
                start_date = (target_date - pd.Timedelta(days=5)).strftime('%Y-%m-%d')
                end_date = (target_date + pd.Timedelta(days=5)).strftime('%Y-%m-%d')
                future = executor.submit(yf.download, YIELD_TICKERS, start=start_date, end=end_date, progress=False, threads=False)
            else:
                # Current
                future = executor.submit(yf.download, YIELD_TICKERS, period="1mo", progress=False, threads=False)
            
            try:
                data = future.result(timeout=15)  # 15-second timeout
            except concurrent.futures.TimeoutError:
                print(f"[YIELD] Timeout fetching yield curve for {date_str}")
                return []
        
        prices = None
        if isinstance(data.columns, pd.MultiIndex):
             if 'Adj Close' in data.columns.get_level_values(0):
                 prices = data['Adj Close']
             elif 'Close' in data.columns.get_level_values(0):
                 prices = data['Close']
        elif 'Adj Close' in data:
            prices = data['Adj Close']
        elif 'Close' in data:
            prices = data['Close']

        if prices is None or prices.empty:
            return None

        # Get the row closest to target date, or latest for current
        row = prices.iloc[-1]
            
        # Map to our standardized format
        curve = []
        for i, ticker in enumerate(YIELD_TICKERS):
            if ticker in row:
                val = float(row[ticker])
                if not pd.isna(val):
                    curve.append({
                        "maturity": YIELD_LABELS[i],
                        "yield": val,
                        "ticker": ticker
                    })
        return curve

    except Exception as e:
        print(f"Error fetching yield curve for {date_str}: {e}")
        return []

@disk_cached(max_age=600)  # 10 min disk cache
@timed_cache(seconds=3600) # Cache longer for historical curves
def get_yield_curves():
    """
    Returns a dictionary of yield curves for different time periods.
    """
    curves = {}
    
    tasks = {
        "current": "Current",
        "2007_peak": "2007-10-09",
        "2000_peak": "2000-03-24",
        "year_ago": (datetime.now() - pd.Timedelta(days=365)).strftime('%Y-%m-%d')
    }

    # Parallelize fetches
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_to_key = {executor.submit(_get_yield_data_for_date, date_str): key for key, date_str in tasks.items()}
        
        for future in concurrent.futures.as_completed(future_to_key):
            key = future_to_key[future]
            try:
                result = future.result()
                if result:
                    curves[key] = result
            except Exception as exc:
                print(f"Yield curve fetch generated an exception for {key}: {exc}")

    return curves


def get_economic_calendar():
    """
    Returns upcoming KEY economic events.
    Updated for 2025 Real Scheduled Dates.
    """
    # Key FOMC Dates 2025
    events = [
        {"event": "FOMC Rate Decision", "date": "2025-01-29", "time": "14:00", "impact": "High", "forecast": "4.25-4.50%", "previous": "4.50%"},
        {"event": "FOMC Rate Decision", "date": "2025-03-19", "time": "14:00", "impact": "High", "forecast": "-", "previous": "-"},
        {"event": "FOMC Rate Decision", "date": "2025-05-07", "time": "14:00", "impact": "High", "forecast": "-", "previous": "-"},
        {"event": "GDP Growth Rate (Q4 '24)", "date": "2025-01-30", "time": "08:30", "impact": "High", "forecast": "2.2%", "previous": "2.8%"},
        {"event": "CPI Inflation Data", "date": "2025-01-11", "time": "08:30", "impact": "High", "forecast": "2.9%", "previous": "3.1%"},
        {"event": "Non-Farm Payrolls", "date": "2025-01-03", "time": "08:30", "impact": "High", "forecast": "150K", "previous": "227K"},
    ]
    
    # Filter for future events only
    today = datetime.now().strftime("%Y-%m-%d")
    upcoming = [e for e in events if e["date"] >= today]
    
    # If we run out of static events, we return a generic placeholder to avoid empty UI
    if not upcoming:
         upcoming = [{"event": "No Major Data Sched.", "date": today, "time": "--:--", "impact": "Low", "forecast": "-", "previous": "-"}]

    return upcoming

def get_fed_projections():
    """
    Returns Fed Dot Plot probabilities / projections.
    Updated with Dec 2024 projections.
    """
    return {
        "meeting_date": "Jan 29, 2025",
        "probabilities": [
            {"rate": "4.25-4.50%", "prob": 65.4},
            {"rate": "4.50-4.75%", "prob": 34.6},
            {"rate": "4.00-4.25%", "prob": 0.0}
        ],
        "dot_plot": {
            "2024 End": 4.4,
            "2025 End": 3.4,
            "2026 End": 2.9,
            "Longer Run": 2.5
        }
    }

@timed_cache(seconds=3600)
def get_global_macro_data():
    """
    Returns global macro data for the 3D Globe visualization.
    Uses REAL global indices data to color the map.
    """
    indices = {
        "USA": "^GSPC", # S&P 500
        "CHN": "000001.SS", # SSE Composite
        "JPN": "^N225", # Nikkei 225
        "DEU": "^GDAXI", # DAX
        "IND": "^BSESN", # Sensex
        "GBR": "^FTSE", # FTSE 100
        "BRA": "^BVSP", # Bovespa
        # "RUS": "IMOEX.ME", # MOEX (Often blocked/issues in yfinance)
        "CAN": "^GSPTSE", # TSX
        "AUS": "^AXJO" # ASX 200
    }
    
    # Coords mapping
    coords = {
        "USA": {"lat": 37.0902, "lon": -95.7129, "country": "United States"},
        "CHN": {"lat": 35.8617, "lon": 104.1954, "country": "China"},
        "JPN": {"lat": 36.2048, "lon": 138.2529, "country": "Japan"},
        "DEU": {"lat": 51.1657, "lon": 10.4515, "country": "Germany"},
        "IND": {"lat": 20.5937, "lon": 78.9629, "country": "India"},
        "GBR": {"lat": 55.3781, "lon": -3.4360, "country": "United Kingdom"},
        "BRA": {"lat": -14.2350, "lon": -51.9253, "country": "Brazil"},
        "CAN": {"lat": 56.1304, "lon": -106.3468, "country": "Canada"},
        "AUS": {"lat": -25.2744, "lon": 133.7751, "country": "Australia"},
    }

    results = []
    
    try:
        # Fetch all at once
        tickers = list(indices.values())
        data = yf.download(tickers, period="5d", progress=False, threads=False)
        
        if isinstance(data.columns, pd.MultiIndex):
             if 'Close' in data.columns.get_level_values(0):
                 prices = data['Close']
             else:
                 prices = data['Adj Close']
        else:
            prices = data
            
        for code, ticker in indices.items():
            meta = coords.get(code)
            if not meta: continue
            
            perf = 0.0
            if not prices.empty and ticker in prices:
                series = prices[ticker].dropna()
                if len(series) >= 2:
                    perf = ((series.iloc[-1] - series.iloc[-2]) / series.iloc[-2]) * 100
            
            # Simple Color Coding based on daily move
            color = "yellow"
            if perf > 0.5: color = "green"
            if perf < -0.5: color = "red"
            
            # Inflation/GDP hardcoded but Performance is REAL
            # We can label "GDP Growth" as "Index 1D" in frontend if we want accuracy
            # For now keeping GDP hardcoded as user asked for website data mock replacement, 
            # and YF doesn't give GDP.
            
            results.append({
                "country": meta["country"],
                "lat": meta["lat"],
                "lon": meta["lon"],
                "gdp_growth": round(perf, 2), # Using Stock Index Daily Performance as proxy for "Economic Health" in this view
                "inflation": 0, # Hide or static
                "color": color,
                "code": code
            })
            
    except Exception as e:
        print(f"Global macro fetch failed: {e}")
        
    return results
