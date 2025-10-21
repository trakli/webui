<template>
  <div>
    <ContentTopCard page-name="Group" page-name-plural="Groups" @add="handleOpenFormForCreation" />
    <div class="content-area">
      <div v-if="showForm" class="form-section">
        <div class="form-wrapper">
          <GroupForm
            :editing-item="editingItem"
            @created="handleCreate"
            @updated="handleUpdate"
            @close="handleFormClose"
          />
        </div>
        <TipsSection v-if="!isTabletOrBelow" page-name="Group" />
      </div>

      <div v-if="isLoading" class="loading-state">Loading groups...</div>
      <div v-if="error" class="error-state">Error: {{ error }}</div>

      <OnboardingEmptyState
        v-if="!showForm && !isLoading && groups.length === 0"
        page-type="groups"
        @create="handleOpenFormForCreation"
      />

      <ContentTable
        v-if="!showForm && !isLoading && groups.length > 0"
        page-name="Group"
        page-name-plural="Groups"
        :entities="groups"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGroups } from '@/composables/useGroups';
import { useSidebar } from '@/composables/useSidebar';
import { useNotifications } from '@/composables/useNotifications';
import ContentTopCard from '@/components/TTopCard.vue';
import OnboardingEmptyState from '@/components/onboarding/OnboardingEmptyState.vue';
import GroupForm from '@/components/groups/GroupForm.vue';
import ContentTable from '@/components/ContentTable.vue';
import TipsSection from '@/components/TipsSection.vue';

const showForm = ref(false);
const editingItem = ref(null);
const { isTabletOrBelow } = useSidebar();

const { groups, isLoading, error, fetchGroups, createGroup, updateGroup, deleteGroup } =
  useGroups();

const { confirmDelete, showSuccess, showError } = useNotifications();

async function loadGroups() {
  await fetchGroups();
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
    await createGroup(data);
    handleFormClose();
  } catch (err) {
    console.error('Failed to create group:', err);
    // Optionally, display a notification to the user
  }
}

async function handleUpdate(data) {
  if (!data.id) return;
  try {
    // Extract id and pass the rest as update data
    const { id, ...updateData } = data;
    await updateGroup(id, updateData);
    handleFormClose();
  } catch (err) {
    console.error('Failed to update group:', err);
    // Optionally, display a notification to the user
  }
}

async function handleEdit(item) {
  editingItem.value = item;
  showForm.value = true;
}

async function handleDelete(item) {
  const confirmed = await confirmDelete('group');
  if (!confirmed) return;

  try {
    await deleteGroup(item.id);
    showSuccess('Group deleted', `${item.name} has been deleted successfully`);
  } catch (err) {
    showError('Delete failed', 'Failed to delete group. Please try again.');
    console.error('Failed to delete group:', err);
  }
}

onMounted(() => {
  loadGroups();
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
</style>
