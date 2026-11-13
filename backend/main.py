"""CropSave API: 30-day drought risk for Pakistani districts from NASA POWER data.

Run: uvicorn main:app --reload   (from the backend/ folder)
"""
import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from routes import predict, advisory, history
from services.ml_service import model_loaded

load_dotenv()

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="CropSave API",
    description="Drought risk from NASA POWER satellite data"
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Server health check."""
    return {"status": "ok", "model_loaded": model_loaded}


# Include routers
app.include_router(predict.router)
app.include_router(advisory.router)
app.include_router(history.router)
