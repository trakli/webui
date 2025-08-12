<template>
  <div class="entity-list">
    <div class="header-row">
      <h1>All {{ pageNamePlural }}</h1>
      <input
        type="text"
        v-model="searchQuery"
        :placeholder="`Search ${pageNamePlural.toLowerCase()}...`"
        class="search-input"
      />
    </div>

    <div class="table-header">
      <div class="col-name">{{ pageName }} Name</div>
      <div class="col-description">{{ pageName }} Description</div>
      <div class="col-action">Action</div>
    </div>

    <TransitionGroup
      name="list"
      tag="div"
      class="entities-container"
      @after-enter="$emit('item-add-complete')"
    >
      <ContentCard
        v-for="entity in paginatedEntities"
        :key="entity.id"
        :name="entity.name"
        :icon="entity.icon"
        :description="entity.description"
        :pageName="pageName"
        @edit="$emit('edit', entity)"
        @delete="$emit('delete', entity)"
      />
    </TransitionGroup>

    <div class="pagination-row">
      <div class="pagination-controls">
        <button
          :disabled="currentPage === 1"
          @click="currentPage--"
          class="pagination-button"
          :class="{ disabled: currentPage === 1 }"
        >
          &lt; Prev
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          @click="currentPage = typeof page === 'number' ? page : currentPage"
          class="pagination-button"
          :class="{
            active: page === currentPage,
            ellipsis: page === '...'
          }"
        >
          {{ page }}
        </button>

        <button
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          class="pagination-button"
          :class="{ disabled: currentPage === totalPages }"
        >
          Next &gt;
        </button>
      </div>

      <div class="page-info">
        <span>Show</span>
        <select v-model="perPage" class="per-page-select">
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
        <span>per page</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import ContentCard from './ContentCard.vue';

const props = defineProps({
  entities: {
    type: Array,
    required: true,
    default: () => []
  },
  pageName: {
    type: String,
    required: true
  },
  pageNamePlural: {
    type: String,
    required: true
  }
});

defineEmits(['edit', 'delete', 'item-add-complete']);

const searchQuery = ref('');
const currentPage = ref(1);
const perPage = ref(10);

const filteredEntities = computed(() => {
  if (!searchQuery.value) return props.entities;
  const query = searchQuery.value.toLowerCase();
  return props.entities.filter(
    (entity) =>
      entity.name.toLowerCase().includes(query) || entity.description.toLowerCase().includes(query)
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredEntities.value.length / perPage.value))
);

const paginatedEntities = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredEntities.value.slice(start, start + perPage.value);
});

// Reset to first page when search changes
watch(searchQuery, () => {
  currentPage.value = 1;
});

// Ensure current page is valid when perPage changes
watch(perPage, () => {
  const maxPage = Math.max(1, Math.ceil(filteredEntities.value.length / perPage.value));
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage;
  }
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const pages = [];

  if (total <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (current > 3) {
      pages.push('...');
    }

    // Show pages around current page
    const start = Math.max(2, current - 1);
    const end = Math.min(start + 2, total - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push('...');
    }

    // Always show last page
    pages.push(total);
  }

  return pages;
});
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_variables' as *;

.entity-list {
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
  transition: border-color 0.2s;

  &:focus {
    border-color: $primary;
    outline: none;
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  background: $primary;
  color: white;
  font-weight: bold;
  padding: 0.75rem 1rem;
  border-radius: 8px 8px 0 0;
  margin: 0 -1rem;
  width: calc(100% + 2rem);
}

.col-name {
  width: 15%;
  gap: $spacing-4;
  padding: $spacing-2 $spacing-4;
}

.col-description {
  flex: 1;
  gap: $spacing-4;
  padding: $spacing-2 $spacing-4;
}

.col-action {
  width: 10%;
  text-align: left;
  gap: $spacing-4;
  padding: $spacing-2 $spacing-4;
}

.entities-container {
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
  gap: 0.5rem;
}

.pagination-button {
  padding: 0.5rem 1rem;
  color: #374151;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(.disabled):not(.ellipsis) {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  &.active {
    background: $primary;
    color: white;
    border-color: $primary;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

.per-page-select {
  padding: 0.25rem 1.5rem 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;

  &:focus {
    outline: none;
    border-color: $primary;
  }
}

// List transition animations
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}
</style>
