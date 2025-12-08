import asyncio
from fastapi import APIRouter, HTTPException
from services.research import get_company_info, get_treasury_rates, get_financials, get_ai_analysis, get_comparable_companies, get_deep_research

router = APIRouter(prefix="/api/research", tags=["research"])

@router.get("/company/{ticker}")
async def company_info(ticker: str):
    try:
        data = await asyncio.to_thread(get_company_info, ticker)
        if not data:
             raise HTTPException(status_code=404, detail="Company not found")
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/treasury")
async def treasury_rates():
    try:
        return await asyncio.to_thread(get_treasury_rates)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/financials/{ticker}")
async def financials(ticker: str):
    try:
        return await asyncio.to_thread(get_financials, ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ai-analysis/{ticker}")
async def ai_analysis(ticker: str):
    try:
        return await asyncio.to_thread(get_ai_analysis, ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/comps/{ticker}")
async def comps(ticker: str):
    try:
        return await asyncio.to_thread(get_comparable_companies, ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/deep-research/{ticker}")
async def deep_research(ticker: str):
    try:
        return await asyncio.to_thread(get_deep_research, ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
