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
@use '~/assets/_variables' as *;

.dashboard-page {
  width: 1500px;
  height: 1440px;
  background-color: $bg-gray;
  overflow-y: auto;
}

.dashboard-content-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 62px;
  margin-left: 228px;
  padding: 5px;
}
</style>

<style lang="scss">
/* Global styles to hide footer on dashboard page */
.dashboard-page ~ footer,
body:has(.dashboard-page) footer {
  display: none !important;
}
</style>
