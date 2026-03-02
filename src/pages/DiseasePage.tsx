import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { classifyDisease } from '@/lib/ai-engine';
import type { DiseaseResult } from '@/lib/types';

const allSymptoms = [
  'fever', 'cough', 'headache', 'chest_pain', 'breathlessness',
  'vomiting', 'body_pain', 'rash', 'chills', 'fatigue', 'dizziness',
];

export default function DiseasePage() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState(2);
  const [results, setResults] = useState<DiseaseResult[] | null>(null);

  const toggle = (s: string) => setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleClassify = () => setResults(classifyDisease(symptoms, duration));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Disease Classification</h1>
        <p className="text-muted-foreground mt-1">Predict probable diseases from symptoms</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 shadow-card border border-border space-y-5">
          <Label className="block mb-2">Select Symptoms</Label>
          <div className="grid grid-cols-2 gap-2">
            {allSymptoms.map(s => (
              <label key={s} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer">
                <Checkbox checked={symptoms.includes(s)} onCheckedChange={() => toggle(s)} />
                <span className="text-sm capitalize">{s.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
          <div><Label>Symptom Duration (days)</Label><Input type="number" value={duration} onChange={e => setDuration(+e.target.value)} /></div>
          <Button onClick={handleClassify} size="lg" className="w-full py-6 text-base" disabled={symptoms.length === 0}>
            <Brain className="w-5 h-5 mr-2" /> Classify Disease
          </Button>
        </div>

        {results && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">Top 3 Probable Diseases</h3>
            {results.map((r, i) => (
              <div key={r.disease} className="bg-card rounded-xl p-5 shadow-card border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-semibold text-foreground">#{i + 1} {r.disease}</span>
                  <span className="text-sm font-mono font-bold text-primary">{(r.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.confidence * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.15 }}
                    className="h-full rounded-full gradient-primary"
                  />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
