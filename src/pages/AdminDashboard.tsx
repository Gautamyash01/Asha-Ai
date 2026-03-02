import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, Baby, Truck, ClipboardList } from 'lucide-react';
import StatCard from '@/components/StatCard';

const API_BASE = 'http://localhost:5050';

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    totalPatientsToday?: number;
    criticalCases?: number;
    highRiskPregnancies?: number;
    recentReferrals?: { id: string; patientId: string; riskCategory: string; note: string; recordedDate: string }[];
  } | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('asha_token'));
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: 'admin123' });
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (t: string) => {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setToken(null);
      }
    } catch {
      setStats({
        totalPatientsToday: 0,
        criticalCases: 0,
        highRiskPregnancies: 0,
        recentReferrals: [],
      });
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats(token);
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('asha_token', data.token);
        setToken(data.token);
      } else {
        setError('Invalid credentials');
      }
    } catch {
      setError('Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('asha_token');
    setToken(null);
  };

  if (!token) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Login as Admin or Doctor to view analytics.</p>
        <form onSubmit={handleLogin} className="max-w-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={loginForm.username}
              onChange={(e) => setLoginForm((f) => ({ ...f, username: e.target.value }))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview for today</p>
        </div>
        <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground">
          Logout
        </button>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Patients Today" value={stats?.totalPatientsToday ?? 0} subtitle="Total visits" icon={Users} />
        <StatCard title="Critical Cases" value={stats?.criticalCases ?? 0} subtitle="Need immediate care" icon={Activity} variant="danger" />
        <StatCard title="High-Risk Pregnancies" value={stats?.highRiskPregnancies ?? 0} subtitle="Referred" icon={Baby} variant="warning" />
        <StatCard title="Recent Referrals" value={stats?.recentReferrals?.length ?? 0} subtitle="Last 10" icon={Truck} />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl p-5 shadow-card border border-border">
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5" /> Recent Referrals
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="pb-3 font-medium">Patient ID</th>
                <th className="pb-3 font-medium">Risk</th>
                <th className="pb-3 font-medium">Note</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentReferrals ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground">No referrals yet</td>
                </tr>
              ) : (
                (stats?.recentReferrals ?? []).map((r) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="py-3 font-mono text-xs">{r.patientId}</td>
                    <td className="py-3 font-medium">{r.riskCategory}</td>
                    <td className="py-3 text-muted-foreground">{r.note || '—'}</td>
                    <td className="py-3 text-muted-foreground">{r.recordedDate ? new Date(r.recordedDate).toLocaleString() : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
