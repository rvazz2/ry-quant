from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
from services.stress_test import StressTester
import asyncio

router = APIRouter(prefix="/api/stress", tags=["stress"])

class StressRequest(BaseModel):
    portfolio: Dict[str, float] # Ticker -> Weight (should sum to 1.0)
    scenario: str

class MonteCarloRequest(BaseModel):
    portfolio: Dict[str, float]
    days: int = 252
    simulations: int = 1000

@router.get("/scenarios")
async def get_scenarios():
    return StressTester.SCENARIOS

@router.post("/run_scenario")
async def run_scenario_test(request: StressRequest):
    try:
        result = await asyncio.to_thread(StressTester.run_stress_test, request.portfolio, request.scenario)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/run_monte_carlo")
async def run_monte_carlo_test(request: MonteCarloRequest):
    try:
        result = await asyncio.to_thread(StressTester.run_monte_carlo, request.portfolio, request.days, request.simulations)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
