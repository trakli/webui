<template>
  <Teleport to="body">
    <div v-if="open" class="lg-pal-scrim" @click="close" />
    <div
      v-if="open"
      class="lg-pal"
      role="dialog"
      :aria-label="t('Command palette')"
      data-testid="ledger-palette"
    >
      <div class="lg-pal-input">
        <Search class="lg-pal-icon" />
        <input
          ref="inputRef"
          v-model="query"
          :placeholder="t('Go to a page, find a wallet or person, or ask a question')"
          autocomplete="off"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.enter.prevent="run(selected)"
          @keydown.esc.prevent="close"
        />
        <kbd class="lg-pal-kbd">Esc</kbd>
      </div>
      <div class="lg-pal-results" role="listbox">
        <template v-for="group in grouped" :key="group.name">
          <div class="lg-pal-group">{{ t(group.name) }}</div>
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            class="lg-pal-item"
            role="option"
            :aria-selected="item.index === selected"
            @mouseenter="selected = item.index"
            @click="run(item.index)"
          >
            <span class="lg-pal-coin"><component :is="item.icon" /></span>
            <span class="lg-pal-label">{{ item.label }}</span>
            <span v-if="item.detail" class="lg-pal-detail">{{ item.detail }}</span>
          </button>
        </template>
      </div>
      <div class="lg-pal-foot">
        <span>↑ ↓ {{ t('move') }}</span
        ><span>Enter {{ t('open') }}</span
        ><span>Esc {{ t('close') }}</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import {
  ArrowLeftRight,
  ChartNoAxesCombined,
  FileDown,
  LayoutDashboard,
  List,
  MessageCircle,
  Moon,
  Plus,
  Search,
  Settings2,
  Sun,
  Target,
  User,
  Users,
  UsersRound,
  Wallet
} from 'lucide-vue-next';
import { usePendingAsk } from '@/composables/usePendingAsk';
import { useSharedData } from '@/composables/useSharedData';
import { useTheme } from '@/composables/useTheme';
import { useTransactions } from '@/composables/useTransactions';
import { useNotifications } from '@/composables/useNotifications';
import { useLedgerAdd } from '@/composables/useLedgerAdd';
import { useLedgerEntries } from '@/composables/useLedgerEntries';
import { useLedgerOverview } from '@/composables/useLedgerOverview';
import { parseQuickEntry, type QuickEntry } from '@/utils/quickEntry';
import { addDays, isoDate } from '@/utils/ledgerOverview';
import { money } from '@/utils/ledgerMoney';

interface PaletteEntry {
  id: string;
  group: string;
  label: string;
  detail?: string;
  icon: unknown;
  keywords?: string;
  action: () => void;
}

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

const { t } = useI18n();
const router = useRouter();
const { setPendingAsk } = usePendingAsk();
const shared = useSharedData();
const { wallets, parties } = shared;
const { addTransaction } = useTransactions();
const { showSuccess, showError } = useNotifications();
const { start: startAdd } = useLedgerAdd();
const ledgerEntries = useLedgerEntries();
const { loadStats } = useLedgerOverview();
const { locale } = useI18n();
const { isDark, setTheme } = useTheme();

const query = ref('');
const selected = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);

const go = (to: string) => () => router.push(to);

const pages = computed<PaletteEntry[]>(() =>
  [
    ['/dashboard', 'Overview', LayoutDashboard],
    ['/transactions', 'Ledger', List],
    ['/reports', 'Reports', ChartNoAxesCombined],
    ['/budgets', 'Budgets', Target],
    ['/wallets', 'Wallets', Wallet],
    ['/parties', 'People', Users],
    ['/imports', 'Imports', FileDown],
    ['/workspaces', 'Shared spaces', UsersRound],
    ['/home', 'Ask Trakli', MessageCircle],
    ['/settings', 'Settings', Settings2]
  ].map(([to, label, icon]) => ({
    id: `page:${to}`,
    group: 'Go to',
    label: t(label as string),
    icon,
    keywords: `${label} ${to}`,
    action: go(to as string)
  }))
);

const actions = computed<PaletteEntry[]>(() => [
  {
    id: 'action:new',
    group: 'Actions',
    label: t('New transaction'),
    icon: Plus,
    keywords: 'log add expense income',
    action: startAdd
  },
  {
    id: 'action:transfer',
    group: 'Actions',
    label: t('Move money between wallets'),
    icon: ArrowLeftRight,
    keywords: 'transfer',
    action: go('/wallets')
  },
  {
    id: 'action:mode',
    group: 'Appearance',
    label: isDark.value ? t('Switch to light') : t('Switch to dark'),
    icon: isDark.value ? Sun : Moon,
    keywords: 'theme dark light mode',
    action: () => setTheme(isDark.value ? 'light' : 'dark')
  }
]);

const records = computed<PaletteEntry[]>(() => [
  ...(wallets.value ?? []).map((wallet: { id: number; name: string; currency?: string }) => ({
    id: `wallet:${wallet.id}`,
    group: 'Wallets',
    label: wallet.name,
    detail: wallet.currency,
    icon: Wallet,
    action: go(`/transactions?wallet=${wallet.id}`)
  })),
  ...(parties.value ?? []).map((party: { id: number; name: string }) => ({
    id: `party:${party.id}`,
    group: 'People',
    label: party.name,
    icon: User,
    action: go('/parties')
  }))
]);

const ask = (text: string): PaletteEntry => ({
  id: 'ask',
  group: 'Ask Trakli',
  label: `“${text}”`,
  detail: t('Opens the assistant'),
  icon: MessageCircle,
  action: () => {
    setPendingAsk({ text });
    router.push('/home');
  }
});

const LOG_TEXT = /^(?:(?:log|add)\s+)?([+-]?[€$£]?\d+(?:[.,]\d{1,2})?[€$£]?\s.*)$/i;

const quick = computed(() => {
  const text = query.value.trim();
  const match = text.endsWith('?') ? null : text.match(LOG_TEXT);
  if (!match) return null;
  return parseQuickEntry(match[1], {
    wallets: shared.wallets.value ?? [],
    categories: shared.categories.value ?? [],
    parties: shared.parties.value ?? [],
    history: ledgerEntries.entries.value
  });
});

function quickPreview(entry: QuickEntry) {
  const wallet =
    (shared.wallets.value ?? []).find((w: any) => w.id === entry.walletId) ??
    shared.getDefaultWallet.value;
  const category = (shared.categories.value ?? []).find((c: any) => c.id === entry.categoryIds[0]);
  const amount = money(
    entry.type === 'INCOME' ? entry.amount : -entry.amount,
    wallet?.currency || shared.getDefaultCurrency.value || 'USD',
    locale.value,
    { sign: true }
  );
  return {
    wallet,
    amount,
    detail: [amount, category?.name ?? t('No category'), wallet?.name].filter(Boolean).join(' · ')
  };
}

async function logQuick(entry: QuickEntry) {
  const { wallet, amount } = quickPreview(entry);
  const now = new Date();
  try {
    await addTransaction({
      type: entry.type,
      amount: String(entry.amount),
      description: entry.description,
      partyId: entry.partyId,
      walletId: wallet?.id,
      categoryIds: entry.categoryIds,
      date: isoDate(addDays(now, -entry.daysAgo)),
      time: now.toTimeString().slice(0, 5)
    } as any);
    showSuccess(t('Saved'), amount);
    ledgerEntries.load();
    loadStats(true);
  } catch (error) {
    showError(t('Could not save'), t('Check the entry and try again.'));
    console.error('[ledger] palette log failed', error);
  }
}

const logEntry = computed<PaletteEntry | null>(() => {
  const entry = quick.value;
  if (!entry) return null;
  return {
    id: 'log',
    group: 'Log it',
    label: entry.description || t('New transaction'),
    detail: quickPreview(entry).detail,
    icon: Plus,
    action: () => logQuick(entry)
  };
});

const flat = computed(() => {
  const q = query.value.trim().toLowerCase();
  const base = q
    ? [...actions.value, ...pages.value, ...records.value].filter((entry) =>
        `${entry.label} ${entry.keywords ?? ''}`.toLowerCase().includes(q)
      )
    : [...actions.value, ...pages.value];
  const list = q
    ? [...(logEntry.value ? [logEntry.value] : []), ...base.slice(0, 12), ask(query.value.trim())]
    : base;
  return list.map((entry, index) => ({ ...entry, index }));
});

const grouped = computed(() => {
  const groups: { name: string; items: typeof flat.value }[] = [];
  for (const item of flat.value) {
    const last = groups[groups.length - 1];
    if (last && last.name === item.group) last.items.push(item);
    else groups.push({ name: item.group, items: [item] });
  }
  return groups;
});

const move = (delta: number) => {
  const count = flat.value.length;
  if (!count) return;
  selected.value = (selected.value + delta + count) % count;
};

const close = () => emit('close');

const run = (index: number) => {
  const entry = flat.value[index];
  if (!entry) return;
  close();
  entry.action();
};

watch(query, () => {
  selected.value = 0;
});

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    query.value = '';
    selected.value = 0;
    await nextTick();
    inputRef.value?.focus();
  }
);
</script>

<style scoped>
.lg-pal-scrim {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.32);
  z-index: 1000;
}

.lg-pal {
  position: fixed;
  left: 50%;
  top: 12vh;
  transform: translateX(-50%);
  width: min(600px, calc(100vw - 24px));
  background: var(--ledger-surface, #fff);
  color: var(--ledger-ink, #0f1a14);
  border: 1px solid var(--ledger-line, #dce3df);
  border-radius: var(--ledger-r-lg, 8px);
  box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  z-index: 1001;
  font-family: var(--ledger-font, inherit);
}

.lg-pal-input {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--ledger-line, #dce3df);
}

.lg-pal-input input {
  flex: 1;
  border: 0;
  background: none;
  outline: none;
  font-size: 16px;
  color: inherit;
  min-width: 0;
}

.lg-pal-icon {
  width: 18px;
  height: 18px;
  color: var(--ledger-ink-3, #6e7e75);
}

.lg-pal-kbd {
  font-family: var(--ledger-mono, monospace);
  font-size: 11px;
  border: 1px solid var(--ledger-line, #dce3df);
  border-bottom-width: 2px;
  border-radius: 3px;
  padding: 0 5px;
}

.lg-pal-results {
  max-height: min(380px, 55vh);
  overflow: auto;
  padding: 6px;
}

.lg-pal-group {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--ledger-ink-3, #6e7e75);
  padding: 9px 10px 3px;
}

.lg-pal-item {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  background: none;
  border-radius: var(--ledger-r-sm, 4px);
  font-size: 14px;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.lg-pal-item[aria-selected='true'] {
  background: var(--ledger-surface-2, #eef2f0);
}

.lg-pal-coin {
  width: 30px;
  height: 30px;
  border-radius: var(--ledger-r-sm, 4px);
  display: grid;
  place-items: center;
  background: var(--ledger-surface-2, #eef2f0);
  color: var(--ledger-ink-2, #44554b);
  flex: none;
}

.lg-pal-item[aria-selected='true'] .lg-pal-coin {
  background: var(--ledger-brand, #047844);
  color: var(--ledger-on-brand, #fff);
}

.lg-pal-coin :deep(svg) {
  width: 16px;
  height: 16px;
}

.lg-pal-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lg-pal-detail {
  font-size: 12px;
  color: var(--ledger-ink-3, #6e7e75);
}

.lg-pal-foot {
  display: flex;
  gap: 14px;
  padding: 8px 14px;
  border-top: 1px solid var(--ledger-line, #dce3df);
  font-size: 11.5px;
  color: var(--ledger-ink-3, #6e7e75);
}
</style>
