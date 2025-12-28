import { ref, computed } from 'vue';
import { api } from '~/services/api';
import { transactionMapper } from '~/utils/transactionMapper';
import type { FrontendTransaction } from '~/types/transaction';
import { useSharedData } from '~/composables/useSharedData';
import { checkAuth } from '~/utils/auth';
import { extractApiErrors } from '~/utils/apiErrors';

// Use FrontendTransaction as the main interface
type Transaction = FrontendTransaction;

// API mode only - no more mock data

// Module-scoped shared state
const transactions = ref<Transaction[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const lastSync = ref<string | null>(null);

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

// Fetch transactions from API
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

    const response = await api.transactions.fetchAll();
    lastSync.value = response.last_sync;

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
  // REMOVED: Auto-initialization - now controlled by data manager
  // ensureInit();

  // View-scoped state
  const searchQuery = ref('');
  const currentPage = ref(1);
  const itemsPerPage = ref(10);

  // Computed values
  const filteredTransactions = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return transactions.value;
    return transactions.value.filter((t) => {
      return (
        t.party.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.amount.toLowerCase().includes(q) ||
        (t.date || '').toLowerCase().includes(q)
      );
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
        sharedData.parties.value.length === 0 ||
        sharedData.categories.value.length === 0 ||
        sharedData.wallets.value.length === 0 ||
        sharedData.groups.value.length === 0
      ) {
        await loadDependencies();
      }

      // Transform to API format (pass parties, wallets, and default group for ID lookup)
      const payload = transactionMapper.toApi(
        transaction,
        sharedData.parties.value,
        sharedData.wallets.value,
        undefined,
        sharedData.getDefaultGroup.value
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
        sharedData.getDefaultGroup.value
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

    // REMOVED: Auto-reinitialization - now controlled by data manager
    // Re-initialize on next tick to allow auth state to propagate
    // if (typeof window !== 'undefined') {
    //   nextTick(() => {
    //     if (checkAuth()) {
    //       forceInit();
    //     }
    //   });
    // }
  };

  return {
    // State
    transactions,
    searchQuery,
    currentPage,
    itemsPerPage,
    isLoading,
    error,
    lastSync,
    isInitialized: computed(() => initialized),
    hasAttemptedLoad: computed(() => hasAttemptedLoad),

    // Dependencies (for form dropdowns) - from shared data
    parties: sharedData.parties,
    categories: sharedData.categories,
    wallets: sharedData.wallets,

    // Computed
    filteredTransactions,
    totalPages,
    paginatedTransactions,

    // Actions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions,
    getTransactionById,
    getTransactionForEdit,
    clearTransactions
  };
};
