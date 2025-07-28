<template>
  <div class="category-list">
    <div class="header-row">
      <h2>All Categories</h2>
      <input type="text" v-model="searchQuery" placeholder="Search ..." class="search-input" />
    </div>

    <div class="table-header">
      <div class="col-name">Categories Name</div>
      <div class="col-description">Categories Description</div>
      <div class="col-action">Action</div>
    </div>

    <TransitionGroup name="list" tag="div" class="categories-container">
      <CategoryCard
        v-for="category in paginatedCategories"
        :key="category.id"
        :name="category.name"
        :icon="category.icon"
        :description="category.description"
        @edit="onEdit(category)"
        @delete="onDelete(category)"
      />
    </TransitionGroup>

    <div class="pagination-row">
      <div class="pagination-controls">
        <button :disabled="currentPage === 1" @click="currentPage--" class="pagination-button">
          &lt; Prev
        </button>
        <div class="page-numbers">
          <button
            v-for="page in pageNumbers"
            :key="page"
            :class="[
              'page-number',
              {
                active: page === currentPage,
                ellipsis: page === '...'
              }
            ]"
            @click="page !== '...' && (currentPage = page)"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
        </div>
        <button
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          class="pagination-button"
        >
          Next &gt;
        </button>
      </div>
      <div class="page-info">
        <span>Showing</span>
        <div class="select-container">
          <select v-model.number="perPage" class="per-page-select">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
          <ChevronDown class="dropdown-icon" />
        </div>
        <span>of {{ filteredCategories.length }}</span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import CategoryCard from './CategoryCard.vue';
import { ChevronDown } from 'lucide-vue-next';

const props = defineProps({
  categories: Array
});

const searchQuery = ref('');
const currentPage = ref(1);
const perPage = ref(10);

const filteredCategories = computed(() => {
  return props.categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const totalPages = computed(() => Math.ceil(filteredCategories.value.length / perPage.value));

const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredCategories.value.slice(start, start + perPage.value);
});

const pageNumbers = computed(() => {
  const totalPageCount = totalPages.value;
  const current = currentPage.value;
  const pages = [];

  if (totalPageCount <= 5) {
    for (let i = 1; i <= totalPageCount; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    let start = Math.max(2, current - 1);
    let end = Math.min(start + 2, totalPageCount - 1);
    start = Math.min(start, totalPageCount - 3);

    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < totalPageCount - 1) pages.push('...');
    pages.push(totalPageCount);
  }

  return pages;
});

function onEdit(cat) {
  console.log('Edit category:', cat);
}

function onDelete(cat) {
  console.log('Delete category:', cat);
}
</script>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

.category-list {
  width: 100%;
  padding: 1rem;
  box-sizing: border-box;
  border-radius: 8px;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  background: white;
}
.search-input {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 250px;
}
.table-header {
  display: flex;
  justify-content: space-between;
  background: #047844;
  color: white;
  font-weight: bold;
  padding: 0.75rem 1rem;
  border-radius: 8px 8px 0 0;
  margin: 0 -1rem;
  width: calc(100% + 2rem);
}
.col-name {
  width: 15%;
}
.col-description {
  flex: 1;
}
.col-action {
  width: 10%;
  text-align: left;
}
.categories-container {
  margin: 0 -1rem;
  width: calc(100% + 2rem);
  background: $bg-gray;
}
.pagination-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: $bg-gray;
  border-radius: 0 0 8px 8px;
  border-top: 1px solid #e5e7eb;
  margin: 0 -1rem -1rem -1rem;
  width: calc(100% + 2rem);
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}
.pagination-button {
  padding: 0.5rem 1rem;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}
.pagination-button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: $primary;
}
.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.page-number {
  min-width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;

  &:hover:not(.active):not(.ellipsis) {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  &.active {
    background: #047844;
    color: white;
    border-color: #047844;
  }

  &.ellipsis {
    border: none;
    background: transparent;
    cursor: default;
    pointer-events: none;
    padding: 0 0.25rem;
  }
}
.page-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}
.select-container {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 120px;
}
.per-page-select {
  padding: 0.25rem 2rem 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  appearance: none;
  width: 100%;
}
.dropdown-btn {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dropdown-icon {
  position: absolute;
  right: 0.75rem;
  pointer-events: none;
  width: 20px;
  height: 20px;
  color: #6b7280;
}
</style>
