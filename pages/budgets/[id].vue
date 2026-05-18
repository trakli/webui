<template>
  <div class="detail-page">
    <div class="back-row">
      <NuxtLink to="/budgets" class="back-link">
        <ArrowLeftIcon class="icon" />
        {{ t('Back to budgets') }}
      </NuxtLink>
    </div>

    <div v-if="isLoading" class="state-block">
      <div class="spinner" />
      <p>{{ t('Loading budget...') }}</p>
    </div>

    <div v-else-if="error" class="state-block">
      <p class="error">{{ error }}</p>
      <NuxtLink to="/budgets" class="link">{{ t('Back to budgets') }}</NuxtLink>
    </div>

    <template v-else-if="budget">
      <header class="summary-card" :class="`summary-card--${statusClass}`">
        <div class="summary-top">
          <div class="summary-title">
            <div class="summary-title-row">
              <h1>{{ budget.name }}</h1>
              <span class="status-chip" :class="`status-chip--${statusClass}`">
                {{ t(statusLabel) }}
              </span>
            </div>
            <p v-if="budget.description" class="description">{{ budget.description }}</p>
            <div class="meta-line">
              <span class="meta-item">
                <CalendarIcon class="icon-inline" />
                {{ formatPeriod(budget) }}
              </span>
              <span v-if="!targetGroups.length" class="meta-item scope-pill scope-pill--all">
                <GlobeAltIcon class="icon-inline" />
                {{ t('All transactions in period') }}
              </span>
              <template v-else>
                <span
                  v-for="group in targetGroups"
                  :key="group.type"
                  class="meta-item scope-pill"
                  :class="`scope-pill--${group.type}`"
                >
                  <component :is="group.icon" class="icon-inline" />
                  {{ summaryFor(group.items) }}
                </span>
              </template>
            </div>
          </div>
          <div class="action-buttons">
            <button type="button" class="btn btn--ghost" @click="handleEdit">
              <PencilIcon class="icon" />
              {{ t('Edit') }}
            </button>
            <button type="button" class="btn btn--danger-ghost" @click="handleDelete">
              <TrashIcon class="icon" />
              {{ t('Delete') }}
            </button>
          </div>
        </div>

        <div class="big-progress">
          <div class="big-progress-bar">
            <div
              class="big-progress-fill"
              :class="`big-progress-fill--${statusClass}`"
              :style="{ width: Math.min(100, percentUsed) + '%' }"
            />
          </div>
          <div class="big-progress-row">
            <div class="spent-of">
              <strong>{{ formatMoney(netSpent) }}</strong>
              <span class="muted">{{ t('of') }} {{ formatMoney(effectiveLimit) }}</span>
            </div>
            <span class="big-percent">{{ Math.round(percentUsed) }}%</span>
          </div>
        </div>

        <div class="kpi-strip">
          <div class="kpi">
            <span class="kpi-label">{{ t('Remaining') }}</span>
            <strong :class="{ negative: remaining < 0 }">{{ formatMoney(remaining) }}</strong>
          </div>
          <div v-if="refunds > 0" class="kpi">
            <span class="kpi-label">{{ t('Refunds') }}</span>
            <strong>{{ formatMoney(refunds) }}</strong>
          </div>
          <div class="kpi">
            <span class="kpi-label">{{ t('Projected') }}</span>
            <strong :class="{ warning: projected > effectiveLimit }">
              {{ formatMoney(projected) }}
            </strong>
          </div>
          <div v-if="budget.rollover_enabled" class="kpi">
            <span class="kpi-label">{{ t('Rollover in') }}</span>
            <strong>{{ formatMoney(rolloverIn) }}</strong>
          </div>
        </div>
      </header>

      <section class="transactions-section">
        <div class="section-head">
          <h2 class="section-title">{{ t('Transactions this period') }}</h2>
          <span v-if="periodWindow" class="muted">
            {{ periodWindow.period_start }} → {{ periodWindow.period_end }}
          </span>
        </div>

        <div v-if="transactionsLoading" class="state-block-inline">
          <div class="spinner" />
        </div>

        <div v-else-if="transactions.length === 0" class="state-block-inline">
          <p class="muted">{{ t('No transactions counted toward this budget yet.') }}</p>
        </div>

        <ul v-else class="txn-list">
          <li v-for="txn in transactions" :key="txn.id" class="txn-row">
            <div class="txn-meta">
              <span class="txn-type" :class="`txn-type--${txn.type}`">
                {{ txn.type === 'income' ? '+' : '−' }}
              </span>
              <div class="txn-info">
                <div class="txn-desc-row">
                  <strong class="txn-desc">
                    {{ txn.description || t('Untitled transaction') }}
                  </strong>
                  <span v-if="txn.is_refund" class="refund-badge" :title="t('Marked as refund')">
                    <ArrowUturnLeftIcon class="icon" />
                    {{ t('Refund') }}
                  </span>
                </div>
                <span class="txn-sub">
                  {{ formatDate(txn.datetime) }}
                  <template v-if="txn.wallet?.name"> · {{ txn.wallet.name }}</template>
                </span>
              </div>
            </div>
            <strong class="txn-amount" :class="`txn-amount--${txn.type}`">
              {{ formatMoney(Number(txn.amount)) }}
            </strong>
          </li>
        </ul>
      </section>
    </template>

    <div v-if="showEditForm && budget" class="edit-overlay" @click.self="showEditForm = false">
      <div class="edit-wrapper">
        <BudgetForm
          :editing-item="budget"
          :is-submitting="isSubmitting"
          :api-error="submitError"
          :defaults="formDefaults"
          @updated="handleUpdate"
          @close="showEditForm = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeftIcon,
  ArrowUturnLeftIcon,
  CalendarIcon,
  FolderIcon,
  GlobeAltIcon,
  PencilIcon,
  TagIcon,
  TrashIcon,
  WalletIcon
} from '@heroicons/vue/24/outline';
import BudgetForm from '@/components/budgets/BudgetForm.vue';
import { api } from '@/services/api';
import { useNotifications } from '@/composables/useNotifications';
import { useSharedData } from '@/composables/useSharedData';
import { CONFIGURATION_KEYS } from '@/utils/configurationKeys';
import { extractApiErrors } from '@/utils/apiErrors';
import type { Budget, BudgetPeriodType } from '~/types/budget';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const shared = useSharedData();
const { showSuccess, showError, confirmDelete } = useNotifications();

const budget = ref<Budget | null>(null);
const transactions = ref<any[]>([]);
const periodWindow = ref<{ period_start: string; period_end: string } | null>(null);
const isLoading = ref(true);
const transactionsLoading = ref(true);
const error = ref('');

const showEditForm = ref(false);
const isSubmitting = ref(false);
const submitError = ref('');

const budgetId = computed(() => Number(route.params.id));

async function loadBudget() {
  isLoading.value = true;
  error.value = '';
  try {
    const result = await api.budgets.fetchById(budgetId.value);
    if (!result) {
      error.value = t('Budget not found');
      return;
    }
    budget.value = result;
  } catch (e) {
    error.value = extractApiErrors(e) || t('Failed to load budget');
  } finally {
    isLoading.value = false;
  }
}

async function loadTransactions() {
  transactionsLoading.value = true;
  try {
    const result = await api.budgets.fetchTransactions(budgetId.value);
    if (result) {
      transactions.value = result.data ?? [];
      periodWindow.value = { period_start: result.period_start, period_end: result.period_end };
    }
  } catch (e) {
    console.error('Failed to load transactions', e);
  } finally {
    transactionsLoading.value = false;
  }
}

const progress = computed(() => budget.value?.progress);
const percentUsed = computed(() => progress.value?.percent_used ?? 0);
const netSpent = computed(() => Number(progress.value?.net_spent ?? 0));
const refunds = computed(() => Number(progress.value?.refunds ?? 0));
const rolloverIn = computed(() => Number(progress.value?.rollover_in ?? 0));
const projected = computed(() => Number(progress.value?.projected_spend ?? 0));
const effectiveLimit = computed(() =>
  Number(progress.value?.effective_limit ?? Number(budget.value?.amount ?? 0))
);
const remaining = computed(() => Number(progress.value?.remaining ?? effectiveLimit.value));

const statusClass = computed(() => {
  const s = progress.value?.status;
  if (s === 'over_budget') return 'over';
  if (s === 'forecast_breach') return 'forecast';
  if (s === 'near_limit') return 'near';
  return 'ok';
});

const statusLabel = computed(() => {
  switch (statusClass.value) {
    case 'over':
      return 'Over Budget';
    case 'forecast':
      return 'Forecast: Will Breach';
    case 'near':
      return 'Near Limit';
    default:
      return 'On Track';
  }
});

const targetGroups = computed(() => {
  if (!budget.value?.targets?.length) return [];
  const cats = budget.value.targets.filter((t) => t.type === 'category');
  const grps = budget.value.targets.filter((t) => t.type === 'group');
  const wals = budget.value.targets.filter((t) => t.type === 'wallet');
  const out: Array<{ type: string; label: string; icon: any; items: any[] }> = [];
  if (cats.length) out.push({ type: 'category', label: 'Categories', icon: TagIcon, items: cats });
  if (grps.length) out.push({ type: 'group', label: 'Groups', icon: FolderIcon, items: grps });
  if (wals.length) out.push({ type: 'wallet', label: 'Wallets', icon: WalletIcon, items: wals });
  return out;
});

const summaryFor = (items: Array<{ name?: string }>) => {
  if (items.length === 0) return '';
  const names = items.map((i) => i.name ?? '').filter(Boolean);
  if (items.length <= 3) return names.join(', ');
  return `${names.slice(0, 3).join(', ')} +${items.length - 3}`;
};

const formatMoney = (value: number) => {
  const ccy = budget.value?.currency || 'USD';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: ccy }).format(value);
  } catch {
    return `${ccy} ${value.toFixed(2)}`;
  }
};

const formatPeriod = (b: Budget) => {
  if (b.period_type === 'custom') {
    return `${b.start_date} → ${b.end_date ?? ''}`;
  }
  const label = b.period_type.charAt(0).toUpperCase() + b.period_type.slice(1);
  return `${t(label)} · ${progress.value?.period_start ?? b.start_date}`;
};

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString();
};

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

function handleEdit() {
  submitError.value = '';
  showEditForm.value = true;
}

async function handleUpdate(payload: any) {
  if (!budget.value || isSubmitting.value) return;
  isSubmitting.value = true;
  submitError.value = '';
  try {
    const { id, ...rest } = payload;
    const updated = await api.budgets.update(budget.value.id, rest);
    budget.value = updated;
    showSuccess(t('Budget updated'), t('Changes saved'));
    showEditForm.value = false;
    await loadTransactions();
  } catch (e) {
    submitError.value = extractApiErrors(e);
    showError(t('Error'), submitError.value || t('Failed to update budget'));
  } finally {
    isSubmitting.value = false;
  }
}

async function handleDelete() {
  if (!budget.value) return;
  const confirmed = await confirmDelete('budget');
  if (!confirmed) return;
  try {
    await api.budgets.delete(budget.value.id);
    showSuccess(
      t('Budget deleted'),
      t('{name} budget has been deleted', { name: budget.value.name })
    );
    router.push('/budgets');
  } catch {
    showError(t('Delete failed'), t('Failed to delete budget'));
  }
}

onMounted(async () => {
  await Promise.all([
    shared.loadCategories?.(),
    shared.loadGroups?.(),
    shared.loadWallets?.(),
    shared.loadConfigurations?.()
  ]);
  await Promise.all([loadBudget(), loadTransactions()]);
});

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables' as *;

.detail-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  color: $text-primary;
}

.back-row {
  display: flex;
  align-items: center;
}

.back-link,
.link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: $font-size-sm;
  color: $text-muted;
  text-decoration: none;

  .icon {
    width: 14px;
    height: 14px;
  }

  &:hover {
    color: $primary;
  }
}

.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 3rem 1rem;
  text-align: center;

  .error {
    color: $error-color;
  }
}

.state-block-inline {
  display: flex;
  justify-content: center;
  padding: 1.5rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid $bg-light;
  border-top-color: $primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.summary-card {
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: 14px;
  box-shadow: $elevation-1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  @media (max-width: $breakpoint-md) {
    padding: 1rem;
    gap: 1rem;
  }

  &--near {
    border-color: rgba(var(--color-warning-rgb), 0.5);
  }
  &--forecast {
    border-color: rgba(var(--color-warning-rgb), 0.6);
  }
  &--over {
    border-color: rgba(var(--color-error-rgb), 0.5);
  }
}

.summary-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.summary-title {
  min-width: 0;
  flex: 1 1 auto;
}

.summary-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  h1 {
    margin: 0;
    font-size: 1.5rem;
    line-height: 1.2;

    @media (max-width: $breakpoint-sm) {
      font-size: 1.25rem;
    }
  }
}

.description {
  margin: 6px 0 0;
  font-size: $font-size-sm;
  color: $text-muted;
}

.meta-line {
  margin: 10px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: $font-size-xs;
  font-weight: $font-medium;
  color: $text-secondary;
  padding: 3px 10px;
  border-radius: 999px;
  background: $bg-slate;
  border: 1px solid $border-color;
}

.scope-pill {
  border: 1px solid transparent;

  &--all {
    background: rgba(var(--color-primary-rgb), 0.06);
    border-color: $border-color;
  }

  &--category {
    background: rgba(var(--color-info-rgb), 0.1);
    color: var(--color-info);
    border-color: rgba(var(--color-info-rgb), 0.2);
  }
  &--group {
    background: rgba(var(--color-warning-rgb), 0.15);
    color: var(--color-warning-text);
    border-color: rgba(var(--color-warning-rgb), 0.3);
  }
  &--wallet {
    background: rgba(var(--color-primary-rgb), 0.1);
    color: $primary;
    border-color: rgba(var(--color-primary-rgb), 0.2);
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-shrink: 0;

  @media (max-width: $breakpoint-sm) {
    width: 100%;
    justify-content: flex-end;
  }
}

.status-chip {
  font-size: $font-size-sm;
  padding: 4px 12px;
  border-radius: 999px;
  font-weight: $font-medium;
  white-space: nowrap;

  &--ok {
    background: rgba(var(--color-success-rgb), 0.15);
    color: var(--color-success);
  }
  &--near {
    background: rgba(var(--color-warning-rgb), 0.2);
    color: var(--color-warning-text);
  }
  &--forecast {
    background: rgba(var(--color-warning-rgb), 0.25);
    color: var(--color-warning-text);
  }
  &--over {
    background: rgba(var(--color-error-rgb), 0.15);
    color: var(--color-error);
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: $radius-md;
  padding: 6px 12px;
  font-size: $font-size-sm;
  font-weight: $font-medium;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;

  .icon {
    width: 16px;
    height: 16px;
  }

  &--ghost {
    background: transparent;
    border-color: $border-color;
    color: $text-secondary;

    &:hover {
      background: rgba(var(--color-primary-rgb), 0.08);
      color: $primary;
      border-color: $primary-muted;
    }
  }

  &--danger-ghost {
    background: transparent;
    border-color: $border-color;
    color: $text-secondary;

    &:hover {
      background: rgba(var(--color-error-rgb), 0.08);
      color: var(--color-error);
      border-color: var(--color-error);
    }
  }
}

.big-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.big-progress-bar {
  background: $bg-slate;
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
}

.big-progress-fill {
  height: 100%;
  transition: width 0.3s ease;

  &--ok {
    background: var(--color-success);
  }
  &--near {
    background: var(--color-warning);
  }
  &--forecast {
    background: var(--color-warning);
  }
  &--over {
    background: var(--color-error);
  }
}

.big-progress-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: $font-size-sm;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.spent-of {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;

  strong {
    font-size: $font-size-lg;
  }

  .muted {
    font-size: $font-size-sm;
    color: $text-muted;
  }
}

.big-percent {
  font-size: $font-size-xl;
  font-weight: $font-semibold;
  color: $primary;
}

.kpi-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid $border-color;

  @media (max-width: $breakpoint-sm) {
    gap: 1rem;
  }
}

.kpi {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 110px;
}

.kpi-label {
  font-size: $font-size-xs;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.kpi strong {
  font-size: $font-size-base;

  &.negative {
    color: var(--color-error);
  }

  &.warning {
    color: var(--color-warning-text);
  }
}

.section-title {
  font-size: $font-size-lg;
  font-weight: $font-semibold;
  margin: 0 0 0.75rem;
  color: $text-primary;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.75rem;

  .section-title {
    margin: 0;
  }
}

.muted {
  color: $text-muted;
  font-size: $font-size-sm;
}

.transactions-section {
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: $radius-xl;
  padding: 1.25rem;

  @media (max-width: $breakpoint-sm) {
    padding: 0.875rem 1rem;
  }
}

.txn-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.txn-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 2px;
  border-bottom: 1px solid $border-color;
  gap: 12px;

  &:last-child {
    border-bottom: none;
  }
}

.txn-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.txn-type {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: $font-bold;
  flex-shrink: 0;

  &--expense {
    background: rgba(var(--color-error-rgb), 0.12);
    color: var(--color-error);
  }

  &--income {
    background: rgba(var(--color-success-rgb), 0.12);
    color: var(--color-success);
  }
}

.txn-info {
  display: flex;
  flex-direction: column;
  min-width: 0;

  .txn-desc-row {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .txn-desc {
    font-size: $font-size-sm;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  .txn-sub {
    font-size: $font-size-xs;
    color: $text-muted;
  }
}

.refund-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: $font-semibold;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-info);
  background: rgba(var(--color-info-rgb), 0.12);
  border: 1px solid rgba(var(--color-info-rgb), 0.25);
  padding: 1px 6px;
  border-radius: 999px;
  flex-shrink: 0;

  .icon {
    width: 10px;
    height: 10px;
  }
}

.txn-amount {
  font-size: $font-size-sm;
  white-space: nowrap;

  &--expense {
    color: var(--color-error);
  }

  &--income {
    color: var(--color-success);
  }
}

.edit-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: $z-index-modal;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;

  @media (max-width: $breakpoint-sm) {
    padding: 0.5rem;
  }
}

.edit-wrapper {
  width: 100%;
  max-width: 720px;
}

.icon-inline {
  width: 14px;
  height: 14px;
}
</style>
