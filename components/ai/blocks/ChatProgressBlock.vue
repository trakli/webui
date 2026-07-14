<template>
  <div class="chat-progress-block">
    <p v-if="title" class="block-title">{{ title }}</p>
    <div class="progress-list">
      <div v-for="(item, i) in items" :key="i" class="progress-row">
        <div class="progress-head">
          <span class="progress-label">{{ item.label }}</span>
          <span class="progress-figures">{{ figures(item) }}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :class="fillClass(item)" :style="{ width: pct(item) + '%' }" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface ProgressItem {
  label?: string;
  current?: number;
  target?: number;
  currency?: string | null;
}

const props = defineProps<{ title?: string; items?: ProgressItem[] }>();

const items = computed<ProgressItem[]>(() => props.items ?? []);

const ratio = (item: ProgressItem): number => {
  const target = Number(item.target ?? 0);
  if (!target) return 0;
  return Number(item.current ?? 0) / target;
};

const pct = (item: ProgressItem): number =>
  Math.max(0, Math.min(100, Math.round(ratio(item) * 100)));

const fillClass = (item: ProgressItem) => {
  const r = ratio(item);
  if (r >= 1) return 'is-over';
  if (r >= 0.8) return 'is-near';
  return 'is-ok';
};

const money = (value: number, currency?: string | null): string => {
  const num = value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return currency ? `${num} ${currency}` : num;
};

const figures = (item: ProgressItem): string =>
  `${money(Number(item.current ?? 0), item.currency)} / ${money(Number(item.target ?? 0), item.currency)}`;
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.block-title {
  font-weight: $font-semibold;
  margin-bottom: $spacing-2;
  font-size: $font-size-sm;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.progress-head {
  display: flex;
  justify-content: space-between;
  gap: $spacing-2;
  margin-bottom: 4px;
  font-size: $font-size-sm;
}

.progress-label {
  color: $text-secondary;
}

.progress-figures {
  font-weight: $font-semibold;
  white-space: nowrap;
}

.progress-track {
  height: 8px;
  border-radius: 9999px;
  background: $bg-gray;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;

  &.is-ok {
    background: $primary;
  }

  &.is-near {
    background: $warning;
  }

  &.is-over {
    background: $expense;
  }
}
</style>
