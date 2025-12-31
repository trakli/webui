<template>
  <div class="kpi-section">
    <div class="kpi-header">
      <div class="wallet-selector" @click="toggleDropdown">
        <span class="wallet-name">{{ selectedWalletName }}</span>
        <ChevronDown class="chevron" :class="{ rotated: showDropdown }" />

        <div v-if="showDropdown" class="wallet-dropdown">
          <div
            v-for="wallet in availableWallets"
            :key="wallet.id || 'all'"
            class="wallet-option"
            :class="{ selected: selectedWalletId === wallet.id }"
            @click.stop="selectWallet(wallet.id)"
          >
            {{ wallet.name }}
          </div>
        </div>
      </div>

      <div v-if="isCustomActive && activeFilterChips.length > 0" class="active-filters">
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
      <div class="kpi-card">
        <div class="kpi-label">{{ t('Balance') }}</div>
        <div class="kpi-value">{{ formatCurrency(statistics?.total_balance || 0) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">{{ t('Income') }}</div>
        <div class="kpi-value is-positive">{{ formatCurrency(statistics?.total_income || 0) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">{{ t('Expenses') }}</div>
        <div class="kpi-value is-negative">
          {{ formatCurrency(statistics?.total_expenses || 0) }}
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">{{ t('Net') }}</div>
        <div class="kpi-value" :class="netClass">{{ formatCurrency(netValue) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { ChevronDown, X as XIcon } from 'lucide-vue-next';
import { useStatistics } from '@/composables/useStatistics';
import { useWallets } from '@/composables/useWallets';

const { t } = useI18n();

const { wallets } = useWallets();
const {
  currentStatistics,
  currentPeriod,
  customFilters,
  formatCompactCurrency,
  selectedWalletId,
  availableWallets,
  setSelectedWallet,
  setCustomFilters,
  clearCustomFilters
} = useStatistics();

const statistics = currentStatistics;
const showDropdown = ref(false);

const selectedWalletName = computed(() => {
  if (selectedWalletId.value === null) return t('All Wallets');
  const wallet = availableWallets.value.find((w) => w.id === selectedWalletId.value);
  return wallet ? wallet.name : t('All Wallets');
});

const netValue = computed(() => {
  const income = statistics.value?.total_income || 0;
  const expenses = statistics.value?.total_expenses || 0;
  return income - expenses;
});

const netClass = computed(() => {
  return netValue.value >= 0 ? 'is-positive' : 'is-negative';
});

const formatCurrency = (value) => {
  return formatCompactCurrency(value, 'USD');
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const selectWallet = (walletId) => {
  setSelectedWallet(walletId);
  showDropdown.value = false;
};

const handleClickOutside = (event) => {
  if (!event.target.closest('.wallet-selector')) {
    showDropdown.value = false;
  }
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

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
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

.wallet-selector {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-3;
  background: $bg-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  border: 1px solid $border-color;
  cursor: pointer;
  user-select: none;
  width: fit-content;

  &:hover {
    background: $bg-light;
  }
}

.wallet-name {
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  color: $text-primary;
}

.chevron {
  width: 16px;
  height: 16px;
  color: $text-muted;
  transition: transform 0.2s;

  &.rotated {
    transform: rotate(180deg);
  }
}

.wallet-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: $spacing-1;
  min-width: 180px;
  background: $bg-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  z-index: 100;
  overflow: hidden;
}

.wallet-option {
  padding: $spacing-2 $spacing-3;
  font-size: $font-size-sm;
  color: $text-primary;
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background: $bg-light;
  }

  &.selected {
    background: rgba($primary, 0.1);
    color: $primary;
    font-weight: $font-medium;
  }
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
  background: $bg-white;
  border-radius: $radius-xl;
  box-shadow: $shadow-sm;
  border: 1px solid $border-color;
  padding: $spacing-4;
  display: flex;
  flex-direction: column;

  @media (max-width: $breakpoint-sm) {
    padding: $spacing-3;
  }
}

.kpi-label {
  font-size: $font-size-xs;
  font-weight: $font-medium;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: $text-muted;
  margin-bottom: $spacing-1;
}

.kpi-value {
  font-size: $font-size-xl;
  font-weight: $font-bold;
  color: $text-primary;

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-lg;
  }

  &.is-positive {
    color: $primary;
  }

  &.is-negative {
    color: $error-color;
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
