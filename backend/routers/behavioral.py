from fastapi import APIRouter
from services.behavioral import (
    get_sentiment_analysis, 
    get_strategy_comparison, 
    get_trending_tickers, 
    get_superinvestor_data,
    get_fear_greed_index,
    get_cognitive_biases,
    get_trader_personality_test
)
import asyncio

router = APIRouter(prefix="/api/behavioral", tags=["behavioral"])

@router.get("/sentiment/{ticker}")
async def sentiment(ticker: str):
    return await asyncio.to_thread(get_sentiment_analysis, ticker)

@router.get("/inverse-cramer")
async def inverse_cramer():
    # Mapped to the new strategy comparison
    return await asyncio.to_thread(get_strategy_comparison)

@router.get("/trending")
async def trending():
    return await asyncio.to_thread(get_trending_tickers)

@router.get("/whales")
async def whales():
    return await asyncio.to_thread(get_superinvestor_data)

@router.get("/fear-greed")
async def fear_greed():
    return await asyncio.to_thread(get_fear_greed_index)

@router.get("/biases")
async def biases():
    return await asyncio.to_thread(get_cognitive_biases)

@router.get("/personality")
async def personality():
    return await asyncio.to_thread(get_trader_personality_test)
