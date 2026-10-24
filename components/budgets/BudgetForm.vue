<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import {
  DsButton,
  DsCard,
  DsInput,
  DsTextarea,
  DsDropdown,
  DsSwitch,
  DsTabs
} from '@whilesmart/design';
import type { Budget, BudgetPeriodType, BudgetTargetType } from '~/types/budget';
import { useSharedData } from '~/composables/useSharedData';
import { CURRENCIES } from '@/utils/currencies';

const props = defineProps<{
  editingItem?: Budget | null;
  workspaceTargets?: {
    categories: Array<{ id: number; name: string }>;
    groups: Array<{ id: number; name: string }>;
    wallets: Array<{ id: number; name: string; currency?: string }>;
  };
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
const nameInput = computed({
  get: () => form.name,
  set: (value: string) => {
    form.name = value;
  }
});
const amountInput = computed({
  get: () => String(form.amount || ''),
  set: (value: string) => {
    form.amount = Number(value);
  }
});

const defaultCurrency = computed(() => props.defaults?.currency ?? 'USD');

// Backend serializes dates as ISO datetime (`2026-04-18T00:00:00Z`), but
// <input type="date"> needs a bare `YYYY-MM-DD` or it renders empty.
const toDateInput = (value: string): string => (value ? value.slice(0, 10) : '');

// Budgets aren't limited to wallet currencies: offer every supported currency,
// with the user's own wallet currencies (and configured default) surfaced first
// so the most relevant options sit at the top of the list.
const currencyOptions = computed<string[]>(() => {
  const ordered: string[] = [];
  const seen = new Set<string>();
  const add = (code?: string) => {
    if (!code) return;
    const upper = code.toUpperCase();
    if (!seen.has(upper)) {
      seen.add(upper);
      ordered.push(upper);
    }
  };

  for (const w of (props.workspaceTargets?.wallets ?? shared.wallets?.value ?? []) as Array<{
    currency?: string;
  }>) {
    add(w.currency);
  }
  add(defaultCurrency.value);
  for (const c of CURRENCIES) {
    add(c.code);
  }

  return ordered;
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
      return (props.workspaceTargets?.categories ?? shared.categories?.value ?? []).map(
        (c: any) => ({ id: c.id, name: c.name })
      );
    case 'group':
      return (props.workspaceTargets?.groups ?? shared.groups?.value ?? []).map((g: any) => ({
        id: g.id,
        name: g.name
      }));
    case 'wallet':
      return (props.workspaceTargets?.wallets ?? shared.wallets?.value ?? []).map((w: any) => ({
        id: w.id,
        name: w.name
      }));
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

<template>
  <DsCard class="budget-form">
    <form @submit.prevent="handleSubmit">
      <header>
        <h2>{{ editingItem ? t('Edit Budget') : t('Create Budget') }}</h2>
      </header>
      <div class="budget-fields">
        <DsInput v-model="nameInput" :label="t('Budget Name')" required class="wide" />
        <DsInput
          v-model="amountInput"
          type="number"
          :label="t('Budget Amount')"
          required
          min="0"
          step="any"
        />
        <div class="field">
          <label for="budget-currency">{{ t('Currency') }}</label
          ><select id="budget-currency" v-model="form.currency" class="currency ds-field__control">
            <option v-for="code in currencyOptions" :key="code" :value="code">{{ code }}</option>
          </select>
        </div>
        <DsDropdown
          v-model="form.period_type"
          :label="t('Budget Period')"
          :options="
            ['weekly', 'monthly', 'yearly', 'custom'].map((value) => ({
              value,
              label: t(value.charAt(0).toUpperCase() + value.slice(1))
            }))
          "
        />
        <div class="field">
          <label for="budget-start">{{ t('Start date') }}</label
          ><input
            id="budget-start"
            v-model="form.start_date"
            type="date"
            required
            class="ds-field__control"
          />
        </div>
        <div v-if="form.period_type === 'custom'" class="field">
          <label for="budget-end">{{ t('End date') }}</label
          ><input
            id="budget-end"
            v-model="form.end_date"
            type="date"
            required
            class="ds-field__control"
          />
        </div>
        <DsTextarea
          v-model="form.description"
          :label="t('Budget Description')"
          :rows="2"
          class="wide"
        />
        <fieldset class="wide targets">
          <legend>{{ t('Budget Targets') }}</legend>
          <p>
            {{
              workspaceTargets
                ? t(
                    'Leave empty to cover all shared spending. Choose targets to narrow the budget.'
                  )
                : t(
                    'Leave empty to cover all personal spending. Choose targets to narrow the budget.'
                  )
            }}
          </p>
          <DsTabs
            v-model="activeTargetTab"
            role="group"
            area="green"
            :label="t('Budget Targets')"
            :options="
              targetTabs.map((tab) => ({
                key: tab.key,
                label: t(tab.label) + ' (' + selectedCount(tab.key) + ')'
              }))
            "
          />
          <div class="target-list">
            <label v-for="item in targetItems" :key="item.id"
              ><input
                type="checkbox"
                :checked="isSelected(activeTargetTab, item.id)"
                @change="toggleTarget(activeTargetTab, item.id)"
              />
              {{ item.name }}</label
            >
            <p v-if="!targetItems.length">{{ t('No items to choose from') }}</p>
          </div>
        </fieldset>
        <DsSwitch
          v-model="form.rollover_enabled"
          :label="t('Rollover unused amount')"
          :description="t('Leftover or overage carries forward to the next period.')"
        />
        <div class="field">
          <label for="budget-threshold"
            >{{ t('Alert threshold') }} ({{ form.threshold_percent }}%)</label
          ><input
            id="budget-threshold"
            v-model.number="form.threshold_percent"
            type="range"
            min="0"
            max="100"
            step="5"
          /><small>{{ t('Set to 0 to disable.') }}</small>
        </div>
        <DsSwitch v-model="form.forecast_alerts_enabled" :label="t('Forecast alerts')" />
        <DsSwitch v-model="form.is_active" :label="t('Active')" />
      </div>
      <p v-if="apiError" role="alert" class="form-error">{{ apiError }}</p>
      <footer>
        <DsButton variant="ghost" @click="$emit('close')">{{ t('Cancel') }}</DsButton
        ><DsButton type="submit" :loading="isSubmitting" :disabled="!canSubmit">{{
          editingItem ? t('Update Budget') : t('Create Budget')
        }}</DsButton>
      </footer>
    </form>
  </DsCard>
</template>

<style scoped>
.budget-form {
  color: var(--ds-text-primary);
}
form {
  display: grid;
  gap: var(--ds-space-5);
}
h2 {
  margin: 0;
  font-size: var(--ds-text-xl);
}
.budget-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ds-space-5);
}
.wide {
  grid-column: 1 / -1;
}
.field {
  display: grid;
  align-content: start;
  gap: var(--ds-space-2);
}
.field > label,
legend {
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-medium);
}
.targets {
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-card);
  padding: var(--ds-space-4);
  display: grid;
  gap: var(--ds-space-3);
  min-width: 0;
}
p,
small {
  color: var(--ds-text-secondary);
  margin: 0;
}
.target-list {
  display: grid;
  gap: var(--ds-space-2);
  max-height: 12rem;
  overflow-y: auto;
}
.target-list label {
  display: flex;
  gap: var(--ds-space-2);
  align-items: center;
}
footer {
  display: flex;
  gap: var(--ds-space-3);
  justify-content: flex-end;
}
.form-error {
  color: var(--ds-status-error-text);
}
@media (max-width: 600px) {
  .budget-fields {
    grid-template-columns: 1fr;
  }
  footer {
    flex-direction: column-reverse;
  }
}
</style>
