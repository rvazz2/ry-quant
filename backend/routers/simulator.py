from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.store import get_user_data, set_user_data
from datetime import datetime

router = APIRouter(prefix="/api/simulator", tags=["simulator"])

# --- Models ---
class Position(BaseModel):
    symbol: str
    shares: int
    avgCost: float

class PortfolioState(BaseModel):
    cash: float
    holdings: List[Position]

class TradeRequest(BaseModel):
    symbol: str
    action: str  # "BUY" or "SELL"
    shares: int
    price: float # Frontend provides price to avoid slippage issues during sim

class TradeHistoryItem(BaseModel):
    timestamp: str
    action: str
    symbol: str
    shares: int
    price: float
    total: float

# --- Defaults ---
INITIAL_CASH = 100000.0

# --- Endpoints ---

@router.get("/portfolio")
async def get_portfolio():
    """Get current portfolio state."""
    portfolio = get_user_data("simulator_portfolio", [])
    cash = get_user_data("simulator_cash", INITIAL_CASH)
    return {"cash": cash, "portfolio": portfolio}

@router.get("/history")
async def get_trade_history():
    """Get trade history."""
    history = get_user_data("simulator_history", [])
    return {"history": history}

@router.get("/analytics")
async def get_analytics():
    """Get performance analytics."""
    portfolio = get_user_data("simulator_portfolio", [])
    history = get_user_data("simulator_history", [])
    cash = get_user_data("simulator_cash", INITIAL_CASH)
    
    # Calculate portfolio value
    portfolio_value = 0
    for pos in portfolio:
        current_price = pos.get("currentPrice", pos["avgCost"])
        if pos["shares"] > 0:
            portfolio_value += pos["shares"] * current_price
        else:
            # Short position liability: We owe these shares.
            # Equity impact = (Short Proceeds - Cost to Cover)
            # Short Proceeds were added to cash when sold.
            # Liability = abs(shares) * current_price
            # This is negative value in equity terms relative to cash held?
            # Actually simplest: Equity = Cash + AssetValue - Liabilities.
            # Longs are AssetValue. Shorts are Liabilities.
            # Total Equity = Cash - (abs(shares) * currentPrice)
            # BUT: In our system, when we Short, we ADDED to Cash.
            # So Cash is inflated. We must subtract current value of short to get Equity.
            portfolio_value -= abs(pos["shares"]) * current_price

    total_equity = cash + portfolio_value
    total_return = total_equity - INITIAL_CASH
    return_pct = (total_return / INITIAL_CASH) * 100
    
    # Calculate trade statistics
    total_trades = len(history)
    buy_trades = len([t for t in history if t["action"] == "BUY"])
    sell_trades = len([t for t in history if t["action"] == "SELL"])
    
    # Find best and worst performers
    best_performer = None
    worst_performer = None
    
    if portfolio:
        for pos in portfolio:
            current_price = pos.get("currentPrice", pos["avgCost"])
            
            if pos["shares"] > 0:
                # Long: (Current - Avg) / Avg
                gain_pct = ((current_price - pos["avgCost"]) / pos["avgCost"]) * 100
            else:
                # Short: (Avg - Current) / Avg
                # If we sold at 100 (Avg), now 80 (Current). Gain = 20. 20/100 = 20%
                gain_pct = ((pos["avgCost"] - current_price) / pos["avgCost"]) * 100
            
            if best_performer is None or gain_pct > best_performer["gain_pct"]:
                best_performer = {"symbol": pos["symbol"], "gain_pct": gain_pct}
            
            if worst_performer is None or gain_pct < worst_performer["gain_pct"]:
                worst_performer = {"symbol": pos["symbol"], "gain_pct": gain_pct}
    
    return {
        "total_equity": total_equity,
        "total_return": total_return,
        "return_pct": return_pct,
        "total_trades": total_trades,
        "buy_trades": buy_trades,
        "sell_trades": sell_trades,
        "best_performer": best_performer,
        "worst_performer": worst_performer
    }

@router.post("/reset")
async def reset_portfolio():
    """Reset simulation to initial state."""
    set_user_data("simulator_portfolio", [])
    set_user_data("simulator_cash", INITIAL_CASH)
    set_user_data("simulator_history", [])
    return {"cash": INITIAL_CASH, "portfolio": [], "history": []}

@router.post("/trade")
async def execute_trade(trade: TradeRequest):
    """Execute a buy or sell order."""
    portfolio = get_user_data("simulator_portfolio", [])
    cash = get_user_data("simulator_cash", INITIAL_CASH)
    history = get_user_data("simulator_history", [])
    
    # Validations
    if trade.shares <= 0:
        raise HTTPException(status_code=400, detail="Shares must be greater than 0")
    
    if trade.price <= 0:
        raise HTTPException(status_code=400, detail="Price must be greater than 0")
    
    symbol = trade.symbol.upper().strip()
    
    if not symbol or len(symbol) > 5:
        raise HTTPException(status_code=400, detail="Invalid ticker symbol")
    
    cost = trade.shares * trade.price
    transaction_total = 0

    if trade.action == "BUY":
        # Check if covering a short position (shares < 0)
        # OR buying long (shares >= 0)
        
        # We need to deduct cash in both cases.
        # If covering short, we are paying to buy back.
        # IF buying long, we are paying to acquire.
        
        if cost > cash:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient buying power. Cost ${cost:,.2f}, Available ${cash:,.2f}"
            )
        
        cash -= cost
        transaction_total = -cost
        
        # Update holdings
        found = False
        new_portfolio = []
        for pos in portfolio:
            if pos["symbol"] == symbol:
                current_shares = pos["shares"]
                
                if current_shares < 0:
                    # Covering Short
                    # E.g. -10 shares. Buying 5. New = -5.
                    # AvgCost logic for shorts:
                    # Usually AvgCost is the price we SOLD at.
                    # When we cover, we realize P&L. 
                    # But for simplicity in this MVP:
                    # Just adjust share count. Realized P&L flows into Cash balance automatically (Entry Cash - Exit Cash).
                    # Wait, if we just subtract Cost from Cash, and we had added Proceeds to Cash earlier, the net change in cash IS the P&L.
                    # So we just update the share count. 
                    # If we flip from Short to Long (e.g. -5 to +5), we need to handle that carefully?
                    # -5 shares. Buy 10. Result +5.
                    # Cost = 10 * Price. Cash -= Cost.
                    # Share count becomes +5. 
                    # Avg Cost for the NEW +5 position? 
                    # This is complex. Let's simplify: 
                    # If crossing zero, reset Avg Cost for the remainder.
                    
                    remaining = current_shares + trade.shares
                    if remaining == 0:
                        # Position closed
                        pass # Don't add to new_portfolio
                    elif remaining > 0:
                        # Flipped to Long
                        # The 5 'extra' shares are new Longs.
                        # Avg Cost is the current buy price.
                        pos["shares"] = remaining
                        pos["avgCost"] = trade.price
                        new_portfolio.append(pos)
                    else:
                        # Still Short
                        # Avg Cost remains the entry price of the short (weighted avg if we added to short)
                        # But we are REDUCING short, so Avg Cost doesn't change?
                        # Correct. Covering doesn't change avg cost of remaining short.
                        pos["shares"] = remaining
                        new_portfolio.append(pos)
                else:
                    # Adding to Long
                    total_shares = pos["shares"] + trade.shares
                    total_cost = (pos["shares"] * pos["avgCost"]) + cost
                    avg_cost = total_cost / total_shares
                    pos["shares"] = total_shares
                    pos["avgCost"] = avg_cost
                    new_portfolio.append(pos)
                found = True
            else:
                new_portfolio.append(pos)
        
        if not found:
            new_portfolio.append({"symbol": symbol, "shares": trade.shares, "avgCost": trade.price})
        
        portfolio = new_portfolio

    elif trade.action == "SELL":
        # Selling generates Cash (Proceeds).
        # If Long: Reducing position.
        # If Short: Increasing short position.
        
        cash += cost
        transaction_total = cost
        
        # Update holdings
        found = False
        new_portfolio = []
        for pos in portfolio:
            if pos["symbol"] == symbol:
                current_shares = pos["shares"]
                new_shares = current_shares - trade.shares
                
                if current_shares > 0:
                    # Was Long
                    if new_shares == 0:
                        # Closed
                        pass 
                    elif new_shares < 0:
                        # Flipped to Short
                        # Avg Cost becomes current price for the new short shares
                        pos["shares"] = new_shares
                        pos["avgCost"] = trade.price
                        new_portfolio.append(pos)
                    else:
                        # Still Long. Reducing. 
                        # Avg Cost doesn't change when reducing long.
                        pos["shares"] = new_shares
                        new_portfolio.append(pos)
                else:
                    # Was Short (or 0). Adding to Short.
                    # update weighted avg cost
                    # Current Cost Basis (liability) = abs(current) * avgCost
                    # New Liability = trade.shares * price
                    # Total Liab / Total Shares
                    old_liab = abs(current_shares) * pos["avgCost"]
                    new_liab = trade.shares * trade.price
                    if abs(new_shares) > 0:
                        new_avg = (old_liab + new_liab) / abs(new_shares)
                        pos["shares"] = new_shares
                        pos["avgCost"] = new_avg
                        new_portfolio.append(pos)
                
                found = True
            else:
                new_portfolio.append(pos)
        
        if not found:
            # Opening new Short
            new_portfolio.append({"symbol": symbol, "shares": -trade.shares, "avgCost": trade.price})
            
        portfolio = new_portfolio
    
    else:
        raise HTTPException(status_code=400, detail="Action must be BUY or SELL")
    
    # Log trade in history
    trade_record = {
        "timestamp": datetime.now().isoformat(),
        "action": trade.action,
        "symbol": symbol,
        "shares": trade.shares,
        "price": trade.price,
        "total": abs(transaction_total)
    }
    # Ensure history is a list
    if not isinstance(history, list):
        history = []
        
    history.append(trade_record)

    # Save
    set_user_data("simulator_portfolio", portfolio)
    set_user_data("simulator_cash", cash)
    set_user_data("simulator_history", history)

    return {
        "cash": cash, 
        "portfolio": portfolio, 
        "message": f"{trade.action} order executed: {trade.shares} shares of {symbol} @ ${trade.price:.2f}"
    }

