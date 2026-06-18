<template>
  <div class="chat-callout-block" :class="`is-${variant}`">
    <component :is="icon" :size="18" class="callout-icon" />
    <div class="callout-body">
      <p v-if="title" class="callout-title">{{ title }}</p>
      <p class="callout-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Info, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-vue-next';

const props = defineProps<{ text?: string; title?: string; variant?: string }>();

const ALLOWED = ['info', 'success', 'warning', 'danger'];
const variant = computed(() => (ALLOWED.includes(props.variant ?? '') ? props.variant : 'info'));
const text = computed(() => props.text ?? '');
const title = computed(() => props.title ?? '');

const icon = computed(() => {
  switch (variant.value) {
    case 'success':
      return CheckCircle2;
    case 'warning':
      return AlertTriangle;
    case 'danger':
      return AlertOctagon;
    default:
      return Info;
  }
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.chat-callout-block {
  display: flex;
  gap: $spacing-2;
  align-items: flex-start;
  padding: $spacing-3;
  border-radius: $radius-lg;
  border: 1px solid $primary-muted;
  border-left-width: 3px;
  background: $bg-white;

  .callout-icon {
    flex-shrink: 0;
    margin-top: 1px;
  }

  &.is-info {
    border-left-color: $info;
    .callout-icon {
      color: $info;
    }
  }

  &.is-success {
    border-left-color: $income;
    .callout-icon {
      color: $income;
    }
  }

  &.is-warning {
    border-left-color: $warning;
    .callout-icon {
      color: $warning;
    }
  }

  &.is-danger {
    border-left-color: $error-color;
    .callout-icon {
      color: $error-color;
    }
  }
}

.callout-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.callout-title {
  margin: 0;
  font-weight: $font-semibold;
  font-size: $font-size-sm;
}

.callout-text {
  margin: 0;
  font-size: $font-size-sm;
  color: $text-secondary;
}
</style>
