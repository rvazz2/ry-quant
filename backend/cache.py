from diskcache import Cache
from functools import wraps
from typing import Callable, Any

# Initialize DiskCache
# This creates a persistent SQLite-backed cache that survives restarts and handles concurrency
cache = Cache("market_cache_db")

def timed_cache(seconds: int):
    """
    Decorator that caches function results to DISK for a specified number of seconds.
    Persists across server restarts!
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            # Create a unique key based on function name and arguments
            key = f"{func.__name__}:{args}:{kwargs}"
            
            # Check cache
            result = cache.get(key)
            if result is not None:
                return result
            
            # Fetch fresh data
            try:
                result = func(*args, **kwargs)
                
                # Only cache valid results
                if result is not None:
                    cache.set(key, result, expire=seconds)
                
                return result
            except Exception as e:
                print(f"Error in {func.__name__}: {e}")
                raise e
                
        return wrapper
    return decorator
