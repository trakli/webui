<template>
  <div>
    <TransactionsContentSection />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});

import TransactionsContentSection from '@/components/transactions/TransactionsContentSection.vue';
</script>

<style lang="scss" scoped></style>
