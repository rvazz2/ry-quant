import pickle
import time
import os

CACHE_FILE = "market_cache.pkl"

def seed_cache():
    # Placeholder data that looks real
    market_overview = [
        {"symbol": "^GSPC", "name": "S&P 500", "price": 6050.25, "change": 0.45},
        {"symbol": "^IXIC", "name": "NASDAQ", "price": 19850.10, "change": 0.82},
        {"symbol": "^DJI", "name": "Dow Jones", "price": 44200.50, "change": 0.15},
        {"symbol": "^RUT", "name": "Russell 2000", "price": 2405.80, "change": -0.22}
    ]
    
    sector_performance = [
        {"sector": "Technology", "ticker": "XLK", "change": 1.25},
        {"sector": "Financials", "ticker": "XLF", "change": 0.45},
        {"sector": "Health Care", "ticker": "XLV", "change": -0.15},
        {"sector": "Consumer Discretionary", "ticker": "XLY", "change": 0.95},
        {"sector": "Industrials", "ticker": "XLI", "change": 0.30},
        {"sector": "Energy", "ticker": "XLE", "change": -0.55},
        {"sector": "Consumer Staples", "ticker": "XLP", "change": 0.10},
        {"sector": "Materials", "ticker": "XLB", "change": 0.25},
        {"sector": "Utilities", "ticker": "XLU", "change": -0.10},
        {"sector": "Real Estate", "ticker": "XLRE", "change": -0.45},
        {"sector": "Communication Services", "ticker": "XLC", "change": 0.85}
    ]

    # Structure: _mem_cache[key] = (timestamp, data)
    # Keys must match f"{func.__name__}:{args}:{kwargs}"
    
    # Current time
    now = time.time()
    
    cache_data = {
        "get_market_overview:():{}": (now, market_overview),
        "get_sector_performance:():{}": (now, sector_performance)
    }
    
    # Write to disk
    try:
        with open(CACHE_FILE, "wb") as f:
            pickle.dump(cache_data, f)
        print(f"Successfully seeded {CACHE_FILE} with instant data!")
    except Exception as e:
        print(f"Error seeding cache: {e}")

if __name__ == "__main__":
    seed_cache()
