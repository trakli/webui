<template>
  <section class="flow-tab">
    <header class="tab-header">
      <div>
        <p class="eyebrow">{{ t('Flow') }}</p>
        <h2 class="title">{{ t('How money moved') }}</h2>
        <p class="sub">
          {{ t('Income on the left, where it went on the right. Hover a stream to focus.') }}
        </p>
      </div>
    </header>

    <div class="summary-strip">
      <article class="sum sum--in">
        <span class="sum-ico"><ArrowDownLeft :size="18" /></span>
        <div>
          <p class="sum-label">{{ t('Total in') }}</p>
          <p class="sum-val">{{ formatter(flow.totalIn, currency) }}</p>
        </div>
      </article>
      <article class="sum sum--out">
        <span class="sum-ico"><ArrowUpRight :size="18" /></span>
        <div>
          <p class="sum-label">{{ t('Total out') }}</p>
          <p class="sum-val">{{ formatter(flow.totalOut, currency) }}</p>
        </div>
      </article>
      <article class="sum sum--save" :class="{ 'is-deficit': flow.savings <= 0 }">
        <span class="sum-ico"><PiggyBank :size="18" /></span>
        <div>
          <p class="sum-label">{{ flow.savings >= 0 ? t('Saved') : t('Shortfall') }}</p>
          <p class="sum-val">{{ formatter(Math.abs(flow.savings), currency) }}</p>
        </div>
      </article>
    </div>

    <div class="canvas">
      <SankeyFlow :flow="flow" :currency="currency" :formatter="formatter" />
    </div>

    <div class="legend">
      <div class="legend-col">
        <h4 class="legend-title">
          <ArrowDownLeft :size="12" />
          {{ t('Sources') }}
        </h4>
        <ul>
          <li v-for="s in flow.sources" :key="s.name">
            <span class="dot" :style="{ background: 'var(--color-income)' }" />
            <span class="ll-name">{{ s.name }}</span>
            <span class="ll-amt">{{ formatter(s.amount, currency) }}</span>
          </li>
          <li v-if="!flow.sources.length" class="empty">{{ t('No income.') }}</li>
        </ul>
      </div>
      <div class="legend-col">
        <h4 class="legend-title">
          <ArrowUpRight :size="12" />
          {{ t('Destinations') }}
        </h4>
        <ul>
          <li v-for="s in flow.sinks" :key="s.name">
            <span class="dot" :style="{ background: s.color || 'var(--color-expense)' }" />
            <span class="ll-name">{{ s.name }}</span>
            <span class="ll-amt">{{ formatter(s.amount, currency) }}</span>
          </li>
          <li v-if="!flow.sinks.length" class="empty">{{ t('No expenses.') }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ArrowDownLeft, ArrowUpRight, PiggyBank } from 'lucide-vue-next';
import SankeyFlow from './SankeyFlow.vue';

const { t } = useI18n();

defineProps({
  flow: { type: Object, required: true },
  currency: { type: String, default: 'USD' },
  formatter: { type: Function, default: (n) => `${Math.round(n)}` }
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.flow-tab {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: $spacing-3;
  flex-wrap: wrap;
}

.eyebrow {
  display: none;
}

.title {
  font-size: 1.25rem;
  font-weight: $font-semibold;
  color: $text-primary;
  margin: 0;
  letter-spacing: -0.01em;
}

.sub {
  font-size: $font-size-sm;
  color: $text-muted;
  margin: 4px 0 0;
}

.summary-strip {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-3;

  @media (min-width: $breakpoint-sm) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.sum {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-4;
  border-radius: 14px;
  background: $bg-white;
  border: 1px solid $border-color;
  box-shadow: $elevation-1;
}

.sum-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: $text-muted;

  .sum--in & {
    color: var(--color-income);
  }
  .sum--out & {
    color: var(--color-expense);
  }
  .sum--save & {
    color: $text-secondary;
  }
  .sum--save.is-deficit & {
    color: var(--color-warning);
  }
}

.sum-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: $font-semibold;
  color: $text-muted;
  margin: 0;
}

.sum-val {
  font-size: $font-size-xl;
  font-weight: $font-semibold;
  color: $text-primary;
  font-variant-numeric: tabular-nums;
  margin: 2px 0 0;
  letter-spacing: -0.01em;

  .sum--in & {
    color: var(--color-income);
  }
  .sum--out & {
    color: var(--color-expense);
  }
  .sum--save.is-deficit & {
    color: var(--color-warning);
  }
}

.canvas {
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: 16px;
  padding: $spacing-4;
  box-shadow: $elevation-1;
  overflow-x: auto;
}

.legend {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-3;

  @media (min-width: $breakpoint-md) {
    grid-template-columns: 1fr 1fr;
  }
}

.legend-col {
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: 16px;
  padding: $spacing-3 $spacing-4;
  box-shadow: $elevation-1;
}

.legend-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: $font-semibold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $text-muted;
  margin: 0 0 $spacing-2;
}

.legend-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend-col li {
  display: grid;
  grid-template-columns: 12px 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px dashed $border-color;
  font-size: $font-size-sm;

  &:last-child {
    border-bottom: none;
  }

  &.empty {
    display: block;
    color: $text-muted;
    border-bottom: none;
  }
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.ll-name {
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ll-amt {
  font-weight: $font-bold;
  color: $text-primary;
  font-variant-numeric: tabular-nums;
}
</style>
