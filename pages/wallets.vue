<template>
  <div>
    <ContentTopCard
      page-name="Wallet"
      page-name-plural="Wallets"
      @add="handleOpenFormForCreation"
    />
    <div class="content-area">
      <div v-if="showForm" class="form-section">
        <div class="form-wrapper">
          <WalletForm
            :editing-item="editingItem"
            @created="handleCreate"
            @updated="handleUpdate"
            @close="handleFormClose"
          />
        </div>
        <TipsSection v-if="!isTabletOrBelow" page-name="Wallet" />
      </div>

      <OnboardingEmptyState
        v-if="!showForm && !isLoading && !error && wallets.length === 0"
        page-type="wallets"
        @create="handleOpenFormForCreation"
      />

      <ContentTable
        v-if="!showForm && (isLoading || error || wallets.length > 0)"
        page-name="Wallet"
        page-name-plural="Wallets"
        :entities="wallets"
        :is-loading="isLoading"
        :error="error"
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
import OnboardingEmptyState from '@/components/onboarding/OnboardingEmptyState.vue';
import WalletForm from '@/components/WalletForm.vue';
import ContentTable from '@/components/ContentTable.vue';
import TipsSection from '@/components/TipsSection.vue';

const showForm = ref(false);
const editingItem = ref(null);
const { isTabletOrBelow } = useSidebar();

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

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});
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

.error-state {
  text-align: center;
  padding: 2rem;
  color: $error-color;
}
</style>
