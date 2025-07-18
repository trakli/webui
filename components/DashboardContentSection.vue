<template>
  <div class="dashboard-content">
    <div class="dashboard-content-container">
      <TDashboardTopCard />
      <div class="balance-card-container">
        <WalletCard />
        <TTransactionCard />
      </div>
      <TTableComponent />
    </div>
  </div>
</template>

<script setup>
import WalletCard from './WalletCard.vue';
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.dashboard-content {
  width: calc(100% - 1.5rem);
  max-width: 1400px;
  min-height: calc(100vh - 100px);
  background-color: $bg-white;
  border-radius: 2rem;
  border: 1px solid $bg-gray;
  margin: 0 1.5rem 1rem;
  padding: 1.5rem;
  box-sizing: border-box;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 1.25rem;
  }

  &-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
  }
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
