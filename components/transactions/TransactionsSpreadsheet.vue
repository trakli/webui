<template>
  <Teleport to="body">
    <div class="spreadsheet-overlay" role="dialog" aria-modal="true">
      <header class="spreadsheet-header">
        <div class="spreadsheet-title">
          <TableCellsIcon class="icon" />
          <h2>{{ t('Transactions spreadsheet') }}</h2>
          <span class="count">
            {{ t('{count} rows', { count: filteredRows.length }) }}
          </span>
        </div>
        <div class="spreadsheet-actions">
          <input v-model="search" type="search" class="search" :placeholder="t('Search rows...')" />
          <button type="button" class="close-btn" :aria-label="t('Close')" @click="$emit('close')">
            <XMarkIcon class="icon" />
          </button>
        </div>
      </header>

      <div v-if="isLoading" class="state">
        <div class="spinner" />
        <p>{{ t('Loading transactions...') }}</p>
      </div>

      <div v-else-if="error" class="state">
        <p class="error">{{ error }}</p>
      </div>

      <div v-else class="sheet-wrap">
        <table class="sheet">
          <thead>
            <tr>
              <th class="col-idx">#</th>
              <th class="col-date">{{ t('Date') }}</th>
              <th class="col-type">{{ t('Type') }}</th>
              <th class="col-amount">{{ t('Amount') }}</th>
              <th class="col-currency">{{ t('Currency') }}</th>
              <th class="col-desc">{{ t('Description') }}</th>
              <th class="col-cat">{{ t('Categories') }}</th>
              <th class="col-wallet">{{ t('Wallet') }}</th>
              <th class="col-party">{{ t('Party') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in filteredRows" :key="row.id" :class="`row--${row.type}`">
              <td class="col-idx">{{ i + 1 }}</td>
              <td class="col-date">{{ formatDate(row.datetime) }}</td>
              <td class="col-type">
                <span class="type-dot" :class="`type-dot--${row.type}`" />
                {{ row.type }}
                <span v-if="row.is_refund" class="refund-tag" :title="t('Marked as refund')">
                  {{ t('refund') }}
                </span>
              </td>
              <td class="col-amount" :class="`amt--${row.type}`">
                {{ formatAmount(row.amount) }}
              </td>
              <td class="col-currency">{{ row.wallet?.currency ?? '' }}</td>
              <td class="col-desc">{{ row.description || '—' }}</td>
              <td class="col-cat">{{ categoriesText(row) }}</td>
              <td class="col-wallet">{{ row.wallet?.name ?? '' }}</td>
              <td class="col-party">{{ row.party?.name ?? '' }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="totals">
              <td colspan="3">{{ t('Totals') }}</td>
              <td>{{ formatAmount(totalAmount) }}</td>
              <td colspan="5">
                <span class="muted">{{ t('Income') }}</span>
                <strong class="amt--income">{{ formatAmount(totalIncome) }}</strong>
                <span class="muted">· {{ t('Expenses') }}</span>
                <strong class="amt--expense">{{ formatAmount(totalExpense) }}</strong>
                <span class="muted">· {{ t('Net') }}</span>
                <strong :class="totalIncome - totalExpense >= 0 ? 'amt--income' : 'amt--expense'">
                  {{ formatAmount(totalIncome - totalExpense) }}
                </strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { TableCellsIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { api } from '@/services/api';

const { t } = useI18n();
const emit = defineEmits<{ (e: 'close'): void }>();

const rows = ref<any[]>([]);
const isLoading = ref(true);
const error = ref('');
const search = ref('');

async function loadAll() {
  isLoading.value = true;
  error.value = '';
  try {
    const response = await api.transactions.fetchAll({ limit: 500, page: 1 });
    rows.value = Array.isArray(response?.data) ? response.data : [];
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('Failed to load');
  } finally {
    isLoading.value = false;
  }
}

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return rows.value;
  return rows.value.filter((r) => {
    const hay = [
      r.description,
      r.wallet?.name,
      r.party?.name,
      (r.categories ?? []).map((c: any) => c.name).join(' '),
      r.type
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
});

const totalAmount = computed(() =>
  filteredRows.value.reduce((s, r) => s + Number(r.amount || 0), 0)
);
const totalIncome = computed(() =>
  filteredRows.value.filter((r) => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0)
);
const totalExpense = computed(() =>
  filteredRows.value.filter((r) => r.type === 'expense').reduce((s, r) => s + Number(r.amount), 0)
);

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString();
};

const formatAmount = (value: number | string) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n);
};

const categoriesText = (row: any) => {
  const list = row.categories ?? [];
  if (!list.length) return '';
  return list.map((c: any) => c.name).join(', ');
};

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close');
};

onMounted(() => {
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', onKey);
  loadAll();
});

onUnmounted(() => {
  document.body.style.overflow = '';
  document.removeEventListener('keydown', onKey);
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.spreadsheet-overlay {
  position: fixed;
  inset: 0;
  background: $bg-white;
  color: $text-primary;
  z-index: $z-index-modal;
  display: flex;
  flex-direction: column;
}

.spreadsheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid $border-color;
  background: $bg-slate;
  flex-shrink: 0;
}

.spreadsheet-title {
  display: flex;
  align-items: center;
  gap: 8px;

  h2 {
    margin: 0;
    font-size: $font-size-base;
    font-weight: $font-semibold;
  }

  .icon {
    width: 20px;
    height: 20px;
    color: $primary;
  }

  .count {
    font-size: $font-size-xs;
    color: $text-muted;
    margin-left: 6px;
  }
}

.spreadsheet-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search {
  width: 240px;
  padding: 6px 10px;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  background: $input-bg;
  color: $text-primary;
  font-size: $font-size-sm;

  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.15);
  }
}

.close-btn {
  background: transparent;
  border: 1px solid $border-color;
  border-radius: $radius-md;
  padding: 6px;
  cursor: pointer;
  color: $text-muted;
  display: inline-flex;

  .icon {
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: $primary;
    border-color: $primary-muted;
  }
}

.state {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding: 3rem 1rem;

  .error {
    color: $error-color;
  }
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid $bg-light;
  border-top-color: $primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.sheet-wrap {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  background: $bg-white;
}

.sheet {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 12px;
  font-family: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace;

  thead th {
    position: sticky;
    top: 0;
    background: $bg-slate;
    color: $text-secondary;
    text-align: left;
    padding: 6px 10px;
    font-weight: $font-semibold;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid $border-color;
    z-index: 2;
  }

  tbody td {
    padding: 4px 10px;
    border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.05);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 320px;
  }

  tbody tr:hover {
    background: rgba(var(--color-primary-rgb), 0.04);
  }

  .col-idx {
    width: 44px;
    text-align: right;
    color: $text-muted;
    background: $bg-slate;
    position: sticky;
    left: 0;
    z-index: 1;
  }

  .col-date {
    min-width: 150px;
  }

  .col-type {
    text-transform: capitalize;
  }

  .col-amount {
    text-align: right;
    font-variant-numeric: tabular-nums;
    font-weight: $font-semibold;
  }

  .col-currency {
    width: 60px;
    color: $text-muted;
  }

  tfoot .totals {
    position: sticky;
    bottom: 0;
    background: $bg-slate;
    font-weight: $font-semibold;
    border-top: 2px solid $border-color;

    td {
      padding: 8px 10px;
      border-top: 1px solid $border-color;

      strong {
        margin: 0 8px;
      }

      .muted {
        color: $text-muted;
        font-weight: $font-normal;
      }
    }
  }
}

.type-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;

  &--income {
    background: var(--color-success);
  }

  &--expense {
    background: var(--color-error);
  }
}

.amt--income {
  color: var(--color-success);
}

.amt--expense {
  color: var(--color-error);
}

.refund-tag {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #b45309;
  background: rgba(255, 159, 67, 0.18);
  border: 1px solid rgba(255, 159, 67, 0.35);
  text-transform: uppercase;
}
</style>
