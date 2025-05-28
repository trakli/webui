<template>
  <div class="transaction-card" :class="{ collapsed: isCollapsed }">
    <div class="transaction-card-header">
      <h2 class="transaction-card-title">Transaction of Last 30 days</h2>
      <div class="toggle-button">
        <span class="toggle-text">{{ isCollapsed ? 'Show' : 'Hide' }}</span>
        <ChevronUpIcon v-if="!isCollapsed" class="chevron-icon" />
        <ChevronDownIcon v-else class="chevron-icon" />
      </div>
    </div>
    <div v-if="!isCollapsed" class="transaction-card-content">
      <TTransactionSubCard
        v-for="(card, index) in transactionCards"
        :key="index"
        :title="card.title"
        :text="card.text"
        :title-color="card.titleColor"
        :text-color="card.textColor"
        :currency="card.currency"
      />
    </div>
  </div>
</template>

<script setup>
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/24/solid';

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
});

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
@use '~/assets/_variables' as *;

.transaction-card {
  width: 992px;
  height: 197px;
  background-color: $bg-gray;
  border-radius: $radius-lg;
  padding: 16px;
  gap: 8px;

  &.collapsed {
    width: 992px;
    height: 68px;
    border-radius: 8px;
    display: flex;
    align-items: center;
  }
}

.transaction-card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  .collapsed & {
    width: 100%;
  }
}

.transaction-card-title {
  font-size: $font-size-2xl;
  font-weight: $font-bold;
  font-family: $font-family-sans;
  margin: 0;
}

.toggle-button {
  width: 89px;
  height: 36px;
  border-radius: $radius-lg;
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding: 8px 16px 8px 16px;
  align-items: center;
}

.toggle-text {
  color: #000000;
  font-weight: $font-bold;
  font-size: $font-size-sm;
}

.chevron-icon {
  width: 20px;
  height: 20px;
}

.transaction-card-content {
  width: 960px;
  height: 121px;
  gap: 24px;
  display: flex;
  flex-direction: row;
}
</style>
