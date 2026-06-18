<template>
  <section class="hero surface surface--brand">
    <div class="hero-ambient" aria-hidden="true">
      <BarChart3 class="amb a1" :size="72" :stroke-width="1" />
      <Wallet class="amb a2" :size="64" :stroke-width="1" />
      <Coins class="amb a3" :size="56" :stroke-width="1" />
      <TrendingUp class="amb a4" :size="60" :stroke-width="1" />
      <PieChart class="amb a5" :size="52" :stroke-width="1" />
    </div>

    <div class="hero-body">
      <div class="hero-greeting">
        <h2 class="hero-title">{{ t('Overview') }}</h2>
        <p class="hero-sub">
          {{ t('Showing {period}.', { period: currentPeriodLabel }) }}
        </p>
      </div>

      <div v-if="showFilters" class="hero-controls">
        <DashboardWalletSelector />
        <div class="hero-chips">
          <button
            v-for="period in availablePeriods.slice(0, 3)"
            :key="period.value"
            class="chip"
            :class="{ 'chip--active': currentPeriod === period.value && !isCustomActive }"
            @click="handlePresetClick(period.value)"
          >
            {{ t(period.label) }}
          </button>
          <button
            class="chip chip--custom"
            :class="{ 'chip--active': isCustomActive }"
            @click="toggleCustomPeriod"
          >
            <span>{{ t('Custom') }}</span>
            <ChevronDown class="chip-icon" :class="{ 'chip-icon--rotated': showFilterModal }" />
          </button>
        </div>
      </div>
    </div>

    <StatsFilterModal
      v-if="showFilterModal"
      :initial-filters="currentFilters"
      @close="showFilterModal = false"
      @apply="handleFiltersApply"
    />
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ChevronDown, BarChart3, Wallet, Coins, TrendingUp, PieChart } from 'lucide-vue-next';
import { useStatistics } from '@/composables/useStatistics';
import StatsFilterModal from '@/components/StatsFilterModal.vue';
import DashboardWalletSelector from '@/components/dashboard/DashboardWalletSelector.vue';

const { t, locale } = useI18n();

const _props = defineProps({
  showFilters: {
    type: Boolean,
    default: true
  }
});

const {
  currentPeriod,
  customFilters,
  availablePeriods,
  setPeriod,
  setCustomFilters,
  clearCustomFilters
} = useStatistics();

const showFilterModal = ref(false);

const isCustomActive = computed(() => {
  return currentPeriod.value === 'custom' && customFilters.value !== null;
});

const currentFilters = computed(() => {
  if (customFilters.value) {
    return {
      startDate: customFilters.value.startDate,
      endDate: customFilters.value.endDate,
      walletIds: customFilters.value.walletIds
    };
  }
  return {};
});

const currentPeriodLabel = computed(() => {
  if (isCustomActive.value && customFilters.value) {
    const start = customFilters.value.startDate;
    const end = customFilters.value.endDate;
    if (start && end) {
      return `${formatDate(start)} - ${formatDate(end)}`;
    }
  }
  const period = availablePeriods.find((p) => p.value === currentPeriod.value);
  return period ? t(period.label).toLowerCase() : t('this period');
});

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat(locale.value, { month: 'short', day: 'numeric' }).format(date);
};

const toggleCustomPeriod = () => {
  showFilterModal.value = !showFilterModal.value;
};

const handlePresetClick = (periodValue) => {
  clearCustomFilters();
  setPeriod(periodValue);
};

const handleFiltersApply = (filters) => {
  setCustomFilters({
    startDate: filters.startDate,
    endDate: filters.endDate,
    walletIds: filters.walletIds
  });
  showFilterModal.value = false;
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.hero {
  position: relative;
  width: 100%;
  border-radius: 18px;
  padding: 1rem 1.25rem;
  overflow: hidden;
  border: 1px solid $border-light;
  box-shadow: $elevation-1;
}

.hero-ambient {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;

  .amb {
    position: absolute;
    color: var(--surface-deep);
    opacity: 0.07;
  }
  .a1 {
    top: -10px;
    right: 6%;
    transform: rotate(-10deg);
  }
  .a2 {
    bottom: -14px;
    right: 22%;
    transform: rotate(8deg);
  }
  .a3 {
    top: 20%;
    right: 38%;
    transform: rotate(10deg);
  }
  .a4 {
    bottom: -8px;
    left: 6%;
    transform: rotate(-8deg);
  }
  .a5 {
    top: -8px;
    left: 30%;
    transform: rotate(12deg);
  }
}

.hero-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-3;

  @media (min-width: $breakpoint-sm) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-3;
  }
}

.hero-greeting {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.hero-title {
  margin: 0;
  color: var(--surface-ink);
  font-size: $font-size-lg;
  font-weight: $font-bold;
  letter-spacing: -0.015em;
  line-height: 1.2;

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-base;
  }
}

.hero-sub {
  margin: 0;
  color: var(--surface-ink);
  opacity: 0.7;
  font-size: $font-size-sm;

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-xs;
  }
}

.hero-controls {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  flex-wrap: wrap;

  @media (min-width: $breakpoint-sm) {
    justify-content: flex-end;
  }
}

.hero-chips {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 5px;
  background: var(--glass-bg);
  border: 1px solid $border-light;
  border-radius: 999px;
  backdrop-filter: blur(10px);
  box-shadow: $elevation-1;
  width: fit-content;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 14px;
  border: none;
  background: transparent;
  color: var(--surface-deep);
  border-radius: 999px;
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color $duration-fast $easing-standard,
    color $duration-fast $easing-standard;

  &:hover:not(.chip--active) {
    background: var(--hover-overlay);
    color: var(--surface-ink);
  }

  &--active {
    background: var(--color-primary);
    color: var(--color-text-inverse);
  }
}

.chip-icon {
  width: 14px;
  height: 14px;
  transition: transform $duration-fast $easing-standard;

  &--rotated {
    transform: rotate(180deg);
  }
}
</style>
