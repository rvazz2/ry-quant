from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from services.ai import get_ai_response, generate_analyst_report

router = APIRouter(prefix="/api/ai", tags=["ai"])

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str

class ReportRequest(BaseModel):
    ticker: str

class ReportResponse(BaseModel):
    report_content: str

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    response = await get_ai_response(request.message, request.context)
    return ChatResponse(response=response)

@router.post("/generate_report", response_model=ReportResponse)
async def generate_report(request: ReportRequest):
    if not request.ticker:
        raise HTTPException(status_code=400, detail="Ticker is required")
    
    report = await generate_analyst_report(request.ticker)
    return ReportResponse(report_content=report)
