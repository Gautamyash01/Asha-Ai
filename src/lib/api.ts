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
      bp: vitals.systolicBP,
      pregnant: vitals.pregnancyStatus,
    }),
  });

  if (!response.ok) {
    throw new Error(`Backend triage request failed with status ${response.status}`);
  }

  return response.json();
}

