<template>
  <section class="hero surface surface--brand">
    <svg
      class="hero-decor"
      viewBox="0 0 1200 360"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="hero-glow" cx="80%" cy="40%" r="55%">
          <stop offset="0%" stop-color="var(--surface-accent)" stop-opacity="0.55" />
          <stop offset="100%" stop-color="var(--surface-accent)" stop-opacity="0" />
        </radialGradient>
        <pattern id="hero-dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="var(--surface-deep)" opacity="0.12" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="1200" height="360" fill="url(#hero-dots)" />
      <circle cx="1020" cy="160" r="220" fill="url(#hero-glow)" />
      <circle cx="980" cy="60" r="44" fill="var(--surface-accent)" opacity="0.55" />
      <circle cx="1100" cy="280" r="28" fill="var(--surface-deep)" opacity="0.55" />
      <circle cx="880" cy="300" r="14" fill="var(--surface-deep)" opacity="0.4" />
      <circle cx="1150" cy="120" r="10" fill="var(--surface-accent)" opacity="0.8" />
    </svg>

    <div class="hero-body">
      <div class="hero-greeting">
        <h1 v-if="user" class="hero-title">
          {{ t('Welcome,') }}
          <span class="hero-name">{{ user.first_name }} {{ user.last_name }}</span>
        </h1>
        <p class="hero-sub">
          {{ t("Here's your financial overview for {period}.", { period: currentPeriodLabel }) }}
        </p>
      </div>

      <div v-if="showFilters" class="hero-chips">
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
import { ChevronDown } from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';
import { useStatistics } from '@/composables/useStatistics';
import StatsFilterModal from '@/components/StatsFilterModal.vue';

const { t, locale } = useI18n();

const _props = defineProps({
  showFilters: {
    type: Boolean,
    default: true
  }
});

const { user } = useAuth();
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

.hero-decor {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
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

.hero-name {
  color: var(--surface-deep);
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
