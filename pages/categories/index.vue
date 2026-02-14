<template>
  <div>
    <ContentTopCard
      page-name="Category"
      page-name-plural="Categories"
      @add="handleOpenFormForCreation"
    />
    <div class="content-area">
      <div v-if="showForm" class="form-section">
        <div class="form-wrapper">
          <CategoryForm
            :editing-item="editingItem"
            :api-error="submitError"
            :is-submitting="isSubmitting"
            @created="handleCreate"
            @updated="handleUpdate"
            @close="handleFormClose"
          />
        </div>
        <TipsSection v-if="!isTabletOrBelow" page-name="Category" />
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="loader">
          <div class="spinner" />
          <p>{{ t('Loading categories...') }}</p>
        </div>
      </div>

      <div v-else-if="error" class="error-state">
        <p>{{ t('Error:') }} {{ error }}</p>
        <button class="retry-button" @click="loadCategories">{{ t('Try Again') }}</button>
      </div>

      <div v-else-if="!showForm" class="category-tabs">
        <div class="tab-buttons">
          <button
            class="tab-button"
            :class="{ active: activeTab === 'income' }"
            @click="activeTab = 'income'"
          >
            <span class="tab-icon">💰</span>
            {{ $t('Income Categories') }}
            <span class="tab-count">({{ incomeCategories.length }})</span>
          </button>
          <button
            class="tab-button"
            :class="{ active: activeTab === 'expense' }"
            @click="activeTab = 'expense'"
          >
            <span class="tab-icon">💸</span>
            {{ $t('Expense Categories') }}
            <span class="tab-count">({{ expenseCategories.length }})</span>
          </button>
        </div>

        <div class="tab-content">
          <OnboardingEmptyState
            v-if="currentCategories.length === 0"
            page-type="categories"
            @create="handleOpenFormForCreation"
          />

          <ContentTable
            v-if="currentCategories.length > 0"
            :page-name="`${currentCategoryType} Category`"
            :page-name-plural="`${currentCategoryType} Categories`"
            :entities="currentCategories"
            :header-type="activeTab === 'expense' ? 'expense' : 'default'"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCategories } from '@/composables/useCategories';
import { useSidebar } from '@/composables/useSidebar';
import { useNotifications } from '@/composables/useNotifications';
import { useSharedData } from '@/composables/useSharedData';
import { extractApiErrors } from '@/utils/apiErrors';
import ContentTopCard from '@/components/TTopCard.vue';
import OnboardingEmptyState from '@/components/onboarding/OnboardingEmptyState.vue';
import CategoryForm from '@/components/categories/CategoryForm.vue';
import ContentTable from '@/components/ContentTable.vue';
import TipsSection from '@/components/TipsSection.vue';

const { t } = useI18n();

const showForm = ref(false);
const editingItem = ref(null);
const activeTab = ref('income');
const isSubmitting = ref(false);
const submitError = ref('');
const { isTabletOrBelow } = useSidebar();

// Get shared data for filtered categories
const sharedData = useSharedData();

const { isLoading, error, createCategory, updateCategory, deleteCategory } = useCategories();

// Computed properties for filtered categories
const incomeCategories = computed(() => sharedData.getIncomeCategories.value);

const expenseCategories = computed(() => sharedData.getExpenseCategories.value);

const currentCategories = computed(() =>
  activeTab.value === 'income' ? incomeCategories.value : expenseCategories.value
);

const currentCategoryType = computed(() => (activeTab.value === 'income' ? 'Income' : 'Expense'));

const { confirmDelete, showSuccess, showError } = useNotifications();

const normalizeCategoryName = (value) => `${value || ''}`.trim().toLowerCase();

const isDuplicateCategory = (name, type, ignoreId = null) => {
  const normalized = normalizeCategoryName(name);
  if (!normalized || !type) return false;

  return sharedData.categories.value.some((category) => {
    if (category.type !== type) return false;
    if (ignoreId && category.id === ignoreId) return false;
    return normalizeCategoryName(category.name) === normalized;
  });
};

const isDuplicateCategoryMessage = (message) => {
  const normalized = `${message || ''}`.toLowerCase();
  return normalized.includes('already exists') || normalized.includes('existe déjà');
};

async function loadCategories() {
  try {
    // Load all data through shared data composable
    await sharedData.loadCategories();
    console.log(
      '✅ All categories loaded - Income:',
      incomeCategories.value.length,
      'Expense:',
      expenseCategories.value.length
    );
  } catch (err) {
    console.error('Failed to load categories:', err);
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

  if (isDuplicateCategory(data?.name, data?.type)) {
    submitError.value = t('Category already exists');
    return;
  }

  isSubmitting.value = true;
  submitError.value = '';
  try {
    await createCategory(data);
    handleFormClose();
  } catch (err) {
    const message = extractApiErrors(err);
    const isDuplicate = isDuplicateCategoryMessage(message);
    submitError.value = isDuplicate ? t('Category already exists') : message;
    if (!isDuplicate) {
      showError(t('Error'), submitError.value || t('Failed to create category. Please try again.'));
    }
    console.error('Failed to create category:', err);
  } finally {
    isSubmitting.value = false;
  }
}

async function handleUpdate(data) {
  if (isSubmitting.value || !data.id) return;

  if (isDuplicateCategory(data?.name, data?.type, data.id)) {
    submitError.value = t('Category already exists');
    return;
  }

  isSubmitting.value = true;
  submitError.value = '';
  try {
    const { id, ...updateData } = data;
    await updateCategory(id, updateData);
    handleFormClose();
  } catch (err) {
    const message = extractApiErrors(err);
    const isDuplicate = isDuplicateCategoryMessage(message);
    submitError.value = isDuplicate ? t('Category already exists') : message;
    if (!isDuplicate) {
      showError(t('Error'), submitError.value || t('Failed to update category. Please try again.'));
    }
    console.error('Failed to update category:', err);
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
  const confirmed = await confirmDelete('category');
  if (!confirmed) return;

  try {
    await deleteCategory(item.id);
    showSuccess(
      t('Category deleted'),
      t('{name} has been deleted successfully', { name: item.name })
    );
  } catch (err) {
    showError(t('Delete failed'), t('Failed to delete category. Please try again.'));
    console.error('Failed to delete category:', err);
  }
}

onMounted(() => {
  loadCategories();
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

@media (max-width: $breakpoint-md) {
  .form-section {
    flex-direction: column;
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  width: 100%;
}

.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  p {
    color: $text-secondary;
    font-size: 1rem;
    margin: 0;
  }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid $bg-light;
  border-top: 4px solid $primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  padding: 2rem;
  min-height: 50vh;
  justify-content: center;

  p {
    color: $error-color;
    margin: 0;
    font-size: 1rem;
  }
}

.retry-button {
  padding: 0.5rem 1rem;
  background: $primary;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s ease;

  &:hover {
    background: $primary-hover;
  }
}

.category-tabs {
  width: 100%;
}

.tab-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid $border-color;

  @media (max-width: $breakpoint-sm) {
    gap: 0.25rem;
    margin-bottom: 1rem;
  }
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: $text-secondary;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px 8px 0 0;

  @media (max-width: $breakpoint-md) {
    padding: 0.625rem 1.25rem;
    font-size: 0.95rem;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
  }

  &:hover {
    background: $bg-slate;
    color: $primary;
  }

  // Hover state for expense categories button (second child)
  &:nth-child(2):hover {
    color: $error-color;
  }

  &.active {
    color: $primary;
    background: $primary-light;
    border-bottom-color: $primary;
  }

  // Active state for expense categories button (second child)
  &:nth-child(2).active {
    color: $error-color;
    background: rgba(var(--color-error-rgb), 0.1);
    border-bottom-color: $error-color;
  }
}

.tab-icon {
  font-size: 1.2rem;

  @media (max-width: $breakpoint-sm) {
    font-size: 1rem;
  }
}

.tab-count {
  background: $border-color;
  color: $text-secondary;
  padding: 0.125rem 0.375rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;

  @media (max-width: $breakpoint-sm) {
    font-size: 0.7rem;
    padding: 0.0625rem 0.25rem;
  }

  .tab-button.active & {
    background: $primary-light;
    color: $primary;
  }

  // Count styling for expense categories tab
  .tab-button:nth-child(2).active & {
    background: rgba(var(--color-error-rgb), 0.1);
    color: $error-color;
  }
}

.tab-content {
  min-height: 50vh;
  width: 100%;
}
</style>
