import { ref, computed } from 'vue';
import { transactionApi } from '~/services/transactionApi';
import { transactionMapper } from '~/utils/transactionMapper';
import type { FrontendTransaction } from '~/types/transaction';
import type { Party } from '~/types/party';
import type { Category } from '~/types/category';
import type { Wallet } from '~/types/wallet';
type GroupLite = { id: number; name: string };
import { useGroups } from '~/composables/useGroups';

// Use FrontendTransaction as the main interface
type Transaction = FrontendTransaction;

// API mode only - no more mock data

// Module-scoped shared state
const transactions = ref<Transaction[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const lastSync = ref<string | null>(null);

// Dependency data (needed for API mode)
const parties = ref<Party[]>([]);
const categories = ref<Category[]>([]);
const wallets = ref<Wallet[]>([]);
const groups = ref<GroupLite[]>([]);

// Simple guard to ensure one-time init on client
let initialized = false;

// Helper to extract API errors
function extractApiErrors(err: any): string {
  if (typeof err === 'string') return err;
  if (err?.response?._data?.message) return err.response._data.message;
  if (err?.response?._data?.errors?.length) return err.response._data.errors.join(', ');
  if (err?.message) return err.message;
  if (err?._data?.message) return err._data.message;
  if (err?._data?.errors?.length) return err._data.errors.join(', ');
  return 'An unknown error occurred';
}

// Load dependencies needed for API mode
async function loadDependencies() {
  if (typeof window === 'undefined') return;

  try {
    isLoading.value = true;
    console.log('[loadDependencies] Starting...');
    const { fetchCategories, categories: cats } = useCategories();
    const { fetchParties, parties: pts } = useParties();
    const { fetchWallets, wallets: wts } = useWallets();
    const { fetchGroups, groups: grps } = useGroups();

    // Fetch income categories first
    await fetchCategories('income');
    const incomeCategories = [...cats.value];
    console.log('Income categories loaded:', incomeCategories.length);

    // Fetch expense categories
    await fetchCategories('expense');
    const expenseCategories = [...cats.value];
    console.log('Expense categories loaded:', expenseCategories.length);

    // Combine both types
    categories.value = [...incomeCategories, ...expenseCategories];

    // Fetch parties, wallets and groups in parallel
    await Promise.all([fetchParties(), fetchWallets(), fetchGroups()]);

    // Store in local refs (spread to avoid readonly conflicts)
    parties.value = [...pts.value];
    wallets.value = [...wts.value];
    // Map to minimal shape used by mapper
    groups.value = grps.value.map((g: any) => ({ id: g.id, name: g.name }));

    console.log(
      'All dependencies loaded - Categories:',
      categories.value.length,
      'Parties:',
      parties.value.length,
      'Wallets:',
      wallets.value.length,
      'Groups:',
      groups.value.length
    );
  } catch (err) {
    console.error('Error loading dependencies:', err);
    error.value = extractApiErrors(err);
  } finally {
    isLoading.value = false;
  }
}

// Fetch transactions from API
async function fetchTransactionsFromApi() {
  if (typeof window === 'undefined') return;

  try {
    console.log('[API MODE] Fetching transactions from API...');
    isLoading.value = true;
    error.value = null;

    // Ensure dependencies are loaded
    if (
      parties.value.length === 0 ||
      categories.value.length === 0 ||
      wallets.value.length === 0 ||
      groups.value.length === 0
    ) {
      console.log('Loading dependencies (parties, categories, wallets)...');
      await loadDependencies();
      console.log(
        `Dependencies loaded: ${parties.value.length} parties, ${categories.value.length} categories, ${wallets.value.length} wallets, ${groups.value.length} groups`
      );
    }

    // Fetch transactions
    const response = await transactionApi.fetchAll();
    console.log(`Received ${response.data.length} transactions from API`);
    lastSync.value = response.last_sync;
    console.log('Last sync:', lastSync.value);

    // Transform to frontend format
    const transformed = transactionMapper.toFrontendBatch(
      response.data,
      parties.value,
      categories.value,
      wallets.value,
      groups.value
    );
    console.log('Transformed', transformed.length, 'transactions for display');

    transactions.value = transformed;
  } catch (err) {
    console.error('Error fetching transactions:', err);
    error.value = extractApiErrors(err);
  } finally {
    isLoading.value = false;
  }
}

function ensureInit() {
  if (initialized) return;
  if (typeof window === 'undefined') return;
  initialized = true;

  // Fetch transactions from API on init
  console.log('initialized, fetching transactions...');
  fetchTransactionsFromApi();
}

export const useTransactions = () => {
  // Ensure storage-backed state is initialized on client
  ensureInit();

  // View-scoped state
  const searchQuery = ref('');
  const filterQuery = ref('');
  const currentPage = ref(1);
  const itemsPerPage = ref(10);

  // Computed values
  const filteredTransactions = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    const f = filterQuery.value.trim().toLowerCase();
    return transactions.value.filter((t) => {
      const matchesSearch =
        !q ||
        t.party.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.amount.toLowerCase().includes(q) ||
        (t.date || '').toLowerCase().includes(q);
      const matchesFilter =
        !f || t.category.toLowerCase().includes(f) || t.type.toLowerCase().includes(f);
      return matchesSearch && matchesFilter;
    });
  });

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredTransactions.value.length / itemsPerPage.value))
  );

  const paginatedTransactions = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    return filteredTransactions.value.slice(start, start + itemsPerPage.value);
  });

  // Actions
  const addTransaction = async (transaction: Transaction) => {
    try {
      console.log('Creating transaction:', transaction);
      isLoading.value = true;
      error.value = null;

      // Ensure dependencies are loaded before mapping (prevents wallet_id/party_id = 0 and missing groups)
      if (
        parties.value.length === 0 ||
        categories.value.length === 0 ||
        wallets.value.length === 0 ||
        groups.value.length === 0
      ) {
        console.log('Dependencies not ready. Loading...');
        await loadDependencies();
        console.log(
          `Deps ready -> parties=${parties.value.length}, categories=${categories.value.length}, wallets=${wallets.value.length}, groups=${groups.value.length}`
        );
      }

      // Transform to API format (pass parties and wallets for ID lookup)
      const payload = transactionMapper.toApi(transaction, parties.value, wallets.value);

      console.log('Payload summary', {
        amount: payload.amount,
        type: payload.type,
        party_id: payload.party_id,
        wallet_id: payload.wallet_id,
        group_id: payload.group_id
      });
      console.log('API Payload:', payload);
      const created = await transactionApi.create(payload);
      console.log('Transaction created:', created);

      if (created) {
        // If files were provided, upload them and use the updated transaction
        let createdOrUpdated = created;
        const filesToUpload = Array.isArray(transaction.filesToUpload)
          ? transaction.filesToUpload
          : [];
        if (filesToUpload.length > 0) {
          try {
            const updatedWithFiles = await transactionApi.addFilesBulk(created.id, filesToUpload);
            if (updatedWithFiles) {
              createdOrUpdated = updatedWithFiles;
              console.log(
                '[addTransaction] Files attached to transaction:',
                updatedWithFiles.files?.length || 0
              );
            }
          } catch (e) {
            console.error('[addTransaction] Error uploading files:', e);
          }
        }

        // Transform back to frontend format and add to list
        const frontendTx = transactionMapper.toFrontend(
          createdOrUpdated,
          parties.value,
          categories.value,
          wallets.value,
          groups.value
        );
        transactions.value = [frontendTx, ...transactions.value];
        console.log('Transaction added to local state');
      }
    } catch (err: any) {
      console.error('Error adding transaction:', err);

      // Log detailed validation errors if available
      if (err?.response?._data?.errors) {
        console.error('Validation errors:', err.response._data.errors);
      }
      if (err?._data?.errors) {
        console.error('Validation errors:', err._data.errors);
      }

      error.value = extractApiErrors(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Ensure dependencies are loaded before mapping
      if (
        parties.value.length === 0 ||
        categories.value.length === 0 ||
        wallets.value.length === 0 ||
        groups.value.length === 0
      ) {
        console.log('Dependencies not ready. Loading...');
        await loadDependencies();
        console.log(
          `Deps ready -> parties=${parties.value.length}, categories=${categories.value.length}, wallets=${wallets.value.length}, groups=${groups.value.length}`
        );
      }

      const numericId = parseInt(id);
      const payload = transactionMapper.toApi(updates, parties.value, wallets.value);
      console.log('Updating transaction', numericId, 'payload:', payload);
      console.log('Payload summary', {
        amount: payload.amount,
        type: payload.type,
        party_id: payload.party_id,
        wallet_id: payload.wallet_id,
        group_id: payload.group_id
      });
      const updated = await transactionApi.update(numericId, payload);

      if (updated) {
        // Transform and update in list
        const frontendTx = transactionMapper.toFrontend(
          updated,
          parties.value,
          categories.value,
          wallets.value,
          groups.value
        );
        const idx = transactions.value.findIndex((t) => t.id === id);
        if (idx !== -1) {
          transactions.value[idx] = frontendTx;
        }
      }
    } catch (err) {
      console.error('Error updating transaction:', err);
      error.value = extractApiErrors(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const numericId = parseInt(id);
      console.log('Deleting transaction', numericId);
      await transactionApi.delete(numericId);
      console.log('Deleted transaction', numericId);

      // Remove from local state
      transactions.value = transactions.value.filter((t) => t.id !== id);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      error.value = extractApiErrors(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const refreshTransactions = async () => {
    console.log('Refreshing transactions...');
    await fetchTransactionsFromApi();
  };

  return {
    // State
    transactions,
    searchQuery,
    filterQuery,
    currentPage,
    itemsPerPage,
    isLoading,
    error,
    lastSync,

    // Dependencies (for form dropdowns)
    parties,
    categories,
    wallets,

    // Computed
    filteredTransactions,
    totalPages,
    paginatedTransactions,

    // Actions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions
  };
};
