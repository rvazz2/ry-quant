from fastapi import APIRouter, HTTPException
from services.macro import get_macro_summary, get_yield_curves
import asyncio

router = APIRouter(prefix="/api/macro", tags=["macro"])

@router.get("/summary")
async def macro_history():
    try:
        return await asyncio.to_thread(get_macro_summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/yield-curves")
async def yields():
    try:
        return await asyncio.to_thread(get_yield_curves)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/calendar")
async def calendar():
    try:
        from services.macro import get_economic_calendar
        return await asyncio.to_thread(get_economic_calendar)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fed-projections")
async def fed_projections():
    try:
        from services.macro import get_fed_projections
        return await asyncio.to_thread(get_fed_projections)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
