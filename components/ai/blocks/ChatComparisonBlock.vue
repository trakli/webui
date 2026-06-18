<template>
  <div class="chat-comparison-block">
    <p v-if="title" class="block-title">{{ title }}</p>
    <div class="comparison-grid" :style="{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }">
      <div v-for="(side, i) in columns" :key="i" class="comparison-col">
        <p class="comparison-col-title">{{ side.heading }}</p>
        <dl class="comparison-rows">
          <div v-for="(row, j) in side.rows" :key="j" class="comparison-row">
            <dt>{{ row.label }}</dt>
            <dd>{{ row.value }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type Side = Record<string, unknown>;

const props = defineProps<{ title?: string; series?: Side[] }>();

const HEADING_KEYS = ['heading', 'label', 'title', 'name', 'period'];

const format = (value: unknown): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number')
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const prettify = (key: string): string =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const columns = computed(() =>
  (props.series ?? []).map((side, idx) => {
    const headingKey = HEADING_KEYS.find((k) => typeof side[k] === 'string');
    const heading = headingKey ? String(side[headingKey]) : `Series ${idx + 1}`;
    const rows = Object.entries(side)
      .filter(([k]) => k !== headingKey)
      .map(([k, v]) => ({ label: prettify(k), value: format(v) }));
    return { heading, rows };
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

.comparison-grid {
  display: grid;
  gap: $spacing-2;
}

.comparison-col {
  border: 1px solid $primary-muted;
  border-radius: $radius-lg;
  padding: $spacing-3;
  background: $bg-white;
}

.comparison-col-title {
  margin: 0 0 $spacing-2;
  font-weight: $font-semibold;
  font-size: $font-size-sm;
  color: $primary;
}

.comparison-rows {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
}

.comparison-row {
  display: flex;
  justify-content: space-between;
  gap: $spacing-2;
  font-size: $font-size-sm;

  dt {
    color: $text-muted;
  }

  dd {
    margin: 0;
    font-weight: $font-semibold;
    text-align: right;
  }
}
</style>
