<template>
  <div class="category-content">
    <CategoryTopCard @add="showForm = true" />

    <div class="content-area">
      <!-- Empty State -->
      <CategoryEmptyState v-if="categories.length === 0 && !showForm" @add="showForm = true" />

      <!-- Category Form -->
      <div v-if="showForm" class="form-wrapper">
        <CategoryForm @created="handleCreate" @close="showForm = false" />
      </div>

      <!-- Category List -->
      <CategoryList
        v-if="categories.length > 0"
        :categories="categories"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <div class="footer-section">
      <TFooter />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CategoryTopCard from './CategoryTopCard.vue';
import CategoryEmptyState from './CategoryEmptyState.vue';
import CategoryForm from './CategoryForm.vue';
import CategoryList from './CategoryList.vue';
import TFooter from '@/components/TFooter.vue';

const showForm = ref(false);
const categories = ref([]);

const handleCreate = (newCategory) => {
  const categoryWithId = {
    ...newCategory,
    id: Date.now(),
    createdAt: new Date().toISOString()
  };

  categories.value.push(categoryWithId);
  // Don't automatically close form anymore - user will close when done
};

// Future edit support
const handleEdit = (categoryToEdit) => {
  console.log('Edit clicked:', categoryToEdit);
  // We’ll build this next
};

// Future delete support
const handleDelete = (idToRemove) => {
  categories.value = categories.value.filter((cat) => cat.id !== idToRemove);
};
</script>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

.category-content {
  width: calc(100% - 0.5rem);
  max-width: 1400px;
  min-height: 100vh;
  background-color: $bg-white;
  border-radius: 2rem;
  border: 1px solid $bg-gray;
  margin: 0 1.5rem 1rem;
  padding: 1.5rem;
  box-sizing: border-box;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 1.25rem;
  }

  &-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
  }
}

.content-area {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  width: 100%;
}

.form-wrapper {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  max-width: 1200px;
  align-self: flex-start;
}

.footer-section {
  display: flex;
  justify-content: center;
  margin-top: 10rem;
}
</style>
