
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
        Fetches top coins by volume (optimized with predefined list).
        """
        exchange = await CryptoService.get_exchange()
        
        # Predefined top list to avoid fetching thousands of pairs (slow!)
        top_symbols = [
            'BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'ADA/USD', 
            'DOGE/USD', 'DOT/USD', 'AVAX/USD', 'LINK/USD', 'MATIC/USD', 
            'LTC/USD', 'UNI/USD', 'BCH/USD', 'XLM/USD', 'ATOM/USD'
        ]
        
        try:
            # Add 10-second timeout to prevent indefinite hanging
            tickers = await asyncio.wait_for(
                exchange.fetch_tickers(top_symbols),
                timeout=10.0
            )
            
            valid_tickers = []
            for symbol, t in tickers.items():
                if t.get('quoteVolume') and t.get('last'):
                    valid_tickers.append(t)
            
            sorted_tickers = sorted(valid_tickers, key=lambda x: x['quoteVolume'], reverse=True)
            top_n = sorted_tickers[:limit]
            
            return [{
                "symbol": t['symbol'],
                "price": t['last'],
                "change_24h": t.get('percentage', 0.0),
                "volume": t['quoteVolume'],
                "high": t.get('high', 0.0),
                "low": t.get('low', 0.0)
            } for t in top_n]
            
        except asyncio.TimeoutError:
            print(f"Crypto API timeout - returning fallback data")
            return [
                {"symbol": "BTC/USD", "price": 96500.0, "change_24h": 2.5, "volume": 1000000000, "high": 97000, "low": 95000},
                {"symbol": "ETH/USD", "price": 3650.0, "change_24h": 1.2, "volume": 500000000, "high": 3700, "low": 3600},
                {"symbol": "SOL/USD", "price": 215.0, "change_24h": 5.8, "volume": 200000000, "high": 220, "low": 210},
                {"symbol": "XRP/USD", "price": 2.45, "change_24h": 3.1, "volume": 150000000, "high": 2.50, "low": 2.40},
                {"symbol": "ADA/USD", "price": 1.15, "change_24h": 2.3, "volume": 100000000, "high": 1.18, "low": 1.12},
            ]
        except Exception as e:
            print(f"Error fetching crypto data: {e}")
            # Mock fallback if API fails
            return [
                {"symbol": "BTC/USD", "price": 96500.0, "change_24h": 2.5, "volume": 1000000000, "high": 97000, "low": 95000},
                {"symbol": "ETH/USD", "price": 3650.0, "change_24h": 1.2, "volume": 500000000, "high": 3700, "low": 3600},
                {"symbol": "SOL/USD", "price": 215.0, "change_24h": 5.8, "volume": 200000000, "high": 220, "low": 210},
            ]


    @staticmethod
    async def get_defi_yields() -> List[Dict[str, Any]]:
        """
        Mock data for DeFi yields as fetching real on-chain data requires complex web3 setup or paid APIs (e.g. DefiLlama).
        """
        return [
            {"protocol": "Aave V3", "chain": "Ethereum", "asset": "USDC", "apy": 4.5, "tvl": "1.2B"},
            {"protocol": "Compound", "chain": "Ethereum", "asset": "USDC", "apy": 3.8, "tvl": "800M"},
            {"protocol": "Curve", "chain": "Ethereum", "asset": "3pool", "apy": 2.1, "tvl": "500M"},
            {"protocol": "GMX", "chain": "Arbitrum", "asset": "ETH", "apy": 12.5, "tvl": "300M"},
        ]

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
    async def close():
        if CryptoService._exchange:
            await CryptoService._exchange.close()
