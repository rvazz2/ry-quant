from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.planning import run_monte_carlo_simulation
from services.store import get_user_data, set_user_data
import asyncio

router = APIRouter(prefix="/api/planning", tags=["planning"])

class SimRequest(BaseModel):
    initial_balance: float
    annual_contribution: float
    annual_withdrawal: float
    years: int
    risk_level: float

@router.post("/simulate")
async def simulate(request: SimRequest):
    try:
        return await asyncio.to_thread(
            run_monte_carlo_simulation,
            request.initial_balance,
            request.annual_contribution,
            request.annual_withdrawal,
            request.years,
            request.risk_level
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class UserProfile(BaseModel):
    salary: float
    filing_status: str
    age: int
    retirement_age: int
    savings_rate: float

@router.get("/profile")
async def get_profile():
    return get_user_data("planning_profile", {
        "salary": 65000,
        "filing_status": "single",
        "age": 25,
        "retirement_age": 65,
        "savings_rate": 20
    })

@router.post("/profile")
async def save_profile(profile: UserProfile):
    set_user_data("planning_profile", profile.dict())
    return {"status": "success", "profile": profile}
