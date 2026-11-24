<template>
  <LedgerWorkspace
    class="reports-ledger"
    :title="t('Reports')"
    :subtitle="rangeLabel"
    :inspector-label="t('Report details')"
    data-testid="reports"
  >
    <div class="top-bar">
      <ReportsTabs v-model="activeTab" :tabs="tabs" />
    </div>

    <PeriodControl
      :periods="periods"
      :selected-period="selectedPeriod"
      :compare-enabled="compareEnabled"
      :custom-range="customRange"
      @select="setPeriod"
      @apply-custom="applyCustom"
      @toggle-compare="toggleCompare"
      @open-review="reviewOpen = true"
    />

    <p v-if="statsPartial" class="reports-truncated" role="status">
      {{
        t(
          'Some amounts could not be converted to your default currency and were left out, so figures may be understated. Affected: {currencies}.',
          { currencies: unconvertedCurrencies.join(', ') }
        )
      }}
    </p>

    <p v-if="sweepTruncated" class="reports-truncated" role="status">
      {{
        t(
          'This period has more transactions than we chart at once. Daily and trend figures show the most recent {count} and may be partial.',
          { count: '6,000' }
        )
      }}
    </p>

    <LoadingSkeleton
      v-if="isLoading && !hasData"
      variant="card"
      :count="3"
      class="reports-loading"
    />

    <ReportsEmpty v-else-if="!hasData" />

    <Transition v-else name="tab" mode="out-in">
      <div :key="activeTab" class="tab-stage">
        <template v-if="activeTab === 'overview'">
          <CashflowHero
            :totals="totals"
            :trailing="trailing6MonthBuckets"
            :compare-enabled="compareEnabled"
            :currency="currency"
            :formatter="format"
          />

          <FinancialRatios :totals="totals" :currency="currency" :formatter="format" />

          <NotableStrip :notable="notable" :currency="currency" :formatter="format" />
        </template>

        <template v-else-if="activeTab === 'charts'">
          <ChartsTab
            :monthly-buckets="monthlyBuckets"
            :daily-buckets="dailyBuckets"
            :expense-categories="expenseCategories"
            :income-categories="incomeCategories"
            :currency="currency"
            :formatter="format"
          />
        </template>

        <template v-else-if="activeTab === 'calendar'">
          <CalendarTab
            :buckets="dailyBuckets"
            :currency="currency"
            :formatter="format"
            @select-day="onSelectDay"
          />
        </template>

        <template v-else-if="activeTab === 'flow'">
          <FlowTab :flow="sankeyFlow" :currency="currency" :formatter="format" />
        </template>

        <template v-else-if="activeTab === 'categories'">
          <CategoriesTab
            :income-categories="incomeCategories"
            :expense-categories="expenseCategories"
            :compare-enabled="compareEnabled"
            :currency="currency"
            :formatter="format"
            @drill="openDrill"
          />
        </template>

        <template v-else-if="activeTab === 'position'">
          <FinancialPositionView :params="positionParams" />
        </template>
      </div>
    </Transition>

    <CategoryDrillModal
      :open="drillOpen"
      :bucket="drillBucket"
      :range="range"
      :trailing-months="trailing6MonthBuckets"
      :currency="currency"
      :formatter="format"
      @close="drillOpen = false"
    />

    <MonthInReview
      :open="reviewOpen"
      :data="reviewData"
      :currency="currency"
      :formatter="format"
      @close="reviewOpen = false"
    />

    <template #inspector>
      <template v-if="activeTab === 'calendar'">
        <h2 class="rl-h"><CalIcon />{{ dayTitle }}</h2>
        <template v-if="selectedDay">
          <dl class="rl-kv">
            <dt>{{ t('Out') }}</dt>
            <dd class="rl-num">{{ money(selectedDay.expense, currency, locale) }}</dd>
            <dt>{{ t('In') }}</dt>
            <dd class="rl-num rl-in">{{ money(selectedDay.income, currency, locale) }}</dd>
          </dl>
          <ul class="rl-list" data-testid="reports-day-entries">
            <li v-for="row in dayRows" :key="row.id">
              <span>{{ row.description || row.party?.name || t('No description') }}</span>
              <span class="rl-num" :class="{ 'rl-in': row.type === 'income' }">
                {{
                  money(
                    row.type === 'income' ? Number(row.amount) : -Number(row.amount),
                    row.wallet?.currency || currency,
                    locale,
                    { sign: true }
                  )
                }}
              </span>
            </li>
          </ul>
          <p v-if="!dayLoading && !dayRows.length" class="rl-muted">{{ t('Nothing went out.') }}</p>
          <button type="button" class="rl-btn" @click="openDayDrill">
            {{ t('Open the full breakdown') }}
          </button>
        </template>
        <p v-else class="rl-muted">{{ t('Pick a day to see what moved.') }}</p>
      </template>

      <template v-else-if="activeTab === 'flow'">
        <h2 class="rl-h"><Workflow />{{ t('Reading the flow') }}</h2>
        <p class="rl-muted">
          {{
            t(
              'Income comes in on the left. Spending leaves on the right, and the green stream is what you kept.'
            )
          }}
        </p>
        <div v-if="totals.income > 0" class="rl-ins">
          <b>{{ t('{percent}% of income stayed.', { percent: keptPercent }) }}</b>
          {{
            t('{amount} kept this period.', {
              amount: money(totals.income - totals.expense, currency, locale)
            })
          }}
        </div>
        <div>
          <h2 class="rl-h">{{ t('Biggest streams out') }}</h2>
          <ul class="rl-list">
            <li v-for="row in expenseCategories.slice(0, 6)" :key="row.name">
              <span
                >{{ row.name
                }}<small>{{
                  t('{percent}% of spending', { percent: row.percentage.toFixed(1) })
                }}</small></span
              >
              <span class="rl-num">{{ money(row.amount, currency, locale) }}</span>
            </li>
          </ul>
        </div>
        <NuxtLink to="/transactions" class="rl-btn">{{ t('Open in Ledger') }}</NuxtLink>
      </template>

      <LedgerInsights v-else />
    </template>
  </LedgerWorkspace>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import LedgerWorkspace from '@/components/ledger/LedgerWorkspace.vue';
import LedgerInsights from '@/components/ledger/overview/LedgerInsights.vue';
import { money } from '@/utils/ledgerMoney';
import { api } from '@/services/api';
import {
  LayoutDashboard,
  Calendar as CalIcon,
  Workflow,
  Layers,
  BarChart3,
  Scale
} from 'lucide-vue-next';
import FinancialPositionView from '@/components/financial-position/FinancialPositionView.vue';
import ReportsTabs from '@/components/reports/ReportsTabs.vue';
import PeriodControl from '@/components/reports/PeriodControl.vue';
import CashflowHero from '@/components/reports/CashflowHero.vue';
import NotableStrip from '@/components/reports/NotableStrip.vue';
import CalendarTab from '@/components/reports/CalendarTab.vue';
import FlowTab from '@/components/reports/FlowTab.vue';
import CategoriesTab from '@/components/reports/CategoriesTab.vue';
import ChartsTab from '@/components/reports/ChartsTab.vue';
import FinancialRatios from '@/components/reports/FinancialRatios.vue';
import CategoryDrillModal from '@/components/reports/CategoryDrillModal.vue';
import MonthInReview from '@/components/reports/MonthInReview.vue';
import ReportsEmpty from '@/components/reports/ReportsEmpty.vue';
import { useReportData } from '~/composables/useReportData';
import { formatShortAmount } from '@/utils/currency';

definePageMeta({ layout: 'dashboard', middleware: 'auth', ledgerFrame: true });

const { t, locale } = useI18n();

const {
  selectedPeriod,
  customRange,
  compareEnabled,
  periods,
  range,
  isLoading,
  sweepTruncated,
  statsPartial,
  unconvertedCurrencies,
  totals,
  dailyBuckets,
  monthlyBuckets,
  trailing6MonthBuckets,
  expenseCategories,
  incomeCategories,
  notable,
  sankeyFlow,
  primaryCurrency,
  monthInReview,
  setPeriod,
  setCustomRange,
  toggleCompare
} = useReportData();

const REPORT_TABS = ['overview', 'calendar', 'flow', 'charts', 'categories', 'position'];
const route = useRoute();
const tabFromQuery = (value) => (REPORT_TABS.includes(value) ? value : null);
const activeTab = ref(tabFromQuery(route.query.tab) ?? 'overview');
watch(
  () => route.query.tab,
  (value) => {
    const tab = tabFromQuery(value);
    if (tab) activeTab.value = tab;
  }
);
const drillOpen = ref(false);
const drillBucket = ref(null);
const reviewOpen = ref(false);

const tabs = computed(() => [
  { value: 'overview', label: t('Overview'), icon: LayoutDashboard },
  { value: 'calendar', label: t('Calendar'), icon: CalIcon },
  { value: 'flow', label: t('Flow'), icon: Workflow },
  { value: 'charts', label: t('Charts'), icon: BarChart3 },
  {
    value: 'categories',
    label: t('Categories'),
    icon: Layers,
    count: expenseCategories.value.length + incomeCategories.value.length
  },
  { value: 'position', label: t('Position'), icon: Scale }
]);

const currency = computed(() => primaryCurrency.value);

const positionParams = computed(() => ({
  start_date: range.value.start.toISOString().slice(0, 10),
  end_date: range.value.end.toISOString().slice(0, 10)
}));

const format = (n, cur) =>
  formatShortAmount(`${Math.round((n || 0) * 100) / 100} ${cur || currency.value}`);

// "Has data" must not hinge on the overview totals alone: charts read their own
// buckets/category series, which can be present even when totals derive to zero
// (e.g. amounts dropped for a missing exchange rate). Gate the empty state on any
// real signal so charts aren't hidden while data exists. dailyBuckets is scaffolded
// one-per-day, so check txCount rather than its length.
const hasData = computed(() => {
  if (totals.value.income > 0 || totals.value.expense > 0) return true;
  if (expenseCategories.value.length > 0 || incomeCategories.value.length > 0) return true;
  if (monthlyBuckets.value.some((m) => m.income || m.expense || m.net)) return true;
  if (dailyBuckets.value.some((d) => d.txCount > 0)) return true;
  return false;
});

const applyCustom = ({ start, end }) => {
  setCustomRange(start, end);
};

const openDrill = (bucket) => {
  drillBucket.value = bucket;
  drillOpen.value = true;
};

const selectedDay = ref(null);
const dayRows = ref([]);
const dayLoading = ref(false);
const rangeLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).formatRange(range.value.start, range.value.end)
);
const dayTitle = computed(() =>
  selectedDay.value
    ? new Date(`${selectedDay.value.date}T00:00:00`).toLocaleString(locale.value, {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      })
    : t('Calendar')
);
const keptPercent = computed(() =>
  totals.value.income > 0
    ? Math.max(
        0,
        ((totals.value.income - totals.value.expense) / totals.value.income) * 100
      ).toFixed(0)
    : '0'
);
const loadDay = async (date) => {
  dayLoading.value = true;
  dayRows.value = [];
  try {
    const page = await api.transactions.fetchAll({
      date_from: date,
      date_to: date,
      limit: 50,
      page: 1
    });
    if (selectedDay.value?.date === date) dayRows.value = page?.data || [];
  } catch (error) {
    console.warn('[reports] day entries failed', error);
  } finally {
    dayLoading.value = false;
  }
};
const onSelectDay = (slot) => {
  if (!slot) return;
  selectedDay.value = slot;
  loadDay(slot.date);
};
const openDayDrill = () => {
  if (selectedDay.value) openDrillForDay(selectedDay.value);
};
const openDrillForDay = (slot) => {
  drillBucket.value = {
    name: t('Spending on {date}', { date: slot.date }),
    kind: 'expense',
    amount: slot.expense,
    count: slot.txCount,
    percentage: 0,
    prevAmount: 0,
    delta: 0,
    trend: trailing6MonthBuckets.value.map(() => 0),
    color: 'var(--color-expense)',
    singleDay: slot.date
  };
  drillOpen.value = true;
};

const reviewSnapshot = monthInReview(0);
const prevReviewSnapshot = monthInReview(1);
const reviewData = computed(() => reviewSnapshot.value || prevReviewSnapshot.value);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.top-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.reports-truncated {
  margin: 0;
  padding: $spacing-3 $spacing-4;
  border-radius: $radius-lg;
  background: rgba(245, 158, 11, 0.12);
  color: #92400e;
  font-size: $font-size-sm;
}

.tab-stage {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.tab-enter-active,
.tab-leave-active {
  transition:
    opacity $duration-base $easing-standard,
    transform $duration-base $easing-emphasized;
}
.tab-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.tab-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.reports-ledger .top-bar {
  margin-bottom: 12px;
}

.reports-ledger :deep(.tab-stage) {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 12px;
}

.rl-h {
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

.rl-h :deep(svg) {
  width: 14px;
  height: 14px;
}

.rl-kv {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr);
  gap: 6px 10px;
  margin: 0;
  font-size: 13px;
}

.rl-kv dt {
  color: var(--ledger-ink-3);
}

.rl-kv dd {
  margin: 0;
}

.rl-num {
  font-family: var(--ledger-mono);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.rl-in {
  color: var(--ledger-income);
}

.rl-muted {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ledger-ink-3);
}

.rl-list {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
}

.rl-list li {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--ledger-line);
  font-size: 13px;
}

.rl-list li:last-child {
  border-bottom: 0;
}

.rl-list small {
  display: block;
  font-size: 12px;
  color: var(--ledger-ink-3);
}

.rl-ins {
  padding: 10px;
  border-radius: var(--ledger-r);
  background: var(--ledger-surface-2);
  font-size: 13px;
  line-height: 1.45;
}

.rl-btn {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r-sm);
  background: var(--ledger-surface);
  color: var(--ledger-ink);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}
</style>
