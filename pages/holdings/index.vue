<template>
  <div class="holdings">
    <header class="hd-head">
      <div>
        <h1 class="hd-title">{{ t('Holdings') }}</h1>
        <p class="hd-sub">{{ t('Assets you own: crypto, stocks, property and more.') }}</p>
      </div>
      <div class="hd-actions">
        <button class="btn btn--ghost" :disabled="refreshing" @click="refresh">
          <RefreshCw :size="15" :class="{ spin: refreshing }" /> {{ t('Refresh prices') }}
        </button>
        <button class="btn btn--primary" @click="openCreate">
          <Plus :size="16" /> {{ t('Add holding') }}
        </button>
      </div>
    </header>

    <section class="hd-total surface surface--brand tone-card">
      <span class="eyebrow">{{ t('Total value') }}</span>
      <p class="hd-total-value">{{ money(totalValue, totalCurrency) }}</p>
    </section>

    <LoadingSkeleton v-if="loading && !holdings.length" variant="list" :count="4" />

    <div v-else-if="!holdings.length" class="hd-empty">
      <Coins :size="44" class="hd-empty-ico" />
      <p>{{ t('No holdings yet. Add Bitcoin, a stock, or any asset you own.') }}</p>
    </div>

    <ul v-else class="hd-list">
      <li v-for="h in holdings" :key="h.id" class="hd-card surface tone-card">
        <span class="hd-ico"
          ><component :is="h.price_source === 'auto' ? Bitcoin : Landmark" :size="18"
        /></span>
        <div class="hd-main">
          <div class="hd-name-row">
            <span class="hd-name">{{ h.name }}</span>
            <span v-if="h.symbol" class="hd-symbol">{{ h.symbol }}</span>
            <span class="hd-badge" :class="`hd-badge--${h.price_source}`">
              {{ h.price_source === 'auto' ? t('Live') : t('Manual') }}
            </span>
          </div>
          <span class="hd-meta">
            {{ formatQty(h.quantity) }} × {{ money(h.unit_price, h.currency) }}
          </span>
        </div>
        <span class="hd-value">{{ money(h.value, h.currency) }}</span>
        <div class="hd-row-actions">
          <button class="icon-btn" :aria-label="t('Edit')" @click="openEdit(h)">
            <Pencil :size="15" />
          </button>
          <button class="icon-btn" :aria-label="t('Delete')" @click="remove(h)">
            <Trash2 :size="15" />
          </button>
        </div>
      </li>
    </ul>

    <HoldingForm
      :open="formOpen"
      :editing="editing"
      :submitting="submitting"
      @submit="save"
      @close="formOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, RefreshCw, Pencil, Trash2, Coins, Bitcoin, Landmark } from 'lucide-vue-next';
import LoadingSkeleton from '@/components/LoadingSkeleton.vue';
import HoldingForm from '@/components/holdings/HoldingForm.vue';
import holdingsApi from '@/services/api/holdingsApi';
import statsApi from '@/services/api/statsApi';
import { formatShortAmount } from '@/utils/currency';
import { useNotifications } from '~/composables/useNotifications';
import { useAuth } from '~/composables/useAuth';
import type { Holding, HoldingPayload } from '~/types/holding';

definePageMeta({ layout: 'dashboard', middleware: 'auth' });

const { t } = useI18n();
const { confirmDelete, showSuccess, showError } = useNotifications();
const { user } = useAuth();

const holdings = ref<Holding[]>([]);
const totalValue = ref(0);
const totalCurrency = ref('USD');
const loading = ref(false);
const refreshing = ref(false);
const submitting = ref(false);
const formOpen = ref(false);
const editing = ref<Holding | null>(null);

const money = (n: number, currency: string) =>
  formatShortAmount(`${Math.round((n || 0) * 100) / 100} ${currency}`);
const formatQty = (n: number) => Number(n).toLocaleString(undefined, { maximumFractionDigits: 8 });

async function load() {
  loading.value = true;
  try {
    const res = await holdingsApi.fetchAll();
    holdings.value = res.data || [];
    // The package list isn't currency-converted; the converted total comes from
    // the same place the Financial Position net worth does.
    try {
      const stats = await statsApi.fetch({ section: 'position' });
      totalValue.value = stats.data?.position?.holdings_value ?? 0;
      totalCurrency.value = (stats.data as { currency?: string })?.currency ?? 'USD';
    } catch {
      totalValue.value = 0;
    }
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  formOpen.value = true;
}

function openEdit(h: Holding) {
  editing.value = h;
  formOpen.value = true;
}

async function save(payload: HoldingPayload) {
  submitting.value = true;
  try {
    if (editing.value) {
      await holdingsApi.update(editing.value.id, payload);
      showSuccess(t('Holding updated'));
    } else {
      const ownerId = Number((user.value as { id?: number } | null)?.id);
      if (!ownerId) {
        showError(t('Could not save the holding.'));
        return;
      }
      await holdingsApi.create(payload, { owner_type: 'App\\Models\\User', owner_id: ownerId });
      showSuccess(t('Holding added'));
    }
    formOpen.value = false;
    await load();
  } catch {
    showError(t('Could not save the holding.'));
  } finally {
    submitting.value = false;
  }
}

async function remove(h: Holding) {
  const ok = await confirmDelete(t('Delete "{name}"?', { name: h.name }));
  if (!ok) return;
  try {
    await holdingsApi.delete(h.id);
    showSuccess(t('Holding deleted'));
    await load();
  } catch {
    showError(t('Could not delete the holding.'));
  }
}

async function refresh() {
  refreshing.value = true;
  try {
    await holdingsApi.refreshPrices();
    await load();
    showSuccess(t('Prices refreshed'));
  } catch {
    showError(t('Could not refresh prices.'));
  } finally {
    refreshing.value = false;
  }
}

onMounted(load);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_surfaces.scss' as *;

.holdings {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.hd-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $spacing-4;
  flex-wrap: wrap;
}

.hd-title {
  margin: 0;
  font-size: $font-size-xl;
  font-weight: $font-bold;
  color: $text-primary;
}

.hd-sub {
  margin: 4px 0 0;
  color: $text-muted;
  font-size: $font-size-sm;
}

.hd-actions {
  display: flex;
  gap: $spacing-2;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  cursor: pointer;
  border: 1px solid transparent;

  &--primary {
    background: $primary;
    color: #fff;
  }
  &--ghost {
    background: $bg-white;
    border-color: $border-color;
    color: $text-primary;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.hd-total {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: $spacing-4 $spacing-5;
}

.hd-total-value {
  margin: 0;
  font-size: 2rem;
  font-weight: $font-bold;
  font-variant-numeric: tabular-nums;
  color: var(--surface-deep);
}

.hd-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.hd-card {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-3 $spacing-4;
}

.hd-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 12px;
  background: $bg-light;
  color: $text-secondary;
}

.hd-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hd-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.hd-name {
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  color: $text-primary;
}

.hd-symbol {
  font-size: 11px;
  font-weight: $font-bold;
  color: $text-muted;
}

.hd-badge {
  font-size: 9px;
  font-weight: $font-bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 7px;
  border-radius: 999px;

  &--auto {
    background: rgba(14, 165, 233, 0.14);
    color: #0284c7;
  }
  &--manual {
    background: $bg-light;
    color: $text-muted;
  }
}

.hd-meta {
  font-size: 11px;
  color: $text-muted;
  font-variant-numeric: tabular-nums;
}

.hd-value {
  font-size: $font-size-lg;
  font-weight: $font-bold;
  font-variant-numeric: tabular-nums;
  color: $text-primary;
}

.hd-row-actions {
  display: flex;
  gap: 2px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: $text-muted;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: $bg-light;
    color: $text-primary;
  }
}

.hd-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-6;
  text-align: center;
  color: $text-muted;
  background: $bg-white;
  border: 1px dashed $border-color;
  border-radius: 18px;
}

.hd-empty-ico {
  color: var(--color-border-medium, #cbd5e1);
}
</style>
