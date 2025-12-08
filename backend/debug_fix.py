import yfinance as yf

def check_data():
    # 1. Check Gold
    print("--- GOLD CHECK ---")
    gold = yf.Ticker("GC=F")
    hist = gold.history(period="5d")
    print(hist.tail())
    print(f"Current Info Price: {gold.info.get('regularMarketPrice')}")

    # 2. Check Apple Dividend
    print("\n--- AAPL DIVIDEND CHECK ---")
    aapl = yf.Ticker("AAPL")
    info = aapl.info
    print(f"Dividend Rate: {info.get('dividendRate')}")
    print(f"Dividend Yield: {info.get('dividendYield')}")
    
check_data()
