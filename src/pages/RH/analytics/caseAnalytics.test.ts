import { describe, expect, it } from 'vitest';
import { getCategoryDistribution, getMonthlyTrend, getStatusDistribution } from './caseAnalytics';
import type { AdminCaseItem } from '../../../types/case';

const makeCase = (overrides: Partial<AdminCaseItem> = {}): AdminCaseItem => ({
  id: 'case-1',
  categoryId: 'fraude',
  category: 'Fraude',
  title: 'Relato',
  description: 'Descrição',
  content: 'Descrição',
  status: 'Recebido',
  priority: null,
  ...overrides,
  assignedUserIds: overrides.assignedUserIds ?? [],
});

describe('case analytics', () => {
  it('counts known statuses and categories from the provided cases', () => {
    const cases = [
      makeCase({ status: 'Recebido', category: 'Fraude' }),
      makeCase({ id: 'case-2', status: 'Resolvido', category: 'Assédio' }),
      makeCase({ id: 'case-3', status: 'Recebido', category: 'Fraude' }),
    ];

    expect(getStatusDistribution(cases).find((item) => item.label === 'Recebido')?.value).toBe(2);
    expect(getCategoryDistribution(cases).find((item) => item.label === 'Fraude')?.value).toBe(2);
  });

  it('builds a chronological monthly trend with zero-count months', () => {
    const trend = getMonthlyTrend([
      makeCase({ createdAt: '2026-01-15T12:00:00.000Z' }),
      makeCase({ id: 'case-2', createdAt: '2026-03-15T12:00:00.000Z' }),
    ]);

    expect(trend).toHaveLength(3);
    expect(trend.map((item) => item.value)).toEqual([1, 0, 1]);
  });

  it('ignores missing or invalid timestamps rather than inventing dates', () => {
    expect(getMonthlyTrend([
      makeCase(),
      makeCase({ id: 'case-2', createdAt: 'invalid' }),
    ])).toEqual([]);
  });
});
