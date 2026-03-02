#!/usr/bin/env python3
"""
ML Risk Prediction Script (called by Node.js)
Reads risk_model.pkl, accepts JSON input via stdin, outputs JSON to stdout.
Usage: echo '{"age":45,...}' | python predict_risk.py
"""

import sys
import json
import pickle
from pathlib import Path

def load_model():
    script_dir = Path(__file__).resolve().parent
    model_path = script_dir.parent / "models" / "risk_model.pkl"
    scaler_path = script_dir.parent / "models" / "risk_scaler.pkl"
    if not model_path.exists():
        return None, None
    with open(model_path, "rb") as f:
        clf = pickle.load(f)
    with open(scaler_path, "rb") as f:
        scaler = pickle.load(f)
    return clf, scaler

FEATURES = [
    "age", "gender_female", "gender_male", "gender_other",
    "pregnant", "systolicBP", "diastolicBP", "bloodSugar",
    "temperature", "spo2", "heartRate", "fever", "cough", "breathlessness",
    "symptomDuration"
]

def parse_input(data):
    g = (data.get("gender") or "female").lower()
    gf = 1 if g == "female" else 0
    gm = 1 if g == "male" else 0
    go = 1 if g == "other" else 0
    return [
        float(data.get("age", 30)),
        float(gf), float(gm), float(go),
        1.0 if data.get("pregnant") else 0.0,
        float(data.get("systolicBP", 120)),
        float(data.get("diastolicBP", 80)),
        float(data.get("bloodSugar", 100)),
        float(data.get("temperature", 37)),
        float(data.get("spo2", 97)),
        float(data.get("heartRate", 80)),
        1.0 if data.get("fever") else 0.0,
        1.0 if data.get("cough") else 0.0,
        1.0 if data.get("breathlessness") else 0.0,
        float(data.get("symptomDuration", 1)),
    ]

def main():
    try:
        inp = json.load(sys.stdin)
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
        sys.exit(1)

    clf, scaler = load_model()
    if clf is None or scaler is None:
        # Fallback: simple heuristic when model not trained
        prob = 0.2
        if inp.get("spo2", 100) < 95: prob += 0.2
        if inp.get("systolicBP", 0) > 140: prob += 0.15
        if inp.get("bloodSugar", 0) > 200: prob += 0.15
        if inp.get("pregnant") and inp.get("systolicBP", 0) > 130: prob += 0.25
        out = {
            "riskProbability": min(prob, 0.95),
            "riskCategory": "Red" if prob > 0.6 else "Yellow" if prob > 0.3 else "Green",
            "topFeatures": [{"feature": "Manual fallback", "importance": 1.0}],
        }
        print(json.dumps(out))
        return

    vec = parse_input(inp)
    X = [vec]
    X_scaled = scaler.transform(X)
    proba = clf.predict_proba(X_scaled)[0]
    prob = float(proba[1])  # probability of high risk

    cat = "Red" if prob > 0.6 else "Yellow" if prob > 0.3 else "Green"
    imp = list(zip(FEATURES, clf.feature_importances_.tolist()))
    imp.sort(key=lambda x: -x[1])
    top3 = [{"feature": f, "importance": round(i, 3)} for f, i in imp[:3]]

    out = {
        "riskProbability": round(prob, 3),
        "riskCategory": cat,
        "topFeatures": top3,
    }
    print(json.dumps(out))

if __name__ == "__main__":
    main()
