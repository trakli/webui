<template>
  <div class="filter-modal-overlay" @click.self="$emit('close')">
    <div class="filter-modal">
      <div class="filter-modal__header">
        <h3 class="filter-modal__title">{{ t('Filter Statistics') }}</h3>
        <button class="filter-modal__close" @click="$emit('close')">
          <XIcon class="filter-modal__close-icon" />
        </button>
      </div>

      <div class="filter-modal__body">
        <div class="filter-modal__section">
          <h4 class="filter-modal__section-title">{{ t('Date Range') }}</h4>
          <div class="filter-modal__date-inputs">
            <div class="filter-modal__field">
              <label class="filter-modal__label">{{ t('Start date') }}</label>
              <input
                v-model="filters.startDate"
                type="date"
                class="filter-modal__input"
                :max="filters.endDate || today"
              />
            </div>
            <div class="filter-modal__field">
              <label class="filter-modal__label">{{ t('End date') }}</label>
              <input
                v-model="filters.endDate"
                type="date"
                class="filter-modal__input"
                :min="filters.startDate || undefined"
                :max="today"
              />
            </div>
          </div>
          <div class="filter-modal__presets">
            <button
              v-for="preset in datePresets"
              :key="preset.value"
              class="filter-modal__preset-btn"
              :class="{ 'filter-modal__preset-btn--active': isPresetActive(preset.value) }"
              @click="applyPreset(preset.value)"
            >
              {{ t(preset.label) }}
            </button>
          </div>
        </div>

        <div class="filter-modal__section">
          <h4 class="filter-modal__section-title">{{ t('Wallets') }}</h4>
          <div class="filter-modal__wallets">
            <label
              v-for="wallet in availableWallets"
              :key="wallet.id ?? 'all'"
              class="filter-modal__wallet-option"
            >
              <input
                type="checkbox"
                :value="wallet.id"
                :checked="isWalletSelected(wallet.id)"
                class="filter-modal__checkbox"
                @change="toggleWallet(wallet.id)"
              />
              <span class="filter-modal__wallet-name">{{ wallet.name }}</span>
              <span v-if="wallet.currency" class="filter-modal__wallet-currency">
                {{ wallet.currency }}
              </span>
            </label>
          </div>
        </div>
      </div>

      <div class="filter-modal__footer">
        <button class="filter-modal__btn filter-modal__btn--secondary" @click="resetFilters">
          {{ t('Reset') }}
        </button>
        <button class="filter-modal__btn filter-modal__btn--primary" @click="applyFilters">
          {{ t('Apply Filters') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue';
import { XMarkIcon as XIcon } from '@heroicons/vue/24/outline';
import { useStatistics } from '@/composables/useStatistics';
import { useWallets } from '@/composables/useWallets';

const emit = defineEmits(['close', 'apply']);

const { t } = useI18n();

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({})
  }
});

const { wallets } = useWallets();
const { currentPeriod } = useStatistics();

const today = new Date().toISOString().split('T')[0];

const filters = reactive({
  startDate: props.initialFilters.startDate || '',
  endDate: props.initialFilters.endDate || today,
  walletIds: props.initialFilters.walletIds || []
});

const datePresets = [
  { label: 'This Week', value: 'current_week' },
  { label: 'This Month', value: 'current_month' },
  { label: 'Last 3 months', value: 'last_3_months' },
  { label: 'This Year', value: 'current_year' },
  { label: 'All time', value: 'all_time' }
];

const availableWallets = computed(() => {
  return wallets.value.map((w) => ({
    id: w.id,
    name: w.name,
    currency: w.currency
  }));
});

const isWalletSelected = (walletId) => {
  if (filters.walletIds.length === 0) return true;
  return filters.walletIds.includes(walletId);
};

const toggleWallet = (walletId) => {
  const index = filters.walletIds.indexOf(walletId);
  if (index === -1) {
    if (filters.walletIds.length === 0) {
      filters.walletIds = availableWallets.value.filter((w) => w.id !== walletId).map((w) => w.id);
    } else {
      filters.walletIds.push(walletId);
    }
  } else {
    filters.walletIds.splice(index, 1);
    if (filters.walletIds.length === availableWallets.value.length - 1) {
      filters.walletIds = [];
    }
  }
};

const isPresetActive = (presetValue) => {
  return currentPeriod.value === presetValue && !filters.startDate;
};

const applyPreset = (preset) => {
  const now = new Date();
  let start, end;

  switch (preset) {
    case 'current_week': {
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      start = new Date(now);
      start.setDate(start.getDate() - daysToMonday);
      end = now;
      break;
    }
    case 'current_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = now;
      break;
    case 'last_3_months':
      start = new Date(now);
      start.setMonth(start.getMonth() - 3);
      end = now;
      break;
    case 'current_year':
      start = new Date(now.getFullYear(), 0, 1);
      end = now;
      break;
    case 'all_time':
      start = new Date(2000, 0, 1);
      end = now;
      break;
    default:
      return;
  }

  filters.startDate = start.toISOString().split('T')[0];
  filters.endDate = end.toISOString().split('T')[0];
};

const resetFilters = () => {
  filters.startDate = '';
  filters.endDate = today;
  filters.walletIds = [];
};

const applyFilters = () => {
  emit('apply', {
    startDate: filters.startDate,
    endDate: filters.endDate,
    walletIds: filters.walletIds
  });
};

onMounted(() => {
  if (!filters.startDate && currentPeriod.value) {
    applyPreset(currentPeriod.value);
  }
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.filter-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-index-modal;
  padding: $spacing-4;
}

.filter-modal {
  background: $bg-white;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.filter-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-4 $spacing-5;
  border-bottom: 1px solid $border-light;
}

.filter-modal__title {
  font-size: $font-size-lg;
  font-weight: $font-semibold;
  color: $text-primary;
  margin: 0;
}

.filter-modal__close {
  background: none;
  border: none;
  padding: $spacing-2;
  cursor: pointer;
  color: $text-muted;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: $bg-gray;
    color: $text-primary;
  }
}

.filter-modal__close-icon {
  width: 20px;
  height: 20px;
}

.filter-modal__body {
  padding: $spacing-5;
  overflow-y: auto;
  flex: 1;
}

.filter-modal__section {
  margin-bottom: $spacing-5;

  &:last-child {
    margin-bottom: 0;
  }
}

.filter-modal__section-title {
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  color: $text-secondary;
  margin: 0 0 $spacing-3;
}

.filter-modal__date-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-3;
  margin-bottom: $spacing-3;

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
  }
}

.filter-modal__field {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
}

.filter-modal__label {
  font-size: $font-size-xs;
  font-weight: $font-medium;
  color: $text-muted;
}

.filter-modal__input {
  padding: $spacing-2 $spacing-3;
  border: 1px solid $border-light;
  border-radius: $radius-lg;
  font-size: $font-size-sm;
  background: $input-bg;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow: 0 0 0 2px $input-focus;
  }
}

.filter-modal__presets {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
}

.filter-modal__preset-btn {
  padding: $spacing-1 $spacing-3;
  border-radius: 999px;
  border: 1px solid $border-light;
  background: $bg-white;
  font-size: $font-size-xs;
  font-weight: $font-medium;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: $bg-gray;
    border-color: $border-medium;
  }

  &--active {
    background: $primary-light;
    border-color: $primary;
    color: $primary;
  }
}

.filter-modal__wallets {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  max-height: 200px;
  overflow-y: auto;
}

.filter-modal__wallet-option {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-3;
  border-radius: $radius-lg;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: $bg-gray;
  }
}

.filter-modal__checkbox {
  width: 16px;
  height: 16px;
  accent-color: $primary;
  cursor: pointer;
}

.filter-modal__wallet-name {
  flex: 1;
  font-size: $font-size-sm;
  color: $text-primary;
}

.filter-modal__wallet-currency {
  font-size: $font-size-xs;
  color: $text-muted;
  padding: 2px 6px;
  background: $bg-gray;
  border-radius: $radius-md;
}

.filter-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-3;
  padding: $spacing-4 $spacing-5;
  border-top: 1px solid $border-light;
}

.filter-modal__btn {
  padding: $spacing-2 $spacing-5;
  border-radius: $radius-lg;
  font-size: $font-size-sm;
  font-weight: $font-medium;
  cursor: pointer;
  transition: all 0.2s ease;

  &--secondary {
    background: transparent;
    border: 1px solid $border-light;
    color: $text-secondary;

    &:hover {
      background: $bg-gray;
    }
  }

  &--primary {
    background: $primary;
    border: 1px solid $primary;
    color: $bg-white;

    &:hover {
      background: $primary-hover;
    }
  }
}
</style>
