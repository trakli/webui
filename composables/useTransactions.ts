import { ref, computed } from 'vue';
import { api } from '~/services/api';
import { transactionMapper } from '~/utils/transactionMapper';
import type { FrontendTransaction, TransactionQueryParams } from '~/types/transaction';
import { useSharedData } from '~/composables/useSharedData';
import { checkAuth } from '~/utils/auth';
import { extractApiErrors } from '~/utils/apiErrors';

// Use FrontendTransaction as the main interface
type Transaction = FrontendTransaction;

// Module-scoped shared state
const transactions = ref<Transaction[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const lastSync = ref<string | null>(null);

// Server-side pagination state
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const perPage = ref(20);

// Server-computed totals for filtered set (across all pages)
const filteredTotals = ref<{ income: number; expenses: number; net: number }>({
  income: 0,
  expenses: 0,
  net: 0
});

// Filter state
const filters = ref<{
  type?: 'income' | 'expense';
  date_from?: string;
  date_to?: string;
  wallet_ids?: number[];
  category_ids?: number[];
  search?: string;
}>({});

// Get shared data from centralized composable
const sharedData = useSharedData();

// Simple guard to ensure one-time init on client
let initialized = false;
let hasAttemptedLoad = false;

// Load dependencies using shared data composable
async function loadDependencies() {
  if (typeof window === 'undefined') return;

  try {
    await sharedData.loadAllData();
  } catch (err) {
    console.error('Error loading dependencies:', err);
    error.value = extractApiErrors(err);
  }
}

// Fetch transactions from API with server-side pagination & filtering
async function fetchTransactionsFromApi() {
  if (typeof window === 'undefined') return;

  try {
    if (!checkAuth()) {
      isLoading.value = false;
      hasAttemptedLoad = true;
      return;
    }

    isLoading.value = true;
    error.value = null;
    hasAttemptedLoad = true;

    if (
      sharedData.parties.value.length === 0 ||
      sharedData.categories.value.length === 0 ||
      sharedData.wallets.value.length === 0 ||
      sharedData.groups.value.length === 0
    ) {
      await loadDependencies();
    }

    const params: TransactionQueryParams = {
      limit: perPage.value,
      page: currentPage.value,
      ...filters.value
    };

    const response = await api.transactions.fetchAll(params);
    lastSync.value = response.last_sync;

    // Update pagination state from server response
    currentPage.value = response.current_page;
    totalPages.value = response.last_page;
    totalItems.value = response.total;
    perPage.value = response.per_page;

    if (response.totals) {
      filteredTotals.value = response.totals;
    }

    const transformed = transactionMapper.toFrontendBatch(
      response.data,
      sharedData.parties.value,
      sharedData.categories.value,
      sharedData.wallets.value,
      sharedData.groups.value
    );

    transactions.value = transformed;
  } catch (err) {
    console.error('Error fetching transactions:', err);
    error.value = extractApiErrors(err);
  } finally {
    isLoading.value = false;
  }
}

export const useTransactions = () => {
  // Debounce timer for search
  let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Actions
  const changePage = async (page: number) => {
    if (page < 1 || page > totalPages.value || page === currentPage.value) return;
    currentPage.value = page;
    await fetchTransactionsFromApi();
  };

  const applyFilters = async (newFilters: typeof filters.value) => {
    filters.value = { ...newFilters };
    currentPage.value = 1;
    await fetchTransactionsFromApi();
  };

  const updateSearch = (query: string) => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(async () => {
      filters.value = { ...filters.value, search: query || undefined };
      currentPage.value = 1;
      await fetchTransactionsFromApi();
    }, 400);
  };

  const addTransaction = async (transaction: Transaction) => {
    try {
      console.log('Creating transaction:', transaction);
      isLoading.value = true;
      error.value = null;

      // Ensure dependencies are loaded before mapping (prevents wallet_id/party_id = 0 and missing groups)
      if (
        sharedData.parties.value.length === 0 ||
        sharedData.categories.value.length === 0 ||
        sharedData.wallets.value.length === 0 ||
        sharedData.groups.value.length === 0
      ) {
        await loadDependencies();
      }

      // Transform to API format (pass parties, wallets, and defaults for ID lookup)
      const payload = transactionMapper.toApi(
        transaction,
        sharedData.parties.value,
        sharedData.wallets.value,
        undefined,
        sharedData.getDefaultGroup.value,
        sharedData.getDefaultWallet.value
      );

      console.log('Payload summary', {
        amount: payload.amount,
        type: payload.type,
        party_id: payload.party_id,
        wallet_id: payload.wallet_id,
        group_id: payload.group_id
      });
      console.log('API Payload:', payload);
      const created = await api.transactions.create(payload);
      console.log('Transaction created:', created);

      if (created) {
        // If files were provided, upload them and use the updated transaction
        let createdOrUpdated = created;
        const filesToUpload = Array.isArray(transaction.filesToUpload)
          ? transaction.filesToUpload
          : [];
        if (filesToUpload.length > 0) {
          try {
            const updatedWithFiles = await api.transactions.addFilesBulk(created.id, filesToUpload);
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

        // Add to local state instead of full API refetch for better performance
        const frontendTransaction = transactionMapper.toFrontend(
          createdOrUpdated,
          sharedData.parties.value,
          sharedData.categories.value,
          sharedData.wallets.value,
          sharedData.groups.value
        );
        transactions.value = [frontendTransaction, ...transactions.value];
        totalItems.value += 1;
        console.log('Transaction created and added to local state');
      }
    } catch (err: unknown) {
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
        sharedData.parties.value.length === 0 ||
        sharedData.categories.value.length === 0 ||
        sharedData.wallets.value.length === 0 ||
        sharedData.groups.value.length === 0
      ) {
        await loadDependencies();
      }

      const numericId = parseInt(id);
      const payload = transactionMapper.toApi(
        updates,
        sharedData.parties.value,
        sharedData.wallets.value,
        undefined,
        sharedData.getDefaultGroup.value,
        sharedData.getDefaultWallet.value
      );
      const updated = await api.transactions.update(numericId, payload);

      if (updated) {
        // Update local state instead of full API refetch for better performance
        const frontendTransaction = transactionMapper.toFrontend(
          updated,
          sharedData.parties.value,
          sharedData.categories.value,
          sharedData.wallets.value,
          sharedData.groups.value
        );
        const index = transactions.value.findIndex((t) => t.id === id);
        if (index !== -1) {
          transactions.value[index] = frontendTransaction;
        }
        console.log('Transaction updated in local state');
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
      await api.transactions.delete(numericId);
      console.log('Deleted transaction', numericId);

      // Remove from local state
      transactions.value = transactions.value.filter((t) => t.id !== id);
      totalItems.value = Math.max(0, totalItems.value - 1);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      error.value = extractApiErrors(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const setRecurring = async (
    id: string,
    config: {
      is_recurring: boolean;
      recurrence_period?: string;
      recurrence_interval?: number;
      recurrence_ends_at?: string | null;
    }
  ) => {
    try {
      isLoading.value = true;
      error.value = null;

      const numericId = parseInt(id);
      const payload = {
        is_recurring: config.is_recurring,
        recurrence_period: config.recurrence_period,
        recurrence_interval: config.recurrence_interval,
        recurrence_ends_at: config.recurrence_ends_at || undefined
      };

      const updated = await api.transactions.update(numericId, payload);

      const index = transactions.value.findIndex((t) => t.id === id);
      if (index !== -1) {
        if (updated) {
          const frontendTransaction = transactionMapper.toFrontend(
            updated,
            sharedData.parties.value,
            sharedData.categories.value,
            sharedData.wallets.value,
            sharedData.groups.value
          );
          transactions.value.splice(index, 1, frontendTransaction);
        } else {
          // Optimistic update when API returns no body
          const current = transactions.value[index];
          transactions.value.splice(index, 1, {
            ...current,
            isRecurring: config.is_recurring,
            recurrencePeriod: config.recurrence_period,
            recurrenceInterval: config.recurrence_interval,
            recurrenceEndsAt: config.recurrence_ends_at || undefined
          });
        }
      }
    } catch (err) {
      console.error('Error updating recurring:', err);
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

  const getTransactionById = (id: string) => {
    return transactions.value.find((t) => t.id === id) || null;
  };

  const getTransactionForEdit = async (id: string) => {
    try {
      if (sharedData.parties.value.length === 0 || sharedData.wallets.value.length === 0) {
        await loadDependencies();
      }

      const apiTransaction = await api.transactions.fetchById(parseInt(id));
      if (!apiTransaction) {
        throw new Error('Transaction not found');
      }

      return transactionMapper.toEditForm(
        apiTransaction,
        sharedData.parties.value,
        sharedData.wallets.value
      );
    } catch (err) {
      console.error('Error fetching transaction for edit:', err);
      throw err;
    }
  };

  const clearTransactions = () => {
    transactions.value = [];
    error.value = null;
    lastSync.value = null;
    initialized = false;
    hasAttemptedLoad = false;
    isLoading.value = false;
    currentPage.value = 1;
    totalPages.value = 1;
    totalItems.value = 0;
    filteredTotals.value = { income: 0, expenses: 0, net: 0 };
    filters.value = {};
  };

  return {
    // State
    transactions,
    isLoading,
    error,
    lastSync,
    isInitialized: computed(() => initialized),
    hasAttemptedLoad: computed(() => hasAttemptedLoad),

    // Server-side pagination
    currentPage,
    totalPages,
    totalItems,
    perPage,
    filteredTotals,

    // Filters
    filters,

    // Dependencies (for form dropdowns) - from shared data
    parties: sharedData.parties,
    categories: sharedData.categories,
    wallets: sharedData.wallets,

    // Actions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setRecurring,
    refreshTransactions,
    getTransactionById,
    getTransactionForEdit,
    clearTransactions,
    changePage,
    applyFilters,
    updateSearch
  };
};
