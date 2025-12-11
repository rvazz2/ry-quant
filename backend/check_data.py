import sys
import os

# Add current directory to path so we can import services
sys.path.append(os.getcwd())

from services.behavioral import get_strategy_comparison, get_social_hype, get_superinvestor_data, get_trending_tickers
from services.macro import get_global_macro_data, get_economic_calendar

def verify():
    print("--- Verifying Real Data Integration ---")
    
    print("\n1. Testing Strategy Comparison (Growth vs Value)...")
    try:
        strat = get_strategy_comparison()
        if strat and "series" in strat and len(strat["series"]) > 0:
            print(f"PASS: Comparison data fetched. {len(strat['series'])} days of data.")
            if "summary" in strat:
                print(f"Performance: {strat['summary']}")
        else:
            print("FAIL: Strategy comparison returned empty.")
    except Exception as e:
        print(f"FAIL: Strategy Exception: {e}")

    print("\n2. Testing Social Hype (News Volume)...")
    try:
        hype = get_social_hype("NVDA")
        if hype and "hype_score" in hype:
            print(f"PASS: Hype data fetched for NVDA. Score: {hype['hype_score']}, Vol: {hype['reddit_mentions']}")
        else:
            print("FAIL: Hype data failed.")
    except Exception as e:
        print(f"FAIL: Hype Exception: {e}")

    print("\n3. Testing Superinvestor Data (Verified)...")
    try:
        bi = get_superinvestor_data()
        if bi and len(bi) > 0 and bi[0]["ticker"] == "DPZ":
            print(f"PASS: Superinvestor data verified. Top holding: {bi[0]['company']}")
        else:
            print(f"FAIL: Superinvestor data mismatch. Got {bi[0]['ticker'] if bi else 'None'}")
    except Exception as e:
        print(f"FAIL: Superinvestor Exception: {e}")

    print("\n4. Testing Global Macro (Real Indices)...")
    try:
        gm = get_global_macro_data()
        if gm and len(gm) > 0:
            print(f"PASS: Global macro data fetched for {len(gm)} countries.")
            entry = gm[0]
            print(f"Sample: {entry['country']} Growth (1D): {entry['gdp_growth']}%")
        else:
            print("FAIL: Global macro data failed or empty.")
    except Exception as e:
        print(f"FAIL: Global Macro Exception: {e}")

    print("\n5. Testing Economic Calendar...")
    try:
        cal = get_economic_calendar()
        if cal and len(cal) > 0:
            print(f"PASS: Calendar has {len(cal)} upcoming events.")
            print(f"Next Event: {cal[0]['event']} on {cal[0]['date']}")
        else:
            print("FAIL: Calendar empty.")
    except Exception as e:
        print(f"FAIL: Calendar Exception: {e}")

if __name__ == "__main__":
    verify()
