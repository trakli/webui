<template>
  <div class="stats-section">
    <div class="kpis">
      <KpiCard label="Total Transactions" :value="statistics?.transaction_count || 0" />
      <KpiCard
        label="Total Income"
        :value="formatCompactCurrency(statistics?.total_income || 0, primaryCurrency)"
        value-class="is-positive"
      />
      <KpiCard
        label="Total Expenses"
        :value="formatCompactCurrency(statistics?.total_expenses || 0, primaryCurrency)"
        value-class="is-negative"
      />
      <KpiCard
        label="Net Balance"
        :value="formatCompactCurrency(statistics?.total_balance || 0, primaryCurrency)"
        :value-class="(statistics?.total_balance || 0) >= 0 ? 'is-positive' : 'is-negative'"
      />
    </div>

    <div v-if="statistics?.income_insights?.biggest_source" class="quick-insights">
      <div class="insight-item income-insight">
        <div class="insight-left">
          <div class="insight-icon income-icon">
            <ArrowDownLeftIcon />
          </div>
          <span class="insight-label">Top Income Source</span>
        </div>
        <div class="insight-chips">
          <div class="insight-chip name-chip income-chip">
            {{ statistics.income_insights.biggest_source.party }}
          </div>
          <div class="insight-chip amount-chip income-amount-chip">
            {{
              formatCompactCurrency(
                statistics.income_insights.biggest_source.amount,
                primaryCurrency
              )
            }}
          </div>
        </div>
      </div>
      <div
        v-if="statistics?.expense_insights?.biggest_expense"
        class="insight-item expense-insight"
      >
        <div class="insight-left">
          <div class="insight-icon expense-icon">
            <ArrowUpLeftIcon />
          </div>
          <span class="insight-label">Biggest Expense</span>
        </div>
        <div class="insight-chips">
          <div class="insight-chip name-chip expense-chip">
            {{ statistics.expense_insights.biggest_expense.party }}
          </div>
          <div class="insight-chip amount-chip expense-amount-chip">
            {{
              formatCompactCurrency(
                statistics.expense_insights.biggest_expense.amount,
                primaryCurrency
              )
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ArrowDownLeftIcon, ArrowUpLeftIcon } from '@heroicons/vue/24/outline';
import { useStatistics } from '@/composables/useStatistics';
import { useSharedData } from '@/composables/useSharedData';
import KpiCard from '@/components/reports/KpiCard.vue';

const { selectedWalletId, currentStatistics, formatCompactCurrency } = useStatistics();

// Use the shared statistics from the composable instead of local state
const statistics = currentStatistics;

// Get primary currency (should match WalletCard selection)
const primaryCurrency = computed(() => {
  if (selectedWalletId.value === null) {
    // For "All Wallets", always use USD
    return 'USD';
  }

  // For specific wallet, use that wallet's currency
  const { wallets } = useSharedData();
  const wallet = wallets.value.find((w) => w.id === selectedWalletId.value);
  return wallet?.currency || 'USD';
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.stats-section {
  width: 100%;
  max-width: 655px;
  display: flex;
  flex-direction: column;
  justify-content: center; // Center content vertically
  min-height: 158px; // Match wallet card height
}

.kpis {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-2;
  margin-bottom: $spacing-2;
  flex: 1; // Take more space

  @media (min-width: $breakpoint-sm) {
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-2;
  }

  @media (min-width: $breakpoint-md) {
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-2;
  }
}

// Override KPI card styles for dashboard
:deep(.kpi-card) {
  padding: 0.75rem;
  border-radius: $radius-lg;

  @media (min-width: $breakpoint-md) {
    padding: 0.65rem;
  }
}

:deep(.kpi-label) {
  font-size: 0.7rem;
  margin-bottom: 0.2rem;

  @media (min-width: $breakpoint-md) {
    font-size: 0.65rem;
  }
}

:deep(.kpi-value) {
  font-size: 1.1rem;
  line-height: 1.2;

  @media (min-width: $breakpoint-md) {
    font-size: 1rem;
  }
}

.quick-insights {
  background: $bg-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.insight-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: $radius-md;
  transition: all 0.3s ease;
  min-height: 48px;
  width: 100%;
  position: relative;
  overflow: hidden;

  &.income-insight {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%);
    border: 1px solid rgba(16, 185, 129, 0.2);

    &:hover {
      background: linear-gradient(
        135deg,
        rgba(16, 185, 129, 0.15) 0%,
        rgba(16, 185, 129, 0.08) 100%
      );
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
    }
  }

  &.expense-insight {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.04) 100%);
    border: 1px solid rgba(239, 68, 68, 0.2);

    &:hover {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
    }
  }
}

.insight-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 14px;
    height: 14px;
  }

  &.income-icon {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }

  &.expense-icon {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
}

.insight-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.insight-label {
  font-size: 0.65rem;
  font-weight: $font-medium;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 1;
  white-space: nowrap;
}

.insight-chips {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: flex-end;
}

.insight-chip {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: $font-semibold;
  line-height: 1.2;
  white-space: nowrap;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s ease;
  }

  &:hover::before {
    left: 100%;
  }
}

.name-chip {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;

  &.income-chip {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
    }
  }

  &.expense-chip {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
    }
  }
}

.amount-chip {
  &.income-amount-chip {
    background: rgba(16, 185, 129, 0.15);
    color: #059669;
    border: 1px solid rgba(16, 185, 129, 0.3);

    &:hover {
      background: rgba(16, 185, 129, 0.25);
      transform: scale(1.05);
    }
  }

  &.expense-amount-chip {
    background: rgba(239, 68, 68, 0.15);
    color: #dc2626;
    border: 1px solid rgba(239, 68, 68, 0.3);

    &:hover {
      background: rgba(239, 68, 68, 0.25);
      transform: scale(1.05);
    }
  }
}
</style>
