<template>
  <LedgerWorkspace
    :title="formOpen ? formTitle : t('People')"
    :subtitle="formOpen ? '' : subtitle"
    :inspector-label="t('Person details')"
    data-testid="ledger-people"
  >
    <template #actions>
      <template v-if="!formOpen">
        <div class="lp-search">
          <Search />
          <input
            v-model="query"
            type="search"
            :placeholder="t('Search people')"
            :aria-label="t('Search people')"
          />
        </div>
        <button type="button" class="lp-btn lp-btn--o" @click="emit('create')">
          <UserPlus />{{ t('Add person') }}
        </button>
      </template>
    </template>

    <slot v-if="formOpen" name="form" />

    <template v-else>
      <div class="lp-wrap">
        <table v-if="rows.length" class="lp-table">
          <thead>
            <tr>
              <th>{{ t('Person') }}</th>
              <th>{{ t('Balance') }}</th>
              <th class="lp-r lp-hide-sm">{{ t('Paid them') }}</th>
              <th class="lp-r lp-hide-md">{{ t('Got from them') }}</th>
              <th class="lp-hide-sm">{{ t('Last activity') }}</th>
              <th class="lp-r lp-hide-md">{{ t('Entries') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="row.id"
              :class="{ 'lp-sel': row.id === selectedId }"
              tabindex="0"
              data-testid="ledger-person-row"
              @click="selectedId = row.id"
              @keydown.enter="selectedId = row.id"
            >
              <td>
                <span class="lp-person">
                  <span class="lp-sq">{{ row.initials }}</span>
                  <span
                    >{{ row.name }}<small>{{ row.typeLabel }}</small></span
                  >
                </span>
              </td>
              <td>
                <span
                  v-for="debt in row.debts"
                  :key="debt.currency"
                  class="lp-chip"
                  :class="`lp-chip--${tone(debt.net)}`"
                >
                  {{ debtLabel(debt.net, debt.currency) }}
                </span>
                <span v-if="!row.debts.length" class="lp-muted">—</span>
              </td>
              <td class="lp-r lp-num lp-hide-sm">
                {{ row.paid ? money(row.paid, base, locale) : '' }}
              </td>
              <td class="lp-r lp-num lp-hide-md lp-in">
                {{ row.got ? money(row.got, base, locale) : '' }}
              </td>
              <td class="lp-muted lp-hide-sm">
                {{ row.last ? relative(row.last) : t('No recent activity') }}
              </td>
              <td class="lp-r lp-num lp-hide-md">{{ row.count || '' }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="parties.length && !rows.length" class="lp-empty">
          {{ t('No parties match your search.') }}
        </p>
        <slot v-if="!parties.length" name="empty" />
        <p v-if="currencyNote" class="lp-note">{{ currencyNote }}</p>
      </div>
    </template>

    <template #inspector>
      <template v-if="selected">
        <div class="lp-head">
          <span class="lp-sq lp-sq--lg">{{ selected.initials }}</span>
          <div>
            <div class="lp-name">{{ selected.name }}</div>
            <div class="lp-muted">
              {{ t('{count} entries in 3 months', { count: selected.count }, selected.count) }}
            </div>
          </div>
        </div>

        <div v-for="debt in selected.debts" :key="debt.currency" class="lp-debt">
          <div class="lp-amt" :class="debt.net < 0 ? 'lp-in' : debt.net > 0 ? 'lp-neg' : ''">
            {{
              Math.abs(debt.net) < 0.005
                ? t('Settled')
                : money(Math.abs(debt.net), debt.currency, locale)
            }}
          </div>
          <p class="lp-muted">
            {{
              debt.net < -0.005
                ? t('{name} owes you', { name: firstName(selected.name) })
                : debt.net > 0.005
                  ? t('You owe {name}', { name: firstName(selected.name) })
                  : t('Nothing owed either way')
            }}
          </p>
          <template v-if="debt.net < -0.005 && debt.repaid > 0">
            <span class="lp-bar"
              ><i :style="{ width: `${Math.min(100, (debt.repaid / debt.lent) * 100)}%` }"
            /></span>
            <p class="lp-muted">
              {{
                t('{paid} of {lent} paid back', {
                  paid: money(debt.repaid, debt.currency, locale),
                  lent: money(debt.lent, debt.currency, locale)
                })
              }}
            </p>
          </template>
        </div>

        <form v-if="settling" class="lp-settle" @submit.prevent="saveSettle">
          <h2 class="lp-h">{{ settling.net < 0 ? t('Record payback') : t('Pay back') }}</h2>
          <label>
            {{ t('Amount') }}
            <input v-model.number="settleAmount" type="number" min="0.01" step="0.01" required />
          </label>
          <label>
            {{ t('Wallet') }}
            <select v-model="settleWallet" required>
              <option
                v-for="wallet in walletsIn(settling.currency)"
                :key="wallet.id"
                :value="wallet.id"
              >
                {{ wallet.name }}
              </option>
            </select>
          </label>
          <div class="lp-actions">
            <button type="submit" class="lp-btn" :disabled="saving">{{ t('Save') }}</button>
            <button type="button" class="lp-btn lp-btn--o" @click="settling = null">
              {{ t('Cancel') }}
            </button>
          </div>
        </form>

        <div>
          <h2 class="lp-h">{{ t('History') }}</h2>
          <ul class="lp-tl">
            <li v-for="item in history" :key="item.key" :class="`lp-tl--${item.tone}`">
              <span>{{ item.text }}</span>
              <span class="lp-num lp-muted">{{ item.date }}</span>
            </li>
          </ul>
          <p v-if="!history.length" class="lp-muted">{{ t('No recent activity') }}</p>
        </div>

        <div v-if="!settling" class="lp-actions">
          <template v-for="debt in selected.debts" :key="debt.currency">
            <button
              v-if="Math.abs(debt.net) >= 0.005"
              type="button"
              class="lp-btn"
              @click="startSettle(debt)"
            >
              <HandCoins />{{ debt.net < 0 ? t('Record payback') : t('Pay back') }}
            </button>
          </template>
          <NuxtLink
            :to="{ path: '/transactions', query: {} }"
            class="lp-btn lp-btn--o"
            @click="searchLedger(selected.name)"
          >
            <List />{{ t('See entries') }}
          </NuxtLink>
          <button type="button" class="lp-btn lp-btn--o" @click="emit('edit', selected.party)">
            <Pencil />{{ t('Edit') }}
          </button>
          <button
            type="button"
            class="lp-btn lp-btn--danger"
            @click="emit('delete', selected.party)"
          >
            <Trash2 />{{ t('Delete') }}
          </button>
        </div>
      </template>
      <p v-else class="lp-muted">{{ t('Pick a person to see what you owe each other.') }}</p>
    </template>
  </LedgerWorkspace>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { HandCoins, List, Pencil, Search, Trash2, UserPlus } from 'lucide-vue-next';
import LedgerWorkspace from '../LedgerWorkspace.vue';
import { useLedgerOverview } from '@/composables/useLedgerOverview';
import { useLedgerEntries } from '@/composables/useLedgerEntries';
import { useSharedData } from '@/composables/useSharedData';
import { useTransactions } from '@/composables/useTransactions';
import { useNotifications } from '@/composables/useNotifications';
import { sweepTransactions } from '@/utils/transactionSweep';
import { DEBT_INTENTS, partyDebts, settlingIntent, type PartyDebt } from '@/utils/partyDebts';
import { addDays, isoDate } from '@/utils/ledgerOverview';
import { money } from '@/utils/ledgerMoney';

const props = defineProps<{
  parties: any[];
  formOpen: boolean;
  formTitle: string;
}>();

const emit = defineEmits<{
  create: [];
  edit: [party: any];
  delete: [party: any];
}>();

const { t, locale } = useI18n();
const { base } = useLedgerOverview();
const { search: ledgerSearch, monthOffset } = useLedgerEntries();
const shared = useSharedData();
const { addTransaction } = useTransactions();
const { showSuccess, showError } = useNotifications();

const query = ref('');
const selectedId = ref<number | null>(null);
const debts = ref(new Map<number, PartyDebt[]>());
const activity = ref(
  new Map<number, { paid: number; got: number; count: number; last: string; recent: any[] }>()
);
const otherCurrencies = ref<string[]>([]);

const tone = (net: number) => (net < -0.005 ? 'good' : net > 0.005 ? 'bad' : 'flat');
const debtLabel = (net: number, currency: string) =>
  net < -0.005
    ? t('Owes you {amount}', { amount: money(-net, currency, locale.value) })
    : net > 0.005
      ? t('You owe {amount}', { amount: money(net, currency, locale.value) })
      : t('Settled');
const firstName = (name: string) => name.split(/\s+/)[0];
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
const shortDate = (value: string) =>
  new Date(value).toLocaleString(locale.value, { month: 'short', day: 'numeric' });
const relative = (value: string) => {
  const days = Math.round((Date.now() - new Date(value).getTime()) / 86_400_000);
  if (days <= 0) return t('Today');
  if (days === 1) return t('Yesterday');
  return days < 7 ? t('{count} days ago', { count: days }) : shortDate(value);
};
const TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  organization: 'Organization',
  business: 'Business'
};

const rows = computed(() => {
  const needle = query.value.trim().toLowerCase();
  return props.parties
    .filter((party) => !needle || party.name.toLowerCase().includes(needle))
    .map((party) => {
      const stats = activity.value.get(party.id);
      return {
        id: party.id as number,
        party,
        name: party.name as string,
        initials: initials(party.name),
        typeLabel: t(TYPE_LABELS[party.type] ?? 'Individual'),
        debts: debts.value.get(party.id) ?? [],
        paid: stats?.paid ?? 0,
        got: stats?.got ?? 0,
        count: stats?.count ?? 0,
        last: stats?.last ?? '',
        recent: stats?.recent ?? []
      };
    })
    .sort((a, b) => {
      const owed = (row: typeof a) =>
        row.debts.some((debt) => Math.abs(debt.net) >= 0.005) ? 1 : 0;
      return owed(b) - owed(a) || (a.last < b.last ? 1 : a.last > b.last ? -1 : 0);
    });
});

const selected = computed(() => rows.value.find((row) => row.id === selectedId.value) ?? null);

const picked = ref(false);
watch(selectedId, (id, before) => {
  if (before !== null && id !== null) picked.value = true;
});
watch(
  rows,
  (list) => {
    if (!picked.value || !list.some((row) => row.id === selectedId.value))
      selectedId.value = list[0]?.id ?? null;
  },
  { immediate: true }
);

const subtitle = computed(() => {
  const owed = new Map<string, number>();
  const owe = new Map<string, number>();
  for (const list of debts.value.values()) {
    for (const debt of list) {
      if (debt.net < -0.005) owed.set(debt.currency, (owed.get(debt.currency) ?? 0) - debt.net);
      if (debt.net > 0.005) owe.set(debt.currency, (owe.get(debt.currency) ?? 0) + debt.net);
    }
  }
  const join = (map: Map<string, number>) =>
    [...map].map(([currency, amount]) => money(amount, currency, locale.value)).join(' + ');
  const parts = [];
  if (owed.size) parts.push(t('Owed to you {amount}', { amount: join(owed) }));
  if (owe.size) parts.push(t('you owe {amount}', { amount: join(owe) }));
  return parts.length
    ? parts.join(' · ')
    : t('{count} people', { count: props.parties.length }, props.parties.length);
});

const currencyNote = computed(() =>
  otherCurrencies.value.length
    ? t('Paid and got columns leave out entries in {currencies}.', {
        currencies: otherCurrencies.value.join(', ')
      })
    : ''
);

const history = computed(() => {
  const row = selected.value;
  if (!row) return [];
  const moves = row.debts.flatMap((debt) =>
    debt.movements.map((movement, index) => ({
      key: `d${debt.currency}${index}`,
      at: movement.date,
      date: shortDate(movement.date),
      tone: movement.direction === 'out' ? 'out' : 'in',
      text:
        movement.direction === 'out'
          ? t('You gave {amount}', { amount: money(movement.amount, debt.currency, locale.value) })
          : t('{name} gave {amount}', {
              name: firstName(row.name),
              amount: money(movement.amount, debt.currency, locale.value)
            })
    }))
  );
  const recent = row.recent.map((entry: any) => ({
    key: `r${entry.id}`,
    at: entry.datetime,
    date: shortDate(entry.datetime),
    tone: 'flat',
    text: `${entry.description || t('No description')} · ${money(
      entry.type === 'income' ? Number(entry.amount) : -Number(entry.amount),
      entry.wallet?.currency ?? base.value,
      locale.value,
      { sign: true }
    )}`
  }));
  return [...moves, ...recent].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 8);
});

const settling = ref<PartyDebt | null>(null);
const settleAmount = ref(0);
const settleWallet = ref<number | null>(null);
const saving = ref(false);

const walletsIn = (currency: string) =>
  (shared.wallets.value ?? []).filter((wallet: any) => wallet.currency === currency);

function startSettle(debt: PartyDebt) {
  settling.value = debt;
  settleAmount.value = Math.abs(debt.net);
  const options = walletsIn(debt.currency);
  const preferred = options.find((wallet: any) => wallet.id === shared.getDefaultWallet.value?.id);
  settleWallet.value = (preferred ?? options[0])?.id ?? null;
}

async function saveSettle() {
  const debt = settling.value;
  const row = selected.value;
  if (!debt || !row || !settleWallet.value || saving.value) return;
  saving.value = true;
  const now = new Date();
  try {
    await addTransaction({
      type: debt.net < 0 ? 'INCOME' : 'EXPENSE',
      intent: settlingIntent(debt),
      amount: String(settleAmount.value),
      description:
        debt.net < 0
          ? t('Paid back by {name}', { name: row.name })
          : t('Paid back to {name}', { name: row.name }),
      partyId: row.id,
      walletId: settleWallet.value,
      categoryIds: [],
      date: isoDate(now),
      time: now.toTimeString().slice(0, 5)
    } as any);
    settling.value = null;
    showSuccess(t('Saved'), money(settleAmount.value, debt.currency, locale.value));
    await load();
  } catch (error) {
    showError(t('Could not save'), t('Check the entry and try again.'));
    console.error('[ledger] payback failed', error);
  } finally {
    saving.value = false;
  }
}

function searchLedger(name: string) {
  ledgerSearch.value = name;
  monthOffset.value = 0;
}

async function load() {
  try {
    const [debtSweep, recentSweep] = await Promise.all([
      sweepTransactions({ intent: DEBT_INTENTS.join(',') }),
      sweepTransactions({ exclude_transfers: true, date_from: isoDate(addDays(new Date(), -92)) })
    ]);
    debts.value = partyDebts(debtSweep.rows);
    const map = new Map<
      number,
      { paid: number; got: number; count: number; last: string; recent: any[] }
    >();
    const skipped = new Set<string>();
    for (const entry of recentSweep.rows) {
      if (entry.party_id == null) continue;
      const stats = map.get(entry.party_id) ?? { paid: 0, got: 0, count: 0, last: '', recent: [] };
      map.set(entry.party_id, stats);
      stats.count += 1;
      if (entry.datetime > stats.last) stats.last = entry.datetime;
      stats.recent.push(entry);
      const currency = entry.wallet?.currency ?? base.value;
      if (currency !== base.value) {
        skipped.add(currency);
        continue;
      }
      if (entry.type === 'income') stats.got += Number(entry.amount) || 0;
      else stats.paid += Number(entry.amount) || 0;
    }
    for (const stats of map.values()) {
      stats.recent = stats.recent.sort((a, b) => (a.datetime < b.datetime ? 1 : -1)).slice(0, 5);
    }
    activity.value = map;
    otherCurrencies.value = [...skipped];
  } catch (error) {
    console.warn('[ledger] people failed', error);
  }
}

onMounted(load);
</script>

<style scoped>
.lp-search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  height: 32px;
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r-sm);
  background: var(--ledger-surface);
  color: var(--ledger-ink-3);
}

.lp-search :deep(svg) {
  width: 14px;
  height: 14px;
}

.lp-search input {
  border: 0;
  background: none;
  outline: none;
  font: inherit;
  font-size: 13px;
  color: var(--ledger-ink);
  width: 11em;
}

.lp-wrap {
  overflow-x: auto;
}

.lp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.lp-table th {
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ledger-ink-3);
  font-weight: 600;
  padding: 7px 8px;
  border-bottom: 1px solid var(--ledger-line);
  white-space: nowrap;
}

.lp-table td {
  padding: 8px;
  border-bottom: 1px solid var(--ledger-line);
  vertical-align: middle;
}

.lp-table tbody tr {
  cursor: pointer;
  outline: none;
}

.lp-table tbody tr:hover,
.lp-table tbody tr:focus-visible {
  background: var(--ledger-surface);
}

.lp-table tr.lp-sel {
  background: var(--ledger-surface);
  box-shadow: inset 2px 0 0 var(--ledger-orange);
}

.lp-person {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.lp-person small {
  display: block;
  font-size: 12px;
  color: var(--ledger-ink-3);
}

.lp-sq {
  width: 28px;
  height: 28px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: var(--ledger-r-sm);
  background: var(--ledger-surface-2);
  color: var(--ledger-ink-2);
  font-size: 11px;
  font-weight: 700;
}

.lp-sq--lg {
  width: 42px;
  height: 42px;
  font-size: 14px;
}

.lp-chip {
  display: inline-block;
  margin: 1px 4px 1px 0;
  padding: 2px 7px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.lp-chip--good {
  background: var(--ledger-brand-soft);
  color: var(--ledger-brand);
}

.lp-chip--bad {
  background: var(--ledger-expense-soft);
  color: var(--ledger-expense);
}

.lp-chip--flat {
  background: var(--ledger-surface-2);
  color: var(--ledger-ink-3);
}

.lp-r {
  text-align: right !important;
}

.lp-num {
  font-family: var(--ledger-mono);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.lp-in {
  color: var(--ledger-income);
}

.lp-neg {
  color: var(--ledger-expense);
}

.lp-muted {
  margin: 0;
  font-size: 12.5px;
  color: var(--ledger-ink-3);
}

.lp-empty,
.lp-note {
  margin: 10px 0 0;
  font-size: 12.5px;
  color: var(--ledger-ink-3);
}

.lp-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lp-name {
  font-size: 16px;
  font-weight: 600;
}

.lp-debt {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lp-amt {
  font-family: var(--ledger-mono);
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.lp-bar {
  display: block;
  height: 8px;
  border-radius: 2px;
  background: var(--ledger-surface-3);
  overflow: hidden;
}

.lp-bar i {
  display: block;
  height: 100%;
  background: var(--ledger-brand);
}

.lp-h {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ledger-ink-3);
}

.lp-tl {
  list-style: none;
  margin: 0;
  padding: 0 0 0 12px;
  border-left: 2px solid var(--ledger-line);
}

.lp-tl li {
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 0;
  font-size: 13px;
}

.lp-tl li::before {
  content: '';
  position: absolute;
  left: -17px;
  top: 11px;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--ledger-ink-3);
}

.lp-tl li.lp-tl--out::before {
  background: var(--ledger-orange);
}

.lp-tl li.lp-tl--in::before {
  background: var(--ledger-brand);
}

.lp-settle {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r);
  background: var(--ledger-surface);
}

.lp-settle label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--ledger-ink-3);
}

.lp-settle input,
.lp-settle select {
  font: inherit;
  font-size: 13.5px;
  color: var(--ledger-ink);
  background: var(--ledger-bg);
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r-sm);
  padding: 7px 8px;
}

.lp-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.lp-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: var(--ledger-r-sm);
  border: 1px solid transparent;
  background: var(--ledger-brand);
  color: var(--ledger-on-brand);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.lp-btn :deep(svg) {
  width: 14px;
  height: 14px;
}

.lp-btn--o {
  background: var(--ledger-surface);
  color: var(--ledger-ink);
  border-color: var(--ledger-line);
}

.lp-btn--danger {
  background: var(--ledger-surface);
  color: var(--ledger-expense);
  border-color: var(--ledger-line);
}

@media (max-width: 1279px) {
  .lp-hide-md {
    display: none;
  }
}

@media (max-width: 767px) {
  .lp-hide-sm {
    display: none;
  }

  .lp-search input {
    width: 7em;
  }
}
</style>
