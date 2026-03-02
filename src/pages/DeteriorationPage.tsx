import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { predictDeterioration } from '@/lib/ai-engine';
import type { PatientVitals, DeteriorationResult } from '@/lib/types';

export default function DeteriorationPage() {
  const [vitals, setVitals] = useState<PatientVitals>({
    age: 62, gender: 'male', pregnancyStatus: false, chronicDiseases: [],
    systolicBP: 155, diastolicBP: 95, bloodSugar: 260, temperature: 38.8,
    spo2: 92, heartRate: 115, symptoms: ['fever', 'breathlessness'], symptomDuration: 4,
  });
  const [result, setResult] = useState<DeteriorationResult | null>(null);

  const handlePredict = () => setResult(predictDeterioration(vitals));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">48-Hour Deterioration Prediction</h1>
        <p className="text-muted-foreground mt-1">Predict probability of condition worsening</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 shadow-card border border-border space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Age</Label><Input type="number" value={vitals.age} onChange={e => setVitals(v => ({ ...v, age: +e.target.value }))} /></div>
            <div><Label>SpO2 (%)</Label><Input type="number" value={vitals.spo2} onChange={e => setVitals(v => ({ ...v, spo2: +e.target.value }))} /></div>
            <div><Label>Systolic BP</Label><Input type="number" value={vitals.systolicBP} onChange={e => setVitals(v => ({ ...v, systolicBP: +e.target.value }))} /></div>
            <div><Label>Heart Rate</Label><Input type="number" value={vitals.heartRate} onChange={e => setVitals(v => ({ ...v, heartRate: +e.target.value }))} /></div>
            <div><Label>Temperature (°C)</Label><Input type="number" step="0.1" value={vitals.temperature} onChange={e => setVitals(v => ({ ...v, temperature: +e.target.value }))} /></div>
            <div><Label>Blood Sugar</Label><Input type="number" value={vitals.bloodSugar} onChange={e => setVitals(v => ({ ...v, bloodSugar: +e.target.value }))} /></div>
            <div className="col-span-2"><Label>Symptom Duration (days)</Label><Input type="number" value={vitals.symptomDuration} onChange={e => setVitals(v => ({ ...v, symptomDuration: +e.target.value }))} /></div>
          </div>
          <Button onClick={handlePredict} size="lg" className="w-full py-6 text-base">
            <Clock className="w-5 h-5 mr-2" /> Predict 48h Risk
          </Button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-6 shadow-card border border-border">
            <div className="text-center mb-6">
              <p className="text-6xl font-display font-bold text-foreground">{(result.probability * 100).toFixed(0)}%</p>
              <p className="text-muted-foreground mt-1">Probability of deterioration in 48 hours</p>
              <div className="w-full bg-muted rounded-full h-3 mt-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.probability * 100}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full ${result.probability > 0.5 ? 'gradient-danger' : result.probability > 0.3 ? 'gradient-warm' : 'gradient-primary'}`}
                />
              </div>
            </div>

            <h4 className="font-display font-semibold text-foreground mb-3">Preventive Recommendations</h4>
            <ul className="space-y-2">
              {result.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}
