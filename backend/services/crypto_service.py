
import ccxt.async_support as ccxt
import asyncio
from typing import List, Dict, Any

class CryptoService:
    """
    Fetches crypto market data using CCXT.
    """
    
    _exchange = None

    @classmethod
    async def get_exchange(cls):
        if not cls._exchange:
            cls._exchange = ccxt.kraken({
                'enableRateLimit': True,
                'timeout': 20000,
            })
        return cls._exchange

    @staticmethod
    async def get_top_coins(limit: int = 10) -> List[Dict[str, Any]]:
        """
        Fetches top coins using yfinance (more reliable/no API keys needed).
        """
        import yfinance as yf
        
        # Yahoo Finance Tickers
        top_symbols = [
            'BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD', 'ADA-USD', 
            'DOGE-USD', 'DOT-USD', 'AVAX-USD', 'LINK-USD', 'LTC-USD', 
            'BCH-USD', 'XLM-USD', 'ATOM-USD', 'UNI7083-USD'
        ]
        
        try:
            # Use Tickers to fetch multiple at once
            tickers = await asyncio.to_thread(yf.Tickers, " ".join(top_symbols))
            
            check_symbols = top_symbols
            results = []
            
            for symbol in check_symbols:
                try:
                    # Access the underlying Ticker object
                    t = tickers.tickers[symbol]
                    # Fast info is usually faster than .info
                    info = t.fast_info
                    # Fallback to .info if fast_info missing key data
                    price = info.last_price
                    prev_close = info.previous_close
                    
                    # Calculate change
                    change = 0.0
                    if prev_close:
                        change = ((price - prev_close) / prev_close) * 100
                        
                    # Get volume (sometimes in info, sometimes fast_info)
                    # fast_info doesn't look like it has volume in all versions, checking .info if needed
                    # But .info is slow. Let's try basic calc.
                    
                    results.append({
                        "symbol": symbol.replace("-USD", "/USD"), # Format back to crypto style
                        "price": price,
                        "change_24h": change,
                        "volume": 0, # Volume hard to get fast from yahoo without .history
                        "high": info.day_high,
                        "low": info.day_low
                    })
                except Exception as e:
                    continue
                    
            # Sort by price or market cap if available? 
            # Since we pre-selected top coins, just return the list or sort by something.
            # Let's sort by price desc for now or keep list order.
            
            return results[:limit]

        except Exception as e:
            print(f"Error fetching crypto data (yfinance): {e}")
            # Fallback
            return [
                {"symbol": "BTC/USD", "price": 96500.0, "change_24h": 0.0, "volume": 0, "high": 0, "low": 0},
                {"symbol": "ETH/USD", "price": 3650.0, "change_24h": 0.0, "volume": 0, "high": 0, "low": 0},
            ]


    @staticmethod
    async def get_defi_yields() -> List[Dict[str, Any]]:
        """
        Fetches live DeFi yields from DefiLlama API.
        Source: https://yields.llama.fi/pools
        """
        try:
            import httpx
            
            async with httpx.AsyncClient() as client:
                response = await client.get("https://yields.llama.fi/pools", timeout=10.0)
                if response.status_code == 200:
                    data = response.json()
                    pools = data.get('data', [])
                    
                    # Filter and sort by TVL
                    # We want stablecoins and major assets, reasonable APY (not outliers > 1000%)
                    valid_pools = [
                        p for p in pools 
                        if p.get('tvlUsd', 0) > 10000000 # > $10M TVL
                        and 0 < p.get('apy', 0) < 500 # Reasonable APY
                    ]
                    
                    # Sort by APY descending for "Top Yields" - but maybe mix of high TVL + APY?
                    # Let's just sort by APY for now, but limit to top protocols
                    valid_pools.sort(key=lambda x: x.get('apy', 0), reverse=True)
                    
                    results = []
                    for p in valid_pools[:10]: # Top 10
                        pool_data = {
                            "protocol": p.get('project', 'Unknown').title(),
                            "chain": p.get('chain', 'Unknown'),
                            "asset": p.get('symbol', 'Unknown'),
                            "apy": round(p.get('apy', 0), 2),
                            "tvl": f"${p.get('tvlUsd', 0) / 1000000:.1f}M"
                        }
                        results.append(pool_data)
                        
                    return results
                else:
                    print(f"DefiLlama API error: {response.status_code}")
                    return []
        except Exception as e:
            print(f"Error fetching DeFi yields: {e}")
            # Fallback to empty or mock if live fails
            return []

    @staticmethod
    async def get_whale_alerts(threshold_usd: int = 500000) -> List[Dict[str, Any]]:
        """
        Fetches recent trades for top assets and filters for large 'whale' transactions.
        """
        exchange = await CryptoService.get_exchange()
        alerts = []
        target_pairs = ['BTC/USD', 'ETH/USD', 'SOL/USD']
        
        try:
            # Add 8-second timeout
            async with asyncio.timeout(8.0):
                for symbol in target_pairs:
                    # Fetch recent trades (limit 50 to exist within rate limits usually)
                    try:
                        trades = await exchange.fetch_trades(symbol, limit=50)
                    except:
                        continue
                    
                    for trade in trades:
                        price = trade['price']
                        amount = trade['amount']
                        cost = price * amount
                        
                        if cost >= threshold_usd:
                            alerts.append({
                                "symbol": symbol,
                                "side": trade['side'], # 'buy' or 'sell'
                                "price": price,
                                "amount": amount,
                                "value_usd": cost,
                                "timestamp": trade['timestamp'], # ms timestamp
                                "hash": trade['id'] # exchange trade id
                            })
                
                # Sort by timestamp descending
                alerts.sort(key=lambda x: x['timestamp'], reverse=True)
                return alerts[:10] # Return top 10 most recent whale movements
        except asyncio.TimeoutError:
            print("Whale alerts timeout - returning empty")
            return []
        except Exception as e:
            print(f"Error fetching whale alerts: {e}")
            return []

    @staticmethod
        if CryptoService._exchange:
            await CryptoService._exchange.close()
