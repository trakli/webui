<template>
  <div class="page">
    <ContentTopCard
      v-if="!showForm"
      page-name="Party"
      page-name-plural="Parties"
      @add="handleOpenFormForCreation"
    >
      <template v-if="parties.length > 0" #bottom>
        <PartiesStatsStrip :parties="parties" :currency="defaultCurrency" :formatter="format" />
      </template>
    </ContentTopCard>

    <div v-if="showForm" class="form-section">
      <div class="form-wrapper">
        <PartiesForm
          :editing-item="editingItem"
          :api-error="submitError"
          :is-submitting="isSubmitting"
          @created="handleCreate"
          @updated="handleUpdate"
          @close="handleFormClose"
        />
      </div>
      <TipsSection v-if="!isTabletOrBelow" page-name="Party" />
    </div>

    <OnboardingEmptyState
      v-else-if="!isLoading && parties.length === 0"
      page-type="parties"
      @create="handleOpenFormForCreation"
    />

    <template v-else-if="isLoading || error || parties.length > 0">
      <div class="split" :class="{ 'split--detail-open': isMobileDetailOpen }">
        <aside class="split-list">
          <header class="list-head">
            <div class="list-search">
              <Search :size="14" class="list-search-icon" />
              <input
                v-model="query"
                type="search"
                class="list-search-input"
                :placeholder="t('Search parties')"
              />
            </div>
          </header>
          <ul v-if="filteredParties.length" class="list">
            <li
              v-for="party in filteredParties"
              :key="party.id"
              class="row"
              :class="{ 'row--active': selectedId === party.id }"
              @click="handleSelect(party)"
            >
              <span class="row-avatar">
                <component :is="iconFor(party)" :size="16" />
              </span>
              <div class="row-meta">
                <span class="row-name">{{ party.name }}</span>
                <span class="row-sub">{{ displayType(party.type) }}</span>
              </div>
              <span class="row-net" :class="netToneClass(party)">
                {{ formatShortNet(party) }}
              </span>
            </li>
          </ul>
          <div v-else class="list-empty">{{ t('No parties match your search.') }}</div>
        </aside>

        <section class="split-detail">
          <PartyDetailPanel
            :party="selectedParty"
            :transactions="transactions"
            :currency="defaultCurrency"
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
import { Search } from 'lucide-vue-next';
import { useParties } from '@/composables/useParties';
import { useTransactions } from '@/composables/useTransactions';
import { useSidebar } from '@/composables/useSidebar';
import { useNotifications } from '@/composables/useNotifications';
import { useSharedData } from '@/composables/useSharedData';
import { parseAmount, formatShortAmount } from '@/utils/currency';
import { extractApiErrors } from '@/utils/apiErrors';
import ContentTopCard from '@/components/TTopCard.vue';
import OnboardingEmptyState from '@/components/onboarding/OnboardingEmptyState.vue';
import PartiesForm from '@/components/PartiesForm.vue';
import PartiesStatsStrip from '@/components/parties/PartiesStatsStrip.vue';
import PartyDetailPanel from '@/components/parties/PartyDetailPanel.vue';
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

const {
  parties: rawParties,
  isLoading,
  error,
  fetchParties,
  createParty,
  updateParty,
  deleteParty
} = useParties();

const { transactions } = useTransactions();
const { getDefaultCurrency } = useSharedData();
const defaultCurrency = computed(() => getDefaultCurrency.value || 'USD');

const format = (n, cur) =>
  formatShortAmount(`${Math.round((n || 0) * 100) / 100} ${cur || defaultCurrency.value}`);

const parties = computed(() => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  return rawParties.value.map((party) => {
    const partyTransactions = transactions.value.filter((txn) => {
      const txnDate = new Date(txn.date || txn.datetime);
      return txn.partyId === party.id && txnDate >= threeMonthsAgo;
    });

    let receivedAmount = 0;
    let spentAmount = 0;

    partyTransactions.forEach((txn) => {
      const { value } = parseAmount(txn.amount);
      if (txn.type === 'INCOME' || txn.type === 'income') receivedAmount += value;
      else spentAmount += value;
    });

    const lastTransaction = [...partyTransactions].sort(
      (a, b) => new Date(b.date || b.datetime).getTime() - new Date(a.date || a.datetime).getTime()
    )[0];

    return {
      ...party,
      receivedAmount: Math.round(receivedAmount * 100) / 100,
      spentAmount: Math.round(spentAmount * 100) / 100,
      lastUpdated: lastTransaction?.date || lastTransaction?.datetime || party.updated_at
    };
  });
});

const filteredParties = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return parties.value;
  return parties.value.filter(
    (p) =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.type?.toLowerCase().includes(q)
  );
});

const selectedParty = computed(() => parties.value.find((p) => p.id === selectedId.value) || null);

watch(
  parties,
  (list) => {
    if (selectedId.value && list.some((p) => p.id === selectedId.value)) return;
    if (!isTabletOrBelow.value && list.length) selectedId.value = list[0].id;
  },
  { immediate: true }
);

const displayType = (type) => {
  if (!type) return '—';
  const lower = type.toLowerCase();
  const map = {
    individual: t('Individual'),
    business: t('Business'),
    organization: t('Organization'),
    vendor: t('Vendor'),
    client: t('Client')
  };
  return map[lower] || type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

const iconFor = (party) => {
  let v = '';
  if (party.icon) {
    if (typeof party.icon === 'string') v = party.icon;
    else if (party.icon.path) v = party.icon.path;
    else if (party.icon.content) v = party.icon.content;
  }
  if (v && LucideIcons[v]) return LucideIcons[v];
  return party.type === 'individual' ? LucideIcons.User : LucideIcons.Building2;
};

const netToneClass = (party) => {
  const net = Number(party.receivedAmount || 0) - Number(party.spentAmount || 0);
  if (net > 0) return 'row-net--income';
  if (net < 0) return 'row-net--expense';
  return 'row-net--neutral';
};

const formatShortNet = (party) => {
  const net = Number(party.receivedAmount || 0) - Number(party.spentAmount || 0);
  const sign = net > 0 ? '+' : '';
  return `${sign}${format(net, defaultCurrency.value)}`;
};

const handleSelect = (party) => {
  selectedId.value = party.id;
  if (isTabletOrBelow.value) isMobileDetailOpen.value = true;
};

const { confirmDelete, showSuccess, showError } = useNotifications();

const normalizePartyName = (value) => `${value || ''}`.trim().toLowerCase();

const isDuplicateParty = (name, type, ignoreId = null) => {
  const normalized = normalizePartyName(name);
  if (!normalized || !type) return false;
  return rawParties.value.some((party) => {
    if (party.type !== type) return false;
    if (ignoreId && party.id === ignoreId) return false;
    return normalizePartyName(party.name) === normalized;
  });
};

const isDuplicatePartyMessage = (message) => {
  const normalized = `${message || ''}`.toLowerCase();
  return normalized.includes('already exists') || normalized.includes('existe déjà');
};

async function loadParties() {
  try {
    await fetchParties();
  } catch (err) {
    console.error('Failed to load parties:', err);
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
  if (isDuplicateParty(data?.name, data?.type)) {
    submitError.value = t('Party already exists');
    return;
  }
  isSubmitting.value = true;
  submitError.value = '';
  try {
    await createParty(data);
    handleFormClose();
  } catch (err) {
    const message = extractApiErrors(err);
    const isDuplicate = isDuplicatePartyMessage(message);
    submitError.value = isDuplicate ? t('Party already exists') : message;
    if (!isDuplicate) {
      showError(t('Error'), submitError.value || t('Failed to create party. Please try again.'));
    }
    console.error('Failed to create party:', err);
  } finally {
    isSubmitting.value = false;
  }
}

async function handleUpdate(data) {
  if (isSubmitting.value || !data.id) return;
  if (isDuplicateParty(data?.name, data?.type, data.id)) {
    submitError.value = t('Party already exists');
    return;
  }
  isSubmitting.value = true;
  submitError.value = '';
  try {
    const { id, ...updateData } = data;
    await updateParty(id, updateData);
    handleFormClose();
  } catch (err) {
    const message = extractApiErrors(err);
    const isDuplicate = isDuplicatePartyMessage(message);
    submitError.value = isDuplicate ? t('Party already exists') : message;
    if (!isDuplicate) {
      showError(t('Error'), submitError.value || t('Failed to update party. Please try again.'));
    }
    console.error('Failed to update party:', err);
  } finally {
    isSubmitting.value = false;
  }
}

function handleEdit(item) {
  submitError.value = '';
  editingItem.value = item;
  showForm.value = true;
}

async function handleDelete(item) {
  const confirmed = await confirmDelete('party');
  if (!confirmed) return;

  try {
    await deleteParty(item.id);
    if (selectedId.value === item.id) selectedId.value = null;
    showSuccess(t('Party deleted'), t('{name} has been deleted successfully', { name: item.name }));
  } catch (err) {
    showError(t('Delete failed'), t('Failed to delete party. Please try again.'));
    console.error('Failed to delete party:', err);
  }
}

onMounted(() => {
  loadParties();
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
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.005em;
}

.row-sub {
  font-size: 11px;
  color: $text-muted;
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
