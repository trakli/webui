<template>
  <div>
    <ContentTopCard
      v-if="!showForm"
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
            :class="{ 'tab-button--active-income': activeTab === 'income' }"
            @click="activeTab = 'income'"
          >
            <ArrowDownLeft :size="14" class="tab-icon" />
            {{ $t('Income Categories') }}
            <span class="tab-count">{{ incomeCategories.length }}</span>
          </button>
          <button
            class="tab-button"
            :class="{ 'tab-button--active-expense': activeTab === 'expense' }"
            @click="activeTab = 'expense'"
          >
            <ArrowUpRight :size="14" class="tab-icon" />
            {{ $t('Expense Categories') }}
            <span class="tab-count">{{ expenseCategories.length }}</span>
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
import { ArrowDownLeft, ArrowUpRight } from 'lucide-vue-next';
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
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  margin-bottom: 1.25rem;
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: 12px;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: $breakpoint-sm) {
    gap: 2px;
    margin-bottom: 1rem;
  }
}

.tab-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 14px;
  background: transparent;
  border: none;
  color: $text-muted;
  font-weight: $font-semibold;
  font-size: $font-size-sm;
  letter-spacing: -0.005em;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 8px;
  transition:
    background-color $duration-fast $easing-standard,
    color $duration-fast $easing-standard;

  @media (max-width: $breakpoint-sm) {
    height: 32px;
    padding: 0 10px;
    font-size: $font-size-xs;
    gap: 6px;
  }

  &:hover {
    color: $text-primary;
  }

  &--active-income {
    background: rgba(var(--color-income-rgb), 0.14);
    color: var(--color-income);
  }

  &--active-expense {
    background: rgba(var(--color-expense-rgb), 0.14);
    color: var(--color-expense);
  }
}

.tab-icon {
  color: currentColor;
  flex-shrink: 0;
}

.tab-count {
  min-width: 22px;
  padding: 2px 7px;
  border-radius: 6px;
  background: $bg-light;
  color: $text-muted;
  font-size: 11px;
  font-weight: $font-bold;
  font-variant-numeric: tabular-nums;
  text-align: center;
  line-height: 1.4;
  transition:
    background-color $duration-fast $easing-standard,
    color $duration-fast $easing-standard;

  .tab-button--active-income & {
    background: rgba(var(--color-income-rgb), 0.22);
    color: var(--color-income);
  }
  .tab-button--active-expense & {
    background: rgba(var(--color-expense-rgb), 0.22);
    color: var(--color-expense);
  }
}

.tab-content {
  min-height: 50vh;
  width: 100%;
}
</style>
