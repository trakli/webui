<template>
  <NuxtLink
    :to="`/budgets/${budget.id}`"
    class="budget-card"
    :class="`budget-card--${statusClass}`"
  >
    <header class="budget-card__head">
      <div class="budget-card__title">
        <h3 class="budget-card__name">{{ budget.name }}</h3>
        <p class="budget-card__period">{{ formatPeriod(budget) }}</p>
      </div>
      <div class="budget-card__head-actions">
        <span class="status-chip" :class="`status-chip--${statusClass}`">
          {{ t(statusLabel) }}
        </span>
        <div class="icon-actions">
          <button
            type="button"
            class="icon-btn"
            :aria-label="t('Edit')"
            :title="t('Edit')"
            @click.stop.prevent="$emit('edit', budget)"
          >
            <PencilIcon class="icon" />
          </button>
          <button
            type="button"
            class="icon-btn icon-btn--danger"
            :aria-label="t('Delete')"
            :title="t('Delete')"
            @click.stop.prevent="$emit('delete', budget)"
          >
            <TrashIcon class="icon" />
          </button>
        </div>
      </div>
    </header>

    <div class="scope-line">
      <span v-if="!hasAnyTargets" class="scope-pill scope-pill--all">
        <GlobeAltIcon class="icon" />
        {{ t('All transactions in period') }}
      </span>
      <template v-else>
        <span v-if="categories.length" class="scope-pill scope-pill--category">
          <TagIcon class="icon" />
          {{ summaryFor('category', categories) }}
        </span>
        <span v-if="groups.length" class="scope-pill scope-pill--group">
          <FolderIcon class="icon" />
          {{ summaryFor('group', groups) }}
        </span>
        <span v-if="wallets.length" class="scope-pill scope-pill--wallet">
          <WalletIcon class="icon" />
          {{ summaryFor('wallet', wallets) }}
        </span>
      </template>
    </div>

    <div class="progress">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :class="`progress-fill--${statusClass}`"
          :style="{ width: Math.min(100, percentUsed) + '%' }"
        />
      </div>
      <div class="progress-meta">
        <span>
          <strong>{{ formatMoney(netSpent) }}</strong>
          {{ t('of') }} {{ formatMoney(effectiveLimit) }}
        </span>
        <span class="percent">{{ Math.round(percentUsed) }}%</span>
      </div>
    </div>

    <footer class="budget-card__footer">
      <div class="footer-left">
        <span class="remaining-label">{{ t('Remaining') }}</span>
        <strong class="remaining-value" :class="{ negative: remaining < 0 }">
          {{ formatMoney(remaining) }}
        </strong>
      </div>
      <div v-if="refunds > 0" class="footer-right" :title="t('Refunds applied this period')">
        <ArrowUturnLeftIcon class="icon" />
        <span>{{ formatMoney(refunds) }}</span>
      </div>
    </footer>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  ArrowUturnLeftIcon,
  FolderIcon,
  GlobeAltIcon,
  PencilIcon,
  TagIcon,
  TrashIcon,
  WalletIcon
} from '@heroicons/vue/24/outline';
import type { Budget, BudgetTarget } from '~/types/budget';

const props = defineProps<{ budget: Budget }>();
defineEmits<{
  (e: 'edit' | 'delete', budget: Budget): void;
}>();

const { t } = useI18n();

const targets = computed<BudgetTarget[]>(() => props.budget.targets ?? []);
const categories = computed(() => targets.value.filter((t) => t.type === 'category'));
const groups = computed(() => targets.value.filter((t) => t.type === 'group'));
const wallets = computed(() => targets.value.filter((t) => t.type === 'wallet'));
const hasAnyTargets = computed(() => targets.value.length > 0);

const summaryFor = (type: 'category' | 'group' | 'wallet', items: BudgetTarget[]) => {
  const first = items[0]?.name ?? '';
  if (items.length === 1) return first;
  if (items.length === 2) return `${first}, ${items[1].name}`;
  return `${first} +${items.length - 1}`;
};

const progress = computed(() => props.budget.progress);
const percentUsed = computed(() => progress.value?.percent_used ?? 0);
const netSpent = computed(() => Number(progress.value?.net_spent ?? 0));
const effectiveLimit = computed(() =>
  Number(progress.value?.effective_limit ?? Number(props.budget.amount))
);
const remaining = computed(() => Number(progress.value?.remaining ?? effectiveLimit.value));
const refunds = computed(() => Number(progress.value?.refunds ?? 0));

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

const formatMoney = (value: number) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: props.budget.currency || 'USD'
    }).format(value);
  } catch {
    return `${props.budget.currency || ''} ${value.toFixed(2)}`;
  }
};

const formatPeriod = (b: Budget) => {
  if (b.period_type === 'custom') {
    return `${b.start_date} → ${b.end_date ?? ''}`;
  }
  const label = b.period_type.charAt(0).toUpperCase() + b.period_type.slice(1);
  return `${t(label)} · ${progress.value?.period_start ?? b.start_date}`;
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.budget-card {
  background: $bg-white;
  color: $text-primary;
  text-decoration: none;
  border: 1px solid $border-light;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  cursor: pointer;
  box-shadow: $elevation-1;

  @media (max-width: $breakpoint-sm) {
    padding: 0.875rem 1rem;
  }
  transition:
    border-color $duration-fast $easing-standard,
    box-shadow $duration-base $easing-standard;

  &:hover {
    border-color: $border-medium;
    box-shadow: $elevation-2;
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: 2px;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;

    @media (max-width: $breakpoint-sm) {
      flex-wrap: wrap;
    }
  }

  &__title {
    min-width: 0;
    flex: 1 1 160px;
  }

  &__name {
    margin: 0;
    font-size: $font-size-lg;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-base;
    }
  }

  &__period {
    margin: 2px 0 0;
    font-size: $font-size-xs;
    color: $text-muted;
  }

  &__head-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;

    @media (max-width: $breakpoint-sm) {
      flex-direction: row;
      align-items: center;
      flex-wrap: wrap;
      width: 100%;
      justify-content: space-between;
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid $border-color;
  }
}

.footer-left {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.footer-right {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: $font-size-xs;
  font-weight: $font-medium;
  color: var(--color-info);
  background: rgba(var(--color-info-rgb), 0.1);
  border: 1px solid rgba(var(--color-info-rgb), 0.2);
  padding: 2px 8px;
  border-radius: 999px;

  .icon {
    width: 12px;
    height: 12px;
  }
}

.icon-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  background: transparent;
  border: 1px solid transparent;
  color: $text-muted;
  border-radius: $radius-md;
  padding: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  .icon {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: rgba(var(--color-primary-rgb), 0.1);
    color: $primary;
    border-color: $primary-muted;
  }

  &--danger:hover {
    background: rgba(var(--color-error-rgb), 0.1);
    color: var(--color-error);
    border-color: var(--color-error);
  }
}

.status-chip {
  font-size: $font-size-xs;
  padding: 2px 8px;
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

.scope-line {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 26px;
}

.scope-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: $font-size-xs;
  font-weight: $font-medium;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .icon {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }

  &--all {
    background: rgba(var(--color-primary-rgb), 0.06);
    color: $text-secondary;
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

.progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-bar {
  background: $bg-slate;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
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

.progress-meta {
  display: flex;
  justify-content: space-between;
  font-size: $font-size-sm;
  color: $text-secondary;

  .percent {
    font-weight: $font-semibold;
  }
}

.remaining-label {
  font-size: $font-size-xs;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.remaining-value {
  font-size: $font-size-base;

  &.negative {
    color: var(--color-error);
  }
}
</style>
