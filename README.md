# 🌾 CropSave Backend

**Drought Prediction Tool for Farmers**  
**NASA Space Apps Challenge 2026**

[![NASA Space Apps](https://img.shields.io/badge/NASA-Space%20Apps%202026-blue)](https://www.spaceappschallenge.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.161-green)](https://fastapi.tiangolo.com/)

> **30-day drought risk prediction** API using NASA POWER satellite data and machine learning.  
> Returns **LOW/MEDIUM/HIGH** drought risk + farming advice in English & Urdu.

---

## 🌍 The Problem We Solve

Millions of Pakistani farmers lose crops every year due to drought. They have **no early warning system**.  

NASA satellites collect soil moisture and rainfall data daily, but farmers can't access it.  
**CropSave bridges this gap.**

---

## 🛰️ NASA Data We Use

All data comes from the free **[NASA POWER API](https://power.larc.nasa.gov)** (no login required):

| Parameter | Meaning | NASA Source |
|---|---|---|
| **PRECTOTCORR** | Daily precipitation (mm) | GPM IMERG (bias-corrected) |
| **GWETROOT** | Root-zone soil wetness (0–1) | GMAO MERRA-2 |
| **T2M_MAX** | Maximum temperature (°C) | GMAO MERRA-2 |
| **RH2M** | Relative humidity (%) | GMAO MERRA-2 |

---

## 🏗️ How It Works

1. **Fetch NASA Data:** Real-time climate data from NASA POWER API
2. **Feature Engineering:** Extract 6 key features from 60-day historical window
3. **ML Prediction:** Random Forest model predicts 30-day drought risk
4. **API Response:** Returns risk score (0-100), level (LOW/MEDIUM/HIGH), and farming advice

---

## 🚀 Quick Start

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload      # Runs on http://localhost:8000
```

**API Documentation:** http://localhost:8000/docs

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| **GET** | `/health` | Server health check |
| **POST** | `/predict` | Drought risk prediction for coordinates |
| **GET** | `/history` | Historical rainfall & soil moisture data |
| **GET** | `/advisory` | Farming advice based on risk level |

**Live API:** https://cropsave-api.onrender.com  
**API Docs:** https://cropsave-api.onrender.com/docs

---

## 🌐 Deployment

**Platform:** [Render.com](https://render.com) (Free Tier)  
**Configuration:** See `render.yaml`

```bash
git push origin main  # Auto-deploys to Render
```

---

## 👥 Team

**Team:** Code Voyagers  
**Challenge:** NASA Space Apps Challenge 2026

| Name | Role |
|---|---|
| **Muhammad Ammar Zia** | Team Lead, Backend Engineer |
| **Atiqua** | Frontend Developer |
| **Muavia** | ML Engineer |
| **Sohail** | Data Engineer |
| **Sahal** | Frontend Developer |

---

## 📂 Project Structure

```
backend/
├── main.py                 # FastAPI application
├── routes/
│   ├── predict.py         # /predict endpoint
│   ├── advisory.py        # /advisory endpoint
│   └── history.py         # /history endpoint
├── services/
│   ├── nasa_api.py        # NASA POWER API client
│   ├── ml_service.py      # ML model loading
│   └── feature_builder.py # Feature engineering
├── models/
│   └── schemas.py         # Pydantic models
├── data/
│   └── districts.json     # Pakistan districts
└── requirements.txt       # Python dependencies
```

---

## 🛠️ Tech Stack

- **Python 3.11** - Programming language
- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **NASA POWER API** - Climate data source
- **Scikit-learn** - Machine learning
- **Pandas & NumPy** - Data processing
- **Joblib** - Model serialization
- **Render.com** - Deployment platform

---

## 🙏 Acknowledgments

- **NASA POWER API** for free global weather & soil data  
- **NASA Space Apps Challenge** for inspiring this project  
- **Pakistani farmers** who inspired this solution  

---

## 📜 License

MIT License — Free to use for educational & humanitarian purposes.

---

**Built with ❤️ for farmers. Powered by NASA data. 🌾🛰️**
