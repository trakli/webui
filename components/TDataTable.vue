<template>
  <div class="table-scroll">
    <table
      class="data-table"
      :class="{
        'data-table--clickable': clickable,
        'data-table--expense': headerType === 'expense'
      }"
    >
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="column.align ? `text-${column.align}` : undefined"
            :style="column.width ? { width: column.width } : undefined"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="String(row[rowKey])"
          :class="rowClass?.(row)"
          @click="$emit('row-click', row)"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="column.align ? `text-${column.align}` : undefined"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="valueAt(row, column.key)">
              {{ column.format?.(valueAt(row, column.key), row) ?? valueAt(row, column.key) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
export interface DataTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  format?: (value: unknown, row: Record<string, any>) => unknown;
}

withDefaults(
  defineProps<{
    columns: DataTableColumn[];
    rows: Record<string, any>[];
    rowKey?: string;
    clickable?: boolean;
    headerType?: 'default' | 'expense';
    rowClass?: (row: Record<string, any>) => string | Record<string, boolean> | undefined;
  }>(),
  { rowKey: 'id', clickable: false, headerType: 'default', rowClass: undefined }
);

defineEmits<{
  'row-click': [row: Record<string, any>];
}>();

const valueAt = (row: Record<string, any>, key: string): unknown =>
  key.split('.').reduce<unknown>((value, part) => {
    if (value === null || typeof value !== 'object') return undefined;
    return (value as Record<string, unknown>)[part];
  }, row);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  min-width: 500px;
  border-collapse: collapse;
  font-size: $font-size-sm;

  thead tr {
    background: $primary-light;
  }

  th {
    padding: 8px 16px;
    border-bottom: 1px solid $border-light;
    color: $primary-dark;
    font-size: $font-size-xs;
    font-weight: $font-bold;
    text-align: left;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    white-space: nowrap;
  }

  td {
    padding: 8px 16px;
    border-bottom: 1px solid $border-light;
    color: $text-primary;
    vertical-align: middle;
  }

  tbody tr {
    background: $bg-white;
    transition: background-color $duration-fast $easing-standard;

    &:hover {
      background: rgba(var(--color-primary-rgb), 0.04);
    }

    &:last-child td {
      border-bottom: none;
    }

    &.is-default {
      background: rgba(var(--color-success-rgb), 0.08);
    }
  }

  .text-right {
    text-align: right;
  }

  .text-center {
    text-align: center;
  }
}

.data-table--clickable tbody tr {
  cursor: pointer;
}

.data-table--expense thead tr {
  background: rgba(var(--color-expense-rgb), 0.12);

  th {
    color: var(--color-expense);
  }
}
</style>
