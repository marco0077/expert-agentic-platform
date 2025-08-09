from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import uvicorn
import os
from dotenv import load_dotenv

from agents.orchestrator import PythonOrchestratorAgent
from agents.analytics import AnalyticsAgent
from agents.ml_processor import MLProcessor

load_dotenv()

app = FastAPI(
    title="Expert Agentic Platform - Python Backend",
    description="Python backend for advanced analytics and ML processing",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = PythonOrchestratorAgent()
analytics_agent = AnalyticsAgent()
ml_processor = MLProcessor()

class QueryRequest(BaseModel):
    message: str
    user_profile: Optional[Dict] = None
    analysis_type: str = "standard"

class AnalyticsRequest(BaseModel):
    data: List[Dict]
    analysis_type: str = "descriptive"

class MLRequest(BaseModel):
    data: List[Dict]
    task_type: str = "classification"
    target: Optional[str] = None

@app.get("/")
async def root():
    return {
        "message": "Expert Agentic Platform - Python Backend",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "python-backend",
        "agents": {
            "orchestrator": "active",
            "analytics": "active",
            "ml_processor": "active"
        }
    }

@app.post("/api/analyze")
async def analyze_query(request: QueryRequest):
    try:
        result = await orchestrator.process_advanced_query(
            request.message, 
            request.user_profile,
            request.analysis_type
        )
        
        return {
            "analysis": result["analysis"],
            "insights": result["insights"],
            "recommendations": result["recommendations"],
            "confidence": result["confidence"],
            "processing_time": result["processing_time"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analytics")
async def run_analytics(request: AnalyticsRequest):
    try:
        results = await analytics_agent.analyze_data(
            request.data,
            request.analysis_type
        )
        
        return {
            "results": results,
            "visualizations": results.get("visualizations", []),
            "summary": results.get("summary", ""),
            "insights": results.get("insights", [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ml")
async def run_ml_analysis(request: MLRequest):
    try:
        results = await ml_processor.process_ml_task(
            request.data,
            request.task_type,
            request.target
        )
        
        return {
            "model_results": results["results"],
            "metrics": results["metrics"],
            "predictions": results.get("predictions", []),
            "feature_importance": results.get("feature_importance", {}),
            "model_type": results["model_type"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/capabilities")
async def get_capabilities():
    return {
        "analysis_types": [
            "descriptive", "predictive", "prescriptive", 
            "diagnostic", "cognitive", "comparative"
        ],
        "ml_tasks": [
            "classification", "regression", "clustering", 
            "anomaly_detection", "time_series", "nlp"
        ],
        "supported_formats": ["json", "csv", "text"],
        "max_data_points": 10000
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENVIRONMENT") == "development"
    )