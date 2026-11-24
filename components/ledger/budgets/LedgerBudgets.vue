<template>
  <LedgerWorkspace
    :title="formOpen ? formTitle : t('Budgets')"
    :subtitle="formOpen ? '' : subtitle"
    :inspector-label="t('Budget details')"
    data-testid="ledger-budgets"
  >
    <template #actions>
      <button v-if="!formOpen" type="button" class="lb-btn lb-btn--o" @click="emit('create')">
        <Plus />{{ t('New budget') }}
      </button>
    </template>

    <slot v-if="formOpen" name="form" />

    <template v-else>
      <div class="lb-seg" role="group" :aria-label="t('Show')">
        <button
          v-for="option in viewOptions"
          :key="option.value"
          type="button"
          :aria-pressed="view === option.value"
          @click="view = option.value"
        >
          {{ option.label }}
        </button>
      </div>

      <div class="lb-wrap">
        <table v-if="rows.length" class="lb-table">
          <thead>
            <tr>
              <th>{{ t('Budget') }}</th>
              <th class="lb-r">{{ t('Spent') }}</th>
              <th class="lb-r lb-hide-sm">{{ t('Limit') }}</th>
              <th class="lb-r">{{ t('Left') }}</th>
              <th class="lb-progress lb-hide-sm">{{ t('Progress') }}</th>
              <th class="lb-r lb-hide-md">{{ t('At this pace') }}</th>
              <th>{{ t('Status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="row.id"
              :class="{ 'lb-sel': row.id === selectedId }"
              tabindex="0"
              data-testid="ledger-budget-row"
              @click="selectedId = row.id"
              @keydown.enter="selectedId = row.id"
            >
              <td>
                {{ row.name }}
                <small v-if="row.scope !== row.name">{{ row.scope }}</small>
              </td>
              <td class="lb-r lb-num">{{ row.spentLabel }}</td>
              <td class="lb-r lb-num lb-muted lb-hide-sm">{{ row.limitLabel }}</td>
              <td class="lb-r lb-num" :class="{ 'lb-neg': row.left < 0 }">{{ row.leftLabel }}</td>
              <td class="lb-hide-sm">
                <span class="lb-bar">
                  <i :class="`lb-bar--${row.tone}`" :style="{ width: `${Math.min(row.percent, 100)}%` }" />
                </span>
              </td>
              <td class="lb-r lb-num lb-hide-md">{{ row.paceLabel }}</td>
              <td><span class="lb-chip" :class="`lb-chip--${row.tone}`">{{ row.statusLabel }}</span></td>
            </tr>
          </tbody>
        </table>
        <p v-if="rows.length" class="lb-note">
          {{ t('"At this pace" projects spending to the end of each period from what has gone out so far.') }}
        </p>
        <slot v-else name="empty" />
      </div>
    </template>

    <template #inspector>
      <template v-if="selected">
        <h2 class="lb-h"><Target />{{ selected.name }}</h2>
        <div>
          <div class="lb-amt" :class="{ 'lb-neg': selected.left < 0 }">
            {{ selected.spentLabel }}
            <span>{{ t('of {limit}', { limit: selected.limitLabel }) }}</span>
          </div>
          <p class="lb-muted">{{ selected.periodLabel }}</p>
        </div>

        <div v-if="history.length">
          <h2 class="lb-h">{{ t('Last four months') }}</h2>
          <svg class="lb-chart" viewBox="0 0 270 140" role="img" :aria-label="t('Monthly spending against budget')">
            <g v-for="(bar, index) in history" :key="bar.label">
              <rect
                :x="18 + index * 64"
                :y="116 - bar.height"
                width="40"
                :height="bar.height"
                rx="2"
                :class="bar.over ? 'lb-fill-over' : 'lb-fill'"
                :opacity="index === history.length - 1 ? 1 : 0.75"
              />
              <text :x="38 + index * 64" :y="111 - bar.height" text-anchor="middle" class="lb-chart-value">
                {{ bar.short }}
              </text>
              <text :x="38 + index * 64" y="132" text-anchor="middle">{{ bar.label }}</text>
            </g>
            <line x1="10" x2="262" :y1="limitY" :y2="limitY" class="lb-limit" />
            <text x="10" :y="limitY - 5" class="lb-limit-text">
              {{ t('budget {amount}', { amount: selected.limitShort }) }}
            </text>
          </svg>
          <p v-if="historySkipped" class="lb-muted">
            {{ t('Entries in other currencies are left out of this chart.') }}
          </p>
        </div>

        <div>
          <h2 class="lb-h">{{ t('Latest') }}</h2>
          <ul class="lb-list">
            <li v-for="row in latest" :key="row.id">
              <span>
                {{ row.description || row.party?.name || t('No description') }}
                <small>{{ shortDate(row.datetime) }}</small>
              </span>
              <span class="lb-num">{{ money(-Number(row.amount), row.wallet?.currency || selected.currency, locale, { sign: true }) }}</span>
            </li>
          </ul>
          <p v-if="!latestLoading && !latest.length" class="lb-muted">{{ t('Nothing yet.') }}</p>
        </div>

        <div class="lb-actions">
          <button type="button" class="lb-btn lb-btn--o" @click="emit('edit', selected.budget)">
            <SlidersHorizontal />{{ t('Adjust budget') }}
          </button>
          <NuxtLink :to="askLink" class="lb-btn lb-btn--o"><MessageCircle />{{ t('Ask why') }}</NuxtLink>
          <NuxtLink :to="`/budgets/${selected.id}`" class="lb-btn lb-btn--o"><ListTree />{{ t('All details') }}</NuxtLink>
          <button type="button" class="lb-btn lb-btn--danger" @click="emit('delete', selected.budget)">
            <Trash2 />{{ t('Delete') }}
          </button>
        </div>
      </template>
      <template v-else>
        <h2 class="lb-h"><Target />{{ t('Budgets') }}</h2>
        <p class="lb-muted">{{ t('Pick a budget to see its last four months and latest entries.') }}</p>
      </template>
    </template>
  </LedgerWorkspace>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ListTree, MessageCircle, Plus, SlidersHorizontal, Target, Trash2 } from 'lucide-vue-next';
import LedgerWorkspace from '../LedgerWorkspace.vue';
import type { Budget, BudgetStatus } from '~/types/budget';
import { budgetsApi } from '@/services/api/budgetsApi';
import { sweepTransactions } from '@/utils/transactionSweep';
import { isoDate } from '@/utils/ledgerOverview';
import { money } from '@/utils/ledgerMoney';

const props = defineProps<{
  budgets: Budget[];
  formOpen: boolean;
  formTitle: string;
}>();

const emit = defineEmits<{
  create: [];
  edit: [budget: Budget];
  delete: [budget: Budget];
}>();

const { t, locale } = useI18n();

type BudgetView = 'all' | 'category' | 'wallet' | 'group';
const view = ref<BudgetView>('all');
const viewOptions = computed<{ value: BudgetView; label: string }[]>(() => [
  { value: 'all', label: t('All') },
  { value: 'category', label: t('By Category') },
  { value: 'wallet', label: t('By Wallet') },
  { value: 'group', label: t('By Group') }
]);

const STATUS: Record<BudgetStatus, { tone: string; label: string }> = {
  on_track: { tone: 'good', label: 'On track' },
  near_limit: { tone: 'warn', label: 'Near the limit' },
  forecast_breach: { tone: 'warn', label: 'Will go over' },
  over_budget: { tone: 'bad', label: 'Over' }
};

const scopeLabel = (budget: Budget) => {
  const names = budget.targets.map((target) => target.name).filter(Boolean);
  if (!names.length) return t('Everything you spend');
  return names.length > 2 ? t('{first} and {count} more', { first: names[0], count: names.length - 1 }) : names.join(', ');
};

const shortDate = (value: string) =>
  new Date(value).toLocaleString(locale.value, { month: 'short', day: 'numeric' });

const rows = computed(() =>
  props.budgets
    .filter((budget) => budget.is_active)
    .filter((budget) => view.value === 'all' || budget.targets.some((target) => target.type === view.value))
    .map((budget) => {
      const progress = budget.progress;
      const currency = budget.currency;
      const limit = progress?.effective_limit ?? Number(budget.amount);
      const spent = progress?.net_spent ?? 0;
      const left = progress?.remaining ?? limit - spent;
      const status = STATUS[progress?.status ?? 'on_track'];
      const range =
        progress &&
        new Intl.DateTimeFormat(locale.value, { month: 'short', day: 'numeric' }).formatRange(
          new Date(`${progress.period_start.slice(0, 10)}T00:00:00`),
          new Date(`${progress.period_end.slice(0, 10)}T00:00:00`)
        );
      return {
        id: budget.id,
        budget,
        name: budget.name,
        currency,
        scope: scopeLabel(budget),
        spentLabel: money(spent, currency, locale.value),
        limitLabel: money(limit, currency, locale.value),
        limitShort: money(limit, currency, locale.value, { whole: true }),
        limit,
        left,
        leftLabel: money(left, currency, locale.value),
        percent: progress?.percent_used ?? (limit > 0 ? (spent / limit) * 100 : 0),
        paceLabel: money(progress?.projected_spend ?? spent, currency, locale.value),
        tone: status.tone,
        statusLabel: t(status.label),
        periodLabel: range ?? ''
      };
    })
);

const subtitle = computed(() => {
  const month = new Date().toLocaleString(locale.value, { month: 'long' });
  return `${month} · ${t('{count} budgets', { count: rows.value.length }, rows.value.length)}`;
});

const selectedId = ref<number | null>(null);
const selected = computed(() => rows.value.find((row) => row.id === selectedId.value) ?? null);

watch(
  rows,
  (list) => {
    if (!list.some((row) => row.id === selectedId.value)) selectedId.value = list[0]?.id ?? null;
  },
  { immediate: true }
);

const askLink = computed(() => ({
  path: '/assistant',
  query: {
    ask: selected.value ? t('How is my {name} budget going, and what is driving it?', { name: selected.value.name }) : ''
  }
}));

const latest = ref<any[]>([]);
const latestLoading = ref(false);
const history = ref<{ label: string; short: string; height: number; over: boolean }[]>([]);
const historySkipped = ref(false);
let run = 0;

const limitY = computed(() => {
  const max = Math.max(...history.value.map((bar) => bar.height), 0);
  return max ? 116 - (selected.value?.limit ?? 0) * scale.value : 116;
});
const scale = ref(1);

async function loadSelected() {
  const row = selected.value;
  const id = ++run;
  latest.value = [];
  history.value = [];
  historySkipped.value = false;
  if (!row) return;
  latestLoading.value = true;
  budgetsApi
    .fetchTransactions(row.id)
    .then((result) => {
      if (id === run) latest.value = (result?.data ?? []).slice(0, 4);
    })
    .catch((error) => console.warn('[ledger] budget entries failed', error))
    .finally(() => {
      if (id === run) latestLoading.value = false;
    });

  const budget = row.budget;
  if (budget.period_type !== 'monthly' || budget.targets.some((target) => target.type === 'group')) return;
  const categoryIds = budget.targets.filter((target) => target.type === 'category').map((target) => target.id);
  const walletIds = budget.targets.filter((target) => target.type === 'wallet').map((target) => target.id);
  const now = new Date();
  const months = [3, 2, 1, 0].map((back) => new Date(now.getFullYear(), now.getMonth() - back, 1));
  try {
    const { rows: entries } = await sweepTransactions({
      type: 'expense',
      exclude_transfers: true,
      date_from: isoDate(months[0]),
      date_to: isoDate(now),
      ...(categoryIds.length ? { category_ids: categoryIds } : {}),
      ...(walletIds.length ? { wallet_ids: walletIds } : {})
    });
    if (id !== run) return;
    const totals = months.map(() => 0);
    let skipped = false;
    for (const entry of entries) {
      if ((entry.wallet?.currency ?? budget.currency) !== budget.currency) {
        skipped = true;
        continue;
      }
      const date = new Date(entry.datetime);
      const index = months.findIndex(
        (month) => month.getFullYear() === date.getFullYear() && month.getMonth() === date.getMonth()
      );
      if (index >= 0) totals[index] += Number(entry.amount) || 0;
    }
    const max = Math.max(...totals, row.limit) * 1.1 || 1;
    scale.value = 100 / max;
    historySkipped.value = skipped;
    history.value = totals.map((total, index) => ({
      label: months[index].toLocaleString(locale.value, { month: 'short' }),
      short: money(total, budget.currency, locale.value, { whole: true }),
      height: total * scale.value,
      over: total > row.limit
    }));
  } catch (error) {
    console.warn('[ledger] budget history failed', error);
  }
}

watch(selectedId, loadSelected, { immediate: true });
</script>

<style scoped>
.lb-seg {
  display: inline-flex;
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r-sm);
  background: var(--ledger-surface-2);
  padding: 2px;
  margin-bottom: 12px;
  font-size: 13px;
}

.lb-seg button {
  border: 0;
  background: none;
  padding: 5px 10px;
  border-radius: 3px;
  color: var(--ledger-ink-3);
  cursor: pointer;
}

.lb-seg button[aria-pressed='true'] {
  background: var(--ledger-surface);
  color: var(--ledger-ink);
  font-weight: 600;
  box-shadow: 0 1px 0 var(--ledger-line);
}

.lb-wrap {
  overflow-x: auto;
}

.lb-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.lb-table th {
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ledger-ink-3);
  font-weight: 600;
  padding: 7px 8px;
  border-bottom: 1px solid var(--ledger-line);
  white-space: nowrap;
}

.lb-table td {
  padding: 9px 8px;
  border-bottom: 1px solid var(--ledger-line);
  vertical-align: middle;
}

.lb-table td small {
  display: block;
  font-size: 12px;
  color: var(--ledger-ink-3);
}

.lb-table tbody tr {
  cursor: pointer;
  outline: none;
}

.lb-table tbody tr:hover,
.lb-table tbody tr:focus-visible {
  background: var(--ledger-surface);
}

.lb-table tr.lb-sel {
  background: var(--ledger-surface);
  box-shadow: inset 2px 0 0 var(--ledger-orange);
}

.lb-progress {
  width: 24%;
}

.lb-r {
  text-align: right !important;
}

.lb-num {
  font-family: var(--ledger-mono);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.lb-muted {
  color: var(--ledger-ink-3);
  font-size: 12.5px;
  margin: 0;
}

.lb-neg {
  color: var(--ledger-expense);
}

.lb-bar {
  display: block;
  height: 8px;
  border-radius: 2px;
  background: var(--ledger-surface-3);
  overflow: hidden;
}

.lb-bar i {
  display: block;
  height: 100%;
  background: var(--ledger-brand);
}

.lb-bar i.lb-bar--warn {
  background: var(--ledger-orange);
}

.lb-bar i.lb-bar--bad {
  background: var(--ledger-expense);
}

.lb-chip {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.lb-chip--good {
  background: var(--ledger-brand-soft);
  color: var(--ledger-brand);
}

.lb-chip--warn {
  background: var(--ledger-orange-soft);
  color: var(--ledger-orange-text);
}

.lb-chip--bad {
  background: var(--ledger-expense-soft);
  color: var(--ledger-expense);
}

.lb-note {
  margin: 10px 0 0;
  font-size: 12.5px;
  color: var(--ledger-ink-3);
}

.lb-h {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ledger-ink-3);
}

.lb-h :deep(svg) {
  width: 14px;
  height: 14px;
}

.lb-amt {
  font-family: var(--ledger-mono);
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.lb-amt span {
  font-size: 14px;
  font-weight: 400;
  color: var(--ledger-ink-3);
}

.lb-chart {
  width: 100%;
  height: auto;
  font-size: 10.5px;
  fill: var(--ledger-ink-3);
}

.lb-chart .lb-chart-value {
  fill: var(--ledger-ink);
  font-family: var(--ledger-mono);
}

.lb-fill {
  fill: var(--ledger-brand);
}

.lb-fill-over {
  fill: var(--ledger-expense);
}

.lb-limit {
  stroke: var(--ledger-orange);
  stroke-dasharray: 4 3;
}

.lb-chart .lb-limit-text {
  fill: var(--ledger-orange-text);
}

.lb-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.lb-list li {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--ledger-line);
  font-size: 13px;
}

.lb-list li:last-child {
  border-bottom: 0;
}

.lb-list small {
  display: block;
  font-size: 12px;
  color: var(--ledger-ink-3);
}

.lb-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.lb-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: var(--ledger-r-sm);
  border: 1px solid var(--ledger-line);
  background: var(--ledger-surface);
  color: var(--ledger-ink);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.lb-btn :deep(svg) {
  width: 14px;
  height: 14px;
}

.lb-btn--danger {
  color: var(--ledger-expense);
}

@media (max-width: 1279px) {
  .lb-hide-md {
    display: none;
  }
}

@media (max-width: 767px) {
  .lb-hide-sm {
    display: none;
  }
}
</style>
