import asyncio
from services.market_data import get_market_overview, get_ticker_details, search_tickers, get_market_news
from fastapi import APIRouter

router = APIRouter(prefix="/api/market", tags=["market"])



@router.get("/overview")
async def market_overview():
    try:
        # Run in thread to prevent blocking main loop
        data = await asyncio.to_thread(get_market_overview)
        return data if data else []
    except Exception as e:
        print(f"API Error (market_overview): {e}")
        return []


@router.get("/ticker/{symbol}")
async def ticker_details(symbol: str):
    data = await get_ticker_details(symbol)
    if not data:
        # If ticker truly not found or YF failed
        # We can return 404 or a "stub" object. 
        # Given frontend fragility, let's return 404 so React Query handles it as error
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Ticker not found or data unavailable")
    return data

@router.get("/ticker/{symbol}/history")
async def ticker_history(symbol: str, period: str = "1mo", interval: str = "1d"):
    from services.market_data import get_ticker_history
    data = await get_ticker_history(symbol, period, interval)
    if not data:
        return []
    return data

@router.get("/search")
async def search(q: str):
    try:
        data = await search_tickers(q)
        return data
    except Exception as e:
        print(f"API Error (search): {e}")
        return []
@router.get("/news")
async def market_news():
    try:
        data = await get_market_news()
        return data
    except Exception as e:
        print(f"API Error (news): {e}")
        return []
