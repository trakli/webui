<template>
  <div class="detail" :class="{ 'detail--empty': !wallet }">
    <div v-if="!wallet" class="empty">
      <svg class="empty-illustration" viewBox="0 0 220 220" aria-hidden="true">
        <defs>
          <radialGradient id="wempty-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.22" />
            <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0" />
          </radialGradient>
        </defs>
        <circle cx="110" cy="110" r="100" fill="url(#wempty-glow)" />
        <circle
          cx="110"
          cy="110"
          r="80"
          fill="none"
          stroke="var(--color-primary)"
          stroke-opacity="0.18"
          stroke-width="1"
          stroke-dasharray="3 4"
        />
        <circle
          cx="110"
          cy="110"
          r="56"
          fill="none"
          stroke="var(--color-primary)"
          stroke-opacity="0.28"
          stroke-width="1"
        />
        <rect x="74" y="92" width="72" height="44" rx="8" fill="var(--color-primary-light)" />
        <rect
          x="74"
          y="92"
          width="72"
          height="14"
          rx="8"
          fill="var(--color-primary)"
          opacity="0.6"
        />
        <circle cx="132" cy="116" r="5" fill="var(--color-primary)" />
        <circle cx="190" cy="60" r="6" fill="var(--color-primary)" opacity="0.7" />
        <circle cx="35" cy="170" r="4" fill="var(--color-primary)" opacity="0.55" />
        <circle cx="170" cy="180" r="5" fill="var(--color-primary)" opacity="0.45" />
      </svg>
      <p class="empty-title">{{ t('Select a wallet') }}</p>
      <p class="empty-sub">
        {{ t('Pick a wallet on the left to see its balance, activity, and recent transactions.') }}
      </p>
    </div>

    <Transition v-else name="wallet-swap" mode="out-in">
      <div :key="wallet.id" class="detail-body">
        <header class="hero surface" :class="netTone">
          <svg
            class="hero-decor"
            viewBox="0 0 800 80"
            preserveAspectRatio="xMaxYMid slice"
            aria-hidden="true"
          >
            <defs>
              <pattern
                :id="`whero-dots-${wallet.id}`"
                width="18"
                height="18"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1" fill="var(--surface-deep)" opacity="0.12" />
              </pattern>
              <radialGradient :id="`whero-bloom-${wallet.id}`" cx="100%" cy="50%" r="60%">
                <stop offset="0%" stop-color="var(--surface-accent)" stop-opacity="0.45" />
                <stop offset="100%" stop-color="var(--surface-accent)" stop-opacity="0" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="800" height="80" :fill="`url(#whero-dots-${wallet.id})`" />
            <circle cx="780" cy="40" r="120" :fill="`url(#whero-bloom-${wallet.id})`" />
          </svg>

          <button
            v-if="showBack"
            class="back-btn"
            :aria-label="t('Back to list')"
            @click="$emit('back')"
          >
            <ChevronLeft :size="18" />
          </button>

          <div class="hero-avatar">
            <component :is="resolvedIcon" :size="18" />
          </div>
          <div class="hero-meta">
            <div class="hero-name-row">
              <h2 class="hero-name">{{ wallet.name }}</h2>
              <span v-if="isDefault" class="hero-default-badge">
                <Star :size="11" />
                {{ t('Default') }}
              </span>
            </div>
            <span class="hero-sub">
              <span class="hero-currency">{{ wallet.currency }}</span>
              <template v-if="wallet.type">
                <span class="hero-dot">·</span>
                <span class="hero-type">{{ displayType }}</span>
              </template>
            </span>
          </div>

          <div class="hero-actions">
            <button
              class="hero-action"
              :title="t('Edit')"
              :aria-label="t('Edit')"
              @click="$emit('edit', wallet)"
            >
              <Edit3 :size="14" />
            </button>
            <button
              class="hero-action hero-action--danger"
              :title="t('Delete')"
              :aria-label="t('Delete')"
              @click="$emit('delete', wallet)"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </header>

        <section class="totals">
          <div class="total total--balance">
            <span class="total-label">{{ t('Balance') }}</span>
            <p class="total-value">{{ formatter(wallet.balance || 0, wallet.currency) }}</p>
          </div>
          <div class="total-divider" />
          <div class="total total--income">
            <span class="total-label">{{ t('Income') }}</span>
            <p class="total-value tone-income">
              {{ formatter(wallet.stats?.total_income || 0, wallet.currency) }}
            </p>
          </div>
          <div class="total-divider" />
          <div class="total total--expense">
            <span class="total-label">{{ t('Expense') }}</span>
            <p class="total-value tone-expense">
              {{ formatter(wallet.stats?.total_expense || 0, wallet.currency) }}
            </p>
          </div>
          <div class="total-divider" />
          <div class="total total--net">
            <span class="total-label">{{ t('Net') }}</span>
            <p class="total-value" :class="netValue >= 0 ? 'tone-income' : 'tone-expense'">
              {{ formatter(netValue, wallet.currency) }}
            </p>
          </div>
        </section>

        <section class="chart-card">
          <header class="chart-head">
            <div>
              <span class="chart-eyebrow">{{ t('Last 6 months') }}</span>
              <h3 class="chart-title">{{ t('Activity') }}</h3>
            </div>
            <span class="chart-legend">
              <span class="legend-dot legend-dot--income" />{{ t('Income') }}
              <span class="legend-dot legend-dot--expense" />{{ t('Expense') }}
            </span>
          </header>
          <svg
            v-if="hasActivity"
            class="chart-svg"
            :viewBox="`0 0 ${chartW} ${chartH}`"
            preserveAspectRatio="none"
          >
            <line
              v-for="i in 4"
              :key="`grid-${i}`"
              :x1="0"
              :x2="chartW"
              :y1="(chartH - 24) * (i / 4) + 4"
              :y2="(chartH - 24) * (i / 4) + 4"
              class="chart-grid"
              vector-effect="non-scaling-stroke"
            />
            <polyline
              :points="linePoints('income')"
              fill="none"
              stroke="var(--color-income)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              vector-effect="non-scaling-stroke"
            />
            <polyline
              :points="linePoints('expense')"
              fill="none"
              stroke="var(--color-expense)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              vector-effect="non-scaling-stroke"
            />
            <g v-for="(m, i) in monthly" :key="`pt-${i}`">
              <circle
                v-if="m.income > 0"
                :cx="xAt(i)"
                :cy="yAt(m.income)"
                r="3"
                fill="var(--color-income)"
              />
              <circle
                v-if="m.expense > 0"
                :cx="xAt(i)"
                :cy="yAt(m.expense)"
                r="3"
                fill="var(--color-expense)"
              />
            </g>
            <text
              v-for="(m, i) in monthly"
              :key="`label-${i}`"
              :x="xAt(i)"
              :y="chartH - 4"
              text-anchor="middle"
              class="chart-axis"
            >
              {{ m.label }}
            </text>
          </svg>
          <div v-else class="chart-empty">
            <Activity :size="22" />
            <span>{{ t('No activity in the last 6 months yet.') }}</span>
          </div>
        </section>

        <section class="recent">
          <header class="recent-head">
            <div>
              <span class="recent-eyebrow">{{ t('Recent transactions') }}</span>
              <h3 class="recent-title">{{ recentTransactions.length }} {{ t('shown') }}</h3>
            </div>
            <NuxtLink :to="`/transactions?walletId=${wallet.id}`" class="recent-link">
              {{ t('View all') }}
              <ChevronRight :size="14" />
            </NuxtLink>
          </header>
          <ul v-if="recentTransactions.length" class="recent-list">
            <li v-for="tx in recentTransactions" :key="tx.id" class="recent-row">
              <div class="recent-row-left">
                <span
                  class="recent-type"
                  :class="
                    tx.type === 'INCOME' || tx.type === 'income' ? 'tone-income' : 'tone-expense'
                  "
                >
                  <component
                    :is="
                      tx.type === 'INCOME' || tx.type === 'income' ? ArrowDownLeft : ArrowUpRight
                    "
                    :size="14"
                  />
                </span>
                <div class="recent-text">
                  <span class="recent-name">{{
                    tx.party || tx.description || tx.category || t('Transaction')
                  }}</span>
                  <span class="recent-date">{{ formatDate(tx.date || tx.datetime) }}</span>
                </div>
              </div>
              <span
                class="recent-amount"
                :class="
                  tx.type === 'INCOME' || tx.type === 'income' ? 'tone-income' : 'tone-expense'
                "
              >
                {{ formatter(parseAmount(tx.amount).value, wallet.currency) }}
              </span>
            </li>
          </ul>
          <div v-else class="recent-empty">
            {{ t('No transactions yet on this wallet.') }}
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import * as LucideIcons from 'lucide-vue-next';
import {
  Edit3,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Activity
} from 'lucide-vue-next';
import { parseAmount } from '@/utils/currency';

const { t, locale } = useI18n();

const props = defineProps({
  wallet: { type: Object, default: null },
  isDefault: { type: Boolean, default: false },
  transactions: { type: Array, default: () => [] },
  formatter: { type: Function, default: (n, cur) => `${Math.round(n)} ${cur || ''}` },
  showBack: { type: Boolean, default: false }
});

defineEmits(['edit', 'delete', 'back']);

const chartW = 720;
const chartH = 200;

const displayType = computed(() => {
  if (!props.wallet?.type) return '';
  const type = props.wallet.type.toLowerCase();
  const map = {
    bank_account: t('Bank account'),
    cash: t('Cash'),
    credit_card: t('Credit card'),
    debit_card: t('Debit card'),
    digital_wallet: t('Digital wallet'),
    savings: t('Savings')
  };
  return (
    map[type] ||
    props.wallet.type.charAt(0).toUpperCase() + props.wallet.type.slice(1).toLowerCase()
  );
});

const netValue = computed(() => {
  if (!props.wallet) return 0;
  return (
    Number(props.wallet.stats?.total_income || 0) - Number(props.wallet.stats?.total_expense || 0)
  );
});

const netTone = computed(() => {
  if (!props.wallet) return 'surface--brand';
  if (netValue.value > 0) return 'surface--income';
  if (netValue.value < 0) return 'surface--expense';
  return 'surface--brand';
});

const resolvedIcon = computed(() => {
  const icon = props.wallet?.icon;
  let v = '';
  if (icon) {
    if (typeof icon === 'string') v = icon;
    else if (icon.path) v = icon.path;
    else if (icon.content) v = icon.content;
  }
  return (v && LucideIcons[v]) || LucideIcons.Wallet;
});

const walletTransactions = computed(() => {
  if (!props.wallet) return [];
  return props.transactions
    .filter((tx) => tx.walletId === props.wallet.id)
    .sort(
      (a, b) => new Date(b.date || b.datetime).getTime() - new Date(a.date || a.datetime).getTime()
    );
});

const recentTransactions = computed(() => walletTransactions.value.slice(0, 6));

const monthly = computed(() => {
  const out = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: new Intl.DateTimeFormat(locale.value, { month: 'short' }).format(d),
      income: 0,
      expense: 0
    });
  }
  walletTransactions.value.forEach((tx) => {
    const txDate = new Date(tx.date || tx.datetime);
    const key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
    const bucket = out.find((m) => m.key === key);
    if (!bucket) return;
    const v = parseAmount(tx.amount).value;
    if (tx.type === 'INCOME' || tx.type === 'income') bucket.income += v;
    else bucket.expense += v;
  });
  return out;
});

const maxMonthValue = computed(() => {
  let max = 0;
  monthly.value.forEach((m) => {
    max = Math.max(max, m.income, m.expense);
  });
  return max || 1;
});

const hasActivity = computed(() => maxMonthValue.value > 0);

const xAt = (i) => {
  const padding = 8;
  const span = chartW - padding * 2;
  return padding + (span * i) / Math.max(monthly.value.length - 1, 1);
};

const yAt = (v) => {
  const padding = 12;
  const span = chartH - padding * 2 - 14;
  return padding + span * (1 - v / maxMonthValue.value);
};

const linePoints = (key) => monthly.value.map((m, i) => `${xAt(i)},${yAt(m[key])}`).join(' ');

const formatDate = (val) => {
  if (!val) return '';
  const d = new Date(val);
  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d);
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.detail {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 100%;

  &--empty {
    align-items: center;
    justify-content: center;
    padding: $spacing-8 $spacing-6;
    min-height: 320px;
  }
}

.empty {
  text-align: center;
  max-width: 340px;
  color: $text-muted;
}

.empty-illustration {
  width: 160px;
  height: 160px;
  margin-bottom: $spacing-3;
  animation: wempty-float 6s $easing-standard infinite;
}

@keyframes wempty-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.empty-title {
  font-size: $font-size-base;
  font-weight: $font-bold;
  color: $text-primary;
  margin: 0 0 $spacing-1;
  letter-spacing: -0.01em;
}

.empty-sub {
  font-size: $font-size-sm;
  margin: 0;
  line-height: 1.5;
}

.detail-body {
  display: flex;
  flex-direction: column;
}

.wallet-swap-enter-active,
.wallet-swap-leave-active {
  transition:
    opacity $duration-base $easing-standard,
    transform $duration-base $easing-emphasized;
}
.wallet-swap-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.wallet-swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.hero {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  min-height: 52px;
  border-bottom: 1px solid $border-light;
  overflow: hidden;
}

.hero-decor {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.hero > *:not(.hero-decor) {
  position: relative;
  z-index: 1;
}

.back-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--glass-bg);
  border: 1px solid $border-light;
  color: var(--surface-deep);
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color $duration-fast $easing-standard;
  flex-shrink: 0;

  &:hover {
    background: var(--glass-bg-strong);
  }

  @media (max-width: $breakpoint-md) {
    display: inline-flex;
  }
}

.hero-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--glass-bg);
  border: 1px solid $border-light;
  color: var(--surface-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.hero-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  line-height: 1.2;
}

.hero-name-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.hero-name {
  margin: 0;
  font-size: $font-size-base;
  font-weight: $font-bold;
  color: var(--surface-ink);
  letter-spacing: -0.015em;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-default-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px 1px 5px;
  background: var(--glass-bg);
  border: 1px solid $border-light;
  color: var(--surface-deep);
  border-radius: 6px;
  font-size: 10px;
  font-weight: $font-bold;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.hero-sub {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  font-size: 11px;
  color: var(--surface-ink);
  opacity: 0.7;
  font-weight: $font-medium;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hero-currency {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: $font-bold;
  color: var(--surface-deep);
  opacity: 0.85;
  font-variant-numeric: tabular-nums;
}

.hero-dot {
  opacity: 0.6;
}

.hero-actions {
  display: inline-flex;
  gap: 2px;
  flex-shrink: 0;
}

.hero-action {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: var(--surface-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color $duration-fast $easing-standard,
    color $duration-fast $easing-standard;

  &:hover {
    background: var(--glass-bg);
  }

  &--danger:hover {
    color: var(--color-expense);
    background: rgba(var(--color-expense-rgb), 0.1);
  }
}

.totals {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid $border-light;
}

.total {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
  line-height: 1.2;
}

.total-label {
  font-size: 10px;
  font-weight: $font-bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $text-muted;
}

.total-value {
  margin: 0;
  font-size: $font-size-sm;
  font-weight: $font-bold;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.005em;
  color: $text-primary;
}

.total-divider {
  width: 1px;
  height: 22px;
  background: $border-light;
}

.tone-income {
  color: var(--color-income);
}
.tone-expense {
  color: var(--color-expense);
}

.chart-card,
.recent {
  padding: 12px 14px;
  border-bottom: 1px solid $border-light;

  &:last-child {
    border-bottom: none;
  }
}

.chart-head,
.recent-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: $spacing-3;
}

.chart-eyebrow,
.recent-eyebrow {
  font-size: 11px;
  font-weight: $font-bold;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: $text-muted;
}

.chart-title,
.recent-title {
  margin: 2px 0 0;
  font-size: $font-size-base;
  font-weight: $font-bold;
  color: $text-primary;
  letter-spacing: -0.01em;
}

.chart-legend {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: $font-semibold;
  color: $text-muted;
  white-space: nowrap;
}

.legend-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 4px;
  margin-right: 2px;

  &--income {
    background: var(--color-income);
  }
  &--expense {
    background: var(--color-expense);
  }
}

.chart-svg {
  width: 100%;
  height: 180px;
  display: block;

  @media (max-width: $breakpoint-md) {
    height: 140px;
  }
}

.chart-grid {
  stroke: $border-light;
}

.chart-axis {
  font-size: 10px;
  fill: $text-muted;
  font-family: $font-family-sans;
  font-variant-numeric: tabular-nums;
}

.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: $spacing-4;
  font-size: $font-size-sm;
  color: $text-muted;

  svg {
    opacity: 0.5;
  }
}

.recent-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  color: $primary;
  text-decoration: none;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background-color $duration-fast $easing-standard;

  &:hover {
    background: $primary-light;
  }
}

.recent-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.recent-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-3;
  padding: $spacing-2 0;
  border-bottom: 1px solid $border-light;

  &:last-child {
    border-bottom: none;
  }
}

.recent-row-left {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  min-width: 0;
  flex: 1;
}

.recent-type {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &.tone-income {
    background: rgba(var(--color-income-rgb), 0.12);
  }
  &.tone-expense {
    background: rgba(var(--color-expense-rgb), 0.12);
  }
}

.recent-text {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
  flex: 1;
}

.recent-name {
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-date {
  font-size: 11px;
  color: $text-muted;
  font-variant-numeric: tabular-nums;
}

.recent-amount {
  font-size: $font-size-sm;
  font-weight: $font-bold;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.recent-empty {
  padding: $spacing-3 0;
  text-align: center;
  font-size: $font-size-sm;
  color: $text-muted;
}
</style>
