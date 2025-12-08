import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import yfinance as yf
import pandas as pd

# Test fetching the exact tickers from macro.py
tickers = ["GC=F", "CL=F", "HG=F", "^VIX", "DX-Y.NYB", "^TNX", "SI=F", "NG=F", "BTC-USD"]

print("Fetching data for:", tickers)
print("=" * 80)

try:
    data = yf.download(tickers, period="5d", interval="1d", threads=False)
    
    if 'Close' in data:
        prices = data['Close']
    else:
        print("No Close column found")
        sys.exit(1)
    
    print(f"\nAll price data (last 5 days):")
    print(prices)
    
    print("\n" + "=" * 80)
    print("Finding last valid price for each ticker:")
    print("=" * 80)
    
    for ticker in tickers:
        if ticker in prices.columns:
            # Get last valid (non-NaN) value
            valid_prices = prices[ticker].dropna()
            if len(valid_prices) > 0:
                last_valid = valid_prices.iloc[-1]
                last_valid_date = valid_prices.index[-1]
                print(f"{ticker:12} ${last_valid:10.2f}  (from {last_valid_date.strftime('%Y-%m-%d')})")
            else:
                print(f"{ticker:12} NO VALID DATA")
        else:
            print(f"{ticker:12} NOT FOUND")
            
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
