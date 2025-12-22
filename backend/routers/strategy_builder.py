from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from services.strategy_compiler import StrategyCompiler
import asyncio

from services.store import set_user_data

router = APIRouter(prefix="/api/strategy", tags=["strategy"])

class StrategyGraph(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

class CompileRequest(BaseModel):
    graph: StrategyGraph

@router.post("/compile")
async def compile_strategy(request: CompileRequest):
    try:
        # Convert Pydantic model to dict
        graph_dict = request.graph.dict()
        compiled_strategy = await asyncio.to_thread(StrategyCompiler.compile, graph_dict)
        return {"status": "success", "strategy": compiled_strategy}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/save")
async def save_strategy(request: CompileRequest):
    try:
        # Save to store
        graph_dict = request.graph.dict()
        # In a real app we might want to save by ID or user, for now we overwrite "current_strategy"
        set_user_data("current_strategy", graph_dict)
        return {"status": "success", "message": "Strategy saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
