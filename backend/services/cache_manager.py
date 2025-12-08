# backend/services/cache_manager.py
"""
Advanced caching system with disk persistence and background refresh.
This bypasses slow external API calls by serving cached data instantly.
"""
import json
import os
import time
from pathlib import Path
from typing import Any, Optional, Callable
import asyncio
from functools import wraps

CACHE_DIR = Path(__file__).parent.parent / "cache_data"
CACHE_DIR.mkdir(exist_ok=True)

class DiskCache:
    """Persistent disk cache that survives server restarts"""
    
    @staticmethod
    def get(key: str, max_age: int = 3600) -> Optional[Any]:
        """Get cached data if not expired"""
        cache_file = CACHE_DIR / f"{key}.json"
        
        if not cache_file.exists():
            return None
            
        try:
            with open(cache_file, 'r') as f:
                data = json.load(f)
                
            # Check if expired
            if time.time() - data['timestamp'] > max_age:
                return None
                
            return data['value']
        except Exception as e:
            print(f"[CACHE] Error reading cache for {key}: {e}")
            return None
    
    @staticmethod
    def set(key: str, value: Any):
        """Save data to disk cache"""
        cache_file = CACHE_DIR / f"{key}.json"
        
        try:
            with open(cache_file, 'w') as f:
                json.dump({
                    'timestamp': time.time(),
                    'value': value
                }, f)
        except Exception as e:
            print(f"[CACHE] Error writing cache for {key}: {e}")

def disk_cached(max_age: int = 3600):
    """Decorator for disk caching with background refresh"""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}_{str(args)}_{str(kwargs)}"
            
            # Try cache first
            cached = DiskCache.get(cache_key, max_age)
            if cached is not None:
                print(f"[CACHE HIT] {func.__name__} - serving from disk")
                
                # Refresh in background if data is getting stale (>50% of max_age)
                cache_file = CACHE_DIR / f"{cache_key}.json"
                if cache_file.exists():
                    with open(cache_file, 'r') as f:
                        data = json.load(f)
                        age = time.time() - data['timestamp']
                        if age > max_age * 0.5:
                            print(f"[CACHE] Triggering background refresh for {func.__name__}")
                            asyncio.create_task(refresh_cache(func, cache_key, args, kwargs))
                
                return cached
            
            # Cache miss - fetch and cache
            print(f"[CACHE MISS] {func.__name__} - fetching fresh data")
            result = await func(*args, **kwargs)
            DiskCache.set(cache_key, result)
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}_{str(args)}_{str(kwargs)}"
            
            # Try cache first
            cached = DiskCache.get(cache_key, max_age)
            if cached is not None:
                print(f"[CACHE HIT] {func.__name__} - serving from disk")
                return cached
            
            # Cache miss - fetch and cache
            print(f"[CACHE MISS] {func.__name__} - fetching fresh data")
            result = func(*args, **kwargs)
            DiskCache.set(cache_key, result)
            return result
        
        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator

async def refresh_cache(func, cache_key, args, kwargs):
    """Background task to refresh stale cache"""
    try:
        result = await func(*args, **kwargs) if asyncio.iscoroutinefunction(func) else func(*args, **kwargs)
        DiskCache.set(cache_key, result)
        print(f"[CACHE] Background refresh complete for {cache_key}")
    except Exception as e:
        print(f"[CACHE] Background refresh failed for {cache_key}: {e}")
