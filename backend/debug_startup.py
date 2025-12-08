
import asyncio
import os
import sys

# Add current directory to path so imports work
sys.path.append(os.getcwd())

from services.market_data import get_market_overview
from main import app, refresh_market_data

async def test_startup():
    print("🧪 Testing Backend Startup Logic...")
    try:
        print("1. Running refresh_market_data()...")
        refresh_market_data()
        print("   ✅ Refresh successful.")
    except Exception as e:
        print(f"   ❌ Refresh failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_startup())
