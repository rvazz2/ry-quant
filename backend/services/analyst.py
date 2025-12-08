import pandas as pd
import numpy as np
from datetime import datetime

# Simulated In-Memory Database for demonstration
# In a real app, this would be SQLite or Postgres
TRADE_LOG = []

def log_trade(ticker, action, price, quantity, rationale=""):
    """
    Logs a paper trade.
    """
    trade = {
        "id": len(TRADE_LOG) + 1,
        "date": datetime.now().isoformat(),
        "ticker": ticker.upper(),
        "action": action.upper(), # BUY or SELL
        "price": float(price),
        "quantity": int(quantity),
        "rationale": rationale,
        "status": "OPEN"
    }
    TRADE_LOG.append(trade)
    return trade

def get_track_record():
    """
    Calculates performance metrics based on closed trades or mark-to-market.
    For MVP, we'll just return the log and some dummy metrics.
    """
    if not TRADE_LOG:
        return {
            "metrics": {
                "total_pnl": 0.0,
                "win_rate": 0.0,
                "trades_count": 0,
                "best_trade": 0.0
            },
            "history": []
        }

    # Simple mock logic for metrics
    # In reality, you'd match Buy/Sells to calculate realized PnL
    df = pd.DataFrame(TRADE_LOG)
    
    return {
        "metrics": {
            "total_pnl": 1250.50, # Mock value
            "win_rate": 0.65,     # Mock value
            "trades_count": len(TRADE_LOG),
            "best_trade": 500.20  # Mock value
        },
        "history": TRADE_LOG
    }
