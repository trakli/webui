<!-- components/auth/AuthLayout.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import AuthCarousel from '@/components/auth/AuthCarousel.vue';

const screenWidth = ref(window.innerWidth);

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', updateScreenWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth);
});
</script>

<template>
  <div class="page-wrapper">
    <div class="floating-docs-pattern"></div>

    <div
      class="auth-container"
      :class="{
        'layout-mobile': screenWidth < 640,
        'layout-tablet': screenWidth >= 640 && screenWidth < 1024,
        'layout-desktop': screenWidth >= 1024
      }"
    >
      <AuthCarousel v-if="screenWidth >= 1024" />

      <div class="form-content">
        <slot />
      </div>
    </div>

    <div v-if="screenWidth >= 640" class="global-footer">
      © {{ new Date().getFullYear() }} Trakli. All Right Reserved
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/assets/_variables.scss' as *;

.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $primary-color;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  padding: 0;
}

.floating-docs-pattern {
  position: absolute;
  inset: 0;
  background: url('/background.svg') no-repeat center;
  background-size: cover;
  opacity: 0.9;
  z-index: 0;
}

.auth-container {
  display: flex;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: $spacing-4;
  flex: 1;
  position: relative;
  z-index: 1;
  gap: $spacing-6;

  &.layout-mobile,
  &.layout-tablet {
    flex-direction: column;
    gap: $spacing-4;
    padding: $spacing-6 $spacing-4;
  }
}

.form-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.global-footer {
  text-align: center;
  padding: $spacing-4;
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.7);
  z-index: 2;

  @media (max-width: $breakpoint-sm - 1) {
    display: none;
  }
}
</style>
