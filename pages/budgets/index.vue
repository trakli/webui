<template>
  <div>
    <ContentTopCard
      page-name="Budget"
      page-name-plural="Budgets"
      @add="handleOpenFormForCreation"
    />

    <div class="content-area">
      <div v-if="showForm" class="form-section">
        <div class="form-wrapper">
          <BudgetForm
            :editing-item="editingItem"
            :api-error="submitError"
            :is-submitting="isSubmitting"
            :defaults="formDefaults"
            @created="handleCreate"
            @updated="handleUpdate"
            @close="handleFormClose"
          />
        </div>
        <aside class="education-card" aria-label="How budgets work">
          <h3 class="education-card__title">
            <LightBulbIcon class="icon" />
            {{ t('How budgets work') }}
          </h3>

          <section>
            <h4>{{ t('Targets narrow the scope') }}</h4>
            <p>
              {{
                t(
                  'Leave targets empty and the budget tracks every transaction in the period — good for a total spending cap. Pick categories, groups, or wallets to limit the scope to those.'
                )
              }}
            </p>
          </section>

          <section>
            <h4>{{ t('Refunds reduce your spending') }}</h4>
            <p>
              {{
                t(
                  'When you record income, check "This is a refund" to subtract it from any budget covering the same categories, groups, or wallets. Unmarked income — salary, gifts — never changes a budget.'
                )
              }}
            </p>
          </section>

          <section>
            <h4>{{ t('Reminders fire automatically') }}</h4>
            <p>
              {{
                t(
                  'Cross your alert threshold and a reminder is created in your notifications. Forecast alerts warn you earlier when your pace is projected to breach the limit.'
                )
              }}
            </p>
          </section>

          <section>
            <h4>{{ t('Rollover vs reset') }}</h4>
            <p>
              {{
                t(
                  'With rollover, leftover or overage carries to the next period. Without it, each period starts fresh at the limit. Most people start without rollover.'
                )
              }}
            </p>
          </section>
        </aside>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner" />
        <p>{{ t('Loading budgets...') }}</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p>{{ t('Error:') }} {{ error }}</p>
        <button class="retry-button" @click="loadBudgets">{{ t('Try Again') }}</button>
      </div>

      <div v-else-if="!showForm" class="budgets-wrapper">
        <div v-if="budgets.length > 0" class="view-tabs" role="tablist">
          <button
            v-for="tab in viewTabs"
            :key="tab.key"
            type="button"
            class="view-tab"
            :class="{ 'view-tab--active': view === tab.key }"
            role="tab"
            :aria-selected="view === tab.key"
            @click="view = tab.key"
          >
            {{ t(tab.label) }}
          </button>
        </div>

        <OnboardingEmptyState
          v-if="filteredBudgets.length === 0 && budgets.length === 0"
          page-type="budgets"
          @create="handleOpenFormForCreation"
        />

        <div v-else-if="filteredBudgets.length === 0" class="no-matches">
          <p>{{ t('No budgets match the current filter.') }}</p>
        </div>

        <div v-else class="budget-grid">
          <BudgetCard
            v-for="budget in filteredBudgets"
            :key="budget.id"
            :budget="budget"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { LightBulbIcon } from '@heroicons/vue/24/outline';
import ContentTopCard from '@/components/TTopCard.vue';
import BudgetForm from '@/components/budgets/BudgetForm.vue';
import BudgetCard from '@/components/budgets/BudgetCard.vue';
import OnboardingEmptyState from '@/components/onboarding/OnboardingEmptyState.vue';
import { useBudgets } from '@/composables/useBudgets';
import { useNotifications } from '@/composables/useNotifications';
import { useSharedData } from '@/composables/useSharedData';
import { CONFIGURATION_KEYS } from '@/utils/configurationKeys';
import type { Budget, BudgetPeriodType } from '~/types/budget';
import { extractApiErrors } from '@/utils/apiErrors';

const { t } = useI18n();
const route = useRoute();

const showForm = ref(false);
const editingItem = ref<Budget | null>(null);
const isSubmitting = ref(false);
const submitError = ref('');

const { budgets, isLoading, error, fetchBudgets, createBudget, updateBudget, deleteBudget } =
  useBudgets();
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

// `scope` comes from the sidebar subnav and filters by state
// (all / active / archived). `view` lives in page state and filters by
// target type (all / category / wallet / group). They compose.
const scope = computed(() => (route.query.scope as string) || 'all');

type BudgetView = 'all' | 'category' | 'wallet' | 'group';
const view = ref<BudgetView>('all');

const viewTabs: Array<{ key: BudgetView; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'category', label: 'By Category' },
  { key: 'wallet', label: 'By Wallet' },
  { key: 'group', label: 'By Group' }
];

const filteredBudgets = computed(() => {
  let list = budgets.value;

  switch (scope.value) {
    case 'active':
      list = list.filter((b) => b.is_active);
      break;
    case 'archived':
      list = list.filter((b) => !b.is_active);
      break;
  }

  if (view.value !== 'all') {
    list = list.filter((b) => b.targets?.some((t) => t.type === view.value));
  }

  return list;
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
  // Kick off the budgets fetch synchronously so `isLoading` flips before
  // the first render — otherwise `loadRelated` suspends and the page
  // briefly renders the empty state on a hard refresh.
  const budgetsPromise = loadBudgets();
  await loadRelated();
  await budgetsPromise;
});

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables' as *;

.content-area {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.form-section {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 720px) minmax(0, 320px);
  gap: 1.5rem;
  align-items: start;

  @media (max-width: $breakpoint-lg) {
    grid-template-columns: 1fr;
  }
}

.form-wrapper {
  min-width: 0;
}

.education-card {
  background: $bg-slate;
  border: 1px solid $border-color;
  border-radius: $radius-xl;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: calc(#{$navbar-height} + 1rem);

  @media (max-width: $breakpoint-md) {
    padding: 1rem;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: $font-size-base;
    font-weight: $font-semibold;
    color: $text-primary;
    margin: 0;

    .icon {
      width: 18px;
      height: 18px;
      color: $primary;
    }
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  h4 {
    margin: 0;
    font-size: $font-size-sm;
    font-weight: $font-semibold;
    color: $text-primary;
  }

  p {
    margin: 0;
    font-size: $font-size-xs;
    line-height: 1.5;
    color: $text-secondary;
  }

  @media (max-width: $breakpoint-lg) {
    position: static;
  }
}

.view-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: $bg-slate;
  border: 1px solid $border-color;
  border-radius: $radius-xl;
  width: fit-content;
  margin-bottom: 1rem;

  @media (max-width: $breakpoint-sm) {
    width: 100%;
    overflow-x: auto;
  }
}

.view-tab {
  background: transparent;
  border: none;
  padding: 6px 14px;
  border-radius: $radius-lg;
  font-size: $font-size-sm;
  font-weight: $font-medium;
  color: $text-secondary;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;

  &:hover:not(.view-tab--active) {
    color: $primary;
  }

  &--active {
    background: $bg-white;
    color: $primary;
    box-shadow: var(--shadow-sm);
  }
}

.no-matches {
  padding: 3rem 1rem;
  text-align: center;
  color: $text-muted;
}

.budget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;

  @media (max-width: $breakpoint-md) {
    grid-template-columns: 1fr;
  }
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  color: $text-secondary;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid $bg-light;
  border-top: 4px solid $primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: $text-secondary;

  p {
    margin-bottom: 1rem;
  }
}

.retry-button,
.btn-primary {
  background: $primary;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: $radius-lg;
  cursor: pointer;
  font-weight: $font-medium;

  &:hover {
    background: $primary-hover;
  }
}

.error-state p {
  color: $error-color;
}
</style>
