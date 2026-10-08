import {
  CASE_CATEGORIES,
  CASE_STATUSES,
  type AdminCaseItem,
  type CaseCategory,
  type CaseStatus,
} from '../../../types/case';

export type CaseAnalyticsDimension = 'status' | 'category' | 'monthly';
export type CaseChartType = 'bar' | 'donut' | 'line';

export interface AnalyticsPoint {
  label: string;
  value: number;
}

const formatMonth = (date: Date): string => new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: '2-digit',
  timeZone: 'UTC',
}).format(date);

export const getStatusDistribution = (cases: readonly AdminCaseItem[]): AnalyticsPoint[] => {
  const counts = new Map<CaseStatus, number>(CASE_STATUSES.map((status) => [status, 0]));

  for (const item of cases) {
    counts.set(item.status, (counts.get(item.status) ?? 0) + 1);
  }

  return CASE_STATUSES.map((status) => ({ label: status, value: counts.get(status) ?? 0 }));
};

export const getStatusCount = (
  distribution: readonly AnalyticsPoint[],
  statuses: readonly CaseStatus[]
): number => {
  const counts = new Map(distribution.map((point) => [point.label, point.value]));
  return statuses.reduce((total, status) => total + (counts.get(status) ?? 0), 0);
};

export const getCategoryDistribution = (cases: readonly AdminCaseItem[]): AnalyticsPoint[] => {
  const counts = new Map<CaseCategory, number>(CASE_CATEGORIES.map((category) => [category, 0]));

  for (const item of cases) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }

  return CASE_CATEGORIES.map((category) => ({ label: category, value: counts.get(category) ?? 0 }));
};

export const getMonthlyTrend = (cases: readonly AdminCaseItem[]): AnalyticsPoint[] => {
  const monthCounts = new Map<string, number>();

  for (const item of cases) {
    if (!item.createdAt) continue;
    const date = new Date(item.createdAt);
    if (Number.isNaN(date.getTime())) continue;

    const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    monthCounts.set(monthKey, (monthCounts.get(monthKey) ?? 0) + 1);
  }

  const months = [...monthCounts.keys()].sort();
  if (months.length === 0) return [];

  const latestMonth = months[months.length - 1];
  const [endYear, endMonth] = latestMonth.split('-').map(Number);
  const earliestDate = new Date(Date.UTC(endYear, endMonth - 1 - 11, 1));
  const firstObservedDate = new Date(`${months[0]}-01T00:00:00.000Z`);
  const startDate = firstObservedDate > earliestDate ? firstObservedDate : earliestDate;
  const startYear = startDate.getUTCFullYear();
  const startMonth = startDate.getUTCMonth() + 1;
  const result: AnalyticsPoint[] = [];

  for (let year = startYear; year <= endYear; year += 1) {
    const firstMonth = year === startYear ? startMonth : 1;
    const lastMonth = year === endYear ? endMonth : 12;
    for (let month = firstMonth; month <= lastMonth; month += 1) {
      const key = `${year}-${String(month).padStart(2, '0')}`;
      result.push({
        label: formatMonth(new Date(Date.UTC(year, month - 1, 1))),
        value: monthCounts.get(key) ?? 0,
      });
    }
  }

  return result;
};
