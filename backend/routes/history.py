"""Historical rainfall and soil moisture data by district."""
import json
from datetime import date, timedelta
from pathlib import Path

import httpx
import pandas as pd
from fastapi import APIRouter, HTTPException, Query

from services.nasa_api import fetch_daily

router = APIRouter()
ROOT = Path(__file__).resolve().parent.parent  # backend/
DISTRICTS = {d["name"].lower(): d for d in json.loads((ROOT / "data" / "districts.json").read_text())}
POWER_LAG_DAYS = 3  # NASA POWER near-real-time data trails today by a few days


def nasa_or_502(lat: float, lon: float, start: date, end: date) -> pd.DataFrame:
    """Fetch NASA POWER data, turning upstream failures into a clean 502 JSON error."""
    try:
        return fetch_daily(lat, lon, start, end)
    except httpx.HTTPError as e:
        raise HTTPException(502, f"NASA POWER API unavailable: {e}") from e


@router.get("/history")
def history(district: str = Query(..., description="District name, e.g. Multan")):
    """Monthly NASA POWER rainfall and soil wetness for a district, last 5 years."""
    d = DISTRICTS.get(district.lower())
    if d is None:
        raise HTTPException(404, f"Unknown district '{district}'")
    end = date.today() - timedelta(days=POWER_LAG_DAYS)
    df = nasa_or_502(d["lat"], d["lon"], end.replace(year=end.year - 5, day=1), end)
    monthly = df.resample("MS").agg({"PRECTOTCORR": "sum", "GWETROOT": "mean"}).dropna()
    return {
        "district": d["name"],
        "data_source": "NASA POWER",
        "months": [
            {"month": ts.strftime("%Y-%m"), "rain_mm": round(r.PRECTOTCORR, 1), "soil_wetness": round(r.GWETROOT, 3)}
            for ts, r in monthly.iterrows()
        ],
    }
