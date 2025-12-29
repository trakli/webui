<template>
  <div class="quick-insights">
    <div class="insights-header">
      <h3 class="title">Insights</h3>
      <span class="period">This Period</span>
    </div>

    <div class="insights-content">
      <div class="insight-stat">
        <div class="stat-icon income">
          <TrendingUp />
        </div>
        <div class="stat-info">
          <span class="stat-label">Top Income</span>
          <span class="stat-value">{{ topIncomeSource?.party || 'N/A' }}</span>
          <span v-if="topIncomeSource" class="stat-amount income">
            {{ formatAmount(topIncomeSource.amount) }}
          </span>
        </div>
      </div>

      <div class="divider" />

      <div class="insight-stat">
        <div class="stat-icon expense">
          <TrendingDown />
        </div>
        <div class="stat-info">
          <span class="stat-label">Top Expense</span>
          <span class="stat-value">{{ topExpense?.party || 'N/A' }}</span>
          <span v-if="topExpense" class="stat-amount expense">
            {{ formatAmount(topExpense.amount) }}
          </span>
        </div>
      </div>

      <div class="divider" />

      <div class="insight-stat">
        <div class="stat-icon" :class="savingsClass">
          <Percent />
        </div>
        <div class="stat-info">
          <span class="stat-label">Savings Rate</span>
          <span class="stat-value large" :class="savingsClass">{{ savingsRate }}%</span>
        </div>
      </div>

      <div class="divider" />

      <div class="insight-stat">
        <div class="stat-icon" :class="riskClass">
          <Shield />
        </div>
        <div class="stat-info">
          <span class="stat-label">Risk Level</span>
          <span class="stat-value" :class="riskClass">{{ riskLevel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { TrendingUp, TrendingDown, Percent, Shield } from 'lucide-vue-next';
import { useStatistics } from '@/composables/useStatistics';

const { currentStatistics, formatCompactCurrency } = useStatistics();

const statistics = currentStatistics;

const topIncomeSource = computed(() => {
  return statistics.value?.income_insights?.biggest_source || null;
});

const topExpense = computed(() => {
  return statistics.value?.expense_insights?.biggest_expense || null;
});

const savingsRate = computed(() => {
  const rate = statistics.value?.expense_insights?.budget_analysis?.savings_rate;
  if (rate === undefined || rate === null) return 0;
  return Math.round(rate * 100);
});

const savingsClass = computed(() => {
  if (savingsRate.value >= 20) return 'good';
  if (savingsRate.value >= 10) return 'moderate';
  return 'low';
});

const riskLevel = computed(() => {
  return statistics.value?.expense_insights?.budget_analysis?.risk_level || 'Unknown';
});

const riskClass = computed(() => {
  const level = riskLevel.value.toLowerCase();
  if (level === 'low') return 'good';
  if (level === 'medium') return 'moderate';
  return 'low';
});

const formatAmount = (value) => {
  return formatCompactCurrency(value || 0, 'USD');
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.quick-insights {
  background: $bg-white;
  border-radius: $radius-xl;
  box-shadow: $shadow-sm;
  border: 1px solid $border-color;
  padding: $spacing-4;
}

.insights-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-3;
}

.title {
  font-size: $font-size-base;
  font-weight: $font-semibold;
  color: $text-primary;
  margin: 0;
}

.period {
  font-size: $font-size-xs;
  color: $text-muted;
}

.insights-content {
  display: flex;
  align-items: stretch;
  gap: $spacing-4;

  @media (max-width: $breakpoint-md) {
    flex-wrap: wrap;
  }

  @media (max-width: $breakpoint-sm) {
    flex-direction: column;
    gap: $spacing-3;
  }
}

.insight-stat {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: $spacing-3;
  min-width: 0;

  @media (max-width: $breakpoint-md) {
    flex: 1 1 calc(50% - $spacing-4);
  }

  @media (max-width: $breakpoint-sm) {
    flex: 1 1 100%;
  }
}

.divider {
  width: 1px;
  background: $border-color;
  align-self: stretch;

  @media (max-width: $breakpoint-sm) {
    width: 100%;
    height: 1px;
  }
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 18px;
    height: 18px;
  }

  &.income {
    background: rgba($primary, 0.1);
    color: $primary;
  }

  &.expense {
    background: rgba($error-color, 0.1);
    color: $error-color;
  }

  &.good {
    background: rgba($primary, 0.1);
    color: $primary;
  }

  &.moderate {
    background: rgba(#f59e0b, 0.1);
    color: #f59e0b;
  }

  &.low {
    background: rgba($error-color, 0.1);
    color: $error-color;
  }
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stat-label {
  font-size: $font-size-xs;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.stat-value {
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &.large {
    font-size: $font-size-lg;
  }

  &.good {
    color: $primary;
  }

  &.moderate {
    color: #f59e0b;
  }

  &.low {
    color: $error-color;
  }
}

.stat-amount {
  font-size: $font-size-xs;
  font-weight: $font-medium;

  &.income {
    color: $primary;
  }

  &.expense {
    color: $error-color;
  }
}
</style>
