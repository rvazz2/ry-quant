from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.store import get_user_data, set_user_data

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

# --- Defaults ---
INITIAL_CASH = 100000.0

# --- Endpoints ---

@router.get("/portfolio")
async def get_portfolio():
    """Get current portfolio state."""
    portfolio = get_user_data("simulator_portfolio", [])
    cash = get_user_data("simulator_cash", INITIAL_CASH)
    return {"cash": cash, "portfolio": portfolio}

@router.post("/reset")
async def reset_portfolio():
    """Reset simulation to initial state."""
    set_user_data("simulator_portfolio", [])
    set_user_data("simulator_cash", INITIAL_CASH)
    return {"cash": INITIAL_CASH, "portfolio": []}

@router.post("/trade")
async def execute_trade(trade: TradeRequest):
    """Execute a buy or sell order."""
    portfolio = get_user_data("simulator_portfolio", [])
    cash = get_user_data("simulator_cash", INITIAL_CASH)
    
    symbol = trade.symbol.upper()
    cost = trade.shares * trade.price

    if trade.action == "BUY":
        if cost > cash:
            raise HTTPException(status_code=400, detail="Insufficient funds")
        
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
        if not holding or holding["shares"] < trade.shares:
             raise HTTPException(status_code=400, detail="Insufficient shares")
        
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

    # Save
    set_user_data("simulator_portfolio", portfolio)
    set_user_data("simulator_cash", cash)

    return {"cash": cash, "portfolio": portfolio, "message": "Trade executed"}
