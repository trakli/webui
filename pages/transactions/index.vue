<template>
  <div>
    <TransactionsContentSection />
  </div>
</template>

<script setup>
/* eslint-disable no-undef */
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});
/* eslint-enable no-undef */

import TransactionsContentSection from '@/components/transactions/TransactionsContentSection.vue';
</script>

<style lang="scss" scoped></style>
