from __future__ import annotations

from dataclasses import dataclass
from typing import List

import numpy as np
from sklearn.linear_model import LogisticRegression

from schemas import RiskInput, SYMPTOM_TYPES


FEATURE_NAMES: List[str] = [
    "age",
    "gender_female",
    "gender_other",
    "pregnancy",
    "systolic_bp",
    "diastolic_bp",
    "blood_sugar",
    "temperature",
    "spo2",
    "heart_rate",
] + [f"symptom_{s}" for s in SYMPTOM_TYPES]


@dataclass
class RiskModel:
    model: LogisticRegression

    @classmethod
    def train_default(cls) -> "RiskModel":
        """Train a simple logistic regression on synthetic data.

        This is not a clinical model – it encodes reasonable rules
        so behaviour is explainable and deterministic for demo.
        """
        rng = np.random.RandomState(42)
        n_samples = 3000

        ages = rng.randint(1, 90, size=n_samples)
        systolic = rng.normal(120, 20, size=n_samples)
        diastolic = rng.normal(80, 10, size=n_samples)
        sugar = rng.normal(110, 40, size=n_samples)
        temp = rng.normal(37, 0.8, size=n_samples)
        spo2 = rng.normal(97, 2, size=n_samples)
        hr = rng.normal(82, 15, size=n_samples)

        gender_idx = rng.randint(0, 3, size=n_samples)  # 0=male,1=female,2=other
        # Pregnancy only possible for females in a typical reproductive age range
        pregnancy = (gender_idx == 1) & (ages >= 18) & (ages <= 45)

        symptoms = rng.rand(n_samples, len(SYMPTOM_TYPES)) < 0.2

        X = []
        y = []
        for i in range(n_samples):
            x_row = _encode_features(
                age=int(ages[i]),
                gender="female" if gender_idx[i] == 1 else "male" if gender_idx[i] == 0 else "other",
                pregnancy=bool(pregnancy[i]),
                systolic_bp=float(systolic[i]),
                diastolic_bp=float(diastolic[i]),
                blood_sugar=float(sugar[i]),
                temperature=float(temp[i]),
                spo2=float(spo2[i]),
                heart_rate=float(hr[i]),
                symptoms_list=[
                    SYMPTOM_TYPES[j] for j, present in enumerate(symptoms[i]) if present
                ],
            )
            X.append(x_row)

            risk = 0.0
            if systolic[i] > 160 or systolic[i] < 90:
                risk += 0.4
            if spo2[i] < 93:
                risk += 0.4
            if temp[i] > 39:
                risk += 0.25
            if sugar[i] > 250:
                risk += 0.25
            if ages[i] > 65:
                risk += 0.15
            if pregnancy[i] and systolic[i] > 140:
                risk += 0.3
            if symptoms[i, SYMPTOM_TYPES.index("chest_pain")] and symptoms[i, SYMPTOM_TYPES.index("breathlessness")]:
                risk += 0.35

            y.append(1 if risk > 0.6 else 0)

        X_arr = np.array(X)
        y_arr = np.array(y)

        clf = LogisticRegression(max_iter=1000)
        clf.fit(X_arr, y_arr)
        return cls(model=clf)

    def predict_probability(self, features: np.ndarray) -> float:
        prob = self.model.predict_proba(features.reshape(1, -1))[0, 1]
        return float(prob)

    def explain_top_features(self, features: np.ndarray, top_k: int = 3) -> List[str]:
        coefs = self.model.coef_[0]
        contributions = coefs * features
        idx = np.argsort(np.abs(contributions))[::-1][:top_k]

        explanations: List[str] = []
        for i in idx:
            name = FEATURE_NAMES[i]
            value = features[i]
            sign = "high" if contributions[i] > 0 else "low"

            if name.startswith("symptom_"):
                human = name.replace("symptom_", "").replace("_", " ")
                explanations.append(f"Presence of symptom: {human}")
            elif name == "pregnancy":
                explanations.append("Pregnancy with abnormal vitals")
            elif name == "gender_female":
                explanations.append("Female patient with current vitals")
            elif name == "gender_other":
                explanations.append("Gender: other with current vitals")
            else:
                explanations.append(f"{name.replace('_', ' ').title()} is {sign} (value={value:.1f})")

        return explanations


def _encode_features(
    *,
    age: int,
    gender: str,
    pregnancy: bool,
    systolic_bp: float,
    diastolic_bp: float,
    blood_sugar: float,
    temperature: float,
    spo2: float,
    heart_rate: float,
    symptoms_list: List[str],
) -> np.ndarray:
    vec: List[float] = []

    vec.append(float(age))
    vec.append(1.0 if gender == "female" else 0.0)
    vec.append(1.0 if gender == "other" else 0.0)
    vec.append(1.0 if pregnancy else 0.0)

    vec.extend(
        [
            float(systolic_bp),
            float(diastolic_bp),
            float(blood_sugar),
            float(temperature),
            float(spo2),
            float(heart_rate),
        ]
    )

    symptoms_set = set(symptoms_list)
    for s in SYMPTOM_TYPES:
        vec.append(1.0 if s in symptoms_set else 0.0)

    return np.array(vec, dtype=float)


def encode_from_input(payload: RiskInput) -> np.ndarray:
    return _encode_features(
        age=payload.age,
        gender=payload.gender,
        pregnancy=payload.pregnancy,
        systolic_bp=payload.systolic_bp,
        diastolic_bp=payload.diastolic_bp,
        blood_sugar=payload.blood_sugar,
        temperature=payload.temperature,
        spo2=payload.spo2,
        heart_rate=payload.heart_rate,
        symptoms_list=payload.symptoms,
    )

