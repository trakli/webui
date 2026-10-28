<template>
  <SpaceTransactions v-if="isShared" />
  <div v-else>
    <TransactionsContentSection />
  </div>
</template>

<script setup>
import SpaceTransactions from '@/components/space/SpaceTransactions.vue';
import TransactionsContentSection from '@/components/transactions/TransactionsContentSection.vue';

const { isShared } = useActiveSpace();

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});
</script>

<style lang="scss" scoped></style>
