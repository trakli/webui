<template>
  <div class="separator">
    <span class="line"></span>
    <span class="text">OR</span>
    <span class="line"></span>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/variables' as *;

.separator {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: $text-muted;

  .line {
    flex-grow: 1;
    height: 1px;
    background-color: $border-light;
  }

  .text {
    padding: 0 1rem;
    font-size: $font-size-sm;
    font-weight: $font-medium;
  }
}
</style>
