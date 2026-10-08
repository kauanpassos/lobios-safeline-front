import type { CSSProperties } from 'react';
import type { AnalyticsPoint, CaseChartType } from '../../pages/RH/analytics/caseAnalytics';

interface RhAnalyticsChartProps {
  title: string;
  points: AnalyticsPoint[];
  chartType: CaseChartType;
}

const CATEGORY_COLORS = [
  'var(--color-primary)',
  'var(--color-warning)',
  'var(--color-success)',
  'var(--status-analise-color)',
  'var(--color-info)',
];

const getPointColor = (label: string, index: number): string => {
  const statusColors: Record<string, string> = {
    Recebido: 'var(--status-recebido-color)',
    'Em análise': 'var(--status-analise-color)',
    'Em investigação': 'var(--status-investigacao-color)',
    'Aguardando informações': 'var(--status-aguardando-color)',
    Resolvido: 'var(--status-resolvido-color)',
    Encerrado: 'var(--status-encerrado-color)',
  };

  return statusColors[label] ?? CATEGORY_COLORS[index % CATEGORY_COLORS.length];
};

const getDonutBackground = (points: AnalyticsPoint[]): string => {
  const total = points.reduce((sum, point) => sum + point.value, 0);
  let currentPercentage = 0;
  const segments = points.map((point, index) => {
    const start = currentPercentage;
    currentPercentage += (point.value / total) * 100;
    return `${getPointColor(point.label, index)} ${start}% ${currentPercentage}%`;
  });

  return `conic-gradient(${segments.join(', ')})`;
};

function HorizontalBars({ points }: Pick<RhAnalyticsChartProps, 'points'>) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <ol className="rh-chart-bars" aria-label="Valores por grupo">
      {points.map((point, index) => (
        <li key={point.label}>
          <span className="rh-chart-bars__label">{point.label}</span>
          <span className="rh-chart-bars__track">
            <span
              className="rh-chart-bars__fill"
              style={{
                width: `${(point.value / maxValue) * 100}%`,
                backgroundColor: getPointColor(point.label, index),
              }}
            />
          </span>
          <strong className="rh-chart-bars__value">{point.value}</strong>
        </li>
      ))}
    </ol>
  );
}

function DonutChart({ points }: Pick<RhAnalyticsChartProps, 'points'>) {
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const style: CSSProperties = { backgroundImage: getDonutBackground(points) };

  return (
    <div className="rh-chart-donut-layout">
      <div className="rh-chart-donut" style={style} aria-hidden="true">
        <span className="rh-chart-donut__center">
          <strong>{total}</strong>
          <span>casos</span>
        </span>
      </div>
      <ul className="rh-chart-legend" aria-label="Distribuição por grupo">
        {points.map((point, index) => (
          <li key={point.label}>
            <span className="rh-chart-legend__swatch" style={{ backgroundColor: getPointColor(point.label, index) }} />
            <span>{point.label}</span>
            <strong>{point.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LineChart({ points }: Pick<RhAnalyticsChartProps, 'points'>) {
  const width = 640;
  const height = 240;
  const paddingX = 30;
  const paddingY = 24;
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;
  const coordinates = points.map((point, index) => ({
    x: paddingX + (points.length === 1 ? usableWidth / 2 : (index / (points.length - 1)) * usableWidth),
    y: height - paddingY - (point.value / maxValue) * usableHeight,
  }));
  const polyline = coordinates.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div className="rh-chart-line-container">
      <svg
        className="rh-chart-line"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Evolução mensal: ${points.map((point) => `${point.label}: ${point.value}`).join('; ')}`}
      >
        {[0, 1, 2, 3].map((line) => {
          const y = paddingY + (line / 3) * usableHeight;
          return <line key={line} x1={paddingX} x2={width - paddingX} y1={y} y2={y} className="rh-chart-line__grid" />;
        })}
        <polyline points={polyline} className="rh-chart-line__path" />
        {coordinates.map((point, index) => (
          <circle
            key={`${points[index].label}-${index}`}
            cx={point.x}
            cy={point.y}
            r="5"
            className="rh-chart-line__point"
          />
        ))}
      </svg>
      <ol className="rh-chart-line-labels">
        {points.map((point) => (
          <li key={point.label}>
            <span>{point.label}</span>
            <strong>{point.value}</strong>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function RhAnalyticsChart({ title, points, chartType }: RhAnalyticsChartProps) {
  const total = points.reduce((sum, point) => sum + point.value, 0);

  return (
    <section className="rh-panel rh-analytics-panel" aria-labelledby="rh-analytics-heading">
      <header className="rh-panel__header">
        <div>
          <h2 id="rh-analytics-heading">{title}</h2>
          <p>Distribuição calculada a partir dos registros recebidos.</p>
        </div>
      </header>
      {total === 0 ? (
        <div className="rh-state rh-analytics-empty">
          <p>Não há dados suficientes para esta visualização.</p>
        </div>
      ) : chartType === 'donut' ? (
        <DonutChart points={points} />
      ) : chartType === 'line' ? (
        <LineChart points={points} />
      ) : (
        <HorizontalBars points={points} />
      )}
    </section>
  );
}
