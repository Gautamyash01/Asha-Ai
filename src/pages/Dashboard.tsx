import { motion } from 'framer-motion';
import { Activity, Users, AlertTriangle, Truck, Brain, TrendingUp } from 'lucide-react';
import StatCard from '@/components/StatCard';
import TriageBadge from '@/components/TriageBadge';
import { generatePatientPriorities, generateOutbreakData, generateVillageResources } from '@/lib/ai-engine';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const patients = generatePatientPriorities();
const outbreaks = generateOutbreakData();
const villages = generateVillageResources();

const triageDist = [
  { name: 'Critical', value: patients.filter(p => p.urgency === 'red').length, color: 'hsl(0, 80%, 50%)' },
  { name: 'High Risk', value: patients.filter(p => p.urgency === 'yellow').length, color: 'hsl(40, 95%, 50%)' },
  { name: 'Stable', value: patients.filter(p => p.urgency === 'green').length, color: 'hsl(145, 60%, 40%)' },
];

const outbreakChart = outbreaks.map(o => ({ name: o.region.split(' - ')[1], cases: o.caseCount, growth: Math.round(o.growthRate * 100) }));

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Command Center</h1>
        <p className="text-muted-foreground mt-1">Real-time rural health intelligence overview</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Patients" value={patients.length} subtitle="In monitoring" icon={Users} />
        <StatCard title="Critical Cases" value={patients.filter(p => p.urgency === 'red').length} subtitle="Immediate attention" icon={Activity} variant="danger" />
        <StatCard title="Active Outbreaks" value={outbreaks.filter(o => o.severity === 'high').length} subtitle="High severity" icon={AlertTriangle} variant="warning" />
        <StatCard title="Villages Covered" value={villages.length} subtitle="Under surveillance" icon={Truck} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Triage Distribution */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Triage Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={triageDist} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {triageDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {triageDist.map(t => (
              <div key={t.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                {t.name}: {t.value}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Outbreak Cases */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl p-5 shadow-card border border-border">
          <h3 className="font-display font-semibold text-foreground mb-4">Outbreak Cases by Region</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outbreakChart}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="cases" fill="hsl(174, 62%, 32%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Priority Queue */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl p-5 shadow-card border border-border">
        <h3 className="font-display font-semibold text-foreground mb-4">Patient Priority Queue</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="pb-3 font-medium">Patient</th>
                <th className="pb-3 font-medium">Age</th>
                <th className="pb-3 font-medium">Priority Score</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {patients.slice(0, 5).map(p => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="py-3 font-medium text-foreground">{p.name}</td>
                  <td className="py-3 text-muted-foreground">{p.age}</td>
                  <td className="py-3 font-mono font-semibold text-foreground">{(p.priorityScore * 100).toFixed(0)}%</td>
                  <td className="py-3"><TriageBadge level={p.urgency} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
