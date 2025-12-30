<template>
  <div class="reports-page">
    <div class="page-header-wrapper">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Financial Reports</h1>
          <p class="page-subtitle">
            {{ pageSubtitle }}
          </p>
        </div>
        <div class="page-header-right">
          <button
            v-for="period in availablePeriods.slice(0, 3)"
            :key="period.value"
            class="chip"
            :class="{ 'chip--primary': currentPeriod === period.value }"
            @click="setPeriod(period.value)"
          >
            {{ period.label }}
          </button>
          <button class="chip">
            <span>Custom</span>
            <ChevronDown class="chip-icon" />
          </button>
          <button class="chip chip--report">
            <FileText class="chip-icon" />
            <span>Report</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="showReportMessage" class="alert alert--success">
      <p class="alert-title">Report Generated!</p>
      <p>
        Your financial report for June 2024 has been successfully generated and is available for
        download.
      </p>
    </div>

    <div class="kpis">
      <KpiCard
        label="Total Income"
        :value="isLoading ? 'Loading...' : formatCompactCurrency(kpis.totalIncome, currency)"
      />
      <KpiCard
        label="Avg. Monthly Income"
        :value="
          isLoading
            ? 'Loading...'
            : formatCompactCurrency(Math.round(kpis.averageMonthlyIncome), currency)
        "
      />
      <KpiCard label="Top Income Source" :value="isLoading ? 'Loading...' : kpis.topIncomeSource" />
      <KpiCard
        label="% Growth vs Last Period"
        :value="isLoading ? 'Loading...' : `${kpis.growthPercentage}%`"
        :value-class="kpis.growthPercentage >= 0 ? 'is-positive' : 'is-negative'"
      />
    </div>

    <div class="content-layout">
      <div class="charts-column">
        <DonutChartCard :data="sourceBreakdown" :total="kpis.totalIncome" :currency="currency">
          <template #note>
            <span class="bold">AI Insight:</span>
            {{
              statistics?.income_insights?.top_sources?.length > 1
                ? `${Math.round(statistics.income_insights.top_sources[0]?.percentage || 0)}% of your income comes from ${statistics.income_insights.top_sources[0]?.party || 'your top source'}.`
                : 'Diversify your income sources to reduce risk.'
            }}
          </template>
        </DonutChartCard>
        <LineChartCard :data="lineData" />
      </div>

      <div class="insights-column">
        <NarrativeInsights class="insights-card">
          <span v-if="!isLoading && statistics">
            Your income
            <strong
              >{{ kpis.growthPercentage >= 0 ? 'grew' : 'declined' }}
              {{ Math.abs(kpis.growthPercentage) }}%</strong
            >
            this period{{
              kpis.topIncomeSource !== 'N/A' ? `, driven mainly by ${kpis.topIncomeSource}` : ''
            }}.
            {{
              statistics.income_insights?.top_sources?.length > 0
                ? `You have ${statistics.income_insights.top_sources.length} active income sources.`
                : 'Consider diversifying your income sources.'
            }}
            {{
              statistics.expense_insights?.budget_analysis?.savings_rate > 0.2
                ? ' Your savings rate is healthy.'
                : ' Focus on improving your savings rate.'
            }}
          </span>
          <span v-else> Loading insights... </span>
        </NarrativeInsights>

        <ForecastsPanel
          :total-income="kpis.totalIncome"
          :average-monthly-income="kpis.averageMonthlyIncome"
          :disable-input="true"
          class="forecasts-card forecasts-card--narrow"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { FileText, ChevronDown } from 'lucide-vue-next';
import KpiCard from '@/components/reports/KpiCard.vue';
import NarrativeInsights from '@/components/reports/NarrativeInsights.vue';
import ForecastsPanel from '@/components/reports/ForecastsPanel.vue';
import LineChartCard from '@/components/reports/LineChartCard.vue';
import DonutChartCard from '@/components/reports/DonutChartCard.vue';
import { ref, computed } from 'vue';
import { useStatistics } from '@/composables/useStatistics';
import { useAuth } from '@/composables/useAuth';
import { getChartColors } from '@/utils/colors';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});

const { user } = useAuth();
const {
  currentPeriod,
  currentStatistics,
  selectedWalletId,
  availablePeriods,
  availableWallets,
  isLoading,
  setPeriod,
  formatCompactCurrency
} = useStatistics();

const showReportMessage = ref(false);
const statistics = currentStatistics;

const currency = computed(() => {
  const selectedWallet = availableWallets.value.find((w) => w.id === selectedWalletId.value);
  return selectedWallet?.currency || 'USD';
});

const kpis = computed(() => {
  if (!statistics.value)
    return {
      totalIncome: 0,
      averageMonthlyIncome: 0,
      topIncomeSource: 'N/A',
      growthPercentage: 0
    };

  const stats = statistics.value;
  return {
    totalIncome: stats.total_income || 0,
    averageMonthlyIncome: stats.income_insights?.frequency_analysis?.monthly_average || 0,
    topIncomeSource: stats.income_insights?.biggest_source?.party || 'N/A',
    growthPercentage: stats.performance?.growth_percentage || 0
  };
});

const lineData = computed(() => {
  if (!statistics.value?.time_analysis?.monthly_trends) return [];

  return statistics.value.time_analysis.monthly_trends.map((trend) => ({
    name: new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
    value: trend.income,
    insight: trend.net >= 0 ? 'Positive balance' : 'Deficit'
  }));
});

const sourceBreakdown = computed(() => {
  if (!statistics.value?.income_insights?.top_sources) return [];

  const sources = statistics.value.income_insights.top_sources.slice(0, 5);

  return getChartColors(
    sources.map((source) => ({
      name: source.party,
      value: source.amount
    }))
  );
});

const currentPeriodLabel = computed(() => {
  const period = availablePeriods.find((p) => p.value === currentPeriod.value);
  return period ? period.label.toLowerCase() : 'this period';
});

const pageSubtitle = computed(() => {
  const userName = user.value ? `${user.value.first_name}` : 'User';
  return `Hello, ${userName}. Here's your financial overview for ${currentPeriodLabel.value}.`;
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_utilities.scss' as *;

.reports-page {
  width: 100%;
}

.page-header-wrapper {
  background: linear-gradient(135deg, #e6f2ec 0%, #f0f8f2 100%);
  border-radius: $radius-lg;
  padding: $spacing-3 $spacing-4;
  margin-bottom: $spacing-3;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 120px;
    height: 120px;
    background: rgba(4, 120, 68, 0.06);
    border-radius: 50%;
    top: -60px;
    right: -30px;
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    width: 80px;
    height: 80px;
    background: rgba(4, 120, 68, 0.04);
    border-radius: 50%;
    bottom: -40px;
    left: -20px;
    z-index: 0;
  }

  @media (max-width: $breakpoint-md) {
    padding: $spacing-2 $spacing-3;
    margin-bottom: $spacing-2;
  }
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  position: relative;
  z-index: 1;

  @media (min-width: $breakpoint-sm) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.page-title {
  font-size: $font-size-lg;
  font-weight: $font-semibold;
  color: #1d3229;
  margin: 0;

  @media (max-width: $breakpoint-md) {
    font-size: $font-size-base;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-sm;
  }
}

.page-subtitle {
  color: $text-muted;
  font-size: $font-size-xs;
  margin: 0.125rem 0 0 0;

  @media (max-width: $breakpoint-sm) {
    font-size: 0.625rem;
  }
}

.page-header-right {
  display: inline-flex;
  align-items: center;
  gap: $spacing-3;
  flex-wrap: wrap;

  @media (max-width: $breakpoint-sm) {
    gap: $spacing-2;
    justify-content: flex-start;
  }
}

.alert {
  background: $primary-light;
  color: $primary;
  border-left: 4px solid $primary;
  padding: $spacing-3;
  border-radius: $radius-lg;
  margin-bottom: $spacing-3;
}

.alert-title {
  font-weight: $font-bold;
}

:deep(.narrative-insights) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 249, 0.8) 100%);
  border: 1px solid rgba(4, 120, 68, 0.1);
  border-radius: $radius-xl;
  padding: $spacing-6;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, $primary 0%, rgba(4, 120, 68, 0.5) 50%, $primary 100%);
  }

  font-size: $font-size-base;
  line-height: 1.6;
  color: $text-primary;

  strong {
    color: $primary;
    font-weight: $font-bold;
  }
}

.kpis {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-3;
  margin-bottom: $spacing-4;

  @media (min-width: $breakpoint-sm) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: $breakpoint-md) {
    grid-template-columns: repeat(4, 1fr);
  }
}

:deep(.kpi-card) {
  background: linear-gradient(135deg, $bg-white 0%, #fefefe 100%);
  border: 1px solid rgba(4, 120, 68, 0.1);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 8px 25px -5px rgba(4, 120, 68, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: rgba(4, 120, 68, 0.2);
  }
}

:deep(.kpi-value) {
  font-size: 1.5rem !important;

  @media (max-width: $breakpoint-md) {
    font-size: 1.25rem !important;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: 1.1rem !important;
  }

  &.is-positive {
    background: linear-gradient(135deg, $primary, #059669);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  &.is-negative {
    background: linear-gradient(135deg, $error-color, #b91c1c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-4;
  margin-top: $spacing-4;

  @media (min-width: $breakpoint-lg) {
    grid-template-columns: 1fr 1fr;
    gap: $spacing-6;
  }
}

.charts-column {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
  position: relative;
  padding: $spacing-4;
  background:
    radial-gradient(circle at 20% 50%, rgba(4, 120, 68, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(4, 120, 68, 0.02) 0%, transparent 50%), $bg-light;
  border-radius: $radius-xl;
  border: 1px solid rgba(4, 120, 68, 0.05);

  :deep(.chart-card) {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.06),
      0 1px 1px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow:
        0 16px 64px rgba(0, 0, 0, 0.1),
        0 1px 1px rgba(0, 0, 0, 0.05);
    }
  }
}

.insights-column {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.insights-card {
  margin-bottom: 0 !important;
}

.forecasts-card {
  :deep(.card) {
    border: 1px solid rgba(4, 120, 68, 0.1);
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.05),
      0 2px 4px -1px rgba(0, 0, 0, 0.03);
  }

  &.forecasts-card--narrow {
    :deep(.panel-grid) {
      grid-template-columns: 1fr !important;
      gap: $spacing-3;
    }

    :deep(.whatif-row) {
      flex-direction: column;
      align-items: stretch;
      gap: $spacing-2;

      .form-input {
        width: 100%;
        margin-bottom: $spacing-1;
      }

      .submit-btn {
        align-self: flex-start;
        padding: $spacing-1 $spacing-3;
        font-size: $font-size-sm;
      }
    }

    :deep(.sub-title) {
      margin-bottom: $spacing-2;
    }

    :deep(.muted) {
      margin-bottom: $spacing-3;
    }
  }
}

.bold {
  font-weight: $font-bold;
}
</style>
