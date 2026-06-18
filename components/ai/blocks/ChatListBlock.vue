<template>
  <div class="chat-list-block">
    <p v-if="title" class="block-title">{{ title }}</p>
    <ul class="list">
      <li v-for="(row, i) in rows" :key="i" class="list-item">
        <div class="list-main">
          <span class="list-title">{{ row.primary }}</span>
          <span v-if="row.secondary" class="list-secondary">{{ row.secondary }}</span>
        </div>
        <span v-if="row.trailing" class="list-trailing">{{ row.trailing }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type Item = Record<string, unknown>;

const props = defineProps<{ title?: string; items?: Item[]; variant?: string }>();

const PRIMARY_KEYS = ['title', 'label', 'name', 'description'];
const SECONDARY_KEYS = ['date', 'datetime', 'subtitle', 'category', 'wallet', 'type'];
const TRAILING_KEYS = ['amount', 'value', 'total', 'count'];

const format = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number')
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return String(value);
};

const pick = (item: Item, keys: string[]): { key?: string; value: string } => {
  for (const k of keys) {
    if (item[k] !== undefined && item[k] !== null && item[k] !== '') {
      return { key: k, value: format(item[k]) };
    }
  }
  return { value: '' };
};

const rows = computed(() =>
  (props.items ?? []).map((item) => {
    if (typeof item !== 'object' || item === null) {
      return { primary: format(item), secondary: '', trailing: '' };
    }
    const primary = pick(item, PRIMARY_KEYS);
    const trailing = pick(item, TRAILING_KEYS);
    const secondary = pick(item, SECONDARY_KEYS);
    const currency = typeof item.currency === 'string' ? ` ${item.currency}` : '';
    return {
      primary: primary.value || '-',
      secondary: secondary.value,
      trailing: trailing.value ? `${trailing.value}${currency}` : ''
    };
  })
);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.block-title {
  font-weight: $font-semibold;
  margin-bottom: $spacing-2;
  font-size: $font-size-sm;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid $primary-muted;
  border-radius: $radius-md;
  overflow: hidden;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-3;
  padding: $spacing-2 $spacing-3;
  border-bottom: 1px solid $primary-muted;

  &:last-child {
    border-bottom: none;
  }
}

.list-main {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.list-title {
  font-size: $font-size-sm;
  font-weight: $font-medium;
}

.list-secondary {
  font-size: $font-size-xs;
  color: $text-muted;
}

.list-trailing {
  font-weight: $font-bold;
  font-size: $font-size-sm;
  white-space: nowrap;
}
</style>
