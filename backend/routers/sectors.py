import asyncio
import yfinance as yf
from fastapi import APIRouter, HTTPException
from typing import List, Dict

router = APIRouter()

# Mapping of Sectors to Select Sector SPDR ETFs
SECTOR_ETFS = {
    "Technology": "XLK",
    "Health Care": "XLV",
    "Financials": "XLF",
    "Real Estate": "XLRE",
    "Energy": "XLE",
    "Materials": "XLB",
    "Consumer Discretionary": "XLY",
    "Industrials": "XLI",
    "Utilities": "XLU",
    "Consumer Staples": "XLP",
    "Communication Services": "XLC"
}

@router.get("/api/market/sectors")
async def get_sector_performance():
    """
    Fetches real-time performance data for major US market sectors.
    Returns list of dicts: {name: str, symbol: str, change: float, price: float}
    """
    try:
        # Fetch data for all symbols at once
        symbols = list(SECTOR_ETFS.values())
        tickers = yf.Tickers(" ".join(symbols))
        
        results = []
        
        # Iterate through our map to keep clean names
        for sector_name, symbol in SECTOR_ETFS.items():
            try:
                ticker = tickers.tickers[symbol]
                # Fast info access
                info = ticker.fast_info
                price = info.last_price
                prev_close = info.previous_close
                
                if price and prev_close:
                    change_pct = ((price - prev_close) / prev_close) * 100
                    results.append({
                        "name": sector_name,
                        "symbol": symbol,
                        "price": round(price, 2),
                        "change": round(change_pct, 2)
                    })
            except Exception as e:
                print(f"Error fetching {sector_name} ({symbol}): {e}")
                continue
                
        # Sort by best performing
        results.sort(key=lambda x: x['change'], reverse=True)
        
        return results

    except Exception as e:
        print(f"Sector API Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch sector data")
