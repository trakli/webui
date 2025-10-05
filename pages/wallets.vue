<template>
  <div>
    <ContentTopCard pageName="Wallet" pageNamePlural="Wallets" @add="handleOpenFormForCreation" />
    <div class="content-area">
      <div v-if="showForm" class="form-section">
        <div class="form-wrapper">
          <WalletForm
            :editingItem="editingItem"
            @created="handleCreate"
            @updated="handleUpdate"
            @close="handleFormClose"
          />
        </div>
        <TipsSection v-if="!isMobile" pageName="Wallet" />
      </div>

      <div v-if="isLoading" class="loading-state">Loading wallets...</div>
      <div v-if="error" class="error-state">Error: {{ error }}</div>

      <EmptyState
        v-if="!showForm && !isLoading && wallets.length === 0"
        pageName="Wallet"
        @create="handleOpenFormForCreation"
      />

      <ContentTable
        v-if="!showForm && !isLoading && wallets.length > 0"
        pageName="Wallet"
        pageNamePlural="Wallets"
        :entities="wallets"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useWallets } from '@/composables/useWallets';
import { useSidebar } from '@/composables/useSidebar';
import { useNotifications } from '@/composables/useNotifications';
import ContentTopCard from '@/components/TTopCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import WalletForm from '@/components/WalletForm.vue';
import ContentTable from '@/components/ContentTable.vue';
import TipsSection from '@/components/TipsSection.vue';

const showForm = ref(false);
const editingItem = ref(null);
const { isMobile } = useSidebar();

const { wallets, isLoading, error, fetchWallets, createWallet, updateWallet, deleteWallet } =
  useWallets();

const { confirmDelete, showSuccess, showError } = useNotifications();

async function loadWallets() {
  try {
    // Load wallets (no required parameters like categories)
    await fetchWallets();
  } catch (err) {
    console.error('Failed to load wallets:', err);
    // Don't throw the error to prevent page from breaking
  }
}

function handleOpenFormForCreation() {
  editingItem.value = null;
  showForm.value = true;
}

function handleFormClose() {
  showForm.value = false;
  editingItem.value = null;
}

async function handleCreate(data) {
  try {
    await createWallet(data);
    handleFormClose();
  } catch (err) {
    console.error('Failed to create wallet:', err);
  }
}

async function handleUpdate(data) {
  if (!data.id) return;
  try {
    const { id, ...updateData } = data;
    await updateWallet(id, updateData);
    handleFormClose();
  } catch (err) {
    console.error('Failed to update wallet:', err);
  }
}

async function handleEdit(item) {
  editingItem.value = item;
  showForm.value = true;
}

async function handleDelete(item) {
  const confirmed = await confirmDelete('wallet');
  if (!confirmed) return;

  try {
    await deleteWallet(item.id);
    showSuccess('Wallet deleted', `${item.name} has been deleted successfully`);
  } catch (err) {
    showError('Delete failed', 'Failed to delete wallet. Please try again.');
    console.error('Failed to delete wallet:', err);
  }
}

onMounted(() => {
  loadWallets();
});

/* eslint-disable no-undef */
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});
/* eslint-enable no-undef */
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
  justify-content: space-between;
  gap: 3rem;
  width: 100%;
  max-width: 1400px;
  align-self: center;
  margin: 0 auto;
  padding: 0 1rem;
}

.form-wrapper {
  flex: 1;
  min-width: 0;
  max-width: 800px;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 2rem;
  color: $text-secondary;
}

.error-state {
  color: $error-color;
}
</style>
