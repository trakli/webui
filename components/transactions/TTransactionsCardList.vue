<template>
  <div class="transactions-cards">
    <div class="cards-heading">
      <h1 class="cards-heading__text">All Transactions</h1>
      <div class="input-controls">
        <SearchInput
          :model-value="searchQuery"
          placeholder="Search..."
          :debounce="0"
          @update:model-value="$emit('update:searchQuery', $event)"
        />
      </div>
    </div>

    <div class="cards-list">
      <div
        v-for="(txn, idx) in displayedTransactions"
        :key="txn.id ?? idx"
        class="card txn-card"
        :class="txn.type === 'INCOME' ? 'card--income' : 'card--expense'"
        @click="$emit('edit', txn)"
      >
        <div class="txn-card__top">
          <div class="icon-tile" :class="txn.type === 'INCOME' ? 'tile--income' : 'tile--expense'">
            <ArrowDownLeftIcon v-if="txn.type === 'INCOME'" class="tile-icon" />
            <ArrowUpRightIcon v-else class="tile-icon" />
          </div>
          <div class="header-line">
            <span class="prefix">{{ directionLabel(txn.type) }}</span>
            <UserIcon class="user-icon" />
            <span class="party">{{ txn.party || '—' }}</span>
            <span v-if="txn.isTransfer" class="transfer-indicator">Transfer</span>
          </div>
          <div class="amount" :class="txn.type === 'INCOME' ? 'amount--income' : 'amount--expense'">
            {{ formatShortAmount(txn.amount) }}
          </div>
        </div>
        <div class="txn-card__middle">
          <span
            class="txn-chip"
            :class="isDefaultWallet(txn) ? 'txn-chip--default' : 'txn-chip--wallet'"
          >
            <LockClosedIcon v-if="isDefaultWallet(txn)" class="txn-chip__icon" />
            <CreditCardIcon v-else class="txn-chip__icon" />
            <span class="txn-chip__text">{{
              isDefaultWallet(txn) ? 'Default' : txn.wallet || '—'
            }}</span>
          </span>
        </div>
        <div class="txn-card__bottom">
          <div class="desc" :title="txn.description">{{ txn.description }}</div>
          <div class="date">{{ formatShortDate(txn) }}</div>
        </div>
      </div>
    </div>

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
        <span class="entries-text"
          >Showing {{ startEntry }}-{{ endEntry }} of {{ totalEntriesComputed }} entries</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  UserIcon,
  LockClosedIcon,
  CreditCardIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon
} from '@heroicons/vue/24/outline';
import { useSharedData } from '@/composables/useSharedData';
import { formatShortAmount } from '@/utils/currency';
import SearchInput from '@/components/SearchInput.vue';

const props = defineProps({
  transactions: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  currentPage: { type: Number, default: 1 },
  itemsPerPage: { type: Number, default: 10 },
  totalPages: { type: Number, default: 1 },
  totalEntries: { type: Number, default: 0 }
});

defineEmits(['edit', 'delete', 'page-change', 'update:searchQuery']);

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

// Shared data to detect default wallet
const sharedData = useSharedData();
const defaultWallet = computed(() => sharedData.getDefaultWallet.value);

function isDefaultWallet(txn) {
  const dw = defaultWallet.value;
  if (!dw) return false;
  if (txn.walletId && txn.walletId === dw.id) return true;
  if (txn.wallet && dw.name && txn.wallet === dw.name) return true;
  return false;
}

// Helpers for UI formatting
const directionLabel = (type) => (type === 'INCOME' ? 'From' : 'To');

function formatShortDate(txn) {
  const iso = txn?.date || '';
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_transactions-cards.scss' as *;

.transfer-indicator {
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
</style>
