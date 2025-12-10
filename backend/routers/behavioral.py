from fastapi import APIRouter, HTTPException
from services.behavioral import get_sentiment_analysis, get_inverse_cramer_data, get_trending_tickers, get_superinvestor_data

router = APIRouter(prefix="/api/behavioral", tags=["behavioral"])

import asyncio

@router.get("/sentiment/{ticker}")
async def sentiment(ticker: str):
    return await asyncio.to_thread(get_sentiment_analysis, ticker)

@router.get("/inverse-cramer")
async def inverse_cramer():
    return await asyncio.to_thread(get_inverse_cramer_data)

@router.get("/trending")
async def trending():
    return await asyncio.to_thread(get_trending_tickers)

@router.get("/whales")
async def whales():
    return await asyncio.to_thread(get_superinvestor_data)
