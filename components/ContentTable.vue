<template>
  <ComponentLoader
    :is-loading="isLoading"
    :error="error"
    :has-data="entities.length > 0"
    :show-empty="false"
    skeleton-variant="table"
    :skeleton-count="8"
    :skeleton-columns="computedColumns.length + 1"
  >
    <div class="entity-list">
      <div v-if="!hideHeader" class="header-row">
        <h1>{{ t('All {items}', { items: t(pageNamePlural) }) }}</h1>
        <SearchInput
          v-model="internalSearchQuery"
          :placeholder="t('Search {items}...', { items: t(pageNamePlural).toLowerCase() })"
        />
      </div>

      <div class="table-wrapper">
        <table class="content-table" :class="{ 'expense-table': headerType === 'expense' }">
          <thead>
            <tr>
              <th
                v-for="col in computedColumns"
                :key="col.key"
                :style="col.width ? { width: col.width } : {}"
                :class="[`col-${col.key}`, col.align ? `text-${col.align}` : '']"
              >
                {{ t(col.label) }}
              </th>
              <th class="col-action">{{ t('Action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="entity in paginatedEntities"
              :key="entity.id"
              class="entity-row"
              :class="{ 'is-default': String(entity.id) === defaultItemId }"
            >
              <td
                v-for="col in computedColumns"
                :key="col.key"
                :class="[`col-${col.key}`, col.align ? `text-${col.align}` : '']"
              >
                <template v-if="col.key === 'name'">
                  <div class="name-cell">
                    <component :is="getIcon(entity)" v-if="getIcon(entity)" class="entity-icon" />
                    <span class="name-text">{{ entity.name }}</span>
                    <span v-if="String(entity.id) === defaultItemId" class="default-badge">
                      {{ t('Default') }}
                    </span>
                  </div>
                </template>
                <template v-else-if="col.render">
                  {{ col.render(entity[col.key], entity) }}
                </template>
                <template v-else>
                  {{ getCellValue(entity, col.key) }}
                </template>
              </td>
              <td class="col-action">
                <div class="entity-actions">
                  <button
                    class="action-button edit"
                    :title="t('Edit {item}', { item: t(pageName) })"
                    @click="$emit('edit', entity)"
                  >
                    <LucideEdit />
                  </button>
                  <button
                    class="action-button delete"
                    :title="t('Delete {item}', { item: t(pageName) })"
                    @click="$emit('delete', entity)"
                  >
                    <LucideTrash />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-row">
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
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span>{{ t('per page') }}</span>
        </div>
      </div>
    </div>
  </ComponentLoader>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Edit as LucideEdit, Trash as LucideTrash } from 'lucide-vue-next';
import * as LucideIcons from 'lucide-vue-next';
import ComponentLoader from './ComponentLoader.vue';
import SearchInput from './SearchInput.vue';

const { t } = useI18n();

const props = defineProps({
  entities: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
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
  hideHeader: {
    type: Boolean,
    default: false
  },
  searchQuery: {
    type: String,
    default: ''
  }
});

defineEmits(['edit', 'delete', 'item-add-complete']);

const defaultColumns = computed(() => [
  { key: 'name', label: `${props.pageName} Name` },
  { key: 'description', label: `${props.pageName} Description` }
]);

const computedColumns = computed(() => props.columns || defaultColumns.value);

const getIcon = (entity) => {
  const iconValue = entity.icon?.path || entity.icon?.content || entity.icon;
  if (!iconValue) return null;
  return LucideIcons[iconValue] || LucideIcons.Box;
};

const getCellValue = (entity, key) => {
  if (key.includes('.')) {
    return key.split('.').reduce((obj, k) => obj?.[k], entity) ?? '';
  }
  return entity[key] ?? '';
};

const internalSearchQuery = ref('');
const currentPage = ref(1);
const perPage = ref(10);

const effectiveSearchQuery = computed(() =>
  props.hideHeader ? props.searchQuery : internalSearchQuery.value
);

const filteredEntities = computed(() => {
  if (!effectiveSearchQuery.value) return props.entities;
  const query = effectiveSearchQuery.value.toLowerCase();
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

// Reset to first page when search changes
watch(effectiveSearchQuery, () => {
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
  border-radius: $radius-xl;

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
  background: $bg-white;
  gap: 1rem;

  @media (max-width: $breakpoint-md) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  h1 {
    margin: 0;
    font-size: $font-size-base;
    font-weight: $font-medium;
    color: $text-primary;

    @media (max-width: $breakpoint-md) {
      font-size: $font-size-sm;
    }

    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-sm;
    }
  }
}

.table-wrapper {
  margin: 0 -1rem;
  width: calc(100% + 2rem);
  overflow-x: auto;
  border-radius: $radius-xl $radius-xl 0 0;
}

.content-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;

  thead {
    tr {
      background: $primary;
    }

    th {
      color: white;
      font-weight: $font-semibold;
      text-align: left;
      padding: 0.75rem 1rem;
      font-size: $font-size-sm;
      white-space: nowrap;

      &.text-right {
        text-align: right;
      }

      &.text-center {
        text-align: center;
      }
    }
  }

  &.expense-table thead tr {
    background: $error-color;
  }

  tbody {
    background: $bg-gray;

    .entity-row {
      background: $bg-light;
      transition: all 0.2s ease;

      &:hover {
        background: $bg-white;
        transform: translateY(-1px);
        box-shadow: $shadow-sm;
      }

      &.is-default {
        background: rgba(var(--color-success-rgb), 0.08);
        border-left: 4px solid $success;

        &:hover {
          background: rgba(var(--color-success-rgb), 0.12);
        }
      }

      td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid $border-light;
        font-size: $font-size-sm;
        vertical-align: middle;

        &.text-right {
          text-align: right;
        }

        &.text-center {
          text-align: center;
        }
      }
    }
  }
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.entity-icon {
  width: 20px;
  height: 20px;
  color: $primary;
  flex-shrink: 0;
}

.name-text {
  font-weight: $font-medium;
  color: $text-primary;
}

.default-badge {
  display: inline-flex;
  align-items: center;
  background: $primary;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.col-action {
  text-align: right;
  white-space: nowrap;
  min-width: 80px;
}

.entity-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 6px;
  border-radius: $radius-sm;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 28px;
  height: 28px;

  svg {
    width: 16px;
    height: 16px;
    color: $primary;
    transition: color 0.2s ease;
  }

  &:hover {
    background-color: rgba(var(--color-primary-rgb), 0.1);

    svg {
      color: $primary-dark;
    }
  }

  &.delete {
    svg {
      color: $error-color;
    }

    &:hover svg {
      color: $error-dark;
    }
  }
}

.pagination-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: $bg-gray;
  border-radius: 0 0 $radius-xl $radius-xl;
  border-top: 1px solid $border-color;
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
  color: $text-secondary;
  background: $bg-white;
  border: 1px solid $border-light;
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
    background: $bg-light;
    border-color: $border-medium;
    transform: translateY(-1px);
    box-shadow: $shadow-sm;
  }

  &.active {
    background: $primary;
    color: white;
    border-color: $primary;
    box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
  }

  .expense-header ~ .entities-container ~ .pagination-row & {
    &.active {
      background: $primary;
      border-color: $primary;
      box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
    }
  }

  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: $bg-light;
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
  color: $text-muted;
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
  border: 1.5px solid $border-light;
  border-radius: $radius-lg;
  background: $bg-white;
  color: $text-secondary;
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
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
  }

  .expense-header ~ .entities-container ~ .pagination-row & {
    &:focus {
      border-color: $primary;
      box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
    }
  }

  &:hover {
    border-color: $border-medium;
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
