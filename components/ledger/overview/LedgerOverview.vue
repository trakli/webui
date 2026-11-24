<template>
  <LedgerWorkspace
    :title="t('Overview')"
    :subtitle="`${rangeLabel} · ${t('all wallets')}`"
    :inspector-label="t('What stands out')"
    data-testid="ledger-overview"
  >
    <template #actions>
      <div class="lo-seg" role="group" :aria-label="t('Period')">
        <button
          v-for="option in periodOptions"
          :key="option.value"
          type="button"
          :aria-pressed="period === option.value"
          @click="setPeriod(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </template>

    <div class="lo-kpis" :class="{ 'lo-loading': !stats && statsLoading }">
      <div>
        {{ t('In') }}
        <span class="lo-num lo-in">{{ fmt(kpis.income) }}</span>
        <small>{{ incomeNote }}</small>
      </div>
      <div>
        {{ t('Out') }}
        <span class="lo-num">{{ fmt(kpis.expense) }}</span>
        <small v-if="kpis.expenseChange !== null" :class="kpis.expenseChange <= 0 ? 'lo-in' : 'lo-out'">
          {{ outNote }}
        </small>
      </div>
      <div>
        {{ t('Kept') }}
        <span class="lo-num" :class="kpis.kept >= 0 ? 'lo-in' : 'lo-out'">{{ fmt(kpis.kept, { sign: true }) }}</span>
        <small>{{ t('In minus out') }}</small>
      </div>
      <div>
        {{ t('Savings rate') }}
        <span class="lo-num">{{ savingsRate }}</span>
        <small>{{ t('of income kept') }}</small>
      </div>
      <div>
        {{ t('Net worth') }}
        <span class="lo-num">{{ fmt(kpis.netWorth) }}</span>
        <small>{{ t('{count} wallets, in {currency}', { count: walletCount, currency: base }, walletCount) }}</small>
      </div>
    </div>

    <p v-if="unconverted.length" class="lo-note">
      {{ t('Not counted in the charts, no exchange rate yet: {codes}', { codes: unconverted.join(', ') }) }}
    </p>

    <div class="lo-grid">
      <section class="lo-pan lo-span4">
        <h2 class="lo-h">
          <TrendingUp />{{ t('Spending so far') }}
          <span class="lo-legend">
            <span><i />{{ currentName }}</span>
            <span><i class="lo-dash" />{{ previousName }}</span>
          </span>
        </h2>
        <LedgerSpendChart
          :current="spentSoFar"
          :previous="prevSpent"
          :total-days="span.totalDays"
          :start="span.start"
          :period="period"
          :locale="locale"
          :label="t('Spending so far against the same days before')"
          :format="(v) => fmt(v)"
          :tick-format="tick"
        />
      </section>

      <section class="lo-pan lo-span2 lo-row2">
        <h2 class="lo-h"><GitCompareArrows />{{ t('This vs last {period}', { period: periodWord }) }}</h2>
        <div class="lo-legend">
          <span><i />{{ rangeLabel }}</span>
          <span><i class="lo-prev" />{{ prevLabel }}</span>
        </div>
        <div class="lo-cmp">
          <div v-for="row in compareRows" :key="row.name" class="lo-cmp-row">
            <span class="lo-cmp-name">{{ row.name }}</span>
            <div class="lo-bars">
              <span class="lo-b" :style="{ width: `${(row.amount / compareMax) * 100}%` }" />
              <span class="lo-b lo-b-prev" :style="{ width: `${(row.prevAmount / compareMax) * 100}%` }" />
            </div>
            <span class="lo-d" :class="row.delta > 0.005 ? 'lo-out' : row.delta < -0.005 ? 'lo-in' : 'lo-muted'">
              {{ Math.abs(row.delta) < 0.005 ? t('same') : fmt(row.delta, { sign: true, whole: Math.abs(row.delta) >= 1000 }) }}
            </span>
          </div>
          <p v-if="!compareRows.length" class="lo-muted">{{ t('No spending in either period yet.') }}</p>
        </div>
        <p v-if="compareNote" class="lo-foot">{{ compareNote }}</p>
      </section>

      <NuxtLink to="/reports?tab=calendar" class="lo-pan lo-span4 lo-click">
        <h2 class="lo-h">
          <CalendarDays />{{ t('Each day') }}
          <span class="lo-legend">
            <span><i />{{ t('Spent') }}</span>
            <span><i class="lo-sq" />{{ t('No spend') }}</span>
            <span><i class="lo-or" />{{ t('Today') }}</span>
          </span>
        </h2>
        <LedgerDailyChart
          :daily="daily"
          :elapsed="span.elapsedDays"
          :start="span.start"
          :period="period"
          :locale="locale"
          :label="t('Spending per day')"
          :format="(v) => fmt(v)"
        />
      </NuxtLink>

      <section class="lo-pan lo-span4">
        <h2 class="lo-h">
          <Waypoints />{{ t('Where it went') }}
          <NuxtLink to="/reports?tab=flow" class="lo-link">{{ t('Open in Reports') }}</NuxtLink>
        </h2>
        <LedgerFlowMini
          v-if="flowSinks.length"
          :sources="flowSources"
          :sinks="flowSinks"
          :label="t('Money in on the left, where it went on the right')"
          :format="(v) => fmt(v, { whole: v >= 1000 })"
        />
        <p v-else class="lo-muted">{{ t('Nothing spent in this period yet.') }}</p>
      </section>

      <section class="lo-pan lo-span2">
        <h2 class="lo-h"><Briefcase />{{ t('Money in') }}</h2>
        <div v-if="incomeRows.length" class="lo-stack">
          <span
            v-for="row in incomeRows"
            :key="row.name"
            :style="{ width: `${(row.amount / incomeTotal) * 100}%`, background: row.color }"
          />
        </div>
        <ul class="lo-list">
          <li v-for="row in incomeRows" :key="row.name">
            <span class="lo-swatch" :style="{ background: row.color }" />
            <span class="lo-list-name">{{ row.name }}</span>
            <span class="lo-num-sm">{{ fmt(row.amount) }}</span>
          </li>
        </ul>
        <p v-if="!incomeRows.length" class="lo-muted">{{ t('No income in this period yet.') }}</p>
      </section>
    </div>

    <div class="lo-widgets">
      <ExtensionSlot name="dashboard.widgets" />
    </div>

    <template #inspector>
      <LedgerInsights />
    </template>
  </LedgerWorkspace>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import {
  Briefcase,
  CalendarDays,
  GitCompareArrows,
  TrendingUp,
  Waypoints
} from 'lucide-vue-next';
import LedgerWorkspace from '../LedgerWorkspace.vue';
import LedgerSpendChart from './LedgerSpendChart.vue';
import LedgerDailyChart from './LedgerDailyChart.vue';
import LedgerFlowMini, { type FlowNode } from './LedgerFlowMini.vue';
import LedgerInsights from './LedgerInsights.vue';
import ExtensionSlot from '@/components/extensions/ExtensionSlot.vue';
import { useLedgerOverview } from '@/composables/useLedgerOverview';
import { useSharedData } from '@/composables/useSharedData';
import type { LedgerPeriod } from '@/utils/ledgerOverview';
import { money, type MoneyOptions } from '@/utils/ledgerMoney';

const { t, locale } = useI18n();
const {
  period,
  span,
  base,
  stats,
  statsLoading,
  kpis,
  categories,
  spending,
  incomeSources,
  payers,
  daily,
  spentSoFar,
  prevSpent,
  unconverted,
  setPeriod,
  loadStats,
  loadDetail
} = useLedgerOverview();
const { wallets } = useSharedData();

const fmt = (value: number, options: MoneyOptions = {}) => money(value, base.value, locale.value, options);
const tick = (value: number) => money(value, base.value, locale.value, value >= 10_000 ? { compact: true } : { whole: true });

const periodOptions = computed<{ value: LedgerPeriod; label: string }[]>(() => [
  { value: 'month', label: t('Month') },
  { value: 'quarter', label: t('Quarter') },
  { value: 'year', label: t('Year') }
]);

const periodWord = computed(() =>
  period.value === 'month' ? t('month') : period.value === 'quarter' ? t('quarter') : t('year')
);

const range = (from: Date, to: Date) =>
  new Intl.DateTimeFormat(locale.value, { month: 'short', day: 'numeric' })
    .formatRange(from, to)
    .replace(/\s/g, '\u00a0');

const rangeLabel = computed(() => range(span.value.start, span.value.today));
const prevLabel = computed(() => range(span.value.prevStart, span.value.prevToday));

const label = (date: Date) =>
  period.value === 'year'
    ? String(date.getFullYear())
    : date.toLocaleString(locale.value, { month: 'long' });
const currentName = computed(() => label(span.value.start));
const previousName = computed(() => label(span.value.prevStart));

const walletCount = computed(() => wallets.value?.length ?? 0);

const savingsRate = computed(() =>
  kpis.value.savingsRate === null
    ? '0%'
    : new Intl.NumberFormat(locale.value, { style: 'percent', maximumFractionDigits: 1 }).format(
        kpis.value.savingsRate
      )
);

const incomeNote = computed(() =>
  incomeSources.value
    .slice(0, 3)
    .map((row) => row.name)
    .join(', ')
);

const outNote = computed(() => {
  const change = kpis.value.expenseChange ?? 0;
  if (Math.abs(change) < 0.005) return t('Same as {range}', { range: prevLabel.value });
  const amount = fmt(Math.abs(change));
  return change < 0
    ? t('{amount} less than {range}', { amount, range: prevLabel.value })
    : t('{amount} more than {range}', { amount, range: prevLabel.value });
});

const compareRows = computed(() => categories.value.slice(0, 7));
const compareMax = computed(() =>
  Math.max(1, ...compareRows.value.map((row) => Math.max(row.amount, row.prevAmount)))
);

const biggestFall = computed(() =>
  categories.value.filter((row) => row.prevAmount > 0 && row.delta < -0.005).sort((a, b) => a.delta - b.delta)[0]
);
const biggestRise = computed(() =>
  categories.value.filter((row) => row.delta > 0.005).sort((a, b) => b.delta - a.delta)[0]
);

const compareNote = computed(() => {
  const parts: string[] = [];
  if (biggestFall.value) parts.push(t('{name} fell the most.', { name: biggestFall.value.name }));
  if (biggestRise.value) parts.push(t('{name} rose the most.', { name: biggestRise.value.name }));
  return parts.join(' ');
});

const TOP_SINKS = 5;

const flowSources = computed<FlowNode[]>(() => {
  const top = payers.value.slice(0, 3);
  const named = top.reduce((sum, row) => sum + row.amount, 0);
  const rows: FlowNode[] = [...top];
  const rest = kpis.value.income - named;
  if (rest > kpis.value.income * 0.01) rows.push({ name: t('Other income'), amount: rest });
  const deficit = kpis.value.expense - kpis.value.income;
  if (deficit > 0.005) rows.push({ name: t('From your balance'), amount: deficit, tone: 'warn' });
  return rows;
});

const flowSinks = computed<FlowNode[]>(() => {
  const top = spending.value.slice(0, TOP_SINKS);
  const named = top.reduce((sum, row) => sum + row.amount, 0);
  const rows: FlowNode[] = [...top];
  const rest = kpis.value.expense - named;
  if (rest > kpis.value.expense * 0.01) rows.push({ name: t('Other spending'), amount: rest });
  if (kpis.value.kept > 0.005) rows.push({ name: t('Kept'), amount: kpis.value.kept, tone: 'brand' });
  return rows;
});

const INCOME_COLORS = ['var(--ledger-brand)', 'var(--ledger-orange)', 'var(--ledger-ink-3)', 'var(--ledger-ink-2)'];

const incomeRows = computed(() =>
  incomeSources.value.slice(0, 4).map((row, i) => ({ ...row, color: INCOME_COLORS[i] }))
);
const incomeTotal = computed(() => Math.max(1, incomeRows.value.reduce((sum, row) => sum + row.amount, 0)));

onMounted(() => {
  loadStats();
  loadDetail();
});
</script>

<style scoped>
.lo-seg {
  display: inline-flex;
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r-sm);
  background: var(--ledger-surface-2);
  padding: 2px;
}

.lo-seg button {
  border: 0;
  background: none;
  padding: 5px 12px;
  border-radius: 3px;
  font-size: 13px;
  color: var(--ledger-ink-3);
  cursor: pointer;
}

.lo-seg button[aria-pressed='true'] {
  background: var(--ledger-surface);
  color: var(--ledger-ink);
  font-weight: 600;
  box-shadow: 0 1px 0 var(--ledger-line);
}

.lo-kpis {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r);
  background: var(--ledger-surface);
  margin-bottom: 14px;
}

.lo-kpis > div {
  padding: 12px 14px;
  border-right: 1px solid var(--ledger-line);
  font-size: 11.5px;
  color: var(--ledger-ink-3);
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.lo-kpis > div:last-child {
  border-right: 0;
}

.lo-kpis small {
  text-wrap: pretty;
  font-size: 11.5px;
  line-height: 1.35;
}

.lo-num {
  font-family: var(--ledger-mono);
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--ledger-ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lo-loading .lo-num {
  color: transparent;
  background: var(--ledger-surface-2);
  border-radius: 3px;
}

.lo-num-sm {
  font-family: var(--ledger-mono);
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.lo-in,
.lo-kpis small.lo-in {
  color: var(--ledger-income);
}

.lo-out,
.lo-kpis small.lo-out {
  color: var(--ledger-expense);
}

.lo-muted {
  color: var(--ledger-ink-3);
  font-size: 12.5px;
  margin: 0;
}

.lo-note {
  margin: -6px 0 12px;
  font-size: 12px;
  color: var(--ledger-orange-text);
}

.lo-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.lo-pan {
  background: var(--ledger-surface);
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r);
  padding: 14px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: inherit;
  text-decoration: none;
}

.lo-click:hover {
  border-color: var(--ledger-ink-3);
}

.lo-span4 {
  grid-column: span 4;
}

.lo-span2 {
  grid-column: span 2;
}

.lo-row2 {
  grid-row: span 2;
}

.lo-h {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ledger-ink-3);
}

.lo-h :deep(svg) {
  width: 14px;
  height: 14px;
  flex: none;
}

.lo-h .lo-legend,
.lo-h .lo-link {
  margin-left: auto;
}

.lo-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  font-size: 11.5px;
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
  color: var(--ledger-ink-3);
}

.lo-legend i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: var(--ledger-brand);
  margin-right: 6px;
  vertical-align: -1px;
}

.lo-legend i.lo-prev {
  background: color-mix(in srgb, var(--ledger-ink-3) 40%, transparent);
}

.lo-legend i.lo-dash {
  height: 0;
  width: 14px;
  border-top: 2px dashed var(--ledger-ink-3);
  background: none;
  vertical-align: 3px;
}

.lo-legend i.lo-sq {
  width: 6px;
  height: 6px;
  background: var(--ledger-brand-text);
  vertical-align: 1px;
}

.lo-legend i.lo-or {
  background: var(--ledger-orange);
}

.lo-link {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
  color: var(--ledger-brand-text);
  text-decoration: none;
}

.lo-cmp {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.lo-cmp-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  font-size: 12.5px;
}

.lo-cmp-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lo-bars {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.lo-b {
  height: 8px;
  min-width: 1px;
  border-radius: 2px;
  background: var(--ledger-brand);
}

.lo-b-prev {
  background: color-mix(in srgb, var(--ledger-ink-3) 40%, transparent);
}

.lo-d {
  text-align: right;
  font-family: var(--ledger-mono);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.lo-foot {
  margin: auto 0 0;
  font-size: 12px;
  color: var(--ledger-ink-3);
}

.lo-stack {
  display: flex;
  height: 22px;
  border-radius: var(--ledger-r-xs);
  overflow: hidden;
}

.lo-stack span {
  display: block;
  height: 100%;
}

.lo-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.lo-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid var(--ledger-line);
  font-size: 13px;
}

.lo-list li:last-child {
  border-bottom: 0;
}

.lo-swatch {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex: none;
}

.lo-list-name {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.lo-list-name small {
  color: var(--ledger-ink-3);
  font-size: 12px;
}

.lo-ins {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: var(--ledger-r);
  background: var(--ledger-surface-2);
  font-size: 13px;
  line-height: 1.45;
}

.lo-coin {
  width: 30px;
  height: 30px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: var(--ledger-r-sm);
  background: var(--ledger-surface);
  color: var(--ledger-ink-2);
}

.lo-coin :deep(svg) {
  width: 16px;
  height: 16px;
}

.lo-upcoming {
  margin-top: 4px;
}

.lo-when {
  width: 40px;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0;
  border-radius: var(--ledger-r-sm);
  background: var(--ledger-surface-2);
  line-height: 1.1;
}

.lo-when b {
  font-family: var(--ledger-mono);
  font-size: 14px;
}

.lo-when small {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--ledger-ink-3);
}

.lo-widgets:empty {
  display: none;
}

.lo-widgets {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

@media (max-width: 1279px) {
  .lo-kpis {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .lo-kpis > div {
    border-bottom: 1px solid var(--ledger-line);
  }

  .lo-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .lo-span4,
  .lo-span2 {
    grid-column: auto;
  }

  .lo-row2 {
    grid-row: auto;
  }
}

@media (max-width: 767px) {
  .lo-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .lo-kpis > div:nth-child(2n),
  .lo-kpis > div:last-child {
    border-right: 0;
  }

  .lo-kpis > div:last-child {
    grid-column: 1 / -1;
    border-bottom: 0;
  }

  .lo-num {
    font-size: 17px;
  }

  .lo-h {
    flex-wrap: wrap;
  }

  .lo-h .lo-legend {
    margin-left: 0;
    width: 100%;
  }
}
</style>
