<template>
  <div class="chat-progress" aria-label="AI is working">
    <div
      v-for="(step, i) in steps"
      :key="i"
      class="progress-step"
      :class="{ done: i < steps.length - 1 }"
    >
      <Check v-if="i < steps.length - 1" :size="13" class="step-icon" />
      <span v-else class="step-spinner" />
      <span class="step-label">{{ step }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next';

defineProps<{
  steps: string[];
}>();
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.chat-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 2px 0;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: $primary;

  &.done {
    color: $text-muted;
  }
}

.step-icon {
  flex-shrink: 0;
  color: $text-muted;
}

.step-spinner {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  border: 2px solid $primary-light;
  border-top-color: $primary;
  border-radius: 50%;
  animation: progress-spin 0.7s linear infinite;
}

.step-label {
  line-height: 1.3;
}

@keyframes progress-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
