import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const sampleExplanation = {
  patient: 'Ram Prasad',
  age: 72,
  riskScore: 0.91,
  reasons: [
    { factor: 'High Blood Pressure', contribution: 0.28, detail: 'Systolic BP: 185 mmHg (hypertensive crisis)' },
    { factor: 'Age > 60', contribution: 0.22, detail: 'Age 72 — elderly care protocol required' },
    { factor: 'Chest Pain', contribution: 0.18, detail: 'Active chest pain reported for 3 days' },
    { factor: 'Low SpO2', contribution: 0.15, detail: 'SpO2 at 89% — below critical threshold' },
    { factor: 'Symptom Duration', contribution: 0.10, detail: 'Symptoms persisting for 5+ days' },
    { factor: 'Diabetes', contribution: 0.07, detail: 'Blood sugar: 320 mg/dL — diabetic emergency' },
  ],
};

export default function ExplainablePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Explainable AI Dashboard</h1>
        <p className="text-muted-foreground mt-1">SHAP-style reasoning for model transparency</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Patient Card */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-1">{sampleExplanation.patient}</h3>
          <p className="text-sm text-muted-foreground mb-4">Age {sampleExplanation.age} · Risk Score: {(sampleExplanation.riskScore * 100).toFixed(0)}%</p>

          <h4 className="font-display font-semibold text-foreground mb-3 text-sm">Why this patient is high risk:</h4>
          <div className="space-y-3">
            {sampleExplanation.reasons.map((r, i) => (
              <motion.div key={r.factor} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-foreground">{r.factor}</span>
                  <span className="font-mono text-primary font-semibold">+{(r.contribution * 100).toFixed(0)}%</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{r.detail}</p>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.contribution * 100 * 3}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="h-full rounded-full gradient-danger"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Feature Contribution Chart</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleExplanation.reasons.map(r => ({ name: r.factor, contribution: Math.round(r.contribution * 100) }))} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="contribution" fill="hsl(0, 72%, 50%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
