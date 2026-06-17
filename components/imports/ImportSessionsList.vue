<template>
  <div class="sessions-list">
    <h3 class="sessions-list__title">{{ t('Recent imports') }}</h3>
    <ul class="sessions-list__items">
      <li
        v-for="session in sessions"
        :key="session.id"
        class="session-row"
        role="button"
        tabindex="0"
        @click="$emit('open', session.id)"
        @keydown.enter="$emit('open', session.id)"
        @keydown.space.prevent="$emit('open', session.id)"
      >
        <FileText :size="18" class="session-row__icon" />
        <div class="session-row__main">
          <span class="session-row__name">{{ session.file_name }}</span>
          <span class="session-row__meta">
            {{ formatDate(session.created_at) }}
            <template v-if="suggestionCount(session) !== null">
              &middot; {{ suggestionCount(session) }} {{ t('suggestions') }}
            </template>
            <template v-if="duplicateCount(session) > 0">
              &middot; {{ duplicateCount(session) }} {{ t('duplicates') }}
            </template>
          </span>
        </div>
        <span class="session-row__badge" :class="`is-${badge(session.status).tone}`">
          <Loader2 v-if="badge(session.status).spin" :size="13" class="spin" />
          {{ badge(session.status).label }}
        </span>
        <button
          type="button"
          class="session-delete"
          :title="t('Delete import')"
          :aria-label="t('Delete import')"
          @click.stop="$emit('delete', session.id)"
        >
          <Trash2 :size="16" />
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { FileText, Loader2, Trash2 } from 'lucide-vue-next';
import type { ImportSession } from '~/types/import';

defineProps<{ sessions: ImportSession[] }>();
defineEmits<{ (e: 'open' | 'delete', id: number): void }>();

const { t } = useI18n();

const IN_PROGRESS = ['analyzing', 'extracting', 'enriching', 'checking'];

const badge = (status: ImportSession['status']) => {
  if (status === 'ready') return { label: t('Needs review'), tone: 'review', spin: false };
  if (IN_PROGRESS.includes(status)) return { label: t('Analyzing'), tone: 'progress', spin: true };
  if (status === 'confirmed') return { label: t('Imported'), tone: 'done', spin: false };
  if (status === 'failed') return { label: t('Failed'), tone: 'failed', spin: false };
  return { label: t('Expired'), tone: 'muted', spin: false };
};

const suggestionCount = (session: ImportSession): number | null => {
  const total = session.metadata?.total_suggestions;
  if (typeof total === 'number') return total;
  return Array.isArray(session.suggestions) ? session.suggestions.length : null;
};

const duplicateCount = (session: ImportSession): number => {
  const found = session.metadata?.duplicates_found;
  return typeof found === 'number' ? found : 0;
};

const formatDate = (value: string): string => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.sessions-list {
  margin-top: $spacing-5;

  &__title {
    font-size: $font-size-sm;
    font-weight: $font-semibold;
    color: $text-secondary;
    margin: 0 0 $spacing-3;
  }

  &__items {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: $spacing-2;
  }
}

.session-row {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-3;
  border: 1px solid $border-light;
  border-radius: $radius-lg;
  background: $bg-white;
  cursor: pointer;
  text-align: left;
  transition: $transition-base;

  &:hover {
    border-color: $primary;
    background: $primary-light;
  }

  &:hover .session-delete,
  &:focus-within .session-delete {
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: 2px;
  }

  &__icon {
    color: $primary;
    flex-shrink: 0;
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  &__name {
    font-weight: $font-semibold;
    font-size: $font-size-sm;
    color: $text-primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__meta {
    font-size: $font-size-xs;
    color: $text-muted;
  }

  &__badge {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: $spacing-1;
    padding: 2px 10px;
    border-radius: 9999px;
    font-size: $font-size-xs;
    font-weight: $font-semibold;

    &.is-review {
      background: $primary-light;
      color: $primary;
    }

    &.is-progress {
      background: $bg-gray;
      color: $text-secondary;
    }

    &.is-done {
      background: rgba(var(--color-success-rgb), 0.12);
      color: $success;
    }

    &.is-failed {
      background: rgba(var(--color-error-rgb), 0.1);
      color: $error-color;
    }

    &.is-muted {
      background: $bg-gray;
      color: $text-muted;
    }

    .spin {
      animation: spin 1s linear infinite;
    }
  }
}

.session-delete {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: $text-muted;
  cursor: pointer;
  opacity: 0;
  transition: $transition-base;

  &:hover {
    color: $error-color;
    background: rgba(var(--color-error-rgb), 0.08);
  }

  @media (hover: none) {
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
