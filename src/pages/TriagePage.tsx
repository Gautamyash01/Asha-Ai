import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import TriageBadge from '@/components/TriageBadge';
import { predictPatientRisk, predictDeterioration } from '@/lib/ai-engine';
import type { PatientVitals, TriageResult, DeteriorationResult } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const symptomOptions = [
  { id: 'fever', label: 'Fever' },
  { id: 'chest_pain', label: 'Chest Pain' },
  { id: 'cough', label: 'Cough' },
  { id: 'breathlessness', label: 'Breathlessness' },
  { id: 'vomiting', label: 'Vomiting' },
  { id: 'headache', label: 'Headache' },
  { id: 'body_pain', label: 'Body Pain' },
  { id: 'chills', label: 'Chills' },
];

export default function TriagePage() {
  const [vitals, setVitals] = useState<PatientVitals>({
    age: 45, gender: 'female', pregnancyStatus: false,
    chronicDiseases: [], systolicBP: 120, diastolicBP: 80,
    bloodSugar: 100, temperature: 37, spo2: 97, heartRate: 80,
    symptoms: [], symptomDuration: 1,
  });
  const [result, setResult] = useState<TriageResult | null>(null);
  const [deterioration, setDeterioration] = useState<DeteriorationResult | null>(null);

  const handleSymptomToggle = (symptom: string) => {
    setVitals(v => ({
      ...v,
      symptoms: v.symptoms.includes(symptom) ? v.symptoms.filter(s => s !== symptom) : [...v.symptoms, symptom],
    }));
  };

  const handlePredict = () => {
    const r = predictPatientRisk(vitals);
    setResult(r);
    setDeterioration(predictDeterioration(vitals));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Patient Risk Prediction</h1>
        <p className="text-muted-foreground mt-1">ML-based triage with SHAP-style explanations</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-card rounded-xl p-8 shadow-card border border-border space-y-8">
          <h3 className="font-display text-lg font-semibold text-foreground">Patient Vitals</h3>

          {/* Demographics */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Demographics</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <div className="space-y-2"><Label>Age</Label><Input type="number" value={vitals.age} onChange={e => setVitals(v => ({ ...v, age: +e.target.value }))} /></div>
              <div className="space-y-2"><Label>Gender</Label>
                <select className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" value={vitals.gender} onChange={e => setVitals(v => ({ ...v, gender: e.target.value as any }))}>
                  <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </div>
              <div className="flex items-center gap-3 col-span-2 pt-1">
                <Switch checked={vitals.pregnancyStatus} onCheckedChange={c => setVitals(v => ({ ...v, pregnancyStatus: c }))} />
                <Label>Pregnant</Label>
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* Vitals */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Vital Signs</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <div className="space-y-2"><Label>Systolic BP</Label><Input type="number" value={vitals.systolicBP} onChange={e => setVitals(v => ({ ...v, systolicBP: +e.target.value }))} /></div>
              <div className="space-y-2"><Label>Diastolic BP</Label><Input type="number" value={vitals.diastolicBP} onChange={e => setVitals(v => ({ ...v, diastolicBP: +e.target.value }))} /></div>
              <div className="space-y-2"><Label>Blood Sugar (mg/dL)</Label><Input type="number" value={vitals.bloodSugar} onChange={e => setVitals(v => ({ ...v, bloodSugar: +e.target.value }))} /></div>
              <div className="space-y-2"><Label>Temperature (°C)</Label><Input type="number" step="0.1" value={vitals.temperature} onChange={e => setVitals(v => ({ ...v, temperature: +e.target.value }))} /></div>
              <div className="space-y-2"><Label>SpO2 (%)</Label><Input type="number" value={vitals.spo2} onChange={e => setVitals(v => ({ ...v, spo2: +e.target.value }))} /></div>
              <div className="space-y-2"><Label>Heart Rate (bpm)</Label><Input type="number" value={vitals.heartRate} onChange={e => setVitals(v => ({ ...v, heartRate: +e.target.value }))} /></div>
            </div>
          </div>

          <hr className="border-border" />

          {/* Maternal Health (when pregnant) */}
          {vitals.pregnancyStatus && (
            <>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Maternal Health</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <div className="space-y-2"><Label>Hemoglobin (g/dL)</Label><Input type="number" step="0.1" value={vitals.hemoglobin ?? ''} onChange={e => setVitals(v => ({ ...v, hemoglobin: e.target.value ? +e.target.value : undefined }))} placeholder="e.g. 11" /></div>
                  <div className="space-y-2"><Label>Trimester</Label>
                    <select className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm" value={vitals.trimester ?? ''} onChange={e => setVitals(v => ({ ...v, trimester: e.target.value ? +e.target.value as 1|2|3 : undefined }))}>
                      <option value="">Select</option><option value="1">1st</option><option value="2">2nd</option><option value="3">3rd</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 col-span-2">
                    <Checkbox checked={vitals.swelling ?? false} onCheckedChange={c => setVitals(v => ({ ...v, swelling: !!c }))} />
                    <Label>Swelling</Label>
                  </div>
                  <div className="flex items-center gap-3 col-span-2">
                    <Checkbox checked={vitals.severeHeadache ?? false} onCheckedChange={c => setVitals(v => ({ ...v, severeHeadache: !!c }))} />
                    <Label>Severe headache</Label>
                  </div>
                </div>
              </div>
              <hr className="border-border" />
            </>
          )}

          {/* Symptoms */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Symptoms</p>
            <div className="grid grid-cols-2 gap-3">
              {symptomOptions.map(s => (
                <label key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                  <Checkbox checked={vitals.symptoms.includes(s.id)} onCheckedChange={() => handleSymptomToggle(s.id)} />
                  <span className="text-sm font-medium">{s.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-5 space-y-2">
              <Label>Symptom Duration (days)</Label>
              <Input type="number" value={vitals.symptomDuration} onChange={e => setVitals(v => ({ ...v, symptomDuration: +e.target.value }))} />
            </div>
          </div>

          <Button onClick={handlePredict} size="lg" className="w-full text-base py-6 mt-2">
            <Activity className="w-5 h-5 mr-2" /> Run Triage Prediction
          </Button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              {/* Risk Score */}
              <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-foreground">Triage Result</h3>
                  <TriageBadge level={result.urgencyCategory} label={result.urgencyLabel} />
                </div>
                <div className="text-center mb-4">
                  <p className="text-5xl font-display font-bold text-foreground">{(result.riskProbability * 100).toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">Risk Probability</p>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.riskProbability * 100}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full ${result.urgencyCategory === 'red' ? 'gradient-danger' : result.urgencyCategory === 'yellow' ? 'gradient-warm' : 'gradient-primary'}`}
                  />
                </div>
              </div>

              {/* Backend Triage (Hybrid Engine - local) */}
              <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold text-foreground">Hybrid Triage (Rules + ML)</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Level:</span>{' '}
                    {result.urgencyLabel}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Recommended Action:</span>{' '}
                    {result.urgencyCategory === 'red'
                      ? 'Refer to PHC within 6 hours.'
                      : result.urgencyCategory === 'yellow'
                      ? 'Monitor vitals daily. Follow up in 2–3 days.'
                      : 'Home care. Provide ORS if needed. Follow up if symptoms worsen.'}
                  </p>
                </div>
              </div>

              {/* ASHA-Friendly: Reason + Recommended Action */}
              <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                <h3 className="font-display font-semibold text-foreground mb-3">Reason</h3>
                {result.explanation.length > 0 ? (
                  <ul className="space-y-2">
                    {result.explanation.slice(0, 3).map((e, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                        {e}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">No significant risk factors detected.</p>}
                <h3 className="font-display font-semibold text-foreground mt-4 mb-2">Recommended Action</h3>
                <p className="text-sm text-foreground">
                  {result.urgencyCategory === 'red' ? 'Refer to PHC within 6 hours.' : result.urgencyCategory === 'yellow' ? 'Monitor vitals daily. Follow up in 2–3 days.' : 'Home care. Provide ORS if needed. Follow up if symptoms worsen.'}
                </p>
                <button
                  onClick={() => {
                    const lines = [
                      '=== PATIENT CASE SUMMARY ===',
                      `Risk: ${result.urgencyLabel} (${(result.riskProbability * 100).toFixed(0)}%)`,
                      'Reason:', ...(result.explanation.slice(0, 3).map((e) => `- ${e}`)),
                      'Recommended Action:', result.urgencyCategory === 'red' ? 'Refer to PHC within 6 hours.' : result.urgencyCategory === 'yellow' ? 'Monitor vitals daily. Follow up in 2–3 days.' : 'Home care.',
                    ];
                    navigator.clipboard?.writeText(lines.join('\n'));
                    alert('Summary copied to clipboard.');
                  }}
                  className="mt-3 px-4 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg"
                >
                  Copy Summary for Doctor
                </button>
              </div>

              {/* Feature Importance */}
              <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                <h3 className="font-display font-semibold text-foreground mb-3">Feature Importance (SHAP)</h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.featureImportance} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="feature" type="category" width={110} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="importance" fill="hsl(174, 62%, 32%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 48h Deterioration */}
              {deterioration && (
                <div className="bg-card rounded-xl p-6 shadow-card border border-border">
                  <h3 className="font-display font-semibold text-foreground mb-3">48-Hour Deterioration Risk</h3>
                  <p className="text-3xl font-display font-bold text-foreground">{(deterioration.probability * 100).toFixed(0)}%</p>
                  <ul className="mt-3 space-y-1">
                    {deterioration.recommendations.map((r, i) => (
                      <li key={i} className="text-sm text-muted-foreground">• {r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
