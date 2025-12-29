<template>
  <div class="recent-transactions">
    <div class="header">
      <h3 class="title">Recent Transactions</h3>
      <NuxtLink to="/transactions" class="view-all">View All</NuxtLink>
    </div>

    <div v-if="recentTransactions.length === 0" class="empty-state">
      <p>No transactions yet</p>
    </div>

    <div v-else class="transaction-list">
      <div
        v-for="txn in recentTransactions"
        :key="txn.id"
        class="transaction-row"
        @click="handleClick(txn)"
      >
        <div class="txn-icon" :class="txn.type === 'INCOME' ? 'income' : 'expense'">
          <ArrowDownLeft v-if="txn.type === 'INCOME'" />
          <ArrowUpRight v-else />
        </div>
        <div class="txn-details">
          <span class="txn-party">{{ txn.party }}</span>
          <span class="txn-category">{{ txn.category }}</span>
        </div>
        <div class="txn-right">
          <span class="txn-amount" :class="txn.type === 'INCOME' ? 'income' : 'expense'">
            {{ txn.type === 'INCOME' ? '+' : '-' }}{{ txn.amount }}
          </span>
          <span class="txn-time">{{ formatRelativeTime(txn.date) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-vue-next';
import { useTransactions } from '@/composables/useTransactions';

const router = useRouter();
const { transactions } = useTransactions();

const recentTransactions = computed(() => {
  return transactions.value.slice(0, 5);
});

const handleClick = (txn) => {
  router.push(`/transactions/edit/${txn.id}`);
};

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';

  // Parse as local time to avoid timezone issues
  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.recent-transactions {
  background: $bg-white;
  border-radius: $radius-xl;
  box-shadow: $shadow-sm;
  border: 1px solid $border-color;
  padding: $spacing-4;
  height: 320px;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-3;
}

.title {
  font-size: $font-size-base;
  font-weight: $font-semibold;
  color: $text-primary;
  margin: 0;
}

.view-all {
  font-size: $font-size-xs;
  color: $primary;
  text-decoration: none;
  font-weight: $font-medium;

  &:hover {
    text-decoration: underline;
  }
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-muted;
  font-size: $font-size-sm;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  overflow-y: auto;
  flex: 1;
}

.transaction-row {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-2;
  border-radius: $radius-lg;
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background: $bg-light;
  }
}

.txn-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 16px;
    height: 16px;
  }

  &.income {
    background: rgba(4, 120, 68, 0.1);
    color: $primary;
  }

  &.expense {
    background: rgba(220, 38, 38, 0.1);
    color: $error-color;
  }
}

.txn-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.txn-party {
  font-size: $font-size-sm;
  font-weight: $font-medium;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.txn-category {
  font-size: $font-size-xs;
  color: $text-muted;
}

.txn-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.txn-amount {
  font-size: $font-size-sm;
  font-weight: $font-semibold;

  &.income {
    color: $primary;
  }

  &.expense {
    color: $error-color;
  }
}

.txn-time {
  font-size: $font-size-xs;
  color: $text-muted;
}
</style>
