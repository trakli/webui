<template>
  <div class="card-container">
    <div class="page-header">
      <div class="page-header-left">
        <h1 v-if="user" class="card-title">
          Welcome,
          <span class="card-title-username">{{ user.first_name }} {{ user.last_name }}</span>
        </h1>
        <span class="card-subtitle">
          Here's your financial overview for {{ currentPeriodLabel }}.
        </span>
      </div>
      <div class="page-header-right">
        <button
          v-for="period in availablePeriods.slice(0, 3)"
          :key="period.value"
          class="chip"
          :class="{ 'chip--primary': currentPeriod === period.value }"
          @click="setPeriod(period.value)"
        >
          {{ period.label }}
        </button>
        <button class="chip" @click="toggleCustomPeriod">
          <span>Custom</span>
          <ChevronDown class="chip-icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';
import { useStatistics } from '@/composables/useStatistics';

const { user } = useAuth();
const { currentPeriod, availablePeriods, setPeriod } = useStatistics();

// Local state
const showCustomPeriod = ref(false);

// Computed properties
const currentPeriodLabel = computed(() => {
  const period = availablePeriods.find((p) => p.value === currentPeriod.value);
  return period ? period.label.toLowerCase() : 'this period';
});

// Methods
const toggleCustomPeriod = () => {
  showCustomPeriod.value = !showCustomPeriod.value;
  // TODO: Implement custom date picker
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

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

.chip {
  display: inline-flex;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-1 $spacing-2;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.8);
  color: $text-secondary;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-size: $font-size-xs;
  font-weight: $font-medium;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);

  @media (max-width: $breakpoint-sm) {
    padding: 6px 8px;
    font-size: 10px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    color: $text-primary;
  }

  &--primary {
    background: $primary;
    color: white;
    border-color: $primary;
  }
}

.chip-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  stroke-width: 2;

  @media (max-width: $breakpoint-sm) {
    width: 10px;
    height: 10px;
  }
}
</style>
