<template>
  <div class="kpi-card">
    <div class="kpi-label">{{ label }}</div>
    <div class="kpi-value" :class="valueClass">{{ value }}</div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.kpi-card {
  background: gray;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
  padding: 1rem;
}

.kpi-label {
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin-bottom: 0.25rem;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: $font-bold;
  color: $text-primary;

  &.is-positive {
    color: $primary;
  }
  &.is-negative {
    color: $error-color;
  }
}
</style>
