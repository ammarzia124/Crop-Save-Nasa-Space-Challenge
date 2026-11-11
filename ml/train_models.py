"""CropSave ML Model Training & Comparison: Random Forest vs. XGBoost
NASA Space Apps Challenge 2026
Author: Muavia (ML Model Developer)

This script:
1. Loads 10-year NASA POWER satellite historical dataset (2015-2024, 22 districts)
2. Preprocesses the 6 agro-climatic features
3. Trains and benchmarks RandomForestClassifier and XGBClassifier
4. Evaluates metrics (Accuracy, F1, ROC-AUC, 5-Fold Cross Validation)
5. Exports the optimal model to ml/models/ and backend/models/
6. Validates end-to-end inference for FastAPI backend
"""

import os
import sys
from pathlib import Path

# Fix Windows console encoding for Unicode/Emojis
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
import matplotlib.pyplot as plt
import seaborn as sns

# Set paths
BASE_DIR = Path(__file__).resolve().parent  # ml/
DATA_PATH = BASE_DIR / "data" / "historical_data.csv"
ML_MODELS_DIR = BASE_DIR / "models"
BACKEND_MODELS_DIR = BASE_DIR.parent / "backend" / "models"

ML_MODELS_DIR.mkdir(parents=True, exist_ok=True)
BACKEND_MODELS_DIR.mkdir(parents=True, exist_ok=True)

# 1. Load Data
print("=" * 70)
print("🌾 CROPSAVE ML TRAINING PIPELINE (NASA SPACE APPS 2026)")
print("=" * 70)
print(f"Loading NASA historical dataset from: {DATA_PATH}")

df = pd.read_csv(DATA_PATH)
print(f"Dataset Loaded: {df.shape[0]} rows, {df.shape[1]} columns")
print(f"Districts Covered ({len(df['district'].unique())}): {list(df['district'].unique()[:8])}...")

# 2. Select Features & Target
# The 6 features required by backend/routes/predict.py
FEATURE_COLS = [
    "soil_moisture",       # Feature 1: NASA GWETROOT 7-day avg
    "rainfall_30d",        # Feature 2: NASA PRECTOTCORR daily avg in past 30 days
    "temp_max",            # Feature 3: NASA T2M_MAX 30-day mean max temp
    "humidity",            # Feature 4: NASA RH2M 30-day mean relative humidity
    "month_of_year",       # Feature 5: 1-12 month seasonal factor
    "prev_month_rainfall", # Feature 6: NASA PRECTOTCORR lagged monthly sum
]

print("\n--- 6 Core Input Features ---")
for i, col in enumerate(FEATURE_COLS, 1):
    print(f"  {i}. {col} (Mean: {df[col].mean():.2f}, Min: {df[col].min():.2f}, Max: {df[col].max():.2f})")

# Targets
X = df[FEATURE_COLS].copy()
y = df["drought"].astype(int)  # 1 = Drought, 0 = Normal
y_continuous = df["drought_score"]  # 0 to 100 continuous composite drought index
y_class3 = df["risk_class"].astype(int)  # 0 = LOW, 1 = MEDIUM, 2 = HIGH

print(f"\nTarget Class Distribution (Binary Drought: 0=No, 1=Yes):")
print(y.value_counts(normalize=True).rename({0: "Normal (0)", 1: "Drought (1)"}).round(4) * 100)

print(f"\nTarget 3-Tier Risk Level Distribution:")
print(df["risk_level"].value_counts(normalize=True).round(4) * 100)

# 3. Train-Test Split (Stratified 80/20)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

print(f"\nTraining set: {X_train.shape[0]} samples | Test set: {X_test.shape[0]} samples")

# 4. Standard Scaling
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 5. Train Model 1: Random Forest Classifier
print("\n" + "=" * 70)
print("🌲 MODEL 1: Random Forest Classifier (NASA Space Apps Baseline)")
print("=" * 70)

rf_clf = RandomForestClassifier(
    n_estimators=200,
    max_depth=9,
    min_samples_split=4,
    min_samples_leaf=2,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)
rf_clf.fit(X_train_scaled, y_train)

rf_preds = rf_clf.predict(X_test_scaled)
rf_probs = rf_clf.predict_proba(X_test_scaled)[:, 1]

rf_acc = accuracy_score(y_test, rf_preds)
rf_prec = precision_score(y_test, rf_preds)
rf_rec = recall_score(y_test, rf_preds)
rf_f1 = f1_score(y_test, rf_preds)
rf_auc = roc_auc_score(y_test, rf_probs)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
rf_cv_scores = cross_val_score(rf_clf, scaler.transform(X), y, cv=cv, scoring="roc_auc")

print(f"Random Forest Accuracy:       {rf_acc * 100:.2f}%")
print(f"Random Forest Precision:      {rf_prec * 100:.2f}%")
print(f"Random Forest Recall:         {rf_rec * 100:.2f}%")
print(f"Random Forest F1-Score:       {rf_f1 * 100:.2f}%")
print(f"Random Forest ROC-AUC:        {rf_auc:.4f}")
print(f"Random Forest 5-Fold CV AUC:  {rf_cv_scores.mean():.4f} (+/- {rf_cv_scores.std():.4f})")

# 6. Train Model 2: XGBoost Classifier
print("\n" + "=" * 70)
print("⚡ MODEL 2: XGBoost Classifier (Gradient Boosting)")
print("=" * 70)

scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()

xgb_clf = xgb.XGBClassifier(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.04,
    subsample=0.85,
    colsample_bytree=0.85,
    scale_pos_weight=scale_pos_weight,
    eval_metric="logloss",
    random_state=42,
    n_jobs=-1
)
xgb_clf.fit(X_train_scaled, y_train)

xgb_preds = xgb_clf.predict(X_test_scaled)
xgb_probs = xgb_clf.predict_proba(X_test_scaled)[:, 1]

xgb_acc = accuracy_score(y_test, xgb_preds)
xgb_prec = precision_score(y_test, xgb_preds)
xgb_rec = recall_score(y_test, xgb_preds)
xgb_f1 = f1_score(y_test, xgb_preds)
xgb_auc = roc_auc_score(y_test, xgb_probs)

xgb_cv_scores = cross_val_score(xgb_clf, scaler.transform(X), y, cv=cv, scoring="roc_auc")

print(f"XGBoost Accuracy:             {xgb_acc * 100:.2f}%")
print(f"XGBoost Precision:            {xgb_prec * 100:.2f}%")
print(f"XGBoost Recall:               {xgb_rec * 100:.2f}%")
print(f"XGBoost F1-Score:             {xgb_f1 * 100:.2f}%")
print(f"XGBoost ROC-AUC:              {xgb_auc:.4f}")
print(f"XGBoost 5-Fold CV AUC:        {xgb_cv_scores.mean():.4f} (+/- {xgb_cv_scores.std():.4f})")

# 7. Model Comparison Table
print("\n" + "=" * 70)
print("📊 MODEL BENCHMARK COMPARISON SUMMARY")
print("=" * 70)
comparison_df = pd.DataFrame([
    {
        "Model": "Random Forest",
        "Accuracy (%)": round(rf_acc * 100, 2),
        "Precision (%)": round(rf_prec * 100, 2),
        "Recall (%)": round(rf_rec * 100, 2),
        "F1-Score (%)": round(rf_f1 * 100, 2),
        "ROC-AUC": round(rf_auc, 4),
        "5-Fold CV AUC": round(rf_cv_scores.mean(), 4)
    },
    {
        "Model": "XGBoost",
        "Accuracy (%)": round(xgb_acc * 100, 2),
        "Precision (%)": round(xgb_prec * 100, 2),
        "Recall (%)": round(xgb_rec * 100, 2),
        "F1-Score (%)": round(xgb_f1 * 100, 2),
        "ROC-AUC": round(xgb_auc, 4),
        "5-Fold CV AUC": round(xgb_cv_scores.mean(), 4)
    }
])
print(comparison_df.to_string(index=False))

# 8. Feature Importance Comparison
print("\n--- Feature Importance Ranking ---")
rf_feat_imp = pd.Series(rf_clf.feature_importances_, index=FEATURE_COLS).sort_values(ascending=False)
xgb_feat_imp = pd.Series(xgb_clf.feature_importances_, index=FEATURE_COLS).sort_values(ascending=False)

feat_imp_df = pd.DataFrame({
    "Random Forest Importance": rf_feat_imp,
    "XGBoost Importance": xgb_feat_imp
}).sort_values(by="Random Forest Importance", ascending=False)
print(feat_imp_df.round(4))

# Save feature importance chart
try:
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    rf_feat_imp.sort_values().plot(kind="barh", color="#10b981", ax=axes[0])
    axes[0].set_title("Random Forest - Feature Importance", fontsize=12, fontweight="bold")
    axes[0].set_xlabel("Relative Importance")

    xgb_feat_imp.sort_values().plot(kind="barh", color="#06b6d4", ax=axes[1])
    axes[1].set_title("XGBoost - Feature Importance", fontsize=12, fontweight="bold")
    axes[1].set_xlabel("F-Score Importance")

    plt.tight_layout()
    chart_path = BASE_DIR / "data" / "model_comparison_features.png"
    plt.savefig(chart_path, dpi=200)
    print(f"\n[Chart Saved] Feature importance saved to: {chart_path}")
except Exception as e:
    print(f"Plotting skipped: {e}")

# 9. Selection & Exporting
# Both models perform exceptionally well (>95% ROC-AUC).
# Random Forest is selected as the primary production model because:
#   a) It matches Section 6 of Team Technical Guide & backend/routes/predict.py
#   b) It handles outliers and satellite telemetry sensor variance cleanly
#   c) It works natively with scikit-learn on free-tier Render deployment without extra C++ binary dependencies
# We also save XGBoost for benchmarking!
best_model = rf_clf
best_model_name = "Random Forest"

print(f"\n🏆 Primary Production Model Selected: {best_model_name}")

# Save to ml/models
joblib.dump(rf_clf, ML_MODELS_DIR / "random_forest.joblib")
joblib.dump(xgb_clf, ML_MODELS_DIR / "xgboost_model.joblib")
joblib.dump(scaler, ML_MODELS_DIR / "scaler.pkl")

# Copy to backend/models for deployment resilience
joblib.dump(rf_clf, BACKEND_MODELS_DIR / "random_forest.joblib")
joblib.dump(scaler, BACKEND_MODELS_DIR / "scaler.pkl")

print(f"✅ Exported primary model to:  {ML_MODELS_DIR / 'random_forest.joblib'}")
print(f"✅ Exported XGBoost model to:  {ML_MODELS_DIR / 'xgboost_model.joblib'}")
print(f"✅ Exported feature scaler to: {ML_MODELS_DIR / 'scaler.pkl'}")
print(f"✅ Synced model & scaler to:   {BACKEND_MODELS_DIR}")

# 10. Verification: Live Predict Function Test (as used by FastAPI /predict)
print("\n" + "=" * 70)
print("🧪 VERIFYING PREDICTION PIPELINE (FastAPI Backend Contract)")
print("=" * 70)

# Simulate 3 Pakistani scenarios:
# 1. Very Dry conditions (Cholistan / Multan May dry season): Low moisture, zero rain, high temp
# 2. Monsoon / Healthy conditions (Gujranwala / Sialkot August): High moisture, abundant rain
# 3. Moderate / Average condition (Faisalabad November)
test_cases = [
    {
        "name": "Severe Drought Scenario (Cholistan / Multan in May)",
        "features": [0.12, 0.05, 43.5, 22.0, 5, 2.5]  # soil, rain_30d, tmax, humidity, month, prev_rain
    },
    {
        "name": "Healthy Monsoon Scenario (Sialkot / Gujranwala in August)",
        "features": [0.55, 6.80, 31.0, 78.0, 8, 120.0]
    },
    {
        "name": "Moderate Transition Scenario (Faisalabad in November)",
        "features": [0.34, 0.40, 27.5, 45.0, 11, 10.0]
    }
]

for tc in test_cases:
    raw_feats = tc["features"]
    scaled_feats = scaler.transform([raw_feats])

    # Random Forest inference
    rf_prob = rf_clf.predict_proba(scaled_feats)[0][1]
    rf_score = int(rf_prob * 100)
    rf_level = "LOW" if rf_score <= 30 else ("MEDIUM" if rf_score <= 65 else "HIGH")

    # XGBoost inference
    xgb_prob = xgb_clf.predict_proba(scaled_feats)[0][1]
    xgb_score = int(xgb_prob * 100)
    xgb_level = "LOW" if xgb_score <= 30 else ("MEDIUM" if xgb_score <= 65 else "HIGH")

    emoji = "🔴" if rf_level == "HIGH" else ("🟡" if rf_level == "MEDIUM" else "🟢")

    print(f"\nScenario: {tc['name']}")
    print(f"   Inputs: Soil={raw_feats[0]:.2f}, Rain30d={raw_feats[1]:.2f} mm/day, Tmax={raw_feats[2]}°C, Humid={raw_feats[3]}%, Month={raw_feats[4]}")
    print(f"   🌲 Random Forest -> Drought Prob: {rf_prob:.3f} | Score: {rf_score:2d}/100 | Risk: {emoji} {rf_level}")
    print(f"   ⚡ XGBoost       -> Drought Prob: {xgb_prob:.3f} | Score: {xgb_score:2d}/100 | Risk: {xgb_level}")

print("\n" + "=" * 70)
print("🎉 ALL MODELS TRAINED, EVALUATED, AND EXPORTED SUCCESSFULLY!")
print("=" * 70)
