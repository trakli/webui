<template>
  <div class="chat-question-block">
    <p class="question-prompt">{{ prompt }}</p>
    <div class="question-options">
      <button
        v-for="(opt, i) in options"
        :key="i"
        type="button"
        class="question-option"
        @click="$emit('select', opt.message)"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface QuestionOption {
  label: string;
  message: string;
}

const props = defineProps<{ prompt?: string; options?: QuestionOption[] }>();
defineEmits<{ (e: 'select', message: string): void }>();

const prompt = computed(() => props.prompt ?? '');
const options = computed<QuestionOption[]>(() =>
  (props.options ?? []).map((o) => ({ label: o.label, message: o.message ?? o.label }))
);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.chat-question-block {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.question-prompt {
  margin: 0;
  font-weight: $font-medium;
  color: $text-primary;
}

.question-options {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
}

.question-option {
  border: 1px solid $primary-muted;
  background: $bg-white;
  color: $primary;
  border-radius: 9999px;
  padding: $spacing-2 $spacing-3;
  font-size: $font-size-sm;
  font-weight: $font-medium;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    background: $primary-light;
    border-color: $primary;
    transform: translateY(-1px);
  }
}
</style>
