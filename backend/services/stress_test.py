import numpy as np
import pandas as pd
from typing import Dict, List, Any

class StressTester:
    """
    Simulates portfolio performance under various stress scenarios using Monte Carlo and factor shocks.
    """

    SCENARIOS = {
        "tech_crash": {
            "name": "Tech Bubble Burst",
            "description": "Tech sector drops 20%, broader market drops 5%.",
            "shocks": {"XLK": -0.20, "SPY": -0.05, "QQQ": -0.15}
        },
        "rate_hike": {
            "name": "Fed Rate Hike (+1%)",
            "description": "Interest rates rise 1%. Growth stocks hit hard, Financials stabilize.",
            "shocks": {"TLT": -0.15, "Growth": -0.15, "XLF": 0.05, "SPY": -0.08}
        },
        "recession": {
            "name": "Global Recession",
            "description": "Broad market sell-off. Defensive sectors outperform relative to market.",
            "shocks": {"SPY": -0.30, "QQQ": -0.35, "XLE": -0.40, "XLP": -0.10}
        },
        "inflation": {
            "name": "Inflation Spike",
            "description": "commodities rise, consumer discretionary falls.",
            "shocks": {"GLD": 0.15, "XLE": 0.10, "XLY": -0.12, "SPY": -0.07}
        }
    }

    @staticmethod
    def run_stress_test(portfolio: Dict[str, float], scenario_key: str) -> Dict[str, Any]:
        """
        Runs a specific stress scenario on a portfolio.
        portfolio: Dict of Ticker -> Weight (e.g., {"AAPL": 0.5, "MSFT": 0.5})
        """
        scenario = StressTester.SCENARIOS.get(scenario_key)
        if not scenario:
            raise ValueError(f"Unknown scenario: {scenario_key}")
            
        initial_value = 100000 # Assume $100k portfolio
        simulated_value = 0
        
        details = []
        
        for ticker, weight in portfolio.items():
            # Estimate beta/shock for ticker (simplistic mapping for now)
            # In real app, would use beta to relevant sector/index ETF
            
            shock = 0
            if ticker in scenario["shocks"]:
                shock = scenario["shocks"][ticker]
            else:
                # Fallback: assume beta 1 to SPY shock
                spy_shock = scenario["shocks"].get("SPY", -0.05)
                # Add random noise for 'beta' simulation
                beta = 1.0 
                # Identify sector (mock)
                if ticker in ["AAPL", "NVDA", "MSFT"]: beta = 1.2 # Tech-ish
                if ticker in ["XOM", "CVX"]: beta = 0.8 # Energy
                
                # Check specific sector shocks in scenario
                # This is a simplification. Real engine needs sector mapping.
                
                shock = spy_shock * beta
            
            position_value = initial_value * weight
            loss_pct = shock
            loss_amt = position_value * loss_pct
            new_pos_value = position_value + loss_amt
            
            simulated_value += new_pos_value
            
            details.append({
                "ticker": ticker,
                "weight": weight,
                "initial_value": position_value,
                "shock_pct": loss_pct,
                "loss_amt": loss_amt,
                "final_value": new_pos_value
            })
            
        total_loss = simulated_value - initial_value
        total_loss_pct = total_loss / initial_value
        
        return {
            "scenario": scenario["name"],
            "initial_portfolio_value": initial_value,
            "final_portfolio_value": simulated_value,
            "loss_amount": total_loss,
            "loss_percent": total_loss_pct,
            "details": details
        }

    @staticmethod
    def run_monte_carlo(portfolio: Dict[str, float], days: int = 252, simulations: int = 1000) -> Dict[str, Any]:
        """
        Runs a Monte Carlo simulation for the portfolio.
        Returns percentile outcomes (5th, 50th, 95th).
        """
        # Mocking returns/volatility for demonstration
        # Real implementation needs historical covariance matrix
        mu = 0.08 / 252 # Daily expected return (8% annual)
        sigma = 0.15 / np.sqrt(252) # Daily volatility (15% annual)
        
        # Adjust sigma based on portfolio composition (mock)
        # e.g., if heavy tech, higher sigma
        
        sim_results = []
        
        for _ in range(simulations):
            # Geometric Brownian Motion
            start_price = 100000
            prices = [start_price]
            for _ in range(days):
                shock = np.random.normal(mu, sigma)
                price = prices[-1] * (1 + shock)
                prices.append(price)
            sim_results.append(prices)
            
        final_values = [s[-1] for s in sim_results]
        
        return {
            "p5": np.percentile(final_values, 5),
            "p50": np.percentile(final_values, 50),
            "p95": np.percentile(final_values, 95),
            "simulation_count": simulations,
            "horizon_days": days
        }
