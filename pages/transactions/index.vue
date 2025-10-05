<template>
  <div>
    <TransactionsContentSection />
  </div>
</template>

<script setup>
import TransactionsContentSection from '@/components/transactions/TransactionsContentSection.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});
</script>

<style lang="scss" scoped></style>
