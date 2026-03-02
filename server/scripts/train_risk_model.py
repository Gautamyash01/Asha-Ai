#!/usr/bin/env python3
"""
ML Risk Model Training Script
Trains RandomForestClassifier for patient risk prediction.
Run: python train_risk_model.py
Output: risk_model.pkl in server/models/
"""
import pandas as pd
import os
import sys
import json
import pickle
import numpy as np
from pathlib import Path

try:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler
except ImportError:
    print("Installing scikit-learn...")
    os.system(f"{sys.executable} -m pip install scikit-learn numpy")
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler

# Feature order (must match prediction service)
FEATURES = [
    "age", "gender_female", "gender_male", "gender_other",
    "pregnant", "systolicBP", "diastolicBP", "bloodSugar",
    "temperature", "spo2", "heartRate", "fever", "cough", "breathlessness",
    "symptomDuration"
]


def load_dataset_from_csv(csv_path: Path):
    df = pd.read_csv(csv_path)

    # gender in heart/ASHA-ready dataset is 0=female, 1=male
    gf = (df["gender"] == 0).astype(float)
    gm = (df["gender"] == 1).astype(float)
    go = 1.0 - gf - gm

    X = np.column_stack([
        df["age"].values,
        gf.values,
        gm.values,
        go.values,
        df["pregnant"].astype(float).values,
        df["systolicBP"].values,
        df["diastolicBP"].values,
        df["bloodSugar"].values,
        df["temperature"].values,
        df["spo2"].values,
        df["heartRate"].values,
        df["fever"].astype(float).values,
        df["cough"].astype(float).values,
        df["breathlessness"].astype(float).values,
        df["symptomDuration"].values,
    ])

    y = df["label"].astype(int).values
    return X, y


def generate_training_data(n_samples=2000):
    """Generate synthetic training data for demonstration."""
    np.random.seed(42)
    X = []
    y = []
    for _ in range(n_samples):
        age = np.random.randint(1, 85)
        gender = np.random.choice([0, 1, 2])  # female, male, other
        pregnant = 1 if gender == 0 and np.random.random() < 0.3 else 0
        systolicBP = np.clip(np.random.normal(120, 25), 80, 220)
        diastolicBP = np.clip(np.random.normal(80, 15), 50, 140)
        bloodSugar = np.clip(np.random.normal(120, 50), 60, 400)
        temperature = np.clip(np.random.normal(37, 1.5), 35, 41)
        spo2 = np.clip(np.random.normal(97, 4), 75, 100)
        heartRate = np.clip(np.random.normal(80, 20), 50, 150)
        fever = 1 if np.random.random() < 0.3 else 0
        cough = 1 if np.random.random() < 0.25 else 0
        breathlessness = 1 if np.random.random() < 0.15 else 0
        symptomDuration = np.random.randint(1, 14)

        # One-hot gender
        gf = 1 if gender == 0 else 0
        gm = 1 if gender == 1 else 0
        go = 1 if gender == 2 else 0

        row = [age, gf, gm, go, pregnant, systolicBP, diastolicBP, bloodSugar,
               temperature, spo2, heartRate, fever, cough, breathlessness, symptomDuration]
        X.append(row)

        # Risk label: higher vitals/symptoms -> higher risk
        risk = 0.0
        if spo2 < 92: risk += 0.4
        elif spo2 < 95: risk += 0.2
        if systolicBP > 160: risk += 0.3
        elif systolicBP > 140: risk += 0.15
        if bloodSugar > 250: risk += 0.25
        elif bloodSugar > 180: risk += 0.1
        if temperature > 39: risk += 0.2
        elif temperature > 38: risk += 0.1
        if heartRate > 110: risk += 0.1
        if pregnant and systolicBP > 130: risk += 0.3
        if fever + cough + breathlessness >= 2: risk += 0.2
        if age > 60 or age < 5: risk += 0.1
        risk += np.random.uniform(-0.05, 0.1)

        y.append(1 if risk > 0.4 else 0)

    return np.array(X), np.array(y)

def main():
    script_dir = Path(__file__).resolve().parent
    models_dir = script_dir.parent / "models"
    models_dir.mkdir(exist_ok=True)
    model_path = models_dir / "risk_model.pkl"
    scaler_path = models_dir / "risk_scaler.pkl"
    meta_path = models_dir / "risk_meta.json"

    data_path = script_dir.parent / "data" / "asha_ready_dataset.csv"
    if data_path.exists():
        print(f"Loading training data from {data_path} ...")
        X, y = load_dataset_from_csv(data_path)
    else:
        print("No asha_ready_dataset.csv found. Generating synthetic training data...")
        X, y = generate_training_data(3000)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("Training RandomForestClassifier...")
    clf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    clf.fit(X_train_scaled, y_train)

    acc = clf.score(X_test_scaled, y_test)
    print(f"Test accuracy: {acc:.2%}")

    # Feature importances
    importances = dict(zip(FEATURES, clf.feature_importances_.tolist()))
    top_features = sorted(importances.items(), key=lambda x: -x[1])[:5]

    with open(model_path, "wb") as f:
        pickle.dump(clf, f)
    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)
    with open(meta_path, "w") as f:
        json.dump({"features": FEATURES, "accuracy": acc, "topFeatures": top_features}, f, indent=2)

    print(f"Model saved to {model_path}")
    print(f"Top features: {top_features}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
