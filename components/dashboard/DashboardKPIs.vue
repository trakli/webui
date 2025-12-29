<template>
  <div class="kpi-section">
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

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Balance</div>
        <div class="kpi-value">{{ formatCurrency(statistics?.total_balance || 0) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Income</div>
        <div class="kpi-value is-positive">{{ formatCurrency(statistics?.total_income || 0) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Expenses</div>
        <div class="kpi-value is-negative">{{ formatCurrency(statistics?.total_expenses || 0) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Net</div>
        <div class="kpi-value" :class="netClass">{{ formatCurrency(netValue) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import { useStatistics } from '@/composables/useStatistics';

const {
  currentStatistics,
  formatCompactCurrency,
  selectedWalletId,
  availableWallets,
  setSelectedWallet
} = useStatistics();

const statistics = currentStatistics;
const showDropdown = ref(false);

const selectedWalletName = computed(() => {
  if (selectedWalletId.value === null) return 'All Wallets';
  const wallet = availableWallets.value.find((w) => w.id === selectedWalletId.value);
  return wallet ? wallet.name : 'All Wallets';
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
</style>
