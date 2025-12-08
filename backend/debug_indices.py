import yfinance as yf
import pandas as pd

def test_indices():
    tickers = ["^GSPC", "^IXIC", "^DJI", "^RUT"]
    print(f"Testing tickers: {tickers}")
    
    try:
        data = yf.download(tickers, period="5d", interval="1d", progress=False)
        print("\nColumns found:", data.columns)
        
        if 'Adj Close' in data:
            closes = data['Adj Close']
        elif 'Close' in data:
            closes = data['Close']
        else:
            print("No Close data found!")
            return

        print("\nLatest Close Prices:")
        print(closes.iloc[-1])
        
        print("\nChecking for NaNs:")
        print(closes.isna().sum())

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_indices()
