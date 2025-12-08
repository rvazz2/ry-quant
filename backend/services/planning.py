import numpy as np

def run_monte_carlo_simulation(
    initial_balance: float, 
    annual_contribution: float, 
    annual_withdrawal: float, 
    years: int, 
    risk_level: float = 0.8
):
    """
    Runs a Monte Carlo simulation for retirement planning.
    
    Args:
        initial_balance (float): Starting portfolio value.
        annual_contribution (float): Annual addition to portfolio (inflation adjusted simulation).
        annual_withdrawal (float): Annual drawdown (inflation adjusted).
        years (int): Number of years to simulate.
        risk_level (float): 0.0 (Conservative) to 1.0 (Aggressive). Determines Mean/Vol.
    
    Returns:
        dict: Simulation results (success_rate, median_final_balance, chart_data).
    """
    
    # Define Asset Class Assumptions based on Risk Level (Linear Interpolation)
    # Conservative (0.0): 2% Return, 3% Vol
    # Aggressive (1.0): 8% Return, 18% Vol
    mu = 0.02 + (risk_level * 0.06)
    sigma = 0.03 + (risk_level * 0.15)
    
    simulations = 5000 # Number of paths
    
    # Generate random returns: shape (simulations, years)
    # np.random.normal generates standard normal random variables
    rng = np.random.default_rng()
    
    # Brownian Motion: dS/S = mu*dt + sigma*dW
    # Discrete: Return = exp((mu - 0.5*sigma^2) + sigma*Z) - 1
    daily_mu = mu / 252
    daily_sigma = sigma / np.sqrt(252)
    # Note: Annual simulation is coarser but faster for this interactive tool. 
    # Let's stick to annual steps for instant feedback, it's sufficient for "War Game" vibes.
    
    # matrix of random shocks
    returns = rng.normal(loc=(mu - 0.5 * sigma**2), scale=sigma, size=(simulations, years))
    
    # Initialize trajectories
    # balances[i, j] is balance of simulation i at year j
    balances = np.zeros((simulations, years + 1))
    balances[:, 0] = initial_balance
    
    # Net annual flow
    net_flow = annual_contribution - annual_withdrawal
    
    # Vectorized Approach
    # returns: (simulations, years)
    # To get cumulative growth, we need cumprod of (1 + r)
    # But we have continuous compounding in the generation: exp(r)
    # And we have annual flows. 
    # The loop `for t in range` is actually efficient enough for 30 steps if inner ops are vector.
    # But we can optimize the math inside the loop.
    
    # Current loop is:
    # balances[:, t] = balances[:, t-1] * growth_factor + net_flow
    # growth_factor = np.exp(returns[:, t-1])
    # This is already vectorized across 'simulations' (5000). 
    # Vectorizing across 'time' (30) with cashflows is tricky (requires check for < 0).
    # Since 'years' is small (30-50), and 'simulations' is large (5000), 
    # iterating over years is actually fine.
    # The optimization is ensuring we don't do single-scalar ops.
    # The existing code IS vectorized across simulations!
    
    # Let's just optimize the memory allocation and random generation (already done above).
    # We can use slightly faster math operations.
    
    # Pre-calculate growth factors for all years at once
    all_growth_factors = np.exp(returns)
    
    for t in range(1, years + 1):
        # Apply growth
        # In-place multiplication if possible for memory, but be careful with views
        current_growth = all_growth_factors[:, t-1]
        
        # balances[:, t] = balances[:, t-1] * current_growth + net_flow
        # use np.multiply and np.add to be explicit
        
        prev_balance = balances[:, t-1]
        
        # New Balance
        new_balance = prev_balance * current_growth + net_flow
        
        # Apply floor of 0
        balances[:, t] = np.maximum(new_balance, 0)
        
    # Calculate Metrics
    final_balances = balances[:, -1]
    success_count = np.sum(final_balances > 0)
    success_rate = (success_count / simulations) * 100
    
    median_path = np.median(balances, axis=0)
    percentile_10 = np.percentile(balances, 10, axis=0)
    percentile_90 = np.percentile(balances, 90, axis=0)
    
    # Downsample for frontend chart (e.g. only return 50 paths + stats)
    # We want to show the "Cloud" of possibilities
    chart_paths = []
    # Pick a few random paths to visualize
    sample_indices = rng.choice(simulations, size=20, replace=False)
    for idx in sample_indices:
        chart_paths.append({"type": "sample", "data": balances[idx].tolist()})
        
    return {
        "success_rate": float(success_rate),
        "median_final_balance": float(np.median(final_balances)),
        "worst_case_final_balance": float(np.percentile(final_balances, 10)), # 10th percentile
        "years": list(range(years + 1)),
        "percentiles": {
            "median": median_path.tolist(),
            "p10": percentile_10.tolist(),
            "p90": percentile_90.tolist()
        },
        "sample_paths": chart_paths,
        "params": {
            "mu": mu,
            "sigma": sigma
        }
    }
