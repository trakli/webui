<template>
  <div class="dashboard-page">
    <TNavbar />
    <div class="dashboard-content-wrapper">
      <DashboardContentSection />
    </div>
    <TSidebar />
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
  display: flex;
  min-height: 100vh;
  background-color: $bg-gray;
  margin-left: var(--sidebar-width, 250px);
  transition: margin-left 0.3s ease;
  width: calc(100% - var(--sidebar-width, 250px));
  overflow-x: hidden; /* Prevent horizontal scroll on the page */
}

.dashboard-content-wrapper {
  width: 100%;
  padding: 0 1.5rem 1.5rem;
  margin-top: 62px; // Navbar height
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}
</style>

<style lang="scss">
/* Global styles to hide footer on dashboard page */
.dashboard-page ~ footer,
body:has(.dashboard-page) footer {
  display: none !important;
}
</style>
