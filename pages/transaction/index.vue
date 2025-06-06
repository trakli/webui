<template>
  <div class="transaction-page">
    <TNavbar />
    <div class="transaction-content-wrapper">
      <TransactionContentSection />
    </div>
    <TSidebar />
  </div>
</template>

<script setup>
import TNavbar from '@/components/TNavbar.vue';
import TSidebar from '@/components/TSidebar.vue';
import TransactionContentSection from '~/components/TransactionContentSection.vue';

/* eslint-disable no-undef */
definePageMeta({
  layout: 'default'
});
/* eslint-enable no-undef */
</script>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

.transaction-page {
  display: flex;
  min-height: 100vh;
  background-color: $bg-gray;
  margin-left: var(--sidebar-width, 250px);
  transition: margin-left 0.3s ease;
  width: calc(100% - var(--sidebar-width, 250px));
  overflow-x: hidden; /* Prevent horizontal scroll on the page */
}

.transaction-content-wrapper {
  width: 100%;
  padding: 0 1.5rem 1.5rem;
  margin-top: 62px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}
</style>
