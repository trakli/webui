import { ref, computed, readonly } from 'vue';
import { api } from '~/services/api';
import type { Category } from '~/types/category';
import type { Party } from '~/types/party';
import type { Wallet } from '~/types/wallet';
import type { Group } from '~/services/api/groupsApi';
import type { Configuration } from '~/services/api/configurationsApi';
import { checkAuth } from '~/utils/auth';
import { extractApiErrors } from '~/utils/apiErrors';

/**
 * Shared data composable for centralized state management
 * Single source of truth for all API data with proper caching and deduplication
 */

// Shared state - persists across component instances
const categories = ref<Category[]>([]);
const parties = ref<Party[]>([]);
const wallets = ref<Wallet[]>([]);
const groups = ref<Group[]>([]);
const configurations = ref<Configuration[]>([]);

// Loading states
const categoriesLoading = ref(false);
const partiesLoading = ref(false);
const walletsLoading = ref(false);
const groupsLoading = ref(false);
const configurationsLoading = ref(false);

// Error states
const categoriesError = ref<string | null>(null);
const partiesError = ref<string | null>(null);
const walletsError = ref<string | null>(null);
const groupsError = ref<string | null>(null);
const configurationsError = ref<string | null>(null);

// Cache timestamps for lightweight caching (5 minutes)
const categoriesLastFetched = ref<string | null>(null);
const partiesLastFetched = ref<string | null>(null);
const walletsLastFetched = ref<string | null>(null);
const groupsLastFetched = ref<string | null>(null);
const configurationsLastFetched = ref<string | null>(null);

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

function isCacheValid(lastFetched: string | null): boolean {
  if (!lastFetched) return false;
  const fetchTime = new Date(lastFetched).getTime();
  return Date.now() - fetchTime < CACHE_DURATION;
}

function createDataLoader<T>(
  name: string,
  data: Ref<T[]>,
  loading: Ref<boolean>,
  error: Ref<string | null>,
  lastFetched: Ref<string | null>,
  apiCall: () => Promise<any>
) {
  return async (forceReload = false) => {
    if (!forceReload && data.value.length > 0 && isCacheValid(lastFetched.value)) {
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
      lastFetched.value = new Date().toISOString();
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
    categoriesLastFetched,
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
    partiesLastFetched,
    () => api.parties.fetchAll()
  );

  const loadWallets = createDataLoader(
    'wallets',
    wallets,
    walletsLoading,
    walletsError,
    walletsLastFetched,
    () => api.wallets.fetchAll()
  );

  const loadGroups = createDataLoader(
    'groups',
    groups,
    groupsLoading,
    groupsError,
    groupsLastFetched,
    () => api.groups.fetchAll()
  );

  const loadConfigurations = createDataLoader(
    'configurations',
    configurations,
    configurationsLoading,
    configurationsError,
    configurationsLastFetched,
    () => api.configurations.fetchAll()
  );

  const loadAllData = async (forceReload = false) => {
    try {
      await Promise.all([
        loadCategories(forceReload),
        loadParties(forceReload),
        loadWallets(forceReload),
        loadGroups(forceReload),
        loadConfigurations(forceReload)
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

  const getDefaultGroup = computed(() => {
    const config = configurations.value.find((c) => c.key === 'default-group');
    if (config?.value) {
      const group = groups.value.find((g) => g.id === parseInt(config.value));
      if (group) return group;
    }
    return groups.value.length > 0 ? groups.value[0] : null;
  });

  const getDefaultWallet = computed(() => {
    const config = configurations.value.find((c) => c.key === 'default-wallet');
    if (config?.value) {
      const wallet = wallets.value.find((w) => w.id === parseInt(config.value));
      if (wallet) return wallet;
    }
    return wallets.value.length > 0 ? wallets.value[0] : null;
  });

  const getDefaultCurrency = computed(() => {
    const config = configurations.value.find((c) => c.key === 'default-currency');
    return config?.value || getDefaultWallet.value?.currency || 'USD';
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
    configurations.value = [];

    categoriesLoading.value = false;
    partiesLoading.value = false;
    walletsLoading.value = false;
    groupsLoading.value = false;
    configurationsLoading.value = false;

    categoriesError.value = null;
    partiesError.value = null;
    walletsError.value = null;
    groupsError.value = null;
    configurationsError.value = null;

    categoriesLastFetched.value = null;
    partiesLastFetched.value = null;
    walletsLastFetched.value = null;
    groupsLastFetched.value = null;
    configurationsLastFetched.value = null;

    console.log('✅ All shared data cleared for logout');
  };

  return {
    // Data
    categories: readonly(categories),
    parties: readonly(parties),
    wallets: readonly(wallets),
    groups: readonly(groups),
    configurations: readonly(configurations),

    // Loading states
    categoriesLoading: readonly(categoriesLoading),
    partiesLoading: readonly(partiesLoading),
    walletsLoading: readonly(walletsLoading),
    groupsLoading: readonly(groupsLoading),
    configurationsLoading: readonly(configurationsLoading),

    // Error states
    categoriesError: readonly(categoriesError),
    partiesError: readonly(partiesError),
    walletsError: readonly(walletsError),
    groupsError: readonly(groupsError),
    configurationsError: readonly(configurationsError),

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
    loadConfigurations,
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
