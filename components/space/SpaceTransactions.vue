<template>
  <div class="space-page">
    <header class="page-head">
      <div>
        <h1>{{ t('Transactions') }}</h1>
        <p>{{ t('Everything recorded in or shared with {name}.', { name: space?.name ?? '' }) }}</p>
      </div>
      <div v-if="canWrite" class="page-actions">
        <TButton
          variant="secondary"
          :full-width="false"
          :text="t('Share personal spending')"
          @click="sharing = true"
        />
        <TButton :full-width="false" :text="t('Record a transaction')" @click="compose()" />
      </div>
    </header>

    <div class="filters" role="toolbar" :aria-label="t('Filters')">
      <div class="segmented">
        <button
          v-for="option in typeOptions"
          :key="option.value"
          type="button"
          :class="{ active: filters.type === option.value }"
          :aria-pressed="filters.type === option.value"
          @click="setType(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
      <select
        v-if="overview.wallets.length > 1"
        v-model="filters.wallet_id"
        class="wallet-filter"
        :aria-label="t('Wallet')"
        @change="load(1)"
      >
        <option value="">{{ t('All wallets') }}</option>
        <option v-for="wallet in overview.wallets" :key="wallet.id" :value="wallet.id">
          {{ wallet.name }}
        </option>
      </select>
    </div>

    <ComponentLoader
      :is-loading="!ready && !error"
      :error="error"
      :has-data="ready && transactions.length > 0"
      skeleton-variant="table"
      :on-retry="() => load(1)"
    >
      <table class="ledger">
        <thead>
          <tr>
            <th>{{ t('Date') }}</th>
            <th>{{ t('Description') }}</th>
            <th>{{ t('Recorded by') }}</th>
            <th>{{ t('Wallet') }}</th>
            <th>{{ t('Categories') }}</th>
            <th class="num">{{ t('Amount') }}</th>
            <th>
              <span class="sr-only">{{ t('Actions') }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in transactions" :key="entry.id">
            <td class="muted">{{ formatDate(entry.datetime) }}</td>
            <td>
              <span class="title">{{ entry.description || typeLabel(entry.type) }}</span>
              <span v-if="entry.source !== 'workspace'" class="chip">{{ t('Shared') }}</span>
              <span v-if="entry.is_refund" class="chip">{{ t('Refund') }}</span>
            </td>
            <td class="muted">{{ entry.contributor }}</td>
            <td class="muted">{{ entry.wallet_name ?? t('Private wallet') }}</td>
            <td>
              <span v-for="name in labelNames(entry)" :key="name" class="chip chip--label">
                {{ name }}
              </span>
            </td>
            <td class="num amount" :class="`amount--${entry.type}`">
              {{ entry.type === 'expense' ? '−' : '+'
              }}{{ spaceMoney(entry.amount, entry.currency) }}
            </td>
            <td class="row-actions">
              <SpaceRowActions :items="actionsFor(entry)" />
            </td>
          </tr>
        </tbody>
      </table>

      <ul class="cards">
        <li v-for="entry in transactions" :key="entry.id" class="card">
          <div class="card-top">
            <span class="title">{{ entry.description || typeLabel(entry.type) }}</span>
            <span class="amount" :class="`amount--${entry.type}`">
              {{ entry.type === 'expense' ? '−' : '+'
              }}{{ spaceMoney(entry.amount, entry.currency) }}
            </span>
          </div>
          <div class="card-meta">
            {{ entry.contributor }} · {{ formatDate(entry.datetime) }}
            <template v-if="entry.wallet_name">· {{ entry.wallet_name }}</template>
          </div>
          <div class="card-bottom">
            <span>
              <span v-for="name in labelNames(entry)" :key="name" class="chip chip--label">
                {{ name }}
              </span>
            </span>
            <SpaceRowActions :items="actionsFor(entry)" />
          </div>
        </li>
      </ul>

      <TPagination
        v-if="lastPage > 1"
        :current-page="page"
        :total-pages="lastPage"
        @page-change="load"
      />

      <template #empty>
        <div class="empty">
          <h2>
            {{
              filtered ? t('No transactions match these filters') : t('No shared transactions yet')
            }}
          </h2>
          <p>
            {{
              filtered
                ? t('Clear the filters to see everything in this space.')
                : t(
                    'Record spending in a shared wallet, or share something from your personal finances.'
                  )
            }}
          </p>
          <TButton
            v-if="filtered"
            variant="secondary"
            :full-width="false"
            :text="t('Clear filters')"
            @click="clearFilters"
          />
          <TButton
            v-else-if="canWrite"
            :full-width="false"
            :text="t('Record a transaction')"
            @click="compose()"
          />
        </div>
      </template>
    </ComponentLoader>

    <SpaceShareModal v-model="sharing" mode="transactions" />
    <SpaceClassifyModal
      :transaction="classifying"
      @close="classifying = null"
      @create-label="createLabel"
    />
    <SpaceLabelModal v-model="labelOpen" kind="categories" />
    <ConfirmModal
      :is-open="!!confirming"
      :title="confirming?.title ?? ''"
      :message="confirming?.message ?? ''"
      :confirm-text="confirming?.confirm"
      type="danger"
      @confirm="runConfirm"
      @cancel="confirming = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import TButton from '@/components/TButton.vue';
import TPagination from '@/components/TPagination.vue';
import ComponentLoader from '@/components/ComponentLoader.vue';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';
import SpaceRowActions from './SpaceRowActions.vue';
import SpaceShareModal from './SpaceShareModal.vue';
import SpaceClassifyModal from './SpaceClassifyModal.vue';
import SpaceLabelModal from './SpaceLabelModal.vue';
import type { WorkspaceTransaction } from '~/types/workspace';
import { spaceMoney } from '~/utils/spaceMoney';
import { useSpaceConfirm } from '~/composables/useSpaceConfirm';

const { t } = useI18n();
const { space, canWrite, canManage } = useActiveSpace();
const {
  overview,
  transactions,
  filters,
  page,
  lastPage,
  ready,
  error,
  load,
  ensure,
  removeTransaction
} = useSpaceFinance();
const { compose } = useSpaceComposer();
const { confirming, ask, runConfirm } = useSpaceConfirm();
const sharing = ref(false);
const labelOpen = ref(false);
const classifying = ref<WorkspaceTransaction | null>(null);
const filtered = computed(() => !!filters.value.type || !!filters.value.wallet_id);
const typeOptions = [
  { value: '' as const, label: t('All') },
  { value: 'expense' as const, label: t('Expenses') },
  { value: 'income' as const, label: t('Income') }
];

function setType(value: '' | 'income' | 'expense') {
  filters.value.type = value;
  load(1);
}

function clearFilters() {
  filters.value = { type: '', wallet_id: '' };
  load(1);
}

function labelNames(entry: WorkspaceTransaction) {
  const categories = new Map(overview.value.categories.map((label) => [label.id, label.name]));
  const groups = new Map(overview.value.groups.map((label) => [label.id, label.name]));
  return [
    ...entry.category_ids.map((id) => categories.get(id)),
    ...entry.group_ids.map((id) => groups.get(id))
  ].filter((name): name is string => !!name);
}

function actionsFor(entry: WorkspaceTransaction) {
  const items = [];
  if (entry.can_edit) items.push({ label: t('Edit'), run: () => compose(entry) });
  if (canManage.value && canWrite.value) {
    items.push({ label: t('Label'), run: () => (classifying.value = entry) });
  }
  if (entry.can_edit && entry.source === 'workspace') {
    items.push({
      label: t('Delete'),
      danger: true,
      run: () =>
        ask({
          title: t('Delete this transaction?'),
          message: t('Its amount is reversed in the shared wallet and budgets update.'),
          confirm: t('Delete'),
          action: () => removeTransaction(entry)
        })
    });
  }
  if (entry.can_unshare) {
    items.push({
      label: t('Stop sharing'),
      danger: true,
      run: () =>
        ask({
          title: t('Stop sharing this transaction?'),
          message: t('It stays in your personal finances and leaves this space.'),
          confirm: t('Stop sharing'),
          action: () => removeTransaction(entry)
        })
    });
  }
  return items;
}

function createLabel() {
  classifying.value = null;
  labelOpen.value = true;
}

function typeLabel(type: string) {
  return type === 'income' ? t('Income') : t('Expense');
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

onMounted(ensure);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use './space-page' as *;

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $spacing-3;
  margin-bottom: $spacing-4;
}

.segmented {
  display: inline-flex;
  padding: $spacing-1;
  border-radius: $radius-md;
  background: $bg-white;
  border: 1px solid $border-light;

  button {
    padding: $spacing-1 $spacing-4;
    border: 0;
    border-radius: $radius-md;
    background: none;
    color: $text-secondary;
    font: inherit;
    font-size: $font-size-sm;
    cursor: pointer;

    &.active {
      background: $primary-light;
      color: $primary-dark;
      font-weight: $font-semibold;
    }
  }
}

.wallet-filter {
  padding: $spacing-2 $spacing-3;
  border: 1px solid $border-light;
  border-radius: $radius-md;
  background: $bg-white;
  color: $text-primary;
  font: inherit;
  font-size: $font-size-sm;
}

.ledger {
  width: 100%;
  border-collapse: collapse;
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: $radius-xl;
  box-shadow: $elevation-1;
  overflow: hidden;
  font-size: $font-size-sm;

  th,
  td {
    padding: 6px 10px;
    text-align: left;
    border-bottom: 1px solid $border-light;
    vertical-align: middle;
  }

  th {
    font-size: $font-size-xs;
    font-weight: $font-semibold;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    background: $bg-light;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody tr:hover {
    background: $bg-light;
  }

  @media (max-width: $breakpoint-md) {
    display: none;
  }
}

.num {
  text-align: right !important;
  white-space: nowrap;
}

.muted {
  color: $text-secondary;
  white-space: nowrap;
}

.title {
  color: $text-primary;
  font-weight: $font-medium;
}

.chip {
  display: inline-block;
  margin-left: $spacing-1;
  padding: 0 $spacing-2;
  border-radius: $radius-md;
  background: $bg-light;
  font-size: $font-size-xs;
  color: $text-secondary;

  &--label {
    margin: 0 $spacing-1 0 0;
    background: $primary-light;
    color: $primary-dark;
  }
}

.amount {
  font-weight: $font-semibold;

  &--expense {
    color: var(--color-expense);
  }

  &--income {
    color: var(--color-income);
  }
}

.row-actions {
  width: 1%;
}

.cards {
  display: none;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (max-width: $breakpoint-md) {
    display: flex;
    flex-direction: column;
    gap: $spacing-2;
  }
}

.card {
  padding: $spacing-3;
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: $radius-xl;
}

.card-top,
.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-2;
}

.card-meta {
  margin: $spacing-1 0 $spacing-2;
  font-size: $font-size-xs;
  color: $text-secondary;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
