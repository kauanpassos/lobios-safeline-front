import type { ReactNode } from 'react';

type MetricTone = 'blue' | 'purple' | 'amber' | 'green';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  tone: MetricTone;
}

export function MetricCard({ title, value, icon, tone }: MetricCardProps) {
  return (
    <article className={`rh-metric-card rh-metric-card--${tone}`} aria-label={`${title}: ${value}`}>
      <span className="rh-metric-card__icon" aria-hidden="true">{icon}</span>
      <span className="rh-metric-card__content">
        <span className="rh-metric-card__title">{title}</span>
        <span className="rh-metric-card__value" aria-live="polite">{value}</span>
      </span>
    </article>
  );
}
