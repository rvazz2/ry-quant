from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from routers import market, quant, research, macro, mergers, planning, accounting, behavioral, ai, strategy_builder, stress, crypto, reports, simulator, system
from contextlib import asynccontextmanager
import asyncio
from services.market_data import get_market_overview, get_market_news
from services.research import get_treasury_rates
from apscheduler.schedulers.background import BackgroundScheduler

# Scheduler for Background Tasks (Data Refresh)
scheduler = BackgroundScheduler()

def refresh_market_data():
    """Refreshes market data in the background to keep cache warm."""
    import concurrent.futures
    try:
        # Run refreshes concurrently to save time
        with concurrent.futures.ThreadPoolExecutor() as executor:
            executor.submit(get_market_overview)
            executor.submit(get_market_news)
    except Exception as e:
        print(f"Error refreshing market data: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting Server & Warming Cache...")
    
    # 1. Start Scheduler
    scheduler.add_job(refresh_market_data, 'interval', minutes=5)
    scheduler.start()
    
    # 2. Initial Warmup (Non-blocking)
    asyncio.create_task(asyncio.to_thread(refresh_market_data))
    
    yield
    # Shutdown
    scheduler.shutdown()

app = FastAPI(title="Quant Dashboard API", lifespan=lifespan)

from fastapi import Request
from fastapi.responses import JSONResponse
import time

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    # TODO: In production, replace ["*"] with your actual frontend domain (e.g. ["https://your-app.vercel.app"])
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enable Gzip Compression
app.add_middleware(GZipMiddleware, minimum_size=300)

# Add Global Timeout Middleware to prevent hangs
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

class TimeoutMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            # 60-second timeout for ALL requests (increased for local cold starts)
            return await asyncio.wait_for(call_next(request), timeout=60.0)
        except asyncio.TimeoutError:
            print(f"⏱️ TIMEOUT: {request.method} {request.url.path} exceeded 60s")
            return JSONResponse(
                status_code=504,
                content={"detail": "Request timeout - server took too long to respond"},
            )
        except Exception as e:
            print(f"⚠️ Middleware Error: {request.method} {request.url.path} - {str(e)}")
            return JSONResponse(
                status_code=500,
                content={"detail": f"Internal error: {str(e)}"},
            )

app.add_middleware(TimeoutMiddleware)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        print(f"Request: {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.4f}s")
        
        # Add Cache-Control for GET requests to enable browser caching
        if request.method == "GET" and response.status_code == 200:
            # cache for 60 seconds by default for all successful GETs
            response.headers["Cache-Control"] = "public, max-age=60"
            
        return response
    except Exception as e:
        process_time = time.time() - start_time
        print(f"🔥 Unhandled Exception: {request.method} {request.url.path} - Error: {str(e)} - Time: {process_time:.4f}s")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Internal Server Error: {str(e)}"},
        )

# Register Routers
app.include_router(market.router)
app.include_router(quant.router)
app.include_router(research.router)
app.include_router(macro.router)
app.include_router(mergers.router)
app.include_router(planning.router)
app.include_router(accounting.router)
app.include_router(behavioral.router)
app.include_router(ai.router)
app.include_router(strategy_builder.router)
app.include_router(stress.router)
app.include_router(crypto.router)
app.include_router(reports.router)
app.include_router(simulator.router) # New Simulator Router
app.include_router(system.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Quant Dashboard API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
