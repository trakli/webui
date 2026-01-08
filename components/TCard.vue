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
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: $transition-base;

  &:hover {
    transform: translateY(-2px);
  }
}

.t-card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid $border-color;
  font-size: 1.25rem;
  font-weight: 600;
}

.t-card-body {
  padding: 1.5rem;
  flex-grow: 1;
}

.t-card-footer {
  padding: 1rem 1.5rem;
  background-color: $bg-light;
  border-top: 1px solid $border-color;
}
</style>
