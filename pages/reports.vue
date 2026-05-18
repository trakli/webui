<template>
  <div class="reports-v2">
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

    <ReportsEmpty v-if="!hasData" />

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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { LayoutDashboard, Calendar as CalIcon, Workflow, Layers, BarChart3 } from 'lucide-vue-next';
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

definePageMeta({ layout: 'dashboard', middleware: 'auth' });

const { t } = useI18n();

const {
  selectedPeriod,
  customRange,
  compareEnabled,
  periods,
  range,
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

const activeTab = ref('overview');
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
  }
]);

const currency = computed(() => primaryCurrency.value);

const format = (n, cur) =>
  formatShortAmount(`${Math.round((n || 0) * 100) / 100} ${cur || currency.value}`);

const hasData = computed(() => totals.value.income > 0 || totals.value.expense > 0);

const applyCustom = ({ start, end }) => {
  setCustomRange(start, end);
};

const openDrill = (bucket) => {
  drillBucket.value = bucket;
  drillOpen.value = true;
};

const onSelectDay = (slot) => {
  if (!slot) return;
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

.reports-v2 {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
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
</style>
