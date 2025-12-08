import numpy as np
from scipy.stats import norm
import yfinance as yf
from cache import timed_cache
import pandas as pd

def black_scholes(S, K, T, r, sigma, option_type="call"):
    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    if option_type == "call":
        return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
    return K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)

def calculate_greeks(S, K, T, r, sigma):
    d1 = (np.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    pdf_d1 = norm.pdf(d1)
    cdf_d1, cdf_d2, cdf_neg_d2 = norm.cdf(d1), norm.cdf(d2), norm.cdf(-d2)
    
    return {
        "delta": {"call": cdf_d1, "put": cdf_d1 - 1},
        "gamma": pdf_d1 / (S * sigma * np.sqrt(T)),
        "vega": S * pdf_d1 * np.sqrt(T) / 100,
        "theta": {
            "call": (- (S * pdf_d1 * sigma) / (2 * np.sqrt(T)) - r * K * np.exp(-r * T) * cdf_d2) / 365,
            "put": (- (S * pdf_d1 * sigma) / (2 * np.sqrt(T)) + r * K * np.exp(-r * T) * cdf_neg_d2) / 365
        },
        "rho": {
            "call": K * T * np.exp(-r * T) * cdf_d2 / 100,
            "put": -K * T * np.exp(-r * T) * cdf_neg_d2 / 100
        }
    }

def calculate_payoff(S, K, call_price, put_price):
    prices = np.linspace(S * 0.5, S * 1.5, 50)
    call_pl = np.maximum(prices - K, 0) - call_price
    put_pl = np.maximum(K - prices, 0) - put_price
    return [{"price": p, "call_pl": c, "put_pl": pu} for p, c, pu in zip(prices, call_pl, put_pl)]

def calculate_option_prices(S, K, T, r, sigma):
    return {
        "call_price": black_scholes(S, K, T, r, sigma, "call"),
        "put_price": black_scholes(S, K, T, r, sigma, "put"),
        "greeks": calculate_greeks(S, K, T, r, sigma),
        "payoff": calculate_payoff(S, K, black_scholes(S, K, T, r, sigma, "call"), black_scholes(S, K, T, r, sigma, "put"))
    }

@timed_cache(seconds=3600)
def get_option_dates(ticker: str):
    """
    Fetches available option expiration dates for a ticker.
    """
    try:
        if not ticker:
            return []
            
        stock = yf.Ticker(ticker)
        # Force a fetch to ensure data is loaded
        dates = list(stock.options)
        return dates
    except Exception as e:
        print(f"Error fetching option dates for {ticker}: {e}")
        # Return empty list instead of crashing
        return []

@timed_cache(seconds=300)
def get_option_chain(ticker: str, date: str):
    """
    Fetches option chain for a specific date.
    """
    try:
        stock = yf.Ticker(ticker)
        chain = stock.option_chain(date)
        
        # Process Calls
        calls = []
        for _, row in chain.calls.iterrows():
            calls.append({
                "strike": row['strike'],
                "bid": row['bid'],
                "ask": row['ask'],
                "volume": row['volume'] if not pd.isna(row['volume']) else 0,
                "impliedVolatility": row['impliedVolatility'],
                "inTheMoney": row['inTheMoney']
            })
            
        # Process Puts
        puts = []
        for _, row in chain.puts.iterrows():
            puts.append({
                "strike": row['strike'],
                "bid": row['bid'],
                "ask": row['ask'],
                "volume": row['volume'] if not pd.isna(row['volume']) else 0,
                "impliedVolatility": row['impliedVolatility'],
                "inTheMoney": row['inTheMoney']
            })
            
        return {"calls": calls, "puts": puts}
    except Exception as e:
        print(f"Error fetching option chain for {ticker} on {date}: {e}")
        return None
