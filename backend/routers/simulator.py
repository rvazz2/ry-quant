from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.store import get_user_data, set_user_data
from datetime import datetime

router = APIRouter(prefix="/api/simulator", tags=["simulator"])

# --- Models ---
class Position(BaseModel):
    symbol: str
    shares: int
    avgCost: float

class PortfolioState(BaseModel):
    cash: float
    holdings: List[Position]

class TradeRequest(BaseModel):
    symbol: str
    action: str  # "BUY" or "SELL"
    shares: int
    price: float # Frontend provides price to avoid slippage issues during sim

class TradeHistoryItem(BaseModel):
    timestamp: str
    action: str
    symbol: str
    shares: int
    price: float
    total: float

class OptionPosition(BaseModel):
    symbol: str
    option_type: str  # "CALL" or "PUT"
    strike: float
    expiry: str  # ISO format date YYYY-MM-DD
    contracts: int  # Can be negative for short options
    premium: float  # Premium per share (entry price)

class OptionTradeRequest(BaseModel):
    symbol: str
    option_type: str  # "CALL" or "PUT"
    strike: float
    expiry: str
    action: str  # "BUY" or "SELL" (BUY = long, SELL = short/write)
    contracts: int
    premium: float  # Premium per share

# --- Defaults ---
INITIAL_CASH = 100000.0

# --- Endpoints ---

@router.get("/portfolio")
async def get_portfolio():
    """Get current portfolio state."""
    portfolio = get_user_data("simulator_portfolio", [])
    cash = get_user_data("simulator_cash", INITIAL_CASH)
    return {"cash": cash, "portfolio": portfolio}

@router.get("/options")
async def get_options():
    """Get options positions."""
    options = get_user_data("simulator_options", [])
    return {"options": options}

@router.get("/history")
async def get_trade_history():
    """Get trade history."""
    history = get_user_data("simulator_history", [])
    return {"history": history}

@router.get("/analytics")
async def get_analytics():
    """Get performance analytics."""
    portfolio = get_user_data("simulator_portfolio", [])
    history = get_user_data("simulator_history", [])
    cash = get_user_data("simulator_cash", INITIAL_CASH)
    
    # Calculate portfolio value
    portfolio_value = 0
    for pos in portfolio:
        current_price = pos.get("currentPrice", pos["avgCost"])
        if pos["shares"] > 0:
            portfolio_value += pos["shares"] * current_price
        else:
            # Short position liability: We owe these shares.
            # Equity impact = (Short Proceeds - Cost to Cover)
            # Short Proceeds were added to cash when sold.
            # Liability = abs(shares) * current_price
            # This is negative value in equity terms relative to cash held?
            # Actually simplest: Equity = Cash + AssetValue - Liabilities.
            # Longs are AssetValue. Shorts are Liabilities.
            # Total Equity = Cash - (abs(shares) * currentPrice)
            # BUT: In our system, when we Short, we ADDED to Cash.
            # So Cash is inflated. We must subtract current value of short to get Equity.
            portfolio_value -= abs(pos["shares"]) * current_price

    total_equity = cash + portfolio_value
    total_return = total_equity - INITIAL_CASH
    return_pct = (total_return / INITIAL_CASH) * 100
    
    # Calculate trade statistics
    total_trades = len(history)
    buy_trades = len([t for t in history if t["action"] == "BUY"])
    sell_trades = len([t for t in history if t["action"] == "SELL"])
    
    # Find best and worst performers
    best_performer = None
    worst_performer = None
    
    if portfolio:
        for pos in portfolio:
            current_price = pos.get("currentPrice", pos["avgCost"])
            
            if pos["shares"] > 0:
                # Long: (Current - Avg) / Avg
                gain_pct = ((current_price - pos["avgCost"]) / pos["avgCost"]) * 100
            else:
                # Short: (Avg - Current) / Avg
                # If we sold at 100 (Avg), now 80 (Current). Gain = 20. 20/100 = 20%
                gain_pct = ((pos["avgCost"] - current_price) / pos["avgCost"]) * 100
            
            if best_performer is None or gain_pct > best_performer["gain_pct"]:
                best_performer = {"symbol": pos["symbol"], "gain_pct": gain_pct}
            
            if worst_performer is None or gain_pct < worst_performer["gain_pct"]:
                worst_performer = {"symbol": pos["symbol"], "gain_pct": gain_pct}
    
    return {
        "total_equity": total_equity,
        "total_return": total_return,
        "return_pct": return_pct,
        "total_trades": total_trades,
        "buy_trades": buy_trades,
        "sell_trades": sell_trades,
        "best_performer": best_performer,
        "worst_performer": worst_performer
    }

@router.post("/reset")
async def reset_portfolio():
    """Reset simulation to initial state."""
    set_user_data("simulator_portfolio", [])
    set_user_data("simulator_cash", INITIAL_CASH)
    set_user_data("simulator_history", [])
    set_user_data("simulator_options", [])
    return {"cash": INITIAL_CASH, "portfolio": [], "history": [], "options": []}

@router.post("/trade")
async def execute_trade(trade: TradeRequest):
    """Execute a buy or sell order."""
    portfolio = get_user_data("simulator_portfolio", [])
    cash = get_user_data("simulator_cash", INITIAL_CASH)
    history = get_user_data("simulator_history", [])
    
    # Validations
    if trade.shares <= 0:
        raise HTTPException(status_code=400, detail="Shares must be greater than 0")
    
    if trade.price <= 0:
        raise HTTPException(status_code=400, detail="Price must be greater than 0")
    
    symbol = trade.symbol.upper().strip()
    
    if not symbol or len(symbol) > 5:
        raise HTTPException(status_code=400, detail="Invalid ticker symbol")
    
    cost = trade.shares * trade.price
    transaction_total = 0

    if trade.action == "BUY":
        # Check if covering a short position (shares < 0)
        # OR buying long (shares >= 0)
        
        # We need to deduct cash in both cases.
        # If covering short, we are paying to buy back.
        # IF buying long, we are paying to acquire.
        
        if cost > cash:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient buying power. Cost ${cost:,.2f}, Available ${cash:,.2f}"
            )
        
        cash -= cost
        transaction_total = -cost
        
        # Update holdings
        found = False
        new_portfolio = []
        for pos in portfolio:
            if pos["symbol"] == symbol:
                current_shares = pos["shares"]
                
                if current_shares < 0:
                    # Covering Short
                    # E.g. -10 shares. Buying 5. New = -5.
                    # AvgCost logic for shorts:
                    # Usually AvgCost is the price we SOLD at.
                    # When we cover, we realize P&L. 
                    # But for simplicity in this MVP:
                    # Just adjust share count. Realized P&L flows into Cash balance automatically (Entry Cash - Exit Cash).
                    # Wait, if we just subtract Cost from Cash, and we had added Proceeds to Cash earlier, the net change in cash IS the P&L.
                    # So we just update the share count. 
                    # If we flip from Short to Long (e.g. -5 to +5), we need to handle that carefully?
                    # -5 shares. Buy 10. Result +5.
                    # Cost = 10 * Price. Cash -= Cost.
                    # Share count becomes +5. 
                    # Avg Cost for the NEW +5 position? 
                    # This is complex. Let's simplify: 
                    # If crossing zero, reset Avg Cost for the remainder.
                    
                    remaining = current_shares + trade.shares
                    if remaining == 0:
                        # Position closed
                        pass # Don't add to new_portfolio
                    elif remaining > 0:
                        # Flipped to Long
                        # The 5 'extra' shares are new Longs.
                        # Avg Cost is the current buy price.
                        pos["shares"] = remaining
                        pos["avgCost"] = trade.price
                        new_portfolio.append(pos)
                    else:
                        # Still Short
                        # Avg Cost remains the entry price of the short (weighted avg if we added to short)
                        # But we are REDUCING short, so Avg Cost doesn't change?
                        # Correct. Covering doesn't change avg cost of remaining short.
                        pos["shares"] = remaining
                        new_portfolio.append(pos)
                else:
                    # Adding to Long
                    total_shares = pos["shares"] + trade.shares
                    total_cost = (pos["shares"] * pos["avgCost"]) + cost
                    avg_cost = total_cost / total_shares
                    pos["shares"] = total_shares
                    pos["avgCost"] = avg_cost
                    new_portfolio.append(pos)
                found = True
            else:
                new_portfolio.append(pos)
        
        if not found:
            new_portfolio.append({"symbol": symbol, "shares": trade.shares, "avgCost": trade.price})
        
        portfolio = new_portfolio

    elif trade.action == "SELL":
        # Selling generates Cash (Proceeds).
        # If Long: Reducing position.
        # If Short: Increasing short position.
        
        cash += cost
        transaction_total = cost
        
        # Update holdings
        found = False
        new_portfolio = []
        for pos in portfolio:
            if pos["symbol"] == symbol:
                current_shares = pos["shares"]
                new_shares = current_shares - trade.shares
                
                if current_shares > 0:
                    # Was Long
                    if new_shares == 0:
                        # Closed
                        pass 
                    elif new_shares < 0:
                        # Flipped to Short
                        # Avg Cost becomes current price for the new short shares
                        pos["shares"] = new_shares
                        pos["avgCost"] = trade.price
                        new_portfolio.append(pos)
                    else:
                        # Still Long. Reducing. 
                        # Avg Cost doesn't change when reducing long.
                        pos["shares"] = new_shares
                        new_portfolio.append(pos)
                else:
                    # Was Short (or 0). Adding to Short.
                    # update weighted avg cost
                    # Current Cost Basis (liability) = abs(current) * avgCost
                    # New Liability = trade.shares * price
                    # Total Liab / Total Shares
                    old_liab = abs(current_shares) * pos["avgCost"]
                    new_liab = trade.shares * trade.price
                    if abs(new_shares) > 0:
                        new_avg = (old_liab + new_liab) / abs(new_shares)
                        pos["shares"] = new_shares
                        pos["avgCost"] = new_avg
                        new_portfolio.append(pos)
                
                found = True
            else:
                new_portfolio.append(pos)
        
        if not found:
            # Opening new Short
            new_portfolio.append({"symbol": symbol, "shares": -trade.shares, "avgCost": trade.price})
            
        portfolio = new_portfolio
    
    else:
        raise HTTPException(status_code=400, detail="Action must be BUY or SELL")
    
    # Log trade in history
    trade_record = {
        "timestamp": datetime.now().isoformat(),
        "action": trade.action,
        "symbol": symbol,
        "shares": trade.shares,
        "price": trade.price,
        "total": abs(transaction_total)
    }
    # Ensure history is a list
    if not isinstance(history, list):
        history = []
        
    history.append(trade_record)

    # Save
    set_user_data("simulator_portfolio", portfolio)
    set_user_data("simulator_cash", cash)
    set_user_data("simulator_history", history)

    return {
        "cash": cash, 
        "portfolio": portfolio, 
        "message": f"{trade.action} order executed: {trade.shares} shares of {symbol} @ ${trade.price:.2f}"
    }

 
 @ r o u t e r . p o s t ( " / t r a d e / o p t i o n " )  
 a s y n c   d e f   e x e c u t e _ o p t i o n _ t r a d e ( t r a d e :   O p t i o n T r a d e R e q u e s t ) :  
         " " " E x e c u t e   a n   o p t i o n s   t r a d e . " " "  
         o p t i o n s _ p o r t f o l i o   =   g e t _ u s e r _ d a t a ( " s i m u l a t o r _ o p t i o n s " ,   [ ] )  
         c a s h   =   g e t _ u s e r _ d a t a ( " s i m u l a t o r _ c a s h " ,   I N I T I A L _ C A S H )  
         h i s t o r y   =   g e t _ u s e r _ d a t a ( " s i m u l a t o r _ h i s t o r y " ,   [ ] )  
          
         #   V a l i d a t i o n s  
         i f   t r a d e . c o n t r a c t s   < =   0 :  
                 r a i s e   H T T P E x c e p t i o n ( s t a t u s _ c o d e = 4 0 0 ,   d e t a i l = " C o n t r a c t s   m u s t   b e   g r e a t e r   t h a n   0 " )  
          
         i f   t r a d e . p r e m i u m   < =   0 :  
                 r a i s e   H T T P E x c e p t i o n ( s t a t u s _ c o d e = 4 0 0 ,   d e t a i l = " P r e m i u m   m u s t   b e   g r e a t e r   t h a n   0 " )  
          
         i f   t r a d e . o p t i o n _ t y p e   n o t   i n   [ " C A L L " ,   " P U T " ] :  
                 r a i s e   H T T P E x c e p t i o n ( s t a t u s _ c o d e = 4 0 0 ,   d e t a i l = " O p t i o n   t y p e   m u s t   b e   C A L L   o r   P U T " )  
          
         s y m b o l   =   t r a d e . s y m b o l . u p p e r ( ) . s t r i p ( )  
          
         i f   n o t   s y m b o l   o r   l e n ( s y m b o l )   >   5 :  
                 r a i s e   H T T P E x c e p t i o n ( s t a t u s _ c o d e = 4 0 0 ,   d e t a i l = " I n v a l i d   t i c k e r   s y m b o l " )  
          
         #   C o s t   =   c o n t r a c t s   *   1 0 0   s h a r e s / c o n t r a c t   *   p r e m i u m   p e r   s h a r e  
         c o s t   =   t r a d e . c o n t r a c t s   *   1 0 0   *   t r a d e . p r e m i u m  
         t r a n s a c t i o n _ t o t a l   =   0  
          
         #   C r e a t e   p o s i t i o n   i d e n t i f i e r  
         p o s _ k e y   =   f " { s y m b o l } _ { t r a d e . o p t i o n _ t y p e } _ { t r a d e . s t r i k e } _ { t r a d e . e x p i r y } "  
          
         i f   t r a d e . a c t i o n   = =   " B U Y " :  
                 #   B u y i n g   o p t i o n   ( l o n g   c a l l   o r   l o n g   p u t )  
                 #   D e d u c t   p r e m i u m   f r o m   c a s h  
                 i f   c o s t   >   c a s h :  
                         r a i s e   H T T P E x c e p t i o n (  
                                 s t a t u s _ c o d e = 4 0 0 ,  
                                 d e t a i l = f " I n s u f f i c i e n t   f u n d s .   N e e d   $ { c o s t : , . 2 f } ,   h a v e   $ { c a s h : , . 2 f } "  
                         )  
                  
                 c a s h   - =   c o s t  
                 t r a n s a c t i o n _ t o t a l   =   - c o s t  
                  
                 #   A d d   t o   o p t i o n s   p o r t f o l i o  
                 f o u n d   =   F a l s e  
                 n e w _ o p t i o n s   =   [ ]  
                 f o r   o p t   i n   o p t i o n s _ p o r t f o l i o :  
                         i f   ( o p t [ " s y m b o l " ]   = =   s y m b o l   a n d    
                                 o p t [ " o p t i o n _ t y p e " ]   = =   t r a d e . o p t i o n _ t y p e   a n d  
                                 o p t [ " s t r i k e " ]   = =   t r a d e . s t r i k e   a n d  
                                 o p t [ " e x p i r y " ]   = =   t r a d e . e x p i r y ) :  
                                 #   A v e r a g e   i n   i f   s a m e   o p t i o n  
                                 t o t a l _ c o n t r a c t s   =   o p t [ " c o n t r a c t s " ]   +   t r a d e . c o n t r a c t s  
                                 i f   t o t a l _ c o n t r a c t s   = =   0 :  
                                         #   P o s i t i o n   c l o s e d  
                                         p a s s  
                                 e l s e :  
                                         t o t a l _ c o s t   =   a b s ( o p t [ " c o n t r a c t s " ] )   *   1 0 0   *   o p t [ " p r e m i u m " ]   +   c o s t  
                                         a v g _ p r e m i u m   =   t o t a l _ c o s t   /   ( a b s ( t o t a l _ c o n t r a c t s )   *   1 0 0 )  
                                         o p t [ " c o n t r a c t s " ]   =   t o t a l _ c o n t r a c t s  
                                         o p t [ " p r e m i u m " ]   =   a v g _ p r e m i u m  
                                         n e w _ o p t i o n s . a p p e n d ( o p t )  
                                 f o u n d   =   T r u e  
                         e l s e :  
                                 n e w _ o p t i o n s . a p p e n d ( o p t )  
                  
                 i f   n o t   f o u n d :  
                         n e w _ o p t i o n s . a p p e n d ( {  
                                 " s y m b o l " :   s y m b o l ,  
                                 " o p t i o n _ t y p e " :   t r a d e . o p t i o n _ t y p e ,  
                                 " s t r i k e " :   t r a d e . s t r i k e ,  
                                 " e x p i r y " :   t r a d e . e x p i r y ,  
                                 " c o n t r a c t s " :   t r a d e . c o n t r a c t s ,  
                                 " p r e m i u m " :   t r a d e . p r e m i u m  
                         } )  
                  
                 o p t i o n s _ p o r t f o l i o   =   n e w _ o p t i o n s  
          
         e l i f   t r a d e . a c t i o n   = =   " S E L L " :  
                 #   S e l l i n g   o p t i o n   ( w r i t i n g / s h o r t i n g   c a l l   o r   p u t ,   o r   c l o s i n g   l o n g )  
                 #   A d d   p r e m i u m   t o   c a s h  
                 c a s h   + =   c o s t  
                 t r a n s a c t i o n _ t o t a l   =   c o s t  
                  
                 #   U p d a t e   o p t i o n s   p o r t f o l i o  
                 f o u n d   =   F a l s e  
                 n e w _ o p t i o n s   =   [ ]  
                 f o r   o p t   i n   o p t i o n s _ p o r t f o l i o :  
                         i f   ( o p t [ " s y m b o l " ]   = =   s y m b o l   a n d    
                                 o p t [ " o p t i o n _ t y p e " ]   = =   t r a d e . o p t i o n _ t y p e   a n d  
                                 o p t [ " s t r i k e " ]   = =   t r a d e . s t r i k e   a n d  
                                 o p t [ " e x p i r y " ]   = =   t r a d e . e x p i r y ) :  
                                 #   R e d u c e   p o s i t i o n  
                                 n e w _ c o n t r a c t s   =   o p t [ " c o n t r a c t s " ]   -   t r a d e . c o n t r a c t s  
                                 i f   n e w _ c o n t r a c t s   = =   0 :  
                                         #   P o s i t i o n   c l o s e d ,   d o n ' t   a d d   t o   n e w _ o p t i o n s  
                                         p a s s  
                                 e l s e :  
                                         #   P o s i t i o n   r e d u c e d   o r   f l i p p e d   t o   s h o r t  
                                         i f   n e w _ c o n t r a c t s   >   0 :  
                                                 #   S t i l l   l o n g ,   k e e p   s a m e   p r e m i u m  
                                                 o p t [ " c o n t r a c t s " ]   =   n e w _ c o n t r a c t s  
                                                 n e w _ o p t i o n s . a p p e n d ( o p t )  
                                         e l s e :  
                                                 #   F l i p p e d   t o   s h o r t   o r   a d d i n g   t o   s h o r t  
                                                 #   F o r   s h o r t ,   p r e m i u m   i s   t h e   p r i c e   w e   r e c e i v e d  
                                                 o p t [ " c o n t r a c t s " ]   =   n e w _ c o n t r a c t s  
                                                 o p t [ " p r e m i u m " ]   =   t r a d e . p r e m i u m  
                                                 n e w _ o p t i o n s . a p p e n d ( o p t )  
                                 f o u n d   =   T r u e  
                         e l s e :  
                                 n e w _ o p t i o n s . a p p e n d ( o p t )  
                  
                 i f   n o t   f o u n d :  
                         #   O p e n i n g   n e w   s h o r t   p o s i t i o n  
                         n e w _ o p t i o n s . a p p e n d ( {  
                                 " s y m b o l " :   s y m b o l ,  
                                 " o p t i o n _ t y p e " :   t r a d e . o p t i o n _ t y p e ,  
                                 " s t r i k e " :   t r a d e . s t r i k e ,  
                                 " e x p i r y " :   t r a d e . e x p i r y ,  
                                 " c o n t r a c t s " :   - t r a d e . c o n t r a c t s ,  
                                 " p r e m i u m " :   t r a d e . p r e m i u m  
                         } )  
                  
                 o p t i o n s _ p o r t f o l i o   =   n e w _ o p t i o n s  
          
         e l s e :  
                 r a i s e   H T T P E x c e p t i o n ( s t a t u s _ c o d e = 4 0 0 ,   d e t a i l = " A c t i o n   m u s t   b e   B U Y   o r   S E L L " )  
          
         #   L o g   t r a d e   i n   h i s t o r y  
         t r a d e _ r e c o r d   =   {  
                 " t i m e s t a m p " :   d a t e t i m e . n o w ( ) . i s o f o r m a t ( ) ,  
                 " a c t i o n " :   t r a d e . a c t i o n ,  
                 " s y m b o l " :   f " { s y m b o l }   { t r a d e . o p t i o n _ t y p e }   $ { t r a d e . s t r i k e }   { t r a d e . e x p i r y } " ,  
                 " s h a r e s " :   t r a d e . c o n t r a c t s ,  
                 " p r i c e " :   t r a d e . p r e m i u m ,  
                 " t o t a l " :   a b s ( t r a n s a c t i o n _ t o t a l )  
         }  
          
         i f   n o t   i s i n s t a n c e ( h i s t o r y ,   l i s t ) :  
                 h i s t o r y   =   [ ]  
          
         h i s t o r y . a p p e n d ( t r a d e _ r e c o r d )  
          
         #   S a v e  
         s e t _ u s e r _ d a t a ( " s i m u l a t o r _ o p t i o n s " ,   o p t i o n s _ p o r t f o l i o )  
         s e t _ u s e r _ d a t a ( " s i m u l a t o r _ c a s h " ,   c a s h )  
         s e t _ u s e r _ d a t a ( " s i m u l a t o r _ h i s t o r y " ,   h i s t o r y )  
          
         r e t u r n   {  
                 " c a s h " :   c a s h ,  
                 " o p t i o n s " :   o p t i o n s _ p o r t f o l i o ,  
                 " m e s s a g e " :   f " { t r a d e . a c t i o n }   o p t i o n   e x e c u t e d :   { t r a d e . c o n t r a c t s }   c o n t r a c t s   o f   { s y m b o l }   { t r a d e . o p t i o n _ t y p e }   $ { t r a d e . s t r i k e }   @   $ { t r a d e . p r e m i u m : . 2 f } "  
         }  
 