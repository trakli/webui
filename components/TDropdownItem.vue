<template>
  <button class="dropdown-item">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  color: $text-secondary;

  &:hover {
    background-color: $bg-light;
  }
}
</style>
