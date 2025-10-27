<template>
  <div class="dashboard-index-content">
    <TDashboardTopCard :show-filters="hasTransactions" />

    <div v-if="hasTransactions || isLoading" class="balance-card-container">
      <ComponentLoader
        :is-loading="isLoading"
        :has-data="hasTransactions"
        :show-empty="false"
        skeleton-variant="card"
      >
        <WalletCard />
      </ComponentLoader>

      <ComponentLoader
        :is-loading="isLoading"
        :has-data="hasTransactions"
        :show-empty="false"
        skeleton-variant="card"
      >
        <TTransactionCard />
      </ComponentLoader>
    </div>

    <OnboardingWizard
      v-if="shouldShowWizard"
      @start-action="handleWizardAction"
      @step-action="handleWizardAction"
      @complete-onboarding="handleCompleteOnboarding"
    />

    <ComponentLoader
      :is-loading="isLoading"
      :error="error"
      :has-data="!isLoading && transactions.length > 0"
      :show-empty="false"
      skeleton-variant="table"
      :skeleton-count="6"
      :skeleton-columns="5"
    >
      <!-- Mobile cards -->
      <TTransactionsCardList
        v-if="hasTransactions"
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
        v-if="hasTransactions"
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
    </ComponentLoader>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'nuxt/app';
import { useTransactions } from '@/composables/useTransactions';
import { useNotifications } from '@/composables/useNotifications';
import { checkAuth } from '~/utils/auth';
import TDashboardTopCard from '@/components/TDashboardTopCard.vue';
import WalletCard from '@/components/WalletCard.vue';
import TTransactionCard from '@/components/TTransactionCard.vue';
import TTransactionsCardList from '@/components/transactions/TTransactionsCardList.vue';
import TTableComponent from '@/components/TTableComponent.vue';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard.vue';
import ComponentLoader from '@/components/ComponentLoader.vue';

const router = useRouter();

const {
  paginatedTransactions,
  filteredTransactions,
  searchQuery,
  filterQuery,
  currentPage,
  itemsPerPage,
  totalPages,
  deleteTransaction,
  isLoading,
  error,
  transactions
} = useTransactions();

const hasDataLoaded = computed(() => !isLoading.value);
const hasTransactions = computed(
  () => hasDataLoaded.value && filteredTransactions.value.length > 0
);
const shouldShowWizard = computed(() => {
  // Only show wizard when we're definitely authenticated, not loading, no errors, and have no transactions
  // This prevents flash on refresh by ensuring we have auth context
  if (typeof window === 'undefined') return false;
  if (!checkAuth()) return false;
  if (error.value) return false; // Don't show wizard when there's an error
  return !isLoading.value && transactions.value.length === 0;
});

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
