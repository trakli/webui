<script setup lang="ts">
import { computed } from 'vue';
import { DsCard, DsChip, DsProgress, DsButton } from '@whilesmart/design';
import type { Budget } from '~/types/budget';

const props = withDefaults(
  defineProps<{ budget: Budget; editable?: boolean; to?: string | null }>(),
  { editable: true, to: undefined }
);
defineEmits<{ edit: [budget: Budget]; delete: [budget: Budget]; open: [budget: Budget] }>();
const { t } = useI18n();
const progress = computed(() => props.budget.progress);
const destination = computed(() =>
  props.to === undefined ? `/budgets/${props.budget.id}` : props.to
);
const percent = computed(() => Number(progress.value?.percent_used ?? 0));
const spent = computed(() => Number(progress.value?.net_spent ?? 0));
const limit = computed(() => Number(progress.value?.effective_limit ?? props.budget.amount));
const remaining = computed(() => Number(progress.value?.remaining ?? limit.value));
const tone = computed(() =>
  progress.value?.status === 'over_budget'
    ? 'danger'
    : progress.value?.status === 'on_track' || !progress.value
      ? 'success'
      : 'warning'
);
const status = computed(
  () =>
    ({
      on_track: 'On track',
      near_limit: 'Near limit',
      over_budget: 'Over budget',
      forecast_breach: 'Forecast to exceed limit'
    })[progress.value?.status ?? 'on_track']
);
function money(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: props.budget.currency
  }).format(value);
}
</script>

<template>
  <DsCard class="budget-card">
    <header>
      <div>
        <NuxtLink v-if="destination" :to="destination" class="budget-title">{{
          budget.name
        }}</NuxtLink
        ><DsButton v-else variant="ghost" class="budget-title" @click="$emit('open', budget)">{{
          budget.name
        }}</DsButton>
        <p>
          {{ t(budget.period_type.charAt(0).toUpperCase() + budget.period_type.slice(1)) }} ·
          {{ (progress?.period_start || budget.start_date).slice(0, 10) }}
        </p>
      </div>
      <DsChip :variant="tone">{{ t(status) }}</DsChip>
    </header>
    <div class="targets">
      <DsChip v-if="!budget.targets.length">{{ t('All spending') }}</DsChip
      ><DsChip v-for="target in budget.targets" :key="`${target.type}-${target.id}`">{{
        target.name || target.type
      }}</DsChip>
    </div>
    <DsProgress :value="percent" :tone="tone" :label="t('Budget used')" />
    <div class="figures">
      <span
        ><strong>{{ money(spent) }}</strong> {{ t('of') }} {{ money(limit) }}</span
      ><strong>{{ Math.round(percent) }}%</strong>
    </div>
    <footer>
      <div>
        <span>{{ t('Remaining') }}</span
        ><strong :class="{ negative: remaining < 0 }">{{ money(remaining) }}</strong>
      </div>
      <div v-if="editable" class="actions">
        <DsButton variant="ghost" size="sm" @click="$emit('edit', budget)">{{ t('Edit') }}</DsButton
        ><DsButton variant="ghost" size="sm" @click="$emit('delete', budget)">{{
          t('Delete')
        }}</DsButton>
      </div>
    </footer>
    <p v-if="Number(progress?.refunds) > 0">
      {{ t('Refunds') }}: {{ money(Number(progress?.refunds)) }}
    </p>
  </DsCard>
</template>

<style scoped>
.budget-card {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-4);
  color: var(--ds-text-primary);
}
header,
.figures,
footer {
  display: flex;
  justify-content: space-between;
  gap: var(--ds-space-3);
  align-items: center;
}
header {
  align-items: start;
}
.budget-title {
  color: var(--ds-text-primary);
  font-size: var(--ds-text-lg);
  font-weight: var(--ds-font-bold);
  text-decoration: none;
}
p {
  margin: var(--ds-space-1) 0 0;
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-sm);
}
.targets,
.actions {
  display: flex;
  gap: var(--ds-space-2);
  flex-wrap: wrap;
}
.figures {
  font-size: var(--ds-text-sm);
}
footer {
  border-top: 1px solid var(--ds-border-base);
  padding-top: var(--ds-space-3);
  margin-top: auto;
}
footer > div:first-child {
  display: grid;
  gap: var(--ds-space-1);
}
footer span {
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-xs);
}
.negative {
  color: var(--ds-status-error-text);
  background: var(--ds-status-error-bg);
  border-radius: var(--ds-radius-full);
  padding: var(--ds-space-1) var(--ds-space-2);
}
</style>
