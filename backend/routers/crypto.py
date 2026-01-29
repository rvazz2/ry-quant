from fastapi import APIRouter, HTTPException
from services.crypto_service import CryptoService
import asyncio

router = APIRouter(prefix="/api/crypto", tags=["crypto"])

@router.get("/top")
async def get_top_crypto():
    try:
        data = await CryptoService.get_top_coins()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/defi")
async def get_defi_yields():
    try:
        data = await CryptoService.get_defi_yields()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/whales")
async def get_whale_alerts():
    try:
        data = await CryptoService.get_whale_alerts()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/arbitrage")
async def get_arbitrage():
    try:
        data = await CryptoService.get_arbitrage_opportunities()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/global-stats")
async def get_global_stats():
    try:
        data = await CryptoService.get_global_stats()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/onchain")
async def get_onchain_metrics():
    try:
        data = await CryptoService.get_onchain_metrics()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/news")
async def get_crypto_news(limit: int = 10):
    try:
        data = await CryptoService.get_crypto_news(limit=limit)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Ensure connection is closed on shutdown
@router.on_event("shutdown")
async def shutdown_event():
    await CryptoService.close()
