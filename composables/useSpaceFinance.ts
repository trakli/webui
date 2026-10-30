import { computed, ref, watch } from 'vue';
import type {
  Page,
  WorkspaceOverview,
  WorkspaceTransaction,
  WorkspaceWallet
} from '~/types/workspace';
import type { Budget, BudgetCreatePayload } from '~/types/budget';

const emptyOverview = (): WorkspaceOverview => ({
  wallets: [],
  budgets: [],
  categories: [],
  groups: [],
  totals: []
});

const overview = ref<WorkspaceOverview>(emptyOverview());
const transactions = ref<WorkspaceTransaction[]>([]);
const page = ref(1);
const lastPage = ref(1);
const total = ref(0);
const filters = ref<{ type: '' | 'income' | 'expense'; wallet_id: number | '' }>({
  type: '',
  wallet_id: ''
});
const loading = ref(false);
const loaded = ref<string | null>(null);
const error = ref<unknown>(null);
let loadId = 0;

export interface TransactionInput {
  wallet_id: number;
  amount: number;
  type: 'income' | 'expense';
  datetime: string;
  description: string;
  is_refund: boolean;
  category_ids?: number[];
  group_ids?: number[];
}

export interface WalletInput {
  name: string;
  type: string;
  currency: string;
  balance: number;
}

export function useSpaceFinance() {
  const api = useApi();
  const { space } = useActiveSpace();
  const { load: reloadSpaces } = useWorkspaces();
  const base = computed(() => (space.value ? `/workspaces/${space.value.slug}` : ''));
  const ready = computed(() => !!base.value && loaded.value === base.value);
  const nativeWallets = computed(() =>
    overview.value.wallets.filter((wallet) => wallet.source === 'workspace')
  );

  async function load(nextPage = page.value) {
    if (!base.value) return;
    const id = ++loadId;
    const path = base.value;
    loading.value = true;
    error.value = null;
    try {
      const [finance, entries] = await Promise.all([
        api<{ data: WorkspaceOverview }>(`${path}/finance`),
        api<{ data: Page<WorkspaceTransaction> }>(`${path}/transactions`, {
          query: {
            page: nextPage,
            ...(filters.value.type ? { type: filters.value.type } : {}),
            ...(filters.value.wallet_id ? { wallet_id: filters.value.wallet_id } : {})
          }
        })
      ]);
      if (id !== loadId) return;
      overview.value = finance.data;
      transactions.value = entries.data.data;
      page.value = entries.data.current_page;
      lastPage.value = entries.data.last_page;
      total.value = entries.data.total;
      loaded.value = path;
    } catch (cause) {
      if (id === loadId) error.value = cause;
    } finally {
      if (id === loadId) loading.value = false;
    }
  }

  async function ensure() {
    if (base.value && loaded.value !== base.value && !loading.value) await load(1);
  }

  async function changed() {
    await Promise.all([load(), reloadSpaces()]);
  }

  async function saveTransaction(input: TransactionInput, id?: number) {
    await api(`${base.value}/transactions${id ? '/' + id : ''}`, {
      method: id ? 'PUT' : 'POST',
      body: input
    });
    await changed();
  }

  async function classify(id: number, categoryIds: number[], groupIds: number[]) {
    await api(`${base.value}/transactions/${id}/classification`, {
      method: 'PUT',
      body: { category_ids: categoryIds, group_ids: groupIds }
    });
    await changed();
  }

  async function removeTransaction(transaction: WorkspaceTransaction) {
    const path =
      transaction.source === 'workspace'
        ? `${base.value}/transactions/${transaction.id}`
        : `${base.value}/shares/transactions/${transaction.id}`;
    await api(path, { method: 'DELETE' });
    await changed();
  }

  async function saveWallet(input: WalletInput, id?: number) {
    await api(`${base.value}/wallets${id ? '/' + id : ''}`, {
      method: id ? 'PUT' : 'POST',
      body: input
    });
    await changed();
  }

  async function removeWallet(wallet: WorkspaceWallet) {
    const path =
      wallet.source === 'workspace'
        ? `${base.value}/wallets/${wallet.id}`
        : `${base.value}/shares/wallets/${wallet.id}`;
    await api(path, { method: 'DELETE' });
    await changed();
  }

  async function share(kind: 'wallets' | 'transactions', id: number) {
    const key = kind === 'wallets' ? 'wallet_id' : 'transaction_id';
    await api(`${base.value}/shares/${kind}`, {
      method: 'POST',
      body: { [key]: id, confirmed: true }
    });
    await changed();
  }

  async function saveLabel(kind: 'categories' | 'groups', name: string, type = 'expense') {
    await api(`${base.value}/labels/${kind}`, {
      method: 'POST',
      body: kind === 'categories' ? { name, type } : { name }
    });
    await changed();
  }

  async function saveBudget(payload: BudgetCreatePayload & { id?: number }) {
    const { id, ...body } = payload;
    await api(`${base.value}/budgets${id ? '/' + id : ''}`, {
      method: id ? 'PUT' : 'POST',
      body
    });
    await changed();
  }

  async function removeBudget(budget: Budget) {
    await api(`${base.value}/budgets/${budget.id}`, { method: 'DELETE' });
    await changed();
  }

  async function budgetEntries(id: number, nextPage = 1) {
    return (
      await api<{ data: Page<WorkspaceTransaction> }>(`${base.value}/budgets/${id}/transactions`, {
        query: { page: nextPage }
      })
    ).data;
  }

  async function budgetPeriods(id: number) {
    return (
      await api<{
        data: Page<{
          id: number;
          period_start: string;
          period_end: string;
          net_spent: string;
          rollover_out: string;
        }>;
      }>(`${base.value}/budgets/${id}/periods`)
    ).data.data;
  }

  async function closeBudget(id: number) {
    await api(`${base.value}/budgets/${id}/close-period`, { method: 'POST' });
    await changed();
  }

  return {
    base,
    ready,
    filters,
    overview,
    transactions,
    nativeWallets,
    page,
    lastPage,
    total,
    loading,
    error,
    load,
    ensure,
    saveTransaction,
    classify,
    removeTransaction,
    saveWallet,
    removeWallet,
    share,
    saveLabel,
    saveBudget,
    removeBudget,
    budgetEntries,
    budgetPeriods,
    closeBudget
  };
}

export function resetSpaceFinance() {
  loadId++;
  overview.value = emptyOverview();
  transactions.value = [];
  filters.value = { type: '', wallet_id: '' };
  page.value = 1;
  lastPage.value = 1;
  total.value = 0;
  loaded.value = null;
  error.value = null;
  loading.value = false;
}

export function useSpaceFinanceReset() {
  const { space } = useActiveSpace();
  const { load } = useSpaceFinance();
  watch(
    () => space.value?.slug,
    async (slug) => {
      resetSpaceFinance();
      if (slug) await load(1);
    }
  );
}
