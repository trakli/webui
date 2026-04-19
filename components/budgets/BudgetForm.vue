<template>
  <form class="budget-form" @submit.prevent="handleSubmit">
    <div class="form-header">
      <h2>{{ editingItem ? t('Edit Budget') : t('Create Budget') }}</h2>
      <button type="button" class="close-btn" @click="$emit('close')">&times;</button>
    </div>

    <div class="form-grid">
      <div class="field">
        <label>{{ t('Budget Name') }}</label>
        <input v-model="form.name" type="text" required maxlength="255" />
      </div>

      <div class="field">
        <label>{{ t('Spending Limit') }}</label>
        <div class="amount-row">
          <input v-model.number="form.amount" type="number" min="0" step="0.01" required />
          <select v-model="form.currency" class="currency">
            <option v-for="code in currencyOptions" :key="code" :value="code">{{ code }}</option>
          </select>
        </div>
        <p v-if="currencyOptions.length === 0" class="field-hint">
          {{ t('Add a wallet first to pick a currency.') }}
        </p>
      </div>

      <div class="field">
        <label>{{ t('Budget Period') }}</label>
        <select v-model="form.period_type">
          <option value="weekly">{{ t('Weekly') }}</option>
          <option value="monthly">{{ t('Monthly') }}</option>
          <option value="yearly">{{ t('Yearly') }}</option>
          <option value="custom">{{ t('Custom range') }}</option>
        </select>
      </div>

      <div class="field">
        <label>{{ t('Start date') }}</label>
        <input v-model="form.start_date" type="date" required />
      </div>

      <div v-if="form.period_type === 'custom'" class="field">
        <label>{{ t('End date') }}</label>
        <input v-model="form.end_date" type="date" required />
      </div>

      <div class="field field--full">
        <label>{{ t('Budget Description') }}</label>
        <textarea v-model="form.description" rows="2" maxlength="500" />
      </div>

      <div class="field field--full">
        <label>{{ t('Budget Targets') }}</label>
        <p class="field-hint">
          {{
            t(
              'Leave empty to cover every transaction in this period. Pick categories, groups, or wallets to narrow the scope.'
            )
          }}
        </p>
        <div class="target-tabs">
          <button
            v-for="tab in targetTabs"
            :key="tab.key"
            type="button"
            class="tab"
            :class="{ active: activeTargetTab === tab.key }"
            @click="activeTargetTab = tab.key"
          >
            {{ t(tab.label) }}
            <span class="count">{{ selectedCount(tab.key) }}</span>
          </button>
        </div>
        <div class="target-list">
          <label
            v-for="item in targetItems"
            :key="`${activeTargetTab}-${item.id}`"
            class="target-row"
          >
            <input
              type="checkbox"
              :checked="isSelected(activeTargetTab, item.id)"
              @change="toggleTarget(activeTargetTab, item.id)"
            />
            <span>{{ item.name }}</span>
          </label>
          <p v-if="targetItems.length === 0" class="empty-hint">
            {{ t('No items to choose from') }}
          </p>
        </div>
      </div>

      <div class="field">
        <label class="inline-toggle">
          <input v-model="form.rollover_enabled" type="checkbox" />
          <span>{{ t('Rollover unused amount') }}</span>
        </label>
        <p class="field-hint">
          {{ t('Leftover or overage carries forward to the next period.') }}
        </p>
      </div>

      <div class="field">
        <label>
          {{ t('Alert threshold') }}
          <template v-if="form.threshold_percent > 0">({{ form.threshold_percent }}%)</template>
          <template v-else>— {{ t('off') }}</template>
        </label>
        <input v-model.number="form.threshold_percent" type="range" min="0" max="100" step="5" />
        <p class="field-hint">
          {{ t('Sends a reminder when spending crosses this percent. Set to 0 to disable.') }}
        </p>
      </div>

      <div class="field">
        <label class="inline-toggle">
          <input v-model="form.forecast_alerts_enabled" type="checkbox" />
          <span>{{ t('Forecast alerts') }}</span>
        </label>
        <p class="field-hint">
          {{
            t('Sends a reminder when your spending pace projects to exceed the limit this period.')
          }}
        </p>
      </div>

      <div class="field">
        <label class="inline-toggle">
          <input v-model="form.is_active" type="checkbox" />
          <span>{{ t('Active') }}</span>
        </label>
      </div>
    </div>

    <p v-if="apiError" class="error-message">{{ apiError }}</p>

    <div class="actions">
      <button type="button" class="btn btn--ghost" @click="$emit('close')">
        {{ t('Cancel') }}
      </button>
      <button type="submit" class="btn btn--primary" :disabled="isSubmitting || !canSubmit">
        {{ editingItem ? t('Update Budget') : t('Create Budget') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { Budget, BudgetPeriodType, BudgetTargetType } from '~/types/budget';
import { useSharedData } from '~/composables/useSharedData';

const props = defineProps<{
  editingItem?: Budget | null;
  apiError?: string;
  isSubmitting?: boolean;
  defaults?: {
    threshold?: number;
    rollover?: boolean;
    period?: BudgetPeriodType;
    forecast?: boolean;
    currency?: string;
  };
}>();

const emit = defineEmits<{
  (e: 'created' | 'updated', payload: any): void;
  (e: 'close'): void;
}>();

const { t } = useI18n();
const shared = useSharedData();

const defaultCurrency = computed(() => props.defaults?.currency ?? 'USD');

// Backend serializes dates as ISO datetime (`2026-04-18T00:00:00Z`), but
// <input type="date"> needs a bare `YYYY-MM-DD` or it renders empty.
const toDateInput = (value: string): string => (value ? value.slice(0, 10) : '');

// Pull distinct currency codes from the user's wallets. If the user has
// no wallets yet, fall back to the configured default so the dropdown
// is never empty when there's a currency configured globally.
const currencyOptions = computed<string[]>(() => {
  const wallets = (shared.wallets?.value ?? []) as Array<{ currency?: string }>;
  const codes = new Set<string>();
  for (const w of wallets) {
    if (w.currency) codes.add(w.currency.toUpperCase());
  }
  if (codes.size === 0 && defaultCurrency.value) {
    codes.add(defaultCurrency.value.toUpperCase());
  }
  return Array.from(codes).sort();
});

const buildInitial = () => ({
  name: '',
  description: '',
  amount: 0,
  currency: defaultCurrency.value,
  period_type: (props.defaults?.period ?? 'monthly') as BudgetPeriodType,
  start_date: new Date().toISOString().slice(0, 10),
  end_date: null as string | null,
  rollover_enabled: props.defaults?.rollover ?? false,
  threshold_percent: props.defaults?.threshold ?? 80,
  forecast_alerts_enabled: props.defaults?.forecast ?? true,
  is_active: true,
  targets: [] as Array<{ type: BudgetTargetType; id: number }>
});

const form = reactive(buildInitial());

// Keep form.currency within the dropdown's options. When the default isn't
// available (e.g. user's configured default-currency has no wallet yet),
// fall back to the first option so the select always shows a real value.
watch(
  currencyOptions,
  (options) => {
    if (!props.editingItem && options.length > 0 && !options.includes(form.currency)) {
      form.currency = options[0];
    }
  },
  { immediate: true }
);

watch(
  () => props.editingItem,
  (item) => {
    if (!item) {
      Object.assign(form, buildInitial());
      if (currencyOptions.value.length > 0 && !currencyOptions.value.includes(form.currency)) {
        form.currency = currencyOptions.value[0];
      }
      return;
    }
    form.name = item.name;
    form.description = item.description ?? '';
    form.amount = Number(item.amount);
    form.currency = item.currency;
    form.period_type = item.period_type;
    form.start_date = toDateInput(item.start_date);
    form.end_date = item.end_date ? toDateInput(item.end_date) : null;
    form.rollover_enabled = item.rollover_enabled;
    form.threshold_percent = item.threshold_percent;
    form.forecast_alerts_enabled = item.forecast_alerts_enabled;
    form.is_active = item.is_active;
    form.targets = (item.targets ?? []).map((tgt) => ({ type: tgt.type, id: tgt.id }));
  },
  { immediate: true }
);

const targetTabs: Array<{ key: BudgetTargetType; label: string }> = [
  { key: 'category', label: 'Categories' },
  { key: 'group', label: 'Groups' },
  { key: 'wallet', label: 'Wallets' }
];

const activeTargetTab = ref<BudgetTargetType>('category');

const targetItems = computed(() => {
  switch (activeTargetTab.value) {
    case 'category':
      return (shared.categories?.value ?? []).map((c: any) => ({ id: c.id, name: c.name }));
    case 'group':
      return (shared.groups?.value ?? []).map((g: any) => ({ id: g.id, name: g.name }));
    case 'wallet':
      return (shared.wallets?.value ?? []).map((w: any) => ({ id: w.id, name: w.name }));
    default:
      return [];
  }
});

const isSelected = (type: BudgetTargetType, id: number) =>
  form.targets.some((t) => t.type === type && t.id === id);

const toggleTarget = (type: BudgetTargetType, id: number) => {
  const idx = form.targets.findIndex((t) => t.type === type && t.id === id);
  if (idx >= 0) {
    form.targets.splice(idx, 1);
  } else {
    form.targets.push({ type, id });
  }
};

const selectedCount = (type: BudgetTargetType) =>
  form.targets.filter((t) => t.type === type).length;

const canSubmit = computed(
  () =>
    form.name.trim() !== '' &&
    form.amount > 0 &&
    form.currency.length === 3 &&
    form.start_date !== '' &&
    (form.period_type !== 'custom' || !!form.end_date)
);

const handleSubmit = () => {
  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    description: form.description || undefined,
    amount: form.amount,
    currency: form.currency.toUpperCase(),
    period_type: form.period_type,
    start_date: form.start_date,
    end_date: form.period_type === 'custom' ? form.end_date : null,
    rollover_enabled: form.rollover_enabled,
    threshold_percent: form.threshold_percent,
    forecast_alerts_enabled: form.forecast_alerts_enabled,
    is_active: form.is_active,
    targets: form.targets
  };

  if (props.editingItem?.id) {
    emit('updated', { ...payload, id: props.editingItem.id });
  } else {
    emit('created', payload);
  }
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.budget-form {
  background: $bg-white;
  color: $text-primary;
  border: 1px solid $border-color;
  border-radius: $radius-xl;
  padding: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;

  h2 {
    font-size: $font-size-xl;
    color: $text-primary;
    margin: 0;
  }
  .close-btn {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: $text-muted;

    &:hover {
      color: $text-primary;
    }
  }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 1.25rem;

  @media (max-width: $breakpoint-md) {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &--full {
    grid-column: 1 / -1;
  }

  label {
    font-size: $font-size-sm;
    font-weight: $font-medium;
    color: $text-secondary;
  }

  input[type='text'],
  input[type='number'],
  input[type='date'],
  select,
  textarea {
    padding: 0.5rem 0.75rem;
    border: 1px solid $border-color;
    border-radius: $radius-lg;
    background-color: $input-bg;
    color: $text-primary;
    font-size: $font-size-sm;
    font-family: inherit;

    &::placeholder {
      color: $text-muted;
    }

    &:focus {
      outline: none;
      border-color: $primary;
      box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.15);
    }
  }

  // Native date picker icon loses contrast on dark mode; invert it.
  input[type='date'] {
    color-scheme: light dark;
  }

  input[type='range'] {
    width: 100%;
    accent-color: $primary;
  }
}

.amount-row {
  display: flex;
  gap: 8px;

  input[type='number'] {
    flex-grow: 1;
  }
  .currency {
    width: 100px;
    text-transform: uppercase;
  }
}

.field-hint {
  margin: 4px 0 0;
  font-size: $font-size-xs;
  color: $text-muted;
}

.inline-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: $font-size-sm;
  font-weight: $font-normal;
  color: $text-primary;

  input[type='checkbox'] {
    accent-color: $primary;
  }
}

.target-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid $border-color;
  margin-bottom: 8px;

  .tab {
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    padding: 8px 12px;
    font-size: $font-size-sm;
    color: $text-secondary;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;

    &.active {
      color: $primary;
      border-bottom-color: $primary;
    }

    .count {
      background: $border-color;
      border-radius: 10px;
      font-size: 10px;
      padding: 1px 6px;
    }
  }
}

.target-list {
  max-height: 180px;
  overflow-y: auto;
  border: 1px solid $border-color;
  border-radius: $radius-lg;
  padding: 8px;
  background-color: $input-bg;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.target-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: $font-size-sm;
  color: $text-primary;
  padding: 4px 6px;
  border-radius: $radius-md;
  cursor: pointer;

  input[type='checkbox'] {
    accent-color: $primary;
  }

  &:hover {
    background-color: rgba(var(--color-primary-rgb), 0.1);
  }
}

.empty-hint {
  color: $text-muted;
  font-size: $font-size-xs;
  margin: 0;
  padding: 8px;
}

.error-message {
  color: $error-color;
  margin: 12px 0 0;
  font-size: $font-size-sm;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 1.25rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: $radius-lg;
  border: 1px solid transparent;
  font-size: $font-size-sm;
  cursor: pointer;
  font-weight: $font-medium;

  &--ghost {
    background: transparent;
    border-color: $border-color;
    color: $text-secondary;

    &:hover {
      background-color: rgba(var(--color-primary-rgb), 0.08);
      color: $primary;
      border-color: $primary-muted;
    }
  }

  &--primary {
    background: $primary;
    color: white;
    &:hover:not(:disabled) {
      background: $primary-hover;
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>
