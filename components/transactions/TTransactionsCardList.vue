<template>
  <div class="transactions-cards">
    <div class="cards-heading">
      <h1 class="cards-heading__text">All Transactions</h1>
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

    <div class="cards-list">
      <div
        v-for="(txn, idx) in displayedTransactions"
        :key="txn.id ?? idx"
        class="card"
        :class="txn.type === 'INCOME' ? 'card--income' : 'card--expense'"
      >
        <div class="card__header">
          <span class="card__badge" :class="txn.type === 'INCOME' ? 'badge--income' : 'badge--expense'">
            {{ txn.type }}
          </span>
          <div class="card__title-group">
            <div class="card__title">{{ formatDate(txn) }}</div>
            <div class="card__subtitle">{{ txn.party }}</div>
          </div>
          <div class="card__amount" :class="txn.type === 'INCOME' ? 'amount--income' : 'amount--expense'">
            {{ txn.amount }}
          </div>
          <button class="card__toggle" @click="toggleExpanded(txn.id ?? idx)" :aria-expanded="isExpanded(txn.id ?? idx)">
            <ChevronDownIcon class="toggle-icon" :class="{ 'is-open': isExpanded(txn.id ?? idx) }" />
          </button>
        </div>

        <div class="card__details" v-show="isExpanded(txn.id ?? idx)">
         
          <div class="details__tiles">
            <div class="tile">
              <div class="tile__label">Party</div>
              <div class="tile__value">{{ txn.party }}</div>
            </div>
            <div class="tile">
              <div class="tile__label">Category</div>
              <div class="tile__value">{{ txn.category }}</div>
            </div>
          </div>
          <div class="details__meta">
            <div class="details__timeago">{{ formatTimeAgo(txn) }}</div>
            <div class="card__actions">
              <button class="action-btn" aria-label="Edit" @click="$emit('edit', txn)">
                <PencilSquareIcon class="action-icon" />
              </button>
              <button class="action-btn action-btn--delete" aria-label="Delete" @click="$emit('delete', txn)">
                <TrashIcon class="action-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-container">
      <div class="pagination-controls">
        <button class="pagination-btn" :disabled="currentPage === 1" @click="$emit('page-change', currentPage - 1)">
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
        <button class="pagination-btn" :disabled="currentPage === pagesTotal" @click="$emit('page-change', currentPage + 1)">
          Next
        </button>
      </div>
      <div class="pagination-info">
        <span class="entries-text">Showing {{ startEntry }}-{{ endEntry }} of {{ totalEntriesComputed }} entries</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  transactions: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  filterQuery: { type: String, default: '' },
  currentPage: { type: Number, default: 1 },
  itemsPerPage: { type: Number, default: 10 },
  totalPages: { type: Number, default: 1 },
  totalEntries: { type: Number, default: 0 }
});

defineEmits(['edit', 'delete', 'page-change', 'update:searchQuery', 'update:filterQuery']);

const displayedTransactions = computed(() => props.transactions);

const totalEntriesComputed = computed(() => {
  if (props.totalEntries && props.totalEntries > 0) return props.totalEntries;
  return displayedTransactions.value.length;
});

const pagesTotal = computed(() => {
  if (props.totalPages && props.totalPages > 1) return props.totalPages;
  return Math.max(1, Math.ceil(totalEntriesComputed.value / props.itemsPerPage));
});

const startEntry = computed(() => {
  if (totalEntriesComputed.value === 0) return 0;
  return (props.currentPage - 1) * props.itemsPerPage + 1;
});

const endEntry = computed(() => {
  const end = props.currentPage * props.itemsPerPage;
  return Math.min(end, totalEntriesComputed.value);
});

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  const total = pagesTotal.value;
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(total, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

// Expand/collapse per card
const expanded = ref(new Set());
const isExpanded = (key) => expanded.value.has(key);
const toggleExpanded = (key) => {
  const next = new Set(expanded.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  expanded.value = next;
};

// Formatters (reuse logic from table)
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
@use '@/assets/scss/_transactions-cards.scss' as *;
</style>
