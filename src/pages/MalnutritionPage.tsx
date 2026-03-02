import { useState } from 'react';
import { motion } from 'framer-motion';
import { Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { detectMalnutrition } from '@/lib/ai-engine';
import type { MalnutritionResult } from '@/lib/types';

export default function MalnutritionPage() {
  const [height, setHeight] = useState(110);
  const [weight, setWeight] = useState(18);
  const [age, setAge] = useState(8);
  const [result, setResult] = useState<MalnutritionResult | null>(null);

  const handleDetect = () => setResult(detectMalnutrition(height, weight, age));

  const classColor = (c: string) => c === 'Severe Malnutrition' ? 'triage-red' : c === 'Moderate Malnutrition' ? 'triage-yellow' : 'triage-green';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Malnutrition Detection</h1>
        <p className="text-muted-foreground mt-1">BMI calculation & growth percentile classification</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 shadow-card border border-border space-y-4">
          <div><Label>Height (cm)</Label><Input type="number" value={height} onChange={e => setHeight(+e.target.value)} /></div>
          <div><Label>Weight (kg)</Label><Input type="number" value={weight} onChange={e => setWeight(+e.target.value)} /></div>
          <div><Label>Age (years)</Label><Input type="number" value={age} onChange={e => setAge(+e.target.value)} /></div>
          <Button onClick={handleDetect} size="lg" className="w-full py-6 text-base">
            <Apple className="w-5 h-5 mr-2" /> Assess Malnutrition
          </Button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-6 shadow-card border border-border space-y-4">
            <div className="text-center">
              <p className="text-5xl font-display font-bold text-foreground">{result.bmi}</p>
              <p className="text-sm text-muted-foreground">Body Mass Index</p>
            </div>
            <div className="text-center">
              <span className={`${classColor(result.classification)} inline-block px-4 py-2 rounded-full font-semibold text-sm`}>
                {result.classification}
              </span>
            </div>
            <div className="text-center">
              <p className="text-lg font-display font-semibold text-foreground">{result.percentile}th Percentile</p>
              <p className="text-sm text-muted-foreground">Growth percentile for age</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
