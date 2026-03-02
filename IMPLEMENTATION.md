# ASHA-AI Implementation Guide

## Overview

This document describes the new features added to the ASHA-AI healthcare platform. All changes extend the existing architecture in a modular way.

---

## 1. Hybrid Triage Engine (Rules + ML)

### Rule-Based Safety Layer (Priority 1)

Located in `server/src/services/ruleEngine.js`. Runs **before** any ML prediction:

| Condition | Output |
|-----------|--------|
| SpO2 < 90 | Critical – Immediate Referral |
| Systolic BP > 180 | Emergency – Refer Immediately |
| Pregnant + High BP (>140) | High-Risk Pregnancy |
| Blood Sugar > 300 | Diabetic Emergency |

If any rule triggers, ML is skipped and a structured response is returned.

### ML Risk Prediction

- **Service:** `server/src/services/mlPredictionService.js`
- **Model:** RandomForestClassifier (Python)
- **Input features:** Age, Gender, Pregnancy, Systolic BP, Diastolic BP, Blood Sugar, Temperature, SpO2, Heart Rate, Fever, Cough, Breathlessness, Symptom Duration
- **Output:** Risk probability, Risk category (Green/Yellow/Red), Top 3 contributing features
- **Fallback:** If Python/model unavailable, uses heuristic logic in Node.js

---

## 2. ML Training Script

**Location:** `server/scripts/train_risk_model.py`

**Run:**
```bash
cd server
pip install scikit-learn numpy
python scripts/train_risk_model.py
```

**Output:** `server/models/risk_model.pkl` and `risk_scaler.pkl`

---

## 3. Maternal Health Module

**Location:** `server/src/services/maternalService.js`

**Form fields:** Trimester, Hemoglobin, Swelling, Severe headache

**Rules:**
- Pregnant + High BP → High-risk pregnancy alert
- Hemoglobin < 10 → Anemia warning
- Swelling + Headache + High BP → Possible preeclampsia

---

## 4. Doctor Summary Generator

**Location:** `server/src/services/summaryService.js`

**API:** `POST /triage/summary`  
Body: `{ patient, vitals, triageResult, ruleTrigger, maternalResult }`  
Query: `?format=json` (default) or `?format=text` for copyable text

**Export:** JSON or copyable text summary (no technical ML metrics in UI).

---

## 5. FHIR-Ready Data Storage

**Location:** `server/src/db/schema.js`, `server/src/db/patientStore.js`

**Schema:**
- `Patient` – Demographics
- `Encounter` – Visit/consultation
- `Observation` – Vitals (systolicBP, spo2, etc.)
- `Condition` – Risk/diagnoses
- `User` – Auth roles
- `SyncQueue` – Offline sync placeholder

**Database:** SQLite at `server/data/asha.db`

---

## 6. Role-Based Authentication

**Location:** `server/src/middleware/auth.js`

**Roles:** ASHA, Doctor, Admin

**Demo users:**
- `asha` / `asha123` (ASHA)
- `doctor` / `doctor123` (Doctor)
- `admin` / `admin123` (Admin)

**Restrictions:**
- ASHA: Create patient entries
- Doctor: See full summary history (`GET /patients/:id/summaries`)
- Admin: Access admin stats (`GET /admin/stats`)

---

## 7. Offline-First Behavior

- Patient data stored in IndexedDB (client) and SQLite (server)
- Client rule engine runs locally when offline
- Sync endpoint: `POST /sync` (placeholder for batched updates)
- Predictions work without internet via client-side rules

---

## 8. Admin Dashboard

**API:** `GET /admin/stats` (requires Admin/Doctor role)

**Displays:**
- Total patients today
- Critical cases
- High-risk pregnancies
- Recent referrals

**UI:** Main app `/admin` route; simple client shows triage only.

---

## How to Run

### Backend

```bash
cd server
npm install
# Optional: train ML model
pip install scikit-learn numpy
python scripts/train_risk_model.py
npm start
```

Server runs on **port 5050**.

### Main Frontend

```bash
npm install
npm run dev
```

Runs on **port 8080**.

### Simple Client (ASHA-focused)

```bash
cd client
npm install
npm run dev
```

Configure API base in `client/src/services/api.js` if needed.

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/triage` | Hybrid triage (rules + ML) |
| POST | `/triage/summary` | Doctor summary (JSON/text) |
| POST | `/auth/login` | Login (returns token) |
| GET | `/admin/stats` | Admin dashboard (requires auth) |
| POST | `/sync` | Sync placeholder |
| POST | `/patients` | Create patient |
| GET | `/patients/:id/summaries` | Full history (Doctor/Admin only) |
| GET | `/health` | Health check |

---

## File Map (New/Modified)

### Backend (server/)
- `src/services/ruleEngine.js` – Safety rules
- `src/services/mlPredictionService.js` – ML prediction
- `src/services/hybridTriageService.js` – Rule + ML orchestration
- `src/services/maternalService.js` – Maternal health
- `src/services/summaryService.js` – Doctor summary
- `src/db/schema.js` – FHIR-like schema
- `src/db/patientStore.js` – Patient/encounter storage
- `src/middleware/auth.js` – Role-based auth
- `src/routes/triageRoutes.js` – Updated triage API
- `src/routes/authRoutes.js` – Login
- `src/routes/adminRoutes.js` – Admin stats
- `src/routes/syncRoutes.js` – Sync placeholder
- `src/routes/patientRoutes.js` – Patient CRUD
- `src/index.js` – Wire routes
- `scripts/train_risk_model.py` – ML training
- `scripts/predict_risk.py` – ML prediction (invoked by Node)

### Frontend (main app src/)
- `pages/TriagePage.tsx` – Maternal form, ASHA-friendly output, Copy summary
- `pages/AdminDashboard.tsx` – Admin dashboard with login
- `lib/types.ts` – Maternal fields in PatientVitals
- `lib/ai-engine.ts` – Maternal rules
- `App.tsx` – Admin route
- `components/AppLayout.tsx` – Admin nav

### Simple Client (client/)
- `components/PatientForm.jsx` – Full vitals + maternal form
- `components/TriageCard.jsx` – ASHA-friendly output
- `lib/ruleEngine.js` – Offline rule engine
- `lib/offlineStore.js` – IndexedDB/localStorage
- `services/api.js` – API helpers
- `App.jsx` – Copy summary button
