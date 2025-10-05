<template>
  <div class="transaction-card">
    <div class="transaction-card-header">
      <h2 class="transaction-card-title">Transaction of Last 30 days</h2>
    </div>
    <div class="transaction-card-content">
      <div class="transaction-cards-grid">
        <div class="transaction-cards-row">
          <TTransactionSubCard
            :title="totalTransactions"
            text="Transactions"
            title-color="#047844"
            text-color="#371e48"
          />
          <TTransactionSubCard
            :title="totalIncome"
            text="Total Income"
            title-color="#FF3B30"
            text-color="#371e48"
            currency="XAF"
          />
        </div>
        <div class="transaction-cards-row">
          <TTransactionSubCard
            :title="totalExpenses"
            text="Total Expenses"
            title-color="#2F8F64"
            text-color="#371e48"
            currency="XAF"
          />
          <TTransactionSubCard
            :title="uniqueParties"
            text="Total Parties"
            title-color="#047844"
            text-color="#371e48"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTransactions } from '@/composables/useTransactions';
import TTransactionSubCard from './TTransactionSubCard.vue';

const { transactions } = useTransactions();

// Filter transactions from the last 30 days
const recentTransactions = computed(() => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return transactions.value.filter((t) => {
    const txnDate = new Date(t.date);
    return txnDate >= thirtyDaysAgo;
  });
});

const totalTransactions = computed(() => recentTransactions.value.length);

const totalIncome = computed(() => {
  const sum = recentTransactions.value
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + parseInt(t.amount.replace(/[^\d]/g, '')), 0);
  return (sum / 1000).toFixed(0) + 'k';
});

const totalExpenses = computed(() => {
  const sum = recentTransactions.value
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + parseInt(t.amount.replace(/[^\d]/g, '')), 0);
  return (sum / 1000).toFixed(0) + 'k';
});

const uniqueParties = computed(() => {
  const parties = new Set(recentTransactions.value.map((t) => t.party));
  return parties.size;
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.transaction-card {
  width: 100%;
  max-width: 655px;
  min-height: 220px;
  background-color: $bg-gray;
  border-radius: $radius-lg;
  padding: 16px;
  gap: 8px;
  box-sizing: border-box;

  @media (max-width: $breakpoint-md) {
    padding: 12px;
    min-height: auto;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 8px;
    border-radius: $radius-md;
  }
}

.transaction-card-header {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 16px;

  @media (max-width: $breakpoint-md) {
    margin-bottom: 12px;
  }

  @media (max-width: $breakpoint-sm) {
    margin-bottom: 8px;
  }
}

.transaction-card-title {
  font-size: $font-size-lg;
  font-weight: $font-bold;
  font-family: $font-family-sans;
  margin: 0;
  color: $text-primary;

  @media (max-width: $breakpoint-md) {
    font-size: $font-size-base;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-sm;
  }
}

.transaction-card-content {
  width: 100%;
}

.transaction-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: $breakpoint-md) {
    gap: 12px;
  }

  @media (max-width: $breakpoint-sm) {
    gap: 8px;
  }
}

.transaction-cards-row {
  display: flex;
  flex-direction: row;
  gap: 12px;

  @media (max-width: $breakpoint-md) {
    gap: 8px;
  }

  @media (max-width: $breakpoint-sm) {
    flex-direction: column;
    gap: 6px;
  }
}

.transaction-cards-row > * {
  flex: 1;
}
</style>
