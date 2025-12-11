import yfinance as yf
import pandas as pd

def test_trending():
    print("--- Testing Trending ---")
    # yfinance doesn't have a direct 'trending' method officially documented in the simple API, 
    # but let's check if we can get active tickers or similar.
    # Actually, let's try to get some major indices to proxies global macro
    try:
        # Global Indices
        indices = ["^GSPC", "^DJI", "^IXIC", "^FTSE", "^GDAXI", "^N225", "000001.SS", "^HSI", "^BVSP", "^MXX"]
        data = yf.download(indices, period="1d", progress=False)
        print("Global Indices Data Fetched:")
        print(data.iloc[-1] if not data.empty else "No data")
    except Exception as e:
        print(f"Global indices failed: {e}")

def test_calendar():
    print("\n--- Testing Calendar ---")
    try:
        # Ticker calendar (earnings, etc)
        msft = yf.Ticker("MSFT")
        print("MSFT Calendar:")
        print(msft.calendar)
        
        # General economic calendar is not in yfinance standard. 
        # We might need to stick to hardcoded recent for now or find another source.
    except Exception as e:
        print(f"Calendar failed: {e}")

def test_mutual_fund_holders():
    print("\n--- Testing Holders (Superinvestor Proxy) ---")
    try:
        # We can look at major institutional holders of popular stocks?
        # Or look at a specific Berkshire ticker?
        brk = yf.Ticker("BRK-B")
        # format might be different
        print("BRK-B Institutional Holders:")
        print(brk.institutional_holders)
    except Exception as e:
        print(f"Holders failed: {e}")

if __name__ == "__main__":
    test_trending()
    test_calendar()
    test_mutual_fund_holders()
