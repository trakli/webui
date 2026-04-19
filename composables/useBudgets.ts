import { computed, ref } from 'vue';
import { api } from '~/services/api';
import type { Budget, BudgetCreatePayload, BudgetUpdatePayload } from '~/types/budget';

const budgets = ref<Budget[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

export const useBudgets = () => {
  const fetchBudgets = async (forceReload = false) => {
    if (!forceReload && budgets.value.length > 0) return budgets.value;
    isLoading.value = true;
    error.value = null;
    try {
      const response = await api.budgets.fetchAll();
      budgets.value = response.data ?? [];
      return budgets.value;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load budgets';
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  const createBudget = async (payload: BudgetCreatePayload): Promise<Budget> => {
    const created = await api.budgets.create(payload);
    budgets.value = [created, ...budgets.value];
    return created;
  };

  const updateBudget = async (id: number, payload: BudgetUpdatePayload): Promise<Budget> => {
    const updated = await api.budgets.update(id, payload);
    const idx = budgets.value.findIndex((b) => b.id === id);
    if (idx >= 0) budgets.value[idx] = updated;
    return updated;
  };

  const deleteBudget = async (id: number): Promise<boolean> => {
    const ok = await api.budgets.delete(id);
    if (ok) budgets.value = budgets.value.filter((b) => b.id !== id);
    return ok;
  };

  const activeBudgets = computed(() => budgets.value.filter((b) => b.is_active));

  return {
    budgets,
    activeBudgets,
    isLoading,
    error,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget
  };
};
