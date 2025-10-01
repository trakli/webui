<template>
  <div class="content-area">
    <TTopCard :pageName="'Transaction'" :pageNamePlural="'Transactions'" @add="openCreate" />

    <div v-if="showForm" class="form-section">
      <div class="form-wrapper">
        <FormSection :editingItem="editingItem" @submit="handleSubmit" />
      </div>
    </div>

    <EmptyState
      v-if="!showForm && paginatedTransactions.length === 0"
      :pageName="'Transaction'"
      @create="openCreate"
    />

    <TTableComponent
      v-if="!showForm && paginatedTransactions.length > 0"
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
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useTransactions } from '@/composables/useTransactions';
import TTopCard from '@/components/TTopCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import FormSection from '@/components/FormSection.vue';
import TTableComponent from '@/components/TTableComponent.vue';

const showForm = ref(false);
const editingItem = ref(null);
const route = useRoute();

const {
  transactions,
  paginatedTransactions,
  filteredTransactions,
  searchQuery,
  filterQuery,
  currentPage,
  itemsPerPage,
  totalPages,
  addTransaction,
  updateTransaction,
  deleteTransaction
} = useTransactions();

function openCreate() {
  showForm.value = true;
  editingItem.value = null;
}

function handleEdit(txn) {
  editingItem.value = txn;
  showForm.value = true;
}

function handleSubmit(data) {
  if (editingItem.value) {
    const updates = { ...(data || {}) };
    delete updates.id;
    updateTransaction(editingItem.value.id, updates);
  } else {
    addTransaction(data);
  }
  showForm.value = false;
  editingItem.value = null;
}

function handleDelete(txn) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    deleteTransaction(txn.id);
  }
}

function openEditById(id) {
  if (!id) return;
  const all = [
    ...filteredTransactions.value,
    ...paginatedTransactions.value,
    ...transactions.value
  ];
  const found = all.find((t) => String(t.id) === String(id));
  if (found) {
    handleEdit(found);
  }
}

onMounted(() => {
  const id = route.query?.edit;
  if (id) openEditById(id);
});

watch(
  () => route.query?.edit,
  (id) => {
    if (id) openEditById(id);
  }
);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables' as *;

.content-area {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  width: 100%;
}

.form-section {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  padding: 0 1rem;
}

.form-wrapper {
  max-width: 800px;
  width: 100%;
}
</style>
