from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from schemas import RiskInput, RiskOutput
from model import RiskModel, encode_from_input

app = FastAPI(title="Asha-Ai Risk Scoring Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = RiskModel.train_default()


@app.post("/predict-risk", response_model=RiskOutput)
def predict_risk(payload: RiskInput) -> RiskOutput:
    features = encode_from_input(payload)
    prob = model.predict_probability(features)
    score = int(round(prob * 100))

    if prob >= 0.7:
        urgency = "RED"
    elif prob >= 0.35:
        urgency = "YELLOW"
    else:
        urgency = "GREEN"

    top_features = model.explain_top_features(features)

    return RiskOutput(
        risk_probability=prob,
        risk_score=score,
        urgency_level=urgency,
        top_contributing_features=top_features,
    )

