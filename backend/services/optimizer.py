import numpy as np
import pandas as pd
import yfinance as yf
from scipy.optimize import minimize

from cache import timed_cache

@timed_cache(seconds=86400) # Cache usage for 1 day as historical data doesn't change often
def get_historical_data(tickers, start_date, end_date):
    # Disable threading to prevent nesting issues when called from asyncio.to_thread
    data = yf.download(tickers, start=start_date, end=end_date, progress=False, threads=False)
    # Handle MultiIndex headers if present
    if isinstance(data.columns, pd.MultiIndex):
        if 'Adj Close' in data.columns.get_level_values(0):
            data = data['Adj Close']
        elif 'Close' in data.columns.get_level_values(0):
            data = data['Close']
    elif 'Adj Close' in data:
        data = data['Adj Close']
    elif 'Close' in data:
        data = data['Close']
    
    return data

def calculate_portfolio_performance(weights, mean_returns, cov_matrix):
    returns = np.sum(mean_returns * weights) * 252
    std = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights))) * np.sqrt(252)
    return returns, std

def neg_sharpe_ratio(weights, mean_returns, cov_matrix, risk_free_rate):
    p_ret, p_var = calculate_portfolio_performance(weights, mean_returns, cov_matrix)
    return -(p_ret - risk_free_rate) / p_var

def portfolio_volatility(weights, mean_returns, cov_matrix):
    return calculate_portfolio_performance(weights, mean_returns, cov_matrix)[1]

def black_litterman_adjustment(mean_returns, cov_matrix, views, confidence=None):
    """
    Simplified Black-Litterman model to adjust expected returns based on user views.
    
    mean_returns: Prior expected returns (e.g. historical mean)
    cov_matrix: Covariance matrix of returns
    views: Dictionary of views {ticker: expected_return_scalar} e.g. {'AAPL': 0.30}
    confidence: Scalar or vector of confidence levels in views (0 to 1)
    """
    if not views:
        return mean_returns
    
    # Tau scalar: Uncertainty of the prior (usually between 0.025 and 0.05)
    tau = 0.05
    
    # P: Pick matrix (K x N) - identifies which assets the views imply
    # Q: View vector (K x 1) - the expected returns of the views
    assets = mean_returns.index.tolist()
    K = len(views)
    N = len(assets)
    
    P = np.zeros((K, N))
    Q = np.zeros(K)
    
    for i, (ticker, view_ret) in enumerate(views.items()):
        if ticker in assets:
            idx = assets.index(ticker)
            P[i, idx] = 1
            Q[i] = view_ret
            
    # Omega: Uncertainty matrix of views (diagonal)
    # Heuristic: Proportional to the variance of the asset
    Omega = np.zeros((K, K))
    for i, (ticker, _) in enumerate(views.items()):
        if ticker in assets:
            idx = assets.index(ticker)
            # Default confidence logic: if not provided, assume view variance is proportional to prior variance
            view_conf = 1.0 if not confidence else confidence.get(ticker, 1.0)
            # Higher confidence = lower variance in Omega
            # Basic calibration: Omega = P * (tau * Sigma) * P'
            # Here simplified: variance of asset scaled by (1/confidence)
            Omega[i, i] = cov_matrix.iloc[idx, idx] * tau * (1/view_conf)

    # Calculate Posterior Estimate (BL Formula)
    # E[R] = [(tau*Sigma)^-1 + P' Omega^-1 P]^-1 * [(tau*Sigma)^-1 * Pi + P' Omega^-1 Q]
    
    tau_Sigma = tau * cov_matrix
    try:
        tau_Sigma_inv = np.linalg.inv(tau_Sigma)
        Omega_inv = np.linalg.inv(Omega)
        
        M_inverse = np.linalg.inv(tau_Sigma_inv + np.dot(np.dot(P.T, Omega_inv), P))
        
        term1 = np.dot(tau_Sigma_inv, mean_returns)
        term2 = np.dot(np.dot(P.T, Omega_inv), Q)
        
        posterior_returns = np.dot(M_inverse, (term1 + term2))
        return pd.Series(posterior_returns, index=assets)
        
    except np.linalg.LinAlgError:
        print("Singular matrix in BL calculation, reverting to prior.")
        return mean_returns

@timed_cache(seconds=300)
def calculate_efficient_frontier(tickers, start_date, end_date, constraints=None, views=None):
    """
    Optimizes portfolio with optional constraints and views (Black-Litterman).
    
    constraints: {
        "min_weight": 0.0,
        "max_weight": 1.0,
        "cash_drag": 0.0, # Minimum cash weight (simulated as risk-free asset or just unallocated)
        "sector_limits": {"Technology": 0.30} # Not fully implemented in this MVP without sector data
    }
    views: {"AAPL": 0.20} # User expects AAPL to return 20%
    """
    data = get_historical_data(tickers, start_date, end_date)
    if data is None or data.empty: raise ValueError("No price data found")
    
    returns = data.pct_change().dropna() # Drop NaN from first row
    
    if returns.empty: raise ValueError("Insufficient data for calculation")
    
    mean_returns = returns.mean()
    cov_matrix = returns.cov()
    num_assets = len(tickers)
    rf = 0.045 # 4.5% Risk Free Rate (Approximate 3mo T-Bill)

    # Apply Black-Litterman Adjustment if views exist
    if views:
        mean_returns = black_litterman_adjustment(mean_returns, cov_matrix, views)

    # 1. Monte Carlo Simulation (For Scatter Plot) - Simplified for speed
    # 1. NEW Vectorized Monte Carlo Simulation
    num_simulations = 2000
    
    # Generate random weights: (num_simulations, num_assets)
    weights = np.random.random((num_simulations, num_assets))
    # Normalize rows to sum to 1
    weights = weights / weights.sum(axis=1)[:, np.newaxis]
    
    # Vectorized Return: (num_sims,)
    # mean_returns shape: (num_assets,)
    # weights shape: (num_sims, num_assets)
    # result: sum(w * mu, axis=1) * 252
    sim_returns = np.dot(weights, mean_returns) * 252
    
    # Vectorized Volatility: (num_sims,)
    # sigma^2 = w.T * COV * w
    # Here, for each row i: w_i * COV * w_i.T
    # We can do: (weights @ cov_matrix) * weights -> sum axis 1
    # weights @ cov_matrix -> (num_sims, num_assets)
    # multiply elementwise by weights -> (num_sims, num_assets)
    # sum axis 1 -> (num_sims,)
    
    # Ensure cov_matrix is numpy array for dot product
    cov_arr = cov_matrix.values
    
    # Intermediary: (num_sims, num_assets)
    # This represents [w * Sigma] for each simulation
    w_sigma = np.dot(weights, cov_arr) 
    
    # Variance = sum(w_sigma * w, axis=1)
    port_variance = np.sum(w_sigma * weights, axis=1) * 252
    sim_std = np.sqrt(port_variance)
    
    # Sharpe Ratio
    sim_sharpe = (sim_returns - rf) / sim_std
    
    # Prepare results structure for frontend (3, num_sims)
    results = np.vstack((sim_std, sim_returns, sim_sharpe))
    
    # Convert to list of dicts for frontend
    # Zip is fast enough for 2000 items
    scatter_data = [{"volatility": float(v), "return": float(r), "sharpe": float(s)} 
                   for v, r, s in zip(sim_std, sim_returns, sim_sharpe)]

    # 2. Precise Optimization (Scipy)
    args = (mean_returns, cov_matrix, rf)
    
    # Default Constraints: Sum of weights = 1
    cons = [{'type': 'eq', 'fun': lambda x: np.sum(x) - 1}]
    
    # Custom Constraints
    min_w = 0.0
    max_w = 1.0
    
    if constraints:
        if "min_weight" in constraints: min_w = constraints["min_weight"]
        if "max_weight" in constraints: max_w = constraints["max_weight"]
        # Cash Drag: If cash drag is 5%, then sum of equity weights <= 0.95? 
        # Or usually modeled as a separate asset. For simplicity, we'll enforce sum(x) = 1 - cash_drag
        if "cash_drag" in constraints:
            target_sum = 1.0 - constraints["cash_drag"]
            cons = [{'type': 'eq', 'fun': lambda x: np.sum(x) - target_sum}]
            
    # Bounds per asset
    bounds = tuple((min_w, max_w) for _ in range(num_assets))
    
    # Max Sharpe Ratio
    max_sharpe_res = minimize(neg_sharpe_ratio, num_assets*[1./num_assets,], args=args,
                        method='SLSQP', bounds=bounds, constraints=cons)
    
    # Min Volatility
    min_vol_res = minimize(portfolio_volatility, num_assets*[1./num_assets,], args=(mean_returns, cov_matrix),
                        method='SLSQP', bounds=bounds, constraints=cons)

    def get_port_details(weights):
        p_ret, p_std = calculate_portfolio_performance(weights, mean_returns, cov_matrix)
        sharpe = (p_ret - rf) / p_std if p_std != 0 else 0
        
        # VaR 95%
        var_95 = 1.65 * p_std
        
        # Factor Analysis (Simplified Proxy)
        # In a real system, we'd regress against Fama-French factors.
        # Here we map beta/volatility to "Factors" for the UI.
        
        return {
            "return": p_ret,
            "volatility": p_std,
            "sharpe": sharpe,
            "var_95": var_95,
            "weights": dict(zip(tickers, weights))
        }

    return {
        "scatter_data": scatter_data,
        "max_sharpe": get_port_details(max_sharpe_res.x),
        "min_volatility": get_port_details(min_vol_res.x),
        "correlation_matrix": returns.corr().to_dict(),
        "black_litterman": bool(views)
    }
