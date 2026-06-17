<template>
  <div class="chat-kpi-block">
    <p v-if="title" class="block-title">{{ title }}</p>
    <div class="kpi-grid">
      <div v-for="(item, i) in items" :key="i" class="kpi-card">
        <span class="kpi-label">{{ item.label }}</span>
        <span class="kpi-value">{{ formatValue(item) }}</span>
        <span
          v-if="typeof item.delta_percent === 'number'"
          class="kpi-delta"
          :class="trendClass(item)"
        >
          <component :is="trendIcon(item)" :size="14" />
          {{ Math.abs(item.delta_percent).toFixed(1) }}%
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next';

interface KpiItem {
  label: string;
  value: number | string;
  currency?: string | null;
  unit?: string | null;
  delta_percent?: number | null;
  trend?: string | null;
}

const props = defineProps<{ title?: string; items?: KpiItem[] }>();

const items = computed(() => props.items ?? []);

const formatValue = (item: KpiItem): string => {
  const v = item.value;
  const num =
    typeof v === 'number' ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(v);
  if (item.unit) return `${num}${item.unit}`;
  if (item.currency) return `${num} ${item.currency}`;
  return num;
};

const direction = (item: KpiItem): number => {
  if (item.trend === 'up') return 1;
  if (item.trend === 'down') return -1;
  return Math.sign(item.delta_percent ?? 0);
};

const trendClass = (item: KpiItem) => {
  const d = direction(item);
  return d > 0 ? 'is-up' : d < 0 ? 'is-down' : 'is-flat';
};

const trendIcon = (item: KpiItem) => {
  const d = direction(item);
  return d > 0 ? TrendingUp : d < 0 ? TrendingDown : Minus;
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.block-title {
  font-weight: $font-semibold;
  margin-bottom: $spacing-2;
  font-size: $font-size-sm;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: $spacing-2;
}

.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: $spacing-3;
  border: 1px solid $primary-muted;
  border-radius: $radius-lg;
  background: $bg-white;

  .kpi-label {
    font-size: $font-size-xs;
    color: $text-muted;
  }

  .kpi-value {
    font-size: $font-size-lg;
    font-weight: $font-bold;
    color: $text-primary;
  }

  .kpi-delta {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: $font-size-xs;
    font-weight: $font-semibold;

    &.is-up {
      color: $income;
    }

    &.is-down {
      color: $expense;
    }

    &.is-flat {
      color: $text-muted;
    }
  }
}
</style>
