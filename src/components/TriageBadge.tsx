interface TriageBadgeProps {
  level: 'red' | 'yellow' | 'green';
  label?: string;
  size?: 'sm' | 'md';
}

export default function TriageBadge({ level, label, size = 'md' }: TriageBadgeProps) {
  const styles = {
    red: 'triage-red',
    yellow: 'triage-yellow',
    green: 'triage-green',
  };

  const labels = { red: 'Critical', yellow: 'High Risk', green: 'Stable' };

  return (
    <span className={`${styles[level]} inline-flex items-center rounded-full font-semibold ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      {label || labels[level]}
    </span>
  );
}
