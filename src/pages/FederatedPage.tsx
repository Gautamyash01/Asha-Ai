import { motion } from 'framer-motion';
import { Network, Smartphone, Server, ArrowRight } from 'lucide-react';

const steps = [
  { icon: Smartphone, title: 'Local Training', desc: 'Each ASHA worker device trains a local model on patient data collected in the field. Data never leaves the device.' },
  { icon: ArrowRight, title: 'Weight Updates', desc: 'Only model weight deltas (gradients) are transmitted to the central server — not raw patient data.' },
  { icon: Server, title: 'Central Aggregation', desc: 'FedAvg algorithm aggregates weight updates from all devices to improve the global model.' },
  { icon: Smartphone, title: 'Model Distribution', desc: 'Updated global model is pushed back to devices for improved local predictions.' },
];

export default function FederatedPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Federated Learning Simulation</h1>
        <p className="text-muted-foreground mt-1">Privacy-preserving decentralized model training</p>
      </div>

      {/* Architecture */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="bg-card rounded-xl p-5 shadow-card border border-border text-center"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl gradient-primary flex items-center justify-center">
              <step.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-2">Step {i + 1}: {step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Simulation */}
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <h3 className="font-display font-semibold text-foreground mb-4">Training Simulation</h3>
        <div className="space-y-4">
          {['Device A (Rampur)', 'Device B (Sitapur)', 'Device C (Lakhimpur)'].map((device, i) => {
            const accuracy = 75 + Math.random() * 15;
            const loss = 0.5 - Math.random() * 0.3;
            return (
              <motion.div
                key={device}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.2 }}
                className="p-4 rounded-lg border border-border bg-background"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground text-sm">{device}</span>
                  <span className="text-xs text-muted-foreground">Epoch 10/10</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Accuracy:</span>
                    <span className="ml-2 font-mono font-semibold text-foreground">{accuracy.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Loss:</span>
                    <span className="ml-2 font-mono font-semibold text-foreground">{loss.toFixed(3)}</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2, delay: i * 0.3 }} className="h-full gradient-primary rounded-full" />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-lg border-2 border-primary/20 bg-accent">
          <div className="flex items-center gap-2 mb-2">
            <Network className="w-5 h-5 text-primary" />
            <span className="font-display font-semibold text-foreground">Global Model (FedAvg)</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Aggregated Accuracy:</span> <span className="font-mono font-bold text-primary">87.3%</span></div>
            <div><span className="text-muted-foreground">Aggregated Loss:</span> <span className="font-mono font-bold text-primary">0.198</span></div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <h3 className="font-display font-semibold text-foreground mb-3">Key Benefits</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>🔒 Patient data stays on device — full privacy compliance</li>
          <li>📡 Works with low bandwidth — only weight deltas transmitted</li>
          <li>🌍 Scales to thousands of ASHA workers across districts</li>
          <li>⚡ Offline-first: local predictions work without internet</li>
        </ul>
      </div>
    </div>
  );
}
