"""Drought risk prediction endpoint - the most important endpoint for CropSave."""
import os
from datetime import date
from pathlib import Path

import joblib
import numpy as np
from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from models.schemas import PredictRequest, PredictResponse
from services.nasa_api import get_last_30_days_data, get_last_12_months_data

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Paths to ML model and scaler
ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = os.getenv("MODEL_PATH", str(ROOT.parent / "ml" / "models" / "random_forest.joblib"))
SCALER_PATH = os.getenv("SCALER_PATH", str(ROOT.parent / "ml" / "models" / "scaler.pkl"))

# Load model and scaler once at startup
try:
    print(f"Loading ML model from: {MODEL_PATH}")
    model = joblib.load(MODEL_PATH)
    print("✅ Model loaded successfully")
except FileNotFoundError:
    print(f"❌ Model file not found at {MODEL_PATH}")
    model = None

try:
    print(f"Loading scaler from: {SCALER_PATH}")
    scaler = joblib.load(SCALER_PATH)
    print("✅ Scaler loaded successfully")
except FileNotFoundError:
    print(f"⚠️  Scaler file not found at {SCALER_PATH}. Predictions will use unscaled features.")
    scaler = None


@router.post("/predict", response_model=PredictResponse)
@limiter.limit("10/minute")
def predict(request: Request, req: PredictRequest):
    """
    Predict 30-day drought risk for a district location.

    Rate limit: 10 requests per minute per IP address.

    This is the main prediction endpoint that:
    1. Fetches NASA climate data for the last 30 days
    2. Prepares features for the ML model
    3. Runs prediction
    4. Returns risk level (LOW/MEDIUM/HIGH) with score
    """
    print(f"\n{'='*60}")
    print(f"🌍 PREDICTION REQUEST: lat={req.lat}, lon={req.lon}")
    if req.district_name:
        print(f"📍 District: {req.district_name}")

    # Step 1: Validate model is loaded
    if model is None:
        print("❌ ERROR: Model not loaded")
        raise HTTPException(
            status_code=500,
            detail="Model not loaded. Contact team lead."
        )

    # Step 2: Fetch NASA climate data for last 30 days
    print("📡 Fetching NASA POWER data...")
    try:
        climate_data = get_last_30_days_data(req.lat, req.lon)
        print(f"✅ NASA data received:")
        print(f"   - Avg Rainfall: {climate_data['avg_rainfall']:.2f} mm")
        print(f"   - Avg Temp Max: {climate_data['avg_temp_max']:.2f}°C")
        print(f"   - Avg Humidity: {climate_data['avg_humidity']:.2f}%")
        print(f"   - Avg Soil Moisture: {climate_data['avg_soil_moisture']:.3f}")
    except Exception as e:
        print(f"❌ NASA API Error: {e}")
        raise HTTPException(
            status_code=503,
            detail="NASA data temporarily unavailable"
        )

    # Step 3: Get previous month's rainfall for feature engineering
    print("📊 Fetching 12-month historical data for prev_month_rainfall...")
    try:
        monthly_data = get_last_12_months_data(req.lat, req.lon)
        # Get second-to-last month (previous month)
        prev_month_rainfall = monthly_data[-2]["total_rainfall_mm"] if len(monthly_data) >= 2 else 0
        print(f"   - Previous month rainfall: {prev_month_rainfall:.2f} mm")
    except Exception as e:
        print(f"⚠️  Could not fetch monthly data, using 0 for prev_month_rainfall: {e}")
        prev_month_rainfall = 0

    # Step 4: Prepare 6 features in EXACT order required by model
    current_month = date.today().month
    features = [
        climate_data['avg_soil_moisture'],      # Feature 1: soil_moisture
        climate_data['avg_rainfall'],           # Feature 2: rainfall_30d
        climate_data['avg_temp_max'],           # Feature 3: temp_max
        climate_data['avg_humidity'],           # Feature 4: humidity
        current_month,                          # Feature 5: month_of_year
        prev_month_rainfall                     # Feature 6: prev_month_rainfall
    ]

    print(f"🔧 Features prepared (in order):")
    print(f"   1. soil_moisture: {features[0]:.3f}")
    print(f"   2. rainfall_30d: {features[1]:.2f}")
    print(f"   3. temp_max: {features[2]:.2f}")
    print(f"   4. humidity: {features[3]:.2f}")
    print(f"   5. month_of_year: {features[4]}")
    print(f"   6. prev_month_rainfall: {features[5]:.2f}")

    # Step 5: Scale features if scaler is available
    features_array = np.array(features).reshape(1, -1)
    if scaler is not None:
        print("⚙️  Applying scaler transformation...")
        features_array = scaler.transform(features_array)
        print("✅ Features scaled")
    else:
        print("⚠️  Scaler not available, using raw features")

    # Step 6: Run prediction
    print("🤖 Running ML prediction...")
    try:
        prediction_proba = model.predict_proba(features_array)[0]
        # Get probability of drought (assuming class 1 is drought)
        drought_probability = prediction_proba[1] if len(prediction_proba) > 1 else prediction_proba[0]
        risk_score = int(drought_probability * 100)
        print(f"📈 Raw prediction probability: {drought_probability:.4f}")
        print(f"📊 Risk score: {risk_score}/100")
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Prediction failed due to an internal error"
        )

    # Step 7: Determine risk level based on score
    if 0 <= risk_score <= 30:
        risk_level = "LOW"
        emoji = "🟢"
    elif 31 <= risk_score <= 65:
        risk_level = "MEDIUM"
        emoji = "🟡"
    else:  # 66-100
        risk_level = "HIGH"
        emoji = "🔴"

    print(f"{emoji} RISK LEVEL: {risk_level}")
    print(f"{'='*60}\n")

    # Step 8: Build response
    district_display_name = req.district_name if req.district_name else f"Location ({req.lat:.2f}, {req.lon:.2f})"

    return PredictResponse(
        district_name=district_display_name,
        risk_score=risk_score,
        risk_level=risk_level,
        soil_moisture=climate_data['avg_soil_moisture'],
        rainfall_last_30_days=climate_data['avg_rainfall'],
        temperature_max=climate_data['avg_temp_max'],
        humidity=climate_data['avg_humidity'],
        prediction_date=date.today().isoformat()
    )
