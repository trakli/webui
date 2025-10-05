<template>
  <div class="content-area">
    <TTopCard :pageName="'Transaction'" :pageNamePlural="'Transactions'" @add="navigateToNew" />

    <EmptyState
      v-if="paginatedTransactions.length === 0"
      :pageName="'Transaction'"
      @create="navigateToNew"
    />

    <TTableComponent
      v-if="paginatedTransactions.length > 0"
      :transactions="paginatedTransactions"
      :searchQuery="searchQuery"
      :filterQuery="filterQuery"
      :currentPage="currentPage"
      :itemsPerPage="itemsPerPage"
      :totalPages="totalPages"
      :totalEntries="filteredTransactions.length"
      @update:searchQuery="searchQuery = $event"
      @update:filterQuery="filterQuery = $event"
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
import EmptyState from '@/components/EmptyState.vue';
import TTableComponent from '@/components/TTableComponent.vue';

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

.content-area {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  width: 100%;
}
</style>
