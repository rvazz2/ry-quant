import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

def debug_strat():
    print("--- Debugging Strategy Data (IVE vs IKE) ---")
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30) # Just check recent
    tickers = ["IVW", "IVE", "SPY"] # Swapped IKE for IVE
    
    print(f"Downloading {tickers}...")
    try:
        data = yf.download(tickers, start=start_date, end=end_date, progress=False, threads=False, auto_adjust=False)
        
        if isinstance(data.columns, pd.MultiIndex):
             if 'Adj Close' in data.columns.get_level_values(0):
                 data = data['Adj Close']
        
        print("Data Head:")
        print(data.head())
        
        data = data.dropna()
        print(f"After dropna: {data.shape}")
        
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    debug_strat()
