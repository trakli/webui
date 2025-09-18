<template>
  <div class="wallets-page">
    <TNavbar />
    <div class="wallets-content-wrapper">
      <WalletContentSection :pageName="'Wallet'" :pageNamePlural="'Wallets'" />
    </div>
    <TSidebar />
  </div>
</template>

<script setup>
import TNavbar from '@/components/TNavbar.vue';
import TSidebar from '@/components/TSidebar.vue';
import WalletContentSection from '@/components/ContentSection.vue';

/* eslint-disable no-undef */
definePageMeta({
  layout: 'default',
  middleware: 'auth'
});
/* eslint-enable no-undef */
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_variables' as *;

.wallets-page {
  display: flex;
  min-height: 100vh;
  background-color: $bg-gray;
  margin-left: var(--sidebar-width, 250px);
  transition: margin-left 0.3s ease;
  width: calc(100% - var(--sidebar-width, 250px));
  overflow-x: hidden;
}

.wallets-content-wrapper {
  width: 100%;
  height: 50vh;
  padding: 0;
  margin-top: 62px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}
</style>
