import type { PatientVitals } from './types';

export interface BackendRiskResult {
  risk_probability: number;
  risk_score: number;
  urgency_level: 'RED' | 'YELLOW' | 'GREEN';
  top_contributing_features: string[];
}

const API_BASE_URL = 'http://localhost:5050';

export async function runBackendTriage(vitals: PatientVitals): Promise<BackendRiskResult> {
  const response = await fetch(`${API_BASE_URL}/triage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      age: vitals.age,
      gender: vitals.gender,
      pregnancy: vitals.pregnancyStatus,
      systolic_bp: vitals.systolicBP,
      diastolic_bp: vitals.diastolicBP,
      blood_sugar: vitals.bloodSugar,
      temperature: vitals.temperature,
      spo2: vitals.spo2,
      heart_rate: vitals.heartRate,
      symptoms: vitals.symptoms,
    }),
  });

  if (!response.ok) {
    throw new Error(`Backend triage request failed with status ${response.status}`);
  }

  return response.json();
}

