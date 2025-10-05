<template>
  <div class="dashboard-index-content">
    <TDashboardTopCard />
    <div class="balance-card-container">
      <WalletCard />
      <TTransactionCard />
    </div>
    <div v-if="filteredTransactions.length === 0" class="dashboard-empty">
      <p class="empty-title">No transactions yet</p>
      <p class="empty-subtitle">Create your first transaction from the Transactions page.</p>
    </div>
    <TTableComponent
      v-else
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
import { useRouter } from 'nuxt/app';
import { useTransactions } from '@/composables/useTransactions';
import { useNotifications } from '@/composables/useNotifications';
import TDashboardTopCard from '@/components/TDashboardTopCard.vue';
import WalletCard from '@/components/WalletCard.vue';
import TTransactionCard from '@/components/TTransactionCard.vue';
import TTableComponent from '@/components/TTableComponent.vue';

const router = useRouter();

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

const handleEdit = (transaction) => {
  router.push(`/transactions/edit/${transaction.id}`);
};

const handleDelete = async (transaction) => {
  const confirmed = await confirmDelete('transaction');
  if (!confirmed) return;

  try {
    await deleteTransaction(transaction.id);
    showSuccess('Transaction deleted', 'Transaction has been deleted successfully');
  } catch (err) {
    showError('Delete failed', 'Failed to delete transaction. Please try again.');
    console.error('Failed to delete transaction:', err);
  }
};

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});
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

.dashboard-empty {
  width: 100%;
  background: #f8faf9;
  border: 1px dashed #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  color: #6b7280;
}

.empty-title {
  margin: 0 0 4px 0;
  font-weight: 600;
  color: #374151;
}

.empty-subtitle {
  margin: 0;
}
</style>
