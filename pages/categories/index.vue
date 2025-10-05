<template>
  <div>
    <ContentTopCard
      pageName="Category"
      pageNamePlural="Categories"
      @add="handleOpenFormForCreation"
    />
    <div class="content-area">
      <div v-if="showForm" class="form-section">
        <div class="form-wrapper">
          <CategoryForm
            :editingItem="editingItem"
            @created="handleCreate"
            @updated="handleUpdate"
            @close="handleFormClose"
          />
        </div>
        <TipsSection v-if="!isMobile" pageName="Category" />
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="loader">
          <div class="spinner"></div>
          <p>Loading categories...</p>
        </div>
      </div>

      <div v-else-if="error" class="error-state">
        <p>Error: {{ error }}</p>
        <button @click="loadCategories" class="retry-button">Try Again</button>
      </div>

      <div v-else-if="!showForm" class="category-tabs">
        <div class="tab-buttons">
          <button
            class="tab-button"
            :class="{ active: activeTab === 'income' }"
            @click="activeTab = 'income'"
          >
            <span class="tab-icon">💰</span>
            Income Categories
            <span class="tab-count">({{ incomeCategories.length }})</span>
          </button>
          <button
            class="tab-button"
            :class="{ active: activeTab === 'expense' }"
            @click="activeTab = 'expense'"
          >
            <span class="tab-icon">💸</span>
            Expense Categories
            <span class="tab-count">({{ expenseCategories.length }})</span>
          </button>
        </div>

        <div class="tab-content">
          <EmptyState
            v-if="currentCategories.length === 0"
            :pageName="`${currentCategoryType} Category`"
            @create="handleOpenFormForCreation"
          />

          <ContentTable
            v-if="currentCategories.length > 0"
            :pageName="`${currentCategoryType} Category`"
            :pageNamePlural="`${currentCategoryType} Categories`"
            :entities="currentCategories"
            :headerType="activeTab === 'expense' ? 'expense' : 'default'"
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
import ContentTopCard from '@/components/TTopCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import CategoryForm from '@/components/categories/CategoryForm.vue';
import ContentTable from '@/components/ContentTable.vue';
import TipsSection from '@/components/TipsSection.vue';

const showForm = ref(false);
const editingItem = ref(null);
const activeTab = ref('income');
const { isMobile } = useSidebar();

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
  showForm.value = true;
}

function handleFormClose() {
  showForm.value = false;
  editingItem.value = null;
}

async function handleCreate(data) {
  try {
    await createCategory(data);
    handleFormClose();
  } catch (err) {
    console.error('Failed to create category:', err);
  }
}

async function handleUpdate(data) {
  if (!data.id) return;
  try {
    const { id, ...updateData } = data;
    await updateCategory(id, updateData);
    handleFormClose();
  } catch (err) {
    console.error('Failed to update category:', err);
  }
}

async function handleEdit(item) {
  editingItem.value = item;
  showForm.value = true;
}

async function handleDelete(item) {
  const confirmed = await confirmDelete('category');
  if (!confirmed) return;

  try {
    await deleteCategory(item.id);
    showSuccess('Category deleted', `${item.name} has been deleted successfully`);
  } catch (err) {
    showError('Delete failed', 'Failed to delete category. Please try again.');
    console.error('Failed to delete category:', err);
  }
}

onMounted(() => {
  loadCategories();
});

/* eslint-disable no-undef */
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});
/* eslint-enable no-undef */
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
  border: 4px solid #f3f4f6;
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
  max-width: 1400px;
}

.tab-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;

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
    background: #f8fafc;
    color: $primary;
  }

  // Hover state for expense categories button (second child)
  &:nth-child(2):hover {
    color: #dc2626;
  }

  &.active {
    color: $primary;
    background: #f0f9ff;
    border-bottom-color: $primary;
  }

  // Active state for expense categories button (second child)
  &:nth-child(2).active {
    color: #dc2626;
    background: #fee2e2;
    border-bottom-color: #dc2626;
  }
}

.tab-icon {
  font-size: 1.2rem;

  @media (max-width: $breakpoint-sm) {
    font-size: 1rem;
  }
}

.tab-count {
  background: #e5e7eb;
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
    background: rgba(220, 38, 38, 0.1);
    color: #dc2626;
  }
}

.tab-content {
  min-height: 50vh;
  width: 100%;
}
</style>
