import { ref, computed, readonly } from 'vue';
import { api } from '~/services/api';
import type { Category } from '~/types/category';
import type { Party } from '~/types/party';
import type { Wallet } from '~/types/wallet';
import type { Group } from '~/services/api/groupsApi';

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

// Last sync timestamps
const categoriesLastSync = ref<string | null>(null);
const partiesLastSync = ref<string | null>(null);
const walletsLastSync = ref<string | null>(null);
const groupsLastSync = ref<string | null>(null);

// Initialization flags to prevent duplicate loads
let categoriesInitialized = false;
let partiesInitialized = false;
let walletsInitialized = false;
let groupsInitialized = false;

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

// Helper function to extract API errors
function extractApiErrors(err: any): string {
  if (typeof err === 'string') return err;
  if (err?.response?._data?.message) return err.response._data.message;
  if (err?.response?._data?.errors?.length) return err.response._data.errors.join(', ');
  if (err?.message) return err.message;
  if (err?._data?.message) return err._data.message;
  if (err?._data?.errors?.length) return err._data.errors.join(', ');
  return 'An unknown error occurred';
}

export const useSharedData = () => {
  // Categories operations
  const loadCategories = async (forceReload = false) => {
    if (categoriesInitialized && !forceReload) {
      return categories.value;
    }

    if (categoriesLoading.value) {
      // Wait for existing load to complete
      while (categoriesLoading.value) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return categories.value;
    }

    categoriesLoading.value = true;
    categoriesError.value = null;

    try {
      // Load both income and expense categories in parallel
      const [incomeResponse, expenseResponse] = await Promise.all([
        api.categories.fetchByType('income'),
        api.categories.fetchByType('expense')
      ]);

      // Combine and deduplicate categories
      const allCategories = [...(incomeResponse.data || []), ...(expenseResponse.data || [])];

      categories.value = deduplicateById(allCategories);
      categoriesLastSync.value =
        incomeResponse.last_sync || expenseResponse.last_sync || new Date().toISOString();
      categoriesInitialized = true;

      console.log(`✅ Loaded ${categories.value.length} categories (deduplicated)`);
      return categories.value;
    } catch (err) {
      const errorMsg = extractApiErrors(err);
      categoriesError.value = errorMsg;
      console.error('Error loading categories:', errorMsg);
      throw err;
    } finally {
      categoriesLoading.value = false;
    }
  };

  const loadParties = async (forceReload = false) => {
    if (partiesInitialized && !forceReload) {
      return parties.value;
    }

    if (partiesLoading.value) {
      while (partiesLoading.value) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return parties.value;
    }

    partiesLoading.value = true;
    partiesError.value = null;

    try {
      const response = await api.parties.fetchAll();
      parties.value = deduplicateById(response.data || []);
      partiesLastSync.value = response.last_sync || new Date().toISOString();
      partiesInitialized = true;

      console.log(`✅ Loaded ${parties.value.length} parties`);
      return parties.value;
    } catch (err) {
      const errorMsg = extractApiErrors(err);
      partiesError.value = errorMsg;
      console.error('Error loading parties:', errorMsg);
      throw err;
    } finally {
      partiesLoading.value = false;
    }
  };

  const loadWallets = async (forceReload = false) => {
    if (walletsInitialized && !forceReload) {
      return wallets.value;
    }

    if (walletsLoading.value) {
      while (walletsLoading.value) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return wallets.value;
    }

    walletsLoading.value = true;
    walletsError.value = null;

    try {
      const response = await api.wallets.fetchAll();
      wallets.value = deduplicateById(response.data || []);
      walletsLastSync.value = response.last_sync || new Date().toISOString();
      walletsInitialized = true;

      console.log(`✅ Loaded ${wallets.value.length} wallets`);
      return wallets.value;
    } catch (err) {
      const errorMsg = extractApiErrors(err);
      walletsError.value = errorMsg;
      console.error('Error loading wallets:', errorMsg);
      throw err;
    } finally {
      walletsLoading.value = false;
    }
  };

  const loadGroups = async (forceReload = false) => {
    if (groupsInitialized && !forceReload) {
      return groups.value;
    }

    if (groupsLoading.value) {
      while (groupsLoading.value) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return groups.value;
    }

    groupsLoading.value = true;
    groupsError.value = null;

    try {
      const response = await api.groups.fetchAll();
      groups.value = deduplicateById(response.data || []);
      groupsLastSync.value = response.last_sync || new Date().toISOString();
      groupsInitialized = true;

      console.log(`✅ Loaded ${groups.value.length} groups`);
      return groups.value;
    } catch (err) {
      const errorMsg = extractApiErrors(err);
      groupsError.value = errorMsg;
      console.error('Error loading groups:', errorMsg);
      throw err;
    } finally {
      groupsLoading.value = false;
    }
  };

  // Load all data in parallel
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
    removeGroup
  };
};
