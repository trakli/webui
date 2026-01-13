<template>
  <div class="onboarding-layout">
    <div class="theme-toggle-wrapper">
      <ClientOnly>
        <ThemeToggleButton />
      </ClientOnly>
    </div>
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
import ThemeToggleButton from '@/components/ThemeToggleButton.vue';
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.onboarding-layout {
  min-height: 100vh;
  background: $bg-light;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
  position: relative;

  @media (max-width: $breakpoint-md) {
    padding: 1rem;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 0.75rem;
  }
}

.theme-toggle-wrapper {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 10;

  @media (max-width: $breakpoint-sm) {
    top: 1rem;
    right: 1rem;
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
