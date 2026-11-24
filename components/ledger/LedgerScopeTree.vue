<template>
  <aside class="lt" :aria-label="t('Wallets and spending')">
    <section>
      <h2 class="lt-h">{{ t('Wallets') }}</h2>
      <NuxtLink :to="onLedger ? '/transactions' : '/dashboard'" class="lt-node" :aria-current="allCurrent ? 'page' : undefined">
        <Layers />
        <span class="lt-name">{{ t('All wallets') }}</span>
        <span class="lt-num">{{ walletAmount(kpis.netWorth, base, locale) }}</span>
      </NuxtLink>
      <NuxtLink
        v-for="wallet in walletRows"
        :key="wallet.id"
        :to="`/transactions?wallet=${wallet.id}`"
        class="lt-node"
        :aria-current="onLedger && scopedWallet === wallet.id ? 'page' : undefined"
        data-testid="ledger-tree-wallet"
      >
        <component :is="wallet.icon" />
        <span class="lt-name">{{ wallet.name }}</span>
        <span class="lt-num">{{ walletAmount(wallet.balance, wallet.currency, locale) }}</span>
      </NuxtLink>
    </section>

    <section v-if="spending.length">
      <h2 class="lt-h">{{ spentHeading }}</h2>
      <NuxtLink
        v-for="row in spending.slice(0, 8)"
        :key="row.name"
        to="/reports"
        class="lt-cat"
      >
        <span class="lt-name">{{ row.name }}</span>
        <span class="lt-num">{{ money(row.amount, base, locale, { whole: row.amount >= 1000 }) }}</span>
        <span class="lt-bar"><i :style="{ width: `${(row.amount / topSpend) * 100}%` }" /></span>
      </NuxtLink>
    </section>

    <section v-if="payees.length">
      <h2 class="lt-h">{{ t('Paid most') }}</h2>
      <NuxtLink v-for="row in payees.slice(0, 4)" :key="row.name" to="/parties" class="lt-cat">
        <span class="lt-name">{{ row.name }}</span>
        <span class="lt-num">{{ money(row.amount, base, locale, { whole: row.amount >= 1000 }) }}</span>
      </NuxtLink>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { Banknote, CreditCard, Landmark, Layers, Smartphone, Wallet } from 'lucide-vue-next';
import { useLedgerOverview } from '@/composables/useLedgerOverview';
import { useSharedData } from '@/composables/useSharedData';
import { money, walletAmount } from '@/utils/ledgerMoney';

const { t, locale } = useI18n();
const route = useRoute();
const { wallets } = useSharedData();
const { base, kpis, spending, payees, period, span, loadStats } = useLedgerOverview();

const ICONS: Record<string, unknown> = {
  bank: Landmark,
  cash: Banknote,
  credit_card: CreditCard,
  mobile: Smartphone
};

const walletRows = computed(() =>
  (wallets.value ?? []).map((wallet: any) => ({
    id: wallet.id,
    name: wallet.name,
    currency: wallet.currency,
    balance: Number(wallet.balance) || 0,
    icon: ICONS[wallet.type] ?? Wallet
  }))
);

const onLedger = computed(() => route.path === '/transactions');
const scopedWallet = computed(() => Number(route.query.wallet) || null);
const allCurrent = computed(() =>
  onLedger.value ? scopedWallet.value === null : route.path === '/dashboard'
);

const topSpend = computed(() => Math.max(1, ...spending.value.map((row) => row.amount)));

const spentHeading = computed(() => {
  if (period.value === 'month') {
    const month = span.value.start.toLocaleString(locale.value, { month: 'long' });
    return t('Spent in {month}', { month });
  }
  return period.value === 'quarter' ? t('Spent this quarter') : t('Spent this year');
});

onMounted(() => loadStats());
</script>

<style scoped>
.lt {
  border-right: 1px solid var(--ledger-line);
  overflow: auto;
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  font-size: 13px;
  width: 232px;
  flex: none;
  background: var(--ledger-bg);
}

.lt-h {
  margin: 0 0 4px;
  padding: 0 6px;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ledger-ink-3);
}

.lt-node {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: var(--ledger-r-sm);
  color: var(--ledger-ink-2);
  text-decoration: none;
}

.lt-node:hover,
.lt-cat:hover {
  background: var(--ledger-surface-2);
}

.lt-node[aria-current='page'] {
  background: var(--ledger-surface);
  box-shadow: inset 0 0 0 1px var(--ledger-line);
  color: var(--ledger-ink);
  font-weight: 600;
}

.lt-node :deep(svg) {
  width: 15px;
  height: 15px;
  flex: none;
}

.lt-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lt-num {
  margin-left: auto;
  font-family: var(--ledger-mono);
  font-size: 12px;
  color: var(--ledger-ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.lt-cat {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 4px 8px;
  padding: 5px 6px;
  border-radius: var(--ledger-r-sm);
  font-size: 12.5px;
  color: var(--ledger-ink-2);
  text-decoration: none;
}

.lt-bar {
  grid-column: 1 / -1;
  height: 3px;
  background: var(--ledger-surface-3);
  border-radius: 2px;
  overflow: hidden;
}

.lt-bar i {
  display: block;
  height: 100%;
  background: var(--ledger-brand);
}
</style>
