<template>
  <div class="dashboard-index-content">
    <TDashboardTopCard />
    <div class="balance-card-container">
      <WalletCard />
      <TTransactionCard />
    </div>
    <TTableComponent />
  </div>
</template>

<script setup>
import TDashboardTopCard from '@/components/TDashboardTopCard.vue';
import WalletCard from '@/components/WalletCard.vue';
import TTransactionCard from '@/components/TTransactionCard.vue';
import TTableComponent from '@/components/TTableComponent.vue';

/* eslint-disable no-undef */
definePageMeta({
  layout: 'dashboard'
});
/* eslint-enable no-undef */
</script>

<style lang="scss" scoped>
.dashboard-index-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.balance-card-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  margin: 0;
  padding: 0;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 1rem;
    align-items: stretch;
  }

  // WalletCard - 40% width
  & > :first-child {
    flex: 0 0 100%;

    @media (min-width: 768px) {
      flex: 0 0 40%;
      max-width: 40%;
    }
  }

  // TransactionCard - 60% width
  & > :last-child {
    flex: 0 0 100%;

    @media (min-width: 768px) {
      flex: 0 0 58%;
      max-width: 58%;
    }
  }
}
</style>
