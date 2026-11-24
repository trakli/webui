<template>
  <LedgerWorkspace
    :title="wallet ? wallet.name : t('All wallets')"
    :subtitle="subtitle"
    :inspector-label="t('Entry details')"
    data-testid="ledger-transactions"
  >
    <template #actions>
      <select
        class="lx-wallet-pick"
        :value="walletId ?? ''"
        :aria-label="t('Wallet')"
        data-testid="ledger-wallet-pick"
        @change="pickWallet(($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ t('All wallets') }}</option>
        <option v-for="option in shared.wallets.value" :key="option.id" :value="option.id">
          {{ option.name }}
        </option>
      </select>
      <div class="lx-month" role="group" :aria-label="t('Month')">
        <button type="button" :aria-label="t('Previous month')" @click="step(-1)">
          <ChevronLeft />
        </button>
        <span>{{ monthLabel }}</span>
        <button
          type="button"
          :aria-label="t('Next month')"
          :disabled="month.isCurrent"
          @click="step(1)"
        >
          <ChevronRight />
        </button>
      </div>
      <div class="lx-seg" role="group" :aria-label="t('Show')">
        <button
          v-for="option in flowOptions"
          :key="option.value"
          type="button"
          :aria-pressed="flow === option.value"
          @click="flow = option.value"
        >
          {{ option.label }}
        </button>
      </div>
      <button
        type="button"
        class="lx-icon"
        :title="t('Open spreadsheet view')"
        @click="showSpreadsheet = true"
      >
        <Sheet />
      </button>
    </template>

    <form class="lx-add" @submit.prevent="submitQuick">
      <Plus class="lx-add-icon" />
      <input
        ref="addInput"
        v-model="quickText"
        :placeholder="t('Add an entry: 12.50 lunch Corner Coffee cash')"
        autocomplete="off"
        data-testid="ledger-add"
        @keydown.esc="quickText = ''"
      />
      <kbd>Enter</kbd>
    </form>
    <p
      v-if="quickText.trim()"
      class="lx-preview"
      :class="{ 'lx-preview--bad': !quick }"
      data-testid="ledger-add-preview"
    >
      <template v-if="quick">
        <b :class="quick.type === 'INCOME' ? 'lx-in' : ''">{{ previewAmount }}</b>
        <span v-for="part in previewParts" :key="part">{{ part }}</span>
      </template>
      <template v-else>{{ t('Start with an amount, for example 12.50 lunch') }}</template>
    </p>

    <div class="lx-search">
      <Search />
      <input
        v-model="searchText"
        type="search"
        :placeholder="t('Search this month')"
        :aria-label="t('Search this month')"
        @keydown.enter.prevent="applySearch"
        @search="applySearch"
      />
    </div>

    <div class="lx-table-wrap">
      <table class="lx-table">
        <thead>
          <tr>
            <th>{{ t('Date') }}</th>
            <th>{{ t('Description') }}</th>
            <th class="lx-hide-sm">{{ t('Category') }}</th>
            <th v-if="!wallet" class="lx-hide-md">{{ t('Wallet') }}</th>
            <th class="lx-r">{{ t('Amount') }}</th>
            <th v-if="showBalance" class="lx-r lx-hide-sm">{{ t('Balance') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in visible"
            :key="row.id"
            :class="{ 'lx-sel': row.id === selectedId }"
            :aria-selected="row.id === selectedId"
            tabindex="0"
            data-testid="ledger-row"
            @click="select(row.id)"
            @keydown.enter="select(row.id)"
          >
            <td class="lx-dt">{{ dayLabel(row.date) }}</td>
            <td class="lx-desc">
              {{ row.description || row.party || t('No description') }}
              <span v-if="row.party && row.description" class="lx-muted">· {{ row.party }}</span>
              <Repeat v-if="row.isRecurring" class="lx-flag" :aria-label="t('Repeats')" />
              <ArrowLeftRight v-if="row.isTransfer" class="lx-flag" :aria-label="t('Transfer')" />
            </td>
            <td class="lx-hide-sm">
              <span v-if="row.category" class="lx-chip">{{ row.category }}</span>
            </td>
            <td v-if="!wallet" class="lx-hide-md lx-muted">{{ row.wallet }}</td>
            <td class="lx-r lx-num" :class="{ 'lx-in': row.type === 'INCOME' }">
              {{ rowAmount(row) }}
            </td>
            <td v-if="showBalance" class="lx-r lx-num lx-muted lx-hide-sm">
              {{ row.balanceAfter === null ? '' : money(row.balanceAfter, row.currency, locale) }}
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!loading && !visible.length" class="lx-empty">
        {{
          searchApplied
            ? t('Nothing matches that search this month.')
            : t('No entries this month yet.')
        }}
      </p>
      <p v-if="loading && !entries.length" class="lx-empty">{{ t('Loading') }}</p>
    </div>

    <TransactionsSpreadsheet v-if="showSpreadsheet" @close="closeSpreadsheet" />
    <RecurringModal
      :is-open="showRecurring"
      :transaction="selected ?? undefined"
      @save="saveRecurring"
      @remove="removeRecurring"
      @cancel="showRecurring = false"
    />

    <template #inspector>
      <template v-if="selected">
        <h2 class="lx-h"><Tag />{{ selected.category || t('No category') }}</h2>
        <div>
          <div class="lx-amt" :class="{ 'lx-in': selected.type === 'INCOME' }">
            {{ rowAmount(selected) }}
          </div>
          <div class="lx-title">
            {{ selected.description || selected.party || t('No description') }}
          </div>
        </div>
        <dl class="lx-kv">
          <dt>{{ t('Date') }}</dt>
          <dd>{{ fullDate(selected) }}</dd>
          <dt>{{ t('Wallet') }}</dt>
          <dd>{{ selected.wallet || t('None') }}</dd>
          <dt>{{ t('Person') }}</dt>
          <dd :class="{ 'lx-muted': !selected.party }">{{ selected.party || t('None') }}</dd>
          <template v-if="selected.balanceAfter !== null">
            <dt>{{ t('Balance after') }}</dt>
            <dd class="lx-num">{{ money(selected.balanceAfter, selected.currency, locale) }}</dd>
          </template>
          <template v-if="selected.isRecurring">
            <dt>{{ t('Repeats') }}</dt>
            <dd>{{ recurrenceLabel(selected) }}</dd>
          </template>
        </dl>

        <div v-if="selected.category && selected.type === 'EXPENSE'">
          <h2 class="lx-h">{{ t('{category} by week', { category: selected.category }) }}</h2>
          <div class="lx-weeks">
            <div v-for="week in weeks" :key="week.label" class="lx-week">
              <span class="lx-week-bar">
                <i
                  :class="{ 'lx-week-on': week.current }"
                  :style="{ height: `${(week.total / weekMax) * 100}%` }"
                />
              </span>
              <small>{{ week.label }}</small>
            </div>
          </div>
        </div>

        <div>
          <h2 class="lx-h">{{ t('Similar this month') }}</h2>
          <ul class="lx-list">
            <li v-for="row in similar" :key="row.id">
              <button type="button" @click="select(row.id)">
                <span
                  >{{ row.description || row.party }}<small>{{ dayLabel(row.date) }}</small></span
                >
                <span class="lx-num">{{ rowAmount(row) }}</span>
              </button>
            </li>
          </ul>
          <p v-if="!similar.length" class="lx-muted">{{ t('Nothing similar.') }}</p>
        </div>

        <div v-if="editing === 'category'" class="lx-edit">
          <label>
            {{ t('Category') }}
            <select v-model="draftCategory">
              <option :value="null">{{ t('No category') }}</option>
              <option v-for="category in categoryOptions" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </label>
          <div class="lx-actions">
            <button type="button" class="lx-btn" :disabled="saving" @click="saveCategory">
              {{ t('Save') }}
            </button>
            <button type="button" class="lx-btn lx-btn--o" @click="editing = null">
              {{ t('Cancel') }}
            </button>
          </div>
        </div>
        <div v-else-if="editing === 'note'" class="lx-edit">
          <label>
            {{ t('Description') }}
            <textarea v-model="draftNote" rows="3" />
          </label>
          <div class="lx-actions">
            <button type="button" class="lx-btn" :disabled="saving" @click="saveNote">
              {{ t('Save') }}
            </button>
            <button type="button" class="lx-btn lx-btn--o" @click="editing = null">
              {{ t('Cancel') }}
            </button>
          </div>
        </div>
        <div v-else class="lx-actions" data-testid="ledger-entry-actions">
          <button
            v-if="!selected.isTransfer"
            type="button"
            class="lx-btn lx-btn--o"
            @click="startCategory"
          >
            <Tag />{{ t('Change category') }}
          </button>
          <button
            v-if="!selected.isTransfer"
            type="button"
            class="lx-btn lx-btn--o"
            @click="startNote"
          >
            <StickyNote />{{ t('Edit note') }}
          </button>
          <NuxtLink
            v-if="!selected.isTransfer"
            :to="`/transactions/edit/${selected.id}`"
            class="lx-btn lx-btn--o"
          >
            <Pencil />{{ t('All details') }}
          </NuxtLink>
          <button
            v-if="!selected.isTransfer"
            type="button"
            class="lx-btn lx-btn--o"
            @click="showRecurring = true"
          >
            <Repeat />{{ selected.isRecurring ? t('Change repeat') : t('Repeat') }}
          </button>
          <button type="button" class="lx-btn lx-btn--danger" @click="remove">
            <Trash2 />{{ t('Delete') }}
          </button>
        </div>
      </template>

      <template v-else>
        <h2 class="lx-h"><CalendarDays />{{ monthLabel }}</h2>
        <dl class="lx-kv">
          <dt>{{ t('In') }}</dt>
          <dd class="lx-num lx-in">{{ totalLabel(totals.income) }}</dd>
          <dt>{{ t('Out') }}</dt>
          <dd class="lx-num">{{ totalLabel(totals.expense) }}</dd>
          <dt>{{ t('Net') }}</dt>
          <dd class="lx-num">{{ totalLabel(totals.net, true) }}</dd>
          <dt>{{ t('Entries') }}</dt>
          <dd class="lx-num">{{ entries.length }}</dd>
        </dl>
        <p v-if="mixedCurrencies && !wallet" class="lx-muted">
          {{
            t(
              'Totals add amounts in different currencies. Pick a wallet on the left for exact totals.'
            )
          }}
        </p>
        <p class="lx-muted">
          {{ t('Select an entry to see its details. Use j and k to move, e to edit.') }}
        </p>
      </template>
    </template>
  </LedgerWorkspace>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  ArrowLeftRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Repeat,
  Search,
  Sheet,
  StickyNote,
  Tag,
  Trash2
} from 'lucide-vue-next';
import LedgerWorkspace from '../LedgerWorkspace.vue';
import TransactionsSpreadsheet from '@/components/transactions/TransactionsSpreadsheet.vue';
import RecurringModal from '@/components/modals/RecurringModal.vue';
import { useLedgerEntries, type LedgerFlow, type LedgerRow } from '@/composables/useLedgerEntries';
import { useLedgerOverview } from '@/composables/useLedgerOverview';
import { useSharedData } from '@/composables/useSharedData';
import { useTransactions } from '@/composables/useTransactions';
import { useNotifications } from '@/composables/useNotifications';
import { parseQuickEntry } from '@/utils/quickEntry';
import { addDays, isoDate } from '@/utils/ledgerOverview';
import { money } from '@/utils/ledgerMoney';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const shared = useSharedData();
const { addTransaction, updateTransaction, deleteTransaction, setRecurring } = useTransactions();
const { showSuccess, showError, confirmDelete } = useNotifications();
const { loadStats, loadDetail } = useLedgerOverview();
const {
  walletId,
  wallet,
  monthOffset,
  month,
  flow,
  search,
  entries,
  visible,
  selectedId,
  selected,
  totals,
  mixedCurrencies,
  loading,
  load
} = useLedgerEntries();

const addInput = ref<HTMLInputElement | null>(null);
const quickText = ref('');
const searchText = ref(search.value);
const searchApplied = computed(() => !!search.value.trim());
const showSpreadsheet = ref(false);
const showRecurring = ref(false);
const editing = ref<'category' | 'note' | null>(null);
const draftCategory = ref<number | null>(null);
const draftNote = ref('');
const saving = ref(false);

const flowOptions = computed<{ value: LedgerFlow; label: string }[]>(() => [
  { value: 'all', label: t('All') },
  { value: 'out', label: t('Out') },
  { value: 'in', label: t('In') }
]);

const monthLabel = computed(() =>
  month.value.start.toLocaleString(locale.value, { month: 'long', year: 'numeric' })
);

const subtitle = computed(() => {
  const count = t('{count} entries', { count: entries.value.length }, entries.value.length);
  return wallet.value ? `${wallet.value.currency} · ${count}` : count;
});

const showBalance = computed(() => !!wallet.value && !searchApplied.value);

const dayLabel = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleString(locale.value, { month: 'short', day: '2-digit' });

const fullDate = (row: LedgerRow) => {
  const date = new Date(`${row.date}T${row.time || '00:00'}:00`);
  return `${date.toLocaleString(locale.value, { weekday: 'short', month: 'short', day: 'numeric' })}, ${row.time}`;
};

const rowAmount = (row: LedgerRow) => money(row.signed, row.currency, locale.value, { sign: true });

const totalLabel = (value: number, sign = false) =>
  money(value, wallet.value?.currency || shared.getDefaultCurrency.value || 'USD', locale.value, {
    sign
  });

const PERIOD_LABEL: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly'
};
const PERIOD_UNIT: Record<string, string> = {
  daily: 'day(s)',
  weekly: 'week(s)',
  monthly: 'month(s)',
  yearly: 'year(s)'
};

const recurrenceLabel = (row: LedgerRow) => {
  const period = row.recurrencePeriod || '';
  if (row.recurrenceInterval && row.recurrenceInterval > 1 && PERIOD_UNIT[period]) {
    return t('Every {count} {period}', {
      count: row.recurrenceInterval,
      period: t(PERIOD_UNIT[period])
    });
  }
  return PERIOD_LABEL[period] ? t(PERIOD_LABEL[period]) : t('Repeats');
};

const similar = computed(() => {
  const current = selected.value;
  if (!current?.category) return [];
  return entries.value
    .filter((row) => row.id !== current.id && row.category === current.category)
    .slice(0, 3);
});

const weeks = computed(() => {
  const current = selected.value;
  const last = month.value.end.getDate();
  const ranges = [
    [1, 7],
    [8, 14],
    [15, 21],
    [22, last]
  ];
  return ranges.map(([from, to]) => {
    const total = entries.value
      .filter((row) => row.category === current?.category && row.type === 'EXPENSE')
      .filter((row) => {
        const day = Number(row.date.slice(8, 10));
        return day >= from && day <= to;
      })
      .reduce((sum, row) => sum + row.value, 0);
    const day = current ? Number(current.date.slice(8, 10)) : 0;
    return {
      label: `${from}–${to}`,
      total,
      current: day >= from && day <= to
    };
  });
});
const weekMax = computed(() => Math.max(1, ...weeks.value.map((week) => week.total)));

const categoryOptions = computed(() => {
  const type = selected.value?.type === 'INCOME' ? 'income' : 'expense';
  return (shared.categories.value ?? []).filter(
    (category: any) => !category.type || String(category.type).toLowerCase() === type
  );
});

const quick = computed(() =>
  parseQuickEntry(quickText.value, {
    wallets: shared.wallets.value ?? [],
    categories: shared.categories.value ?? [],
    parties: shared.parties.value ?? [],
    history: entries.value
  })
);

const quickWallet = computed(() => {
  const id = quick.value?.walletId ?? walletId.value ?? shared.getDefaultWallet.value?.id;
  return (shared.wallets.value ?? []).find((w: any) => w.id === id) ?? null;
});

const previewAmount = computed(() =>
  quick.value
    ? money(
        quick.value.type === 'INCOME' ? quick.value.amount : -quick.value.amount,
        quickWallet.value?.currency || shared.getDefaultCurrency.value || 'USD',
        locale.value,
        { sign: true }
      )
    : ''
);

const previewParts = computed(() => {
  const entry = quick.value;
  if (!entry) return [];
  const category = (shared.categories.value ?? []).find((c: any) => c.id === entry.categoryIds[0]);
  const party = (shared.parties.value ?? []).find((p: any) => p.id === entry.partyId);
  return [
    entry.description,
    category?.name ?? t('No category'),
    quickWallet.value?.name,
    party?.name,
    entry.daysAgo === 1 ? t('Yesterday') : t('Today')
  ].filter(Boolean) as string[];
});

const refreshAll = async () => {
  await load();
  loadStats(true);
  loadDetail(true);
};

async function submitQuick() {
  const entry = quick.value;
  if (!entry || saving.value) return;
  saving.value = true;
  const now = new Date();
  try {
    await addTransaction({
      type: entry.type,
      amount: String(entry.amount),
      description: entry.description,
      partyId: entry.partyId,
      walletId: quickWallet.value?.id,
      categoryIds: entry.categoryIds,
      date: isoDate(addDays(now, -entry.daysAgo)),
      time: now.toTimeString().slice(0, 5)
    } as any);
    quickText.value = '';
    showSuccess(t('Saved'), previewAmount.value);
    await refreshAll();
  } catch (error) {
    showError(t('Could not save'), t('Check the entry and try again.'));
    console.error('[ledger] quick add failed', error);
  } finally {
    saving.value = false;
  }
}

const fullUpdate = (row: LedgerRow, changes: Partial<LedgerRow>) =>
  updateTransaction(row.id, {
    type: row.type,
    amount: String(row.value),
    description: row.description,
    partyId: row.partyId,
    walletId: row.walletId,
    groupId: row.groupId,
    categoryIds: row.categoryIds,
    intent: row.intent,
    date: row.date,
    time: row.time,
    isRecurring: row.isRecurring,
    recurrencePeriod: row.recurrencePeriod,
    recurrenceInterval: row.recurrenceInterval,
    recurrenceEndsAt: row.recurrenceEndsAt,
    ...changes
  } as any);

function startCategory() {
  draftCategory.value = selected.value?.categoryIds?.[0] ?? null;
  editing.value = 'category';
}

function startNote() {
  draftNote.value = selected.value?.description ?? '';
  editing.value = 'note';
}

async function saveWith(changes: Partial<LedgerRow>) {
  if (!selected.value) return;
  saving.value = true;
  try {
    await fullUpdate(selected.value, changes);
    editing.value = null;
    showSuccess(t('Saved'), '');
    await refreshAll();
  } catch (error) {
    showError(t('Could not save'), t('Check the entry and try again.'));
    console.error('[ledger] update failed', error);
  } finally {
    saving.value = false;
  }
}

const saveCategory = () =>
  saveWith({ categoryIds: draftCategory.value ? [draftCategory.value] : [] });
const saveNote = () => saveWith({ description: draftNote.value.trim() });

async function saveRecurring(config: any) {
  if (!selected.value) return;
  try {
    await setRecurring(selected.value.id, config);
    showRecurring.value = false;
    await refreshAll();
  } catch (error) {
    showError(
      t('Failed to update recurrence'),
      t('Failed to update transaction recurrence. Please try again.')
    );
    console.error('[ledger] recurrence failed', error);
  }
}

async function removeRecurring() {
  await saveRecurring({ is_recurring: false });
}

async function remove() {
  if (!selected.value) return;
  const confirmed = await confirmDelete('transaction');
  if (!confirmed) return;
  try {
    await deleteTransaction(selected.value.id);
    selectedId.value = null;
    showSuccess(t('Transaction deleted'), t('Transaction has been deleted successfully'));
    await refreshAll();
  } catch (error) {
    showError(t('Delete failed'), t('Failed to delete transaction. Please try again.'));
    console.error('[ledger] delete failed', error);
  }
}

function select(id: string) {
  editing.value = null;
  selectedId.value = id;
}

function step(delta: number) {
  monthOffset.value = Math.min(0, monthOffset.value + delta);
}

function pickWallet(value: string) {
  const query = { ...route.query };
  if (value) query.wallet = value;
  else delete query.wallet;
  router.replace({ query });
}

function applySearch() {
  search.value = searchText.value;
}

function closeSpreadsheet() {
  showSpreadsheet.value = false;
  refreshAll();
}

const walletFromQuery = (value: unknown) => {
  const id = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(id) && id > 0 ? id : null;
};

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const rows = visible.value;
  if (!rows.length) return;
  const index = rows.findIndex((row) => row.id === selectedId.value);
  if (event.key === 'j' || event.key === 'k') {
    event.preventDefault();
    const next = Math.max(0, Math.min(rows.length - 1, index + (event.key === 'j' ? 1 : -1)));
    select(rows[index === -1 ? 0 : next].id);
    requestAnimationFrame(() =>
      document.querySelector('.lx-table tr.lx-sel')?.scrollIntoView({ block: 'nearest' })
    );
  } else if (event.key === 'e' && selected.value && !selected.value.isTransfer) {
    event.preventDefault();
    router.push(`/transactions/edit/${selected.value.id}`);
  } else if (event.key === 'n' || event.key === '/') {
    event.preventDefault();
    addInput.value?.focus();
  }
}

watch(
  () => route.query.wallet,
  (value) => {
    walletId.value = walletFromQuery(value);
  },
  { immediate: true }
);

watch([walletId, monthOffset, search], () => load());

onMounted(() => {
  load();
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<style scoped>
.lx-month,
.lx-seg {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r-sm);
  background: var(--ledger-surface-2);
  padding: 2px;
  font-size: 13px;
}

.lx-month span {
  padding: 0 8px;
  min-width: 8.5em;
  text-align: center;
  font-weight: 600;
  color: var(--ledger-ink);
}

.lx-month button,
.lx-seg button {
  border: 0;
  background: none;
  padding: 5px 10px;
  border-radius: 3px;
  color: var(--ledger-ink-3);
  cursor: pointer;
  display: inline-grid;
  place-items: center;
}

.lx-month button {
  padding: 4px 6px;
}

.lx-month button:disabled {
  opacity: 0.35;
  cursor: default;
}

.lx-month :deep(svg),
.lx-icon :deep(svg) {
  width: 16px;
  height: 16px;
}

.lx-seg button[aria-pressed='true'] {
  background: var(--ledger-surface);
  color: var(--ledger-ink);
  font-weight: 600;
  box-shadow: 0 1px 0 var(--ledger-line);
}

.lx-wallet-pick {
  font: inherit;
  font-size: 13px;
  color: var(--ledger-ink);
  background: var(--ledger-surface);
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r-sm);
  padding: 5px 8px;
  max-width: 11em;
}

.lx-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 1px solid var(--ledger-line);
  background: var(--ledger-surface);
  border-radius: var(--ledger-r-sm);
  color: var(--ledger-ink-2);
  cursor: pointer;
}

.lx-add {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  border: 1px dashed var(--ledger-line);
  border-radius: var(--ledger-r-sm);
  padding: 6px 10px;
  color: var(--ledger-ink-3);
  background: var(--ledger-surface);
}

.lx-add:focus-within {
  border-style: solid;
  border-color: var(--ledger-brand);
}

.lx-add-icon {
  width: 16px;
  height: 16px;
  flex: none;
}

.lx-add input {
  flex: 1;
  border: 0;
  background: none;
  outline: none;
  font-size: 13.5px;
  color: var(--ledger-ink);
  min-width: 0;
}

kbd {
  font-family: var(--ledger-mono);
  font-size: 11px;
  border: 1px solid var(--ledger-line);
  border-bottom-width: 2px;
  border-radius: 3px;
  padding: 0 5px;
  color: var(--ledger-ink-2);
}

.lx-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 6px;
  margin: 0 0 8px;
  font-size: 12px;
  color: var(--ledger-ink-2);
}

.lx-preview b {
  font-family: var(--ledger-mono);
}

.lx-preview span {
  padding: 1px 6px;
  border-radius: 3px;
  background: var(--ledger-surface-2);
}

.lx-preview--bad {
  color: var(--ledger-orange-text);
}

.lx-search {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  padding: 0 10px;
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r-sm);
  background: var(--ledger-surface);
  color: var(--ledger-ink-3);
}

.lx-search :deep(svg) {
  width: 15px;
  height: 15px;
}

.lx-search input {
  flex: 1;
  border: 0;
  background: none;
  outline: none;
  padding: 6px 0;
  font-size: 13px;
  color: var(--ledger-ink);
  min-width: 0;
}

.lx-table-wrap {
  overflow-x: auto;
}

.lx-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.lx-table th {
  position: sticky;
  top: 0;
  background: var(--ledger-bg);
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ledger-ink-3);
  font-weight: 600;
  padding: 7px 8px;
  border-bottom: 1px solid var(--ledger-line);
  white-space: nowrap;
  z-index: 1;
}

.lx-table td {
  padding: 8px;
  border-bottom: 1px solid var(--ledger-line);
  white-space: nowrap;
}

.lx-table tbody tr {
  cursor: pointer;
  outline: none;
}

.lx-table tbody tr:hover,
.lx-table tbody tr:focus-visible {
  background: var(--ledger-surface);
}

.lx-table tr.lx-sel {
  background: var(--ledger-surface);
  box-shadow: inset 2px 0 0 var(--ledger-orange);
}

.lx-dt {
  color: var(--ledger-ink-3);
  font-family: var(--ledger-mono);
  font-size: 12px;
}

.lx-desc {
  white-space: normal !important;
  min-width: 12em;
}

.lx-flag {
  width: 13px;
  height: 13px;
  margin-left: 4px;
  vertical-align: -2px;
  color: var(--ledger-ink-3);
}

.lx-chip {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 3px;
  background: var(--ledger-surface-2);
  font-size: 12px;
  color: var(--ledger-ink-2);
}

.lx-r {
  text-align: right !important;
}

.lx-num {
  font-family: var(--ledger-mono);
  font-variant-numeric: tabular-nums;
}

.lx-in {
  color: var(--ledger-income);
}

.lx-muted {
  color: var(--ledger-ink-3);
  font-size: 12.5px;
  margin: 0;
}

.lx-empty {
  padding: 24px 8px;
  text-align: center;
  color: var(--ledger-ink-3);
  font-size: 13px;
}

.lx-h {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ledger-ink-3);
}

.lx-h :deep(svg) {
  width: 14px;
  height: 14px;
}

.lx-amt {
  font-family: var(--ledger-mono);
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.lx-title {
  font-size: 15px;
  margin-top: 2px;
}

.lx-kv {
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr);
  gap: 7px 10px;
  font-size: 13px;
  margin: 0;
}

.lx-kv dt {
  color: var(--ledger-ink-3);
}

.lx-kv dd {
  margin: 0;
}

.lx-weeks {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.lx-week {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.lx-week-bar {
  width: 100%;
  height: 64px;
  display: flex;
  align-items: flex-end;
}

.lx-week-bar i {
  display: block;
  width: 100%;
  min-height: 2px;
  background: var(--ledger-brand);
  border-radius: 2px 2px 0 0;
}

.lx-week-bar i.lx-week-on {
  background: var(--ledger-orange);
}

.lx-week small {
  font-family: var(--ledger-mono);
  font-size: 10.5px;
  color: var(--ledger-ink-3);
}

.lx-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.lx-list button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
  border: 0;
  border-bottom: 1px solid var(--ledger-line);
  background: none;
  text-align: left;
  font-size: 13px;
  color: var(--ledger-ink);
  cursor: pointer;
}

.lx-list li:last-child button {
  border-bottom: 0;
}

.lx-list small {
  display: block;
  color: var(--ledger-ink-3);
  font-size: 12px;
}

.lx-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.lx-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: var(--ledger-r-sm);
  border: 1px solid transparent;
  background: var(--ledger-brand);
  color: var(--ledger-on-brand);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.lx-btn :deep(svg) {
  width: 14px;
  height: 14px;
}

.lx-btn--o {
  background: var(--ledger-surface);
  color: var(--ledger-ink);
  border-color: var(--ledger-line);
}

.lx-btn--danger {
  background: var(--ledger-surface);
  color: var(--ledger-expense);
  border-color: var(--ledger-line);
}

.lx-edit {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lx-edit label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--ledger-ink-3);
}

.lx-edit select,
.lx-edit textarea {
  font: inherit;
  font-size: 13.5px;
  color: var(--ledger-ink);
  background: var(--ledger-surface);
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r-sm);
  padding: 7px 8px;
}

@media (max-width: 1279px) {
  .lx-hide-md {
    display: none;
  }
}

@media (max-width: 767px) {
  .lx-hide-sm {
    display: none;
  }

  .lx-month span {
    min-width: 0;
  }
}
</style>
