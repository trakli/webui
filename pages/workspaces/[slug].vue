<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import {
  DsPageHeader,
  DsTabs,
  DsCard,
  DsButton,
  DsChip,
  DsModal,
  DsInput,
  DsDropdown,
  DsStatePanel,
  DsDataTable,
  DsSwitch
} from '@whilesmart/design';
import BudgetCard from '~/components/budgets/BudgetCard.vue';
import BudgetForm from '~/components/budgets/BudgetForm.vue';
import WorkspaceShareModal from '~/components/workspaces/WorkspaceShareModal.vue';
import WorkspaceMembers from '~/components/workspaces/WorkspaceMembers.vue';
import WorkspaceTransactionActions from '~/components/workspaces/WorkspaceTransactionActions.vue';
import type {
  Workspace,
  WorkspaceOverview,
  WorkspaceTransaction,
  WorkspaceWallet,
  Page
} from '~/types/workspace';
import type { Budget, BudgetCreatePayload } from '~/types/budget';
import { extractApiErrors } from '~/utils/apiErrors';

definePageMeta({ layout: 'dashboard', middleware: 'auth' });
const route = useRoute();
const api = useApi();
const { resolveComponent } = useExtensionSlots();
const billingComponent = resolveComponent('cloud.workspace.billing');
const { load: reloadSpaces } = useWorkspaces();
const workspace = ref<Workspace | null>(null);
const overview = ref<WorkspaceOverview>({
  wallets: [],
  budgets: [],
  categories: [],
  groups: [],
  totals: []
});
const transactions = ref<WorkspaceTransaction[]>([]);
const loading = ref(true);
const error = ref('');
const busy = ref(false);
const tab = ref('overview');
const page = ref(1);
const lastPage = ref(1);
const base = computed(() => `/workspaces/${String(route.params.slug)}`);
const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'budgets', label: 'Budgets' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'wallets', label: 'Wallets' },
  { key: 'members', label: 'People' }
];
const canManage = computed(() => !!workspace.value?.can_manage && !workspace.value?.read_only);
const canWrite = computed(() => !!workspace.value && !workspace.value.read_only);
const nativeWallets = computed(() =>
  overview.value.wallets.filter((wallet) => wallet.source === 'workspace')
);
const walletOptions = computed(() =>
  nativeWallets.value.map((wallet) => ({
    value: String(wallet.id),
    label: `${wallet.name} (${wallet.currency})`
  }))
);
const sharing = ref(false);
const budgetOpen = ref(false);
const editingBudget = ref<Budget | null>(null);
const walletOpen = ref(false);
const editingWallet = ref<WorkspaceWallet | null>(null);
const transactionOpen = ref(false);
const editingTransaction = ref<WorkspaceTransaction | null>(null);
const classifying = ref<WorkspaceTransaction | null>(null);
const categoryIds = ref<number[]>([]);
const groupIds = ref<number[]>([]);
const labelOpen = ref(false);
const labelForm = reactive({ name: '', kind: 'categories', type: 'expense' });
const walletForm = reactive({ name: '', type: 'cash', currency: 'USD', balance: '0' });
const transactionForm = reactive({
  wallet_id: '',
  amount: '',
  type: 'expense',
  datetime: '',
  description: '',
  is_refund: false
});
const confirmation = ref<{
  title: string;
  description: string;
  action: () => Promise<unknown>;
} | null>(null);
const budgetDetail = ref<Budget | null>(null);
const budgetEntries = ref<WorkspaceTransaction[]>([]);
const budgetHistory = ref<
  Array<{
    id: number;
    period_start: string;
    period_end: string;
    net_spent: string;
    rollover_out: string;
  }>
>([]);
const budgetEntriesLoading = ref(false);
const budgetPage = ref(1);
const budgetLastPage = ref(1);
let loadId = 0;
function money(value: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
}
function localDateTime(value = new Date()) {
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
async function reload() {
  const id = ++loadId;
  const path = base.value;
  error.value = '';
  try {
    const [space, finance, entries] = await Promise.all([
      api<{ data: Workspace }>(path),
      api<{ data: WorkspaceOverview }>(`${path}/finance`),
      api<{ data: Page<WorkspaceTransaction> }>(`${path}/transactions`, {
        query: { page: page.value }
      })
    ]);
    if (id !== loadId) return;
    workspace.value = space.data;
    overview.value = finance.data;
    transactions.value = entries.data.data;
    lastPage.value = entries.data.last_page;
  } catch (cause) {
    if (id === loadId) error.value = extractApiErrors(cause);
  } finally {
    if (id === loadId) loading.value = false;
  }
}
async function run(action: () => Promise<unknown>, close?: () => void) {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  try {
    await action();
    close?.();
    confirmation.value = null;
    await reload();
    await reloadSpaces();
  } catch (cause) {
    error.value = extractApiErrors(cause);
  } finally {
    busy.value = false;
  }
}
function openWallet(wallet?: WorkspaceWallet) {
  editingWallet.value = wallet || null;
  Object.assign(walletForm, {
    name: wallet?.name || '',
    type: wallet?.type || 'cash',
    currency: wallet?.currency || 'USD',
    balance: String(wallet?.balance || 0)
  });
  walletOpen.value = true;
}
function saveWallet() {
  return run(
    () =>
      api(`${base.value}/wallets${editingWallet.value ? '/' + editingWallet.value.id : ''}`, {
        method: editingWallet.value ? 'PUT' : 'POST',
        body: {
          ...walletForm,
          currency: walletForm.currency.toUpperCase(),
          balance: Number(walletForm.balance)
        }
      }),
    () => {
      walletOpen.value = false;
    }
  );
}
function openTransaction(transaction?: WorkspaceTransaction) {
  editingTransaction.value = transaction || null;
  Object.assign(transactionForm, {
    wallet_id: String(transaction?.wallet_id || nativeWallets.value[0]?.id || ''),
    amount: transaction ? String(transaction.amount) : '',
    type: transaction?.type || 'expense',
    datetime: transaction ? localDateTime(new Date(transaction.datetime)) : localDateTime(),
    description: transaction?.description || '',
    is_refund: transaction?.is_refund || false
  });
  transactionOpen.value = true;
}
function saveTransaction() {
  return run(
    () =>
      api(
        `${base.value}/transactions${editingTransaction.value ? '/' + editingTransaction.value.id : ''}`,
        {
          method: editingTransaction.value ? 'PUT' : 'POST',
          body: {
            ...transactionForm,
            amount: Number(transactionForm.amount),
            wallet_id: Number(transactionForm.wallet_id),
            datetime: new Date(transactionForm.datetime).toISOString(),
            is_refund: transactionForm.type === 'income' && transactionForm.is_refund
          }
        }
      ),
    () => {
      transactionOpen.value = false;
    }
  );
}
function saveBudget(payload: BudgetCreatePayload & { id?: number }) {
  const { id, ...body } = payload;
  return run(
    () => api(`${base.value}/budgets${id ? '/' + id : ''}`, { method: id ? 'PUT' : 'POST', body }),
    () => {
      budgetOpen.value = false;
    }
  );
}
function openBudget(budget?: Budget) {
  editingBudget.value = budget || null;
  budgetOpen.value = true;
}
function deleteBudget(budget: Budget) {
  confirmation.value = {
    title: `Delete ${budget.name}?`,
    description: 'This removes the budget. Its transactions stay in this space.',
    action: () => api(`${base.value}/budgets/${budget.id}`, { method: 'DELETE' })
  };
}
function revokeWallet(wallet: WorkspaceWallet) {
  confirmation.value = {
    title: `Unshare ${wallet.name}?`,
    description:
      'This space will lose access to this wallet and all separately shared entries from it. Open budgets will be recalculated.',
    action: () => api(`${base.value}/shares/wallets/${wallet.id}`, { method: 'DELETE' })
  };
}
function deleteWallet(wallet: WorkspaceWallet) {
  confirmation.value = {
    title: `Delete ${wallet.name}?`,
    description:
      'Only an empty wallet can be deleted. Its opening balance will be removed from this space.',
    action: () => api(`${base.value}/wallets/${wallet.id}`, { method: 'DELETE' })
  };
}
function removeTransaction(transaction: WorkspaceTransaction) {
  confirmation.value = {
    title: 'Delete this workspace transaction?',
    description: 'Its amount will be reversed in the shared wallet and open budgets will update.',
    action: () => api(`${base.value}/transactions/${transaction.id}`, { method: 'DELETE' })
  };
}
function unshareTransaction(transaction: WorkspaceTransaction) {
  confirmation.value = {
    title: 'Unshare this transaction?',
    description:
      'The original stays in your personal finances. If its whole wallet is shared, wallet access continues until the wallet is unshared.',
    action: () => api(`${base.value}/shares/transactions/${transaction.id}`, { method: 'DELETE' })
  };
}
function classify(transaction: WorkspaceTransaction) {
  classifying.value = transaction;
  categoryIds.value = [...transaction.category_ids];
  groupIds.value = [...transaction.group_ids];
}
function saveClassification() {
  return run(
    () =>
      api(`${base.value}/transactions/${classifying.value!.id}/classification`, {
        method: 'PUT',
        body: { category_ids: categoryIds.value, group_ids: groupIds.value }
      }),
    () => {
      classifying.value = null;
    }
  );
}
async function openBudgetDetail(budget: Budget, nextPage = 1) {
  budgetDetail.value = budget;
  budgetEntriesLoading.value = true;
  budgetEntries.value = [];
  budgetHistory.value = [];
  budgetPage.value = nextPage;
  try {
    const result = await api<{ data: Page<WorkspaceTransaction> }>(
      `${base.value}/budgets/${budget.id}/transactions`,
      { query: { page: nextPage } }
    );
    budgetEntries.value = result.data.data;
    budgetHistory.value = (
      await api<{ data: Page<(typeof budgetHistory.value)[number]> }>(
        `${base.value}/budgets/${budget.id}/periods`
      )
    ).data.data;
    budgetLastPage.value = result.data.last_page;
  } catch (cause) {
    error.value = extractApiErrors(cause);
  } finally {
    budgetEntriesLoading.value = false;
  }
}
function requestCloseBudget() {
  const budget = budgetDetail.value;
  if (!budget) return;
  budgetDetail.value = null;
  confirmation.value = {
    title: 'Close this ended period?',
    description: 'This saves its spending total and carries the remainder into the next period.',
    action: () => api(`${base.value}/budgets/${budget.id}/close-period`, { method: 'POST' })
  };
}
function leave() {
  confirmation.value = {
    title: `Leave ${workspace.value?.name}?`,
    description:
      'Your personal shares will be revoked. Records you added to workspace wallets stay with the space.',
    action: async () => {
      await api(`${base.value}/leave`, { method: 'POST' });
      await reloadSpaces();
      await navigateTo('/workspaces');
    }
  };
}
onMounted(reload);
watch(
  () => route.params.slug,
  () => {
    workspace.value = null;
    overview.value = { wallets: [], budgets: [], categories: [], groups: [], totals: [] };
    transactions.value = [];
    page.value = 1;
    tab.value = 'overview';
    loading.value = true;
    reload();
  }
);
</script>

<template>
  <main class="workspace-page">
    <DsStatePanel v-if="loading" state="loading" title="Opening your shared space" />
    <DsStatePanel
      v-else-if="!workspace"
      state="error"
      title="This space is unavailable"
      :description="error"
      action-label="Back to your spaces"
      @action="navigateTo('/workspaces')"
    />
    <template v-else>
      <DsPageHeader
        :title="workspace.name"
        eyebrow="Shared space"
        :description="workspace.description || 'A clear view of the money you share.'"
      >
        <template #actions
          ><DsButton v-if="canWrite" variant="secondary" @click="sharing = true"
            >Share personal spending</DsButton
          ><DsButton
            v-if="canWrite && nativeWallets.length"
            icon="solar:add-circle-linear"
            @click="openTransaction()"
            >Record transaction</DsButton
          ></template
        >
      </DsPageHeader>
      <component
        :is="billingComponent"
        v-if="billingComponent"
        :key="workspace.slug"
        :workspace="workspace"
        @changed="reload"
      />
      <DsCard v-if="workspace.read_only" class="readonly"
        ><DsChip variant="warning">Read-only</DsChip>
        <p>
          Changes to this space are currently unavailable. You can still view its records, leave, or
          revoke your personal shares.
        </p>
      </DsCard>
      <p v-if="error" role="alert" class="error">{{ error }}</p>
      <DsTabs v-model="tab" :options="tabs" area="green" label="Shared finances" />
      <template v-if="tab === 'overview'">
        <div class="summary-grid">
          <DsCard
            ><span class="eyebrow">People</span
            ><strong class="big-number">{{ workspace.member_count }}</strong>
            <p>Planning together</p>
            <DsButton variant="ghost" size="sm" @click="tab = 'members'"
              >Meet your people</DsButton
            ></DsCard
          ><DsCard
            ><span class="eyebrow">Budgets</span
            ><strong class="big-number">{{
              overview.budgets.filter((budget) => budget.is_active).length
            }}</strong>
            <p>Active spending plans</p>
            <DsButton variant="ghost" size="sm" @click="tab = 'budgets'"
              >View budgets</DsButton
            ></DsCard
          ><DsCard
            ><span class="eyebrow">Wallets</span
            ><strong class="big-number">{{ overview.wallets.length }}</strong>
            <p>Shared with this space</p>
            <DsButton variant="ghost" size="sm" @click="tab = 'wallets'"
              >View wallets</DsButton
            ></DsCard
          >
        </div>
        <div v-if="overview.totals.length" class="summary-grid">
          <DsCard v-for="total in overview.totals" :key="total.currency"
            ><span class="eyebrow">All-time shared spending · {{ total.currency }}</span
            ><strong class="big-number">{{ money(total.expenses, total.currency) }}</strong>
            <p>Income {{ money(total.income, total.currency) }}</p></DsCard
          >
        </div>
        <header class="section-header">
          <div>
            <h2>Your shared plan</h2>
            <p>Spending limits for the things that matter to everyone.</p>
          </div>
          <DsButton v-if="canManage" @click="openBudget()">Create budget</DsButton>
        </header>
        <DsStatePanel
          v-if="!overview.budgets.length"
          title="Give your spending a plan"
          :description="
            canManage
              ? 'Set a limit for groceries, a trip, or all your shared spending.'
              : 'An admin can create your first shared budget.'
          "
          :action-label="canManage ? 'Create budget' : ''"
          @action="openBudget()"
        />
        <div class="budget-grid">
          <BudgetCard
            v-for="budget in overview.budgets.slice(0, 3)"
            :key="budget.id"
            :budget="budget"
            :editable="canManage"
            :to="null"
            @edit="openBudget"
            @delete="deleteBudget"
            @open="openBudgetDetail"
          />
        </div>
      </template>
      <template v-if="tab === 'budgets'">
        <header class="section-header">
          <h2>Budgets</h2>
          <DsButton v-if="canManage" @click="openBudget()">Create budget</DsButton>
        </header>
        <DsStatePanel
          v-if="!overview.budgets.length"
          title="Your first shared budget"
          description="Start with a monthly limit, then narrow it to shared wallets or workspace categories."
          :action-label="canManage ? 'Create budget' : ''"
          @action="openBudget()"
        />
        <div class="budget-grid">
          <BudgetCard
            v-for="budget in overview.budgets"
            :key="budget.id"
            :budget="budget"
            :editable="canManage"
            :to="null"
            @edit="openBudget"
            @delete="deleteBudget"
            @open="openBudgetDetail"
          />
        </div>
        <DsCard v-if="canManage" class="labels"
          ><div>
            <h3>Budget labels</h3>
            <p>Categories and groups here belong to this space. Personal labels stay personal.</p>
          </div>
          <div class="chips">
            <DsChip v-for="label in overview.categories" :key="`c-${label.id}`">{{
              label.name
            }}</DsChip
            ><DsChip v-for="label in overview.groups" :key="`g-${label.id}`">{{
              label.name
            }}</DsChip>
          </div>
          <DsButton variant="secondary" @click="labelOpen = true"
            >Add a category or group</DsButton
          ></DsCard
        >
      </template>
      <template v-if="tab === 'wallets'">
        <header class="section-header">
          <div>
            <h2>Shared wallets</h2>
            <p>
              Workspace wallets belong to everyone here. Personal wallets stay with their owners.
            </p>
          </div>
          <DsButton v-if="canManage" @click="openWallet()">Create shared wallet</DsButton>
        </header>
        <DsStatePanel
          v-if="!overview.wallets.length"
          title="Make room for shared spending"
          :description="
            canManage
              ? 'Create a shared wallet, or share one you already own.'
              : 'Share a personal wallet, or ask an admin to create a workspace wallet.'
          "
          :action-label="canWrite ? 'Share a personal wallet' : ''"
          @action="sharing = true"
        />
        <div class="budget-grid">
          <DsCard v-for="wallet in overview.wallets" :key="wallet.id" class="wallet-card"
            ><DsChip :variant="wallet.source === 'workspace' ? 'primary' : 'default'">{{
              wallet.source === 'workspace' ? 'Workspace owned' : 'Personal wallet shared'
            }}</DsChip>
            <h3>{{ wallet.name }}</h3>
            <strong class="big-number">{{ money(wallet.balance, wallet.currency) }}</strong>
            <div class="actions">
              <DsButton v-if="wallet.can_edit" variant="ghost" @click="openWallet(wallet)"
                >Edit</DsButton
              ><DsButton v-if="wallet.can_edit" variant="ghost" @click="deleteWallet(wallet)"
                >Delete</DsButton
              ><DsButton v-if="wallet.can_unshare" variant="ghost" @click="revokeWallet(wallet)"
                >Unshare</DsButton
              >
            </div></DsCard
          >
        </div>
      </template>
      <template v-if="tab === 'transactions'">
        <header class="section-header">
          <div>
            <h2>Shared transactions</h2>
            <p>Original records, counted once in this space.</p>
          </div>
          <DsButton v-if="canWrite && nativeWallets.length" @click="openTransaction()"
            >Record transaction</DsButton
          >
        </header>
        <DsStatePanel
          v-if="!transactions.length"
          title="Nothing shared yet"
          description="Record an expense in a workspace wallet, or share a personal entry."
          :action-label="canWrite ? 'Share personal spending' : ''"
          @action="sharing = true"
        />
        <DsDataTable
          v-else
          class="desktop-ledger"
          :rows="transactions as unknown as Record<string, unknown>[]"
          :columns="[
            { key: 'datetime', label: 'Date' },
            { key: 'description', label: 'Transaction' },
            { key: 'contributor', label: 'Added by' },
            { key: 'amount', label: 'Amount', align: 'right' },
            { key: 'actions', label: 'Actions', align: 'right' }
          ]"
        >
          <template #cell-datetime="{ row }">{{
            new Date(String(row.datetime)).toLocaleDateString()
          }}</template>
          <template #cell-description="{ row }"
            ><strong>{{ row.description || row.type }}</strong>
            <p>{{ row.wallet_name || 'One personal entry shared' }}</p></template
          >
          <template #cell-amount="{ row }"
            ><span :class="row.type === 'expense' ? 'expense' : 'income'"
              >{{ row.type === 'expense' ? '−' : '+'
              }}{{ money(Number(row.amount), String(row.currency)) }}</span
            ></template
          >
          <template #cell-actions="{ row }"
            ><WorkspaceTransactionActions
              :transaction="row as unknown as WorkspaceTransaction"
              :can-manage="canManage"
              @edit="openTransaction"
              @classify="classify"
              @remove="removeTransaction"
              @unshare="unshareTransaction"
          /></template>
        </DsDataTable>
        <div v-if="transactions.length" class="mobile-ledger">
          <DsCard v-for="transaction in transactions" :key="transaction.id" padding="sm"
            ><div class="entry-heading">
              <strong>{{ transaction.description || transaction.type }}</strong
              ><span :class="transaction.type === 'expense' ? 'expense' : 'income'"
                >{{ transaction.type === 'expense' ? '−' : '+'
                }}{{ money(transaction.amount, transaction.currency) }}</span
              >
            </div>
            <p>
              {{ new Date(transaction.datetime).toLocaleDateString() }} ·
              {{ transaction.contributor }}
            </p>
            <p>{{ transaction.wallet_name || 'One personal entry shared' }}</p>
            <WorkspaceTransactionActions
              :transaction="transaction"
              :can-manage="canManage"
              @edit="openTransaction"
              @classify="classify"
              @remove="removeTransaction"
              @unshare="unshareTransaction"
          /></DsCard>
        </div>
        <div v-if="lastPage > 1" class="actions">
          <DsButton
            variant="ghost"
            :disabled="page <= 1 || busy"
            @click="
              page--;
              reload();
            "
            >Previous</DsButton
          ><span>Page {{ page }} of {{ lastPage }}</span
          ><DsButton
            variant="ghost"
            :disabled="page >= lastPage || busy"
            @click="
              page++;
              reload();
            "
            >Next</DsButton
          >
        </div>
      </template>
      <WorkspaceMembers
        v-if="tab === 'members'"
        :key="workspace.id"
        :workspace="workspace"
        @changed="reload"
      />
      <div class="space-footer">
        <DsButton to="/workspaces" variant="ghost">All your spaces</DsButton
        ><DsButton v-if="workspace.role !== 'owner'" variant="ghost" @click="leave"
          >Leave this space</DsButton
        >
      </div>
      <WorkspaceShareModal v-model="sharing" :workspace="workspace.slug" @saved="reload" />
      <DsModal
        v-model="budgetOpen"
        :title="editingBudget ? 'Edit shared budget' : 'Create shared budget'"
        size="lg"
        ><BudgetForm
          v-if="budgetOpen"
          :editing-item="editingBudget"
          :workspace-targets="overview"
          :is-submitting="busy"
          :api-error="error"
          @created="saveBudget"
          @updated="saveBudget"
          @close="budgetOpen = false"
      /></DsModal>
      <DsModal
        v-model="walletOpen"
        :title="editingWallet ? 'Edit shared wallet' : 'Create shared wallet'"
        description="This wallet belongs to the space. Its records remain if a member leaves."
        ><form class="editor" @submit.prevent="saveWallet">
          <DsInput v-model="walletForm.name" label="Wallet name" required /><DsDropdown
            v-model="walletForm.type"
            label="Wallet type"
            :options="[
              { value: 'cash', label: 'Cash' },
              { value: 'bank', label: 'Bank' },
              { value: 'mobile', label: 'Mobile money' },
              { value: 'credit_card', label: 'Credit card' }
            ]"
          /><DsInput
            v-model="walletForm.currency"
            label="Currency code"
            required
            maxlength="3"
          /><DsInput
            v-model="walletForm.balance"
            label="Current balance"
            type="number"
            step="any"
          />
          <p v-if="error" role="alert">{{ error }}</p>
          <DsButton type="submit" :loading="busy">Save wallet</DsButton>
        </form></DsModal
      >
      <DsModal
        v-model="transactionOpen"
        :title="editingTransaction ? 'Edit shared transaction' : 'Record shared spending'"
        ><form class="editor" @submit.prevent="saveTransaction">
          <DsDropdown
            v-model="transactionForm.wallet_id"
            label="Workspace wallet"
            :options="walletOptions"
          /><DsDropdown
            v-model="transactionForm.type"
            label="Type"
            :options="[
              { value: 'expense', label: 'Expense' },
              { value: 'income', label: 'Income' }
            ]"
          /><DsInput
            v-model="transactionForm.amount"
            type="number"
            label="Amount"
            min="0.0001"
            step="any"
            required
          />
          <div class="field">
            <label for="shared-tx-date">Date and time</label
            ><input
              id="shared-tx-date"
              v-model="transactionForm.datetime"
              type="datetime-local"
              required
              class="ds-field__control"
            />
          </div>
          <DsInput v-model="transactionForm.description" label="What was it for?" /><DsSwitch
            v-if="transactionForm.type === 'income'"
            v-model="transactionForm.is_refund"
            label="This is a refund"
            description="Refunds reduce the spending counted against shared budgets."
          />
          <p v-if="error" role="alert">{{ error }}</p>
          <DsButton type="submit" :disabled="!transactionForm.wallet_id" :loading="busy"
            >Save transaction</DsButton
          >
        </form></DsModal
      >
      <DsModal v-model="labelOpen" title="Add a workspace label"
        ><form
          class="editor"
          @submit.prevent="
            run(
              () => api(`${base}/labels/${labelForm.kind}`, { method: 'POST', body: labelForm }),
              () => {
                labelOpen = false;
                labelForm.name = '';
              }
            )
          "
        >
          <DsInput v-model="labelForm.name" label="Name" required /><DsDropdown
            v-model="labelForm.kind"
            label="Label kind"
            :options="[
              { value: 'categories', label: 'Category' },
              { value: 'groups', label: 'Transaction group' }
            ]"
          /><DsDropdown
            v-if="labelForm.kind === 'categories'"
            v-model="labelForm.type"
            label="Applies to"
            :options="[
              { value: 'expense', label: 'Expenses' },
              { value: 'income', label: 'Income' }
            ]"
          />
          <p v-if="error" role="alert">{{ error }}</p>
          <DsButton type="submit" :loading="busy">Add label</DsButton>
        </form></DsModal
      >
      <DsModal
        :model-value="!!classifying"
        title="Classify for this space"
        description="These labels affect shared budgets. The personal original stays unchanged."
        @update:model-value="!$event && (classifying = null)"
        ><form class="editor" @submit.prevent="saveClassification">
          <fieldset>
            <legend>Categories</legend>
            <label v-for="category in overview.categories" :key="category.id"
              ><input v-model="categoryIds" type="checkbox" :value="category.id" />
              {{ category.name }}</label
            >
            <p v-if="!overview.categories.length">Add a category from the Budgets tab first.</p>
          </fieldset>
          <fieldset>
            <legend>Groups</legend>
            <label v-for="group in overview.groups" :key="group.id"
              ><input v-model="groupIds" type="checkbox" :value="group.id" />
              {{ group.name }}</label
            >
          </fieldset>
          <p v-if="error" role="alert">{{ error }}</p>
          <DsButton type="submit" :loading="busy">Save classification</DsButton>
        </form></DsModal
      >
      <DsModal
        :model-value="!!budgetDetail"
        :title="budgetDetail?.name || 'Budget details'"
        size="lg"
        @update:model-value="!$event && (budgetDetail = null)"
        ><div class="editor">
          <p v-if="error" role="alert">{{ error }}</p>
          <DsStatePanel
            v-if="budgetEntriesLoading"
            state="loading"
            title="Loading budget spending"
          /><DsStatePanel
            v-else-if="!budgetEntries.length"
            title="No spending in this period"
            description="Shared entries matching this budget will appear here."
          /><DsCard
            v-for="entry in budgetEntries"
            :key="entry.id"
            padding="sm"
            class="section-header"
            ><div>
              <strong>{{ entry.description || entry.type }}</strong>
              <p>{{ entry.contributor }} · {{ new Date(entry.datetime).toLocaleDateString() }}</p>
            </div>
            <strong>{{ money(entry.amount, entry.currency) }}</strong></DsCard
          >
          <div v-if="budgetLastPage > 1" class="actions">
            <DsButton
              variant="ghost"
              :disabled="budgetPage <= 1"
              @click="budgetDetail && openBudgetDetail(budgetDetail, budgetPage - 1)"
              >Previous</DsButton
            ><DsButton
              variant="ghost"
              :disabled="budgetPage >= budgetLastPage"
              @click="budgetDetail && openBudgetDetail(budgetDetail, budgetPage + 1)"
              >Next</DsButton
            >
          </div>
          <template v-if="budgetHistory.length"
            ><h3>Closed periods</h3>
            <DsCard v-for="period in budgetHistory" :key="period.id" padding="sm"
              ><strong
                >{{ period.period_start.slice(0, 10) }} to
                {{ period.period_end.slice(0, 10) }}</strong
              >
              <p>
                Spent {{ money(Number(period.net_spent), budgetDetail!.currency) }} · Carried
                forward {{ money(Number(period.rollover_out), budgetDetail!.currency) }}
              </p></DsCard
            ></template
          >
          <DsButton
            v-if="
              budgetDetail?.rollover_enabled &&
              canManage &&
              new Date(budgetDetail.progress?.period_end || budgetDetail.end_date || '2999-12-31') <
                new Date()
            "
            variant="secondary"
            @click="requestCloseBudget"
            >Close ended period</DsButton
          >
        </div></DsModal
      >
      <DsModal
        :model-value="!!confirmation"
        :title="confirmation?.title || 'Confirm'"
        :description="confirmation?.description"
        @update:model-value="!$event && (confirmation = null)"
        ><p v-if="error" role="alert">{{ error }}</p>
        <div class="actions">
          <DsButton variant="ghost" @click="confirmation = null">Cancel</DsButton
          ><DsButton :loading="busy" @click="confirmation && run(confirmation.action)"
            >Confirm</DsButton
          >
        </div></DsModal
      >
    </template>
  </main>
</template>

<style scoped>
.mobile-ledger {
  display: none;
}
.entry-heading {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--ds-space-3);
}
.workspace-page {
  display: grid;
  gap: var(--ds-space-5);
  color: var(--ds-text-primary);
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
  gap: var(--ds-space-4);
}
.summary-grid :deep(.ds-card) {
  display: grid;
  justify-items: start;
  gap: var(--ds-space-2);
}
.big-number {
  display: block;
  font-size: var(--ds-text-2xl);
  font-weight: var(--ds-font-bold);
}
.eyebrow {
  font-size: var(--ds-text-xs);
  font-weight: var(--ds-font-bold);
  color: var(--ds-text-secondary);
}
h2,
h3,
p {
  margin: 0;
}
p {
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-sm);
  line-height: 1.6;
}
.section-header,
.actions,
.readonly,
.space-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--ds-space-3);
}
.actions {
  justify-content: flex-end;
  flex-wrap: wrap;
}
.budget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: var(--ds-space-4);
}
.wallet-card,
.labels,
.editor {
  display: grid;
  gap: var(--ds-space-4);
}
.wallet-card :deep(.ds-chip) {
  justify-self: start;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-2);
}
.field {
  display: grid;
  gap: var(--ds-space-2);
}
fieldset {
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-card);
  padding: var(--ds-space-4);
  display: grid;
  gap: var(--ds-space-2);
}
.error,
.expense {
  color: var(--ds-status-error-text);
  background: var(--ds-status-error-bg);
  border-radius: var(--ds-radius-full);
  padding: var(--ds-space-1) var(--ds-space-2);
}
.income {
  color: var(--ds-status-success-text);
  background: var(--ds-status-success-bg);
  border-radius: var(--ds-radius-full);
  padding: var(--ds-space-1) var(--ds-space-2);
}
.readonly {
  background: var(--ds-status-warning-bg);
}
.space-footer {
  border-top: 1px solid var(--ds-border-base);
  padding-top: var(--ds-space-4);
}
@media (max-width: 600px) {
  .desktop-ledger {
    display: none;
  }
  .mobile-ledger {
    display: grid;
    gap: var(--ds-space-3);
  }
  .mobile-ledger :deep(.ds-card) {
    display: grid;
    gap: var(--ds-space-2);
  }
  .section-header,
  .readonly {
    flex-direction: column;
    align-items: stretch;
  }
  .actions {
    justify-content: start;
  }
  .section-header > :deep(.ds-button),
  .editor > :deep(.ds-button) {
    width: 100%;
  }
}
</style>
