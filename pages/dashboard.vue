<template>
  <div class="dashboard-page">
    <TSidebar />
    <TNavbar />
    <div class="dashboard-content-wrapper">
      <DashboardContentSection />
    </div>
  </div>
</template>

<script setup>
import TNavbar from '@/components/TNavbar.vue';
import TSidebar from '@/components/TSidebar.vue';

/* eslint-disable no-undef */
definePageMeta({
  layout: 'default'
});
/* eslint-enable no-undef */
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.dashboard-page {
  --sidebar-width: min(300px, 30vw);
  --sidebar-min-width: 200px;
  display: flex;
  min-height: 100vh;
  background-color: $bg-gray;
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s ease;
  width: calc(100% - var(--sidebar-width));
  overflow-x: hidden;
}

.dashboard-content-wrapper {
  width: 100%;
  padding: 0.5rem 1rem;
  margin-top: $navbar-height;

  margin-left: 2rem;
  margin-right: auto;
  box-sizing: border-box;

  @media (min-width: $breakpoint-xl) {
    padding: 0.25rem 1rem;
  }

  @media (min-width: $breakpoint-2xl) {
    padding: 0.25rem 1rem;
  }
}
</style>

<style lang="scss">
/* Global styles to hide footer on dashboard page */
.dashboard-page ~ footer,
body:has(.dashboard-page) footer {
  display: none !important;
}
</style>
