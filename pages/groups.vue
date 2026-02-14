<template>
  <div>
    <ContentTopCard page-name="Group" page-name-plural="Groups" @add="handleOpenFormForCreation" />
    <div class="content-area">
      <div v-if="showForm" class="form-section">
        <div class="form-wrapper">
          <GroupForm
            :editing-item="editingItem"
            :api-error="submitError"
            :is-submitting="isSubmitting"
            @created="handleCreate"
            @updated="handleUpdate"
            @close="handleFormClose"
          />
        </div>
        <TipsSection v-if="!isTabletOrBelow" page-name="Group" />
      </div>

      <div v-if="isLoading" class="loading-state">{{ t('Loading groups...') }}</div>
      <div v-if="error" class="error-state">{{ t('Error:') }} {{ error }}</div>

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
import { extractApiErrors } from '@/utils/apiErrors';
import ContentTopCard from '@/components/TTopCard.vue';
import OnboardingEmptyState from '@/components/onboarding/OnboardingEmptyState.vue';
import GroupForm from '@/components/groups/GroupForm.vue';
import ContentTable from '@/components/ContentTable.vue';
import TipsSection from '@/components/TipsSection.vue';

const { t } = useI18n();

const showForm = ref(false);
const editingItem = ref(null);
const isSubmitting = ref(false);
const submitError = ref('');
const { isTabletOrBelow } = useSidebar();

const { groups, isLoading, error, fetchGroups, createGroup, updateGroup, deleteGroup } =
  useGroups();

const { confirmDelete, showSuccess, showError } = useNotifications();

const normalizeGroupName = (value) => `${value || ''}`.trim().toLowerCase();

const isDuplicateGroup = (name, ignoreId = null) => {
  const normalized = normalizeGroupName(name);
  if (!normalized) return false;

  return groups.value.some((group) => {
    if (ignoreId && group.id === ignoreId) return false;
    return normalizeGroupName(group.name) === normalized;
  });
};

const isDuplicateGroupMessage = (message) => {
  const normalized = `${message || ''}`.toLowerCase();
  return normalized.includes('already exists') || normalized.includes('existe déjà');
};

async function loadGroups() {
  await fetchGroups();
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

  if (isDuplicateGroup(data?.name)) {
    submitError.value = t('Group already exists');
    return;
  }

  isSubmitting.value = true;
  submitError.value = '';
  try {
    await createGroup(data);
    handleFormClose();
  } catch (err) {
    const message = extractApiErrors(err);
    const isDuplicate = isDuplicateGroupMessage(message);
    submitError.value = isDuplicate ? t('Group already exists') : message;
    if (!isDuplicate) {
      showError(t('Error'), submitError.value || t('Failed to create group. Please try again.'));
    }
    console.error('Failed to create group:', err);
  } finally {
    isSubmitting.value = false;
  }
}

async function handleUpdate(data) {
  if (isSubmitting.value || !data.id) return;

  if (isDuplicateGroup(data?.name, data.id)) {
    submitError.value = t('Group already exists');
    return;
  }

  isSubmitting.value = true;
  submitError.value = '';
  try {
    // Extract id and pass the rest as update data
    const { id, ...updateData } = data;
    await updateGroup(id, updateData);
    handleFormClose();
  } catch (err) {
    const message = extractApiErrors(err);
    const isDuplicate = isDuplicateGroupMessage(message);
    submitError.value = isDuplicate ? t('Group already exists') : message;
    if (!isDuplicate) {
      showError(t('Error'), submitError.value || t('Failed to update group. Please try again.'));
    }
    console.error('Failed to update group:', err);
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
  const confirmed = await confirmDelete('group');
  if (!confirmed) return;

  try {
    await deleteGroup(item.id);
    showSuccess(t('Group deleted'), t('{name} has been deleted successfully', { name: item.name }));
  } catch (err) {
    showError(t('Delete failed'), t('Failed to delete group. Please try again.'));
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
</style>
