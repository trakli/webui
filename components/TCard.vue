<template>
  <div class="t-card">
    <header v-if="$slots.header" class="t-card-header">
      <slot name="header" />
    </header>
    <main class="t-card-body">
      <slot />
    </main>
    <footer v-if="$slots.footer" class="t-card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.t-card {
  background-color: $bg-white;
  border: 1px solid $border-color;
  border-radius: 16px;
  box-shadow: $elevation-1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition:
    box-shadow $duration-base $easing-standard,
    border-color $duration-base $easing-standard;

  &:hover {
    box-shadow: $elevation-2;
    border-color: $border-medium;
  }
}

.t-card-header {
  padding: $spacing-4 $spacing-6;
  border-bottom: 1px solid $border-color;
  font-size: $font-size-lg;
  font-weight: $font-semibold;
  letter-spacing: -0.01em;
  color: $text-primary;
}

.t-card-body {
  padding: $spacing-6;
  flex-grow: 1;
}

.t-card-footer {
  padding: $spacing-4 $spacing-6;
  background-color: $bg-light;
  border-top: 1px solid $border-color;
}
</style>
