from fastapi import APIRouter, HTTPException
import psutil
import os
import time
from cache import cache
from services.market_data import get_market_overview

router = APIRouter(
    prefix="/system",
    tags=["System"]
)

@router.get("/status")
def get_system_status():
    """
    Returns system memory and CPU usage.
    """
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()
    
    return {
        "cpu_percent": psutil.cpu_percent(interval=None),
        "memory_usage_mb": round(memory_info.rss / 1024 / 1024, 2),
        "uptime_seconds": round(time.time() - process.create_time(), 2),
        "cache_size_items": len(cache)
    }

@router.post("/cache/clear")
def clear_cache():
    """
    Clears the entire disk cache.
    """
    try:
        cache.clear()
        return {"status": "success", "message": "Cache cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear cache: {str(e)}")

@router.post("/refresh")
def force_refresh_data():
    """
    Forces an immediate refresh of market data.
    """
    try:
        get_market_overview()
        return {"status": "success", "message": "Market data refreshed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh data: {str(e)}")
