import yfinance as yf
import pandas as pd
import asyncio
from datetime import datetime
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
    Returns upcoming economic events.
    Generates dynamic "Upcoming" dates relative to today to ensure the UI 
    always looks active and relevant for the demo.
    """
    import random
    from datetime import timedelta
    
    today = datetime.now()
    
    # Base event templates
    events = [
        {"event": "Fed Interest Rate Decision", "impact": "High", "forecast": "5.25%", "previous": "5.25%", "offset_days_range": (5, 20)},
        {"event": "CPI Inflation Rate (YoY)", "impact": "High", "forecast": "3.1%", "previous": "3.2%", "offset_days_range": (2, 10)},
        {"event": "Non-Farm Payrolls", "impact": "High", "forecast": "180K", "previous": "150K", "offset_days_range": (1, 15)},
        {"event": "GDP Growth Rate (QoQ)", "impact": "Medium", "forecast": "2.1%", "previous": "2.1%", "offset_days_range": (10, 30)},
        {"event": "Retail Sales (MoM)", "impact": "Medium", "forecast": "0.3%", "previous": "0.2%", "offset_days_range": (3, 12)},
        {"event": "PPI (MoM)", "impact": "Medium", "forecast": "0.1%", "previous": "0.1%", "offset_days_range": (4, 14)},
        {"event": "Initial Jobless Claims", "impact": "Low", "forecast": "210K", "previous": "212K", "offset_days_range": (1, 7)},
        {"event": "Consumer Confidence", "impact": "Medium", "forecast": "102.0", "previous": "101.5", "offset_days_range": (5, 15)}
    ]
    
    calendar = []
    
    for item in events:
        # Generate a random future date within the range
        min_offset, max_offset = item["offset_days_range"]
        offset = random.randint(min_offset, max_offset)
        event_date = today + timedelta(days=offset)
        
        # Generate random time between 08:30 and 14:00
        hour = random.choice([8, 9, 10, 14])
        minute = random.choice(["00", "30"])
        time_str = f"{hour:02d}:{minute}"
        
        calendar.append({
            "event": item["event"],
            "date": event_date.strftime("%Y-%m-%d"),
            "time": time_str,
            "impact": item["impact"],
            "forecast": item["forecast"],
            "previous": item["previous"]
        })
        
    # Sort by date
    calendar.sort(key=lambda x: x["date"])
    
    return calendar

def get_fed_projections():
    """
    Returns Fed Dot Plot probabilities / projections.
    """
    # Mock data representing implied probabilities for next meeting
    return {
        "meeting_date": "Dec 14, 2025",
        "probabilities": [
            {"rate": "5.00-5.25%", "prob": 15.5},
            {"rate": "5.25-5.50%", "prob": 78.4},
            {"rate": "5.50-5.75%", "prob": 6.1}
        ],
        "dot_plot": {
            "2025": 5.4,
            "2026": 4.6,
            "2027": 3.8,
            "Longer Run": 2.5
        }
    }

def get_global_macro_data():
    """
    Returns global macro data for the 3D Globe visualization.
    Positions are approximate Lat/Lon.
    """
    return [
        {"country": "United States", "lat": 37.0902, "lon": -95.7129, "gdp_growth": 2.5, "inflation": 3.4, "color": "green", "code": "USA"},
        {"country": "China", "lat": 35.8617, "lon": 104.1954, "gdp_growth": 5.2, "inflation": 0.7, "color": "green", "code": "CHN"},
        {"country": "Japan", "lat": 36.2048, "lon": 138.2529, "gdp_growth": 1.9, "inflation": 2.2, "color": "yellow", "code": "JPN"},
        {"country": "Germany", "lat": 51.1657, "lon": 10.4515, "gdp_growth": -0.3, "inflation": 3.8, "color": "red", "code": "DEU"},
        {"country": "India", "lat": 20.5937, "lon": 78.9629, "gdp_growth": 7.3, "inflation": 5.1, "color": "green", "code": "IND"},
        {"country": "United Kingdom", "lat": 55.3781, "lon": -3.4360, "gdp_growth": 0.5, "inflation": 4.0, "color": "orange", "code": "GBR"},
        {"country": "Brazil", "lat": -14.2350, "lon": -51.9253, "gdp_growth": 3.1, "inflation": 4.5, "color": "green", "code": "BRA"},
        {"country": "Russia", "lat": 61.5240, "lon": 105.3188, "gdp_growth": 1.1, "inflation": 7.4, "color": "red", "code": "RUS"},
        {"country": "Canada", "lat": 56.1304, "lon": -106.3468, "gdp_growth": 1.2, "inflation": 2.9, "color": "yellow", "code": "CAN"},
        {"country": "Australia", "lat": -25.2744, "lon": 133.7751, "gdp_growth": 1.5, "inflation": 3.4, "color": "yellow", "code": "AUS"},
    ]
