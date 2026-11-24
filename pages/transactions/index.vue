<template>
  <SpaceTransactions v-if="isShared" />
  <LedgerTransactions v-else />
</template>

<script setup>
import SpaceTransactions from '@/components/space/SpaceTransactions.vue';
import LedgerTransactions from '@/components/ledger/transactions/LedgerTransactions.vue';

const { isShared } = useActiveSpace();

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  ledgerFrame: true
});
</script>
