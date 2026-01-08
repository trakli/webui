<template>
  <div class="reports-page">
    <div class="page-header-wrapper">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">{{ t('Financial Reports') }}</h1>
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
            {{ t(period.label) }}
          </button>
          <button class="chip">
            <span>{{ t('Custom') }}</span>
            <ChevronDown class="chip-icon" />
          </button>
          <button class="chip chip--report">
            <FileText class="chip-icon" />
            <span>{{ t('Report') }}</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="showReportMessage" class="alert alert--success">
      <p class="alert-title">{{ t('Report Generated!') }}</p>
      <p>
        {{
          t(
            'Your financial report for {period} has been successfully generated and is available for download.',
            { period: currentPeriodLabel }
          )
        }}
      </p>
    </div>

    <div class="kpis">
      <KpiCard
        :label="t('Total Income')"
        :value="isLoading ? t('Loading...') : formatCompactCurrency(kpis.totalIncome, currency)"
      />
      <KpiCard
        :label="t('Avg. Monthly Income')"
        :value="
          isLoading
            ? t('Loading...')
            : formatCompactCurrency(Math.round(kpis.averageMonthlyIncome), currency)
        "
      />
      <KpiCard
        :label="t('Top Income Source')"
        :value="isLoading ? t('Loading...') : kpis.topIncomeSource"
      />
      <KpiCard
        :label="t('% Growth vs Last Period')"
        :value="isLoading ? t('Loading...') : `${kpis.growthPercentage}%`"
        :value-class="kpis.growthPercentage >= 0 ? 'is-positive' : 'is-negative'"
      />
    </div>

    <div class="content-layout">
      <div class="charts-column">
        <DonutChartCard :data="sourceBreakdown" :total="kpis.totalIncome" :currency="currency">
          <template #note>
            <span class="bold">{{ t('AI Insight:') }}</span>
            {{
              statistics?.income_insights?.top_sources?.length > 1
                ? t('{percent}% of your income comes from {party}.', {
                    percent: Math.round(statistics.income_insights.top_sources[0]?.percentage || 0),
                    party: statistics.income_insights.top_sources[0]?.party || t('your top source')
                  })
                : t('Diversify your income sources to reduce risk.')
            }}
          </template>
        </DonutChartCard>
        <LineChartCard :data="lineData" />
      </div>

      <div class="insights-column">
        <NarrativeInsights class="insights-card">
          <span v-if="!isLoading && statistics">
            {{ t('Your income') }}
            <strong
              >{{ kpis.growthPercentage >= 0 ? t('grew') : t('declined') }}
              {{ Math.abs(kpis.growthPercentage) }}%</strong
            >
            {{ t('this period')
            }}{{
              kpis.topIncomeSource !== t('N/A')
                ? t(', driven mainly by {source}', { source: kpis.topIncomeSource })
                : ''
            }}.
            {{
              statistics.income_insights?.top_sources?.length > 0
                ? t('You have {count} active income sources.', {
                    count: statistics.income_insights.top_sources.length
                  })
                : t('Consider diversifying your income sources.')
            }}
            {{
              statistics.expense_insights?.budget_analysis?.savings_rate > 0.2
                ? t('Your savings rate is healthy.')
                : t('Focus on improving your savings rate.')
            }}
          </span>
          <span v-else> {{ t('Loading insights...') }} </span>
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

const { t, locale } = useI18n();

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
      topIncomeSource: t('N/A'),
      growthPercentage: 0
    };

  const stats = statistics.value;
  return {
    totalIncome: stats.total_income || 0,
    averageMonthlyIncome: stats.income_insights?.frequency_analysis?.monthly_average || 0,
    topIncomeSource: stats.income_insights?.biggest_source?.party || t('N/A'),
    growthPercentage: stats.performance?.growth_percentage || 0
  };
});

const lineData = computed(() => {
  if (!statistics.value?.time_analysis?.monthly_trends) return [];

  return statistics.value.time_analysis.monthly_trends.map((trend) => ({
    name: new Intl.DateTimeFormat(locale.value, { month: 'short' }).format(
      new Date(trend.month + '-01')
    ),
    value: trend.income,
    insight: trend.net >= 0 ? t('Positive balance') : t('Deficit')
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
  return period ? t(period.label).toLowerCase() : t('this period');
});

const pageSubtitle = computed(() => {
  const userName = user.value ? `${user.value.first_name}` : t('User');
  return t("Hello, {name}. Here's your financial overview for {period}.", {
    name: userName,
    period: currentPeriodLabel.value
  });
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_utilities.scss' as *;

.reports-page {
  width: 100%;
}

.page-header-wrapper {
  background: $primary-light;
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
    background: rgba(var(--color-primary-rgb), 0.06);
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
    background: rgba(var(--color-primary-rgb), 0.04);
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
  color: $text-primary;
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
  background: $bg-white;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  border-radius: $radius-xl;
  padding: $spacing-6;
  box-shadow: $shadow-md;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      $primary 0%,
      rgba(var(--color-primary-rgb), 0.5) 50%,
      $primary 100%
    );
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
  background: $bg-white;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  box-shadow: $shadow-sm;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
    border-color: rgba(var(--color-primary-rgb), 0.2);
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
  background: $bg-light;
  border-radius: $radius-xl;
  border: 1px solid rgba(var(--color-primary-rgb), 0.05);

  :deep(.chart-card) {
    background: $bg-white;
    border: 1px solid $border-color;
    box-shadow: $shadow-sm;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: $shadow-lg;
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
    border: 1px solid rgba(var(--color-primary-rgb), 0.1);
    box-shadow: $shadow-sm;
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
