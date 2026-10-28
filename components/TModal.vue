<template>
  <Teleport to="body">
    <transition name="t-modal">
      <div v-if="modelValue" class="t-modal-overlay" @click.self="close">
        <div
          class="t-modal"
          :class="`t-modal--${size}`"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <header class="t-modal-header">
            <div>
              <h2 :id="titleId" class="t-modal-title">{{ title }}</h2>
              <p v-if="description" class="t-modal-description">{{ description }}</p>
            </div>
            <button type="button" class="t-modal-close" :aria-label="t('Close')" @click="close">
              <XMarkIcon />
            </button>
          </header>
          <div class="t-modal-body">
            <p v-if="error" class="t-modal-error" role="alert">{{ error }}</p>
            <slot />
          </div>
          <footer v-if="$slots.actions" class="t-modal-actions">
            <slot name="actions" />
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, useId } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    description?: string;
    error?: string;
    size?: 'small' | 'medium' | 'large';
  }>(),
  { description: '', error: '', size: 'medium' }
);
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
const { t } = useI18n();
const titleId = useId();

function close() {
  emit('update:modelValue', false);
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.modelValue) close();
}

onMounted(() => document.addEventListener('keydown', onKey));
onUnmounted(() => document.removeEventListener('keydown', onKey));
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.t-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-4;
  background: rgba(15, 23, 42, 0.5);

  @media (max-width: $breakpoint-sm) {
    align-items: flex-end;
    padding: 0;
  }
}

.t-modal {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(100vh - 2rem);
  background: $bg-white;
  border-radius: $radius-xl;
  box-shadow: $elevation-5;

  &--small {
    max-width: 26rem;
  }

  &--medium {
    max-width: 34rem;
  }

  &--large {
    max-width: 48rem;
  }

  @media (max-width: $breakpoint-sm) {
    max-width: none;
    max-height: 92vh;
    border-radius: $radius-xl $radius-xl 0 0;
  }
}

.t-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $spacing-4;
  padding: $spacing-5 $spacing-6 $spacing-3;
}

.t-modal-title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-semibold;
  color: $text-primary;
}

.t-modal-description {
  margin: $spacing-1 0 0;
  font-size: $font-size-sm;
  color: $text-secondary;
}

.t-modal-close {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: $radius-md;
  background: none;
  color: $text-secondary;
  cursor: pointer;

  &:hover {
    background: $bg-light;
    color: $text-primary;
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.t-modal-body {
  overflow-y: auto;
  padding: 0 $spacing-6 $spacing-4;
}

.t-modal-error {
  margin: 0 0 $spacing-4;
  padding: $spacing-3 $spacing-4;
  border-radius: $radius-lg;
  background: rgba(var(--color-error-rgb), 0.1);
  color: $error-color;
  font-size: $font-size-sm;
}

.t-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-3;
  padding: $spacing-4 $spacing-6 $spacing-5;
  border-top: 1px solid $border-light;

  :deep(> *) {
    width: auto;
  }

  @media (max-width: $breakpoint-sm) {
    flex-direction: column-reverse;

    :deep(> *) {
      width: 100%;
    }
  }
}

.t-modal-enter-active,
.t-modal-leave-active {
  transition: opacity $duration-fast $easing-standard;
}

.t-modal-enter-from,
.t-modal-leave-to {
  opacity: 0;
}
</style>
