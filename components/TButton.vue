<script setup>
defineProps({
  text: {
    type: String,
    default: 'Button'
  },
  width: {
    type: [String, Number],
    default: '100%'
  },
  maxWidth: {
    type: [String, Number],
    default: '507px'
  },
  height: {
    type: [String, Number],
    default: '53px'
  }
});
</script>

<template>
  <button
    class="button"
    :style="{
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height
    }"
  >
    <span class="button-text">{{ text }}</span>
  </button>
</template>

<style lang="scss" scoped>
.button {
  background-color: #047844;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  transition: background-color 0.2s;
  border: 1px solid #b0b8b4;

  &:hover {
    background-color: #036a3c;
  }

  &-text {
    color: #e6f2ec;
    font-weight: 700;
    font-size: 16px;
  }
}
</style>
