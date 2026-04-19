<template>
  <div class="transfer-form">
    <div class="form">
      <div class="transfer-amount">
        <span>{{ t('Amount') }}</span>
        <div class="amount-input-group">
          <input
            v-model="formAmount"
            type="number"
            :placeholder="t('Ex: 250 000')"
            min="1"
            step="any"
            required
          />
          <select v-model="selectedCurrency" class="amount-currency-select">
            <option v-for="currency in availableCurrencies" :key="currency" :value="currency">
              {{ currency }}
            </option>
          </select>
        </div>
        <div v-if="amountError" class="error-text">
          {{ t('Enter a valid amount greater than 0.') }}
        </div>
      </div>

      <div class="form-transaction">
        <div class="transfer-field">
          <SearchableDropdown
            v-model="fromWalletSearchQuery"
            :label="t('From Wallet')"
            :placeholder="t('Select source wallet...')"
            :options="fromWalletOptions"
            :error="fromWalletError ? t('Source wallet is required.') : ''"
            @select="handleFromWalletSelect"
            @clear="fromWalletId = null"
          />
        </div>

        <div class="transfer-field">
          <SearchableDropdown
            v-model="toWalletSearchQuery"
            :label="t('To Wallet')"
            :placeholder="t('Select destination wallet...')"
            :options="toWalletOptions"
            :error="toWalletError ? t('Destination wallet is required.') : ''"
            @select="handleToWalletSelect"
            @clear="toWalletId = null"
          />
        </div>
      </div>

      <div v-if="showExchangeRate" class="exchange-rate-section">
        <span>{{ t('Exchange Rate') }}</span>
        <div class="exchange-rate-input">
          <span class="rate-label">1 {{ fromWalletCurrency }} =</span>
          <input
            v-model="exchangeRate"
            type="number"
            step="any"
            min="0.0001"
            :placeholder="t('Enter rate')"
          />
          <span class="rate-label">{{ toWalletCurrency }}</span>
        </div>
        <div v-if="exchangeRateError" class="error-text">
          {{ t('Exchange rate is required for different currencies.') }}
        </div>
        <div v-if="convertedAmount" class="converted-amount">
          {{ t('Recipient will receive:') }} {{ convertedAmount }} {{ toWalletCurrency }}
        </div>
      </div>

      <div class="form-transaction">
        <div class="transfer-field">
          <span>{{ t('Transfer date') }}</span>
          <input v-model="formDate" type="date" required />
          <div v-if="dateError" class="error-text">{{ t('Date is required.') }}</div>
        </div>

        <div class="transfer-field">
          <span>{{ t('Transfer time') }}</span>
          <input v-model="formTime" type="time" required />
          <div v-if="timeError" class="error-text">{{ t('Time is required.') }}</div>
        </div>
      </div>
    </div>

    <TButton
      :text="t('Make Transfer')"
      class="submit-button"
      :disabled="props.isSubmitting"
      :loading="props.isSubmitting"
      @click="onSubmit"
    >
      <template #left-icon>
        <ArrowsRightLeftIcon />
      </template>
    </TButton>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import TButton from './TButton.vue';
import SearchableDropdown from './SearchableDropdown.vue';
import { ArrowsRightLeftIcon } from '@heroicons/vue/24/outline';
import { useSharedData } from '~/composables/useSharedData';

const { t } = useI18n();

const emit = defineEmits(['submit']);
const props = defineProps({
  isSubmitting: {
    type: Boolean,
    default: false
  }
});

const now = new Date();
const formDate = ref(now.toISOString().slice(0, 10));
const formTime = ref(now.toTimeString().slice(0, 5));
const formAmount = ref('');
const exchangeRate = ref<string>('');

const fromWalletId = ref<number | null>(null);
const toWalletId = ref<number | null>(null);
const fromWalletSearchQuery = ref('');
const toWalletSearchQuery = ref('');

const sharedData = useSharedData();
const selectedCurrency = ref(sharedData.getDefaultCurrency.value || 'USD');

const dateError = ref(false);
const timeError = ref(false);
const amountError = ref(false);
const fromWalletError = ref(false);
const toWalletError = ref(false);
const exchangeRateError = ref(false);

const availableCurrencies = computed(() => {
  const currencies = new Set(['XAF', 'USD', 'EUR', 'GBP', 'NGN']);
  sharedData.wallets.value.forEach((wallet) => {
    if (wallet.currency) {
      currencies.add(wallet.currency);
    }
  });
  return Array.from(currencies).sort();
});

const fromWalletOptions = computed(() => {
  return sharedData.wallets.value
    .filter((w) => w.id !== toWalletId.value)
    .map((w) => ({
      ...w,
      name: sharedData.formatWalletName(w),
      originalName: w.name
    }));
});

const toWalletOptions = computed(() => {
  return sharedData.wallets.value
    .filter((w) => w.id !== fromWalletId.value)
    .map((w) => ({
      ...w,
      name: sharedData.formatWalletName(w),
      originalName: w.name
    }));
});

const fromWalletCurrency = computed(() => {
  const wallet = sharedData.wallets.value.find((w) => w.id === fromWalletId.value);
  return wallet?.currency || selectedCurrency.value;
});

const toWalletCurrency = computed(() => {
  const wallet = sharedData.wallets.value.find((w) => w.id === toWalletId.value);
  return wallet?.currency || selectedCurrency.value;
});

const showExchangeRate = computed(() => {
  return (
    fromWalletId.value && toWalletId.value && fromWalletCurrency.value !== toWalletCurrency.value
  );
});

const convertedAmount = computed(() => {
  if (!showExchangeRate.value) return null;
  const amount = Number(formAmount.value);
  const rate = Number(exchangeRate.value);
  if (!Number.isFinite(amount) || !Number.isFinite(rate) || rate <= 0) return null;
  return (amount * rate).toFixed(2);
});

function handleFromWalletSelect(wallet: { id: number; name: string; currency?: string }) {
  fromWalletId.value = wallet.id;
  fromWalletSearchQuery.value = wallet.name;
  fromWalletError.value = false;

  if (wallet.currency) {
    selectedCurrency.value = wallet.currency;
  }
}

function handleToWalletSelect(wallet: { id: number; name: string; currency?: string }) {
  toWalletId.value = wallet.id;
  toWalletSearchQuery.value = wallet.name;
  toWalletError.value = false;
}

function validateRequiredFields(): boolean {
  let valid = true;

  const amountNum = Number(formAmount.value);
  amountError.value = !Number.isFinite(amountNum) || amountNum <= 0;
  if (amountError.value) valid = false;

  dateError.value = !formDate.value || formDate.value.trim() === '';
  timeError.value = !formTime.value || formTime.value.trim() === '';
  if (dateError.value || timeError.value) valid = false;

  fromWalletError.value = !fromWalletId.value;
  toWalletError.value = !toWalletId.value;
  if (fromWalletError.value || toWalletError.value) valid = false;

  if (showExchangeRate.value) {
    const rate = Number(exchangeRate.value);
    exchangeRateError.value = !Number.isFinite(rate) || rate <= 0;
    if (exchangeRateError.value) valid = false;
  }

  return valid;
}

function onSubmit() {
  if (props.isSubmitting) {
    return;
  }

  if (!validateRequiredFields()) {
    return;
  }

  const amountNum = Number(formAmount.value);
  const dateTime = `${formDate.value}T${formTime.value}:00`;

  const payload: {
    amount: number;
    from_wallet_id: number;
    to_wallet_id: number;
    created_at: string;
    exchange_rate?: number;
  } = {
    amount: amountNum,
    from_wallet_id: fromWalletId.value!,
    to_wallet_id: toWalletId.value!,
    created_at: new Date(dateTime).toISOString()
  };

  if (showExchangeRate.value) {
    payload.exchange_rate = Number(exchangeRate.value);
  }

  emit('submit', payload);
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_transaction-form.scss' as *;

.transfer-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transfer-amount {
  display: flex;
  flex-direction: column;
  gap: 6px;

  > span {
    font-weight: $font-medium;
  }
}

.transfer-field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  > span {
    font-weight: $font-medium;
  }

  input[type='date'],
  input[type='time'] {
    padding: 12px;
    border: 1px solid $border-color;
    border-radius: $radius-lg;
    font-size: 16px;
    width: 100%;
    height: 50px;
    background: $bg-white;
    color: $text-primary;

    &:focus {
      border-color: $primary;
      outline: none;
    }
  }
}

.amount-input-group {
  display: flex;
  gap: 0.5rem;

  input {
    flex: 1;
    width: 100%;
    height: 50px;
    border-radius: $radius-lg;
    padding: 12px;
    border: 1px solid $border-color;
    background: $bg-white;
    color: $text-primary;

    &:focus {
      border-color: $primary;
      outline: none;
    }
  }

  .amount-currency-select {
    width: 80px;
    height: 50px;
    background-color: $bg-light;
    border-radius: $radius-lg;
    font-weight: $font-normal;
    font-size: $font-size-sm;
    line-height: 100%;
    border: 1px solid $border-color;
    cursor: pointer;
    padding: 0 8px;
    appearance: none;
    color: $text-primary;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 8px center;
    background-repeat: no-repeat;
    background-size: 16px;

    &:focus {
      border-color: $primary;
      outline: none;
    }
  }
}

.exchange-rate-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 1rem;
  background: $bg-slate;
  border-radius: $radius-lg;
  border: 1px solid $border-color;

  > span {
    font-weight: $font-medium;
    color: $text-primary;
  }
}

.exchange-rate-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  input {
    flex: 1;
    max-width: 150px;
    padding: 10px 12px;
    height: 44px;
    border: 1px solid $border-color;
    border-radius: $radius-lg;
    font-size: 16px;
    color: $text-primary;
    background: $bg-white;

    &:focus {
      border-color: $primary;
      outline: none;
    }
  }

  .rate-label {
    color: $text-secondary;
    font-size: 14px;
  }
}

.converted-amount {
  font-size: 14px;
  color: $primary;
  font-weight: $font-medium;
}

.submit-button {
  align-self: flex-start;
  margin-top: 16px;

  @media (max-width: $breakpoint-sm) {
    width: 100%;
  }
}

.optional-label {
  font-weight: $font-normal;
  color: $text-muted;
  font-size: $font-size-sm;
}
</style>
