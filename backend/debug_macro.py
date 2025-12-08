import asyncio
import sys
import os

sys.path.append(os.getcwd())
from services.macro import get_yield_curves, get_macro_summary

async def main():
    print("Testing get_yield_curves...")
    try:
        curves = await get_yield_curves()
        print("Yield Curves keys:", curves.keys())
        print("Current curve points:", len(curves['current']) if curves['current'] else "None")
    except Exception as e:
        print(f"FAILED get_yield_curves: {e}")
        import traceback
        traceback.print_exc()

    print("\nTesting get_macro_summary...")
    try:
        summary = await get_macro_summary()
        print("Summary count:", len(summary))
    except Exception as e:
        print(f"FAILED get_macro_summary: {e}")

if __name__ == "__main__":
    asyncio.run(main())
