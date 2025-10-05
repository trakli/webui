<template>
  <div>
    <ContentTopCard page-name="Party" page-name-plural="Parties" @add="handleOpenFormForCreation" />
    <div class="content-area">
      <div v-if="showForm" class="form-section">
        <div class="form-wrapper">
          <PartiesForm
            :editing-item="editingItem"
            @created="handleCreate"
            @updated="handleUpdate"
            @close="handleFormClose"
          />
        </div>
        <TipsSection v-if="!isMobile" page-name="Party" />
      </div>

      <div v-if="isLoading" class="loading-state">Loading parties...</div>
      <div v-if="error" class="error-state">Error: {{ error }}</div>

      <EmptyState
        v-if="!showForm && !isLoading && parties.length === 0"
        page-name="Party"
        @create="handleOpenFormForCreation"
      />

      <PartyCardList
        v-if="!showForm && !isLoading && parties.length > 0"
        :parties="parties"
        @edit="handleEdit"
        @delete="handleDelete"
        @view="handleView"
        @menu="handleMenu"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useParties } from '@/composables/useParties';
import { useSidebar } from '@/composables/useSidebar';
import { useNotifications } from '@/composables/useNotifications';
import ContentTopCard from '@/components/TTopCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import PartiesForm from '@/components/PartiesForm.vue';
import PartyCardList from '@/components/PartyCardList.vue';
import TipsSection from '@/components/TipsSection.vue';

const showForm = ref(false);
const editingItem = ref(null);
const { isMobile } = useSidebar();

const { parties, isLoading, error, fetchParties, createParty, updateParty, deleteParty } =
  useParties();

const { confirmDelete, showSuccess, showError } = useNotifications();

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
  showForm.value = true;
}

function handleFormClose() {
  showForm.value = false;
  editingItem.value = null;
}

async function handleCreate(data) {
  try {
    await createParty(data);
    handleFormClose();
  } catch (err) {
    console.error('Failed to create party:', err);
  }
}

async function handleUpdate(data) {
  if (!data.id) return;
  try {
    const { id, ...updateData } = data;
    await updateParty(id, updateData);
    handleFormClose();
  } catch (err) {
    console.error('Failed to update party:', err);
  }
}

function handleEdit(item) {
  editingItem.value = item;
  showForm.value = true;
}

async function handleDelete(item) {
  const confirmed = await confirmDelete('party');
  if (!confirmed) return;

  try {
    await deleteParty(item.id);
    showSuccess('Party deleted', `${item.name} has been deleted successfully`);
  } catch (err) {
    showError('Delete failed', 'Failed to delete party. Please try again.');
    console.error('Failed to delete party:', err);
  }
}

function handleView(item) {
  // Handle party view action
  console.log('View party:', item);
}

function handleMenu(item) {
  // Handle party menu action
  console.log('Menu for party:', item);
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
