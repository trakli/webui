<template>
  <div class="onboarding-layout">
    <div class="onboarding-wrapper">
      <div class="logo-container">
        <Logo size="small" />
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup>
import Logo from '@/components/Logo.vue';
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.onboarding-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, $bg-light 0%, $primary-light 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;

  @media (max-width: $breakpoint-md) {
    padding: 1rem;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 0.75rem;
  }
}

.onboarding-wrapper {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  @media (max-width: $breakpoint-sm) {
    gap: 0.75rem;
  }
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;

  @media (max-width: $breakpoint-sm) {
    margin-bottom: 0.25rem;
  }
}
</style>
