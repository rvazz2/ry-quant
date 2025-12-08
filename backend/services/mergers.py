import pandas as pd

def calculate_accretion_dilution(
    acquirer_price: float,
    acquirer_eps: float,
    acquirer_shares: float,
    target_price: float,
    target_eps: float,
    target_shares: float,
    offer_price: float,
    cash_percent: float, # 0.0 to 1.0
    synergies: float,
    tax_rate: float = 0.21,
    interest_rate: float = 0.05
):
    """
    Calculates the Accretion/Dilution of a merger deal.
    """
    # Deal Value
    equity_value = offer_price * target_shares
    
    # Financing
    cash_consideration = equity_value * cash_percent
    stock_consideration = equity_value * (1 - cash_percent)
    
    # New Shares Issued
    new_shares = stock_consideration / acquirer_price
    
    # Cost of Debt (After Tax)
    foregone_interest = cash_consideration * interest_rate * (1 - tax_rate)
    
    # Pro Forma Net Income
    acquirer_ni = acquirer_eps * acquirer_shares
    target_ni = target_eps * target_shares
    
    # Synergies (After Tax)
    synergies_at = synergies * (1 - tax_rate)
    
    pro_forma_ni = acquirer_ni + target_ni + synergies_at - foregone_interest
    
    # Pro Forma Shares
    pro_forma_shares = acquirer_shares + new_shares
    
    # Pro Forma EPS
    pro_forma_eps = pro_forma_ni / pro_forma_shares
    
    # Accretion / Dilution
    accretion_dilution_val = pro_forma_eps - acquirer_eps
    accretion_dilution_pct = (accretion_dilution_val / acquirer_eps) * 100
    
    return {
        "deal_value": equity_value,
        "cash_used": cash_consideration,
        "stock_used": stock_consideration,
        "new_shares_issued": new_shares,
        "pro_forma_net_income": pro_forma_ni,
        "pro_forma_eps": pro_forma_eps,
        "accretion_dilution_value": accretion_dilution_val,
        "accretion_dilution_percent": accretion_dilution_pct,
        "is_accretive": accretion_dilution_val > 0
    }
