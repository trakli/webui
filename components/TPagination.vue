<template>
  <div class="pagination">
    <div class="pagination__controls">
      <button
        class="pagination__button"
        :disabled="currentPage <= 1 || disabled"
        :aria-label="t('Previous page')"
        @click="$emit('page-change', currentPage - 1)"
      >
        <ChevronLeft :size="16" />
      </button>
      <button
        v-for="page in visiblePages"
        :key="page"
        class="pagination__button"
        :class="{ 'pagination__button--active': page === currentPage }"
        :disabled="page === '...' || disabled"
        @click="typeof page === 'number' && $emit('page-change', page)"
      >
        {{ page }}
      </button>
      <button
        class="pagination__button"
        :disabled="currentPage >= totalPages || disabled"
        :aria-label="t('Next page')"
        @click="$emit('page-change', currentPage + 1)"
      >
        <ChevronRight :size="16" />
      </button>
    </div>
    <slot name="info" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    currentPage: number;
    totalPages: number;
    disabled?: boolean;
  }>(),
  { disabled: false }
);

defineEmits<{ 'page-change': [page: number] }>();

const { t } = useI18n();

const visiblePages = computed<(number | string)[]>(() => {
  if (props.totalPages <= 7) {
    return Array.from({ length: props.totalPages }, (_, index) => index + 1);
  }

  const pages: (number | string)[] = [1];
  if (props.currentPage > 3) pages.push('...');
  const start = Math.max(2, Math.min(props.currentPage - 1, props.totalPages - 3));
  const end = Math.min(props.totalPages - 1, start + 2);
  for (let page = start; page <= end; page++) pages.push(page);
  if (props.currentPage < props.totalPages - 2) pages.push('...');
  pages.push(props.totalPages);
  return pages;
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-3;
  padding: $spacing-3 $spacing-4;
  border-top: 1px solid $border-light;
  color: $text-muted;
  font-size: $font-size-sm;

  @media (max-width: $breakpoint-sm) {
    flex-wrap: wrap;
    justify-content: center;
  }
}

.pagination__controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 $spacing-2;
  border: none;
  border-radius: $radius-md;
  background: transparent;
  color: $text-secondary;
  font-weight: $font-semibold;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: $bg-light;
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }

  &--active {
    background: $primary-light;
    color: $primary;
  }
}
</style>
