import requests
try:
    print("Checking health...")
    r = requests.get("http://127.0.0.1:8000/health", timeout=5)
    print(f"Status: {r.status_code}")
    print(r.json())
except Exception as e:
    print(f"Failed: {e}")
