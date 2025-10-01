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

      <div v-if="isLoading" class="loading-state">Loading categories...</div>
      <div v-if="error" class="error-state">Error: {{ error }}</div>

      <EmptyState
        v-if="!showForm && !isLoading && categories.length === 0"
        pageName="Category"
        @create="handleOpenFormForCreation"
      />

      <ContentTable
        v-if="!showForm && !isLoading && categories.length > 0"
        pageName="Category"
        pageNamePlural="Categories"
        :entities="categories"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCategories } from '@/composables/useCategories';
import { useSidebar } from '@/composables/useSidebar';
import ContentTopCard from '@/components/TTopCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import CategoryForm from '@/components/categories/CategoryForm.vue';
import ContentTable from '@/components/ContentTable.vue';
import TipsSection from '@/components/TipsSection.vue';

const showForm = ref(false);
const editingItem = ref(null);
const { isMobile } = useSidebar();

const {
  categories,
  isLoading,
  error,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = useCategories();

async function loadCategories() {
  try {
    // Load both income and expense categories
    await fetchCategories('income');
    await fetchCategories('expense');
    console.log('✅ All categories loaded:', categories.value.length);
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
  if (!confirm('Are you sure you want to delete this category?')) return;
  try {
    await deleteCategory(item.id);
  } catch (err) {
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
