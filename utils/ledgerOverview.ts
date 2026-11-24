export type LedgerPeriod = 'month' | 'quarter' | 'year';

export const LEDGER_PERIODS: LedgerPeriod[] = ['month', 'quarter', 'year'];

export interface PeriodWindow {
  start: Date;
  today: Date;
  end: Date;
  prevStart: Date;
  prevToday: Date;
  prevEnd: Date;
  elapsedDays: number;
  totalDays: number;
  prevTotalDays: number;
}

export interface NamedAmount {
  name: string;
  amount: number;
}

export interface CategoryChange extends NamedAmount {
  prevAmount: number;
  delta: number;
}

export interface NoSpendSummary {
  count: number;
  longest: number;
  longestStart: number;
}

const startOf = (y: number, m: number, d: number) => new Date(y, m, d);

export const addDays = (date: Date, days: number) =>
  startOf(date.getFullYear(), date.getMonth(), date.getDate() + days);

// Counted on calendar dates in UTC so a daylight saving change inside the range
// does not turn a 24 day span into 23.96 days.
export const diffDays = (from: Date, to: Date) =>
  Math.round(
    (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
      Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) /
      86_400_000
  );

export const isoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

export const localDateKey = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value.slice(0, 10) : isoDate(parsed);
};

export function periodWindow(period: LedgerPeriod, now: Date = new Date()): PeriodWindow {
  const y = now.getFullYear();
  const m = now.getMonth();
  const today = startOf(y, m, now.getDate());

  let start: Date;
  let end: Date;
  let prevStart: Date;
  let prevEnd: Date;

  if (period === 'month') {
    start = startOf(y, m, 1);
    end = startOf(y, m + 1, 0);
    prevStart = startOf(y, m - 1, 1);
    prevEnd = startOf(y, m, 0);
  } else if (period === 'quarter') {
    const q = Math.floor(m / 3) * 3;
    start = startOf(y, q, 1);
    end = startOf(y, q + 3, 0);
    prevStart = startOf(y, q - 3, 1);
    prevEnd = startOf(y, q, 0);
  } else {
    start = startOf(y, 0, 1);
    end = startOf(y, 11, 31);
    prevStart = startOf(y - 1, 0, 1);
    prevEnd = startOf(y - 1, 11, 31);
  }

  const elapsedDays = diffDays(start, today) + 1;
  const sameOffset = addDays(prevStart, elapsedDays - 1);

  return {
    start,
    today,
    end,
    prevStart,
    prevToday: sameOffset > prevEnd ? prevEnd : sameOffset,
    prevEnd,
    elapsedDays,
    totalDays: diffDays(start, end) + 1,
    prevTotalDays: diffDays(prevStart, prevEnd) + 1
  };
}

export function toBase(
  value: number,
  currency: string | undefined,
  base: string,
  rates: Record<string, number>
): number | null {
  if (!currency || currency === base) return value;
  const rate = rates[currency];
  return rate ? value / rate : null;
}

export function dailyTotals(
  entries: { date: string; amount: number }[],
  start: Date,
  days: number
): number[] {
  const out = new Array(days).fill(0);
  const startKey = isoDate(start);
  for (const entry of entries) {
    if (entry.date < startKey) continue;
    const index = diffDays(start, new Date(`${entry.date}T00:00:00`));
    if (index >= 0 && index < days) out[index] += entry.amount;
  }
  return out;
}

export function cumulative(values: number[]): number[] {
  let running = 0;
  return values.map((value) => (running += value));
}

export function noSpendDays(daily: number[], elapsed: number): NoSpendSummary {
  let count = 0;
  let longest = 0;
  let longestStart = -1;
  let run = 0;
  for (let i = 0; i < Math.min(elapsed, daily.length); i += 1) {
    if (daily[i] > 0) {
      run = 0;
      continue;
    }
    count += 1;
    run += 1;
    if (run > longest) {
      longest = run;
      longestStart = i - run + 1;
    }
  }
  return { count, longest, longestStart };
}

export function compareCategories(
  current: NamedAmount[],
  previous: NamedAmount[]
): CategoryChange[] {
  const map = new Map<string, CategoryChange>();
  for (const { name, amount } of current) {
    map.set(name, { name, amount, prevAmount: 0, delta: amount });
  }
  for (const { name, amount } of previous) {
    const row = map.get(name) ?? { name, amount: 0, prevAmount: 0, delta: 0 };
    row.prevAmount = amount;
    row.delta = row.amount - amount;
    map.set(name, row);
  }
  return [...map.values()].sort(
    (a, b) => Math.max(b.amount, b.prevAmount) - Math.max(a.amount, a.prevAmount)
  );
}
