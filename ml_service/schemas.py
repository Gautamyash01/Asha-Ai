from pydantic import BaseModel, Field
from typing import List, Literal


SYMPTOM_TYPES = [
    "fever",
    "chest_pain",
    "cough",
    "breathlessness",
    "vomiting",
    "headache",
    "body_pain",
    "chills",
]


class RiskInput(BaseModel):
    age: int = Field(..., ge=0, le=120)
    gender: Literal["male", "female", "other"]
    pregnancy: bool = False
    systolic_bp: float
    diastolic_bp: float
    blood_sugar: float
    temperature: float
    spo2: float
    heart_rate: float
    symptoms: List[str] = []


class RiskOutput(BaseModel):
    risk_probability: float
    risk_score: int
    urgency_level: Literal["RED", "YELLOW", "GREEN"]
    top_contributing_features: List[str]

