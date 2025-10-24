<template>
  <div class="dashboard-index-content">
    <TDashboardTopCard />
    <div class="balance-card-container">
      <WalletCard />
      <TTransactionCard />
    </div>
    <div v-if="filteredTransactions.length === 0" class="dashboard-empty">
      <p class="empty-title">{{ t('dashboard.noTransactions') }}</p>
      <p class="empty-subtitle">{{ t('dashboard.noTransactionsSubtitle') }}</p>
    </div>
    <template v-else>
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
    </template>
  </div>
</template>

<script setup>
import { useRouter } from 'nuxt/app';
import { useTransactions } from '@/composables/useTransactions';
import { useNotifications } from '@/composables/useNotifications';
import TDashboardTopCard from '@/components/TDashboardTopCard.vue';
import WalletCard from '@/components/WalletCard.vue';
import TTransactionCard from '@/components/TTransactionCard.vue';
import TTransactionsCardList from '@/components/transactions/TTransactionsCardList.vue';
import TTableComponent from '@/components/TTableComponent.vue';

const { t } = useI18n();
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
    showSuccess(
      t('notifications.transactionDeleted'),
      t('notifications.transactionDeletedSuccess')
    );
  } catch (err) {
    showError(t('notifications.deleteFailed'), t('notifications.deleteFailedMessage'));
    console.error('Failed to delete transaction:', err);
  }
};

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_utilities.scss' as *;

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
    align-items: center;
  }

  & > :first-child {
    flex: 0 0 100%;

    @media (min-width: 768px) {
      flex: 0 0 40%;
      max-width: 40%;
    }
  }

  & > :last-child {
    flex: 0 0 100%;

    @media (min-width: 768px) {
      flex: 0 0 58%;
      max-width: 58%;
      display: flex;
      align-items: center;
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
