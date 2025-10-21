<template>
  <div class="content-area">
    <TTopCard :page-name="'Transaction'" :page-name-plural="'Transactions'" @add="navigateToNew" />

    <OnboardingEmptyState
      v-if="paginatedTransactions.length === 0"
      page-type="transactions"
      @create="navigateToNew"
    />

    <!-- Mobile cards -->
    <TTransactionsCardList
      v-if="paginatedTransactions.length > 0"
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
      v-if="paginatedTransactions.length > 0"
      class="only-desktop"
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
  </div>
</template>

<script setup>
import { useTransactions } from '@/composables/useTransactions';
import { useNotifications } from '@/composables/useNotifications';
import TTopCard from '@/components/TTopCard.vue';
import OnboardingEmptyState from '@/components/onboarding/OnboardingEmptyState.vue';
import TTableComponent from '@/components/TTableComponent.vue';
import TTransactionsCardList from '@/components/transactions/TTransactionsCardList.vue';

const {
  paginatedTransactions,
  filteredTransactions,
  searchQuery,
  filterQuery,
  currentPage,
  itemsPerPage,
  totalPages,
  deleteTransaction
} = useTransactions();

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
</style>
