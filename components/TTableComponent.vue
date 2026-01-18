<template>
  <div class="table-container">
    <div class="table-heading">
      <h1 class="table-heading-text">{{ t('All Transactions') }}</h1>
      <div class="input-controls">
        <SearchInput
          :model-value="searchQuery"
          :placeholder="t('Search...')"
          :debounce="0"
          @update:model-value="$emit('update:searchQuery', $event)"
        />
      </div>
    </div>

    <div class="table-wrapper">
      <div class="table">
        <table class="custom-table" :class="{ 'expense-table': headerType === 'expense' }">
          <thead>
            <tr>
              <th>{{ t('Date Time') }}</th>
              <th>{{ t('Type') }}</th>
              <th>{{ t('Party') }}</th>
              <th>{{ t('Amount') }}</th>
              <th>{{ t('Category') }}</th>
              <th>{{ t('Action') }}</th>
            </tr>
          </thead>
          <tbody class="table-body">
            <tr v-for="(txn, index) in displayedTransactions" :key="index">
              <td>
                <div class="date-main">{{ formatDate(txn) }}</div>
                <div class="date-sub">{{ formatTimeAgo(txn) }}</div>
              </td>
              <td>
                <span :class="['type-badge', txn.type === 'INCOME' ? 'income' : 'outcome']">
                  {{ txn.type }}
                </span>
                <span v-if="txn.isTransfer" class="transfer-badge">
                  {{ t('Transfer') }}
                </span>
              </td>
              <td>
                <span class="party">{{ txn.party || '—' }}</span>
              </td>
              <td>
                <span :class="txn.type === 'INCOME' ? 'amount-income' : 'amount-outcome'">
                  {{ txn.amount }}
                </span>
              </td>
              <td>{{ txn.category }}</td>
              <td>
                <div class="actions">
                  <button class="action-btn" @click="$emit('edit', txn)">
                    <PencilSquareIcon class="action-icon" />
                  </button>
                  <button class="action-btn" @click="$emit('delete', txn)">
                    <TrashIcon class="action-icon" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="totals-row">
              <td colspan="6" class="totals-cell">
                <div class="totals-grid">
                  <div class="total-section totals-label">
                    <span class="total-label">{{ t('Totals') }}</span>
                  </div>
                  <div class="total-section income">
                    <span class="total-label">{{ t('Income') }}</span>
                    <span class="total-value">{{ formatDisplayCurrency(totals.income) }}</span>
                  </div>
                  <div class="total-section expense">
                    <span class="total-label">{{ t('Expenses') }}</span>
                    <span class="total-value">{{ formatDisplayCurrency(totals.expenses) }}</span>
                  </div>
                  <div
                    class="total-section net"
                    :class="{ positive: totals.net >= 0, negative: totals.net < 0 }"
                  >
                    <span class="total-label">{{ t('Net') }}</span>
                    <span class="total-value">{{ formatDisplayCurrency(totals.net) }}</span>
                  </div>
                </div>
              </td>
            </tr>
            <tr class="pagination-row">
              <td colspan="6">
                <div class="pagination-container">
                  <div class="pagination-controls">
                    <button
                      class="pagination-btn"
                      :disabled="currentPage === 1"
                      @click="$emit('page-change', currentPage - 1)"
                    >
                      {{ t('Previous') }}
                    </button>
                    <button
                      v-for="page in visiblePages"
                      :key="page"
                      class="pagination-btn"
                      :class="{ active: page === currentPage }"
                      @click="$emit('page-change', page)"
                    >
                      {{ page }}
                    </button>
                    <button
                      class="pagination-btn"
                      :disabled="currentPage === pagesTotal"
                      @click="$emit('page-change', currentPage + 1)"
                    >
                      {{ t('Next') }}
                    </button>
                  </div>
                  <div class="pagination-info">
                    <span class="entries-text">
                      {{
                        t('Showing {start}-{end} of {total} entries', {
                          start: startEntry,
                          end: endEntry,
                          total: totalEntries
                        })
                      }}
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline';
import { useSharedData } from '@/composables/useSharedData';
import { parseAmount, getCurrencySymbol } from '@/utils/currency';
import SearchInput from './SearchInput.vue';

const { t } = useI18n();

const CURRENCY_RATES = {
  USD: 1.0,
  EUR: 0.85,
  XAF: 600.0,
  GBP: 0.75,
  CAD: 1.35
};

const props = defineProps({
  transactions: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  currentPage: { type: Number, default: 1 },
  itemsPerPage: { type: Number, default: 10 },
  totalPages: { type: Number, default: 1 },
  totalEntries: { type: Number, default: 0 },
  headerType: { type: String, default: 'default' },
  allTransactions: { type: Array, default: () => [] }
});

defineEmits(['edit', 'delete', 'page-change', 'update:searchQuery']);

const { getDefaultCurrency } = useSharedData();

const displayedTransactions = computed(() => props.transactions);

const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;
  const fromRate = CURRENCY_RATES[fromCurrency] || 1;
  const toRate = CURRENCY_RATES[toCurrency] || 1;
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
};

const totals = computed(() => {
  const txns = props.allTransactions.length > 0 ? props.allTransactions : props.transactions;
  const targetCurrency = getDefaultCurrency.value;
  let income = 0;
  let expenses = 0;

  txns.forEach((txn) => {
    const { value, currency } = parseAmount(txn.amount);
    const convertedAmount = convertCurrency(value, currency || targetCurrency, targetCurrency);
    if (txn.type === 'INCOME') {
      income += convertedAmount;
    } else {
      expenses += convertedAmount;
    }
  });

  return {
    income,
    expenses,
    net: income - expenses
  };
});

const formatDisplayCurrency = (value) => {
  const currency = getDefaultCurrency.value;
  const symbol = getCurrencySymbol(currency);
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
  return `${formatted} ${symbol}`;
};

const computedTotalEntries = computed(() => {
  if (props.totalEntries && props.totalEntries > 0) return props.totalEntries;
  return displayedTransactions.value.length;
});

const pagesTotal = computed(() => {
  if (props.totalPages && props.totalPages > 1) return props.totalPages;
  return Math.max(1, Math.ceil(computedTotalEntries.value / props.itemsPerPage));
});

const startEntry = computed(() => {
  if (computedTotalEntries.value === 0) return 0;
  return (props.currentPage - 1) * props.itemsPerPage + 1;
});

const endEntry = computed(() => {
  const end = props.currentPage * props.itemsPerPage;
  return Math.min(end, computedTotalEntries.value);
});

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  const total = pagesTotal.value;
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(total, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const formatDate = (txn) => {
  const iso = txn?.date || '';
  const dateObj = new Date(`${iso}T${txn?.time || '00:00'}:00`);
  if (isNaN(dateObj.getTime())) return iso;
  const options = { year: 'numeric', month: 'short', day: '2-digit' };
  return dateObj.toLocaleDateString(undefined, options).replace(/,/g, ',');
};

const formatTimeAgo = (txn) => {
  const dateObj = new Date(`${txn?.date || ''}T${txn?.time || '00:00'}:00`);
  if (isNaN(dateObj.getTime())) return '';
  const diffMs = Date.now() - dateObj.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return t('just now');
  if (minutes < 60) return t('{n} min ago', { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('{n} hr ago', { n: hours }, hours);
  const days = Math.floor(hours / 24);
  return t('{n} day ago', { n: days }, days);
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.table {
  &-container {
    width: 100%;
    max-width: 100%;
    gap: 8px;
    overflow: hidden;
  }

  &-heading {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 0.5rem;

    @media (min-width: 768px) {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }

    &-text {
      font-weight: $font-medium;
      font-size: $font-size-base;
      margin-bottom: 0;
    }
  }
}

.input-controls {
  display: flex;
  align-items: center;
}

.table-wrapper {
  width: 100%;
  border-radius: $radius-lg;
  overflow-x: auto;
  background-color: $bg-gray;
  box-shadow: $shadow-sm;
  -webkit-overflow-scrolling: touch;
}

.custom-table {
  width: 100%;
  min-width: 100%;
  border-collapse: collapse;
  font-family: $font-family-sans;
  table-layout: auto;

  th,
  td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }

  th {
    background-color: $table-header-bg;
    color: #ffffff;
    text-align: left;
    padding: 10px;
    font-size: $font-size-sm;
  }

  &.expense-table th {
    background-color: $error-color;
  }

  td {
    padding: 10px;
    background-color: $bg-light;
    border-bottom: 1px solid $border-light;
    vertical-align: top;
    font-size: $font-size-sm;
  }

  .date {
    &-main {
      color: $text-primary;
      font-weight: $font-medium;
      font-size: $font-size-sm;
    }

    &-sub {
      font-size: 9px;
      font-weight: $font-normal;
      color: $text-muted;
    }
  }

  .type-badge {
    padding: 4px 12px;
    border-radius: $radius-md;
    font-weight: bold;
    font-size: 12px;
    display: inline-block;

    &.income {
      background-color: rgba(var(--color-success-rgb), 0.15);
      color: $success;
    }

    &.outcome {
      background-color: rgba(var(--color-error-rgb), 0.15);
      color: $error-color;
    }
  }

  .transfer-badge {
    display: inline-block;
    margin-left: 6px;
    padding: 2px 6px;
    border-radius: $radius-sm;
    font-size: 10px;
    font-weight: bold;
    background-color: rgba(var(--color-primary-rgb), 0.15);
    color: $primary;
    vertical-align: middle;
  }

  .party {
    padding: 4px 8px;
    border-radius: $radius-md;
    display: inline-block;
  }

  .amount {
    &-income {
      color: $success;
      font-weight: bold;
    }

    &-outcome {
      color: $error-color;
      font-weight: bold;
    }
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    color: $primary;
    cursor: pointer;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    padding: 6px;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 28px;
    height: 28px;

    &:hover {
      background-color: rgba(var(--color-primary-rgb), 0.1);
    }
  }

  .action-icon {
    width: 16px;
    height: 16px;
    color: $primary;
    transition: color 0.2s ease;

    &:hover {
      color: $primary-dark;
    }
  }

  // Make delete icon red
  .action-btn:nth-child(2) .action-icon {
    color: $error-color;

    &:hover {
      color: $error-dark;
    }
  }
}

// Totals row styles
.totals-row {
  .totals-cell {
    padding: 0 !important;
    background-color: transparent !important;
    border-top: 2px solid $primary;
  }

  .totals-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    width: 100%;
  }

  .total-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px 8px;
    text-align: center;

    .total-label {
      font-size: $font-size-xs;
      font-weight: $font-medium;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }

    .total-value {
      font-size: $font-size-sm;
      font-weight: $font-bold;
    }

    &.totals-label {
      background-color: $table-header-bg;
      .total-label {
        color: white;
        font-size: $font-size-sm;
        font-weight: $font-bold;
      }
    }

    &.income {
      background-color: rgba(var(--color-success-rgb), 0.2);
      .total-label {
        color: $success;
      }
      .total-value {
        color: $success;
      }
    }

    &.expense {
      background-color: rgba(var(--color-error-rgb), 0.15);
      .total-label {
        color: $error-color;
      }
      .total-value {
        color: $error-color;
      }
    }

    &.net {
      &.positive {
        background-color: rgba(var(--color-primary-rgb), 0.15);
        .total-label {
          color: $primary;
        }
        .total-value {
          color: $primary;
        }
      }
      &.negative {
        background-color: $warning-bg;
        .total-label {
          color: $warning-text;
        }
        .total-value {
          color: $warning-text;
        }
      }
    }
  }
}

// Pagination styles
.pagination-row {
  td {
    background-color: $bg-light !important;
    border-bottom: none !important;
    padding: 16px 12px !important;
  }
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-info {
  display: flex;
  align-items: center;
}

.entries-text {
  font-size: 14px;
  color: $text-muted;
  font-weight: 500;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid $border-light;
  background-color: $bg-white;
  color: $text-secondary;
  border-radius: $radius-md;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 40px;
  text-align: center;

  &:hover:not(:disabled) {
    background-color: $bg-light;
    border-color: $border-medium;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: $bg-light;
  }

  &.active {
    background-color: $primary;
    color: white;
    border-color: $primary;

    &:hover {
      background-color: $primary-dark;
    }
  }

  .expense-table & {
    &.active {
      background-color: $error-color;
      border-color: $error-color;

      &:hover {
        background-color: $error-dark;
      }
    }
  }
}
</style>
