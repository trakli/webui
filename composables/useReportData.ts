import { ref, computed, watch } from 'vue';
import { api } from '~/services/api';
import { useSharedData } from '~/composables/useSharedData';
import { transactionMapper } from '~/utils/transactionMapper';
import { parseAmount } from '@/utils/currency';
import { checkAuth } from '~/utils/auth';
import type { FrontendTransaction } from '~/types/transaction';
import type { StatsResponse } from '~/services/api/statsApi';

export type ReportPeriodValue = 'mtd' | 'last_3m' | 'last_12m' | 'ytd' | 'all_time' | 'custom';

export interface ReportPeriod {
  label: string;
  value: ReportPeriodValue;
}

export const REPORT_PERIODS: ReportPeriod[] = [
  { label: 'This Month', value: 'mtd' },
  { label: 'Last 3 Months', value: 'last_3m' },
  { label: 'Last 12 Months', value: 'last_12m' },
  { label: 'Year to Date', value: 'ytd' },
  { label: 'All time', value: 'all_time' }
];

export interface CategoryBucket {
  name: string;
  amount: number;
  count: number;
  percentage: number;
  prevAmount: number;
  delta: number;
  trend: number[];
  color: string;
}

export interface PartyBucket {
  name: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface DailyBucket {
  date: string;
  income: number;
  expense: number;
  net: number;
  txCount: number;
}

export interface MonthlyBucket {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface ReportTotals {
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
  expenseRatio: number;
  prevIncome: number;
  prevExpense: number;
  prevNet: number;
  prevSavingsRate: number;
  incomeDelta: number;
  expenseDelta: number;
  netDelta: number;
  savingsRateDelta: number;
  runwayMonths: number;
  daysInPeriod: number;
}

export interface NotableEvents {
  biggestExpense: {
    amount: number;
    party: string;
    category: string;
    date: string;
  } | null;
  biggestCategorySwing: {
    name: string;
    fromAmount: number;
    toAmount: number;
    deltaPct: number;
  } | null;
  firstTimePayees: { count: number; names: string[] };
  longestNoSpendStreak: { days: number; startDate: string | null; endDate: string | null };
}

export interface MonthInReviewData {
  monthLabel: string;
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
  topCategory: { name: string; amount: number } | null;
  topPayee: { name: string; amount: number } | null;
  biggestExpense: NotableEvents['biggestExpense'];
  transactionCount: number;
  daysInMonth: number;
}

interface DateRange {
  start: Date;
  end: Date;
}

// Module-scoped reactive state (shared across calls)
const selectedPeriod = ref<ReportPeriodValue>('last_3m');
const customRange = ref<{ start: string; end: string } | null>(null);
const compareEnabled = ref(true);
const apiStats = ref<StatsResponse['data'] | null>(null);
const apiStatsPrev = ref<StatsResponse['data'] | null>(null);
const periodTransactions = ref<FrontendTransaction[]>([]);
const trailing12Transactions = ref<FrontendTransaction[]>([]);
// Starts true: the immediate watcher always kicks off a reload, so the first
// paint should show loading rather than briefly flashing the empty state.
const isLoading = ref(true);
const error = ref<string | null>(null);
const sweepTruncated = ref(false);

const PALETTE_EXPENSE = [
  '#e11d48',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#64748b'
];
const PALETTE_INCOME = [
  '#16a34a',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#84cc16',
  '#ec4899',
  '#64748b',
  '#0ea5e9'
];

const toISODate = (d: Date): string => d.toISOString().slice(0, 10);

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

const getRange = (period: ReportPeriodValue, custom: typeof customRange.value): DateRange => {
  const now = new Date();
  const end = endOfDay(now);
  let start: Date;
  switch (period) {
    case 'mtd':
      start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      break;
    case 'last_3m':
      start = startOfDay(new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()));
      break;
    case 'last_12m':
      start = startOfDay(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()));
      break;
    case 'ytd':
      start = startOfDay(new Date(now.getFullYear(), 0, 1));
      break;
    case 'all_time':
      start = startOfDay(new Date(2000, 0, 1));
      break;
    case 'custom':
      if (custom?.start && custom?.end) {
        return {
          start: startOfDay(new Date(custom.start + 'T00:00:00')),
          end: endOfDay(new Date(custom.end + 'T00:00:00'))
        };
      }
      start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      break;
    default:
      start = startOfDay(new Date(2000, 0, 1));
  }
  return { start, end };
};

const previousRange = (r: DateRange): DateRange => {
  const ms = r.end.getTime() - r.start.getTime();
  return {
    start: new Date(r.start.getTime() - ms - 1),
    end: new Date(r.start.getTime() - 1)
  };
};

// Fetch ALL transactions for a given range (no UI pagination). Walks pages until exhausted.
async function fetchAllTransactionsInRange(
  start: Date,
  end: Date,
  lookups: {
    parties: readonly any[];
    categories: readonly any[];
    wallets: readonly any[];
    groups: readonly any[];
  }
): Promise<FrontendTransaction[]> {
  const limit = 200;
  // Hard cap so we never spin forever; reports degrade gracefully past this.
  const maxPages = 30;
  // Fetch a bounded number of pages at once so a heavy account doesn't pay one
  // serial round-trip per page before the report can render.
  const concurrency = 6;

  const fetchPage = (page: number) =>
    api.transactions.fetchAll({
      page,
      limit,
      date_from: toISODate(start),
      date_to: toISODate(end)
    });

  const first = await fetchPage(1);
  const lastPage = Math.max(1, first.last_page || 1);
  const targetPages = Math.min(lastPage, maxPages);

  // Index pages by (page - 1) so the final concat preserves server order
  // regardless of which request resolves first.
  const pages: any[][] = new Array(targetPages);
  pages[0] = first.data || [];

  if (targetPages > 1) {
    const queue: number[] = [];
    for (let p = 2; p <= targetPages; p++) queue.push(p);

    let cursor = 0;
    const worker = async () => {
      while (cursor < queue.length) {
        const p = queue[cursor++];
        const resp = await fetchPage(p);
        pages[p - 1] = resp.data || [];
      }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, () => worker()));
  }

  const out: FrontendTransaction[] = [];
  for (const data of pages) {
    if (!data) continue;
    for (const t of data) {
      out.push(
        transactionMapper.toFrontend(
          t,
          lookups.parties as any[],
          lookups.categories as any[],
          lookups.wallets as any[],
          lookups.groups as any[]
        )
      );
    }
  }

  if (lastPage > maxPages) {
    sweepTruncated.value = true;
    console.warn(
      `[reports] transaction sweep truncated at ${maxPages} pages (${out.length} rows); some data omitted`
    );
  }

  return out;
}

// Fetch /stats for a given range
async function fetchStatsForRange(start: Date, end: Date): Promise<StatsResponse['data'] | null> {
  try {
    const resp = await api.stats.fetch({
      start_date: toISODate(start),
      end_date: toISODate(end)
    });
    return resp?.data || null;
  } catch (e) {
    console.warn('[reports] /stats failed:', e);
    return null;
  }
}

let lastReloadId = 0;

async function reload(lookups: {
  parties: readonly any[];
  categories: readonly any[];
  wallets: readonly any[];
  groups: readonly any[];
}): Promise<void> {
  if (typeof window === 'undefined' || !checkAuth()) return;
  const id = ++lastReloadId;
  isLoading.value = true;
  error.value = null;
  sweepTruncated.value = false;

  const cur = getRange(selectedPeriod.value, customRange.value);
  const prev = previousRange(cur);
  const trailingStart = startOfDay(new Date(cur.end.getFullYear(), cur.end.getMonth() - 5, 1));

  // Load stats first so the stats-driven tabs render without waiting for the
  // transaction sweeps below.
  try {
    const [statsResp, prevStatsResp] = await Promise.all([
      fetchStatsForRange(cur.start, cur.end),
      fetchStatsForRange(prev.start, prev.end)
    ]);
    if (id !== lastReloadId) return;
    apiStats.value = statsResp;
    apiStatsPrev.value = prevStatsResp;
  } catch (e) {
    if (id !== lastReloadId) return;
    console.error('[reports] stats reload failed', e);
    error.value = e instanceof Error ? e.message : 'Failed to load reports';
  } finally {
    if (id === lastReloadId) isLoading.value = false;
  }

  // Raw transactions only feed daily granularity (calendar, trends, month
  // review, CSV). When the period already spans the trailing six months, reuse
  // that fetch as the trailing data instead of running a second sweep.
  try {
    const periodCoversTrailing = cur.start.getTime() <= trailingStart.getTime();
    const [periodTxs, trailingTxs] = await Promise.all([
      fetchAllTransactionsInRange(cur.start, cur.end, lookups),
      periodCoversTrailing
        ? Promise.resolve(null)
        : fetchAllTransactionsInRange(trailingStart, cur.end, lookups)
    ]);
    if (id !== lastReloadId) return;
    periodTransactions.value = periodTxs;
    trailing12Transactions.value = trailingTxs ?? periodTxs;
  } catch (e) {
    if (id !== lastReloadId) return;
    console.error('[reports] transaction detail reload failed', e);
  }
}

export const useReportData = () => {
  const sharedData = useSharedData();
  const { getDefaultCurrency } = sharedData;
  const { locale } = useI18n();

  const getLookups = () => ({
    parties: sharedData.parties.value,
    categories: sharedData.categories.value,
    wallets: sharedData.wallets.value,
    groups: sharedData.groups.value
  });

  const range = computed(() => getRange(selectedPeriod.value, customRange.value));
  const prevRange = computed(() => previousRange(range.value));

  const totals = computed<ReportTotals>(() => {
    const s = apiStats.value;
    const days = Math.max(
      1,
      Math.round((range.value.end.getTime() - range.value.start.getTime()) / (1000 * 60 * 60 * 24))
    );

    if (!s) {
      return blankTotals(days);
    }

    const income = s.overview.total_income || 0;
    const expense = s.overview.total_expenses || 0;
    const net = income - expense;
    const savingsRate = income > 0 ? net / income : 0;
    const prevPct = s.comparisons?.previous_period;

    const incomeDelta = Math.round((prevPct?.income_change_percent ?? 0) * 10) / 10;
    const expenseDelta = Math.round((prevPct?.expense_change_percent ?? 0) * 10) / 10;

    // Derive prev absolute values from the deltas. A -100% delta means current is 0
    // and prev was some non-zero value the API doesn't return; mark as unknown (0).
    const recoverPrev = (cur: number, deltaPct: number) => {
      if (deltaPct === 0) return cur;
      const divisor = 1 + deltaPct / 100;
      if (divisor === 0) return 0;
      return cur / divisor;
    };
    const prevIncome = recoverPrev(income, incomeDelta);
    const prevExpense = recoverPrev(expense, expenseDelta);
    const prevNet = prevIncome - prevExpense;
    const prevSavingsRate = prevIncome > 0 ? prevNet / prevIncome : 0;

    const netDelta =
      prevNet === 0
        ? net !== 0
          ? 100
          : 0
        : Math.round(((net - prevNet) / Math.abs(prevNet)) * 1000) / 10;
    const savingsRateDelta = Math.round((savingsRate - prevSavingsRate) * 1000) / 10;

    const months = Math.max(1, days / 30);
    const avgMonthlyExp = expense / months;
    const primaryCur = getDefaultCurrency.value || 'USD';
    const totalBalance = sharedData.wallets.value.reduce(
      (sum, w) => (w?.currency === primaryCur ? sum + (Number(w.balance) || 0) : sum),
      0
    );
    const runwayMonths = avgMonthlyExp > 0 && totalBalance > 0 ? totalBalance / avgMonthlyExp : 0;

    return {
      income,
      expense,
      net,
      savingsRate,
      expenseRatio: income > 0 ? expense / income : 0,
      prevIncome,
      prevExpense,
      prevNet,
      prevSavingsRate,
      incomeDelta,
      expenseDelta,
      netDelta,
      savingsRateDelta,
      runwayMonths,
      daysInPeriod: days
    };
  });

  const monthlyBuckets = computed<MonthlyBucket[]>(() => {
    const trend = apiStats.value?.charts?.monthly_cash_flow || [];
    return trend.map((m) => ({
      month: m.period,
      income: m.income,
      expense: m.expense,
      net: m.net
    }));
  });

  // Trailing 6 months always, regardless of selected period — used for hero sparklines
  const trailing6MonthBuckets = computed<MonthlyBucket[]>(() => {
    const now = new Date();
    const map = new Map<string, MonthlyBucket>();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, { month: key, income: 0, expense: 0, net: 0 });
    }
    trailing12Transactions.value.forEach((t) => {
      if (t.isTransfer) return;
      const key = t.date.slice(0, 7);
      const b = map.get(key);
      if (!b) return;
      const amt = parseAmount(t.amount).value;
      if (t.type === 'INCOME') b.income += amt;
      else b.expense += amt;
      b.net = b.income - b.expense;
    });
    return Array.from(map.values());
  });

  // Daily buckets are NOT in the API yet; derived from the period transactions fetch
  const dailyBuckets = computed<DailyBucket[]>(() => {
    const map = new Map<string, DailyBucket>();
    const { start, end } = range.value;
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = toISODate(cursor);
      map.set(key, { date: key, income: 0, expense: 0, net: 0, txCount: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    periodTransactions.value.forEach((t) => {
      if (t.isTransfer) return;
      const b = map.get(t.date);
      if (!b) return;
      const amt = parseAmount(t.amount).value;
      if (t.type === 'INCOME') b.income += amt;
      else b.expense += amt;
      b.net = b.income - b.expense;
      b.txCount += 1;
    });
    return Array.from(map.values());
  });

  // Per-category 6-month trend (API doesn't provide per-cat history). Built in a
  // single pass over the trailing transactions and indexed by category, so the
  // per-category lookups below stay O(1) instead of rescanning every transaction.
  const trendIndex = computed(() => {
    const months = trailing6MonthBuckets.value.map((m) => m.month);
    const monthIdx = new Map(months.map((m, i) => [m, i]));
    const income = new Map<string, number[]>();
    const expense = new Map<string, number[]>();
    trailing12Transactions.value.forEach((t) => {
      if (t.isTransfer) return;
      const mi = monthIdx.get(t.date.slice(0, 7));
      if (mi === undefined) return;
      const bucket = t.type === 'INCOME' ? income : t.type === 'EXPENSE' ? expense : null;
      if (!bucket) return;
      const name = t.category || 'Uncategorized';
      let series = bucket.get(name);
      if (!series) {
        series = new Array(months.length).fill(0);
        bucket.set(name, series);
      }
      series[mi] += parseAmount(t.amount).value;
    });
    return { months, income, expense };
  });

  const trendFor = (categoryName: string, type: 'INCOME' | 'EXPENSE'): number[] => {
    const idx = trendIndex.value;
    const series = (type === 'INCOME' ? idx.income : idx.expense).get(categoryName);
    return series ? series.slice() : idx.months.map(() => 0);
  };

  const expenseCategories = computed<CategoryBucket[]>(() => {
    const cats = apiStats.value?.charts?.category_spending || [];
    const prevCats = apiStatsPrev.value?.charts?.category_spending || [];
    const totalExp = totals.value.expense || 1;
    const prevMap = new Map(prevCats.map((c) => [c.name, c.amount]));
    return cats.map((c, i) => {
      const prevAmount = prevMap.get(c.name) || 0;
      const delta =
        prevAmount === 0
          ? c.amount > 0
            ? 100
            : 0
          : Math.round(((c.amount - prevAmount) / prevAmount) * 1000) / 10;
      return {
        name: c.name,
        amount: c.amount,
        count: c.transaction_count || 0,
        percentage: (c.amount / totalExp) * 100,
        prevAmount,
        delta,
        trend: trendFor(c.name, 'EXPENSE'),
        color: PALETTE_EXPENSE[i % PALETTE_EXPENSE.length]
      };
    });
  });

  const incomeCategories = computed<CategoryBucket[]>(() => {
    const cats = apiStats.value?.charts?.income_sources || [];
    const prevCats = apiStatsPrev.value?.charts?.income_sources || [];
    const totalInc = totals.value.income || 1;
    const prevMap = new Map(prevCats.map((c) => [c.name, c.amount]));
    return cats.map((c, i) => {
      const prevAmount = prevMap.get(c.name) || 0;
      const delta =
        prevAmount === 0
          ? c.amount > 0
            ? 100
            : 0
          : Math.round(((c.amount - prevAmount) / prevAmount) * 1000) / 10;
      return {
        name: c.name,
        amount: c.amount,
        count: c.transaction_count || 0,
        percentage: (c.amount / totalInc) * 100,
        prevAmount,
        delta,
        trend: trendFor(c.name, 'INCOME'),
        color: PALETTE_INCOME[i % PALETTE_INCOME.length]
      };
    });
  });

  const expenseParties = computed<PartyBucket[]>(() => {
    const total = totals.value.expense || 1;
    return (apiStats.value?.charts?.party_spending || []).map((p) => ({
      name: p.name,
      amount: p.amount,
      count: p.transaction_count || 0,
      percentage: (p.amount / total) * 100
    }));
  });

  const incomeParties = computed<PartyBucket[]>(() => {
    const total = totals.value.income || 1;
    return (apiStats.value?.charts?.party_income || []).map((p) => ({
      name: p.name,
      amount: p.amount,
      count: p.transaction_count || 0,
      percentage: (p.amount / total) * 100
    }));
  });

  // Notable events - client-side from full period fetch (no backend endpoint yet)
  const notable = computed<NotableEvents>(() => {
    // Biggest expense: prefer the API's largest_transactions.expense, fall back to local scan
    const apiBiggest = apiStats.value?.largest_transactions?.expense;
    let biggestExpense: NotableEvents['biggestExpense'] = apiBiggest
      ? {
          amount: apiBiggest.amount,
          party: '',
          category: apiBiggest.category,
          date: apiBiggest.date
        }
      : null;

    if (!biggestExpense) {
      const local = periodTransactions.value
        .filter((t) => t.type === 'EXPENSE' && !t.isTransfer)
        .map((t) => ({ tx: t, amt: parseAmount(t.amount).value }))
        .sort((a, b) => b.amt - a.amt)[0];
      if (local) {
        biggestExpense = {
          amount: local.amt,
          party: local.tx.party,
          category: local.tx.category,
          date: local.tx.date
        };
      }
    }

    // Hydrate biggest expense's party from local tx if missing
    if (biggestExpense && !biggestExpense.party) {
      const match = periodTransactions.value.find(
        (t) =>
          t.date === biggestExpense!.date && parseAmount(t.amount).value === biggestExpense!.amount
      );
      if (match) biggestExpense.party = match.party;
    }

    // Category swing: compare current vs prior categories
    const curCat = new Map<string, number>();
    const prevCat = new Map<string, number>();
    (apiStats.value?.charts?.category_spending || []).forEach((c) => curCat.set(c.name, c.amount));
    (apiStatsPrev.value?.charts?.category_spending || []).forEach((c) =>
      prevCat.set(c.name, c.amount)
    );
    let biggestSwing: NotableEvents['biggestCategorySwing'] = null;
    let maxAbs = 0;
    curCat.forEach((amount, name) => {
      const prevAmt = prevCat.get(name) || 0;
      if (prevAmt < 10 && amount < 10) return;
      const delta =
        prevAmt === 0
          ? amount > 0
            ? 100
            : 0
          : Math.round(((amount - prevAmt) / Math.abs(prevAmt)) * 1000) / 10;
      if (Math.abs(delta) > Math.abs(maxAbs)) {
        maxAbs = delta;
        biggestSwing = { name, fromAmount: prevAmt, toAmount: amount, deltaPct: delta };
      }
    });

    // First-time payees: compare period payees vs prior-period payees from the
    // previous-period stats (party charts), avoiding a second raw-transaction fetch.
    const prevPayees = new Set([
      ...(apiStatsPrev.value?.charts?.party_spending || []).map((p) => p.name),
      ...(apiStatsPrev.value?.charts?.party_income || []).map((p) => p.name)
    ]);
    const firstTimers = Array.from(
      new Set(periodTransactions.value.filter((t) => !prevPayees.has(t.party)).map((t) => t.party))
    );

    // No-spend streak: scan daily buckets
    let longest = 0;
    let current = 0;
    let longestStart: string | null = null;
    let longestEnd: string | null = null;
    let currentStart: string | null = null;
    dailyBuckets.value.forEach((b) => {
      if (b.expense === 0) {
        if (current === 0) currentStart = b.date;
        current += 1;
        if (current > longest) {
          longest = current;
          longestStart = currentStart;
          longestEnd = b.date;
        }
      } else {
        current = 0;
        currentStart = null;
      }
    });

    return {
      biggestExpense,
      biggestCategorySwing: biggestSwing,
      firstTimePayees: { count: firstTimers.length, names: firstTimers.slice(0, 5) },
      longestNoSpendStreak: { days: longest, startDate: longestStart, endDate: longestEnd }
    };
  });

  const sankeyFlow = computed(() => {
    const sources = incomeParties.value.slice(0, 6).map((p) => ({
      name: p.name,
      amount: p.amount
    }));
    const sinks = expenseCategories.value.slice(0, 8).map((c) => ({
      name: c.name,
      amount: c.amount,
      color: c.color
    }));
    const savings = Math.max(0, totals.value.net);
    return {
      sources,
      sinks,
      savings,
      totalIn: totals.value.income,
      totalOut: totals.value.expense
    };
  });

  const monthInReview = (offsetMonths = 0) => {
    return computed<MonthInReviewData | null>(() => {
      const now = new Date();
      const target = new Date(now.getFullYear(), now.getMonth() - offsetMonths, 1);
      const monthEndDate = new Date(target.getFullYear(), target.getMonth() + 1, 0);
      const monthKey = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`;
      const m = monthlyBuckets.value.find((x) => x.month === monthKey);
      if (!m || (m.income === 0 && m.expense === 0)) return null;

      const targetIso = (d: Date) => toISODate(d);
      const inMonth = periodTransactions.value.filter(
        (t) => !t.isTransfer && t.date >= targetIso(target) && t.date <= targetIso(monthEndDate)
      );

      const catMap = new Map<string, number>();
      const payeeMap = new Map<string, number>();
      let biggest: NotableEvents['biggestExpense'] = null;
      let biggestAmt = 0;
      inMonth.forEach((t) => {
        if (t.type !== 'EXPENSE') return;
        const a = parseAmount(t.amount).value;
        catMap.set(t.category, (catMap.get(t.category) || 0) + a);
        payeeMap.set(t.party, (payeeMap.get(t.party) || 0) + a);
        if (a > biggestAmt) {
          biggestAmt = a;
          biggest = { amount: a, party: t.party, category: t.category, date: t.date };
        }
      });

      const topCategory = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1])[0];
      const topPayee = Array.from(payeeMap.entries()).sort((a, b) => b[1] - a[1])[0];

      return {
        monthLabel: target.toLocaleString(locale.value, { month: 'long', year: 'numeric' }),
        income: m.income,
        expense: m.expense,
        net: m.net,
        savingsRate: m.income > 0 ? m.net / m.income : 0,
        topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
        topPayee: topPayee ? { name: topPayee[0], amount: topPayee[1] } : null,
        biggestExpense: biggest,
        transactionCount: inMonth.length,
        daysInMonth: monthEndDate.getDate()
      };
    });
  };

  // Expose period transactions for CSV export (full period, not paginated)
  const txsCurrent = computed(() => periodTransactions.value);

  const primaryCurrency = computed(() => getDefaultCurrency.value || 'USD');

  // The backend excludes amounts it can't convert (no exchange rate for that
  // currency) and flags the response partial. Surface it so party/category
  // figures aren't silently understated.
  const statsPartial = computed(() => apiStats.value?.partial === true);
  const unconvertedCurrencies = computed(() => apiStats.value?.unconverted_currencies || []);

  const setPeriod = (p: ReportPeriodValue) => {
    selectedPeriod.value = p;
    if (p !== 'custom') customRange.value = null;
  };

  const setCustomRange = (start: string, end: string) => {
    customRange.value = { start, end };
    selectedPeriod.value = 'custom';
  };

  const toggleCompare = () => {
    compareEnabled.value = !compareEnabled.value;
  };

  // Trigger reload on period change OR when shared lookups become available
  watch(
    [selectedPeriod, customRange, sharedData.parties, sharedData.wallets, sharedData.categories],
    async () => {
      // Make sure shared lookups are loaded (parties/wallets/etc.) before fetching
      if (sharedData.parties.value.length === 0 || sharedData.wallets.value.length === 0) {
        await sharedData.loadAllData();
      }
      reload(getLookups());
    },
    { immediate: true, deep: true }
  );

  return {
    selectedPeriod,
    customRange,
    compareEnabled,
    isLoading,
    error,
    sweepTruncated,
    statsPartial,
    unconvertedCurrencies,
    periods: REPORT_PERIODS,
    range,
    prevRange,
    txsCurrent,
    totals,
    dailyBuckets,
    monthlyBuckets,
    trailing6MonthBuckets,
    expenseCategories,
    incomeCategories,
    expenseParties,
    incomeParties,
    notable,
    sankeyFlow,
    primaryCurrency,
    monthInReview,
    setPeriod,
    setCustomRange,
    toggleCompare,
    refresh: () => reload(getLookups())
  };
};

function blankTotals(days: number): ReportTotals {
  return {
    income: 0,
    expense: 0,
    net: 0,
    savingsRate: 0,
    expenseRatio: 0,
    prevIncome: 0,
    prevExpense: 0,
    prevNet: 0,
    prevSavingsRate: 0,
    incomeDelta: 0,
    expenseDelta: 0,
    netDelta: 0,
    savingsRateDelta: 0,
    runwayMonths: 0,
    daysInPeriod: days
  };
}
