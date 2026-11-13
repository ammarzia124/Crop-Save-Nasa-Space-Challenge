"""CropSave API: 30-day drought risk for Pakistani districts from NASA POWER data.

Run: uvicorn main:app --reload   (from the backend/ folder)
"""
import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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

# CORS with safe defaults
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
origins = [origin.strip() for origin in cors_origins if origin.strip()]

if "*" in origins:
    logging.warning("⚠️  CORS wildcard (*) detected - insecure for production!")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Internal error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error. Please try again."}
    )


@app.get("/health")
def health():
    """Server health check."""
    return {"status": "ok", "model_loaded": model_loaded}


# Include routers
app.include_router(predict.router)
app.include_router(advisory.router)
app.include_router(history.router)
