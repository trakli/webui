<template>
  <div class="wallet-card-wrapper">
    <div class="card-container">
      <div class="background-ellipse" />
      <div class="card-content">
        <div class="card-header-content">
          <div class="card-header">
            <span class="total-balance-text">
              {{ selectedWalletName }}
            </span>
            <ChevronDownIcon
              class="chevron-icon"
              :class="{ rotated: showWalletDropdown }"
              @click="toggleWalletDropdown"
            />
          </div>
          <span class="balance-amount-text">
            {{
              isLoading
                ? 'Loading...'
                : formatCurrency(statistics?.total_balance || 0, primaryCurrency)
            }}
          </span>
        </div>
        <button class="three-dots-button">
          <EllipsisHorizontalIcon class="three-dots" />
        </button>
      </div>
      <div class="card-footer">
        <button class="income-button">
          <div class="income-button-content">
            <ArrowDownLeftIcon class="income-arrow-icon" />
            <span class="income-button-text">Income</span>
          </div>
          <span class="income-card-amount-text">
            {{
              isLoading
                ? 'Loading...'
                : formatCompactCurrency(statistics?.total_income || 0, primaryCurrency)
            }}
          </span>
        </button>
        <button class="expense-button">
          <div class="expense-button-content">
            <ArrowUpLeftIcon class="expense-arrow-icon" />
            <span class="expense-button-text">Expense</span>
          </div>
          <span class="expense-card-amount-text">
            {{
              isLoading
                ? 'Loading...'
                : formatCompactCurrency(statistics?.total_expenses || 0, primaryCurrency)
            }}
          </span>
        </button>
      </div>
    </div>

    <div v-if="showWalletDropdown" class="wallet-dropdown">
      <div
        v-for="wallet in availableWallets"
        :key="wallet.id || 'all'"
        class="wallet-option"
        :class="{ selected: selectedWalletId === wallet.id }"
        @click="selectWallet(wallet.id)"
      >
        <span class="wallet-option__name">{{ wallet.name }}</span>
        <span v-if="wallet.id !== null" class="wallet-option__currency">{{ wallet.currency }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { EllipsisHorizontalIcon } from '@heroicons/vue/16/solid';
import { ArrowDownLeftIcon, ArrowUpLeftIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';
import { useStatistics } from '@/composables/useStatistics';

const {
  currentPeriod,
  selectedWalletId,
  isLoading,
  availableWallets,
  getStatistics,
  setSelectedWallet,
  formatCurrency,
  formatCompactCurrency
} = useStatistics();

// Local state for UI interactions
const showWalletDropdown = ref(false);
const statistics = ref(null);

// Computed properties
const selectedWalletName = computed(() => {
  if (selectedWalletId.value === null) return 'All Wallets';
  const wallet = availableWallets.value.find((w) => w.id === selectedWalletId.value);
  return wallet ? wallet.name : 'All Wallets';
});

const primaryCurrency = computed(() => {
  if (selectedWalletId.value === null) {
    // For "All Wallets", use USD as the conversion target
    return 'USD';
  }
  // For specific wallet, use that wallet's currency
  const wallet = availableWallets.value.find((w) => w.id === selectedWalletId.value);
  return wallet?.currency || 'USD';
});

// Methods
const toggleWalletDropdown = () => {
  showWalletDropdown.value = !showWalletDropdown.value;
};

const selectWallet = (walletId) => {
  setSelectedWallet(walletId);
  showWalletDropdown.value = false;
  loadStatistics();
};

const loadStatistics = async () => {
  try {
    statistics.value = await getStatistics(selectedWalletId.value, currentPeriod.value);
  } catch (err) {
    console.error('Error loading wallet statistics:', err);
  }
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.wallet-card-wrapper')) {
    showWalletDropdown.value = false;
  }
};

// Watchers
watch([selectedWalletId, currentPeriod], () => {
  loadStatistics();
});

// Lifecycle
onMounted(() => {
  loadStatistics();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.wallet-card-wrapper {
  position: relative;
  width: 100%;
}

.card-container {
  width: 100%;
  min-height: 158px;
  background-color: #f5f6f5;
  border: 0.5px solid #c0c6c3;
  border-radius: $radius-xl;
  position: relative;
  box-sizing: border-box;
  overflow: hidden; // Clip the ellipse to card boundaries
  padding: 16px;
  display: flex;
  flex-direction: column;
  z-index: 10; // Ensure wallet card is above other elements
}

.background-ellipse {
  position: absolute;
  width: 461px;
  height: 461px;
  left: -141px;
  top: -130px;
  background: #e6f2ec;
  border-radius: 50%;
  z-index: -1; // Move behind all content
}

.card-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  flex: 1;
  position: relative;
  z-index: 1;
}

.card-header-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
}

.card-header {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.total-balance-text {
  color: #1d3229;
  font-weight: $font-normal;
  font-size: $font-size-xs;
}

.chevron-icon {
  width: 16px;
  height: 16px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &.rotated {
    transform: rotate(180deg);
  }
}

.balance-amount-text {
  font-weight: $font-bold;
  font-size: $font-size-xl;

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-lg;
  }
}

.three-dots-button {
  width: 36px;
  height: 36px;
  background-color: #cde4da;
  border-radius: $radius-lg;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.three-dots {
  width: 20px;
  height: 20px;
  color: #036a3c;
}

.card-footer {
  width: 100%;
  height: 55px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  position: relative;
  z-index: 1;
}

.income-button {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 114px;
  height: 45px;
  border-radius: $radius-lg;
  padding: 3px 6px;
  background-color: #ccffd7;
  overflow: hidden;
}

.income-button-content {
  width: 98px;
  height: 16px;
  gap: 4px;
  display: flex;
  flex-direction: row;
}

.income-arrow-icon {
  width: 16px;
  height: 16px;
  color: #00c12a;
}

.income-button-text {
  font-weight: $font-normal;
  font-size: $font-size-xs;
  color: #00c12a;
}

.income-card-amount-text {
  font-weight: $font-bold;
  font-size: $font-size-sm;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.1;
}

.expense-button {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 114px;
  height: 45px;
  border-radius: $radius-lg;
  padding: 3px 6px;
  background-color: #ffcccc;
  overflow: hidden;
}

.expense-button-content {
  width: 98px;
  height: 16px;
  gap: 4px;
  display: flex;
  flex-direction: row;
}

.expense-arrow-icon {
  width: 16px;
  height: 16px;
  color: #c10000;
}

.expense-button-text {
  font-weight: $font-normal;
  font-size: $font-size-xs;
  color: #c10000;
}

.expense-card-amount-text {
  font-weight: $font-bold;
  font-size: $font-size-sm;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.1;
}

.wallet-dropdown {
  position: absolute;
  top: 70px; // Position below the card header area
  left: 16px; // Match card padding
  right: 16px; // Match card padding
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: $radius-lg;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 50;
  overflow: hidden;
  max-height: 200px;
  overflow-y: auto;
}

.wallet-option {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  font-size: $font-size-sm;
  font-weight: $font-medium;
  color: $text-primary;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f3f4f6;
  }

  &.selected {
    background-color: #e6f2ec;
    color: $primary;
    font-weight: $font-bold;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
  }
}

.wallet-option__name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wallet-option__currency {
  flex: 0 0 auto;
  opacity: 0.75;
}
</style>
