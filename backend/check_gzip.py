try:
    from fastapi.middleware.gzip import GZipMiddleware
    print("GZipMiddleware: FOUND")
except ImportError:
    print("GZipMiddleware: NOT FOUND")

try:
    from fastapi.middleware.gzip import GzipMiddleware
    print("GzipMiddleware: FOUND")
except ImportError:
    print("GzipMiddleware: NOT FOUND")
