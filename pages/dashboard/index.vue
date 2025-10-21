<template>
  <div class="dashboard-index-content">
    <TDashboardTopCard :show-filters="filteredTransactions.length > 0" />
    <div v-if="filteredTransactions.length > 0" class="balance-card-container">
      <WalletCard />
      <TTransactionCard />
    </div>
    <OnboardingWizard
      v-if="filteredTransactions.length === 0"
      @start-action="handleWizardAction"
      @step-action="handleWizardAction"
      @complete-onboarding="handleCompleteOnboarding"
    />
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
import OnboardingWizard from '@/components/onboarding/OnboardingWizard.vue';

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

const handleWizardAction = (action) => {
  const actionRoutes = {
    'add-transaction': '/transactions/new',
    'setup-wallets': '/wallets',
    'manage-categories': '/categories',
    'add-parties': '/parties'
  };

  if (actionRoutes[action]) {
    router.push(actionRoutes[action]);
  }
};

const handleCompleteOnboarding = () => {
  localStorage.setItem('onboarding-completed', 'true');
  showSuccess('Welcome to Trakli!', "You're all set to start tracking your finances.");
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
</style>
