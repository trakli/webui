<template>
  <section class="stats-strip">
    <article
      v-for="stat in stats"
      :key="stat.key"
      class="stat surface"
      :class="`surface--${stat.tone}`"
    >
      <div class="stat-icon">
        <component :is="stat.icon" :size="16" />
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
import { Users, TrendingUp, ArrowDownLeft, ArrowUpRight } from 'lucide-vue-next';

const { t } = useI18n();

const props = defineProps({
  parties: { type: Array, required: true },
  currency: { type: String, default: 'USD' },
  formatter: { type: Function, default: (n) => `${Math.round(n)}` }
});

const totals = computed(() => {
  let received = 0;
  let spent = 0;
  let topEarner = null;
  let topSpender = null;

  props.parties.forEach((p) => {
    const r = Number(p.receivedAmount || 0);
    const s = Number(p.spentAmount || 0);
    received += r;
    spent += s;
    if (!topEarner || r > Number(topEarner.receivedAmount || 0)) topEarner = p;
    if (!topSpender || s > Number(topSpender.spentAmount || 0)) topSpender = p;
  });

  return {
    received,
    spent,
    net: received - spent,
    topEarner: topEarner && Number(topEarner.receivedAmount || 0) > 0 ? topEarner : null,
    topSpender: topSpender && Number(topSpender.spentAmount || 0) > 0 ? topSpender : null
  };
});

const stats = computed(() => [
  {
    key: 'count',
    label: t('Parties'),
    value: props.parties.length,
    icon: Users,
    tone: 'brand'
  },
  {
    key: 'net',
    label: t('Net trade'),
    value: props.formatter(totals.value.net, props.currency),
    sub: t('Last 3 months'),
    icon: TrendingUp,
    tone: totals.value.net >= 0 ? 'income' : 'expense'
  },
  {
    key: 'topEarner',
    label: t('Top earner'),
    value: totals.value.topEarner?.name || '—',
    sub: totals.value.topEarner
      ? props.formatter(totals.value.topEarner.receivedAmount, props.currency)
      : t('No income yet'),
    icon: ArrowDownLeft,
    tone: 'income'
  },
  {
    key: 'topSpender',
    label: t('Top spend'),
    value: totals.value.topSpender?.name || '—',
    sub: totals.value.topSpender
      ? props.formatter(totals.value.topSpender.spentAmount, props.currency)
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

  :deep(svg) {
    width: 14px;
    height: 14px;
  }
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
