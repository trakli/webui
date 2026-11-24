import { computed, ref } from 'vue';
import type { FrontendTransaction } from '~/types/transaction';
import { useSharedData } from '~/composables/useSharedData';
import { checkAuth } from '~/utils/auth';
import { parseAmount } from '~/utils/currency';
import { transactionMapper } from '~/utils/transactionMapper';
import { sweepTransactions } from '~/utils/transactionSweep';
import { isoDate } from '~/utils/ledgerOverview';

export type LedgerFlow = 'all' | 'out' | 'in';

export interface LedgerRow extends FrontendTransaction {
  value: number;
  signed: number;
  currency: string;
  balanceAfter: number | null;
}

const walletId = ref<number | null>(null);
const monthOffset = ref(0);
const flow = ref<LedgerFlow>('all');
const search = ref('');
const entries = ref<LedgerRow[]>([]);
const loading = ref(false);
const truncated = ref(false);
const selectedId = ref<string | null>(null);

let run = 0;

const sortKey = (row: FrontendTransaction) => `${row.date}T${row.time || '00:00'}#${row.id.padStart(10, '0')}`;

export function useLedgerEntries() {
  const shared = useSharedData();

  const month = computed(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + monthOffset.value, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    return { start, end, isCurrent: monthOffset.value === 0 };
  });

  const wallet = computed(() =>
    walletId.value === null
      ? null
      : (shared.wallets.value ?? []).find((w: any) => w.id === walletId.value) ?? null
  );

  async function load() {
    if (typeof window === 'undefined' || !checkAuth()) return;
    const id = ++run;
    loading.value = true;
    try {
      if (!shared.wallets.value.length || !shared.categories.value.length) {
        await shared.loadAllData();
      }
      const scoped = walletId.value !== null;
      const today = new Date();
      const { rows, truncated: cut } = await sweepTransactions({
        date_from: isoDate(month.value.start),
        date_to: isoDate(scoped && month.value.end < today ? today : month.value.end),
        ...(scoped ? { wallet_ids: [walletId.value as number] } : {}),
        ...(search.value.trim() ? { search: search.value.trim() } : {})
      });
      if (id !== run) return;

      const mapped = transactionMapper
        .toFrontendBatch(
          rows,
          [...shared.parties.value],
          [...shared.categories.value],
          [...shared.wallets.value],
          [...shared.groups.value]
        )
        .map((row) => {
          const { value, currency } = parseAmount(row.amount);
          return {
            ...row,
            value,
            currency,
            signed: row.type === 'INCOME' ? value : -value,
            balanceAfter: null
          } as LedgerRow;
        })
        .sort((a, b) => (sortKey(a) < sortKey(b) ? 1 : -1));

      if (scoped && wallet.value && !search.value.trim()) {
        let balance = Number(wallet.value.balance) || 0;
        for (const row of mapped) {
          row.balanceAfter = balance;
          balance -= row.signed;
        }
      }

      const from = isoDate(month.value.start);
      const to = isoDate(month.value.end);
      entries.value = mapped.filter((row) => row.date >= from && row.date <= to);
      truncated.value = cut;
      if (selectedId.value && !entries.value.some((row) => row.id === selectedId.value)) {
        selectedId.value = null;
      }
    } catch (error) {
      if (id === run) console.warn('[ledger] entries failed', error);
    } finally {
      if (id === run) loading.value = false;
    }
  }

  const visible = computed(() =>
    entries.value.filter((row) =>
      flow.value === 'all' ? true : flow.value === 'in' ? row.type === 'INCOME' : row.type === 'EXPENSE'
    )
  );

  const selected = computed(() => entries.value.find((row) => row.id === selectedId.value) ?? null);

  const totals = computed(() => {
    let income = 0;
    let expense = 0;
    for (const row of entries.value) {
      if (row.isTransfer) continue;
      if (row.type === 'INCOME') income += row.value;
      else expense += row.value;
    }
    return { income, expense, net: income - expense };
  });

  const mixedCurrencies = computed(() => new Set(entries.value.map((row) => row.currency)).size > 1);

  return {
    walletId,
    wallet,
    monthOffset,
    month,
    flow,
    search,
    entries,
    visible,
    selectedId,
    selected,
    totals,
    mixedCurrencies,
    loading,
    truncated,
    load
  };
}
