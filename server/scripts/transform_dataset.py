import pandas as pd
import numpy as np

# Load heart dataset
df = pd.read_csv("heart.csv")

# Rename columns to ASHA format
df = df.rename(columns={
    "sex": "gender",
    "trestbps": "systolicBP",
    "chol": "bloodSugar",
    "thalach": "heartRate",
    "target": "label"
})

# Convert gender (already 0/1)
# 1 = male, 0 = female

# Add missing ASHA features

df["pregnant"] = 0
df.loc[(df["gender"] == 0) & (df["age"].between(18,40)), "pregnant"] = np.random.choice([0,1], size=len(df[(df["gender"] == 0) & (df["age"].between(18,40))]))

df["diastolicBP"] = df["systolicBP"] - np.random.randint(30, 50, size=len(df))

df["temperature"] = np.random.uniform(97, 101, size=len(df)).round(1)

df["spo2"] = np.random.randint(90, 100, size=len(df))

df["fever"] = (df["temperature"] > 99).astype(int)

df["cough"] = np.random.choice([0,1], size=len(df))

df["breathlessness"] = df["exang"]  # exercise angina approximated as breathlessness

df["symptomDuration"] = np.random.randint(1, 7, size=len(df))

# Keep only required columns
df = df[[
    "age",
    "gender",
    "pregnant",
    "systolicBP",
    "diastolicBP",
    "bloodSugar",
    "temperature",
    "spo2",
    "heartRate",
    "fever",
    "cough",
    "breathlessness",
    "symptomDuration",
    "label"
]]

# Save new dataset
df.to_csv("asha_ready_dataset.csv", index=False)

print("ASHA-ready dataset created successfully!")