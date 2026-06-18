<template>
  <div class="kpi-section">
    <div v-if="isCustomActive && activeFilterChips.length > 0" class="kpi-header">
      <div class="active-filters">
        <span v-for="chip in activeFilterChips" :key="chip.key" class="filter-chip">
          <span class="filter-chip__label">{{ chip.label }}</span>
          <button class="filter-chip__remove" @click="removeFilter(chip.key)">
            <XIcon class="filter-chip__remove-icon" />
          </button>
        </span>
        <button class="filter-chip filter-chip--clear" @click="clearAllFilters">
          {{ t('Clear all') }}
        </button>
      </div>
    </div>

    <div class="kpi-grid">
      <article
        v-for="card in kpiCards"
        :key="card.key"
        class="kpi-card tone-card surface"
        :class="`surface--${card.tone}`"
      >
        <svg
          class="kpi-decor"
          viewBox="0 0 280 160"
          preserveAspectRatio="xMaxYMid slice"
          aria-hidden="true"
        >
          <circle cx="240" cy="40" r="60" fill="var(--surface-accent)" opacity="0.35" />
          <circle cx="270" cy="120" r="36" fill="var(--surface-deep)" opacity="0.35" />
          <circle cx="200" cy="130" r="10" fill="var(--surface-deep)" opacity="0.5" />
        </svg>
        <div class="kpi-icon">
          <component :is="card.icon" :size="18" />
        </div>
        <div class="kpi-meta">
          <span class="eyebrow">{{ card.label }}</span>
          <p class="kpi-value">{{ formatCurrency(card.value) }}</p>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { X as XIcon, Wallet, ArrowDownLeft, ArrowUpRight, PiggyBank } from 'lucide-vue-next';
import { useStatistics } from '@/composables/useStatistics';
import { useWallets } from '@/composables/useWallets';
import { useSharedData } from '@/composables/useSharedData';

const { t } = useI18n();

const { wallets } = useWallets();
const { getDefaultCurrency } = useSharedData();
const {
  currentStatistics,
  currentPeriod,
  customFilters,
  formatCompactCurrency,
  setCustomFilters,
  clearCustomFilters
} = useStatistics();

const statistics = currentStatistics;

const netValue = computed(() => {
  const income = statistics.value?.total_income || 0;
  const expenses = statistics.value?.total_expenses || 0;
  return income - expenses;
});

const kpiCards = computed(() => [
  {
    key: 'balance',
    label: t('Balance'),
    value: statistics.value?.total_balance || 0,
    icon: Wallet,
    tone: 'brand'
  },
  {
    key: 'income',
    label: t('Income'),
    value: statistics.value?.total_income || 0,
    icon: ArrowDownLeft,
    tone: 'income'
  },
  {
    key: 'expenses',
    label: t('Expenses'),
    value: statistics.value?.total_expenses || 0,
    icon: ArrowUpRight,
    tone: 'expense'
  },
  {
    key: 'net',
    label: t('Net'),
    value: netValue.value,
    icon: PiggyBank,
    tone: netValue.value >= 0 ? 'brand-soft' : 'expense'
  }
]);

const formatCurrency = (value) => {
  return formatCompactCurrency(value, getDefaultCurrency.value || 'USD');
};

const isCustomActive = computed(() => {
  return currentPeriod.value === 'custom' && customFilters.value !== null;
});

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const activeFilterChips = computed(() => {
  if (!customFilters.value) return [];

  const chips = [];

  if (customFilters.value.startDate && customFilters.value.endDate) {
    chips.push({
      key: 'dateRange',
      label: `${formatDate(customFilters.value.startDate)} - ${formatDate(customFilters.value.endDate)}`
    });
  }

  if (customFilters.value.walletIds.length > 0) {
    const selectedWalletNames = customFilters.value.walletIds
      .map((id) => {
        const wallet = wallets.value.find((w) => w.id === id);
        return wallet?.name;
      })
      .filter(Boolean);

    if (selectedWalletNames.length === 1) {
      chips.push({ key: 'wallets', label: selectedWalletNames[0] });
    } else if (selectedWalletNames.length > 1) {
      chips.push({ key: 'wallets', label: `${selectedWalletNames.length} wallets` });
    }
  }

  return chips;
});

const removeFilter = (key) => {
  if (!customFilters.value) return;

  const updatedFilters = { ...customFilters.value };

  if (key === 'dateRange') {
    updatedFilters.startDate = '';
    updatedFilters.endDate = new Date().toISOString().split('T')[0];
  } else if (key === 'wallets') {
    updatedFilters.walletIds = [];
  }

  if (!updatedFilters.startDate && updatedFilters.walletIds.length === 0) {
    clearCustomFilters();
  } else {
    setCustomFilters(updatedFilters);
  }
};

const clearAllFilters = () => {
  clearCustomFilters();
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.kpi-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.kpi-header {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  flex-wrap: wrap;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-3;

  @media (max-width: $breakpoint-lg) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-2;
  }
}

.kpi-card {
  position: relative;
  padding: $spacing-4;
  display: flex;
  align-items: center;
  gap: $spacing-3;
  overflow: hidden;
  border-radius: 14px;

  @media (max-width: $breakpoint-sm) {
    padding: $spacing-3;
    gap: $spacing-2;
  }
}

.kpi-decor {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.kpi-icon {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--glass-bg);
  border: 1px solid $border-light;
  color: var(--surface-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);

  @media (max-width: $breakpoint-sm) {
    width: 28px;
    height: 28px;
    border-radius: 8px;
  }
}

.kpi-meta {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.kpi-value {
  color: var(--surface-ink);
  font-variant-numeric: tabular-nums;
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-bold;
  letter-spacing: -0.015em;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-base;
  }
}

.active-filters {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  flex-wrap: wrap;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: $spacing-1;
  padding: 4px 8px;
  border-radius: $radius-lg;
  background: rgba(4, 120, 68, 0.1);
  border: 1px solid rgba(4, 120, 68, 0.2);
  font-size: $font-size-xs;
  color: $primary;

  &--clear {
    background: transparent;
    border: 1px solid $border-light;
    color: $text-muted;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: $bg-gray;
      color: $text-secondary;
    }
  }
}

.filter-chip__label {
  font-weight: $font-medium;
}

.filter-chip__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: $primary;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
}

.filter-chip__remove-icon {
  width: 12px;
  height: 12px;
  stroke-width: 2.5;
}
</style>
