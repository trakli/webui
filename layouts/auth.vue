<script setup>
import AuthCarousel from '@/components/auth/AuthCarousel.vue';
import ThemeToggleButton from '@/components/ThemeToggleButton.vue';
</script>

<template>
  <div class="page-wrapper">
    <div class="theme-toggle-wrapper">
      <ClientOnly>
        <ThemeToggleButton />
      </ClientOnly>
    </div>
    <div class="auth-container">
      <ClientOnly>
        <AuthCarousel class="auth-carousel" />
      </ClientOnly>
      <div class="form-container">
        <slot />
      </div>
    </div>
    <div class="global-copyright">
      &copy; {{ new Date().getFullYear() }} Trakli. All Right Reserved
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.page-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  padding: 0;
  background-color: $bg-light;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/background-floating-docs.svg') no-repeat center;
    background-size: cover;
    z-index: 0;
    pointer-events: none;

    :root.dark & {
      filter: invert(1) hue-rotate(180deg);
      opacity: 0.12;
    }
  }
}

.theme-toggle-wrapper {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 10;

  @media (max-width: 639px) {
    top: 1rem;
    right: 1rem;
  }
}

.auth-carousel {
  @media (max-width: 1023px) {
    display: none;
  }
}

.auth-container {
  display: flex;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  flex: 1;
  position: relative;
  z-index: 1;
  gap: 2rem;

  @media (max-width: 1023px) {
    flex-direction: column;
    padding: 1.5rem 1rem;
    gap: 1.5rem;
  }

  @media (max-width: 639px) {
    padding: 1rem 0.75rem;
  }
}

.form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.global-copyright {
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);

  @media (max-width: 639px) {
    display: none;
  }
}
</style>

<style lang="scss">
body:has(.page-wrapper) {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
</style>
