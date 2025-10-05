<template>
  <button class="dropdown-item">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  color: #4a5568;

  &:hover {
    background-color: #f7fafc;
  }
}
</style>
