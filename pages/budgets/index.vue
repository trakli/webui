<template>
  <SpaceBudgets v-if="isShared" />
  <LedgerBudgets
    v-else
    :budgets="budgets"
    :form-open="showForm"
    :form-title="editingItem ? t('Edit budget') : t('New budget')"
    @create="handleOpenFormForCreation"
    @edit="handleEdit"
    @delete="handleDelete"
  >
    <template #form>
      <BudgetForm
        :editing-item="editingItem"
        :api-error="submitError"
        :is-submitting="isSubmitting"
        :defaults="formDefaults"
        @created="handleCreate"
        @updated="handleUpdate"
        @close="handleFormClose"
      />
    </template>
    <template #empty>
      <OnboardingEmptyState page-type="budgets" @create="handleOpenFormForCreation" />
    </template>
  </LedgerBudgets>
</template>

<script setup lang="ts">
import SpaceBudgets from '@/components/space/SpaceBudgets.vue';
import LedgerBudgets from '@/components/ledger/budgets/LedgerBudgets.vue';
import { ref, computed, onMounted } from 'vue';
import BudgetForm from '@/components/budgets/BudgetForm.vue';
import OnboardingEmptyState from '@/components/onboarding/OnboardingEmptyState.vue';
import { useBudgets } from '@/composables/useBudgets';
import { useNotifications } from '@/composables/useNotifications';
import { useSharedData } from '@/composables/useSharedData';
import { CONFIGURATION_KEYS } from '@/utils/configurationKeys';
import type { Budget, BudgetPeriodType } from '~/types/budget';
import { extractApiErrors } from '@/utils/apiErrors';

const { isShared } = useActiveSpace();

const { t } = useI18n();

const showForm = ref(false);
const editingItem = ref<Budget | null>(null);
const isSubmitting = ref(false);
const submitError = ref('');

const { budgets, fetchBudgets, createBudget, updateBudget, deleteBudget } = useBudgets();
const { showSuccess, showError, confirmDelete } = useNotifications();
const shared = useSharedData();

const formDefaults = computed(() => {
  const readConfig = (key: string) => {
    const map = shared.configurationsMap?.value as Record<string, unknown> | undefined;
    return map?.[key];
  };

  const threshold = Number(readConfig(CONFIGURATION_KEYS.BUDGET_DEFAULT_THRESHOLD));
  const rollover = readConfig(CONFIGURATION_KEYS.BUDGET_DEFAULT_ROLLOVER);
  const period = readConfig(CONFIGURATION_KEYS.BUDGET_DEFAULT_PERIOD);
  const forecast = readConfig(CONFIGURATION_KEYS.BUDGET_FORECAST_DEFAULT);
  const currency = readConfig(CONFIGURATION_KEYS.CURRENCY);

  return {
    threshold: Number.isFinite(threshold) && threshold > 0 ? threshold : 80,
    rollover: Boolean(rollover),
    period: (typeof period === 'string' ? period : 'monthly') as BudgetPeriodType,
    forecast: forecast === undefined ? true : Boolean(forecast),
    currency: typeof currency === 'string' && currency.length === 3 ? currency : 'USD'
  };
});

async function loadBudgets() {
  try {
    await fetchBudgets(true);
  } catch (err) {
    console.error('Failed to load budgets:', err);
  }
}

async function loadRelated() {
  await Promise.all([
    shared.loadCategories?.(),
    shared.loadGroups?.(),
    shared.loadWallets?.(),
    shared.loadConfigurations?.()
  ]);
}

function handleOpenFormForCreation() {
  editingItem.value = null;
  submitError.value = '';
  showForm.value = true;
}

function handleFormClose() {
  submitError.value = '';
  showForm.value = false;
  editingItem.value = null;
}

async function handleCreate(payload: any) {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  submitError.value = '';
  try {
    const created = await createBudget(payload);
    showSuccess(t('Budget created'), t('{name} budget has been created', { name: created.name }));
    handleFormClose();
  } catch (err) {
    submitError.value = extractApiErrors(err);
    showError(t('Error'), submitError.value || t('Failed to create budget'));
  } finally {
    isSubmitting.value = false;
  }
}

async function handleUpdate(payload: any) {
  if (isSubmitting.value || !payload.id) return;
  isSubmitting.value = true;
  submitError.value = '';
  try {
    const { id, ...rest } = payload;
    await updateBudget(id, rest);
    showSuccess(t('Budget updated'), t('Changes saved'));
    handleFormClose();
  } catch (err) {
    submitError.value = extractApiErrors(err);
    showError(t('Error'), submitError.value || t('Failed to update budget'));
  } finally {
    isSubmitting.value = false;
  }
}

function handleEdit(budget: Budget) {
  editingItem.value = budget;
  submitError.value = '';
  showForm.value = true;
}

async function handleDelete(budget: Budget) {
  const confirmed = await confirmDelete('budget');
  if (!confirmed) return;
  try {
    await deleteBudget(budget.id);
    showSuccess(t('Budget deleted'), t('{name} budget has been deleted', { name: budget.name }));
  } catch (err) {
    showError(t('Delete failed'), t('Failed to delete budget'));
    console.error(err);
  }
}

onMounted(async () => {
  // Kick off the budgets fetch synchronously so `isLoading` flips before the first
  // render. Otherwise `loadRelated` suspends and a hard refresh briefly shows the
  // empty state.
  const budgetsPromise = loadBudgets();
  await loadRelated();
  await budgetsPromise;
});

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  ledgerFrame: true
});
</script>
