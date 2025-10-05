<template>
  <div class="table-container">
    <div class="table-heading">
      <h1 class="table-heading-text">All Transactions</h1>
      <div class="input-controls">
        <div class="search-container">
          <input
            type="text"
            placeholder="Search..."
            class="search-input"
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
          />
          <MagnifyingGlassIcon class="search-icon" />
        </div>
        <div class="filter-container">
          <input
            type="text"
            placeholder="Filter..."
            class="filter-input"
            :value="filterQuery"
            @input="$emit('update:filterQuery', $event.target.value)"
          />
          <FunnelIcon class="filter-icon" />
        </div>
      </div>
    </div>

    <div class="table-wrapper">
      <div class="table">
        <table class="custom-table" :class="{ 'expense-table': headerType === 'expense' }">
          <thead>
            <tr>
              <th>Date Time</th>
              <th>Type</th>
              <th>Party</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Action</th>
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
              </td>
              <td>
                <span class="party">{{ txn.party }}</span>
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
            <tr class="pagination-row">
              <td colspan="6">
                <div class="pagination-container">
                  <div class="pagination-controls">
                    <button
                      class="pagination-btn"
                      :disabled="currentPage === 1"
                      @click="$emit('page-change', currentPage - 1)"
                    >
                      Previous
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
                      Next
                    </button>
                  </div>
                  <div class="pagination-info">
                    <span class="entries-text">
                      Showing {{ startEntry }}-{{ endEntry }} of {{ totalEntries }} entries
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  transactions: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  filterQuery: { type: String, default: '' },
  currentPage: { type: Number, default: 1 },
  itemsPerPage: { type: Number, default: 10 },
  totalPages: { type: Number, default: 1 },
  totalEntries: { type: Number, default: 0 },
  headerType: { type: String, default: 'default' } // 'default', 'expense'
});

defineEmits(['edit', 'delete', 'page-change', 'update:searchQuery', 'update:filterQuery']);

const displayedTransactions = computed(() => props.transactions);

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
  let end = Math.min(total, start + maxVisible - 1);

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
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
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
      font-weight: $font-bold;
      font-size: $font-size-2xl;
      margin-bottom: 0;
    }
  }
}

.input-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;

  @media (min-width: 640px) {
    flex-wrap: nowrap;
    gap: 1rem;
  }
  align-items: center;
}

.search-container,
.filter-container {
  position: relative;
  width: 100%;
  height: 44px;
  min-width: 160px;

  @media (min-width: 640px) {
    width: 184px;
  }

  .search-input,
  .filter-input {
    width: 100%;
    height: 100%;
    padding: 8px 36px 8px 16px;
    border: 1px solid $bg-gray;
    border-radius: $radius-lg;
    font-size: $font-size-sm;
    background-color: #f5f6f7;
    transition: border-color 0.2s ease;
    box-sizing: border-box;

    &::placeholder {
      color: #9ca3af;
    }

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
}

.search-icon,
.filter-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #798588;
  pointer-events: none;
}

.table-wrapper {
  width: 100%;
  border-radius: 8px;
  overflow-x: auto;
  background-color: #ebedec;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
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
    background-color: #057a55;
    color: white;
    text-align: left;
    padding: 12px;
  }

  &.expense-table th {
    background-color: #dc2626;
  }

  td {
    padding: 12px;
    background-color: #f9f9f9;
    border-bottom: 1px solid #ddd;
    vertical-align: top;
  }

  .date {
    &-main {
      color: #1d3229;
      font-weight: $font-bold;
    }

    &-sub {
      font-size: 9px;
      font-weight: $font-normal;
      color: #646b6b;
    }
  }

  .type-badge {
    padding: 4px 12px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 12px;
    display: inline-block;

    &.income {
      background-color: #d1fae5;
      color: #065f46;
    }

    &.outcome {
      background-color: #fee2e2;
      color: #dc2626;
    }
  }

  .party {
    padding: 4px 8px;
    border-radius: 6px;
    display: inline-block;
  }

  .amount {
    &-income {
      color: #059669;
      font-weight: bold;
    }

    &-outcome {
      color: #dc2626;
      font-weight: bold;
    }
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    color: #047857;
    cursor: pointer;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    padding: 6px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 28px;
    height: 28px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }

  .action-icon {
    width: 16px;
    height: 16px;
    color: #047857;
    transition: color 0.2s ease;

    &:hover {
      color: #065f46;
    }
  }

  // Make delete icon red
  .action-btn:nth-child(2) .action-icon {
    color: #dc2626;

    &:hover {
      color: #b91c1c;
    }
  }
}

// Pagination styles
.pagination-row {
  td {
    background-color: #f9f9f9 !important;
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
  color: #6b7280;
  font-weight: 500;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background-color: white;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 40px;
  text-align: center;

  &:hover:not(:disabled) {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #f9fafb;
  }

  &.active {
    background-color: #057a55;
    color: white;
    border-color: #057a55;

    &:hover {
      background-color: #065f46;
    }
  }

  .expense-table & {
    &.active {
      background-color: #dc2626;
      border-color: #dc2626;

      &:hover {
        background-color: #b91c1c;
      }
    }
  }
}
</style>
