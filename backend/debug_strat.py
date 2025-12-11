import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

def debug_strat():
    print("--- Debugging Strategy Data ---")
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    tickers = ["IVW", "IKE", "SPY"]
    
    print(f"Downloading {tickers} from {start_date} to {end_date}...")
    try:
        data = yf.download(tickers, start=start_date, end=end_date, progress=False, threads=False, auto_adjust=False)
        print("Download complete.")
        print(f"Data Shape: {data.shape}")
        print(f"Columns: {data.columns}")
        
        if data.empty:
            print("DATA IS EMPTY.")
            return

        print("Head:")
        print(data.head())
        
        # Test extraction logic
        if isinstance(data.columns, pd.MultiIndex):
             print("MultiIndex detected.")
             if 'Adj Close' in data.columns.get_level_values(0):
                 data = data['Adj Close']
                 print("Selected Adj Close")
             elif 'Close' in data.columns.get_level_values(0):
                 data = data['Close']
                 print("Selected Close")
        
        print("Data after selection:")
        print(data.head())
        
        data = data.dropna()
        print(f"After dropna: {data.shape}")
        
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    debug_strat()
