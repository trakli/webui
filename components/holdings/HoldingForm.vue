<template>
  <Transition name="modal">
    <div v-if="open" class="modal-root" @click.self="$emit('close')">
      <div class="modal-panel" role="dialog" aria-modal="true">
        <header class="modal-head">
          <h2 class="modal-title">{{ editing ? t('Edit holding') : t('Add holding') }}</h2>
          <button class="icon-btn" :aria-label="t('Close')" @click="$emit('close')">
            <X :size="18" />
          </button>
        </header>

        <div class="field">
          <label>{{ t('Price source') }}</label>
          <div class="seg">
            <button
              type="button"
              class="seg-btn"
              :class="{ 'seg-btn--active': form.price_source === 'auto' }"
              @click="form.price_source = 'auto'"
            >
              <Zap :size="14" /> {{ t('Live') }}
            </button>
            <button
              type="button"
              class="seg-btn"
              :class="{ 'seg-btn--active': form.price_source === 'manual' }"
              @click="form.price_source = 'manual'"
            >
              <Pencil :size="14" /> {{ t('Manual') }}
            </button>
          </div>
        </div>

        <div v-if="form.price_source === 'auto'" class="field">
          <label>{{ t('Coin') }}</label>
          <input
            v-model="coinQuery"
            type="text"
            :placeholder="t('Search Bitcoin, Ethereum...')"
            @input="onSearch"
          />
          <ul v-if="results.length" class="coin-results">
            <li v-for="c in results" :key="c.id">
              <button type="button" class="coin-option" @click="pickCoin(c)">
                <span class="coin-symbol">{{ c.symbol }}</span> {{ c.name }}
              </button>
            </li>
          </ul>
          <p v-if="form.external_ref" class="coin-picked">
            {{ t('Priced automatically from CoinGecko') }} ({{ form.external_ref }})
          </p>
        </div>

        <div class="field">
          <label>{{ t('Name') }}</label>
          <input
            v-model="form.name"
            type="text"
            :placeholder="t('Bitcoin, Apple, Rental flat...')"
          />
        </div>

        <div class="field-row">
          <div class="field">
            <label
              >{{ t('Symbol') }} <span class="opt">({{ t('optional') }})</span></label
            >
            <input v-model="form.symbol" type="text" placeholder="BTC" />
          </div>
          <div class="field">
            <label>{{ t('Quantity') }}</label>
            <input v-model.number="form.quantity" type="number" step="any" min="0" />
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>{{ t('Currency') }}</label>
            <select v-model="form.currency">
              <option v-for="c in currencies" :key="c.code" :value="c.code">{{ c.code }}</option>
            </select>
          </div>
          <div v-if="form.price_source === 'manual'" class="field">
            <label>{{ t('Price per unit') }}</label>
            <input v-model.number="form.unit_price" type="number" step="any" min="0" />
          </div>
        </div>

        <p v-if="error" class="form-error">{{ error }}</p>

        <button type="button" class="submit" :disabled="submitting" @click="submit">
          {{ editing ? t('Save changes') : t('Add holding') }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { X, Pencil, Zap } from 'lucide-vue-next';
import { CURRENCIES } from '@/utils/currencies';
import holdingsApi from '@/services/api/holdingsApi';
import { useSharedData } from '~/composables/useSharedData';
import type { Holding, HoldingPayload, CoinSearchResult } from '~/types/holding';

const { t } = useI18n();
const sharedData = useSharedData();
const currencies = CURRENCIES;

const props = defineProps<{ open: boolean; editing: Holding | null; submitting?: boolean }>();
const emit = defineEmits<{ submit: [HoldingPayload]; close: [] }>();

const blank = (): HoldingPayload => ({
  name: '',
  symbol: '',
  quantity: 0,
  currency: sharedData.getDefaultCurrency.value || 'USD',
  unit_price: 0,
  price_source: 'manual',
  provider: null,
  external_ref: null
});

const form = reactive<HoldingPayload>(blank());
const coinQuery = ref('');
const results = ref<CoinSearchResult[]>([]);
const error = ref('');
let searchTimer: ReturnType<typeof setTimeout> | null = null;

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    error.value = '';
    results.value = [];
    if (props.editing) {
      Object.assign(form, {
        name: props.editing.name,
        symbol: props.editing.symbol ?? '',
        quantity: props.editing.quantity,
        currency: props.editing.currency,
        unit_price: props.editing.unit_price,
        price_source: props.editing.price_source,
        provider: props.editing.provider ?? null,
        external_ref: props.editing.external_ref ?? null
      });
      coinQuery.value = props.editing.external_ref ?? '';
    } else {
      Object.assign(form, blank());
      coinQuery.value = '';
    }
  }
);

function onSearch() {
  form.provider = null;
  form.external_ref = null;
  if (searchTimer) clearTimeout(searchTimer);
  const q = coinQuery.value.trim();
  if (q.length < 2) {
    results.value = [];
    return;
  }
  searchTimer = setTimeout(async () => {
    results.value = await holdingsApi.search(q);
  }, 300);
}

function pickCoin(c: CoinSearchResult) {
  form.provider = 'coingecko';
  form.external_ref = c.id;
  form.symbol = c.symbol;
  if (!form.name) form.name = c.name;
  coinQuery.value = c.name;
  results.value = [];
}

function submit() {
  error.value = '';
  if (!form.name.trim()) {
    error.value = t('Name is required.');
    return;
  }
  if (!form.quantity || form.quantity <= 0) {
    error.value = t('Enter a quantity greater than 0.');
    return;
  }
  if (form.price_source === 'auto' && !form.external_ref) {
    error.value = t('Pick a coin to price it automatically.');
    return;
  }
  emit('submit', { ...form });
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.modal-root {
  position: fixed;
  inset: 0;
  z-index: $z-index-modal;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: $breakpoint-md) {
    align-items: center;
    padding: $spacing-6;
  }
}

.modal-panel {
  width: 100%;
  max-width: 460px;
  max-height: 90vh;
  overflow-y: auto;
  background: $bg-white;
  border-radius: 20px 20px 0 0;
  padding: $spacing-5;
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
  box-shadow: $elevation-5;

  @media (min-width: $breakpoint-md) {
    border-radius: 20px;
  }
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-bold;
  color: $text-primary;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background: $bg-light;
  color: $text-secondary;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  label {
    font-size: $font-size-sm;
    font-weight: $font-medium;
    color: $text-primary;
  }

  .opt {
    color: $text-muted;
    font-weight: $font-normal;
  }

  input,
  select {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    height: 46px;
    padding: 0 12px;
    border: 1px solid $border-color;
    border-radius: $radius-lg;
    background: $bg-white;
    color: $text-primary;
    font-size: 15px;

    &:focus {
      outline: none;
      border-color: $primary;
    }
  }
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-3;
}

.seg {
  display: flex;
  gap: 6px;
  padding: 4px;
  background: $bg-light;
  border-radius: 12px;
}

.seg-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: $text-secondary;
  font-size: $font-size-sm;
  font-weight: $font-medium;
  cursor: pointer;
}

.seg-btn--active {
  background: $bg-white;
  color: $text-primary;
  box-shadow: $elevation-1;
}

.coin-results {
  list-style: none;
  margin: 0;
  padding: 4px;
  border: 1px solid $border-color;
  border-radius: $radius-lg;
  max-height: 200px;
  overflow-y: auto;
}

.coin-option {
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: $font-size-sm;
  color: $text-primary;

  &:hover {
    background: $bg-light;
  }
}

.coin-symbol {
  font-weight: $font-bold;
  margin-right: 6px;
}

.coin-picked {
  margin: 0;
  font-size: 11px;
  color: $text-muted;
}

.form-error {
  margin: 0;
  color: var(--color-expense, #dc2626);
  font-size: $font-size-sm;
}

.submit {
  height: 48px;
  border: none;
  border-radius: $radius-lg;
  background: $primary;
  color: #fff;
  font-weight: $font-semibold;
  font-size: 15px;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
