from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from services.report_generator import ReportGenerator

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/generate/{ticker}")
async def generate_report_pdf(ticker: str):
    try:
        pdf_buffer = await ReportGenerator.create_pdf_report(ticker)
        return StreamingResponse(
            pdf_buffer, 
            media_type="application/pdf", 
            headers={"Content-Disposition": f"attachment; filename={ticker}_Analyst_Report.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
