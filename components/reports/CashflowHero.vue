<template>
  <section class="hero">
    <article class="hero-net" :class="netToneClass">
      <header class="net-head">
        <span class="net-label">{{ t('Net for the period') }}</span>
        <span class="net-pill" :class="netToneClass">
          {{ totals.net >= 0 ? t('Surplus') : t('Deficit') }}
        </span>
      </header>
      <div class="net-value-row">
        <p class="net-value">{{ format(totals.net) }}</p>
        <span
          v-if="compareEnabled"
          class="delta delta--lg"
          :class="deltaClass(totals.netDelta, false)"
        >
          <component :is="deltaIcon(totals.netDelta)" :size="14" />
          {{ totals.netDelta > 0 ? '+' : '' }}{{ totals.netDelta }}%
        </span>
      </div>
      <p v-if="compareEnabled" class="whisper-line">
        {{ t('vs') }} {{ format(totals.prevNet) }}
        <span class="whisper-meta">{{ t('previous period') }}</span>
      </p>
      <div class="net-spark">
        <SparkLine :values="netTrend" color="var(--color-primary)" :height="32" />
      </div>
    </article>

    <div class="sats">
      <article class="sat">
        <header class="sat-head">
          <ArrowDownLeft :size="12" class="sat-ico sat-ico--in" />
          <span class="sat-label">{{ t('Income') }}</span>
        </header>
        <div class="sat-value-row">
          <p class="sat-value sat-value--in">{{ format(totals.income) }}</p>
          <span v-if="compareEnabled" class="delta" :class="deltaClass(totals.incomeDelta, false)">
            {{ totals.incomeDelta > 0 ? '+' : '' }}{{ totals.incomeDelta }}%
          </span>
        </div>
        <p v-if="compareEnabled" class="whisper-line">
          {{ t('vs') }} {{ format(totals.prevIncome) }}
        </p>
        <div class="sat-spark">
          <SparkLine :values="incomeTrend" color="var(--color-income)" :height="22" />
        </div>
      </article>
      <article class="sat">
        <header class="sat-head">
          <ArrowUpRight :size="12" class="sat-ico sat-ico--out" />
          <span class="sat-label">{{ t('Expense') }}</span>
        </header>
        <div class="sat-value-row">
          <p class="sat-value sat-value--out">{{ format(totals.expense) }}</p>
          <span v-if="compareEnabled" class="delta" :class="deltaClass(totals.expenseDelta, true)">
            {{ totals.expenseDelta > 0 ? '+' : '' }}{{ totals.expenseDelta }}%
          </span>
        </div>
        <p v-if="compareEnabled" class="whisper-line">
          {{ t('vs') }} {{ format(totals.prevExpense) }}
        </p>
        <div class="sat-spark">
          <SparkLine :values="expenseTrend" color="var(--color-expense)" :height="22" />
        </div>
      </article>
      <article class="sat">
        <header class="sat-head">
          <PiggyBank :size="12" class="sat-ico" />
          <span class="sat-label">{{ t('Savings rate') }}</span>
        </header>
        <div class="sat-value-row">
          <p class="sat-value">{{ (totals.savingsRate * 100).toFixed(0) }}%</p>
          <span
            v-if="compareEnabled"
            class="delta"
            :class="deltaClass(totals.savingsRateDelta, false)"
          >
            {{ totals.savingsRateDelta > 0 ? '+' : '' }}{{ totals.savingsRateDelta }} pts
          </span>
        </div>
        <p v-if="compareEnabled" class="whisper-line">
          {{ t('vs') }} {{ (totals.prevSavingsRate * 100).toFixed(0) }}%
        </p>
        <div class="sat-spark">
          <SparkLine :values="rateTrend" color="var(--color-text-secondary)" :height="22" />
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import {
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUpRight as ArrowUpRightIcon,
  ArrowDownRight,
  Minus
} from 'lucide-vue-next';
import SparkLine from './SparkLine.vue';

const { t } = useI18n();

const props = defineProps({
  totals: { type: Object, required: true },
  trailing: { type: Array, required: true },
  compareEnabled: { type: Boolean, default: true },
  currency: { type: String, default: 'USD' },
  formatter: { type: Function, default: (n) => `${Math.round(n)}` }
});

const format = (n) => props.formatter(n, props.currency);

const incomeTrend = computed(() => props.trailing.map((m) => m.income));
const expenseTrend = computed(() => props.trailing.map((m) => m.expense));
const netTrend = computed(() => props.trailing.map((m) => m.net));
const rateTrend = computed(() =>
  props.trailing.map((m) => (m.income > 0 ? ((m.income - m.expense) / m.income) * 100 : 0))
);

const netToneClass = computed(() => (props.totals.net >= 0 ? 'is-positive' : 'is-negative'));

const deltaClass = (delta, inverted) => {
  if (!delta) return 'delta--flat';
  const goodWhenUp = !inverted;
  const isGood = goodWhenUp ? delta > 0 : delta < 0;
  return isGood ? 'delta--good' : 'delta--bad';
};

const deltaIcon = (delta) => {
  if (!delta) return Minus;
  return delta > 0 ? ArrowUpRightIcon : ArrowDownRight;
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-3;
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: 14px;
  box-shadow: $elevation-1;
  padding: $spacing-4;

  @media (min-width: $breakpoint-md) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
    gap: $spacing-5;
    align-items: stretch;
  }
}

.hero-net {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 0;
  position: relative;

  @media (min-width: $breakpoint-md) {
    padding-right: $spacing-5;
    border-right: 1px solid $border-color;
  }
}

.net-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-2;
}

.net-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: $font-semibold;
  color: $text-muted;
}

.net-pill {
  font-size: 10px;
  font-weight: $font-bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: 999px;

  &.is-positive {
    background: var(--color-income-soft);
    color: var(--color-income);
  }
  &.is-negative {
    background: var(--color-expense-soft);
    color: var(--color-expense);
  }
}

.net-value-row {
  display: flex;
  align-items: baseline;
  gap: $spacing-2;
  flex-wrap: wrap;
  margin: 4px 0 0;
}

.net-value {
  font-size: 2rem;
  font-weight: $font-semibold;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1.1;
  color: $text-primary;

  .hero-net.is-positive & {
    color: var(--color-income);
  }
  .hero-net.is-negative & {
    color: var(--color-expense);
  }

  @media (max-width: $breakpoint-sm) {
    font-size: 1.6rem;
  }
}

.sat-value-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
  margin: 2px 0 0;
}

.whisper-line {
  font-size: 11px;
  color: $text-muted;
  margin: 2px 0 0;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.whisper-meta {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.delta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: $font-bold;
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;

  &--lg {
    font-size: 13px;
    padding: 4px 10px;
  }

  &--good {
    background: var(--color-income-soft);
    color: var(--color-income);
  }
  &--bad {
    background: var(--color-expense-soft);
    color: var(--color-expense);
  }
  &--flat {
    background: $bg-light;
    color: $text-muted;
  }
}

.net-spark {
  margin-top: auto;
  padding-top: $spacing-3;
  height: 32px;
}

.sats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-3;
  align-items: stretch;

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
    gap: $spacing-2;
  }
}

.sat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0;
  border-left: 1px solid $border-color;
  padding-left: $spacing-3;

  &:first-child {
    border-left: none;
    padding-left: 0;
  }

  @media (max-width: $breakpoint-sm) {
    border-left: none;
    border-top: 1px solid $border-color;
    padding-left: 0;
    padding-top: $spacing-2;

    &:first-child {
      border-top: none;
      padding-top: 0;
    }
  }
}

.sat-head {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: $text-muted;
}

.sat-ico {
  color: $text-muted;

  &--in {
    color: var(--color-income);
  }
  &--out {
    color: var(--color-expense);
  }
}

.sat-label {
  font-size: 11px;
  font-weight: $font-semibold;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.sat-value {
  font-size: 1.25rem;
  font-weight: $font-semibold;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  margin: 2px 0 0;
  line-height: 1.1;
  color: $text-primary;

  &--in {
    color: var(--color-income);
  }
  &--out {
    color: var(--color-expense);
  }
}

.sat-spark {
  margin-top: auto;
  padding-top: 4px;
  height: 22px;
}
</style>
