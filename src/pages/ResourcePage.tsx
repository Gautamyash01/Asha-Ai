import { motion } from 'framer-motion';
import { Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { generateVillageResources } from '@/lib/ai-engine';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const villages = generateVillageResources();

export default function ResourcePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Resource Allocation</h1>
        <p className="text-muted-foreground mt-1">Ambulance priority & resource optimization</p>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <h3 className="font-display font-semibold text-foreground mb-4">Village Priority Ranking</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={villages.map(v => ({ name: v.name, priority: Math.round(v.priorityScore * 100) }))} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="priority" fill="hsl(35, 80%, 55%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <h3 className="font-display font-semibold text-foreground mb-4">Recommended Dispatch Order</h3>
        <div className="space-y-3">
          {villages.map((v, i) => (
            <motion.div
              key={v.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background"
            >
              <span className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{v.name}</p>
                <p className="text-xs text-muted-foreground">{v.criticalPatients} critical · {v.distanceToHospital}km to hospital</p>
              </div>
              <div className="flex items-center gap-1 text-xs">
                {v.ambulanceAvailable
                  ? <><CheckCircle2 className="w-4 h-4 text-triage-green" /><span className="text-muted-foreground">Available</span></>
                  : <><AlertCircle className="w-4 h-4 text-triage-red" /><span className="text-muted-foreground">Needed</span></>
                }
              </div>
              <span className="font-mono font-bold text-foreground text-sm">{(v.priorityScore * 100).toFixed(0)}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
