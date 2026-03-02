import { motion } from 'framer-motion';
import TriageBadge from '@/components/TriageBadge';
import { generatePatientPriorities } from '@/lib/ai-engine';

const patients = generatePatientPriorities();

export default function PriorityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Patient Priority Scoring</h1>
        <p className="text-muted-foreground mt-1">Score = 0.4×Risk + 0.3×Severity + 0.2×Age + 0.1×Duration</p>
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border bg-muted/50">
                <th className="p-4 font-medium">#</th>
                <th className="p-4 font-medium">Patient</th>
                <th className="p-4 font-medium">Age</th>
                <th className="p-4 font-medium">Risk</th>
                <th className="p-4 font-medium">Severity</th>
                <th className="p-4 font-medium">Age Factor</th>
                <th className="p-4 font-medium">Duration</th>
                <th className="p-4 font-medium">Priority</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-border/50 hover:bg-muted/30"
                >
                  <td className="p-4 font-mono text-muted-foreground">{i + 1}</td>
                  <td className="p-4 font-medium text-foreground">{p.name}</td>
                  <td className="p-4 text-muted-foreground">{p.age}</td>
                  <td className="p-4 font-mono text-foreground">{(p.riskScore * 100).toFixed(0)}%</td>
                  <td className="p-4 font-mono text-foreground">{(p.symptomSeverity * 100).toFixed(0)}%</td>
                  <td className="p-4 font-mono text-foreground">{p.ageFactor.toFixed(2)}</td>
                  <td className="p-4 font-mono text-foreground">{p.durationFactor.toFixed(2)}</td>
                  <td className="p-4 font-mono font-bold text-foreground">{(p.priorityScore * 100).toFixed(0)}%</td>
                  <td className="p-4"><TriageBadge level={p.urgency} size="sm" /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
