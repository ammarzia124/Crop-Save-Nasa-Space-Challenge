"""
AI Advisory Layer for CropSave - Farming advice based on drought risk.

This is the creative part of the project that gives farmers actionable advice.
"""
from typing import List, Literal
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel

router = APIRouter()


class AdviceItem(BaseModel):
    """Single piece of farming advice."""
    title: str
    description: str
    urgency: Literal["normal", "warning", "critical"]


class AdvisoryResponse(BaseModel):
    """Complete advisory response."""
    risk_level: str
    advice: List[AdviceItem]


# English advice content
ADVICE_EN = {
    "LOW": [
        {
            "title": "Good Time to Plant",
            "description": "Soil moisture levels are healthy. Consider planting water-intensive crops this season.",
            "urgency": "normal"
        },
        {
            "title": "Store Water Anyway",
            "description": "Even with low risk, store rainwater for backup. Install basic water collection if possible.",
            "urgency": "normal"
        },
        {
            "title": "Monitor Weekly",
            "description": "Check back every week for updated forecasts. Conditions can change quickly.",
            "urgency": "normal"
        },
        {
            "title": "Fertilize Now",
            "description": "Use this good weather window to fertilize your soil. Healthy soil holds water better during dry spells.",
            "urgency": "normal"
        }
    ],
    "MEDIUM": [
        {
            "title": "Reduce Water Usage",
            "description": "Cut irrigation by 30 percent immediately. Focus water on your most valuable crops first.",
            "urgency": "warning"
        },
        {
            "title": "Drought-Resistant Crops",
            "description": "If you have not planted yet, choose drought-resistant varieties. Millet and sorghum survive dry conditions well.",
            "urgency": "warning"
        },
        {
            "title": "Check Water Sources",
            "description": "Inspect your wells and water storage now. Make sure reserves are full before conditions worsen.",
            "urgency": "warning"
        },
        {
            "title": "Contact Local Agriculture Office",
            "description": "Inform your local agriculture department about conditions. They may have emergency support available.",
            "urgency": "warning"
        }
    ],
    "HIGH": [
        {
            "title": "URGENT: Save Your Crops Now",
            "description": "Drought conditions are very likely in the next 30 days. Prioritize your most valuable crops for all remaining water.",
            "urgency": "critical"
        },
        {
            "title": "Stop New Planting",
            "description": "Do not plant new crops right now. Wait until conditions improve to avoid total loss.",
            "urgency": "critical"
        },
        {
            "title": "Seek Emergency Support",
            "description": "Contact your district agriculture office immediately. Government drought relief programs may be available.",
            "urgency": "critical"
        },
        {
            "title": "Harvest Early If Possible",
            "description": "If crops are near ready, consider early harvest. Partial harvest is better than total loss.",
            "urgency": "critical"
        }
    ]
}


# Urdu advice content (translations for Pakistani farmers)
ADVICE_UR = {
    "LOW": [
        {
            "title": "بوائی کا اچھا وقت",
            "description": "زمین میں نمی اچھی سطح پر ہے۔ اس موسم میں زیادہ پانی والی فصلیں لگانے پر غور کریں۔",
            "urgency": "normal"
        },
        {
            "title": "بارش کا پانی محفوظ کریں",
            "description": "کم خطرے کے باوجود، بیک اپ کے لیے بارش کا پانی محفوظ کریں۔ ممکن ہو تو بنیادی پانی جمع کرنے کا انتظام کریں۔",
            "urgency": "normal"
        },
        {
            "title": "ہفتہ وار نگرانی کریں",
            "description": "تازہ پیشن گوئیوں کے لیے ہر ہفتے واپس آئیں۔ حالات تیزی سے بدل سکتے ہیں۔",
            "urgency": "normal"
        },
        {
            "title": "ابھی کھاد ڈالیں",
            "description": "موسم کی اس اچھی مدت میں اپنی زمین میں کھاد ڈالیں۔ صحت مند زمین خشک موسم میں پانی بہتر طریقے سے محفوظ رکھتی ہے۔",
            "urgency": "normal"
        }
    ],
    "MEDIUM": [
        {
            "title": "پانی کا استعمال کم کریں",
            "description": "فوری طور پر آبپاشی 30 فیصد کم کریں۔ سب سے قیمتی فصلوں پر پانی مرکوز کریں۔",
            "urgency": "warning"
        },
        {
            "title": "خشک سالی برداشت کرنے والی فصلیں",
            "description": "اگر ابھی تک بوائی نہیں کی تو خشک سالی برداشت کرنے والی اقسام منتخب کریں۔ باجرا اور جوار خشک حالات میں بہتر زندہ رہتے ہیں۔",
            "urgency": "warning"
        },
        {
            "title": "پانی کے ذرائع چیک کریں",
            "description": "ابھی اپنے کنوؤں اور پانی کے ذخیرے کا معائنہ کریں۔ حالات خراب ہونے سے پہلے ذخائر مکمل رکھیں۔",
            "urgency": "warning"
        },
        {
            "title": "مقامی زرعی دفتر سے رابطہ کریں",
            "description": "اپنے مقامی محکمہ زراعت کو حالات سے آگاہ کریں۔ ان کے پاس ہنگامی مدد دستیاب ہو سکتی ہے۔",
            "urgency": "warning"
        }
    ],
    "HIGH": [
        {
            "title": "فوری: ابھی اپنی فصلیں بچائیں",
            "description": "اگلے 30 دنوں میں خشک سالی کے حالات بہت زیادہ ممکن ہیں۔ تمام بچے ہوئے پانی کے لیے اپنی سب سے قیمتی فصلوں کو ترجیح دیں۔",
            "urgency": "critical"
        },
        {
            "title": "نئی بوائی بند کریں",
            "description": "ابھی نئی فصلیں نہ لگائیں۔ مکمل نقصان سے بچنے کے لیے حالات بہتر ہونے کا انتظار کریں۔",
            "urgency": "critical"
        },
        {
            "title": "ہنگامی مدد حاصل کریں",
            "description": "فوری طور پر اپنے ضلعی زرعی دفتر سے رابطہ کریں۔ حکومتی خشک سالی امدادی پروگرام دستیاب ہو سکتے ہیں۔",
            "urgency": "critical"
        },
        {
            "title": "ممکن ہو تو جلدی کٹائی کریں",
            "description": "اگر فصلیں تیار ہونے کے قریب ہیں تو جلدی کٹائی پر غور کریں۔ جزوی کٹائی مکمل نقصان سے بہتر ہے۔",
            "urgency": "critical"
        }
    ]
}


@router.get("/advisory", response_model=AdvisoryResponse)
def get_advisory(
    risk_level: str = Query(
        ...,
        description="Drought risk level",
        pattern="^(LOW|MEDIUM|HIGH)$"
    )
):
    """
    Get farming advice based on drought risk level (English).

    Returns 4 actionable advice items with urgency levels:
    - LOW risk: normal urgency (green light for farming)
    - MEDIUM risk: warning urgency (take precautions)
    - HIGH risk: critical urgency (emergency actions needed)
    """
    risk_level = risk_level.upper()

    if risk_level not in ADVICE_EN:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid risk level. Must be LOW, MEDIUM, or HIGH."
        )

    print(f"📢 Advisory requested for risk level: {risk_level}")

    advice_items = [AdviceItem(**item) for item in ADVICE_EN[risk_level]]

    return AdvisoryResponse(
        risk_level=risk_level,
        advice=advice_items
    )


@router.get("/advisory/languages")
def get_advisory_languages(
    risk_level: str = Query(
        ...,
        description="Drought risk level",
        pattern="^(LOW|MEDIUM|HIGH)$"
    ),
    lang: str = Query(
        "en",
        description="Language code: en for English, ur for Urdu",
        pattern="^(en|ur)$"
    )
):
    """
    Get farming advice in multiple languages for Pakistani farmers.

    Supports:
    - en: English (default)
    - ur: Urdu (اردو)

    Returns the same structured advice in the requested language.
    """
    risk_level = risk_level.upper()
    lang = lang.lower()

    # Select appropriate language dictionary
    advice_dict = ADVICE_EN if lang == "en" else ADVICE_UR

    if risk_level not in advice_dict:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid risk level. Must be LOW, MEDIUM, or HIGH."
        )

    print(f"📢 Advisory requested: {risk_level} in {lang.upper()}")

    advice_items = [AdviceItem(**item) for item in advice_dict[risk_level]]

    return {
        "risk_level": risk_level,
        "language": lang,
        "advice": advice_items
    }
