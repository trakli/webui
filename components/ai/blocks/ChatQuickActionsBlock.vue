<template>
  <div class="chat-quick-actions-block">
    <button
      v-for="(action, i) in actions"
      :key="i"
      type="button"
      class="quick-action"
      @click="$emit('select', action.label)"
    >
      {{ action.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface QuickAction {
  label: string;
  tool?: string;
  args?: Record<string, unknown>;
}

const props = defineProps<{ actions?: QuickAction[] }>();
defineEmits<{ (e: 'select', message: string): void }>();

const actions = computed<QuickAction[]>(() =>
  (props.actions ?? []).filter((a) => a && typeof a.label === 'string')
);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.chat-quick-actions-block {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
}

.quick-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid $border-light;
  background: $bg-white;
  color: $text-secondary;
  border-radius: 9999px;
  padding: $spacing-2 $spacing-3;
  font-size: $font-size-sm;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    background: $primary-light;
    color: $primary;
    border-color: $primary-muted;
    transform: translateY(-1px);
  }
}
</style>
