import sys
import os

# Add current directory to path so we can import modules
sys.path.append(os.getcwd())

try:
    print("Importing main...")
    import main
    print("Importing services.market_data...")
    import services.market_data
    print("Importing services.macro...")
    import services.macro
    print("Success! No immediate import errors.")
except Exception as e:
    print(f"CRASH: {e}")
    import traceback
    traceback.print_exc()
