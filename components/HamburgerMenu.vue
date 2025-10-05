<template>
  <button
    class="hamburger-menu"
    :class="{ 'is-active': isOpen }"
    @click="$emit('toggle')"
    aria-label="Toggle navigation menu"
  >
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
  </button>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

defineEmits(['toggle']);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.hamburger-menu {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;

  &:focus {
    outline: none;
  }

  .hamburger-line {
    width: 24px;
    height: 3px;
    background-color: $text-primary;
    border-radius: 2px;
    transition: $transition-base;
    transform-origin: 1px;

    &:first-child {
      transform: rotate(0);
    }

    &:nth-child(2) {
      opacity: 1;
      transform: translateX(0);
    }

    &:nth-child(3) {
      transform: rotate(0);
    }
  }

  &.is-active {
    .hamburger-line {
      &:first-child {
        transform: rotate(45deg);
      }

      &:nth-child(2) {
        opacity: 0;
        transform: translateX(20px);
      }

      &:nth-child(3) {
        transform: rotate(-45deg);
      }
    }
  }
}
</style>
