import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import TriageBadge from '@/components/TriageBadge';
import { generateOutbreakData } from '@/lib/ai-engine';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const outbreaks = generateOutbreakData();

export default function OutbreakPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Outbreak Detection Engine</h1>
        <p className="text-muted-foreground mt-1">DBSCAN clustering & anomaly detection</p>
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        {outbreaks.filter(o => o.severity === 'high').map(o => (
          <motion.div
            key={o.region}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="triage-red-bg border border-triage-red/20 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-triage-red mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-foreground">{o.disease} Outbreak — {o.region}</p>
              <p className="text-sm text-muted-foreground">{o.caseCount} cases · Growth rate: {(o.growthRate * 100).toFixed(0)}%</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <h3 className="font-display font-semibold text-foreground mb-4">Case Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={outbreaks.map(o => ({ name: o.disease, cases: o.caseCount, growth: Math.round(o.growthRate * 100) }))}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="cases" fill="hsl(0, 72%, 50%)" radius={[6, 6, 0, 0]} name="Cases" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <h3 className="font-display font-semibold text-foreground mb-4">All Monitored Regions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="pb-3 font-medium">Disease</th>
                <th className="pb-3 font-medium">Region</th>
                <th className="pb-3 font-medium">Cases</th>
                <th className="pb-3 font-medium">Growth</th>
                <th className="pb-3 font-medium">Severity</th>
              </tr>
            </thead>
            <tbody>
              {outbreaks.map(o => (
                <tr key={o.region} className="border-b border-border/50">
                  <td className="py-3 font-medium text-foreground">{o.disease}</td>
                  <td className="py-3 text-muted-foreground">{o.region}</td>
                  <td className="py-3 font-mono text-foreground">{o.caseCount}</td>
                  <td className="py-3 font-mono text-foreground">{(o.growthRate * 100).toFixed(0)}%</td>
                  <td className="py-3">
                    <TriageBadge level={o.severity === 'high' ? 'red' : o.severity === 'medium' ? 'yellow' : 'green'} label={o.severity} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
