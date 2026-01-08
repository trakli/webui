<template>
  <ComponentLoader
    :is-loading="isLoading"
    :error="error"
    :has-data="entities.length > 0"
    :show-empty="false"
    skeleton-variant="table"
    :skeleton-count="8"
    :skeleton-columns="columns.length + 1"
  >
    <div class="content-list-view">
      <div class="section-header">
        <div class="header-left">
          <h1 class="section-title">{{ t('All {items}', { items: t(pageNamePlural) }) }}</h1>
        </div>
        <div class="header-right">
          <SearchInput
            v-model="searchQuery"
            :placeholder="t('Search {items}...', { items: t(pageNamePlural).toLowerCase() })"
          />
          <ViewToggle v-model="currentView" />
        </div>
      </div>

      <ContentTable
        v-if="currentView === 'table'"
        :entities="entities"
        :columns="columns"
        :page-name="pageName"
        :page-name-plural="pageNamePlural"
        :header-type="headerType"
        :default-item-id="defaultItemId"
        :is-loading="false"
        :error="null"
        :hide-header="true"
        :search-query="searchQuery"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />

      <div v-else class="cards-view">
        <div class="cards-grid" :class="cardLayoutClass">
          <slot
            v-for="entity in paginatedEntities"
            :key="entity.id"
            name="card"
            :entity="entity"
            :is-default="String(entity.id) === defaultItemId"
          >
            <ContentCardGrid
              :entities="[entity]"
              :card-fields="cardFields"
              :default-item-id="defaultItemId"
              @edit="$emit('edit', $event)"
              @delete="$emit('delete', $event)"
            />
          </slot>
        </div>

        <div v-if="totalPages > 1" class="pagination-row">
          <div class="pagination-controls">
            <button
              :disabled="currentPage === 1"
              class="pagination-button"
              :class="{ disabled: currentPage === 1 }"
              @click="currentPage--"
            >
              &lt; {{ t('Prev') }}
            </button>

            <button
              v-for="page in visiblePages"
              :key="page"
              class="pagination-button"
              :class="{
                active: page === currentPage,
                ellipsis: page === '...'
              }"
              @click="currentPage = typeof page === 'number' ? page : currentPage"
            >
              {{ page }}
            </button>

            <button
              :disabled="currentPage === totalPages"
              class="pagination-button"
              :class="{ disabled: currentPage === totalPages }"
              @click="currentPage++"
            >
              {{ t('Next') }} &gt;
            </button>
          </div>

          <div class="page-info">
            <span>{{ t('Show') }}</span>
            <select v-model="perPage" class="per-page-select">
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
            </select>
            <span>{{ t('per page') }}</span>
          </div>
        </div>
      </div>
    </div>
  </ComponentLoader>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import ComponentLoader from './ComponentLoader.vue';
import SearchInput from './SearchInput.vue';
import ViewToggle from './ViewToggle.vue';
import ContentTable from './ContentTable.vue';
import ContentCardGrid from './ContentCardGrid.vue';

const { t } = useI18n();

const props = defineProps({
  entities: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    required: true
  },
  cardFields: {
    type: Array,
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
    default: 'default'
  },
  defaultItemId: {
    type: String,
    default: null
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  initialView: {
    type: String,
    default: 'cards',
    validator: (value) => ['table', 'cards'].includes(value)
  },
  cardLayout: {
    type: String,
    default: 'grid',
    validator: (value) => ['horizontal', 'grid'].includes(value)
  },
  gridColumns: {
    type: [Number, String],
    default: 'auto'
  }
});

defineEmits(['edit', 'delete']);

const cardLayoutClass = computed(() => {
  const classes = [`layout-${props.cardLayout}`];
  if (props.cardLayout === 'grid' && props.gridColumns !== 'auto') {
    classes.push(`columns-${props.gridColumns}`);
  }
  return classes;
});

const currentView = ref(props.initialView);
const searchQuery = ref('');
const currentPage = ref(1);
const perPage = ref(12);

const filteredEntities = computed(() => {
  if (!searchQuery.value) return props.entities;
  const query = searchQuery.value.toLowerCase();
  return props.entities.filter(
    (entity) =>
      entity.name?.toLowerCase().includes(query) ||
      entity.description?.toLowerCase().includes(query)
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredEntities.value.length / perPage.value))
);

const paginatedEntities = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredEntities.value.slice(start, start + perPage.value);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

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
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (current > 3) {
      pages.push('...');
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(start + 2, total - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push('...');
    }

    pages.push(total);
  }

  return pages;
});
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_variables' as *;

.content-list-view {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: $breakpoint-md) {
    flex-direction: column;
    align-items: stretch;
  }
}

.header-left {
  flex-shrink: 0;
}

.section-title {
  margin: 0;
  font-size: $font-size-base;
  font-weight: $font-medium;
  color: $text-primary;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: $breakpoint-sm) {
    flex-direction: column;
    align-items: stretch;

    :deep(.view-toggle) {
      align-self: flex-end;
    }
  }
}

.cards-view {
  width: 100%;
}

.cards-grid {
  width: 100%;

  &.layout-horizontal {
    display: flex;
    flex-direction: column;
    gap: $spacing-3;
  }

  &.layout-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: $spacing-4;

    @media (max-width: $breakpoint-md) {
      gap: $spacing-3;
    }

    @media (max-width: $breakpoint-sm) {
      grid-template-columns: 1fr;
      gap: $spacing-2;
    }

    &.columns-4 {
      grid-template-columns: repeat(4, 1fr);

      @media (max-width: $breakpoint-lg) {
        grid-template-columns: repeat(3, 1fr);
      }

      @media (max-width: $breakpoint-md) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: $breakpoint-sm) {
        grid-template-columns: 1fr;
      }
    }
  }
}

.pagination-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: $bg-gray;
  border-radius: $radius-xl;
  margin-top: 1rem;
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

  @media (max-width: $breakpoint-sm) {
    gap: 0.25rem;
    flex: 1;
  }
}

.pagination-button {
  padding: 0.5rem 1rem;
  color: #374151;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: $radius-lg;
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
    border-radius: $radius-md;
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

  @media (max-width: $breakpoint-sm) {
    font-size: 0.75rem;
    gap: 0.25rem;
    flex-shrink: 0;
  }
}

.per-page-select {
  padding: 0.375rem 1.75rem 0.375rem 0.75rem;
  border: 1.5px solid #d1d5db;
  border-radius: $radius-lg;
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
    border-radius: $radius-md;
  }

  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
  }

  &:hover {
    border-color: #9ca3af;
  }
}
</style>
