export interface PatientVitals {
  age: number;
  gender: 'male' | 'female' | 'other';
  pregnancyStatus: boolean;
  chronicDiseases: string[];
  systolicBP: number;
  diastolicBP: number;
  bloodSugar: number;
  temperature: number;
  spo2: number;
  heartRate: number;
  symptoms: string[];
  symptomDuration: number;
  freeTextSymptoms?: string;
  hemoglobin?: number;
  trimester?: 1 | 2 | 3;
  swelling?: boolean;
  severeHeadache?: boolean;
}

export interface TriageResult {
  riskProbability: number;
  urgencyCategory: 'red' | 'yellow' | 'green';
  urgencyLabel: string;
  explanation: string[];
  featureImportance: { feature: string; importance: number }[];
}

export interface DiseaseResult {
  disease: string;
  confidence: number;
}

export interface NLPResult {
  extractedSymptoms: string[];
  duration: number | null;
  severityWords: string[];
  structuredFeatures: Record<string, boolean | number>;
}

export interface OutbreakAlert {
  disease: string;
  region: string;
  caseCount: number;
  growthRate: number;
  severity: 'low' | 'medium' | 'high';
  lat: number;
  lng: number;
}

export interface VillageResource {
  name: string;
  avgRiskScore: number;
  criticalPatients: number;
  distanceToHospital: number;
  ambulanceAvailable: boolean;
  priorityScore: number;
}

export interface PatientPriority {
  id: string;
  name: string;
  age: number;
  riskScore: number;
  symptomSeverity: number;
  ageFactor: number;
  durationFactor: number;
  priorityScore: number;
  urgency: 'red' | 'yellow' | 'green';
}

export interface MalnutritionResult {
  bmi: number;
  classification: 'Normal' | 'Moderate Malnutrition' | 'Severe Malnutrition';
  percentile: number;
}

export interface DeteriorationResult {
  probability: number;
  recommendations: string[];
}
