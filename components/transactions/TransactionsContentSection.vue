<template>
  <div class="content-area">
    <TTopCard :page-name="'Transaction'" :page-name-plural="'Transactions'" @add="navigateToNew">
      <template #summary>
        <div v-if="hasTotals" class="totals-summary">
          <span class="total-item">
            <span class="total-label">Income:</span>
            <span class="total-value income">{{ formatCurrency(totals.income) }}</span>
          </span>
          <span class="total-item">
            <span class="total-label">Expenses:</span>
            <span class="total-value expense">{{ formatCurrency(totals.expenses) }}</span>
          </span>
          <span class="total-item">
            <span class="total-label">Net:</span>
            <span class="total-value" :class="totals.net >= 0 ? 'income' : 'expense'">{{ formatCurrency(totals.net) }}</span>
          </span>
        </div>
      </template>
    </TTopCard>

    <ComponentLoader
      :is-loading="isLoadingOrNotReady"
      :error="error"
      :has-data="transactions.length > 0"
      :show-empty="true"
      skeleton-variant="table"
      :skeleton-count="6"
      :skeleton-columns="5"
      empty-state-name="transactions"
      @create="navigateToNew"
    >
      <template #empty>
        <OnboardingEmptyState page-type="transactions" @create="navigateToNew" />
      </template>

      <!-- Mobile cards -->
      <TTransactionsCardList
        class="only-mobile"
        :transactions="paginatedTransactions"
        :search-query="searchQuery"
        :filter-query="filterQuery"
        :current-page="currentPage"
        :items-per-page="itemsPerPage"
        :total-pages="totalPages"
        :total-entries="filteredTransactions.length"
        @update:search-query="searchQuery = $event"
        @update:filter-query="filterQuery = $event"
        @page-change="currentPage = $event"
        @edit="handleEdit"
        @delete="handleDelete"
      />

      <!-- Desktop table -->
      <TTableComponent
        class="only-desktop"
        :transactions="paginatedTransactions"
        :all-transactions="filteredTransactions"
        :search-query="searchQuery"
        :filter-query="filterQuery"
        :current-page="currentPage"
        :items-per-page="itemsPerPage"
        :total-pages="totalPages"
        :total-entries="filteredTransactions.length"
        @update:search-query="searchQuery = $event"
        @update:filter-query="filterQuery = $event"
        @page-change="currentPage = $event"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </ComponentLoader>
  </div>
</template>

<script setup>
import { useTransactions } from '@/composables/useTransactions';
import { useNotifications } from '@/composables/useNotifications';
import TTopCard from '@/components/TTopCard.vue';
import OnboardingEmptyState from '@/components/onboarding/OnboardingEmptyState.vue';
import TTableComponent from '@/components/TTableComponent.vue';
import TTransactionsCardList from '@/components/transactions/TTransactionsCardList.vue';
import ComponentLoader from '@/components/ComponentLoader.vue';

const {
  paginatedTransactions,
  filteredTransactions,
  searchQuery,
  filterQuery,
  currentPage,
  itemsPerPage,
  totalPages,
  deleteTransaction,
  transactions
} = useTransactions();

const parseAmount = (amountStr) => {
  if (!amountStr) return 0;
  const cleaned = String(amountStr).replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
};

const totals = computed(() => {
  const txns = filteredTransactions.value;
  let income = 0;
  let expenses = 0;

  txns.forEach((txn) => {
    const amount = parseAmount(txn.amount);
    if (txn.type === 'INCOME') {
      income += amount;
    } else {
      expenses += amount;
    }
  });

  return { income, expenses, net: income - expenses };
});

const hasTotals = computed(() => filteredTransactions.value.length > 0);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Use centralized data manager states and initialization
const { isLoading, error, isInitialized } = useDataManagerStates();
useDataInitialization();

const isLoadingOrNotReady = computed(() => isLoading.value || !isInitialized.value);

const { confirmDelete, showSuccess, showError } = useNotifications();

function navigateToNew() {
  navigateTo('/transactions/new');
}

function handleEdit(txn) {
  navigateTo(`/transactions/edit/${txn.id}`);
}

async function handleDelete(txn) {
  const confirmed = await confirmDelete('transaction');
  if (!confirmed) return;

  try {
    await deleteTransaction(txn.id);
    showSuccess('Transaction deleted', 'Transaction has been deleted successfully');
  } catch (err) {
    showError('Delete failed', 'Failed to delete transaction. Please try again.');
    console.error('Failed to delete transaction:', err);
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables' as *;
@use '@/assets/scss/_utilities.scss' as *;

.content-area {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  width: 100%;
}

.totals-summary {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;

  @media (max-width: $breakpoint-sm) {
    gap: 0.5rem;
  }
}

.total-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: $font-size-sm;

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-xs;
  }

  .total-label {
    color: $text-muted;
    font-weight: $font-medium;
  }

  .total-value {
    font-weight: $font-bold;

    &.income {
      color: #059669;
    }

    &.expense {
      color: #dc2626;
    }
  }
}
</style>
