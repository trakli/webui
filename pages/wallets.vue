<template>
  <div class="page">
    <ContentTopCard
      v-if="!showForm"
      page-name="Wallet"
      page-name-plural="Wallets"
      @add="handleOpenFormForCreation"
    >
      <template v-if="wallets.length > 0" #bottom>
        <WalletsStatsStrip
          :wallets="wallets"
          :default-wallet-id="defaultWalletId"
          :default-currency="defaultCurrency"
          :formatter="format"
        />
      </template>
    </ContentTopCard>

    <div v-if="showForm" class="form-section">
      <div class="form-wrapper">
        <WalletForm
          :editing-item="editingItem"
          :api-error="submitError"
          :is-submitting="isSubmitting"
          @created="handleCreate"
          @updated="handleUpdate"
          @close="handleFormClose"
        />
      </div>
      <TipsSection v-if="!isTabletOrBelow" page-name="Wallet" />
    </div>

    <OnboardingEmptyState
      v-else-if="!isLoading && !error && wallets.length === 0"
      page-type="wallets"
      @create="handleOpenFormForCreation"
    />

    <template v-else-if="isLoading || error || wallets.length > 0">
      <div class="split" :class="{ 'split--detail-open': isMobileDetailOpen }">
        <aside class="split-list">
          <header class="list-head">
            <div class="list-search">
              <Search :size="14" class="list-search-icon" />
              <input
                v-model="query"
                type="search"
                class="list-search-input"
                :placeholder="t('Search wallets')"
              />
            </div>
          </header>
          <ul v-if="filteredWallets.length" class="list">
            <li
              v-for="wallet in filteredWallets"
              :key="wallet.id"
              class="row"
              :class="{ 'row--active': selectedId === wallet.id }"
              @click="handleSelect(wallet)"
            >
              <span class="row-avatar">
                <component :is="iconFor(wallet)" :size="16" />
              </span>
              <div class="row-meta">
                <span class="row-name">
                  {{ wallet.name }}
                  <Star
                    v-if="String(wallet.id) === defaultWalletId"
                    :size="11"
                    class="row-default-icon"
                  />
                </span>
                <span class="row-sub">{{ wallet.currency }}</span>
              </div>
              <span class="row-net" :class="balanceToneClass(wallet)">
                {{ formatBalanceShort(wallet) }}
              </span>
            </li>
          </ul>
          <div v-else class="list-empty">{{ t('No wallets match your search.') }}</div>
        </aside>

        <section class="split-detail">
          <WalletDetailPanel
            :wallet="selectedWallet"
            :is-default="selectedWallet && String(selectedWallet.id) === defaultWalletId"
            :transactions="transactions"
            :formatter="format"
            :show-back="isTabletOrBelow"
            @back="isMobileDetailOpen = false"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </section>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import * as LucideIcons from 'lucide-vue-next';
import { Search, Star } from 'lucide-vue-next';
import { useWallets } from '@/composables/useWallets';
import { useTransactions } from '@/composables/useTransactions';
import { useSharedData } from '@/composables/useSharedData';
import { useSidebar } from '@/composables/useSidebar';
import { useNotifications } from '@/composables/useNotifications';
import { formatShortAmount } from '@/utils/currency';
import { extractApiErrors } from '@/utils/apiErrors';
import ContentTopCard from '@/components/TTopCard.vue';
import OnboardingEmptyState from '@/components/onboarding/OnboardingEmptyState.vue';
import WalletForm from '@/components/WalletForm.vue';
import WalletsStatsStrip from '@/components/wallets/WalletsStatsStrip.vue';
import WalletDetailPanel from '@/components/wallets/WalletDetailPanel.vue';
import TipsSection from '@/components/TipsSection.vue';

const { t } = useI18n();

const showForm = ref(false);
const editingItem = ref(null);
const isSubmitting = ref(false);
const submitError = ref('');
const query = ref('');
const selectedId = ref(null);
const isMobileDetailOpen = ref(false);
const { isTabletOrBelow } = useSidebar();
const sharedData = useSharedData();

const { wallets, isLoading, error, fetchWallets, createWallet, updateWallet, deleteWallet } =
  useWallets();

const { transactions } = useTransactions();
const { confirmDelete, showSuccess, showError } = useNotifications();

const defaultCurrency = computed(() => sharedData.getDefaultCurrency.value || 'USD');

const defaultWalletId = computed(() => {
  const defaultWallet = sharedData.getDefaultWallet?.value;
  return defaultWallet?.id ? String(defaultWallet.id) : null;
});

const format = (n, cur) =>
  formatShortAmount(`${Math.round((n || 0) * 100) / 100} ${cur || defaultCurrency.value}`);

const filteredWallets = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return wallets.value;
  return wallets.value.filter(
    (w) =>
      w.name?.toLowerCase().includes(q) ||
      w.currency?.toLowerCase().includes(q) ||
      w.type?.toLowerCase().includes(q) ||
      w.description?.toLowerCase().includes(q)
  );
});

const selectedWallet = computed(() => wallets.value.find((w) => w.id === selectedId.value) || null);

watch(
  wallets,
  (list) => {
    if (selectedId.value && list.some((w) => w.id === selectedId.value)) return;
    if (isTabletOrBelow.value) return;
    if (!list.length) return;
    const defaultId = defaultWalletId.value;
    const defaultWallet = defaultId ? list.find((w) => String(w.id) === defaultId) : null;
    selectedId.value = defaultWallet?.id || list[0].id;
  },
  { immediate: true }
);

const iconFor = (wallet) => {
  const v = wallet.icon?.path || wallet.icon?.content || wallet.icon;
  if (typeof v === 'string' && LucideIcons[v]) return LucideIcons[v];
  return LucideIcons.Wallet;
};

const balanceToneClass = (wallet) => {
  const b = Number(wallet.balance || 0);
  if (b > 0) return 'row-net--income';
  if (b < 0) return 'row-net--expense';
  return 'row-net--neutral';
};

const formatBalanceShort = (wallet) => {
  return format(Number(wallet.balance || 0), wallet.currency);
};

const handleSelect = (wallet) => {
  selectedId.value = wallet.id;
  if (isTabletOrBelow.value) isMobileDetailOpen.value = true;
};

const normalizeWalletName = (value) => `${value || ''}`.trim().toLowerCase();

const isDuplicateWallet = (name, ignoreId = null) => {
  const normalized = normalizeWalletName(name);
  if (!normalized) return false;
  return wallets.value.some((wallet) => {
    if (ignoreId && wallet.id === ignoreId) return false;
    return normalizeWalletName(wallet.name) === normalized;
  });
};

const isDuplicateWalletMessage = (message) => {
  const normalized = `${message || ''}`.toLowerCase();
  return normalized.includes('already exists') || normalized.includes('existe déjà');
};

async function loadWallets() {
  try {
    await fetchWallets();
    await sharedData.loadConfigurations();
  } catch (err) {
    console.error('Failed to load wallets:', err);
  }
}

function handleOpenFormForCreation() {
  editingItem.value = null;
  submitError.value = '';
  showForm.value = true;
}

function handleFormClose() {
  submitError.value = '';
  showForm.value = false;
  editingItem.value = null;
}

async function handleCreate(data) {
  if (isSubmitting.value) return;
  if (isDuplicateWallet(data?.name)) {
    submitError.value = t('Wallet already exists');
    return;
  }
  isSubmitting.value = true;
  submitError.value = '';
  try {
    await createWallet(data);
    handleFormClose();
  } catch (err) {
    const message = extractApiErrors(err);
    const isDuplicate = isDuplicateWalletMessage(message);
    submitError.value = isDuplicate ? t('Wallet already exists') : message;
    if (!isDuplicate) {
      showError(t('Error'), submitError.value || t('Failed to create wallet. Please try again.'));
    }
    console.error('Failed to create wallet:', err);
  } finally {
    isSubmitting.value = false;
  }
}

async function handleUpdate(data) {
  if (isSubmitting.value || !data.id) return;
  if (isDuplicateWallet(data?.name, data.id)) {
    submitError.value = t('Wallet already exists');
    return;
  }
  isSubmitting.value = true;
  submitError.value = '';
  try {
    const { id, ...updateData } = data;
    await updateWallet(id, updateData);
    handleFormClose();
  } catch (err) {
    const message = extractApiErrors(err);
    const isDuplicate = isDuplicateWalletMessage(message);
    submitError.value = isDuplicate ? t('Wallet already exists') : message;
    if (!isDuplicate) {
      showError(t('Error'), submitError.value || t('Failed to update wallet. Please try again.'));
    }
    console.error('Failed to update wallet:', err);
  } finally {
    isSubmitting.value = false;
  }
}

async function handleEdit(item) {
  submitError.value = '';
  editingItem.value = item;
  showForm.value = true;
}

async function handleDelete(item) {
  const confirmed = await confirmDelete('wallet');
  if (!confirmed) return;

  try {
    await deleteWallet(item.id);
    if (selectedId.value === item.id) selectedId.value = null;
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

.page {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
  width: 100%;
}

.form-section {
  display: flex;
  justify-content: flex-start;
  gap: 2rem;
  width: 100%;
}

.form-wrapper {
  min-width: 0;
}

.split {
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
  width: 100%;
  align-items: stretch;
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: 14px;
  box-shadow: $elevation-1;
  overflow: hidden;
  max-height: calc(100vh - 240px);
  min-height: 460px;

  @media (max-width: $breakpoint-md) {
    grid-template-columns: 1fr;
    position: relative;
    max-height: none;
    min-height: 0;
  }
}

.split-list {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid $border-light;

  @media (max-width: $breakpoint-md) {
    border-right: none;
    border-bottom: 1px solid $border-light;
  }
}

.list-head {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: 10px 14px;
  min-height: 52px;
  border-bottom: 1px solid $border-light;
}

.list-search {
  position: relative;
  flex: 1;
  min-width: 0;
}

.list-search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: $text-muted;
  pointer-events: none;
}

.list-search-input {
  width: 100%;
  height: 32px;
  padding: 0 10px 0 30px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: $bg-light;
  color: $text-primary;
  font-size: $font-size-sm;
  outline: none;
  transition:
    background-color $duration-fast $easing-standard,
    border-color $duration-fast $easing-standard,
    box-shadow $duration-fast $easing-standard;

  &::placeholder {
    color: $text-muted;
  }

  &:hover {
    background: $bg-gray;
  }

  &:focus {
    background: $bg-white;
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.18);
  }
}

.list {
  list-style: none;
  padding: $spacing-2;
  margin: 0;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row {
  position: relative;
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: 8px 10px 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color $duration-fast $easing-standard;

  &::before {
    content: '';
    position: absolute;
    left: 4px;
    top: 50%;
    height: 0;
    width: 3px;
    border-radius: 2px;
    background: $primary;
    transform: translateY(-50%);
    opacity: 0;
    transition:
      height $duration-base $easing-emphasized,
      opacity $duration-fast $easing-standard;
  }

  &:hover:not(&--active) {
    background: $bg-light;
  }

  &--active {
    background: $primary-light;

    &::before {
      height: 60%;
      opacity: 1;
    }

    .row-name {
      color: $primary-dark;
    }
    .row-sub {
      color: $primary;
      opacity: 0.85;
    }
  }
}

.row-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: $bg-light;
  color: $text-secondary;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color $duration-fast $easing-standard,
    color $duration-fast $easing-standard;

  .row--active & {
    background: $bg-white;
    color: $primary;
    box-shadow: 0 1px 2px rgba(var(--color-primary-rgb), 0.18);
  }
}

.row-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.row-name {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.005em;
}

.row-default-icon {
  color: $primary;
  flex-shrink: 0;
}

.row-sub {
  font-size: 11px;
  color: $text-muted;
  font-variant-numeric: tabular-nums;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.row-net {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: $font-bold;
  font-variant-numeric: tabular-nums;

  &--income {
    color: var(--color-income);
  }
  &--expense {
    color: var(--color-expense);
  }
  &--neutral {
    color: $text-muted;
  }
}

.list-empty {
  padding: $spacing-6 $spacing-4;
  text-align: center;
  font-size: $font-size-sm;
  color: $text-muted;
}

.split-detail {
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

@media (max-width: $breakpoint-md) {
  .split-detail {
    display: none;
  }
  .split--detail-open {
    .split-list {
      display: none;
    }
    .split-detail {
      display: flex;
      position: relative;
    }
  }
}
</style>
