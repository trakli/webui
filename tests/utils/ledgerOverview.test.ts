import { describe, expect, it } from 'vitest';
import {
  compareCategories,
  cumulative,
  dailyTotals,
  isoDate,
  noSpendDays,
  periodWindow,
  toBase
} from '~/utils/ledgerOverview';

describe('periodWindow', () => {
  it('compares a month to the same days of the month before', () => {
    const w = periodWindow('month', new Date(2026, 10, 24, 15, 30));
    expect(isoDate(w.start)).toBe('2026-11-01');
    expect(isoDate(w.end)).toBe('2026-11-30');
    expect(isoDate(w.prevStart)).toBe('2026-10-01');
    expect(isoDate(w.prevToday)).toBe('2026-10-24');
    expect(w.elapsedDays).toBe(24);
    expect(w.totalDays).toBe(30);
    expect(w.prevTotalDays).toBe(31);
  });

  it('stops the previous window at the end of a shorter month', () => {
    const w = periodWindow('month', new Date(2026, 2, 31));
    expect(isoDate(w.prevStart)).toBe('2026-02-01');
    expect(isoDate(w.prevToday)).toBe('2026-02-28');
  });

  it('uses calendar quarters and years', () => {
    const q = periodWindow('quarter', new Date(2026, 10, 24));
    expect(isoDate(q.start)).toBe('2026-10-01');
    expect(isoDate(q.prevStart)).toBe('2026-07-01');
    expect(isoDate(q.prevToday)).toBe('2026-08-24');

    const y = periodWindow('year', new Date(2026, 0, 5));
    expect(isoDate(y.prevStart)).toBe('2025-01-01');
    expect(isoDate(y.prevToday)).toBe('2025-01-05');
  });
});

describe('toBase', () => {
  const rates = { XAF: 655.957, USD: 1.0869565217391304 };

  it('divides by the rate quoted against the base currency', () => {
    expect(toBase(655.957, 'XAF', 'EUR', rates)).toBeCloseTo(1, 6);
    expect(toBase(10, 'EUR', 'EUR', rates)).toBe(10);
  });

  it('returns null when no rate is known', () => {
    expect(toBase(10, 'GBP', 'EUR', rates)).toBeNull();
  });
});

describe('daily series', () => {
  it('buckets by day from the window start and accumulates', () => {
    const daily = dailyTotals(
      [
        { date: '2026-11-01', amount: 10 },
        { date: '2026-11-01', amount: 5 },
        { date: '2026-11-03', amount: 7 },
        { date: '2026-10-31', amount: 99 }
      ],
      new Date(2026, 10, 1),
      4
    );
    expect(daily).toEqual([15, 0, 7, 0]);
    expect(cumulative(daily)).toEqual([15, 15, 22, 22]);
  });

  it('counts no-spend days only up to today and finds the longest run', () => {
    expect(noSpendDays([5, 0, 0, 3, 0, 0, 0, 0], 7)).toEqual({
      count: 5,
      longest: 3,
      longestStart: 4
    });
  });
});

describe('compareCategories', () => {
  it('joins both periods and orders by the larger side', () => {
    const rows = compareCategories(
      [
        { name: 'Groceries', amount: 300 },
        { name: 'Eating out', amount: 120 }
      ],
      [
        { name: 'Groceries', amount: 320 },
        { name: 'Shopping', amount: 400 }
      ]
    );
    expect(rows.map((r) => r.name)).toEqual(['Shopping', 'Groceries', 'Eating out']);
    expect(rows[0]).toMatchObject({ amount: 0, prevAmount: 400, delta: -400 });
    expect(rows[1].delta).toBe(-20);
    expect(rows[2]).toMatchObject({ prevAmount: 0, delta: 120 });
  });
});
