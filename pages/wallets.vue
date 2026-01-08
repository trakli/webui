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

      <ContentListView
        v-if="!showForm && (isLoading || error || wallets.length > 0)"
        page-name="Wallet"
        page-name-plural="Wallets"
        :entities="wallets"
        :columns="tableColumns"
        :card-fields="cardFields"
        :is-loading="isLoading"
        :error="error"
        :default-item-id="defaultWalletId"
        :grid-columns="4"
        @edit="handleEdit"
        @delete="handleDelete"
      >
        <template #card="{ entity, isDefault }">
          <WalletListCard
            :wallet="entity"
            :is-default="isDefault"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </template>
      </ContentListView>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useWallets } from '@/composables/useWallets';
import { useSharedData } from '@/composables/useSharedData';
import { useSidebar } from '@/composables/useSidebar';
import { useNotifications } from '@/composables/useNotifications';
import { getCurrencySymbol } from '@/utils/currency';
import ContentTopCard from '@/components/TTopCard.vue';
import OnboardingEmptyState from '@/components/onboarding/OnboardingEmptyState.vue';
import WalletForm from '@/components/WalletForm.vue';
import ContentListView from '@/components/ContentListView.vue';
import WalletListCard from '@/components/WalletListCard.vue';
import TipsSection from '@/components/TipsSection.vue';

const { t } = useI18n();

const formatBalance = (balance, wallet) => {
  if (balance == null) return '—';
  const symbol = getCurrencySymbol(wallet.currency);
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(balance);
  return `${formatted} ${symbol}`;
};

const tableColumns = [
  { key: 'name', label: 'Wallet Name' },
  { key: 'balance', label: 'Balance', align: 'right', render: formatBalance },
  { key: 'currency', label: 'Currency' },
  { key: 'description', label: 'Description' }
];

const cardFields = [
  { key: 'balance', label: 'Balance', render: formatBalance },
  { key: 'currency', label: 'Currency' }
];

const showForm = ref(false);
const editingItem = ref(null);
const { isTabletOrBelow } = useSidebar();
const sharedData = useSharedData();

const { wallets, isLoading, error, fetchWallets, createWallet, updateWallet, deleteWallet } =
  useWallets();

const { confirmDelete, showSuccess, showError } = useNotifications();

const defaultWalletId = computed(() => {
  const defaultWallet = sharedData.getDefaultWallet?.value;
  return defaultWallet?.id ? String(defaultWallet.id) : null;
});

async function loadWallets() {
  try {
    // Load wallets and configurations
    await fetchWallets();
    await sharedData.loadConfigurations();
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
    showSuccess(
      t('Wallet deleted'),
      t('{name} has been deleted successfully', { name: item.name })
    );
  } catch (err) {
    showError(t('Delete failed'), t('Failed to delete wallet. Please try again.'));
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
