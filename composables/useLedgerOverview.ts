import { computed, ref } from 'vue';
import { api } from '~/services/api';
import type { StatsResponse } from '~/services/api/statsApi';
import { useSharedData } from '~/composables/useSharedData';
import { checkAuth } from '~/utils/auth';
import { sweepTransactions } from '~/utils/transactionSweep';
import {
  compareCategories,
  cumulative,
  dailyTotals,
  isoDate,
  localDateKey,
  noSpendDays,
  periodWindow,
  toBase,
  type LedgerPeriod,
  type NamedAmount
} from '~/utils/ledgerOverview';

type StatsData = StatsResponse['data'];

interface ExpenseEntry {
  date: string;
  amount: number;
}

const period = ref<LedgerPeriod>('month');
const stats = ref<StatsData | null>(null);
const prevStats = ref<StatsData | null>(null);
const expenses = ref<ExpenseEntry[]>([]);
const unconverted = ref<string[]>([]);
const statsLoading = ref(false);
const detailLoading = ref(false);
const loadedAt = ref<Date | null>(null);
const truncated = ref(false);

let statsKey = '';
let detailKey = '';
let statsRun = 0;
let detailRun = 0;

const people = (
  rows: { id?: number | string; name: string; amount: number }[] | undefined
): NamedAmount[] => named((rows ?? []).filter((row) => row.id !== 'uncategorized'));

const named = (rows: { name: string; amount: number }[] | undefined): NamedAmount[] =>
  (rows ?? []).map((row) => ({ name: row.name, amount: Number(row.amount) || 0 }));

async function fetchStats(start: Date, end: Date): Promise<StatsData | null> {
  try {
    const response = await api.stats.fetch({ start_date: isoDate(start), end_date: isoDate(end) });
    return response?.data ?? null;
  } catch (error) {
    console.warn('[ledger] stats failed', error);
    return null;
  }
}

async function fetchRates(base: string, currencies: string[]): Promise<Record<string, number>> {
  if (!currencies.length) return {};
  try {
    const response = await useApi()<{
      data?: { rates?: Record<string, number> };
    }>('/exchange-rates', { query: { base, targets: currencies.join(',') } });
    return response?.data?.rates ?? {};
  } catch (error) {
    console.warn('[ledger] exchange rates failed', error);
    return {};
  }
}

export function useLedgerOverview() {
  const shared = useSharedData();
  const base = computed(() => shared.getDefaultCurrency.value || 'USD');
  const span = computed(() => periodWindow(period.value));

  async function loadStats(force = false) {
    if (typeof window === 'undefined' || !checkAuth()) return;
    const w = span.value;
    const key = `${period.value}:${isoDate(w.today)}`;
    if (!force && key === statsKey && stats.value) return;
    statsKey = key;
    const run = ++statsRun;
    statsLoading.value = true;
    const [current, previous] = await Promise.all([
      fetchStats(w.start, w.today),
      fetchStats(w.prevStart, w.prevToday)
    ]);
    if (run !== statsRun) return;
    stats.value = current;
    prevStats.value = previous;
    loadedAt.value = new Date();
    statsLoading.value = false;
  }

  async function loadDetail(force = false) {
    if (typeof window === 'undefined' || !checkAuth()) return;
    const w = span.value;
    const key = `${period.value}:${isoDate(w.today)}:${base.value}`;
    if (!force && key === detailKey && expenses.value.length) return;
    detailKey = key;
    const run = ++detailRun;
    detailLoading.value = true;
    try {
      const { rows, truncated: cut } = await sweepTransactions({
        type: 'expense',
        exclude_transfers: true,
        date_from: isoDate(w.prevStart),
        date_to: isoDate(w.today)
      });
      const currencies = [
        ...new Set(
          rows
            .map((row) => row?.wallet?.currency as string | undefined)
            .filter((c): c is string => !!c && c !== base.value)
        )
      ];
      const rates = await fetchRates(base.value, currencies);
      if (run !== detailRun) return;

      const missing = new Set<string>();
      const entries: ExpenseEntry[] = [];
      for (const row of rows) {
        const currency = row?.wallet?.currency as string | undefined;
        const value = toBase(Number(row?.amount) || 0, currency, base.value, rates);
        if (value === null) {
          if (currency) missing.add(currency);
          continue;
        }
        entries.push({ date: localDateKey(row.datetime || row.created_at || ''), amount: value });
      }
      expenses.value = entries;
      unconverted.value = [...missing];
      truncated.value = cut;
    } catch (error) {
      if (run === detailRun) console.warn('[ledger] expense sweep failed', error);
    } finally {
      if (run === detailRun) detailLoading.value = false;
    }
  }

  function setPeriod(next: LedgerPeriod) {
    if (next === period.value) return;
    period.value = next;
    loadStats();
    loadDetail();
  }

  const kpis = computed(() => {
    const o = stats.value?.overview;
    const p = prevStats.value?.overview;
    const income = o?.total_income ?? 0;
    const expense = o?.total_expenses ?? 0;
    const kept = income - expense;
    return {
      income,
      expense,
      kept,
      savingsRate: income > 0 ? kept / income : null,
      netWorth: o?.net_worth ?? o?.total_balance ?? 0,
      prevExpense: p?.total_expenses ?? null,
      expenseChange: p ? expense - (p.total_expenses ?? 0) : null
    };
  });

  const categories = computed(() =>
    compareCategories(
      named(stats.value?.charts?.category_spending),
      named(prevStats.value?.charts?.category_spending)
    )
  );

  const spending = computed(() =>
    named(stats.value?.charts?.category_spending).sort((a, b) => b.amount - a.amount)
  );

  const incomeSources = computed(() =>
    named(stats.value?.charts?.income_sources).sort((a, b) => b.amount - a.amount)
  );

  const payers = computed(() =>
    people(stats.value?.charts?.party_income).sort((a, b) => b.amount - a.amount)
  );

  const payees = computed(() =>
    people(stats.value?.charts?.party_spending).sort((a, b) => b.amount - a.amount)
  );

  const daily = computed(() => dailyTotals(expenses.value, span.value.start, span.value.totalDays));

  const prevDaily = computed(() =>
    dailyTotals(expenses.value, span.value.prevStart, span.value.prevTotalDays)
  );

  const spentSoFar = computed(() => cumulative(daily.value).slice(0, span.value.elapsedDays));

  const prevSpent = computed(() => cumulative(prevDaily.value));

  const noSpend = computed(() => noSpendDays(daily.value, span.value.elapsedDays));

  return {
    period,
    span,
    base,
    stats,
    statsLoading,
    detailLoading,
    loadedAt,
    unconverted,
    truncated,
    kpis,
    categories,
    spending,
    incomeSources,
    payers,
    payees,
    daily,
    spentSoFar,
    prevSpent,
    noSpend,
    loadStats,
    loadDetail,
    setPeriod
  };
}
