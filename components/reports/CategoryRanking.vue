<template>
  <section class="card">
    <header class="card-head">
      <div>
        <h2 class="card-title">{{ title }}</h2>
        <p v-if="subtitle" class="card-sub">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="card-actions">
        <slot name="actions" />
      </div>
    </header>

    <div v-if="!buckets.length" class="empty">
      <Inbox :size="32" />
      <p>{{ t('No spending in this period') }}</p>
    </div>

    <ol v-else class="rank-list">
      <li
        v-for="(b, i) in buckets"
        :key="b.name"
        class="row"
        :class="{ 'row--top': i === 0 }"
        @click="$emit('drill', b)"
      >
        <span class="rank-no">{{ i + 1 }}</span>
        <span class="swatch" :style="{ background: b.color }" />
        <div class="row-main">
          <div class="row-head">
            <span class="row-name">{{ b.name }}</span>
            <span class="row-amount">{{ formatter(b.amount, currency) }}</span>
          </div>
          <div class="row-bar">
            <span
              class="row-fill"
              :style="{
                width: `${Math.min(100, (b.amount / max) * 100)}%`,
                background: b.color
              }"
            />
          </div>
          <div class="row-meta">
            <span class="meta-chip">{{ b.percentage.toFixed(1) }}%</span>
            <span class="meta-chip meta-chip--ghost">{{ t('{n} tx', { n: b.count }) }}</span>
            <span
              v-if="showDelta && b.prevAmount > 0"
              class="meta-delta"
              :class="b.delta < 0 ? 'is-good' : b.delta > 0 ? 'is-bad' : 'is-flat'"
            >
              <component
                :is="b.delta > 0 ? ArrowUpRight : b.delta < 0 ? ArrowDownRight : Minus"
                :size="12"
              />
              <span>{{ b.delta > 0 ? '+' : '' }}{{ b.delta }}%</span>
            </span>
          </div>
        </div>
        <div class="row-spark">
          <SparkLine :values="b.trend" :color="b.color" :height="32" />
        </div>
        <ChevronRight class="row-chevron" :size="16" />
      </li>
    </ol>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { ArrowUpRight, ArrowDownRight, Minus, ChevronRight, Inbox } from 'lucide-vue-next';
import SparkLine from './SparkLine.vue';

const { t } = useI18n();

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  buckets: { type: Array, required: true },
  showDelta: { type: Boolean, default: true },
  currency: { type: String, default: 'USD' },
  formatter: { type: Function, default: (n) => `${Math.round(n)}` }
});

defineEmits(['drill']);

const max = computed(() => Math.max(1, ...props.buckets.map((b) => b.amount)));
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.card {
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: 14px;
  box-shadow: $elevation-1;
  padding: $spacing-4;
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: $spacing-3;
  flex-wrap: wrap;
}

.card-title {
  font-size: $font-size-lg;
  font-weight: $font-semibold;
  color: $text-primary;
  margin: 0;
}

.card-sub {
  font-size: $font-size-xs;
  color: $text-muted;
  margin: 2px 0 0;
}

.seg {
  display: inline-flex;
  background: $bg-light;
  border-radius: 999px;
  padding: 3px;
  border: 1px solid $border-color;
}

.seg-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: $text-muted;
  font-size: $font-size-xs;
  font-weight: $font-medium;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    color: $text-primary;
  }

  &--active {
    background: $bg-white;
    color: $primary;
    box-shadow: $elevation-1;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-8 $spacing-4;
  color: $text-muted;

  p {
    margin: 0;
    font-size: $font-size-sm;
  }
}

.rank-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.row {
  display: grid;
  grid-template-columns: 24px 12px 1fr 90px 16px;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-3;
  border-radius: 12px;
  cursor: pointer;
  transition: $transition-fast;
  border: 1px solid transparent;

  &:hover {
    background: $bg-light;
    border-color: $border-color;
    .row-chevron {
      transform: translateX(2px);
      color: $primary;
    }
  }

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 20px 12px 1fr 16px;
    .row-spark {
      display: none;
    }
  }
}

.rank-no {
  font-size: $font-size-xs;
  color: $text-muted;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.row--top .rank-no {
  color: $primary;
  font-weight: $font-bold;
}

.swatch {
  width: 8px;
  height: 36px;
  border-radius: 4px;
}

.row-main {
  min-width: 0;
}

.row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-2;
}

.row-name {
  font-weight: $font-semibold;
  color: $text-primary;
  font-size: $font-size-sm;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-amount {
  font-weight: $font-bold;
  font-variant-numeric: tabular-nums;
  color: $text-primary;
  font-size: $font-size-sm;
}

.row-bar {
  height: 6px;
  background: $bg-light;
  border-radius: 4px;
  margin-top: 6px;
  overflow: hidden;
}

.row-fill {
  display: block;
  height: 100%;
  border-radius: 4px;
  transition: width $duration-slow $easing-emphasized;
  background: var(--row-color, $text-secondary);
}

.row-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.meta-chip {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 999px;
  background: $bg-light;
  color: $text-secondary;
  font-variant-numeric: tabular-nums;

  &--ghost {
    background: transparent;
    color: $text-muted;
    padding: 1px 0;
  }
}

.meta-delta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
  font-weight: $font-semibold;

  &.is-good {
    background: var(--color-income-soft);
    color: var(--color-income);
  }
  &.is-bad {
    background: var(--color-expense-soft);
    color: var(--color-expense);
  }
  &.is-flat {
    background: $bg-light;
    color: $text-muted;
  }
}

.row-spark {
  height: 32px;
  width: 90px;
}

.row-chevron {
  color: $text-muted;
  transition: $transition-fast;
}
</style>
