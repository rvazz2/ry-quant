from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.mergers import calculate_accretion_dilution
import asyncio

router = APIRouter(prefix="/api/mergers", tags=["mergers"])

class MergerRequest(BaseModel):
    acquirer_price: float
    acquirer_eps: float
    acquirer_shares: float
    target_price: float
    target_eps: float
    target_shares: float
    offer_price: float
    cash_percent: float
    synergies: float
    interest_rate: float = 0.05

@router.post("/calculate")
async def calculate_merger(request: MergerRequest):
    try:
        return await asyncio.to_thread(
            calculate_accretion_dilution,
            request.acquirer_price,
            request.acquirer_eps,
            request.acquirer_shares,
            request.target_price,
            request.target_eps,
            request.target_shares,
            request.offer_price,
            request.cash_percent / 100.0, # Convert from 0-100 to 0-1
            request.synergies,
            interest_rate=request.interest_rate
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
