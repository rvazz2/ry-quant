import yfinance as yf
import pandas as pd
import numpy as np

def get_financials_safe(ticker_obj):
    """Helper to get financials with error handling."""
    try:
        # Prefer annual data for stability
        inc = ticker_obj.financials
        bal = ticker_obj.balance_sheet
        cash = ticker_obj.cashflow
        
        if inc.empty: inc = ticker_obj.quarterly_financials
        if bal.empty: bal = ticker_obj.quarterly_balance_sheet
        if cash.empty: cash = ticker_obj.quarterly_cashflow
        
        return inc, bal, cash
    except Exception:
        return None, None, None

def calculate_beneish_m_score(ticker: str):
    """
    Calculates the Beneish M-Score to detect earnings manipulation.
    Formula: M = -4.84 + 0.92*DSRI + 0.528*GMI + 0.404*AQI + 0.892*SGI + 0.115*DEPI - 0.172*SGAI + 4.679*TATA - 0.327*LVGI
    """
    t = yf.Ticker(ticker)
    inc, bal, cash = get_financials_safe(t)
    
    if inc is None or bal is None or inc.shape[1] < 2:
        return {"error": "Insufficient data"}

    # Ascending order (oldest first) so iloc[-1] is current, iloc[-2] is prev
    # yfinance returns newest first (column 0 is T, column 1 is T-1)
    # We need Year T (current) and Year T-1 (previous)
    
    try:
        T = 0 # Current Year
        P = 1 # Previous Year
        
        # Helper to extract value safely
        def get_val(df, row_name, col_idx):
            try:
                # Try partial match for flexibility
                matches = [i for i in df.index if row_name.lower() in i.lower()]
                if not matches: return 0.0
                return float(df.loc[matches[0]].iloc[col_idx])
            except Exception:
                return 0.0

        # --- Variables ---
        # Net Receivables
        rec_t = get_val(bal, "Net Receivables", T)
        rec_p = get_val(bal, "Net Receivables", P)
        # Sales (Total Revenue)
        sales_t = get_val(inc, "Total Revenue", T)
        sales_p = get_val(inc, "Total Revenue", P)
        # Cost of Goods Sold
        cogs_t = get_val(inc, "Cost Of Revenue", T)
        cogs_p = get_val(inc, "Cost Of Revenue", P)
        # Total Assets
        assets_t = get_val(bal, "Total Assets", T)
        assets_p = get_val(bal, "Total Assets", P)
        # PPE
        ppe_t = get_val(bal, "Net PPE", T) # Property Plant Equipment
        if ppe_t == 0: ppe_t = get_val(bal, "Gross PPE", T) # Fallback
        
        ppe_p = get_val(bal, "Net PPE", P)
        
        # Current Assets
        ca_t = get_val(bal, "Current Assets", T)
        ca_p = get_val(bal, "Current Assets", P)
        # Securities (if any in CA) - approximating to 0 for simplicity if strict match fails
        
        # Depreciation
        dep_t = get_val(cash, "Depreciation", T) # Often in CF
        dep_p = get_val(cash, "Depreciation", P)
        
        # SGA
        sga_t = get_val(inc, "Selling General And Administration", T)
        sga_p = get_val(inc, "Selling General And Administration", P)
        
        # Net Income (for TATA, though TATA uses Income from Continuing Ops usually)
        ni_t = get_val(inc, "Net Income", T)
        cf_ops_t = get_val(cash, "Operating Cash Flow", T)
        
        # Current Liabilities
        cl_t = get_val(bal, "Current Liabilities", T)
        cl_p = get_val(bal, "Current Liabilities", P)
        
        # Long Term Debt
        ltd_t = get_val(bal, "Long Term Debt", T)
        ltd_p = get_val(bal, "Long Term Debt", P)
        
        # --- Ratios ---
        
        # 1. DSRI: Days Sales in Receivables Index
        # (Rec_t / Sales_t) / (Rec_p / Sales_p)
        dsri = (rec_t / sales_t) / (rec_p / sales_p) if sales_t and sales_p and rec_p else 1.0
        
        # 2. GMI: Gross Margin Index
        # ((Sales_p - COGS_p) / Sales_p) / ((Sales_t - COGS_t) / Sales_t)
        gm_p = (sales_p - cogs_p) / sales_p if sales_p else 0
        gm_t = (sales_t - cogs_t) / sales_t if sales_t else 1
        gmi = gm_p / gm_t if gm_t != 0 else 1.0
        
        # 3. AQI: Asset Quality Index
        # (1 - (CA_t + PPE_t)/Assets_t) / (1 - (CA_p + PPE_p)/Assets_p)
        aq_t = 1 - ((ca_t + ppe_t) / assets_t) if assets_t else 0
        aq_p = 1 - ((ca_p + ppe_p) / assets_p) if assets_p else 0
        aqi = aq_t / aq_p if aq_p != 0 else 1.0
        
        # 4. SGI: Sales Growth Index
        # Sales_t / Sales_p
        sgi = sales_t / sales_p if sales_p else 1.0
        
        # 5. DEPI: Depreciation Index
        # (Dep_p / (PPE_p + Dep_p)) / (Dep_t / (PPE_t + Dep_t))
        rate_p = dep_p / (ppe_p + dep_p) if (ppe_p + dep_p) else 0
        rate_t = dep_t / (ppe_t + dep_t) if (ppe_t + dep_t) else 1
        depi = rate_p / rate_t if rate_t != 0 else 1.0
        
        # 6. SGAI: SGA Index
        # (SGA_t / Sales_t) / (SGA_p / Sales_p)
        sgai = (sga_t / sales_t) / (sga_p / sales_p) if sales_t and sales_p and sga_p else 1.0
        
        # 7. LVGI: Leverage Index
        # ((CL_t + LTD_t) / Assets_t) / ((CL_p + LTD_p) / Assets_p)
        lev_t = (cl_t + ltd_t) / assets_t if assets_t else 0
        lev_p = (cl_p + ltd_p) / assets_p if assets_p else 0
        lvgi = lev_t / lev_p if lev_p != 0 else 1.0
        
        # 8. TATA: Total Accruals to Total Assets
        # (Net Income_t - CF_Ops_t) / Assets_t
        tata = (ni_t - cf_ops_t) / assets_t if assets_t else 0
        
        # Beneish M-Score Formula (8 variable)
        m_score = -4.84 + (0.92 * dsri) + (0.528 * gmi) + (0.404 * aqi) + (0.892 * sgi) + (0.115 * depi) - (0.172 * sgai) + (4.679 * tata) - (0.327 * lvgi)
        
        # Prob of Manipulation (cdf of normal distribution)
        # Not strictly standard normal, but commonly approximated or just interpreted by threshold > -1.78

        
        return {
            "m_score": m_score,
            "manipulator": m_score > -1.78,
            "details": {
                "DSRI": dsri,
                "GMI": gmi,
                "AQI": aqi,
                "SGI": sgi,
                "DEPI": depi,
                "SGAI": sgai,
                "LVGI": lvgi,
                "TATA": tata
            },
            "ticker": ticker
        }

    except Exception as e:
        print(f"Error calculating M-Score: {e}")
        return {"error": str(e)}

def calculate_dupont(ticker: str):
    """
    Decomposes ROE into Profit Margin, Asset Turnover, and Financial Leverage.
    """
    t = yf.Ticker(ticker)
    inc, bal, cash = get_financials_safe(t)
    
    if inc is None or bal is None: return {"error": "Data unavailable"}
    
    try:
        def get_val(df, row_name):
            try:
                matches = [i for i in df.index if row_name.lower() in i.lower()]
                if not matches: return 0.0
                return float(df.loc[matches[0]].iloc[0]) # Current year
            except Exception:
                return 0.0
                
        net_income = get_val(inc, "Net Income")
        revenue = get_val(inc, "Total Revenue")
        assets = get_val(bal, "Total Assets")
        equity = get_val(bal, "Stockholders Equity")
        
        # Ratios
        net_margin = net_income / revenue if revenue else 0
        asset_turnover = revenue / assets if assets else 0
        leverage = assets / equity if equity else 0
        roe = net_margin * asset_turnover * leverage
        
        return {
            "roe": roe,
            "net_margin": net_margin,
            "asset_turnover": asset_turnover,
            "leverage": leverage,
            "ticker": ticker
        }
    except Exception as e:
        return {"error": str(e)}
