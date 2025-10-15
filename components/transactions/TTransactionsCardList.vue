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
            <span class="party">{{ txn.party || 'Inconnu' }}</span>
          </div>
          <div class="amount" :class="txn.type === 'INCOME' ? 'amount--income' : 'amount--expense'">
            {{ formatShortAmount(txn.amount) }}
          </div>
        </div>
        <div class="txn-card__middle">
          <span class="chip" :class="isDefaultWallet(txn) ? 'chip--default' : 'chip--wallet'">
            <LockClosedIcon v-if="isDefaultWallet(txn)" class="chip-icon" />
            <CreditCardIcon v-else class="chip-icon" />
            <span class="chip-text">{{
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
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  LockClosedIcon,
  CreditCardIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon
} from '@heroicons/vue/24/outline';
import { useSharedData } from '@/composables/useSharedData';

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

// Shared data to detect default wallet
const sharedData = useSharedData();
const defaultWallet = computed(() => sharedData.getDefaultWallet.value);

function isDefaultWallet(txn) {
  const dw = defaultWallet.value;
  if (!dw) return false;
  const txnId = txn.walletId;
  const dwClientId = dw?.sync_state?.client_generated_id
    ? String(dw.sync_state.client_generated_id)
    : undefined;
  if (txnId && dwClientId && String(txnId) === dwClientId) return true;
  const dwId = dw?.id != null ? String(dw.id) : undefined;
  if (txnId && dwId && String(txnId) === dwId) return true;
  if (txn.wallet && dw?.name && txn.wallet === dw.name) return true;
  return false;
}

// Helpers for UI formatting
const directionLabel = (type) => (type === 'INCOME' ? 'From' : 'To');

function formatShortAmount(amountStr) {
  if (!amountStr || typeof amountStr !== 'string') return amountStr || '';
  // Robust parsing: remove non-numeric chars except decimal point and optionally parse based on locale
  // For simplicity, assuming '.' is always the decimal separator for internal parsing.
  const cleanedAmount = amountStr.replace(/[^\d.,]/g, '').replace(/,/g, '.');
  const num = parseFloat(cleanedAmount) || 0;
  const parts = amountStr.trim().split(/\s+/);
  const currencyRaw = parts[parts.length - 1] || '';
  const currency = currencyRaw === 'XAF' ? 'FCFA' : currencyRaw;
  // Use Intl.NumberFormat for locale-aware formatting (e.g., for French locale where comma is decimal)
  const formatter = new Intl.NumberFormat(navigator.language, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  if (num >= 1000) {
    const k = Math.round((num / 1000) * 10) / 10;
    return `${formatter.format(k)} k ${currency}`;
  }
  return `${formatter.format(num)} ${currency}`;
}

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
</style>
