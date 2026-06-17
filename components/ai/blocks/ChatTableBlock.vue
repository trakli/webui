<template>
  <div class="chat-table-block">
    <p v-if="title" class="block-title">{{ title }}</p>

    <!-- One row reads better as a record card than a table. -->
    <div v-if="rows.length === 1" class="record-card">
      <div v-for="col in columns" :key="col" class="record-row">
        <span class="record-key">{{ formatKey(col) }}</span>
        <span class="record-value">{{ formatValue(rows[0][col]) }}</span>
      </div>
    </div>

    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th v-for="col in columns" :key="col">{{ formatKey(col) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rows" :key="i">
            <td v-for="col in columns" :key="col">{{ formatValue(row[col]) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title?: string;
  columns?: string[];
  rows?: Record<string, unknown>[];
}>();

const rows = computed(() => props.rows ?? []);
const columns = computed(() => {
  if (props.columns?.length) return props.columns;
  return rows.value[0] ? Object.keys(rows.value[0]) : [];
});

const formatKey = (key: string): string =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? value.toString()
      : value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return String(value);
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.block-title {
  font-weight: $font-semibold;
  margin-bottom: $spacing-2;
  font-size: $font-size-sm;
}

.record-card {
  border: 1px solid $primary-muted;
  border-radius: $radius-lg;
  overflow: hidden;

  .record-row {
    display: flex;
    justify-content: space-between;
    gap: $spacing-2;
    padding: $spacing-2;
    border-bottom: 1px solid $primary-muted;

    &:last-child {
      border-bottom: none;
    }

    .record-key {
      color: $text-muted;
    }

    .record-value {
      font-weight: $font-semibold;
    }
  }
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: $font-size-sm;

  th,
  td {
    padding: $spacing-1 $spacing-2;
    text-align: left;
    border-bottom: 1px solid $primary-muted;
  }

  th {
    font-weight: $font-semibold;
    background: $primary-light;
  }

  tr:last-child td {
    border-bottom: none;
  }
}
</style>
