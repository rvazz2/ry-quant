import yfinance as yf
import pandas as pd

sector_etfs = {
    "XLE": "Energy",
    "XLB": "Materials"
}
tickers = list(sector_etfs.keys())

print("Downloading data...")
data = yf.download(tickers, period="5d", interval="1d", progress=False)
print("\nRaw Data Columns:", data.columns)
print("\nRaw Data Head:\n", data.head())
print("\nRaw Data Tail:\n", data.tail())

if isinstance(data.columns, pd.MultiIndex):
    if 'Adj Close' in data.columns.get_level_values(0):
        data = data['Adj Close']
    elif 'Close' in data.columns.get_level_values(0):
        data = data['Close']

print("\nProcessed Data Tail:\n", data.tail())

latest = data.iloc[-1]
prev = data.iloc[-2]
print("\nLatest:\n", latest)
print("\nPrev:\n", prev)

pct_change = ((latest - prev) / prev) * 100
print("\nChange:\n", pct_change)
