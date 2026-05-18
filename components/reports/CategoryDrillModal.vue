<template>
  <Transition name="modal">
    <div v-if="open" class="modal-root" @click.self="$emit('close')">
      <div class="modal-panel" role="dialog" aria-modal="true">
        <header class="modal-head">
          <div class="head-id">
            <span class="head-swatch" :style="{ background: bucket.color }" />
            <div>
              <h2 class="head-title">{{ bucket.name }}</h2>
              <p class="head-sub">
                {{ t('Period overview · {n} transactions', { n: bucket.count }) }}
              </p>
            </div>
          </div>
          <button class="close-btn" :aria-label="t('Close')" @click="$emit('close')">
            <X :size="18" />
          </button>
        </header>

        <section class="kpi-row">
          <div class="kpi">
            <span class="kpi-label">{{ t('Total') }}</span>
            <span class="kpi-value">{{ formatter(bucket.amount, currency) }}</span>
          </div>
          <div class="kpi">
            <span class="kpi-label">{{ t('Avg / month') }}</span>
            <span class="kpi-value">{{ formatter(avgPerMonth, currency) }}</span>
          </div>
          <div class="kpi">
            <span class="kpi-label">{{ t('Peak month') }}</span>
            <span class="kpi-value">{{ peakMonthLabel || '—' }}</span>
          </div>
          <div class="kpi">
            <span class="kpi-label">{{ t('vs prior period') }}</span>
            <span
              class="kpi-value"
              :class="bucket.delta < 0 ? 'is-good' : bucket.delta > 0 ? 'is-bad' : ''"
            >
              {{ bucket.delta > 0 ? '+' : '' }}{{ bucket.delta }}%
            </span>
          </div>
        </section>

        <section class="trend-block">
          <h3 class="block-title">{{ t('Trend (last 6 months)') }}</h3>
          <div class="trend-bars">
            <div v-for="(v, i) in bucket.trend" :key="i" class="trend-bar-wrap">
              <span
                class="trend-bar"
                :style="{
                  height: `${Math.max(2, (v / trendMax) * 100)}%`,
                  background: bucket.color
                }"
              />
              <span class="trend-bar-label">{{ monthLabels[i] }}</span>
            </div>
          </div>
        </section>

        <section class="block">
          <h3 class="block-title">
            {{ t('Top {kind}', { kind: bucket.kind === 'income' ? t('sources') : t('payees') }) }}
          </h3>
          <ul v-if="topParties.length" class="party-list">
            <li v-for="p in topParties" :key="p.name" class="party-row">
              <span class="party-name">{{ p.name }}</span>
              <span class="party-bar-wrap">
                <span
                  class="party-bar"
                  :style="{
                    width: `${(p.amount / topParties[0].amount) * 100}%`,
                    background: bucket.color
                  }"
                />
              </span>
              <span class="party-amt">{{ formatter(p.amount, currency) }}</span>
            </li>
          </ul>
          <p v-else class="empty">{{ t('No transactions match.') }}</p>
        </section>

        <section class="block">
          <h3 class="block-title">{{ t('Transactions') }}</h3>
          <div v-if="visibleTxs.length" class="tx-list">
            <article v-for="tx in visibleTxs" :key="tx.id" class="tx">
              <div class="tx-main">
                <span class="tx-party">{{ tx.party }}</span>
                <span class="tx-date">{{ formatDate(tx.date) }}</span>
              </div>
              <span class="tx-amount" :class="tx.type === 'INCOME' ? 'is-in' : 'is-out'">
                {{ tx.type === 'INCOME' ? '+' : '-' }}{{ formatAmount(tx.amount) }}
              </span>
            </article>
          </div>
          <p v-else class="empty">{{ t('No transactions match.') }}</p>
          <button
            v-if="filteredTxs.length > visibleCount"
            class="more-btn"
            @click="visibleCount += 10"
          >
            {{ t('Show {n} more', { n: Math.min(10, filteredTxs.length - visibleCount) }) }}
          </button>
        </section>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import { useTransactions } from '~/composables/useTransactions';

const { t, locale } = useI18n();

const props = defineProps({
  open: { type: Boolean, default: false },
  bucket: { type: Object, default: null },
  range: { type: Object, default: null }, // { start: Date, end: Date }
  trailingMonths: { type: Array, default: () => [] }, // [{ month: 'YYYY-MM' }]
  currency: { type: String, default: 'USD' },
  formatter: { type: Function, default: (n) => `${Math.round(n)}` }
});

defineEmits(['close']);

const { transactions } = useTransactions();
const visibleCount = ref(10);

watch(
  () => props.open,
  (o) => {
    if (o) visibleCount.value = 10;
  }
);

const filteredTxs = computed(() => {
  if (!props.bucket || !props.range) return [];
  const wantedType = props.bucket.kind === 'income' ? 'INCOME' : 'EXPENSE';
  return transactions.value
    .filter((tx) => {
      if (tx.isTransfer) return false;
      if (tx.type !== wantedType) return false;
      if ((tx.category || 'Uncategorized') !== props.bucket.name) return false;
      const d = new Date(tx.date + 'T00:00:00');
      return d >= props.range.start && d <= props.range.end;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
});

const visibleTxs = computed(() => filteredTxs.value.slice(0, visibleCount.value));

const topParties = computed(() => {
  if (!filteredTxs.value.length) return [];
  const map = new Map();
  filteredTxs.value.forEach((tx) => {
    const a = parseFloat(
      String(tx.amount)
        .match(/[\d.,-]+/)?.[0]
        ?.replace(/,/g, '') || '0'
    );
    map.set(tx.party, (map.get(tx.party) || 0) + a);
  });
  return Array.from(map.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
});

const trendMax = computed(() => Math.max(1, ...(props.bucket?.trend || [])));

const avgPerMonth = computed(() => {
  if (!props.bucket?.trend?.length) return 0;
  const sum = props.bucket.trend.reduce((s, v) => s + v, 0);
  return sum / props.bucket.trend.length;
});

const monthLabels = computed(() =>
  props.trailingMonths.map((m) =>
    new Intl.DateTimeFormat(locale.value, { month: 'short' }).format(new Date(m.month + '-01'))
  )
);

const peakMonthLabel = computed(() => {
  if (!props.bucket?.trend?.length) return '';
  const idx = props.bucket.trend.indexOf(Math.max(...props.bucket.trend));
  return monthLabels.value[idx] || '';
});

const formatDate = (iso) =>
  new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(iso + 'T00:00:00'));

const formatAmount = (a) => String(a).trim();
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.modal-root {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: $z-index-modal;
  padding: 0;

  @media (min-width: $breakpoint-md) {
    padding: $spacing-6;
    align-items: center;
  }
}

.modal-panel {
  background: $bg-white;
  border-radius: 20px 20px 0 0;
  padding: $spacing-5;
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: $elevation-5;
  display: flex;
  flex-direction: column;
  gap: $spacing-4;

  @media (min-width: $breakpoint-md) {
    border-radius: 20px;
  }
}

.modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $spacing-3;
}

.head-id {
  display: flex;
  gap: $spacing-3;
  align-items: center;
}

.head-swatch {
  width: 12px;
  height: 40px;
  border-radius: 4px;
}

.head-title {
  font-size: $font-size-xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin: 0;
}

.head-sub {
  font-size: $font-size-xs;
  color: $text-muted;
  margin: 2px 0 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid $border-color;
  background: $bg-white;
  color: $text-muted;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: $transition-fast;

  &:hover {
    background: $bg-light;
    color: $text-primary;
  }
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-2;

  @media (min-width: $breakpoint-sm) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.kpi {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: $spacing-2 $spacing-3;
  background: $bg-light;
  border-radius: 10px;
}

.kpi-label {
  font-size: 11px;
  color: $text-muted;
  font-weight: $font-semibold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.kpi-value {
  font-size: $font-size-base;
  font-weight: $font-bold;
  color: $text-primary;
  font-variant-numeric: tabular-nums;

  &.is-good {
    color: var(--color-income);
  }
  &.is-bad {
    color: var(--color-expense);
  }
}

.block-title {
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  color: $text-secondary;
  margin: 0 0 $spacing-2;
}

.trend-bars {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: $spacing-2;
  height: 120px;
  align-items: end;
}

.trend-bar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
  justify-content: end;
}

.trend-bar {
  display: block;
  width: 100%;
  border-radius: 4px 4px 0 0;
  min-height: 2px;
  transition: height $duration-slow $easing-emphasized;
}

.trend-bar-label {
  font-size: 10px;
  color: $text-muted;
}

.party-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.party-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: $spacing-2;
  align-items: center;
  font-size: $font-size-sm;
}

.party-name {
  font-weight: $font-medium;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.party-bar-wrap {
  height: 6px;
  background: $bg-light;
  border-radius: 4px;
  overflow: hidden;
}

.party-bar {
  display: block;
  height: 100%;
  border-radius: 4px;
}

.party-amt {
  font-weight: $font-bold;
  font-variant-numeric: tabular-nums;
  color: $text-primary;
}

.tx-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 240px;
  overflow-y: auto;
}

.tx {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-2 $spacing-3;
  border-radius: 8px;
  transition: $transition-fast;

  &:hover {
    background: $bg-light;
  }
}

.tx-main {
  display: flex;
  flex-direction: column;
}

.tx-party {
  font-size: $font-size-sm;
  font-weight: $font-medium;
  color: $text-primary;
}

.tx-date {
  font-size: 11px;
  color: $text-muted;
}

.tx-amount {
  font-weight: $font-bold;
  font-variant-numeric: tabular-nums;

  &.is-in {
    color: var(--color-income);
  }
  &.is-out {
    color: var(--color-expense);
  }
}

.more-btn {
  align-self: center;
  margin-top: $spacing-2;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid $border-color;
  background: $bg-white;
  color: $text-secondary;
  font-size: $font-size-xs;
  cursor: pointer;
  transition: $transition-fast;

  &:hover {
    background: $bg-light;
    color: $text-primary;
  }
}

.empty {
  font-size: $font-size-sm;
  color: $text-muted;
  margin: 0;
  padding: $spacing-3 0;
  text-align: center;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity $duration-base $easing-standard;
}
.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform $duration-base $easing-emphasized;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  transform: translateY(20px);
}
</style>
