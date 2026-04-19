<template>
  <div class="content-area">
    <TTopCard :page-name="'Transaction'" :page-name-plural="'Transactions'" @add="navigateToNew">
      <template #summary>
        <div v-if="hasTotals" class="totals-summary">
          <span class="total-item">
            <span class="total-label">{{ t('Income') }}:</span>
            <span class="total-value income">{{ formatCurrency(totals.income) }}</span>
          </span>
          <span class="total-item">
            <span class="total-label">{{ t('Expenses') }}:</span>
            <span class="total-value expense">{{ formatCurrency(totals.expenses) }}</span>
          </span>
          <span class="total-item">
            <span class="total-label">{{ t('Net') }}:</span>
            <span class="total-value" :class="totals.net >= 0 ? 'income' : 'expense'">{{
              formatCurrency(totals.net)
            }}</span>
          </span>
        </div>
      </template>
      <template #actions>
        <button
          type="button"
          class="spreadsheet-trigger"
          :aria-label="t('Spreadsheet mode')"
          :title="t('Open spreadsheet view')"
          @click="showSpreadsheet = true"
        >
          <TableCellsIcon class="icon" />
        </button>
      </template>
    </TTopCard>

    <TransactionsSpreadsheet v-if="showSpreadsheet" @close="showSpreadsheet = false" />

    <TransactionFilters
      v-show="showFiltersPanel"
      :filters="filters"
      @update:filters="handleFilterChange"
      @close="showFiltersPanel = false"
    />

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
        <div v-if="activeFilterCount > 0" class="no-filter-results">
          <div class="no-filter-results__icon-wrapper">
            <FunnelIcon class="no-filter-results__icon" />
          </div>
          <h3 class="no-filter-results__title">{{ t('No results found') }}</h3>
          <p class="no-filter-results__text">
            {{ t('No transactions match your current filters. Try adjusting or clearing them.') }}
          </p>
          <TButton
            :text="t('Clear all filters')"
            variant="primary"
            size="small"
            :full-width="false"
            @click="handleResetFilters"
          />
        </div>
        <OnboardingEmptyState v-else page-type="transactions" @create="navigateToNew" />
      </template>

      <!-- Mobile cards -->
      <TTransactionsCardList
        class="only-mobile"
        :transactions="transactions"
        :search-query="filters.search || ''"
        :current-page="currentPage"
        :items-per-page="perPage"
        :total-pages="totalPages"
        :total-entries="totalItems"
        :active-filter-count="activeFilterCount"
        @update:search-query="handleSearchChange"
        @page-change="handlePageChange"
        @edit="handleEdit"
        @delete="handleDelete"
        @recurrent="handleRecurrent"
        @toggle-filters="toggleFilters"
      />

      <!-- Desktop table -->
      <TTableComponent
        class="only-desktop"
        :transactions="transactions"
        :all-transactions="transactions"
        :search-query="filters.search || ''"
        :current-page="currentPage"
        :items-per-page="perPage"
        :total-pages="totalPages"
        :total-entries="totalItems"
        :active-filter-count="activeFilterCount"
        :filtered-totals="filteredTotals"
        @update:search-query="handleSearchChange"
        @page-change="handlePageChange"
        @edit="handleEdit"
        @delete="handleDelete"
        @recurrent="handleRecurrent"
        @toggle-filters="toggleFilters"
      />
    </ComponentLoader>

    <RecurringModal
      :is-open="showRecurringModal"
      :transaction="selectedTransaction"
      @save="handleRecurringSave"
      @remove="handleRecurringRemove"
      @cancel="showRecurringModal = false"
    />
  </div>
</template>

<script setup>
import { useTransactions } from '@/composables/useTransactions';
import { useNotifications } from '@/composables/useNotifications';
import { FunnelIcon, TableCellsIcon } from '@heroicons/vue/24/outline';
import TTopCard from '@/components/TTopCard.vue';
import OnboardingEmptyState from '@/components/onboarding/OnboardingEmptyState.vue';
import TTableComponent from '@/components/TTableComponent.vue';
import TTransactionsCardList from '@/components/transactions/TTransactionsCardList.vue';
import TransactionFilters from '@/components/transactions/TransactionFilters.vue';
import TransactionsSpreadsheet from '@/components/transactions/TransactionsSpreadsheet.vue';
import TButton from '@/components/TButton.vue';
import ComponentLoader from '@/components/ComponentLoader.vue';
import RecurringModal from '@/components/modals/RecurringModal.vue';

const { t } = useI18n();

const {
  transactions,
  currentPage,
  totalPages,
  totalItems,
  perPage,
  filteredTotals,
  filters,
  activeFilterCount,
  deleteTransaction,
  setRecurring,
  changePage,
  applyFilters,
  updateSearch
} = useTransactions();

const showRecurringModal = ref(false);
const showFiltersPanel = ref(false);
const showSpreadsheet = ref(false);

function toggleFilters() {
  showFiltersPanel.value = !showFiltersPanel.value;
}
const selectedTransaction = ref(null);

const totals = computed(() => filteredTotals.value);

const hasTotals = computed(() => totalItems.value > 0);

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

function handleRecurrent(txn) {
  selectedTransaction.value = txn;
  showRecurringModal.value = true;
}

function handleFilterChange(newFilters) {
  applyFilters(newFilters);
}

function handleResetFilters() {
  applyFilters({});
  showFiltersPanel.value = false;
}

function handleSearchChange(query) {
  updateSearch(query);
}

function handlePageChange(page) {
  changePage(page);
}

async function handleRecurringSave(config) {
  if (!selectedTransaction.value) return;

  try {
    await setRecurring(selectedTransaction.value.id, config);
    showRecurringModal.value = false;
    selectedTransaction.value = null;
    showSuccess(t('Recurrence updated'), t('Transaction recurrence has been updated successfully'));
  } catch (err) {
    showError(
      t('Failed to update recurrence'),
      t('Failed to update transaction recurrence. Please try again.')
    );
    console.error('Failed to update recurrence:', err);
  }
}

async function handleRecurringRemove() {
  if (!selectedTransaction.value) return;

  try {
    await setRecurring(selectedTransaction.value.id, {
      is_recurring: false
    });
    showRecurringModal.value = false;
    selectedTransaction.value = null;
    showSuccess(t('Recurrence removed'), t('Transaction recurrence has been removed'));
  } catch (err) {
    showError(
      t('Failed to update recurrence'),
      t('Failed to update transaction recurrence. Please try again.')
    );
    console.error('Failed to remove recurrence:', err);
  }
}

async function handleDelete(txn) {
  const confirmed = await confirmDelete('transaction');
  if (!confirmed) return;

  try {
    await deleteTransaction(txn.id);
    showSuccess(t('Transaction deleted'), t('Transaction has been deleted successfully'));
  } catch (err) {
    showError(t('Delete failed'), t('Failed to delete transaction. Please try again.'));
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
  gap: 0.75rem;
  align-items: center;
  width: 100%;
}

.no-filter-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1.5rem;
  text-align: center;

  &__icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: $primary-light;
    margin-bottom: 0.25rem;
  }

  &__icon {
    width: 28px;
    height: 28px;
    color: $primary;
  }

  &__title {
    font-size: $font-size-base;
    font-weight: $font-semibold;
    color: $text-primary;
    margin: 0;
  }

  &__text {
    color: $text-muted;
    font-size: $font-size-sm;
    margin: 0;
    max-width: 320px;
    line-height: 1.5;
  }
}

.spreadsheet-trigger {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  color: $text-muted;
  cursor: pointer;
  transition: all 0.15s ease;

  .icon {
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: $primary;
    border-color: $primary-muted;
    background: rgba(var(--color-primary-rgb), 0.05);
  }
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
