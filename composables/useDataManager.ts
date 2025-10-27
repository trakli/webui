import { readonly } from 'vue';
import { extractApiErrors } from '~/utils/apiErrors';

export const useDataManager = () => {
  // Centralized state using useState with unique keys
  const isInitialized = useState('data.initialized', () => false);
  const isLoading = useState('data.loading', () => false);
  const error = useState<string | null>('data.error', () => null);
  const lastInitTime = useState('data.lastInitTime', () => 0);

  const initializeData = async () => {
    // Prevent duplicate initialization
    if (isLoading.value) return;

    // Check authentication before initializing
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated.value) {
      isInitialized.value = false;
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Clear existing data to ensure loading state shows properly
      const { clearAllData } = useSharedData();
      const { clearTransactions } = useTransactions();
      clearAllData();
      clearTransactions();

      // Import composables lazily to avoid circular dependencies
      const { loadAllData } = useSharedData();
      const { refreshTransactions } = useTransactions();

      await loadAllData();
      await refreshTransactions();

      isInitialized.value = true;
      lastInitTime.value = Date.now();
    } catch (err) {
      error.value = extractApiErrors(err);
      isInitialized.value = false;
    } finally {
      isLoading.value = false;
    }
  };

  const clearData = () => {
    // Reset manager state
    isInitialized.value = false;
    isLoading.value = false;
    error.value = null;
    lastInitTime.value = 0;

    // Clear data in composables
    try {
      const { clearAllData } = useSharedData();
      const { clearTransactions } = useTransactions();

      clearAllData();
      clearTransactions();
    } catch (err) {
      console.warn('[DataManager] Error clearing data:', err);
    }
  };

  const refreshData = async () => {
    clearData();
    await initializeData();
  };

  return {
    // Read-only state
    isInitialized: readonly(isInitialized),
    isLoading: readonly(isLoading),
    error: readonly(error),
    lastInitTime: readonly(lastInitTime),

    // Actions
    initializeData,
    clearData,
    refreshData
  };
};
