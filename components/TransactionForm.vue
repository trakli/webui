<template>
  <div class="transaction-form">
    <div class="form">
      <div class="transaction-date">
        <span>{{ t('Amount') }}</span>
        <div class="transaction-amount">
          <input
            v-model="formAmount"
            type="number"
            :placeholder="t('Ex: 250 000')"
            min="1"
            step="any"
            required
          />
          <select
            v-model="selectedCurrency"
            class="amount-currency-select"
            @change="handleCurrencyChange"
          >
            <option v-for="currency in availableCurrencies" :key="currency" :value="currency">
              {{ currency }}
            </option>
          </select>
        </div>
        <div v-if="amountError" class="error-text">
          {{ t('Enter a valid amount greater than 0.') }}
        </div>
      </div>

      <div class="transaction-description">
        <span
          >{{ t('Description') }} <span class="optional-label">({{ t('optional') }})</span></span
        >
        <textarea v-model="formDescription" :placeholder="t('Type here...')" />
      </div>

      <div class="form-transaction">
        <div class="transaction-date">
          <span>{{ t('Transaction date') }}</span>
          <input v-model="formDate" type="date" required />
          <div v-if="dateError" class="error-text">{{ t('Date is required.') }}</div>
        </div>

        <div class="transaction-date">
          <span>{{ t('Transaction time') }}</span>
          <input v-model="formTime" type="time" required />
          <div v-if="timeError" class="error-text">{{ t('Time is required.') }}</div>
        </div>
      </div>

      <div class="form-transaction">
        <SearchableDropdown
          v-model="searchQuery"
          :label="isOutcomeSelected ? t('Party (sent to)') : t('Party (received from)')"
          :placeholder="t('Search party...')"
          :options="parties"
          @select="handlePartySelect"
        />

        <div class="wallet-field-wrapper">
          <SearchableDropdown
            v-model="walletSearchQuery"
            :label="isOutcomeSelected ? t('Wallet (sent from)') : t('Wallet (received to)')"
            :placeholder="t('Search wallet...')"
            :options="wallets"
            :error="walletError ? t('Wallet is required.') : ''"
            @select="handleWalletSelect"
            @clear="selectedWalletId = null"
          />
          <span
            v-if="isWalletDefault"
            class="wallet-default-indicator"
            :title="t('This is your default wallet')"
          >
            {{ t('Default') }}
          </span>
        </div>
      </div>

      <div class="form-transaction">
        <div class="group-field-wrapper">
          <SearchableDropdown
            v-model="groupSearchQuery"
            :label="t('Group')"
            :placeholder="t('Search group...')"
            :options="groups"
            :error="categoryError ? t('Group is required.') : ''"
            @select="handleGroupSelect"
            @clear="selectedGroupId = null"
          />
          <span
            v-if="isGroupDefault"
            class="group-default-indicator"
            :title="t('This is your default group')"
          >
            {{ t('Default') }}
          </span>
        </div>

        <SearchableDropdown
          v-model="categorySearchQuery"
          :label="t('Categories')"
          :placeholder="t('Search categories...')"
          :options="categories"
          :multiple="true"
          :selected="selectedAdditionalCategoryIds"
          @select="handleCategorySelect"
        />
      </div>

      <div class="transaction-files">
        <span>{{ t('Attachments') }}</span>
        <div class="upload-box">
          <input id="file-input" type="file" multiple @change="onFilesSelected" />
          <label for="file-input" class="upload-button">{{ t('Browse files') }}</label>
          <span class="hint">{{ t('Images, PDFs or docs. Max 5 files.') }}</span>
        </div>
        <div v-if="selectedFileNames.length" class="file-list">
          <span v-for="(f, i) in selectedFileNames" :key="f.name + i" class="chip">
            {{ f.name }}
            <button type="button" class="remove" @click="removeFile(i)">×</button>
          </span>
        </div>
      </div>

      <div v-if="!isOutcomeSelected" class="refund-section">
        <label class="refund-toggle">
          <input v-model="formIsRefund" type="checkbox" />
          <span>{{ t('This is a refund') }}</span>
        </label>
        <p class="refund-hint">
          {{
            t('Mark this income as refunding a past expense. Budgets subtract it from their spend.')
          }}
        </p>
        <div v-if="formIsRefund" class="refund-link">
          <SearchableDropdown
            v-model="refundPickerQuery"
            :label="t('Refund of')"
            :placeholder="
              recentExpenses.length ? t('Search expenses...') : t('Loading expenses...')
            "
            :options="refundOptions"
            @select="handleRefundSelect"
            @clear="formRefundOfTransactionId = null"
          />
          <p class="refund-link-hint">
            {{ t('Leave blank to mark the refund without linking to a specific expense.') }}
          </p>
        </div>
      </div>

      <div class="recurring-section">
        <label class="recurring-toggle">
          <input v-model="formIsRecurring" type="checkbox" />
          <span>{{ t('Make recurring') }}</span>
        </label>
        <div v-if="formIsRecurring" class="recurring-fields">
          <div class="form-transaction">
            <div class="transaction-date">
              <span>{{ t('Recurrence period') }}</span>
              <select v-model="formRecurrencePeriod" class="recurring-select">
                <option value="daily">{{ t('Daily') }}</option>
                <option value="weekly">{{ t('Weekly') }}</option>
                <option value="monthly">{{ t('Monthly') }}</option>
                <option value="yearly">{{ t('Yearly') }}</option>
              </select>
            </div>
            <div class="transaction-date">
              <span>{{ t('Repeat every') }}</span>
              <input v-model.number="formRecurrenceInterval" type="number" min="1" />
            </div>
          </div>
          <div class="transaction-date">
            <span
              >{{ t('End date') }} <span class="optional-label">({{ t('optional') }})</span></span
            >
            <input v-model="formRecurrenceEndsAt" type="date" />
          </div>
        </div>
      </div>
    </div>
    <TButton
      :text="
        props.editingItem
          ? isOutcomeSelected
            ? t('Update expense')
            : t('Update income')
          : isOutcomeSelected
            ? t('Record expense')
            : t('Record income')
      "
      class="submit-button"
      :class="{ 'submit-button--expense': isOutcomeSelected }"
      :disabled="props.isSubmitting"
      :loading="props.isSubmitting"
      @click="onSubmit"
    >
      <template #left-icon>
        <CheckIcon v-if="!props.editingItem" />
        <PencilIcon v-else />
      </template>
    </TButton>
  </div>
</template>

<script setup lang="ts">
import { toRefs, ref, computed, watch, onMounted } from 'vue';
import TButton from './TButton.vue';
import SearchableDropdown from './SearchableDropdown.vue';
import { CheckIcon, PencilIcon } from '@heroicons/vue/24/outline';
import { useSharedData } from '~/composables/useSharedData';
import { fetchAllPages } from '~/services/api/apiHelpers';

const { t } = useI18n();

const emit = defineEmits(['submit', 'error']);

const props = defineProps({
  isOutcomeSelected: {
    type: Boolean,
    default: false
  },
  editingItem: {
    type: Object,
    default: null
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
});

const { isOutcomeSelected } = toRefs(props);

const now = new Date();
const formDate = ref(now.toISOString().slice(0, 10));
const formTime = ref(now.toTimeString().slice(0, 5));
const formAmount = ref('');
const formParty = ref('');
const formCategory = ref('');
const formDescription = ref('');

const selectedPartyId = ref<number | null>(null);
const selectedWalletId = ref<number | null>(null);
const selectedGroupId = ref(null);
const selectedAdditionalCategoryIds = ref([]);
const filesToUpload = ref([]);
const formIsRecurring = ref(false);
const formRecurrencePeriod = ref('monthly');
const formRecurrenceInterval = ref(1);
const formRecurrenceEndsAt = ref('');
const formIsRefund = ref(false);
const formRefundOfTransactionId = ref<number | null>(null);
const recentExpenses = ref<any[]>([]);
const refundPickerQuery = ref('');
let recentExpensesLoaded = false;
const sharedData = useSharedData();
const selectedCurrency = ref(sharedData.getDefaultCurrency.value || 'USD');

const dateError = ref(false);
const timeError = ref(false);
const amountError = ref(false);
const partyError = ref(false);
const categoryError = ref(false);
const walletError = ref(false);

function validateRequiredFields() {
  let valid = true;

  const amountNum = Number(formAmount.value);
  amountError.value = !Number.isFinite(amountNum) || amountNum <= 0;
  if (amountError.value) valid = false;

  dateError.value = !formDate.value || formDate.value.trim() === '';
  timeError.value = !formTime.value || formTime.value.trim() === '';
  if (dateError.value || timeError.value) valid = false;

  partyError.value = false;
  categoryError.value = false;
  walletError.value = false;

  const partyValue = (formParty.value || searchQuery.value || '').trim();
  if (partyValue) formParty.value = partyValue;

  return valid;
}

function onSubmit() {
  if (props.isSubmitting) {
    return;
  }

  const isValid = validateRequiredFields();
  if (!isValid) {
    return;
  }

  const now = new Date();
  const date = formDate.value || now.toISOString().slice(0, 10);
  const time = formTime.value || now.toTimeString().slice(0, 5);

  const amountNum = Number(formAmount.value);

  const payload: Record<string, any> = {
    date,
    time,
    type: isOutcomeSelected.value ? 'EXPENSE' : 'INCOME',
    party: formParty.value,
    partyId: selectedPartyId.value,
    amount: `${amountNum} ${selectedCurrency.value}`,
    category: formCategory.value,
    categoryIds: selectedAdditionalCategoryIds.value,
    groupId: selectedGroupId.value ?? undefined,
    walletId: selectedWalletId.value,
    description: formDescription.value.trim(),
    filesToUpload: filesToUpload.value,
    isRecurring: formIsRecurring.value,
    recurrencePeriod: formIsRecurring.value ? formRecurrencePeriod.value : undefined,
    recurrenceInterval: formIsRecurring.value ? formRecurrenceInterval.value : undefined,
    recurrenceEndsAt:
      formIsRecurring.value && formRecurrenceEndsAt.value ? formRecurrenceEndsAt.value : undefined,
    isRefund: !isOutcomeSelected.value && formIsRefund.value,
    refundOfTransactionId:
      !isOutcomeSelected.value && formIsRefund.value ? formRefundOfTransactionId.value : null
  };

  if (props.editingItem?.id) {
    payload.id = props.editingItem.id;
  }

  emit('submit', payload);
}

// sharedData declared above for default currency

const parties = computed(() => sharedData.parties.value);
const groups = computed(() => sharedData.groups.value);
const categories = computed(() => {
  const type = isOutcomeSelected.value ? 'expense' : 'income';
  if (type === 'expense') {
    return sharedData.getExpenseCategories.value;
  } else {
    return sharedData.getIncomeCategories.value;
  }
});

const availableCurrencies = computed(() => {
  const currencies = new Set(['XAF', 'USD', 'EUR', 'GBP', 'NGN']);
  sharedData.wallets.value.forEach((wallet) => {
    if (wallet.currency) {
      currencies.add(wallet.currency);
    }
  });
  return Array.from(currencies).sort();
});

const wallets = computed(() => {
  return sharedData.wallets.value
    .filter((wallet) => {
      return !wallet.currency || wallet.currency === selectedCurrency.value;
    })
    .map((w) => ({
      ...w,
      name: sharedData.formatWalletName(w),
      originalName: w.name
    }));
});

const isWalletDefault = computed(() => {
  if (!selectedWalletId.value) return false;
  const defaultWallet = sharedData.getDefaultWallet.value;
  if (!defaultWallet) return false;
  return selectedWalletId.value === defaultWallet.id;
});

const isGroupDefault = computed(() => {
  if (!selectedGroupId.value) return false;
  const defaultGroup = sharedData.getDefaultGroup.value;
  if (!defaultGroup) return false;
  return selectedGroupId.value === defaultGroup.id;
});

function handlePartySelect(party) {
  formParty.value = party.name;
  selectedPartyId.value = party.id;
  partyError.value = false;
}

function handleWalletSelect(wallet) {
  selectedWalletId.value = wallet.id;
  walletError.value = false;

  if (wallet.currency && wallet.currency !== selectedCurrency.value) {
    selectedCurrency.value = wallet.currency;
  }
}

function handleCurrencyChange() {
  if (selectedWalletId.value) {
    const currentWallet = sharedData.wallets.value.find((w) => w.id === selectedWalletId.value);

    if (
      currentWallet &&
      currentWallet.currency &&
      currentWallet.currency !== selectedCurrency.value
    ) {
      selectedWalletId.value = null;
      walletSearchQuery.value = '';

      const defaultWallet = sharedData.getDefaultWallet.value;
      if (defaultWallet) {
        selectedWalletId.value = defaultWallet.id;
        walletSearchQuery.value = defaultWallet.name;
      }
    }
  }
}

function handleGroupSelect(group) {
  selectedGroupId.value = group.id;
  formCategory.value = group.name;
  categoryError.value = false;
}

const searchQuery = ref('');
const groupSearchQuery = ref('');
const categorySearchQuery = ref('');
const walletSearchQuery = ref('');

function handleCategorySelect(categoryIds) {
  selectedAdditionalCategoryIds.value = categoryIds;
}

async function loadRecentExpenses() {
  if (recentExpensesLoaded) return;
  try {
    const apiFetch = useApi();
    const { data } = await fetchAllPages<any>((page) =>
      apiFetch(`/transactions?type=expense&limit=200&page=${page}`)
    );
    recentExpenses.value = data;
    recentExpensesLoaded = true;
  } catch (e) {
    console.error('[TransactionForm] Failed to load recent expenses', e);
  }
}

function formatExpenseOption(exp) {
  const dt = exp.datetime ? new Date(exp.datetime) : null;
  const date = dt && !isNaN(dt.getTime()) ? dt.toLocaleDateString() : '';
  const amount = Number(exp.amount || 0).toFixed(2);
  const currency = exp.wallet?.currency ?? '';
  const desc = exp.description || exp.party?.name || t('Untitled transaction');
  return `${date} · ${amount} ${currency} · ${desc}`.trim();
}

// SearchableDropdown consumes { id, name } so pre-format every expense
// into a single searchable label. Client-side search works against `name`.
const refundOptions = computed(() =>
  recentExpenses.value.map((exp) => ({
    id: Number(exp.id),
    name: formatExpenseOption(exp)
  }))
);

function handleRefundSelect(option) {
  formRefundOfTransactionId.value = option?.id ?? null;
  refundPickerQuery.value = option?.name ?? '';
}

watch(formIsRefund, (flag) => {
  if (flag) {
    loadRecentExpenses();
  } else {
    formRefundOfTransactionId.value = null;
    refundPickerQuery.value = '';
  }
});

// Clear the refund flag when the user flips to expense — the backend rejects
// it anyway, but this keeps the local state tidy.
watch(isOutcomeSelected, (isExpense) => {
  if (isExpense) {
    formIsRefund.value = false;
    formRefundOfTransactionId.value = null;
  }
});

onMounted(async () => {
  try {
    await sharedData.loadAllData();

    if (!props.editingItem) {
      const defaultGroup = sharedData.getDefaultGroup.value;
      if (defaultGroup && !selectedGroupId.value) {
        selectedGroupId.value = defaultGroup.id;
        formCategory.value = defaultGroup.name;
        groupSearchQuery.value = defaultGroup.name; // Show in dropdown input
      }

      const defaultWallet = sharedData.getDefaultWallet.value;
      if (defaultWallet && !selectedWalletId.value) {
        selectedWalletId.value = defaultWallet.id;
        walletSearchQuery.value = defaultWallet.name;
        if (defaultWallet.currency) {
          selectedCurrency.value = defaultWallet.currency;
        }
      }
    }
  } catch (e) {
    console.error('[TransactionForm] Failed to load shared data', e);
  }
});

const selectedFileNames = ref([]);

function onFilesSelected(event) {
  const input = event.target;
  const files = input.files;
  if (!files) return;
  filesToUpload.value = [];
  selectedFileNames.value = [];
  for (const file of Array.from(files)) {
    filesToUpload.value.push(file);
    selectedFileNames.value.push({ name: file.name, size: file.size });
  }
}

function removeFile(index) {
  filesToUpload.value.splice(index, 1);
  selectedFileNames.value.splice(index, 1);
}

watch(
  () => props.editingItem,
  async (item) => {
    if (!item) return;

    dateError.value = false;
    timeError.value = false;
    amountError.value = false;
    partyError.value = false;
    categoryError.value = false;

    if (item.date) formDate.value = item.date;
    if (item.time) formTime.value = item.time;

    if (item.party) {
      formParty.value = item.party;
      searchQuery.value = item.party;
    }
    if (item.partyId) {
      selectedPartyId.value = item.partyId;
    }

    if (item.groupId) {
      selectedGroupId.value = item.groupId;
      const group = sharedData.groups.value.find((g) => g.id === item.groupId);
      if (group) {
        formCategory.value = group.name;
        groupSearchQuery.value = group.name;
      }
    }

    if (item.categoryIds && item.categoryIds.length > 0) {
      selectedAdditionalCategoryIds.value = item.categoryIds;
    }

    if (item.walletId) {
      selectedWalletId.value = item.walletId;
      const wallet = sharedData.wallets.value.find((w) => w.id === item.walletId);
      if (wallet) {
        walletSearchQuery.value = wallet.name;
        if (wallet.currency) {
          selectedCurrency.value = wallet.currency;
        }
      }
    }

    if (item.description) {
      formDescription.value = item.description;
    }

    if (item.amount) {
      const num = parseFloat(String(item.amount).replace(/[^\d.]/g, ''));
      formAmount.value = Number.isFinite(num) ? String(num) : '';
    }

    if (item.isRecurring) {
      formIsRecurring.value = true;
      formRecurrencePeriod.value = item.recurrencePeriod || 'monthly';
      formRecurrenceInterval.value = item.recurrenceInterval || 1;
      formRecurrenceEndsAt.value = item.recurrenceEndsAt ? item.recurrenceEndsAt.split('T')[0] : '';
    }

    if (item.isRefund) {
      formIsRefund.value = true;
      formRefundOfTransactionId.value = item.refundOfTransactionId ?? null;
      await loadRecentExpenses();
      if (formRefundOfTransactionId.value) {
        const match = recentExpenses.value.find(
          (exp) => Number(exp.id) === formRefundOfTransactionId.value
        );
        if (match) refundPickerQuery.value = formatExpenseOption(match);
      }
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_transaction-form.scss' as *;
</style>
