<template>
  <div class="settings-layout">
    <TSidebar />
    <TNavbar />
    <div class="settings-content">
      <div class="settings-content-card">
        <div class="settings-page">
          <div class="page-header">
            <div class="page-header-left">
              <h1 class="page-title">Dashboard</h1>
              <p class="page-subtitle">
                Hello, Jane. Here's your financial overview for June 2024.
              </p>
            </div>
            <div class="page-header-right">
              <button class="chip chip--primary">This month</button>
              <button class="chip">Last month</button>
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

          <div v-if="showReportMessage" class="alert alert--success">
            <p class="alert-title">Report Generated!</p>
            <p>
              Your financial report for June 2024 has been successfully generated and is available
              for download.
            </p>
          </div>

          <div class="kpis">
            <KpiCard label="Total Income" :value="`$${kpis.totalIncome}`" />
            <KpiCard label="Avg. Monthly Income" :value="`$${kpis.averageMonthlyIncome}`" />
            <KpiCard label="Top Income Source" :value="kpis.topIncomeSource" />
            <KpiCard
              label="% Growth vs Last Month"
              :value="`${kpis.growthPercentage}%`"
              :value-class="kpis.growthPercentage >= 0 ? 'is-positive' : 'is-negative'"
            />
          </div>

          <NarrativeInsights class="section-spacing">
            Your income grew <strong>12%</strong> this month, driven mainly by consulting fees. If
            this trend continues, you’ll hit your yearly goal two months early. The dip in March was
            due to a delayed freelance payment, which was recovered in April. Keep an eye on your
            income source diversity to reduce concentration risk.
          </NarrativeInsights>

          <ForecastsPanel
            :total-income="kpis.totalIncome"
            :average-monthly-income="kpis.averageMonthlyIncome"
            :disable-input="true"
          />

          <div class="charts">
            <LineChartCard :data="lineData" />
            <DonutChartCard :data="sourceBreakdown" :total="kpis.totalIncome">
              <template #note>
                <span class="bold">AI Insight:</span> 80% of your income currently depends on two
                clients, representing a moderate concentration risk.
              </template>
            </DonutChartCard>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FileText, ChevronDown } from 'lucide-vue-next';
import TSidebar from '@/components/TSidebar.vue';
import TNavbar from '@/components/TNavbar.vue';
import KpiCard from '@/components/reports/KpiCard.vue';
import NarrativeInsights from '@/components/reports/NarrativeInsights.vue';
import ForecastsPanel from '@/components/reports/ForecastsPanel.vue';
import LineChartCard from '@/components/reports/LineChartCard.vue';
import DonutChartCard from '@/components/reports/DonutChartCard.vue';
import { ref } from 'vue';

/* eslint-disable no-undef */
definePageMeta({
  layout: 'default',
  middleware: 'auth'
});
/* eslint-enable no-undef */

const showReportMessage = ref(false);

const kpis = {
  totalIncome: 7540,
  averageMonthlyIncome: 6500,
  topIncomeSource: 'Consulting',
  growthPercentage: 12
};

const lineData = [
  { name: 'Jan', value: 6000, insight: 'Consistent income' },
  { name: 'Feb', value: 6200, insight: 'Small increase from side projects' },
  { name: 'Mar', value: 5500, insight: 'Freelance payment delayed → explains dip' },
  { name: 'Apr', value: 6800, insight: 'Delayed payment received' },
  { name: 'May', value: 6500, insight: 'Steady performance' },
  { name: 'Jun', value: 7540, insight: 'Significant increase from new client' }
];

const sourceBreakdown = [
  { name: 'Consulting', value: 4500, color: '#3b82f6' },
  { name: 'Freelance', value: 2000, color: '#f97316' },
  { name: 'Investments', value: 500, color: '#10b981' },
  { name: 'Side Hustle', value: 540, color: '#f43f5e' }
];
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.settings-layout {
  --sidebar-width: min(300px, 30vw);
  --sidebar-min-width: 200px;
  background-color: $bg-gray;
  min-height: 100vh;
}

.settings-content {
  margin-left: var(--sidebar-width, 300px);
  transition: margin-left 0.3s ease;
  width: calc(100% - var(--sidebar-width, 300px));
  overflow-x: hidden;
  padding: 3.5rem 1rem 1rem;

  @media (max-width: $breakpoint-md) {
    width: 100%;
    margin-left: 0;
    padding: $spacing-5 $spacing-3;
  }
}

.settings-content-card {
  min-height: calc(100vh - 100px);
  background-color: $bg-white;
  border-radius: 2rem;
  border: 1px solid $bg-gray;
  padding: 2rem 0.5rem 0.5rem;
  box-sizing: border-box;
  overflow: hidden;

  @media (min-width: $breakpoint-md) {
    padding: 1.5rem 1rem;
  }
}

.settings-page {
  width: 95%;
  margin: auto;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
  margin-bottom: $spacing-4;

  @media (min-width: $breakpoint-sm) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.page-title {
  font-size: 1.75rem;
  font-weight: $font-bold + 100; // 800
  color: $text-primary;
}

.page-subtitle {
  color: $text-muted;
  font-size: $font-size-sm;
}

.page-header-right {
  display: inline-flex;
  align-items: center;
  gap: $spacing-3;
  flex-wrap: wrap;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-2 $spacing-3;
  border-radius: 999px;
  background: $bg-white;
  color: $text-secondary;
  border: 1px solid $border-light;
  box-shadow: $shadow-sm;
  font-size: $font-size-sm;
  font-weight: $font-medium;
}

.chip--primary {
  background: $primary;
  color: $bg-white;
  border-color: $primary;
}

.chip--report {
  background: $accent-color;
  color: $bg-white;
  border-color: $accent-color;
}

.chip-icon {
  width: 16px;
  height: 16px;
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

.section-spacing {
  margin-bottom: $spacing-4;
}

.kpis {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-3;
  margin-bottom: $spacing-4;

  @media (min-width: $breakpoint-md) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.charts {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-3;
  margin-top: $spacing-4;

  @media (min-width: $breakpoint-lg) {
    grid-template-columns: 1fr 1fr;
  }
}

.bold {
  font-weight: $font-bold;
}
</style>
