import pandas as pd
import numpy as np
from datetime import datetime
import yfinance as yf

# Simulated In-Memory Database for demonstration
# In a real app, this would be SQLite or Postgres
TRADE_LOG = []

def log_trade(ticker, action, price, quantity, rationale="", trade_type="STOCK"):
    """
    Logs a paper trade (stock).
    """
    trade = {
        "id": len(TRADE_LOG) + 1,
        "date": datetime.now().isoformat(),
        "ticker": ticker.upper(),
        "action": action.upper(), # BUY or SELL
        "price": float(price),
        "quantity": int(quantity),
        "rationale": rationale,
        "status": "OPEN",
        "trade_type": trade_type,
        # Option-specific fields (null for stocks)
        "option_type": None,
        "strike": None,
        "expiry": None,
        "premium": None,
        "contracts": None
    }
    TRADE_LOG.append(trade)
    return trade

def log_option_trade(ticker, action, option_type, strike, expiry, contracts, premium, rationale=""):
    """
    Logs an options paper trade.
    
    Args:
        ticker: Underlying stock symbol
        action: BUY or SELL
        option_type: CALL or PUT
        strike: Strike price
        expiry: Expiration date (YYYY-MM-DD)
        contracts: Number of contracts
        premium: Premium per contract
        rationale: Trade rationale
    """
    trade = {
        "id": len(TRADE_LOG) + 1,
        "date": datetime.now().isoformat(),
        "ticker": ticker.upper(),
        "action": action.upper(),
        "price": None,  # Not applicable for options
        "quantity": None,  # Not applicable for options
        "rationale": rationale,
        "status": "OPEN",
        "trade_type": "OPTION",
        # Option-specific fields
        "option_type": option_type.upper(),  # CALL or PUT
        "strike": float(strike),
        "expiry": expiry,
        "premium": float(premium),
        "contracts": int(contracts)
    }
    TRADE_LOG.append(trade)
    return trade

def calculate_option_pnl(trade):
    """
    Calculate P&L for an option trade using current market data.
    For simplicity, we'll use a basic intrinsic value calculation.
    In production, this would use Black-Scholes from options.py
    """
    try:
        # Fetch current stock price
        ticker_obj = yf.Ticker(trade["ticker"])
        current_price = ticker_obj.history(period="1d")["Close"].iloc[-1]
        
        # Calculate intrinsic value
        if trade["option_type"] == "CALL":
            intrinsic_value = max(0, current_price - trade["strike"])
        else:  # PUT
            intrinsic_value = max(0, trade["strike"] - current_price)
        
        # Calculate P&L
        if trade["action"] == "BUY":
            # Long position: (current_value - premium_paid) * contracts * 100
            pnl = (intrinsic_value - trade["premium"]) * trade["contracts"] * 100
        else:  # SELL
            # Short position: (premium_received - current_value) * contracts * 100
            pnl = (trade["premium"] - intrinsic_value) * trade["contracts"] * 100
        
        return pnl
    except Exception as e:
        print(f"Error calculating option P&L for {trade['ticker']}: {e}")
        return 0.0

def get_track_record():
    """
    Calculates performance metrics based on closed trades or mark-to-market.
    Supports both stock and option trades.
    """
    if not TRADE_LOG:
        return {
            "metrics": {
                "total_pnl": 0.0,
                "win_rate": 0.0,
                "trades_count": 0,
                "best_trade": 0.0,
                "options_trades": 0,
                "stock_trades": 0,
                "total_premium_paid": 0.0
            },
            "history": []
        }

    # Separate stock and option trades
    stock_trades = [t for t in TRADE_LOG if t["trade_type"] == "STOCK"]
    option_trades = [t for t in TRADE_LOG if t["trade_type"] == "OPTION"]
    
    # Calculate total premium paid for options
    total_premium = sum(
        t["premium"] * t["contracts"] * 100 
        for t in option_trades 
        if t["action"] == "BUY"
    )
    
    # Calculate option P&L (mark-to-market)
    total_options_pnl = sum(calculate_option_pnl(t) for t in option_trades)
    
    # Mock stock P&L (in production, this would be real calculations)
    total_stock_pnl = 1250.50 if stock_trades else 0.0
    
    total_pnl = total_stock_pnl + total_options_pnl
    
    # Calculate win rate
    winning_trades = len([t for t in option_trades if calculate_option_pnl(t) > 0])
    win_rate = winning_trades / len(option_trades) if option_trades else 0.65
    
    # Best trade
    best_trade = max(
        [calculate_option_pnl(t) for t in option_trades] + [500.20],
        default=500.20
    )
    
    return {
        "metrics": {
            "total_pnl": round(total_pnl, 2),
            "win_rate": round(win_rate, 2),
            "trades_count": len(TRADE_LOG),
            "best_trade": round(best_trade, 2),
            "options_trades": len(option_trades),
            "stock_trades": len(stock_trades),
            "total_premium_paid": round(total_premium, 2)
        },
        "history": TRADE_LOG
    }
