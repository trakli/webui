import { ref, computed, readonly } from 'vue';
import { api } from '~/services/api';
import type { Category } from '~/types/category';
import type { Party } from '~/types/party';
import type { Wallet } from '~/types/wallet';
import type { Group } from '~/services/api/groupsApi';
import { checkAuth } from '~/utils/auth';

/**
 * Shared data composable for centralized state management
 * Single source of truth for all API data with proper caching and deduplication
 */

// Shared state - persists across component instances
const categories = ref<Category[]>([]);
const parties = ref<Party[]>([]);
const wallets = ref<Wallet[]>([]);
const groups = ref<Group[]>([]);

// Loading states
const categoriesLoading = ref(false);
const partiesLoading = ref(false);
const walletsLoading = ref(false);
const groupsLoading = ref(false);

// Error states
const categoriesError = ref<string | null>(null);
const partiesError = ref<string | null>(null);
const walletsError = ref<string | null>(null);
const groupsError = ref<string | null>(null);

// Last sync timestamps for lightweight caching (5 minutes)
const categoriesLastSync = ref<string | null>(null);
const partiesLastSync = ref<string | null>(null);
const walletsLastSync = ref<string | null>(null);
const groupsLastSync = ref<string | null>(null);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to deduplicate arrays by ID
function deduplicateById<T extends { id: number }>(items: T[]): T[] {
  const seen = new Set<number>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

function extractApiErrors(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err?.response?._data?.message) return err.response._data.message;
  if (err?.response?._data?.errors?.length) return err.response._data.errors.join(', ');
  if (err?.message) return err.message;
  if (err?._data?.message) return err._data.message;
  if (err?._data?.errors?.length) return err._data.errors.join(', ');
  return 'An unknown error occurred';
}

function isCacheValid(lastSync: string | null): boolean {
  if (!lastSync) return false;
  const syncTime = new Date(lastSync).getTime();
  return Date.now() - syncTime < CACHE_DURATION;
}

function createDataLoader<T>(
  name: string,
  data: Ref<T[]>,
  loading: Ref<boolean>,
  error: Ref<string | null>,
  lastSync: Ref<string | null>,
  apiCall: () => Promise<any>
) {
  return async (forceReload = false) => {
    if (!forceReload && data.value.length > 0 && isCacheValid(lastSync.value)) {
      return data.value;
    }

    if (loading.value) {
      while (loading.value) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return data.value;
    }

    if (!checkAuth()) {
      loading.value = false;
      return data.value;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await apiCall();
      data.value = deduplicateById(response.data || []);
      lastSync.value = new Date().toISOString();
      console.log(`✅ Loaded ${data.value.length} ${name}`);
      return data.value;
    } catch (err) {
      const errorMsg = extractApiErrors(err);
      error.value = errorMsg;
      console.error(`Error loading ${name}:`, errorMsg);
      throw err;
    } finally {
      loading.value = false;
    }
  };
}

export const useSharedData = () => {
  const loadCategories = createDataLoader(
    'categories',
    categories,
    categoriesLoading,
    categoriesError,
    categoriesLastSync,
    async () => {
      const [incomeResponse, expenseResponse] = await Promise.all([
        api.categories.fetchByType('income'),
        api.categories.fetchByType('expense')
      ]);
      return { data: [...(incomeResponse.data || []), ...(expenseResponse.data || [])] };
    }
  );

  const loadParties = createDataLoader(
    'parties',
    parties,
    partiesLoading,
    partiesError,
    partiesLastSync,
    () => api.parties.fetchAll()
  );

  const loadWallets = createDataLoader(
    'wallets',
    wallets,
    walletsLoading,
    walletsError,
    walletsLastSync,
    () => api.wallets.fetchAll()
  );

  const loadGroups = createDataLoader(
    'groups',
    groups,
    groupsLoading,
    groupsError,
    groupsLastSync,
    () => api.groups.fetchAll()
  );

  const loadAllData = async (forceReload = false) => {
    try {
      await Promise.all([
        loadCategories(forceReload),
        loadParties(forceReload),
        loadWallets(forceReload),
        loadGroups(forceReload)
      ]);
    } catch (err) {
      console.error('Error loading shared data:', err);
      throw err;
    }
  };

  // Computed getters for filtered data
  const getIncomeCategories = computed(() =>
    categories.value.filter((cat) => cat.type === 'income')
  );

  const getExpenseCategories = computed(() =>
    categories.value.filter((cat) => cat.type === 'expense')
  );

  // TODO: Replace with backend configuration API call to get default group
  // For now, find group with "default" in its name
  const getDefaultGroup = computed(
    () =>
      groups.value.find((group) => group.name.toLowerCase().includes('default')) ||
      (groups.value.length > 0 ? groups.value[0] : null)
  );

  // TODO: Replace with backend configuration API call to get default wallet
  // For now, find wallet with "default" in its name
  const getDefaultWallet = computed(
    () =>
      wallets.value.find((wallet) => wallet.name.toLowerCase().includes('default')) ||
      (wallets.value.length > 0 ? wallets.value[0] : null)
  );

  // TODO: Replace with backend user preferences API call to get default currency
  // For now, use default wallet's currency or fallback to USD
  const getDefaultCurrency = computed(() => {
    return getDefaultWallet.value?.currency || 'USD';
  });

  // Category management functions
  const addCategory = (category: Category) => {
    categories.value = deduplicateById([category, ...categories.value]);
  };

  const updateCategory = (id: number, updatedCategory: Category) => {
    const index = categories.value.findIndex((cat) => cat.id === id);
    if (index !== -1) {
      categories.value[index] = updatedCategory;
    }
  };

  const removeCategory = (id: number) => {
    categories.value = categories.value.filter((cat) => cat.id !== id);
  };

  // Party management functions
  const addParty = (party: Party) => {
    parties.value = deduplicateById([party, ...parties.value]);
  };

  const updateParty = (id: number, updatedParty: Party) => {
    const index = parties.value.findIndex((party) => party.id === id);
    if (index !== -1) {
      parties.value[index] = updatedParty;
    }
  };

  const removeParty = (id: number) => {
    parties.value = parties.value.filter((party) => party.id !== id);
  };

  // Wallet management functions
  const addWallet = (wallet: Wallet) => {
    wallets.value = deduplicateById([wallet, ...wallets.value]);
  };

  const updateWallet = (id: number, updatedWallet: Wallet) => {
    const index = wallets.value.findIndex((wallet) => wallet.id === id);
    if (index !== -1) {
      wallets.value[index] = updatedWallet;
    }
  };

  const removeWallet = (id: number) => {
    wallets.value = wallets.value.filter((wallet) => wallet.id !== id);
  };

  // Group management functions
  const addGroup = (group: Group) => {
    groups.value = deduplicateById([group, ...groups.value]);
  };

  const updateGroup = (id: number, updatedGroup: Group) => {
    const index = groups.value.findIndex((group) => group.id === id);
    if (index !== -1) {
      groups.value[index] = updatedGroup;
    }
  };

  const removeGroup = (id: number) => {
    groups.value = groups.value.filter((group) => group.id !== id);
  };

  const clearAllData = () => {
    categories.value = [];
    parties.value = [];
    wallets.value = [];
    groups.value = [];

    categoriesLoading.value = false;
    partiesLoading.value = false;
    walletsLoading.value = false;
    groupsLoading.value = false;

    categoriesError.value = null;
    partiesError.value = null;
    walletsError.value = null;
    groupsError.value = null;

    categoriesLastSync.value = null;
    partiesLastSync.value = null;
    walletsLastSync.value = null;
    groupsLastSync.value = null;

    console.log('✅ All shared data cleared for logout');
  };

  return {
    // Data
    categories: readonly(categories),
    parties: readonly(parties),
    wallets: readonly(wallets),
    groups: readonly(groups),

    // Loading states
    categoriesLoading: readonly(categoriesLoading),
    partiesLoading: readonly(partiesLoading),
    walletsLoading: readonly(walletsLoading),
    groupsLoading: readonly(groupsLoading),

    // Error states
    categoriesError: readonly(categoriesError),
    partiesError: readonly(partiesError),
    walletsError: readonly(walletsError),
    groupsError: readonly(groupsError),

    // Last sync timestamps
    categoriesLastSync: readonly(categoriesLastSync),
    partiesLastSync: readonly(partiesLastSync),
    walletsLastSync: readonly(walletsLastSync),
    groupsLastSync: readonly(groupsLastSync),

    // Computed getters
    getIncomeCategories,
    getExpenseCategories,
    getDefaultGroup,
    getDefaultWallet,
    getDefaultCurrency,

    // Load functions
    loadCategories,
    loadParties,
    loadWallets,
    loadGroups,
    loadAllData,

    // Management functions
    addCategory,
    updateCategory,
    removeCategory,
    addParty,
    updateParty,
    removeParty,
    addWallet,
    updateWallet,
    removeWallet,
    addGroup,
    updateGroup,
    removeGroup,

    clearAllData
  };
};
