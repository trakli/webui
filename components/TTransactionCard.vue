<template>
  <div class="transaction-card">
    <div class="transaction-card-header">
      <h2 class="transaction-card-title">Transaction of Last 30 days</h2>
    </div>
    <div class="transaction-card-content">
      <div class="transaction-cards-grid">
        <div class="transaction-cards-row">
          <TTransactionSubCard
            :title="transactionCards[0].title"
            :text="transactionCards[0].text"
            :title-color="transactionCards[0].titleColor"
            :text-color="transactionCards[0].textColor"
            :currency="transactionCards[0].currency"
          />
          <TTransactionSubCard
            :title="transactionCards[1].title"
            :text="transactionCards[1].text"
            :title-color="transactionCards[1].titleColor"
            :text-color="transactionCards[1].textColor"
            :currency="transactionCards[1].currency"
          />
        </div>
        <div class="transaction-cards-row">
          <TTransactionSubCard
            :title="transactionCards[2].title"
            :text="transactionCards[2].text"
            :title-color="transactionCards[2].titleColor"
            :text-color="transactionCards[2].textColor"
            :currency="transactionCards[2].currency"
          />
          <TTransactionSubCard
            :title="transactionCards[3].title"
            :text="transactionCards[3].text"
            :title-color="transactionCards[3].titleColor"
            :text-color="transactionCards[3].textColor"
            :currency="transactionCards[3].currency"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const transactionCards = [
  {
    id: 0,
    title: '48',
    text: 'Transactions',
    titleColor: '#047844',
    textColor: '#371e48',
    currency: ''
  },
  {
    id: 1,
    title: '35k',
    text: 'Total Income',
    titleColor: '#FF3B30',
    textColor: '#371e48',
    currency: 'XAF'
  },
  {
    id: 2,
    title: '24k',
    text: 'Total Expenses',
    titleColor: '#2F8F64',
    textColor: '#371e48',
    currency: 'XAF'
  },
  {
    id: 3,
    title: '124',
    text: 'Total Companies',
    titleColor: '#047844',
    textColor: '#371e48',
    currency: ''
  }
];
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.transaction-card {
  width: 655px;
  height: 220px;
  background-color: $bg-gray;
  border-radius: $radius-lg;
  padding: 16px;
  gap: 8px;
}

.transaction-card-header {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 16px;
}

.transaction-card-title {
  font-size: $font-size-lg;
  font-weight: $font-bold;
  font-family: $font-family-sans;
  margin: 0;
}

.transaction-card-content {
  width: 100%;
}

.transaction-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transaction-cards-row {
  display: flex;
  flex-direction: row;
  gap: 12px;
}

.transaction-cards-row > * {
  flex: 1;
}
</style>
