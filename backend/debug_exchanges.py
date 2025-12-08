import httpx
import asyncio

async def check_exchanges():
    queries = ["AAPL", "JPM", "SPY", "GSPC"]
    async with httpx.AsyncClient() as client:
        for q in queries:
            url = f"https://query2.finance.yahoo.com/v1/finance/search?q={q}&quotesCount=5"
            headers = {'User-Agent': 'Mozilla/5.0'}
            resp = await client.get(url, headers=headers)
            data = resp.json()
            print(f"--- Results for {q} ---")
            if 'quotes' in data:
                for quote in data['quotes']:
                    print(f"Symbol: {quote.get('symbol')} | Exch: {quote.get('exchange')} | Type: {quote.get('quoteType')}")

if __name__ == "__main__":
    asyncio.run(check_exchanges())
