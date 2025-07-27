<script setup>
const props = defineProps({
  text: {
    type: String,
    default: 'Button'
  },
  variant: {
    type: String,
    default: 'primary', // 'primary', 'secondary', 'outline', 'text'
    validator: (value) => ['primary', 'secondary', 'outline', 'text'].includes(value)
  },
  size: {
    type: String,
    default: 'medium', // 'small', 'medium', 'large'
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  fullWidth: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button'
  },
  to: {
    type: [String, Object],
    default: null
  }
});

const buttonClasses = [
  'button',
  `button--${props.variant}`,
  `button--${props.size}`,
  {
    'button--full-width': props.fullWidth,
    'button--disabled': props.disabled
  }
];
</script>

<template>
  <NuxtLink v-if="to" :to="to" :class="buttonClasses" :disabled="disabled">
    <span class="button__text">
      <slot>{{ text }}</slot>
    </span>
  </NuxtLink>
  <button v-else :class="buttonClasses" :type="type" :disabled="disabled">
    <span class="button__text">
      <slot>{{ text }}</slot>
    </span>
  </button>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: $radius-md;
  font-weight: $font-semibold;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  transition: $transition-base;
  user-select: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  line-height: 1.5;
  position: relative;
  overflow: hidden;

  // Variants
  &--primary {
    background-color: $primary;
    color: $bg-white;
    border-color: $primary;

    &:hover:not(:disabled) {
      background-color: $primary-hover;
      border-color: $primary-hover;
    }
  }

  // Sizes
  &--small {
    padding: $spacing-2 $spacing-4;
    font-size: $font-size-sm;
  }

  &--medium {
    padding: $spacing-3 $spacing-6;
    font-size: $font-size-base;
  }

  &--large {
    padding: $spacing-4 $spacing-8;
    font-size: $font-size-lg;
    min-height: 53px;
  }

  // States
  &--full-width {
    width: 100%;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  // Text element
  &__text {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
}
</style>
