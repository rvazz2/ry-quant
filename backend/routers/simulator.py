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
    portfolio_value = sum(pos["shares"] * pos.get("currentPrice", pos["avgCost"]) for pos in portfolio)
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
            gain_pct = ((current_price - pos["avgCost"]) / pos["avgCost"]) * 100
            
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

    if trade.action == "BUY":
        if cost > cash:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient funds. Need ${cost:,.2f}, have ${cash:,.2f}"
            )
        
        cash -= cost
        
        # Update holdings
        found = False
        new_portfolio = []
        for pos in portfolio:
            if pos["symbol"] == symbol:
                # Weighted Average
                total_shares = pos["shares"] + trade.shares
                total_cost = (pos["shares"] * pos["avgCost"]) + cost
                avg_cost = total_cost / total_shares
                pos["shares"] = total_shares
                pos["avgCost"] = avg_cost
                found = True
            new_portfolio.append(pos)
        
        if not found:
            new_portfolio.append({"symbol": symbol, "shares": trade.shares, "avgCost": trade.price})
        
        portfolio = new_portfolio

    elif trade.action == "SELL":
        # Check holdings
        holding = next((p for p in portfolio if p["symbol"] == symbol), None)
        if not holding:
            raise HTTPException(
                status_code=400, 
                detail=f"You don't own any shares of {symbol}"
            )
        
        if holding["shares"] < trade.shares:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient shares. You own {holding['shares']}, trying to sell {trade.shares}"
            )
        
        cash += cost
        
        # Update holdings
        new_portfolio = []
        for pos in portfolio:
            if pos["symbol"] == symbol:
                remaining = pos["shares"] - trade.shares
                if remaining > 0:
                    pos["shares"] = remaining
                    new_portfolio.append(pos)
                # Else remove if 0
            else:
                new_portfolio.append(pos)
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
        "total": cost
    }
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

