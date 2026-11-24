<template>
  <LedgerWorkspace
    :title="space?.name ?? t('Shared')"
    :subtitle="subtitle"
    :inspector-label="t('People')"
  >
    <template #actions>
      <NuxtLink v-if="canManage" to="/wallets" class="ls-btn ls-btn--ghost">
        <Share2 />{{ t('Shared wallets') }}
      </NuxtLink>
      <NuxtLink v-if="canManage" :to="{ path: '/people', query: { invite: '1' } }" class="ls-btn">
        <UserPlus />{{ t('Invite someone') }}
      </NuxtLink>
    </template>

    <p v-if="urgent" class="ls-notice" data-testid="space-notice">
      <AlertCircle />
      <span
        ><b>{{ urgent.title }}</b> {{ urgent.text }}</span
      >
      <NuxtLink v-if="urgent.to" :to="urgent.to">{{ urgent.label }}</NuxtLink>
    </p>

    <div class="ls-kpis" data-testid="space-kpis">
      <div>
        {{ t('Shared spending') }}
        <span class="ls-num">{{ fmt(main.expenses) }}</span>
        <small>{{
          t('{count} people recorded', { count: contributors.length }, contributors.length)
        }}</small>
      </div>
      <div>
        {{ t('Budgets left') }}
        <span class="ls-num" :class="budgetTotals.left < 0 ? 'ls-out' : 'ls-in'">{{
          fmt(budgetTotals.left)
        }}</span>
        <small>{{
          t(
            'of {amount} across {count} budgets',
            { amount: fmt(budgetTotals.limit), count: budgetRows.length },
            budgetRows.length
          )
        }}</small>
      </div>
      <div>
        {{ t('Space wallets') }}
        <span class="ls-num">{{ fmt(spaceWallets.balance) }}</span>
        <small>{{ t('Owned by the space') }}</small>
      </div>
      <div>
        {{ t('Shared by members') }}
        <span class="ls-num ls-text">{{
          t('{count} wallets', { count: memberWallets.length }, memberWallets.length)
        }}</span>
        <small>{{ memberWallets.map((wallet) => wallet.name).join(', ') || t('None yet') }}</small>
      </div>
    </div>

    <div class="ls-grid">
      <section class="ls-pan">
        <h3 class="ls-h"><Target />{{ t('Shared budgets') }}</h3>
        <div v-for="row in budgetRows" :key="row.id" class="ls-budget">
          <span>{{ row.name }}</span>
          <span class="ls-mono" :class="{ 'ls-out': row.ratio > 0.9 }"
            >{{ fmt(row.spent, true) }} / {{ fmt(row.limit, true) }}</span
          >
          <span class="ls-bar"
            ><i
              :class="{ 'ls-warn': row.ratio > 0.9 }"
              :style="{ width: `${Math.min(100, row.ratio * 100)}%` }"
          /></span>
        </div>
        <p v-if="!budgetRows.length" class="ls-muted">{{ t('No shared budgets yet') }}</p>
      </section>
      <section class="ls-pan">
        <h3 class="ls-h"><UsersRound />{{ t('Who recorded what') }}</h3>
        <div v-if="contributors.length" class="ls-stack">
          <span
            v-for="(row, i) in contributors"
            :key="row.name"
            :style="{ width: `${row.share * 100}%`, background: SWATCH[i % SWATCH.length] }"
          />
        </div>
        <ul class="ls-list">
          <li v-for="(row, i) in contributors" :key="row.name">
            <span class="ls-dot" :style="{ background: SWATCH[i % SWATCH.length] }" />
            <span class="ls-grow">{{ row.name }}</span>
            <span class="ls-mono">{{ fmt(row.amount) }}</span>
            <span class="ls-mono ls-muted ls-pct">{{ Math.round(row.share * 100) }}%</span>
          </li>
        </ul>
        <p v-if="!contributors.length" class="ls-muted">{{ t('Nothing recorded yet') }}</p>
      </section>
    </div>

    <div class="ls-wrap">
      <table class="ls-table" data-testid="space-entries">
        <thead>
          <tr>
            <th>{{ t('Date') }}</th>
            <th>{{ t('Description') }}</th>
            <th>{{ t('Recorded by') }}</th>
            <th class="ls-hide-md">{{ t('Wallet') }}</th>
            <th class="ls-hide-md">{{ t('Space label') }}</th>
            <th class="ls-r">{{ t('Amount') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in transactions"
            :key="`${entry.source}-${entry.id}`"
            :class="{ 'ls-sel': selected === entry }"
            tabindex="0"
            data-testid="space-entry-row"
            @click="selectedKey = key(entry)"
            @keydown.enter="selectedKey = key(entry)"
          >
            <td class="ls-mono ls-muted">{{ day(entry.datetime) }}</td>
            <td>
              {{ entry.description || (entry.type === 'income' ? t('Income') : t('Expense')) }}
            </td>
            <td>
              <span class="ls-who"
                ><span class="ls-sq">{{ initials(entry.contributor) }}</span
                >{{ entry.contributor }}</span
              >
            </td>
            <td class="ls-muted ls-hide-md">{{ entry.wallet_name }}</td>
            <td class="ls-hide-md">
              <span v-for="label in labels(entry)" :key="label" class="ls-chip">{{ label }}</span>
            </td>
            <td class="ls-r ls-mono" :class="{ 'ls-in': entry.type === 'income' }">
              {{ entry.type === 'income' ? '+' : ''
              }}{{ money(entry.amount, entry.currency, locale) }}
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!transactions.length" class="ls-muted ls-empty">
        {{ t('Shared spending appears here with the name of whoever recorded it.') }}
      </p>
    </div>

    <template #inspector>
      <section>
        <h3 class="ls-h">
          <UsersRound />{{ t('People') }}
          <NuxtLink
            v-if="canManage"
            class="ls-h-link"
            :to="{ path: '/people', query: { invite: '1' } }"
            >{{ t('Invite') }}</NuxtLink
          >
        </h3>
        <ul class="ls-list" data-testid="space-members">
          <li v-for="member in members" :key="member.id" class="ls-member">
            <span class="ls-sq">{{ initials(member.name) }}</span>
            <span class="ls-grow">
              {{ member.name }}
              <small>{{ ROLE_TEXT[member.role] ? t(ROLE_TEXT[member.role]) : '' }}</small>
            </span>
            <span class="ls-chip" :class="`ls-chip--${member.role}`">{{
              roleLabel(member.role)
            }}</span>
          </li>
        </ul>
      </section>

      <section v-if="selected">
        <h3 class="ls-h">
          {{ t('Selected: {name}', { name: selected.description || t('Entry') }) }}
        </h3>
        <dl class="ls-kv">
          <dt>{{ t('Recorded by') }}</dt>
          <dd>{{ selected.contributor }}</dd>
          <dt>{{ t('Date') }}</dt>
          <dd>{{ day(selected.datetime) }}</dd>
          <dt>{{ t('Wallet') }}</dt>
          <dd>{{ selected.wallet_name || t('None') }}</dd>
          <dt>{{ t('Amount') }}</dt>
          <dd class="ls-mono">{{ money(selected.amount, selected.currency, locale) }}</dd>
          <template v-if="labels(selected).length">
            <dt>{{ t('Space label') }}</dt>
            <dd>{{ labels(selected).join(', ') }}</dd>
          </template>
        </dl>
        <p class="ls-muted ls-note">
          {{
            selected.source === 'workspace'
              ? t('It belongs to the space. Anyone who can edit here can change it.')
              : t("It stays {name}'s. Unsharing removes it from the space and its budgets.", {
                  name: selected.contributor
                })
          }}
        </p>
        <div class="ls-actions">
          <button
            v-if="selected.can_edit && selected.source === 'workspace'"
            type="button"
            class="ls-btn ls-btn--ghost"
            @click="compose(selected)"
          >
            <Pencil />{{ t('Edit') }}
          </button>
          <NuxtLink to="/transactions" class="ls-btn ls-btn--ghost"
            ><List />{{ t('All transactions') }}</NuxtLink
          >
        </div>
      </section>

      <p class="ls-priv">
        <Lock />
        <span>{{
          t(
            'Your other wallets, budgets and transactions stay private. Only what you record here or share shows up in a space.'
          )
        }}</span>
      </p>
    </template>
  </LedgerWorkspace>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import {
  AlertCircle,
  List,
  Lock,
  Pencil,
  Share2,
  Target,
  UserPlus,
  UsersRound
} from 'lucide-vue-next';
import LedgerWorkspace from '@/components/ledger/LedgerWorkspace.vue';
import type { WorkspaceMember, WorkspaceTransaction } from '~/types/workspace';
import { spaceUrgency } from '~/utils/activeSpace';
import { money } from '~/utils/ledgerMoney';

const { t, locale } = useI18n();
const api = useApi();
const { space, canManage, isOwner } = useActiveSpace();
const { overview, transactions, ensure } = useSpaceFinance();
const { compose } = useSpaceComposer();
const { resolveComponent } = useExtensionSlots();

const SWATCH = [
  'var(--ledger-brand)',
  'var(--ledger-orange)',
  'var(--ledger-ink-3)',
  'var(--ledger-income)'
];
const ROLE_TEXT: Record<string, string> = {
  owner: 'Manages the space and billing',
  admin: 'Manages budgets, wallets and people',
  member: 'Records and shares spending'
};

const members = ref<WorkspaceMember[]>([]);
const selectedKey = ref<string | null>(null);

const key = (entry: WorkspaceTransaction) => `${entry.source}-${entry.id}`;

const main = computed(() => {
  const totals = overview.value.totals;
  if (!totals.length) {
    return { currency: overview.value.wallets[0]?.currency ?? 'EUR', income: 0, expenses: 0 };
  }
  return [...totals].sort((a, b) => b.expenses - a.expenses)[0];
});

const fmt = (value: number, whole = false) =>
  money(value, main.value.currency, locale.value, whole ? { whole: true } : {});

const subtitle = computed(() =>
  t(
    '{count} people · only shared money shows here',
    { count: space.value?.member_count ?? 1 },
    space.value?.member_count ?? 1
  )
);

const budgetRows = computed(() =>
  overview.value.budgets
    .filter((budget) => budget.currency === main.value.currency)
    .map((budget) => {
      const limit = budget.progress?.effective_limit ?? Number(budget.amount);
      const spent = budget.progress?.net_spent ?? 0;
      return {
        id: budget.id,
        name: budget.name,
        limit,
        spent,
        ratio: limit > 0 ? spent / limit : 0
      };
    })
);

const budgetTotals = computed(() => {
  const limit = budgetRows.value.reduce((sum, row) => sum + row.limit, 0);
  const spent = budgetRows.value.reduce((sum, row) => sum + row.spent, 0);
  return { limit, left: limit - spent };
});

const spaceWallets = computed(() => {
  const own = overview.value.wallets.filter(
    (wallet) => wallet.source === 'workspace' && wallet.currency === main.value.currency
  );
  return {
    count: own.length,
    balance: own.reduce((sum, wallet) => sum + Number(wallet.balance), 0)
  };
});

const memberWallets = computed(() =>
  overview.value.wallets.filter((wallet) => wallet.source === 'shared_wallet')
);

const contributors = computed(() => {
  const sums = new Map<string, number>();
  for (const entry of transactions.value) {
    if (entry.type !== 'expense' || entry.currency !== main.value.currency) continue;
    sums.set(entry.contributor, (sums.get(entry.contributor) ?? 0) + Number(entry.amount));
  }
  const total = [...sums.values()].reduce((a, b) => a + b, 0) || 1;
  return [...sums.entries()]
    .map(([name, amount]) => ({ name, amount, share: amount / total }))
    .sort((a, b) => b.amount - a.amount);
});

const labelNames = computed(() => {
  const map = new Map<number, string>();
  for (const label of [...overview.value.categories, ...overview.value.groups])
    map.set(label.id, label.name);
  return map;
});

function labels(entry: WorkspaceTransaction) {
  return entry.category_ids
    .map((id) => labelNames.value.get(id))
    .filter((name): name is string => !!name);
}

const selected = computed(
  () => transactions.value.find((entry) => key(entry) === selectedKey.value) ?? null
);

watch(
  transactions,
  (rows) => {
    if (!rows.some((entry) => key(entry) === selectedKey.value)) {
      selectedKey.value = rows[0] ? key(rows[0]) : null;
    }
  },
  { immediate: true }
);

const urgent = computed(() => {
  if (!space.value) return null;
  const name = space.value.name;
  switch (spaceUrgency(space.value, overview.value)) {
    case 'unpaid':
      return {
        title: isOwner.value ? t('Activate {name}', { name }) : t('Waiting for the owner'),
        text: isOwner.value
          ? t(
              'This space is a draft. Activate it to share wallets, budgets and spending with the people you invite.'
            )
          : t(
              'The owner needs to activate this space before anyone can make changes. You can still look around.'
            ),
        to: isOwner.value && resolveComponent('cloud.workspace.billing') ? '/space-billing' : '',
        label: t('Activate space')
      };
    case 'no-wallet':
      return {
        title: t('Add the first shared wallet'),
        text: t('A shared wallet is where the money you spend together is recorded.'),
        to: canManage.value ? '/wallets?new=1' : '',
        label: t('Add a shared wallet')
      };
    case 'alone':
      return {
        title: t('Bring someone in'),
        text: t('A shared space works once the people you share money with have joined.'),
        to: canManage.value ? '/people?invite=1' : '',
        label: t('Invite someone')
      };
    case 'over-budget':
      return {
        title: t('A budget has run over'),
        text: t('Check which budget went over and what pushed it there.'),
        to: '/budgets',
        label: t('Review budgets')
      };
    default:
      return null;
  }
});

function roleLabel(role: string) {
  return role === 'owner' ? t('Owner') : role === 'admin' ? t('Admin') : t('Member');
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function day(value: string) {
  return new Date(value).toLocaleDateString(locale.value, { day: '2-digit', month: 'short' });
}

async function loadMembers() {
  if (!space.value) return;
  try {
    members.value = (
      await api<{ data: WorkspaceMember[] }>(`/workspaces/${space.value.slug}/members`)
    ).data;
  } catch (error) {
    console.warn('[ledger] members failed', error);
  }
}

watch(() => space.value?.slug, loadMembers);
onMounted(() => {
  ensure();
  loadMembers();
});
</script>

<style scoped>
.ls-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: var(--ledger-r-sm);
  border: 1px solid var(--ledger-brand);
  background: var(--ledger-brand);
  color: #fff;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.ls-btn--ghost {
  background: var(--ledger-surface);
  border-color: var(--ledger-line);
  color: var(--ledger-ink);
}

.ls-btn :deep(svg) {
  width: 14px;
  height: 14px;
}

.ls-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 14px;
  padding: 10px 12px;
  border: 1px solid var(--ledger-line);
  border-left: 3px solid var(--ledger-orange);
  border-radius: var(--ledger-r);
  background: var(--ledger-surface);
  font-size: 13px;
}

.ls-notice :deep(svg) {
  width: 16px;
  height: 16px;
  flex: none;
  color: var(--ledger-orange-text);
}

.ls-notice a {
  margin-left: auto;
  white-space: nowrap;
  color: var(--ledger-brand);
  font-weight: 600;
}

.ls-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r);
  background: var(--ledger-surface);
  margin-bottom: 14px;
}

.ls-kpis > div {
  padding: 12px 14px;
  border-right: 1px solid var(--ledger-line);
  font-size: 11.5px;
  color: var(--ledger-ink-3);
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.ls-kpis > div:last-child {
  border-right: 0;
}

.ls-kpis small {
  font-size: 11.5px;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ls-num {
  font-family: var(--ledger-mono);
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--ledger-ink);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.ls-in {
  color: var(--ledger-income) !important;
}

.ls-out {
  color: var(--ledger-expense) !important;
}

.ls-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.ls-pan {
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r);
  background: var(--ledger-surface);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.ls-h {
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

.ls-h :deep(svg) {
  width: 14px;
  height: 14px;
}

.ls-h-link {
  margin-left: auto;
  text-transform: none;
  letter-spacing: 0;
  font-size: 12.5px;
  color: var(--ledger-brand);
}

.ls-budget {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 5px;
  font-size: 13px;
}

.ls-bar {
  grid-column: 1 / -1;
  display: block;
  height: 8px;
  border-radius: 2px;
  background: var(--ledger-surface-3);
  overflow: hidden;
}

.ls-bar i {
  display: block;
  height: 100%;
  background: var(--ledger-brand);
}

.ls-bar i.ls-warn {
  background: var(--ledger-orange);
}

.ls-stack {
  display: flex;
  height: 10px;
  border-radius: 2px;
  overflow: hidden;
  gap: 2px;
}

.ls-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.ls-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid var(--ledger-line);
  font-size: 13px;
}

.ls-list li:last-child {
  border-bottom: 0;
}

.ls-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex: none;
}

.ls-grow {
  flex: 1;
  min-width: 0;
}

.ls-grow small {
  display: block;
  font-size: 12px;
  color: var(--ledger-ink-3);
}

.ls-pct {
  width: 40px;
  text-align: right;
}

.ls-mono {
  font-family: var(--ledger-mono);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.ls-muted {
  color: var(--ledger-ink-3);
  font-size: 12.5px;
  margin: 0;
}

.ls-wrap {
  overflow-x: auto;
}

.ls-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.ls-table th {
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

.ls-table td {
  padding: 8px;
  border-bottom: 1px solid var(--ledger-line);
  vertical-align: middle;
}

.ls-table tbody tr {
  cursor: pointer;
  outline: none;
}

.ls-table tbody tr:hover,
.ls-table tbody tr:focus-visible {
  background: var(--ledger-surface);
}

.ls-table tr.ls-sel {
  background: var(--ledger-surface);
  box-shadow: inset 2px 0 0 var(--ledger-orange);
}

.ls-r {
  text-align: right !important;
}

.ls-who {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

.ls-sq {
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
  flex: none;
  border-radius: var(--ledger-r-sm);
  background: var(--ledger-surface-3);
  color: var(--ledger-ink-2);
  font-size: 10.5px;
  font-weight: 700;
}

.ls-member .ls-sq {
  width: 30px;
  height: 30px;
}

.ls-chip {
  display: inline-block;
  margin-right: 4px;
  padding: 2px 7px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  background: var(--ledger-surface-2);
  color: var(--ledger-ink-2);
}

.ls-chip--owner {
  background: var(--ledger-orange-soft);
  color: var(--ledger-orange-text);
}

.ls-chip--admin {
  background: var(--ledger-brand-soft);
  color: var(--ledger-brand);
}

.ls-empty {
  padding: 16px 8px;
}

.ls-kv {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 14px;
  margin: 0;
  font-size: 13px;
}

.ls-kv dt {
  color: var(--ledger-ink-3);
}

.ls-kv dd {
  margin: 0;
}

.ls-note {
  margin-top: 8px;
}

.ls-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.ls-priv {
  display: flex;
  gap: 10px;
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--ledger-r);
  background: var(--ledger-surface-2);
  font-size: 12.5px;
  color: var(--ledger-ink-2);
}

.ls-priv :deep(svg) {
  width: 15px;
  height: 15px;
  flex: none;
  margin-top: 1px;
}

@media (max-width: 1279px) {
  .ls-hide-md {
    display: none;
  }

  .ls-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ls-kpis > div:nth-child(2) {
    border-right: 0;
  }

  .ls-kpis > div:nth-child(-n + 2) {
    border-bottom: 1px solid var(--ledger-line);
  }
}

@media (max-width: 767px) {
  .ls-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
