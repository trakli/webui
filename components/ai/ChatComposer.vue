<template>
  <form class="composer" @submit.prevent="handleSubmit">
    <textarea
      ref="textareaEl"
      :value="modelValue"
      rows="1"
      class="chat-input"
      :placeholder="t('Ask me anything about your finances...')"
      :disabled="disabled"
      @input="handleInput"
      @keydown="handleKeydown"
    />
    <button
      type="submit"
      class="send-btn"
      :title="t('Send')"
      :disabled="disabled || !modelValue.trim()"
    >
      <Send :size="16" />
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { Send } from 'lucide-vue-next';

const { t } = useI18n();

const props = defineProps<{
  modelValue: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'submit'): void;
}>();

const textareaEl = ref<HTMLTextAreaElement | null>(null);

const autoResize = () => {
  const el = textareaEl.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
};

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
  autoResize();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSubmit();
  }
};

const handleSubmit = () => {
  if (!props.modelValue.trim() || props.disabled) return;
  emit('submit');
};

watch(
  () => props.modelValue,
  async (value) => {
    if (value === '') {
      await nextTick();
      autoResize();
    }
  }
);

defineExpose({
  focus: () => textareaEl.value?.focus()
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.composer {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-4;
  border-top: 1px solid $border-light;
  background: $bg-white;
}

.chat-input {
  flex: 1;
  resize: none;
  padding: $spacing-2 $spacing-3;
  border: 1px solid $border-light;
  border-radius: $radius-lg;
  outline: none;
  font-size: $font-size-base;
  font-family: inherit;
  background: $bg-gray;
  color: $text-primary;
  line-height: 1.4;
  max-height: 160px;
  overflow-y: auto;
  transition: $transition-base;

  &::placeholder {
    color: $text-muted;
  }

  &:focus {
    background: $bg-white;
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
  }
}

.send-btn {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  background: $primary;
  color: $bg-white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: $transition-base;

  &:hover:not(:disabled) {
    background: $primary-hover;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}
</style>
