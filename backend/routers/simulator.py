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

class OptionPosition(BaseModel):
    symbol: str
    option_type: str  # "CALL" or "PUT"
    strike: float
    expiry: str  # ISO format date YYYY-MM-DD
    contracts: int  # Can be negative for short options
    premium: float  # Premium per share (entry price)

class OptionTradeRequest(BaseModel):
    symbol: str
    option_type: str  # "CALL" or "PUT"
    strike: float
    expiry: str
    action: str  # "BUY" or "SELL" (BUY = long, SELL = short/write)
    contracts: int
    premium: float  # Premium per share

# --- Defaults ---
INITIAL_CASH = 100000.0

# --- Endpoints ---

@router.get("/portfolio")
async def get_portfolio():
    """Get current portfolio state."""
    portfolio = get_user_data("simulator_portfolio", [])
    cash = get_user_data("simulator_cash", INITIAL_CASH)
    return {"cash": cash, "portfolio": portfolio}

@router.get("/options")
async def get_options():
    """Get options positions."""
    options = get_user_data("simulator_options", [])
    return {"options": options}

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
            # Short position liability
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
    set_user_data("simulator_options", [])
    return {"cash": INITIAL_CASH, "portfolio": [], "history": [], "options": []}

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
    
    if not symbol or len(symbol) > 12:
        raise HTTPException(status_code=400, detail="Invalid ticker symbol")
    
    cost = trade.shares * trade.price
    transaction_total = 0

    if trade.action == "BUY":
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
                    remaining = current_shares + trade.shares
                    if remaining == 0:
                        pass 
                    elif remaining > 0:
                        pos["shares"] = remaining
                        pos["avgCost"] = trade.price
                        new_portfolio.append(pos)
                    else:
                        pos["shares"] = remaining
                        new_portfolio.append(pos)
                else:
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
                    if new_shares == 0:
                        pass 
                    elif new_shares < 0:
                        pos["shares"] = new_shares
                        pos["avgCost"] = trade.price
                        new_portfolio.append(pos)
                    else:
                        pos["shares"] = new_shares
                        new_portfolio.append(pos)
                else:
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

@router.post("/trade/option")
async def execute_option_trade(trade: OptionTradeRequest):
    """Execute an options trade."""
    options_portfolio = get_user_data("simulator_options", [])
    cash = get_user_data("simulator_cash", INITIAL_CASH)
    history = get_user_data("simulator_history", [])
    
    # Validations
    if trade.contracts <= 0:
        raise HTTPException(status_code=400, detail="Contracts must be greater than 0")
    
    if trade.premium <= 0:
        raise HTTPException(status_code=400, detail="Premium must be greater than 0")
    
    if trade.option_type not in ["CALL", "PUT"]:
        raise HTTPException(status_code=400, detail="Option type must be CALL or PUT")
    
    symbol = trade.symbol.upper().strip()
    
    if not symbol or len(symbol) > 12:
        raise HTTPException(status_code=400, detail="Invalid ticker symbol")
    
    # Cost = contracts * 100 shares/contract * premium per share
    cost = trade.contracts * 100 * trade.premium
    transaction_total = 0
    
    if trade.action == "BUY":
        if cost > cash:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient funds. Need ${cost:,.2f}, have ${cash:,.2f}"
            )
        
        cash -= cost
        transaction_total = -cost
        
        # Add to options portfolio
        found = False
        new_options = []
        for opt in options_portfolio:
            if (opt["symbol"] == symbol and 
                opt["option_type"] == trade.option_type and
                opt["strike"] == trade.strike and
                opt["expiry"] == trade.expiry):
                
                total_contracts = opt["contracts"] + trade.contracts
                if total_contracts == 0:
                    pass
                else:
                    total_cost = abs(opt["contracts"]) * 100 * opt["premium"] + cost
                    avg_premium = total_cost / (abs(total_contracts) * 100)
                    opt["contracts"] = total_contracts
                    opt["premium"] = avg_premium
                    new_options.append(opt)
                found = True
            else:
                new_options.append(opt)
        
        if not found:
            new_options.append({
                "symbol": symbol,
                "option_type": trade.option_type,
                "strike": trade.strike,
                "expiry": trade.expiry,
                "contracts": trade.contracts,
                "premium": trade.premium
            })
        
        options_portfolio = new_options
    
    elif trade.action == "SELL":
        cash += cost
        transaction_total = cost
        
        found = False
        new_options = []
        for opt in options_portfolio:
            if (opt["symbol"] == symbol and 
                opt["option_type"] == trade.option_type and
                opt["strike"] == trade.strike and
                opt["expiry"] == trade.expiry):
                
                new_contracts = opt["contracts"] - trade.contracts
                if new_contracts == 0:
                    pass
                else:
                    if new_contracts > 0:
                        opt["contracts"] = new_contracts
                        new_options.append(opt)
                    else:
                        opt["contracts"] = new_contracts
                        opt["premium"] = trade.premium
                        new_options.append(opt)
                found = True
            else:
                new_options.append(opt)
        
        if not found:
            new_options.append({
                "symbol": symbol,
                "option_type": trade.option_type,
                "strike": trade.strike,
                "expiry": trade.expiry,
                "contracts": -trade.contracts,
                "premium": trade.premium
            })
        
        options_portfolio = new_options
    
    else:
        raise HTTPException(status_code=400, detail="Action must be BUY or SELL")
    
    trade_record = {
        "timestamp": datetime.now().isoformat(),
        "action": trade.action,
        "symbol": f"{symbol} {trade.option_type} ${trade.strike} {trade.expiry}",
        "shares": trade.contracts,
        "price": trade.premium,
        "total": abs(transaction_total)
    }
    
    if not isinstance(history, list):
        history = []
        
    history.append(trade_record)
    
    # Save
    set_user_data("simulator_options", options_portfolio)
    set_user_data("simulator_cash", cash)
    set_user_data("simulator_history", history)
    
    return {
        "cash": cash,
        "options": options_portfolio,
        "message": f"{trade.action} option executed: {trade.contracts} contracts of {symbol} {trade.option_type} ${trade.strike} @ ${trade.premium:.2f}"
    }