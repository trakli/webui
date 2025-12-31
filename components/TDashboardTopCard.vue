<template>
  <div class="card-container">
    <div class="page-header">
      <div class="page-header-left">
        <h1 v-if="user" class="card-title">
          {{ t('Welcome,') }}
          <span class="card-title-username">{{ user.first_name }} {{ user.last_name }}</span>
        </h1>
        <span class="card-subtitle">
          {{ t("Here's your financial overview for {period}.", { period: currentPeriodLabel }) }}
        </span>
      </div>
      <div v-if="showFilters" class="page-header-right">
        <button
          v-for="period in availablePeriods.slice(0, 3)"
          :key="period.value"
          class="chip"
          :class="{ 'chip--primary': currentPeriod === period.value && !isCustomActive }"
          @click="handlePresetClick(period.value)"
        >
          {{ t(period.label) }}
        </button>
        <button
          class="chip"
          :class="{ 'chip--primary': isCustomActive }"
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';
import { useStatistics } from '@/composables/useStatistics';
import StatsFilterModal from '@/components/StatsFilterModal.vue';

const { t } = useI18n();

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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
@use '@/assets/scss/_utilities.scss' as *;

.card-container {
  width: 100%;
  background-color: #e6f2ec;
  border-radius: $radius-xl;
  padding: 1rem 1.25rem;
  margin: 0;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;

  @media (min-width: $breakpoint-sm) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.page-header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-title {
  color: #1d3229;
  font-size: $font-size-lg;
  font-weight: $font-bold;
  margin: 0;

  @media (max-width: $breakpoint-md) {
    font-size: $font-size-base;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-sm;
  }
}

.card-title-username {
  color: $primary-hover;
  font-size: $font-size-lg;
  font-weight: $font-bold;

  @media (max-width: $breakpoint-md) {
    font-size: $font-size-base;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-sm;
  }
}

.card-subtitle {
  color: $text-muted;
  font-weight: $font-normal;
  font-size: $font-size-sm;
  margin: 0;

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-xs;
  }
}

.page-header-right {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  flex-wrap: wrap;

  @media (max-width: $breakpoint-sm) {
    gap: $spacing-1;
    justify-content: flex-start;
  }
}

.chip-icon {
  width: 12px;
  height: 12px;
  stroke-width: 2;
  transition: transform 0.2s ease;

  @media (max-width: $breakpoint-sm) {
    width: 10px;
    height: 10px;
  }

  &--rotated {
    transform: rotate(180deg);
  }
}
</style>
