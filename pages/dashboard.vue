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
  background-color: $bg-gray;
  min-height: 100vh;
}

.dashboard-content-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  margin-top: 80px;
  margin-left: 328px;
  padding: 20px;
}
</style>
