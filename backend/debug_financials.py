import time
import sys
import os

# Add current directory to path so we can import services
sys.path.append(os.getcwd())

from services.research import get_financials

def test_ticker(ticker):
    print(f"Fetching financials for {ticker}...")
    start = time.time()
    try:
        data = get_financials(ticker)
        duration = time.time() - start
        
        if data:
            print(f"✅ Success for {ticker} in {duration:.2f}s")
            print(f"   Revenue: {data.get('revenue')}")
        else:
            print(f"❌ Failed for {ticker} (Returned None) in {duration:.2f}s")
            
    except Exception as e:
        duration = time.time() - start
        print(f"🔥 Exception for {ticker} in {duration:.2f}s: {e}")

if __name__ == "__main__":
    tickers = ["AAPL", "INVALID_TICKER_XYZ", ""]
    print("Starting Financials Benchmark...")
    for t in tickers:
        if t:
            test_ticker(t)
        else:
            print("Skipping empty ticker test (handled by frontend)")
    print("Done.")
