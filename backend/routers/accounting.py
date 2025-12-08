from fastapi import APIRouter, HTTPException
from services.accounting import calculate_beneish_m_score, calculate_dupont
import asyncio

router = APIRouter(prefix="/api/accounting", tags=["accounting"])

@router.get("/beneish/{ticker}")
async def get_beneish(ticker: str):
    try:
        data = await asyncio.to_thread(calculate_beneish_m_score, ticker)
        if "error" in data:
            raise HTTPException(status_code=404, detail=data["error"])
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dupont/{ticker}")
async def get_dupont(ticker: str):
    try:
        data = await asyncio.to_thread(calculate_dupont, ticker)
        if "error" in data:
            raise HTTPException(status_code=404, detail=data["error"])
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
