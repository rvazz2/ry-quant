import yfinance as yf
import pandas as pd

try:
    print("Testing Market Overview...")
    tickers = ["^GSPC", "^IXIC", "^DJI", "^RUT"]
    data = yf.download(tickers, period="5d", interval="1d")
    print("Market Data Shape:", data.shape)
    print("Market Data Columns:", data.columns)
    if 'Adj Close' in data:
        print("Adj Close found")
    else:
        print("Adj Close NOT found. Available:", data.columns)

    print("\nTesting Optimizer...")
    tickers = ["AAPL", "MSFT", "TSLA"]
    data = yf.download(tickers, start="2023-01-01", end="2023-02-01")
    print("Optimizer Data Shape:", data.shape)
    print("Optimizer Data Head:\n", data.head())
except Exception as e:
    print("Error:", e)
