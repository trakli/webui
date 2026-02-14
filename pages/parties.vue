<template>
  <div>
    <ContentTopCard page-name="Party" page-name-plural="Parties" @add="handleOpenFormForCreation" />
    <div class="content-area">
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
        v-if="!showForm && !isLoading && parties.length === 0"
        page-type="parties"
        @create="handleOpenFormForCreation"
      />

      <ContentListView
        v-if="!showForm && (isLoading || error || parties.length > 0)"
        page-name="Party"
        page-name-plural="Parties"
        :entities="parties"
        :columns="tableColumns"
        :card-fields="cardFields"
        :is-loading="isLoading"
        :error="error"
        card-layout="grid"
        @edit="handleEdit"
        @delete="handleDelete"
      >
        <template #card="{ entity }">
          <PartyCard :party="entity" @edit="handleEdit" @delete="handleDelete" />
        </template>
      </ContentListView>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useParties } from '@/composables/useParties';
import { useTransactions } from '@/composables/useTransactions';
import { useSidebar } from '@/composables/useSidebar';
import { useNotifications } from '@/composables/useNotifications';
import { parseAmount } from '@/utils/currency';
import { extractApiErrors } from '@/utils/apiErrors';
import ContentTopCard from '@/components/TTopCard.vue';
import OnboardingEmptyState from '@/components/onboarding/OnboardingEmptyState.vue';
import PartiesForm from '@/components/PartiesForm.vue';
import ContentListView from '@/components/ContentListView.vue';
import PartyCard from '@/components/PartyCard.vue';
import TipsSection from '@/components/TipsSection.vue';

const { t } = useI18n();

const formatType = (type) => {
  if (!type) return '—';
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

const tableColumns = [
  { key: 'name', label: 'Party Name' },
  { key: 'type', label: 'Type', render: formatType },
  { key: 'description', label: 'Description' }
];

const cardFields = [{ key: 'type', label: 'Type', render: formatType }];

const showForm = ref(false);
const editingItem = ref(null);
const isSubmitting = ref(false);
const submitError = ref('');
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
      if (txn.type === 'INCOME' || txn.type === 'income') {
        receivedAmount += value;
      } else {
        spentAmount += value;
      }
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
    // Load parties (no required parameters like wallets)
    await fetchParties();
  } catch (err) {
    console.error('Failed to load parties:', err);
    // Don't throw the error to prevent page from breaking
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

.content-area {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
