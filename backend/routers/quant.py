from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from services.optimizer import calculate_efficient_frontier
from services.backtester import run_sma_backtest
from services.options import calculate_option_prices

router = APIRouter(prefix="/api/quant", tags=["quant"])

from typing import List, Dict, Optional
import asyncio

class Constraints(BaseModel):
    min_weight: Optional[float] = 0.0
    max_weight: Optional[float] = 1.0
    cash_drag: Optional[float] = 0.0

class FrontierRequest(BaseModel):
    tickers: List[str]
    start_date: str
    end_date: str
    constraints: Optional[Constraints] = None
    views: Optional[Dict[str, float]] = None

@router.post("/efficient-frontier")
async def efficient_frontier(request: FrontierRequest):
    try:
        # Check if constraints or views are provided
        constraints_dict = request.constraints.dict() if request.constraints else None
        
        # Run in thread to allow non-blocking execution (Scipy is CPU bound)
        return await asyncio.to_thread(
            calculate_efficient_frontier, 
            request.tickers, 
            request.start_date, 
            request.end_date,
            constraints_dict,
            request.views
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class BacktestRequest(BaseModel):
    ticker: str
    short_window: int
    long_window: int
    period: str = "2y"

@router.post("/backtest")
async def backtest(request: BacktestRequest):
    try:
        return await asyncio.to_thread(run_sma_backtest, request.ticker, request.short_window, request.long_window, request.period)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class OptionRequest(BaseModel):
    S: float
    K: float
    T: float
    r: float
    sigma: float

@router.post("/option-pricing")
async def option_pricing(request: OptionRequest):
    try:
        return await asyncio.to_thread(calculate_option_prices, request.S, request.K, request.T, request.r, request.sigma)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/options/dates/{ticker}")
async def option_dates(ticker: str):
    try:
        from services.options import get_option_dates
        return await asyncio.to_thread(get_option_dates, ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/options/chain/{ticker}")
async def option_chain(ticker: str, date: str):
    try:
        from services.options import get_option_chain
        return await asyncio.to_thread(get_option_chain, ticker, date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/surface")
async def get_surface(ticker: str, r: float = 0.05, sigma: float = 0.2):
    try:
        from services.quant import get_vol_surface
        return await asyncio.to_thread(get_vol_surface, ticker, r, sigma)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pairs")
async def get_pairs_analysis(ticker1: str, ticker2: str, period: str = "1y"):
    try:
        from services.quant import analyze_pairs
        return await asyncio.to_thread(analyze_pairs, ticker1, ticker2, period)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Analyst Track Record
class TradeRequest(BaseModel):
    ticker: str
    action: str
    price: float
    quantity: int
    rationale: str = ""

@router.post("/analyst/trade")
async def log_analyst_trade(request: TradeRequest):
    try:
        from services.analyst import log_trade
        return await asyncio.to_thread(log_trade, request.ticker, request.action, request.price, request.quantity, request.rationale)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analyst/record")
async def get_analyst_record():
    try:
        from services.analyst import get_track_record
        return await asyncio.to_thread(get_track_record)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
