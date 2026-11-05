# CropSave Backend

FastAPI backend for drought risk prediction using NASA POWER satellite data.

## Quick Start

### 1. Install Dependencies
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env if needed (default values work)
```

### 3. Run Server
```bash
uvicorn main:app --reload
```

API will be available at http://localhost:8000
- **Interactive docs**: http://localhost:8000/docs
- **Health check**: http://localhost:8000/health

---

## Project Structure

```
backend/
    main.py              # FastAPI app initialization
    routes/              # API endpoints
        predict.py       # POST /predict
        history.py       # GET /history
        advisory.py      # GET /advisory
    services/            # Business logic
        nasa_api.py      # NASA POWER API client
        ml_service.py    # ML model loading & prediction
        feature_builder.py  # Feature engineering
    models/              # Pydantic schemas
        schemas.py       # Request/response models
    test_api.py          # API smoke tests
```

---

## API Endpoints

- **GET /health** - Server status check
- **POST /predict** - Drought risk prediction for lat/lon
- **GET /history** - Historical rainfall/soil data by district
- **GET /advisory** - Farming advice (English/Urdu)

Full API documentation: http://localhost:8000/docs

---

## Environment Variables

- **CORS_ORIGINS**: Allowed origins (default: `*`)
- **MODEL_PATH**: Path to trained ML model (default: `../ml/models/random_forest.joblib`)

---

## Testing

Run the test suite:
```bash
python test_api.py
```

All 4 endpoints will be tested against the live API.

---

## Deployment

The backend is configured for deployment on Render.com:
- See `../render.yaml` for deployment configuration
- Uses Python 3.11 runtime
- Health check endpoint: `/health`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
