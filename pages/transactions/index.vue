<template>
  <SpaceTransactions v-if="isShared" />
  <LedgerTransactions v-else-if="isLedger" />
  <div v-else>
    <TransactionsContentSection />
  </div>
</template>

<script setup>
import SpaceTransactions from '@/components/space/SpaceTransactions.vue';
import TransactionsContentSection from '@/components/transactions/TransactionsContentSection.vue';
import LedgerTransactions from '@/components/ledger/transactions/LedgerTransactions.vue';
import { useDesign } from '@/composables/useDesign';

const { isShared } = useActiveSpace();
const { isLedger } = useDesign();

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  ledgerFrame: true
});
</script>

<style lang="scss" scoped></style>
