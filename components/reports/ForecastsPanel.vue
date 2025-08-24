<template>
  <div class="card">
    <button class="card-header" type="button" @click="isOpen = !isOpen">
      <div class="title-row">
        <TrendingUp class="title-icon" />
        <h2 class="title">Forecasts</h2>
      </div>
      <component :is="isOpen ? ChevronUp : ChevronDown" class="chevron" />
    </button>

    <transition name="collapse">
      <div v-show="isOpen" class="panel-grid">
        <div class="panel-col">
          <h3 class="sub-title">
            <Brain class="inline-icon" />
            <span>Predictive Forecast</span>
          </h3>
          <p class="muted">
            Based on your historical data, here's your projected income for next month.
          </p>
          <div class="forecast-row">
            <p class="forecast-value">${{ projectedIncome }}</p>
            <p class="forecast-range">+$500</p>
          </div>
        </div>
        <div class="panel-col">
          <h3 class="sub-title">
            <Lightbulb class="inline-icon" />
            <span>What-if Scenarios</span>
          </h3>
          <p class="muted">Type a scenario below to see how it affects your projections.</p>
          <div class="whatif-row">
            <input
              v-model="scenarioText"
              type="text"
              class="form-input flex-1"
              :class="{ disabled: disableInput }"
              :disabled="disableInput"
              placeholder="e.g., Increase freelance hours by 20%"
            />
            <button type="button" class="submit-btn" @click="simulate">Simulate</button>
          </div>
          <p v-if="simulatedIncrease > 0" class="result">
            <span class="bold">Result:</span> {{ resultText }}
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Brain, Lightbulb, TrendingUp, ChevronDown, ChevronUp } from 'lucide-vue-next';

const props = defineProps({
  totalIncome: { type: Number, required: true },
  averageMonthlyIncome: { type: Number, required: true },
  disableInput: { type: Boolean, default: true }
});

const isOpen = ref(true);
const scenarioText = ref('');
const simulatedIncrease = ref(0);

const projectedIncome = computed(() => {
  if (simulatedIncrease.value > 0) {
    return Math.round(props.totalIncome + simulatedIncrease.value);
  }
  return 7800;
});

const simulate = () => {
  const matches = scenarioText.value.match(/(\d+)%/);
  const percent = matches ? Number(matches[1]) / 100 : 0.2; // default 20%
  simulatedIncrease.value = Math.round(props.averageMonthlyIncome * percent);
};

const resultText = computed(
  () =>
    `Increasing your side hustle by ${((simulatedIncrease.value / props.averageMonthlyIncome) * 100).toFixed(0)}% is projected to increase your total income by an additional $${simulatedIncrease.value}.`
);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.card {
  background: $bg-white;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
  padding: $spacing-4;
}

.card-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-row {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
}

.title-icon {
  width: 20px;
  height: 20px;
  color: $primary;
}

.title {
  font-size: $font-size-lg;
  font-weight: $font-semibold;
}

.chevron {
  width: 20px;
  height: 20px;
  color: $text-muted;
}

.panel-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-4;
  margin-top: $spacing-2;
  @media (min-width: $breakpoint-md) {
    grid-template-columns: 1fr 1fr;
  }
}

.sub-title {
  display: inline-flex;
  align-items: center;
  gap: $spacing-1;
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  margin-bottom: $spacing-1;
}

.inline-icon {
  width: 16px;
  height: 16px;
  color: $text-muted;
}

.muted {
  color: $text-secondary;
  font-size: $font-size-sm;
  margin-bottom: $spacing-2;
}

.forecast-row {
  display: inline-flex;
  align-items: flex-end;
  gap: $spacing-2;
}

.forecast-value {
  font-size: $font-size-2xl;
  font-weight: $font-bold;
  color: $primary-hover;
}

.forecast-range {
  color: $text-muted;
  margin-bottom: $spacing-1;
}

.whatif-row {
  display: flex;
  align-items: center;
  gap: $spacing-2;
}

.form-input.disabled {
  cursor: not-allowed;
  opacity: 0.8;
  width: 100%;
}

.result {
  margin-top: $spacing-3;
  font-size: $font-size-sm;
  background: $primary-light;
  color: $primary;
  padding: $spacing-2 $spacing-3;
  border-radius: $radius-lg;
}

.bold {
  font-weight: $font-bold;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.collapse-enter-active,
.collapse-leave-active {
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 1000px;
  opacity: 1;
}
</style>
