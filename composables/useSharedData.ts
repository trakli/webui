import { ref, computed, readonly } from 'vue';
import { api } from '~/services/api';
import type { Category } from '~/types/category';
import type { Party } from '~/types/party';
import type { Wallet } from '~/types/wallet';
import type { Group } from '~/services/api/groupsApi';
import { checkAuth } from '~/utils/auth';
import { extractApiErrors } from '~/utils/apiErrors';
import type { ConfigurationItem } from '~/types/configuration';

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
const configurationsLoading = ref(false);

// Error states
const categoriesError = ref<string | null>(null);
const partiesError = ref<string | null>(null);
const walletsError = ref<string | null>(null);
const groupsError = ref<string | null>(null);
const configurationsError = ref<string | null>(null);

// Cache timestamps for lightweight caching
const categoriesLastFetched = ref<string | null>(null);
const partiesLastFetched = ref<string | null>(null);
const walletsLastFetched = ref<string | null>(null);
const groupsLastFetched = ref<string | null>(null);
const configurationsLastFetched = ref<string | null>(null);
const configurationsMap = ref<Record<string, any> | null>(null);

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

  const loadConfigurations = async (forceReload = false) => {
    if (!forceReload && configurationsMap.value && isCacheValid(configurationsLastFetched.value)) {
      return configurationsMap.value;
    }

    if (configurationsLoading.value) {
      while (configurationsLoading.value) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return configurationsMap.value;
    }

    if (!checkAuth()) {
      configurationsLoading.value = false;
      return configurationsMap.value;
    }

    configurationsLoading.value = true;
    configurationsError.value = null;

    try {
      const response = await api.configurations.fetchAll();
      const items: ConfigurationItem[] = response?.data || [];
      const map: Record<string, any> = {};
      for (const item of items) {
        map[item.key] = item.value;
      }
      configurationsMap.value = map;
      configurationsLastFetched.value = new Date().toISOString();
      return map;
    } catch (err) {
      const errorMsg = extractApiErrors(err);
      configurationsError.value = errorMsg;
      console.error('Error loading configurations:', errorMsg);
      throw err;
    } finally {
      configurationsLoading.value = false;
    }
  };

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
    const map = configurationsMap.value || {};
    const configured = map['default-group'];
    if (configured) {
      const configValue = typeof configured === 'object' ? configured.id : configured;
      const configStr = String(configValue);

      const byClientId = groups.value.find((g) => g.client_generated_id === configStr);
      if (byClientId) return byClientId;

      const byId = groups.value.find((g) => String(g.id) === configStr);
      if (byId) return byId;
    }
    return null;
  });

  // Default wallet from configurations
  const getDefaultWallet = computed(() => {
    const map = configurationsMap.value || {};
    const configured = map['default-wallet'];

    // Try to resolve wallet identifier from config
    const resolveConfiguredValue = (): string | null => {
      if (!configured) return null;
      if (typeof configured === 'string' || typeof configured === 'number')
        return String(configured);
      if (configured && typeof configured === 'object') {
        if (
          'id' in configured &&
          (typeof configured.id === 'string' || typeof configured.id === 'number')
        ) {
          return String(configured.id);
        }
        if (
          'walletId' in configured &&
          (typeof configured.walletId === 'string' || typeof configured.walletId === 'number')
        ) {
          return String(configured.walletId);
        }
      }
      return null;
    };

    const configValue = resolveConfiguredValue();
    if (configValue) {
      const byClientId = wallets.value.find((w) => w.client_generated_id === configValue);
      if (byClientId) return byClientId;

      const byId = wallets.value.find((w) => String(w.id) === configValue);
      if (byId) return byId;
    }

    return null;
  });

  // Default currency prefers configuration; fallback to default wallet currency or 'USD'
  const getDefaultCurrency = computed(() => {
    const map = configurationsMap.value || {};
    const configured = map['default-currency'];
    const extractCode = (val: any): string | null => {
      if (!val) return null;
      if (typeof val === 'string') return val;
      if (typeof val === 'object' && 'code' in val) return String(val.code);
      return null;
    };
    const fromConfig = extractCode(configured);
    return fromConfig || getDefaultWallet.value?.currency || 'USD';
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
    configurationsMap.value = null;

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
    configurationsMap: readonly(configurationsMap),

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

    // Last fetch timestamps
    categoriesLastFetched: readonly(categoriesLastFetched),
    partiesLastFetched: readonly(partiesLastFetched),
    walletsLastFetched: readonly(walletsLastFetched),
    groupsLastFetched: readonly(groupsLastFetched),
    configurationsLastFetched: readonly(configurationsLastFetched),

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
