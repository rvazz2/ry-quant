import yfinance as yf
import pandas as pd
import asyncio
import numpy as np

def run_sma_backtest(ticker, short_window, long_window, period="2y"):
    data = yf.download(ticker, period=period)
    df = data[['Adj Close']].copy() if 'Adj Close' in data else data[['Close']].copy() if 'Close' in data else None
    if df is None or df.empty:
        raise ValueError("No price data found for ticker")
    df.columns = ['Close']
    
    # Vectorized Calculations
    df['Short_SMA'] = df['Close'].rolling(window=short_window).mean()
    df['Long_SMA'] = df['Close'].rolling(window=long_window).mean()
    df['Signal'] = np.where(df['Short_SMA'] > df['Long_SMA'], 1.0, 0.0)
    df['Position'] = df['Signal'].diff()
    df['Strategy_Returns'] = df['Close'].pct_change() * df['Signal'].shift(1)
    df['Cumulative_Strategy'] = (1 + df['Strategy_Returns']).cumprod()
    
    # Metrics
    total_return = df['Cumulative_Strategy'].iloc[-1] - 1
    max_drawdown = ((df['Cumulative_Strategy'] - df['Cumulative_Strategy'].cummax()) / df['Cumulative_Strategy'].cummax()).min()
    wins, losses = len(df[df['Strategy_Returns'] > 0]), len(df[df['Strategy_Returns'] < 0])
    
    # Data Preparation
    df['date'] = df.index.strftime('%Y-%m-%d')
    chart_data = df[['date', 'Close', 'Short_SMA', 'Long_SMA']].where(pd.notnull(df), None).to_dict('records')
    # Add signal manually since it's sparse
    # Optimization: Faster signal mapping
    signal_map = {1.0: "Buy", -1.0: "Sell"}
    
    # 3. Vectorized Trades List (No iterrows)
    trades_df = df[df['Position'] != 0].copy()
    trades_df['type'] = trades_df['Position'].map(signal_map)
    # Filter only valid Buy/Sell signals (exclude 0 if any leaked)
    trades_df = trades_df[trades_df['type'].notna()]
    
    trades = trades_df.reset_index()[['date', 'type', 'Close']].rename(columns={'Close': 'price'}).to_dict('records')
              
    monthly_returns = df['Strategy_Returns'].resample('ME').apply(lambda x: (1 + x).prod() - 1)
    
    # Sanitize metrics for JSON (replace NaN/Inf with None or 0)
    def clean_metric(val):
        if pd.isna(val) or np.isinf(val):
            return 0.0
        return float(val)

    return {
        "metrics": {
            "total_return": clean_metric(total_return),
            "max_drawdown": clean_metric(max_drawdown),
            "win_loss_ratio": clean_metric(wins / losses if losses > 0 else 0)
        },
        "chart_data": chart_data,
        "trades": trades,
        "monthly_returns": [{"date": i.strftime('%Y-%m'), "return": clean_metric(v)} for i, v in monthly_returns.items()]
    }
