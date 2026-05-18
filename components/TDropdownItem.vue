<template>
  <button class="dropdown-item">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.dropdown-item {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  width: 100%;
  min-height: 40px;
  padding: $spacing-2 $spacing-3;
  border-radius: 8px;
  text-align: left;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: $font-size-sm;
  font-weight: $font-medium;
  color: $text-primary;
  transition:
    background-color $duration-fast $easing-standard,
    color $duration-fast $easing-standard;

  &:hover {
    background-color: $primary-light;
    color: $primary;
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: -2px;
  }

  &:active {
    background-color: rgba(var(--color-primary-rgb), 0.16);
  }
}
</style>
