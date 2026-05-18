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
        <div class="table-scroll">
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
              class="pagination-button pagination-button--nav"
              :class="{ disabled: currentPage === 1 }"
              :aria-label="t('Previous page')"
              @click="currentPage--"
            >
              <ChevronLeft :size="16" />
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
              class="pagination-button pagination-button--nav"
              :class="{ disabled: currentPage === totalPages }"
              :aria-label="t('Next page')"
              @click="currentPage++"
            >
              <ChevronRight :size="16" />
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
    </div>
  </ComponentLoader>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import {
  Edit as LucideEdit,
  Trash as LucideTrash,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next';
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
  box-sizing: border-box;
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
  width: 100%;
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: 12px;
  box-shadow: $elevation-1;
  overflow: hidden;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.content-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;

  thead {
    tr {
      background: $primary-light;
    }

    th {
      color: $primary-dark;
      font-weight: $font-bold;
      text-align: left;
      padding: 8px 16px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      white-space: nowrap;
      border-bottom: 1px solid $border-light;

      &:first-child {
        padding-left: 20px;
      }

      &.text-right {
        text-align: right;
      }

      &.text-center {
        text-align: center;
      }
    }
  }

  &.expense-table thead tr {
    background: rgba(var(--color-expense-rgb), 0.12);

    th {
      color: var(--color-expense);
    }
  }

  tbody {
    background: $bg-white;

    .entity-row {
      background: $bg-white;
      transition: background-color $duration-fast $easing-standard;

      &:hover {
        background: rgba(var(--color-primary-rgb), 0.04);
      }

      &.is-default {
        background: rgba(var(--color-success-rgb), 0.08);

        &:hover {
          background: rgba(var(--color-success-rgb), 0.12);
        }
      }

      &:last-child td {
        border-bottom: none;
      }

      td {
        padding: 6px 16px;
        border-bottom: 1px solid $border-light;
        font-size: $font-size-sm;
        vertical-align: middle;
        line-height: 1.4;

        &:first-child {
          padding-left: 20px;
        }

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
  width: 96px;
}

.content-table th.col-action,
.content-table td.col-action {
  padding-right: 20px;
}

.entity-actions {
  display: inline-flex;
  gap: 4px;
  justify-content: flex-end;
  align-items: center;
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
  padding: $spacing-3 $spacing-4;
  background-color: $bg-white;
  border-top: 1px solid $border-light;
  gap: $spacing-3;

  @media (max-width: $breakpoint-md) {
    flex-direction: column-reverse;
    gap: $spacing-2;
    padding: $spacing-3;
  }

  @media (max-width: $breakpoint-sm) {
    flex-direction: row;
    justify-content: space-between;
    padding: $spacing-2;
    gap: $spacing-2;
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
  padding: 0 $spacing-3;
  color: $text-secondary;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background-color $duration-fast $easing-standard,
    color $duration-fast $easing-standard;
  font-size: $font-size-sm;
  min-width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: $font-semibold;
  font-variant-numeric: tabular-nums;

  @media (max-width: $breakpoint-sm) {
    min-width: 28px;
    height: 28px;
    font-size: $font-size-xs;
  }

  &:hover:not(.disabled):not(.ellipsis):not(.active) {
    background: $bg-light;
    color: $text-primary;
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: 2px;
  }

  &.active {
    background: $primary-light;
    color: $primary;
  }

  &--nav {
    color: $text-muted;
  }

  &.disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &.ellipsis {
    background: transparent;
    cursor: default;
    pointer-events: none;
    color: $text-muted;
    padding: 0 4px;
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
  border: 1px solid $border-medium;
  border-radius: 8px;
  background: $bg-white;
  color: $text-secondary;
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.2em 1.2em;
  min-width: 70px;
  height: 32px;
  transition:
    border-color $duration-fast $easing-standard,
    box-shadow $duration-fast $easing-standard;

  &:hover {
    border-color: $text-muted;
  }

  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.18);
  }

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
