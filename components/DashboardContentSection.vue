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
@use '~/assets/_variables' as *;

.dashboard-content {
  width: 1072px;
  height: 1600px;
  background-color: $bg-white;
  border-radius: $radius-xl;
  border: 1px solid $bg-gray;
  margin: 0 auto;
  overflow-y: auto;
  overflow-x: hidden;
}

.dashboard-content-container {
  display: flex;
  flex-direction: column;
  width: 992px;
  height: 1285px;
  gap: 32px;
  margin: 0 auto;
}

.balance-card-container {
  display: flex;
  flex-direction: row;
  gap: 24px;
}
</style>
