<template>
  <section class="stats-strip">
    <article
      v-for="stat in stats"
      :key="stat.key"
      class="stat surface"
      :class="`surface--${stat.tone}`"
    >
      <div class="stat-icon">
        <component :is="stat.icon" :size="14" />
      </div>
      <div class="stat-body">
        <span class="stat-label">{{ stat.label }}</span>
        <p class="stat-value">{{ stat.value }}</p>
        <span v-if="stat.sub" class="stat-sub">{{ stat.sub }}</span>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { Wallet, Coins, ArrowDownLeft, ArrowUpRight } from 'lucide-vue-next';

const { t } = useI18n();

const props = defineProps({
  wallets: { type: Array, required: true },
  defaultWalletId: { type: String, default: null },
  defaultCurrency: { type: String, default: 'USD' },
  formatter: { type: Function, default: (n) => `${Math.round(n)}` }
});

const inDefaultCurrency = computed(() =>
  props.wallets.filter((w) => w.currency === props.defaultCurrency)
);

const totals = computed(() => {
  let balance = 0;
  let income = 0;
  let expense = 0;
  let topEarner = null;
  let topSpender = null;

  inDefaultCurrency.value.forEach((w) => {
    balance += Number(w.balance || 0);
    const inc = Number(w.stats?.total_income || 0);
    const exp = Number(w.stats?.total_expense || 0);
    income += inc;
    expense += exp;
    if (!topEarner || inc > Number(topEarner.stats?.total_income || 0)) topEarner = w;
    if (!topSpender || exp > Number(topSpender.stats?.total_expense || 0)) topSpender = w;
  });

  return {
    balance,
    income,
    expense,
    topEarner: topEarner && Number(topEarner.stats?.total_income || 0) > 0 ? topEarner : null,
    topSpender: topSpender && Number(topSpender.stats?.total_expense || 0) > 0 ? topSpender : null
  };
});

const stats = computed(() => [
  {
    key: 'count',
    label: t('Wallets'),
    value: props.wallets.length,
    sub:
      inDefaultCurrency.value.length !== props.wallets.length
        ? t('{n} in {cur}', { n: inDefaultCurrency.value.length, cur: props.defaultCurrency })
        : '',
    icon: Wallet,
    tone: 'brand'
  },
  {
    key: 'balance',
    label: t('Total balance'),
    value: props.formatter(totals.value.balance, props.defaultCurrency),
    sub: inDefaultCurrency.value.length
      ? t('Across {n} {cur} wallet(s)', {
          n: inDefaultCurrency.value.length,
          cur: props.defaultCurrency
        })
      : t('No {cur} wallets yet', { cur: props.defaultCurrency }),
    icon: Coins,
    tone: totals.value.balance >= 0 ? 'brand-soft' : 'expense'
  },
  {
    key: 'topEarner',
    label: t('Top earner'),
    value: totals.value.topEarner?.name || '—',
    sub: totals.value.topEarner
      ? props.formatter(totals.value.topEarner.stats.total_income, props.defaultCurrency)
      : t('No income yet'),
    icon: ArrowDownLeft,
    tone: 'income'
  },
  {
    key: 'topSpender',
    label: t('Top spend'),
    value: totals.value.topSpender?.name || '—',
    sub: totals.value.topSpender
      ? props.formatter(totals.value.topSpender.stats.total_expense, props.defaultCurrency)
      : t('No spend yet'),
    icon: ArrowUpRight,
    tone: 'expense'
  }
]);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.stats-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  width: 100%;

  @media (max-width: $breakpoint-md) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-right: 1px solid $border-light;
  overflow: hidden;
  min-width: 0;

  &:last-child {
    border-right: none;
  }

  @media (max-width: $breakpoint-md) {
    &:nth-child(2n) {
      border-right: none;
    }
    &:nth-child(-n + 2) {
      border-bottom: 1px solid $border-light;
    }
  }
}

.stat-icon {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: var(--glass-bg);
  border: 1px solid $border-light;
  color: var(--surface-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
  flex: 1;
  line-height: 1.2;
}

.stat-label {
  font-size: 10px;
  font-weight: $font-bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--surface-deep);
  opacity: 0.85;
}

.stat-value {
  margin: 0;
  font-size: $font-size-sm;
  font-weight: $font-bold;
  color: var(--surface-ink);
  letter-spacing: -0.005em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-sub {
  font-size: 10px;
  color: var(--surface-ink);
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
