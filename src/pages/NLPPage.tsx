import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { extractSymptoms, classifyDisease } from '@/lib/ai-engine';
import type { NLPResult, DiseaseResult } from '@/lib/types';

export default function NLPPage() {
  const [text, setText] = useState('Fever and headache since 2 days with mild chest pain');
  const [nlp, setNlp] = useState<NLPResult | null>(null);
  const [diseases, setDiseases] = useState<DiseaseResult[] | null>(null);

  const handleExtract = () => {
    const r = extractSymptoms(text);
    setNlp(r);
    if (r.extractedSymptoms.length > 0) {
      setDiseases(classifyDisease(r.extractedSymptoms, r.duration || 1));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">NLP Symptom Extraction</h1>
        <p className="text-muted-foreground mt-1">Natural language to structured clinical features</p>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-card border border-border space-y-4">
        <Textarea
          rows={3}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Describe symptoms in natural language..."
          className="text-base"
        />
        <Button onClick={handleExtract} size="lg" className="w-full py-6 text-base">
          <FileText className="w-5 h-5 mr-2" /> Extract & Analyze
        </Button>
      </div>

      {nlp && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card border border-border">
            <h3 className="font-display font-semibold text-foreground mb-3">Extracted Symptoms</h3>
            <div className="flex flex-wrap gap-2">
              {nlp.extractedSymptoms.map(s => (
                <span key={s} className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {s.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 shadow-card border border-border">
            <h3 className="font-display font-semibold text-foreground mb-3">Extracted Info</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Duration:</span> <strong className="text-foreground">{nlp.duration ? `${nlp.duration} days` : 'Not detected'}</strong></p>
              <p><span className="text-muted-foreground">Severity:</span> <strong className="text-foreground">{nlp.severityWords.length > 0 ? nlp.severityWords.join(', ') : 'None detected'}</strong></p>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 shadow-card border border-border">
            <h3 className="font-display font-semibold text-foreground mb-3">Disease Prediction</h3>
            {diseases?.map(d => (
              <div key={d.disease} className="flex justify-between items-center py-1.5 text-sm">
                <span className="text-foreground">{d.disease}</span>
                <span className="font-mono font-semibold text-primary">{(d.confidence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
