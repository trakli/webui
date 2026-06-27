<template>
  <div class="fp">
    <header class="fp-head">
      <div class="fp-head-text">
        <h2 class="fp-title">{{ t('Financial position') }}</h2>
        <p class="fp-subtitle">
          {{ t('Where your money came from and where it went, grouped by what it really was.') }}
        </p>
      </div>

      <div v-if="!props.params" class="fp-presets">
        <button
          v-for="p in presets"
          :key="p.value"
          type="button"
          class="fp-preset"
          :class="{ 'fp-preset--active': preset === p.value }"
          @click="preset = p.value"
        >
          {{ t(p.label) }}
        </button>
      </div>
    </header>

    <p v-if="partial" class="fp-note" role="status">
      {{
        t(
          'Some amounts could not be converted to your default currency and were left out, so figures may be understated. Affected: {currencies}.',
          { currencies: unconvertedCurrencies.join(', ') }
        )
      }}
    </p>

    <LoadingSkeleton v-if="isLoading && !position" variant="card" :count="3" />

    <template v-else-if="position && hasAny">
      <section class="fp-hero surface" :class="netSurface">
        <div class="fp-hero-headline">
          <span class="eyebrow">{{ t('Net worth change') }}</span>
          <div class="fp-hero-value-row">
            <p class="fp-hero-value">{{ signedMoney(position.net_worth_delta) }}</p>
            <span class="fp-hero-pill">
              <component
                :is="position.net_worth_delta >= 0 ? TrendingUp : TrendingDown"
                :size="14"
              />
              {{ position.net_worth_delta >= 0 ? t('Building') : t('Shrinking') }}
            </span>
          </div>
          <p class="fp-hero-sub">
            {{
              t(
                'Real earnings, returns and gifts, minus real spend. Borrowed money and money parked in investments do not count.'
              )
            }}
          </p>
        </div>

        <div class="fp-hero-scales">
          <div class="fp-scale">
            <span class="fp-scale-label">{{ t('Money in') }}</span>
            <span class="fp-scale-value fp-up">{{ money(totalIn) }}</span>
          </div>
          <span class="fp-scale-arrow"><ArrowRight :size="18" /></span>
          <div class="fp-scale">
            <span class="fp-scale-label">{{ t('Money out') }}</span>
            <span class="fp-scale-value fp-down">{{ money(totalOut) }}</span>
          </div>
        </div>
      </section>

      <NuxtLink to="/holdings" class="fp-worth surface tone-card">
        <div class="fp-worth-main">
          <span class="eyebrow">{{ t('Total net worth now') }}</span>
          <p class="fp-worth-value">{{ money(position.total_net_worth) }}</p>
        </div>
        <div class="fp-worth-split">
          <div class="fp-worth-part">
            <Wallet :size="15" />
            <span class="fp-worth-part-label">{{ t('Cash') }}</span>
            <span class="fp-worth-part-value">{{ money(position.cash_balance) }}</span>
          </div>
          <div class="fp-worth-part">
            <Coins :size="15" />
            <span class="fp-worth-part-label">{{ t('Holdings') }}</span>
            <span class="fp-worth-part-value">{{ money(position.holdings_value) }}</span>
          </div>
          <ChevronRight :size="16" class="fp-worth-go" />
        </div>
      </NuxtLink>

      <div class="fp-ledger">
        <section class="fp-col surface tone-card">
          <header class="fp-col-head">
            <span class="fp-col-ico fp-col-ico--in"><ArrowDownLeft :size="16" /></span>
            <h3 class="fp-col-title">{{ t('Money in') }}</h3>
            <span class="fp-col-total fp-up">{{ money(totalIn) }}</span>
          </header>
          <ul class="fp-rows">
            <li v-for="row in moneyIn" :key="row.key">
              <button
                type="button"
                class="fp-row"
                :class="{ 'fp-row--neutral': !row.counts }"
                @click="openDrill(row)"
              >
                <span class="fp-row-marker" :style="{ background: row.color }" />
                <span class="fp-row-ico"><component :is="row.icon" :size="16" /></span>
                <span class="fp-row-text">
                  <span class="fp-row-label">{{ row.label }}</span>
                  <span v-if="!row.counts" class="fp-row-tag">{{ t('cash, not net worth') }}</span>
                </span>
                <span class="fp-row-figure">
                  <span class="fp-row-amount">{{ money(row.value) }}</span>
                  <span class="fp-row-bar"
                    ><span
                      class="fp-row-fill"
                      :style="{ width: barPct(row, maxIn), background: row.color }"
                  /></span>
                </span>
                <ChevronRight :size="15" class="fp-row-chevron" />
              </button>
            </li>
          </ul>
        </section>

        <section class="fp-col surface tone-card">
          <header class="fp-col-head">
            <span class="fp-col-ico fp-col-ico--out"><ArrowUpRight :size="16" /></span>
            <h3 class="fp-col-title">{{ t('Money out') }}</h3>
            <span class="fp-col-total fp-down">{{ money(totalOut) }}</span>
          </header>
          <ul class="fp-rows">
            <li v-for="row in moneyOut" :key="row.key">
              <button
                type="button"
                class="fp-row"
                :class="{ 'fp-row--neutral': !row.counts }"
                @click="openDrill(row)"
              >
                <span class="fp-row-marker" :style="{ background: row.color }" />
                <span class="fp-row-ico"><component :is="row.icon" :size="16" /></span>
                <span class="fp-row-text">
                  <span class="fp-row-label">{{ row.label }}</span>
                  <span v-if="!row.counts" class="fp-row-tag">{{ t('cash, not net worth') }}</span>
                </span>
                <span class="fp-row-figure">
                  <span class="fp-row-amount">{{ money(row.value) }}</span>
                  <span class="fp-row-bar"
                    ><span
                      class="fp-row-fill"
                      :style="{ width: barPct(row, maxOut), background: row.color }"
                  /></span>
                </span>
                <ChevronRight :size="15" class="fp-row-chevron" />
              </button>
            </li>
          </ul>
        </section>
      </div>

      <p class="fp-foot">
        <Info :size="14" />
        {{
          t(
            'Greyed rows move cash but not net worth: borrowed money, debt, and money parked in investments.'
          )
        }}
      </p>
    </template>

    <div v-else class="fp-empty">
      <PiggyBank :size="44" class="fp-empty-ico" />
      <p>{{ t('No data for this period yet.') }}</p>
    </div>

    <FinancialPositionDrill
      :open="drillOpen"
      :group="activeGroup"
      :range="drillRange"
      @close="drillOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  Wallet,
  ShoppingBag,
  PiggyBank,
  Landmark,
  HandCoins,
  TrendingUp,
  TrendingDown,
  Gift,
  Coins,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRight,
  Info
} from 'lucide-vue-next';
import LoadingSkeleton from '@/components/LoadingSkeleton.vue';
import FinancialPositionDrill, {
  type DrillGroup
} from '@/components/financial-position/FinancialPositionDrill.vue';
import { statsApi, type StatsParams, type PositionData } from '@/services/api/statsApi';
import { formatShortAmount } from '@/utils/currency';

const { t } = useI18n();

const props = defineProps<{
  params?: StatsParams | null;
}>();

const presets = [
  { value: 'current_month', label: 'This month' },
  { value: 'last_3_months', label: 'Last 3 months' },
  { value: 'all_time', label: 'All time' }
] as const;

const preset = ref<StatsParams['preset']>('current_month');
const position = ref<PositionData | null>(null);
const currency = ref('');
const partial = ref(false);
const unconvertedCurrencies = ref<string[]>([]);
const isLoading = ref(false);

const drillOpen = ref(false);
const activeGroup = ref<DrillGroup | null>(null);

const COLOR = {
  income: 'var(--color-income, #16a34a)',
  expense: 'var(--color-expense, #dc2626)',
  returns: '#0ea5e9',
  gifts: '#7c3aed',
  loan: '#d97706',
  principal: '#6366f1'
};

const effectiveParams = computed<StatsParams>(() =>
  props.params ? { ...props.params } : { preset: preset.value }
);

const money = (n: number) =>
  formatShortAmount(`${Math.round((n || 0) * 100) / 100} ${currency.value}`);
const signedMoney = (n: number) => (n > 0 ? '+' : '') + money(n);

const netSurface = computed(() =>
  (position.value?.net_worth_delta ?? 0) >= 0 ? 'surface--income' : 'surface--expense'
);

interface LedgerRow {
  key: string;
  label: string;
  value: number;
  color: string;
  tone: string;
  icon: unknown;
  counts: boolean;
  intents: string[];
  type?: 'income' | 'expense';
}

const moneyIn = computed<LedgerRow[]>(() => {
  const p = position.value;
  if (!p) return [];
  return (
    [
      {
        key: 'earned',
        label: t('Earned income'),
        value: p.earned_income,
        color: COLOR.income,
        tone: 'income',
        icon: Wallet,
        counts: true,
        intents: ['regular'],
        type: 'income'
      },
      {
        key: 'returns',
        label: t('Investment returns'),
        value: p.investment_returns,
        color: COLOR.returns,
        tone: 'investment',
        icon: TrendingUp,
        counts: true,
        intents: ['investment_return'],
        type: 'income'
      },
      {
        key: 'gift',
        label: t('Gifts received'),
        value: p.gifts_received,
        color: COLOR.gifts,
        tone: 'gift',
        icon: Gift,
        counts: true,
        intents: ['gift'],
        type: 'income'
      },
      {
        key: 'loan_in',
        label: t('Loan received'),
        value: p.loan_received,
        color: COLOR.loan,
        tone: 'loan',
        icon: Landmark,
        counts: false,
        intents: ['loan_received'],
        type: 'income'
      },
      {
        key: 'debt_in',
        label: t('Debt repaid to you'),
        value: p.debt_owed,
        color: COLOR.loan,
        tone: 'loan',
        icon: HandCoins,
        counts: false,
        intents: ['debt_owed'],
        type: 'income'
      }
    ] as LedgerRow[]
  ).filter((r) => r.value > 0);
});

const moneyOut = computed<LedgerRow[]>(() => {
  const p = position.value;
  if (!p) return [];
  return (
    [
      {
        key: 'spend',
        label: t('Discretionary spend'),
        value: p.discretionary_spend,
        color: COLOR.expense,
        tone: 'expense',
        icon: ShoppingBag,
        counts: true,
        intents: ['regular'],
        type: 'expense'
      },
      {
        key: 'invested',
        label: t('Invested'),
        value: p.investment_principal,
        color: COLOR.principal,
        tone: 'investment',
        icon: TrendingUp,
        counts: false,
        intents: ['investment_buy'],
        type: 'expense'
      },
      {
        key: 'loan_out',
        label: t('Loan repayment'),
        value: p.loan_repayment,
        color: COLOR.loan,
        tone: 'loan',
        icon: Landmark,
        counts: false,
        intents: ['loan_repayment'],
        type: 'expense'
      },
      {
        key: 'debt_out',
        label: t('Debt settled'),
        value: p.debt_settled,
        color: COLOR.loan,
        tone: 'loan',
        icon: HandCoins,
        counts: false,
        intents: ['debt_settled'],
        type: 'expense'
      }
    ] as LedgerRow[]
  ).filter((r) => r.value > 0);
});

const totalIn = computed(() => moneyIn.value.reduce((sum, r) => sum + r.value, 0));
const totalOut = computed(() => moneyOut.value.reduce((sum, r) => sum + r.value, 0));
const maxIn = computed(() => Math.max(1, ...moneyIn.value.map((r) => r.value)));
const maxOut = computed(() => Math.max(1, ...moneyOut.value.map((r) => r.value)));
const barPct = (row: LedgerRow, max: number) => `${Math.max(6, (row.value / max) * 100)}%`;

const drillRange = computed<{ date_from?: string; date_to?: string }>(() => {
  if (props.params?.start_date) {
    return { date_from: props.params.start_date, date_to: props.params.end_date };
  }
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const now = new Date();
  if (preset.value === 'current_month') {
    return { date_from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), date_to: iso(now) };
  }
  if (preset.value === 'last_3_months') {
    return {
      date_from: iso(new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())),
      date_to: iso(now)
    };
  }
  return {};
});

function openDrill(row: LedgerRow) {
  activeGroup.value = {
    key: row.key,
    label: row.label,
    eyebrow: row.type === 'income' ? t('Money in') : t('Money out'),
    intents: row.intents,
    type: row.type,
    tone: row.tone,
    hint: row.counts ? undefined : t('Moves cash, but not your net worth.'),
    metric: money(row.value),
    icon: row.icon
  };
  drillOpen.value = true;
}

const hasAny = computed(() => totalIn.value > 0 || totalOut.value > 0);

async function load() {
  isLoading.value = true;
  try {
    const res = await statsApi.fetch({ ...effectiveParams.value, section: 'position' });
    position.value = res.data?.position ?? null;
    currency.value = (res.data as { currency?: string })?.currency || currency.value;
    partial.value = !!res.data?.partial;
    unconvertedCurrencies.value = res.data?.unconverted_currencies || [];
  } finally {
    isLoading.value = false;
  }
}

watch(effectiveParams, load, { deep: true, immediate: true });
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_surfaces.scss' as *;

.fp {
  display: flex;
  flex-direction: column;
  gap: $spacing-5;
}

.fp-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $spacing-4;
  flex-wrap: wrap;
}

.fp-title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-semibold;
  color: $text-primary;
}

.fp-subtitle {
  margin: 4px 0 0;
  color: $text-muted;
  font-size: $font-size-sm;
  max-width: 54ch;
}

.fp-presets {
  display: inline-flex;
  padding: 3px;
  gap: 2px;
  background: $bg-light;
  border-radius: 999px;
}

.fp-preset {
  padding: 6px 14px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: $text-muted;
  font-size: $font-size-sm;
  font-weight: $font-medium;
  cursor: pointer;
  transition: all $duration-base $easing-standard;

  &--active {
    background: $bg-white;
    color: $text-primary;
    box-shadow: $elevation-1;
  }
}

.fp-note {
  margin: 0;
  padding: $spacing-3 $spacing-4;
  border-radius: $radius-lg;
  background: rgba(245, 158, 11, 0.12);
  color: #92400e;
  font-size: $font-size-sm;
}

.fp-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: $spacing-5;
  padding: $spacing-5 $spacing-6;
  background: var(--surface-bg);
  border: 1px solid var(--color-border-light);
  border-radius: 20px;
  box-shadow: $elevation-1;
}

.fp-hero-headline {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 240px;
  flex: 1;
}

.fp-hero-value-row {
  display: flex;
  align-items: baseline;
  gap: $spacing-2;
  flex-wrap: wrap;
}

.fp-hero-value {
  margin: 0;
  font-size: 2.4rem;
  font-weight: $font-bold;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  line-height: 1.02;
  color: var(--surface-deep);

  @media (max-width: $breakpoint-sm) {
    font-size: 1.8rem;
  }
}

.fp-hero-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: $font-bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--glass-bg-strong);
  color: var(--surface-deep);
}

.fp-hero-sub {
  margin: 2px 0 0;
  font-size: $font-size-sm;
  color: $text-secondary;
  max-width: 46ch;
}

.fp-hero-scales {
  display: flex;
  align-items: center;
  gap: $spacing-4;
  padding: $spacing-3 $spacing-4;
  border-radius: 16px;
  background: var(--glass-bg-strong);
}

.fp-scale {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fp-scale-label {
  font-size: 10px;
  font-weight: $font-bold;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: $text-muted;
}

.fp-scale-value {
  font-size: $font-size-lg;
  font-weight: $font-bold;
  font-variant-numeric: tabular-nums;
}

.fp-scale-arrow {
  color: $text-muted;
}

.fp-worth {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: $spacing-4;
  padding: $spacing-4 $spacing-5;
  text-decoration: none;
  color: inherit;
}

.fp-worth-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fp-worth-value {
  margin: 0;
  font-size: 1.6rem;
  font-weight: $font-bold;
  font-variant-numeric: tabular-nums;
  color: $text-primary;
}

.fp-worth-split {
  display: flex;
  align-items: center;
  gap: $spacing-4;
  color: $text-secondary;
}

.fp-worth-part {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: $font-size-sm;
}

.fp-worth-part-label {
  color: $text-muted;
}

.fp-worth-part-value {
  font-weight: $font-semibold;
  font-variant-numeric: tabular-nums;
  color: $text-primary;
}

.fp-worth-go {
  color: $text-muted;
}

.fp-ledger {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-4;

  @media (min-width: $breakpoint-md) {
    grid-template-columns: 1fr 1fr;
  }
}

.fp-col {
  padding: $spacing-4 $spacing-5 $spacing-5;
}

.fp-col-head {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding-bottom: $spacing-3;
  margin-bottom: $spacing-2;
  border-bottom: 1px solid $border-light;
}

.fp-col-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 9px;

  &--in {
    background: var(--color-income-soft);
    color: var(--color-income);
  }
  &--out {
    background: var(--color-expense-soft);
    color: var(--color-expense);
  }
}

.fp-col-title {
  margin: 0;
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: $text-secondary;
}

.fp-col-total {
  margin-left: auto;
  font-size: $font-size-lg;
  font-weight: $font-bold;
  font-variant-numeric: tabular-nums;
}

.fp-rows {
  list-style: none;
  margin: 0;
  padding: 0;
}

.fp-row {
  display: grid;
  grid-template-columns: 4px 28px 1fr auto 16px;
  align-items: center;
  gap: $spacing-3;
  width: 100%;
  padding: $spacing-3 0;
  border: none;
  border-bottom: 1px solid $border-light;
  background: transparent;
  text-align: left;
  font: inherit;
  cursor: pointer;
  transition: background $duration-base $easing-standard;

  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: var(--color-bg-light, #f8fafc);
  }
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
    border-radius: 8px;
  }
}

.fp-row--neutral {
  opacity: 0.72;
}

.fp-row-marker {
  width: 4px;
  height: 28px;
  border-radius: 999px;
}

.fp-row-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: $bg-light;
  color: $text-secondary;
}

.fp-row-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.fp-row-label {
  font-size: $font-size-sm;
  font-weight: $font-medium;
  color: $text-primary;
}

.fp-row-tag {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: $text-muted;
}

.fp-row-figure {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  min-width: 96px;
}

.fp-row-amount {
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  font-variant-numeric: tabular-nums;
  color: $text-primary;
}

.fp-row-bar {
  display: block;
  width: 88px;
  height: 5px;
  border-radius: 999px;
  background: $bg-light;
  overflow: hidden;
}

.fp-row-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
}

.fp-row-chevron {
  color: $text-muted;
}

.fp-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 11px;
  color: $text-muted;
}

.fp-up {
  color: var(--color-income, #16a34a);
}

.fp-down {
  color: var(--color-expense, #dc2626);
}

.fp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-6;
  text-align: center;
  color: $text-muted;
  font-size: $font-size-sm;
  background: $bg-white;
  border: 1px dashed $border-color;
  border-radius: 18px;
}

.fp-empty-ico {
  color: var(--color-border-medium, #cbd5e1);
}
</style>
