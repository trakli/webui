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

    <div class="table-header" :class="{ 'expense-header': headerType === 'expense' }">
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
        :icon="entity.icon?.path || entity.icon?.content || entity.icon"
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
  },
  headerType: {
    type: String,
    default: 'default' // 'default', 'expense'
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

  @media (max-width: $breakpoint-md) {
    padding: 0.75rem;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 0.5rem;
  }
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  background: white;
  gap: 1rem;

  @media (max-width: $breakpoint-md) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: $text-primary;

    @media (max-width: $breakpoint-md) {
      font-size: 1.25rem;
    }

    @media (max-width: $breakpoint-sm) {
      font-size: 1.125rem;
    }
  }
}

.search-input {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 250px;
  transition: border-color 0.2s;

  @media (max-width: $breakpoint-md) {
    width: 100%;
  }

  &:focus {
    border-color: $primary;
    outline: none;
  }
}

.table-header {
  display: grid;
  grid-template-columns: 1.8fr 2.5fr auto;
  background: $primary;
  color: white;
  font-weight: bold;
  padding: 0.75rem 1rem;
  border-radius: 8px 8px 0 0;
  margin: 0 -1rem;
  width: calc(100% + 2rem);
  gap: 1rem;
  align-items: center;

  &.expense-header {
    background: #dc2626;
  }

  @media (max-width: $breakpoint-md) {
    grid-template-columns: 1.6fr 2.2fr auto;
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1.5fr 2fr auto;
    padding: 0.5rem;
    gap: 0.375rem;
    font-size: 0.8rem;
    line-height: 1.2;
  }
}

.col-name {
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;

  @media (max-width: $breakpoint-sm) {
    white-space: normal;
    word-wrap: break-word;
    hyphens: auto;
  }
}

.col-description {
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;

  @media (max-width: $breakpoint-sm) {
    white-space: normal;
    word-wrap: break-word;
    hyphens: auto;
  }
}

.col-action {
  padding: 0;
  text-align: right;
  white-space: nowrap;
  min-width: 80px;
  justify-self: end;

  @media (max-width: $breakpoint-md) {
    min-width: 70px;
  }

  @media (max-width: $breakpoint-sm) {
    min-width: 65px;
    font-size: 0.75rem;
  }
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
  gap: 1rem;

  @media (max-width: $breakpoint-md) {
    flex-direction: column-reverse;
    gap: 1rem;
    padding: 0.75rem;
  }

  @media (max-width: $breakpoint-sm) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: $breakpoint-md) {
    order: 2;
    width: 100%;
  }

  @media (max-width: $breakpoint-sm) {
    gap: 0.25rem;
    order: unset;
    width: auto;
    flex: 1;
    justify-content: center;
  }
}

.pagination-button {
  padding: 0.5rem 1rem;
  color: #374151;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  min-width: 44px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;

  @media (max-width: $breakpoint-sm) {
    padding: 0.125rem 0.25rem;
    font-size: 0.75rem;
    min-width: 28px;
    height: 28px;
    border-radius: 4px;
  }

  &:hover:not(.disabled):not(.ellipsis) {
    background: #f3f4f6;
    border-color: #9ca3af;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &.active {
    background: $primary;
    color: white;
    border-color: $primary;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
  }

  .expense-header ~ .entities-container ~ .pagination-row & {
    &.active {
      background: #dc2626;
      border-color: #dc2626;
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
    }
  }

  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: #f9fafb;
  }

  &.ellipsis {
    border: none;
    background: transparent;
    cursor: default;
    pointer-events: none;
    padding: 0 0.25rem;
    min-width: auto;
  }
}

.page-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  white-space: nowrap;

  @media (max-width: $breakpoint-md) {
    order: 1;
    justify-content: center;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: 0.75rem;
    gap: 0.25rem;
    order: unset;
    flex-shrink: 0;
  }
}

.per-page-select {
  padding: 0.375rem 1.75rem 0.375rem 0.75rem;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.2em 1.2em;
  min-width: 70px;
  height: 36px;
  transition: all 0.2s ease;

  @media (max-width: $breakpoint-sm) {
    font-size: 0.7rem;
    padding: 0.125rem 1.25rem 0.125rem 0.375rem;
    height: 28px;
    min-width: 45px;
    border-radius: 4px;
  }

  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
  }

  .expense-header ~ .entities-container ~ .pagination-row & {
    &:focus {
      border-color: #dc2626;
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }
  }

  &:hover {
    border-color: #9ca3af;
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
