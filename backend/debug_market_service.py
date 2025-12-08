import sys
import os
import pandas as pd

# Add current directory to path
sys.path.append(os.getcwd())

from services.market_data import get_market_overview

def test_service():
    print("Calling get_market_overview()...")
    try:
        overview = get_market_overview()
        print("\nResult:")
        for item in overview:
            print(item)
            
        # Check specifically for NASDAQ and Russell
        nasdaq = next((x for x in overview if x['symbol'] == '^IXIC'), None)
        russell = next((x for x in overview if x['symbol'] == '^RUT'), None)
        
        if nasdaq and nasdaq['price'] == 0:
            print("\n❌ NASDAQ Price is 0!")
        if russell and russell['price'] == 0:
            print("\n❌ Russell 2000 Price is 0!")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_service()
