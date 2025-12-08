import sys
import os
import inspect

print("--- DEBUGGING IMPORTS ---")
try:
    import fastapi.middleware.gzip
    print(f"fastapi.middleware.gzip imported: {fastapi.middleware.gzip}")
    print(f"Dir: {dir(fastapi.middleware.gzip)}")
except ImportError as e:
    print(f"Failed to import fastapi.middleware.gzip: {e}")

try:
    from starlette.middleware.gzip import GzipMiddleware
    print("Found GzipMiddleware in starlette.middleware.gzip")
except ImportError as e:
    print(f"Failed to import from starlette: {e}")

try:
    from fastapi.middleware.gzip import GzipMiddleware
    print("Found GzipMiddleware in fastapi.middleware.gzip")
except ImportError as e:
    print(f"Failed to import from fastapi.middleware.gzip: {e}")
