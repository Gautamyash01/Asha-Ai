import type { PatientVitals, TriageResult, DiseaseResult, NLPResult, OutbreakAlert, VillageResource, PatientPriority, MalnutritionResult, DeteriorationResult } from './types';

// ========================
// 1. PATIENT RISK PREDICTION
// ========================
export function predictPatientRisk(vitals: PatientVitals): TriageResult {
  const flags: string[] = [];
  let score = 0;

  // Feature engineering
  const respiratoryRisk = vitals.symptoms.includes('fever') && vitals.symptoms.includes('cough') && vitals.symptoms.includes('breathlessness');
  const preeclampsiaRisk = vitals.pregnancyStatus && vitals.systolicBP > 140;
  const diabeticEmergency = vitals.bloodSugar > 300;
  const chronicFlag = vitals.symptomDuration > 3;

  if (respiratoryRisk) { score += 0.25; flags.push('Respiratory risk: Fever + Cough + Breathlessness'); }
  if (preeclampsiaRisk) { score += 0.3; flags.push('Preeclampsia risk: High BP during pregnancy'); }
  if (vitals.hemoglobin != null && vitals.hemoglobin < 10) { score += 0.15; flags.push('Anemia: Hemoglobin < 10 g/dL'); }
  if (vitals.pregnancyStatus && vitals.swelling && vitals.severeHeadache && vitals.systolicBP > 140) { score += 0.35; flags.push('Possible preeclampsia: Swelling + Headache + High BP'); }
  if (diabeticEmergency) { score += 0.25; flags.push('Diabetic emergency: Blood sugar > 300 mg/dL'); }
  if (chronicFlag) { score += 0.1; flags.push('Chronic symptoms: Duration > 3 days'); }

  // Vitals scoring
  if (vitals.spo2 < 92) { score += 0.2; flags.push(`Low SpO2: ${vitals.spo2}%`); }
  else if (vitals.spo2 < 95) { score += 0.1; flags.push(`Borderline SpO2: ${vitals.spo2}%`); }

  if (vitals.temperature > 39) { score += 0.15; flags.push(`High fever: ${vitals.temperature}°C`); }
  else if (vitals.temperature > 38) { score += 0.08; flags.push(`Moderate fever: ${vitals.temperature}°C`); }

  if (vitals.heartRate > 120) { score += 0.15; flags.push(`Tachycardia: ${vitals.heartRate} bpm`); }
  if (vitals.systolicBP > 180) { score += 0.2; flags.push(`Hypertensive crisis: ${vitals.systolicBP}/${vitals.diastolicBP}`); }
  if (vitals.systolicBP < 90) { score += 0.2; flags.push(`Hypotension: ${vitals.systolicBP}/${vitals.diastolicBP}`); }

  // Age factor
  if (vitals.age > 60) { score += 0.1; flags.push('Elderly patient (>60 years)'); }
  if (vitals.age < 5) { score += 0.1; flags.push('Pediatric patient (<5 years)'); }

  // Symptom severity
  if (vitals.symptoms.includes('chest_pain')) { score += 0.15; flags.push('Chest pain reported'); }
  if (vitals.symptoms.includes('breathlessness')) { score += 0.1; flags.push('Breathlessness reported'); }

  const riskProbability = Math.min(score, 1);
  const urgencyCategory = riskProbability > 0.6 ? 'red' : riskProbability > 0.3 ? 'yellow' : 'green';
  const urgencyLabel = urgencyCategory === 'red' ? 'Critical' : urgencyCategory === 'yellow' ? 'High Risk' : 'Stable';

  const featureImportance = [
    { feature: 'SpO2 Level', importance: 0.18 },
    { feature: 'Blood Pressure', importance: 0.16 },
    { feature: 'Temperature', importance: 0.14 },
    { feature: 'Heart Rate', importance: 0.12 },
    { feature: 'Age', importance: 0.10 },
    { feature: 'Blood Sugar', importance: 0.09 },
    { feature: 'Symptom Duration', importance: 0.08 },
    { feature: 'Pregnancy Status', importance: 0.07 },
    { feature: 'Chronic Diseases', importance: 0.06 },
  ];

  return { riskProbability, urgencyCategory, urgencyLabel, explanation: flags, featureImportance };
}

// ========================
// 2. DISEASE CLASSIFICATION
// ========================
export function classifyDisease(symptoms: string[], duration: number, hasOutbreakSignal: boolean = false): DiseaseResult[] {
  const diseaseScores: Record<string, number> = {
    'Viral Fever': 0,
    'Malaria': 0,
    'Typhoid': 0,
    'Pneumonia': 0,
    'Heat Stroke': 0,
    'Dengue': 0,
  };

  if (symptoms.includes('fever')) { diseaseScores['Viral Fever'] += 0.3; diseaseScores['Malaria'] += 0.2; diseaseScores['Typhoid'] += 0.2; diseaseScores['Dengue'] += 0.25; }
  if (symptoms.includes('cough')) { diseaseScores['Pneumonia'] += 0.3; diseaseScores['Viral Fever'] += 0.1; }
  if (symptoms.includes('breathlessness')) { diseaseScores['Pneumonia'] += 0.25; }
  if (symptoms.includes('chest_pain')) { diseaseScores['Pneumonia'] += 0.15; }
  if (symptoms.includes('vomiting')) { diseaseScores['Typhoid'] += 0.2; diseaseScores['Malaria'] += 0.15; diseaseScores['Heat Stroke'] += 0.15; }
  if (symptoms.includes('headache')) { diseaseScores['Dengue'] += 0.2; diseaseScores['Malaria'] += 0.15; diseaseScores['Heat Stroke'] += 0.1; }
  if (symptoms.includes('body_pain')) { diseaseScores['Dengue'] += 0.2; diseaseScores['Malaria'] += 0.1; }
  if (symptoms.includes('rash')) { diseaseScores['Dengue'] += 0.15; }
  if (symptoms.includes('chills')) { diseaseScores['Malaria'] += 0.25; }

  if (duration > 5) { diseaseScores['Typhoid'] += 0.15; }
  if (hasOutbreakSignal) { diseaseScores['Malaria'] += 0.1; diseaseScores['Dengue'] += 0.1; }

  return Object.entries(diseaseScores)
    .map(([disease, score]) => ({ disease, confidence: Math.min(score + Math.random() * 0.05, 0.99) }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}

// ========================
// 3. NLP SYMPTOM EXTRACTION
// ========================
export function extractSymptoms(text: string): NLPResult {
  const lower = text.toLowerCase();
  const symptomMap: Record<string, string> = {
    'fever': 'fever', 'headache': 'headache', 'chest pain': 'chest_pain',
    'cough': 'cough', 'breathlessness': 'breathlessness', 'shortness of breath': 'breathlessness',
    'vomiting': 'vomiting', 'nausea': 'vomiting', 'body pain': 'body_pain',
    'body ache': 'body_pain', 'joint pain': 'body_pain', 'rash': 'rash',
    'chills': 'chills', 'diarrhea': 'vomiting', 'fatigue': 'fatigue',
    'dizziness': 'dizziness', 'sore throat': 'cough', 'cold': 'cough',
  };

  const extracted: string[] = [];
  for (const [keyword, symptom] of Object.entries(symptomMap)) {
    if (lower.includes(keyword) && !extracted.includes(symptom)) {
      extracted.push(symptom);
    }
  }

  // Duration extraction
  let duration: number | null = null;
  const durationMatch = lower.match(/(\d+)\s*day/);
  if (durationMatch) duration = parseInt(durationMatch[1]);
  const sinceMatch = lower.match(/since\s+(\d+)\s*day/);
  if (sinceMatch) duration = parseInt(sinceMatch[1]);

  // Severity words
  const severityWords: string[] = [];
  const severityTerms = ['severe', 'acute', 'intense', 'mild', 'moderate', 'extreme', 'chronic', 'persistent', 'high', 'sharp'];
  for (const term of severityTerms) {
    if (lower.includes(term)) severityWords.push(term);
  }

  return {
    extractedSymptoms: extracted,
    duration,
    severityWords,
    structuredFeatures: Object.fromEntries(extracted.map(s => [s, true])),
  };
}

// ========================
// 4. OUTBREAK DETECTION
// ========================
export function generateOutbreakData(): OutbreakAlert[] {
  return [
    { disease: 'Dengue', region: 'Block A - Rampur', caseCount: 47, growthRate: 0.35, severity: 'high', lat: 26.8, lng: 80.9 },
    { disease: 'Malaria', region: 'Block C - Sitapur', caseCount: 32, growthRate: 0.22, severity: 'medium', lat: 27.5, lng: 80.7 },
    { disease: 'Typhoid', region: 'Block B - Lakhimpur', caseCount: 18, growthRate: 0.08, severity: 'low', lat: 27.9, lng: 80.8 },
    { disease: 'Viral Fever', region: 'Block D - Bahraich', caseCount: 55, growthRate: 0.42, severity: 'high', lat: 27.6, lng: 81.6 },
    { disease: 'Pneumonia', region: 'Block E - Gonda', caseCount: 12, growthRate: 0.05, severity: 'low', lat: 27.1, lng: 82.0 },
  ];
}

// ========================
// 5. RESOURCE OPTIMIZATION
// ========================
export function generateVillageResources(): VillageResource[] {
  const villages = [
    { name: 'Rampur Village', avgRiskScore: 0.72, criticalPatients: 8, distanceToHospital: 35, ambulanceAvailable: false },
    { name: 'Sitapur Block', avgRiskScore: 0.58, criticalPatients: 5, distanceToHospital: 22, ambulanceAvailable: true },
    { name: 'Lakhimpur East', avgRiskScore: 0.45, criticalPatients: 3, distanceToHospital: 18, ambulanceAvailable: true },
    { name: 'Bahraich Central', avgRiskScore: 0.81, criticalPatients: 12, distanceToHospital: 48, ambulanceAvailable: false },
    { name: 'Gonda South', avgRiskScore: 0.33, criticalPatients: 1, distanceToHospital: 12, ambulanceAvailable: true },
    { name: 'Balrampur North', avgRiskScore: 0.65, criticalPatients: 6, distanceToHospital: 30, ambulanceAvailable: false },
  ];

  return villages.map(v => ({
    ...v,
    priorityScore: 0.35 * v.avgRiskScore + 0.3 * (v.criticalPatients / 15) + 0.25 * (v.distanceToHospital / 50) + 0.1 * (v.ambulanceAvailable ? 0 : 1),
  })).sort((a, b) => b.priorityScore - a.priorityScore);
}

// ========================
// 6. PATIENT PRIORITY
// ========================
export function generatePatientPriorities(): PatientPriority[] {
  const patients = [
    { id: 'P001', name: 'Rani Devi', age: 65, riskScore: 0.82, symptomSeverity: 0.7, symptoms: 3 },
    { id: 'P002', name: 'Mohan Lal', age: 45, riskScore: 0.45, symptomSeverity: 0.4, symptoms: 2 },
    { id: 'P003', name: 'Sunita Kumari', age: 28, riskScore: 0.78, symptomSeverity: 0.85, symptoms: 5 },
    { id: 'P004', name: 'Ram Prasad', age: 72, riskScore: 0.91, symptomSeverity: 0.9, symptoms: 4 },
    { id: 'P005', name: 'Lakshmi Bai', age: 34, riskScore: 0.35, symptomSeverity: 0.3, symptoms: 1 },
    { id: 'P006', name: 'Suresh Kumar', age: 55, riskScore: 0.62, symptomSeverity: 0.55, symptoms: 3 },
    { id: 'P007', name: 'Geeta Sharma', age: 8, riskScore: 0.7, symptomSeverity: 0.65, symptoms: 4 },
    { id: 'P008', name: 'Babu Ram', age: 60, riskScore: 0.55, symptomSeverity: 0.5, symptoms: 2 },
  ];

  return patients.map(p => {
    const ageFactor = p.age > 60 ? 1 : p.age < 5 ? 0.9 : p.age < 12 ? 0.6 : 0.3;
    const durationFactor = Math.random() * 0.5 + 0.3;
    const priorityScore = 0.4 * p.riskScore + 0.3 * p.symptomSeverity + 0.2 * ageFactor + 0.1 * durationFactor;
    const urgency: 'red' | 'yellow' | 'green' = priorityScore > 0.6 ? 'red' : priorityScore > 0.35 ? 'yellow' : 'green';
    return { ...p, ageFactor, durationFactor, priorityScore, urgency };
  }).sort((a, b) => b.priorityScore - a.priorityScore);
}

// ========================
// 7. MALNUTRITION DETECTION
// ========================
export function detectMalnutrition(height: number, weight: number, age: number): MalnutritionResult {
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);

  let classification: MalnutritionResult['classification'];
  let percentile: number;

  if (age < 18) {
    if (bmi < 14) { classification = 'Severe Malnutrition'; percentile = 3; }
    else if (bmi < 16) { classification = 'Moderate Malnutrition'; percentile = 10; }
    else { classification = 'Normal'; percentile = 50; }
  } else {
    if (bmi < 16) { classification = 'Severe Malnutrition'; percentile = 3; }
    else if (bmi < 18.5) { classification = 'Moderate Malnutrition'; percentile = 12; }
    else { classification = 'Normal'; percentile = 55; }
  }

  return { bmi: Math.round(bmi * 10) / 10, classification, percentile };
}

// ========================
// 10. 48-HOUR DETERIORATION
// ========================
export function predictDeterioration(vitals: PatientVitals): DeteriorationResult {
  let prob = 0.1;
  const recs: string[] = [];

  if (vitals.spo2 < 94) { prob += 0.2; recs.push('Monitor oxygen levels every 2 hours'); }
  if (vitals.temperature > 38.5) { prob += 0.15; recs.push('Administer antipyretics and hydration'); }
  if (vitals.systolicBP > 160 || vitals.systolicBP < 90) { prob += 0.2; recs.push('BP monitoring every hour; consider IV fluids'); }
  if (vitals.heartRate > 110) { prob += 0.1; recs.push('Cardiac monitoring recommended'); }
  if (vitals.bloodSugar > 250) { prob += 0.15; recs.push('Insulin management and glucose monitoring'); }
  if (vitals.symptomDuration > 5) { prob += 0.1; recs.push('Consider referral to district hospital'); }
  if (vitals.age > 60) { prob += 0.1; recs.push('Elderly care protocol activation'); }

  if (recs.length === 0) recs.push('Continue routine monitoring');

  return { probability: Math.min(prob, 0.95), recommendations: recs };
}
