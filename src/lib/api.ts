import type { PatientVitals } from './types';

export interface BackendTriageResult {
  level: string;
  action: string;
}

const API_BASE_URL = 'http://localhost:5050';

export async function runBackendTriage(vitals: PatientVitals): Promise<BackendTriageResult> {
  const response = await fetch(`${API_BASE_URL}/triage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      age: vitals.age,
      gender: vitals.gender,
      pregnant: vitals.pregnancyStatus,
      systolicBP: vitals.systolicBP,
      diastolicBP: vitals.diastolicBP,
      bloodSugar: vitals.bloodSugar,
      temperature: vitals.temperature,
      spo2: vitals.spo2,
      heartRate: vitals.heartRate,
      symptomDuration: vitals.symptomDuration,
      symptoms: vitals.symptoms,
      fever: vitals.symptoms.includes('fever'),
      cough: vitals.symptoms.includes('cough'),
      breathlessness: vitals.symptoms.includes('breathlessness'),
      hemoglobin: vitals.hemoglobin,
      trimester: vitals.trimester,
      swelling: vitals.swelling,
      severeHeadache: vitals.severeHeadache,
    }),
  });

  if (!response.ok) {
    throw new Error(`Backend triage request failed with status ${response.status}`);
  }

  const data = await response.json();
  return { level: data.riskLevel ?? data.riskCategory ?? data.level, action: data.recommendedAction ?? data.action };
}

