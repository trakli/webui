import { describe, it, expect } from 'vitest';
import { buildSpotlightInsights } from '@/utils/landingInsights';
import type { WalletStatistics } from '@/composables/useStatistics';

const money = (n: number) => `$${n.toFixed(2)}`;

const fullStats = {
  total_expenses: 1240,
  total_income: 1800,
  transaction_count: 24,
  income_insights: {
    biggest_source: { party: 'Acme Corp', amount: 1500, percentage: 80, transaction_count: 2 }
  },
  expense_insights: {
    biggest_category: { category: 'Food', amount: 400, percentage: 32, transaction_count: 9 },
    biggest_expense: { party: 'Grocers', amount: 320, percentage: 26, transaction_count: 5 },
    budget_analysis: { expense_ratio: 0.69, savings_rate: 0.24, risk_level: 'low' }
  },
  performance: { growth_percentage: 12, velocity: 0, efficiency: 0.24, consistency: 0 }
} as unknown as WalletStatistics;

describe('buildSpotlightInsights', () => {
  it('returns an empty array for null stats', () => {
    expect(buildSpotlightInsights(null, money)).toEqual([]);
  });

  it('builds varied, non-empty lines from real stats', () => {
    const out = buildSpotlightInsights(fullStats, money);
    expect(out.length).toBeGreaterThanOrEqual(4);
    // Every line carries a display key and a click-through prompt.
    for (const item of out) {
      expect(item.key).toBeTruthy();
      expect(item.prompt).toBeTruthy();
    }
    // Lines are distinct.
    const keys = out.map((i) => i.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('interpolates the savings rate and biggest category with rounded params', () => {
    const out = buildSpotlightInsights(fullStats, money);
    const savings = out.find((i) => i.key.includes('saved'));
    expect(savings?.params).toMatchObject({ rate: 24 });

    const category = out.find((i) => i.key.startsWith('{category}'));
    expect(category?.params).toMatchObject({ category: 'Food', percent: 32 });
    expect(category?.promptParams).toMatchObject({ category: 'Food' });
  });

  it('picks the up-phrasing for positive income growth and down for negative', () => {
    const up = buildSpotlightInsights(fullStats, money).find((i) => i.key.includes('income is'));
    expect(up?.key).toContain('up');

    const down = buildSpotlightInsights(
      { ...fullStats, performance: { ...fullStats.performance, growth_percentage: -8 } },
      money
    ).find((i) => i.key.includes('income is'));
    expect(down?.key).toContain('down');
    expect(down?.params).toMatchObject({ percent: 8 });
  });

  it('omits lines that have no meaningful data', () => {
    const sparse = {
      total_expenses: 0,
      total_income: 0,
      transaction_count: 0,
      income_insights: { biggest_source: null },
      expense_insights: {
        biggest_category: null,
        biggest_expense: null,
        budget_analysis: { expense_ratio: 0, savings_rate: 0, risk_level: 'low' }
      },
      performance: { growth_percentage: 0, velocity: 0, efficiency: 0, consistency: 0 }
    } as unknown as WalletStatistics;
    expect(buildSpotlightInsights(sparse, money)).toEqual([]);
  });
});
