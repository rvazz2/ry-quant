import numpy as np
from scipy.stats import norm
from typing import Dict, List, Any
import yfinance as yf
import pandas as pd
from services.market_data import _get_ticker_details_sync

from cache import timed_cache

def black_scholes_call(S, K, T, r, sigma):
    """Calculate Black-Scholes Call Price and Gamma"""
    if T <= 0:
        return max(S - K, 0), 0
    
    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    
    price = S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
    gamma = norm.pdf(d1) / (S * sigma * np.sqrt(T))
    
    return price, gamma

@timed_cache(seconds=3600) # Cache for 1 hour
def get_vol_surface(ticker: str, r: float = 0.05, sigma: float = 0.2):
    """
    Generates data for a 3D Surface Plot of Option Prices using Vectorized NumPy operations.
    X: Strike Price (K)
    Y: Time to Maturity (T)
    Z: Option Price (Call) - 2D Array
    Color: Gamma (Risk) - 2D Array
    """
    # 1. Get Real Spot Price
    details = _get_ticker_details_sync(ticker)
    
    spot = None
    if details:
        # Try multiple keys for price
        for key in ["price", "close", "currentPrice", "regularMarketPrice"]:
            if key in details and details[key]:
                spot = float(details[key])
                break
    
    if spot is None:
        try:
            t = yf.Ticker(ticker)
            # Use 'fast_info' if available for faster latest price
            if hasattr(t, 'fast_info') and 'lastPrice' in t.fast_info:
                spot = float(t.fast_info['lastPrice'])
            else:
                hist = t.history(period="1d")
                if not hist.empty:
                    spot = float(hist["Close"].iloc[-1])
        except Exception:
            pass
            
    if spot is None:
         print(f"Warning: Could not get spot price for {ticker}, defaulting to 100.0")
         spot = 100.0
    
    # Strikes: 80% to 120% of Spot (20 steps)
    strikes = np.linspace(spot * 0.8, spot * 1.2, 20)
    
    # Time: 1 week to 1 year (20 steps)
    times = np.linspace(1/52, 1.0, 20)
    
    # Vectorized Grid Generation
    # T_grid: (20, 20) where each row is the same T
    # K_grid: (20, 20) where each col is the same K
    # We want Z[i, j] corresponds to times[i] and strikes[j]
    T_grid, K_grid = np.meshgrid(times, strikes, indexing='ij')
    
    # Black-Scholes Vectorized
    # d1 = (ln(S/K) + (r + 0.5*sigma^2)*T) / (sigma*sqrt(T))
    # Note: T is never 0 in our linspace (starts at 1/52)
    
    d1 = (np.log(spot / K_grid) + (r + 0.5 * sigma ** 2) * T_grid) / (sigma * np.sqrt(T_grid))
    d2 = d1 - sigma * np.sqrt(T_grid)
    
    # CDF and PDF
    norm_cdf_d1 = norm.cdf(d1)
    norm_cdf_d2 = norm.cdf(d2)
    norm_pdf_d1 = norm.pdf(d1)
    
    # Call Price = S * N(d1) - K * e^(-rT) * N(d2)
    prices = spot * norm_cdf_d1 - K_grid * np.exp(-r * T_grid) * norm_cdf_d2
    
    # Gamma = N'(d1) / (S * sigma * sqrt(T))
    gammas = norm_pdf_d1 / (spot * sigma * np.sqrt(T_grid))
    
    return {
        "x": strikes.tolist(),
        "y": times.tolist(), # Years
        "z": prices.tolist(), # 2D array -> List of Lists
        "gamma": gammas.tolist(), # 2D array -> List of Lists
        "ticker": ticker,
        "spot": spot
    }

@timed_cache(seconds=3600)
def analyze_pairs(ticker1: str, ticker2: str, period: str = "1y"):
    """
    Analyzes two assets for Statistical Arbitrage opportunities (Pairs Trading).
    Calculates the Spread, Z-Score, and Correlation.
    """
    # 1. Fetch Data
    t1 = yf.Ticker(ticker1)
    t2 = yf.Ticker(ticker2)
    
    # Download close prices
    df1 = t1.history(period=period)['Close']
    df2 = t2.history(period=period)['Close']
    
    if df1.empty or df2.empty:
        return None
    
    # Align dates
    df = pd.concat([df1, df2], axis=1).dropna()
    df.columns = [ticker1, ticker2]
    
    # 2. Calculate Spread (Use Ratio for simplicity: Price1 / Price2)
    # A true hedge ratio (OLS) is better, but ratio is robust for a dashboard visualizer.
    df['Spread'] = df[ticker1] / df[ticker2]
    
    # 3. Calculate Z-Score
    # Lookback window for rolling statistics (e.g., 30 days) to make it dynamic
    window = 30
    df['Mean'] = df['Spread'].rolling(window=window).mean()
    df['Std'] = df['Spread'].rolling(window=window).std()
    df['Z_Score'] = (df['Spread'] - df['Mean']) / df['Std']
    
    # 4. Correlation (Rolling 30d)
    df['Correlation'] = df[ticker1].rolling(window=window).corr(df[ticker2])
    
    # Drop NaN
    df = df.dropna()
    
    # 5. Format for Chart
    # 5. Format for Chart (Vectorized)
    df_reset = df.reset_index()
    df_reset['date'] = df_reset.index.strftime('%Y-%m-%d') # Index is likely the date from concat
    
    # Rename for frontend
    rename_map = {
        'Spread': 'spread',
        'Z_Score': 'z_score',
        'Correlation': 'correlation',
        ticker1: 'price1',
        ticker2: 'price2'
    }
    
    # Fill NaNs
    df_reset['Correlation'] = df_reset['Correlation'].fillna(0.0)
    
    chart_data = df_reset[['date', 'Spread', 'Z_Score', 'Correlation', ticker1, ticker2]].rename(columns=rename_map).to_dict('records')
        
    # Current Signal
    if not chart_data:
        return None
        
    last_z = chart_data[-1]['z_score']
    signal = "NEUTRAL"
    if last_z > 2.0:
        signal = f"SELL {ticker1} / BUY {ticker2}" # Spread is too high, implies T1 expensive vs T2
    elif last_z < -2.0:
        signal = f"BUY {ticker1} / SELL {ticker2}" # Spread is too low, implies T1 cheap vs T2
        
    return {
        "ticker1": ticker1,
        "ticker2": ticker2,
        "current_z_score": last_z,
        "current_correlation": chart_data[-1]['correlation'],
        "signal": signal,
        "series": chart_data
    }
