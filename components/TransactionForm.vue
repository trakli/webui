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
        <span>{{ t('Description') }}</span>
        <textarea v-model="formDescription" :placeholder="t('Type here...')" required />
        <div v-if="descriptionError" class="error-text">{{ t('Description is required.') }}</div>
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
        <SearchableDropdown
          v-model="groupSearchQuery"
          :label="t('Group')"
          :placeholder="t('Search group...')"
          :options="groups"
          :error="categoryError ? t('Group is required.') : ''"
          @select="handleGroupSelect"
        />

        <SearchableDropdown
          v-model="categorySearchQuery"
          :label="t('Categories')"
          :placeholder="t('Search categories...')"
          :options="categories"
          :multiple="true"
          :disabled="isSameAsGroup"
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

const selectedPartyId = ref('');
const selectedWalletId = ref('');
const selectedGroupId = ref(null);
const selectedAdditionalCategoryIds = ref([]);
const filesBase64 = ref([]);
const sharedData = useSharedData();
const selectedCurrency = ref(sharedData.getDefaultCurrency.value || 'USD');

const dateError = ref(false);
const timeError = ref(false);
const amountError = ref(false);
const partyError = ref(false);
const categoryError = ref(false);
const walletError = ref(false);
const descriptionError = ref(false);

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
  descriptionError.value = false;

  const partyValue = (formParty.value || searchQuery.value || '').trim();
  if (partyValue) formParty.value = partyValue;

  return valid;
}

function onSubmit() {
  const isValid = validateRequiredFields();
  if (!isValid) {
    return;
  }

  const now = new Date();
  const date = formDate.value || now.toISOString().slice(0, 10);
  const time = formTime.value || now.toTimeString().slice(0, 5);

  const amountNum = Number(formAmount.value);

  const payload = {
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
    filesToUpload: filesBase64.value
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
  return sharedData.wallets.value.filter((wallet) => {
    return !wallet.currency || wallet.currency === selectedCurrency.value;
  });
});

const isWalletDefault = computed(() => {
  if (!selectedWalletId.value) return false;
  const defaultWallet = sharedData.getDefaultWallet.value;
  if (!defaultWallet) return false;
  const defaultId = String(defaultWallet.sync_state?.client_generated_id || defaultWallet.id);
  return selectedWalletId.value === defaultId;
});

function handlePartySelect(party) {
  formParty.value = party.name;
  const partyId = party.sync_state?.client_generated_id || String(party.id);
  selectedPartyId.value = partyId;
  partyError.value = false;
}

function handleWalletSelect(wallet) {
  const walletId = wallet.sync_state?.client_generated_id || String(wallet.id);
  selectedWalletId.value = walletId;
  walletError.value = false;

  if (wallet.currency && wallet.currency !== selectedCurrency.value) {
    selectedCurrency.value = wallet.currency;
  }
}

function handleCurrencyChange() {
  if (selectedWalletId.value) {
    const currentWallet = sharedData.wallets.value.find(
      (w) => (w.sync_state?.client_generated_id || String(w.id)) === selectedWalletId.value
    );

    if (
      currentWallet &&
      currentWallet.currency &&
      currentWallet.currency !== selectedCurrency.value
    ) {
      selectedWalletId.value = '';
      walletSearchQuery.value = '';

      const defaultWallet = sharedData.getDefaultWallet.value;
      if (defaultWallet) {
        const walletId = defaultWallet.sync_state?.client_generated_id || String(defaultWallet.id);
        selectedWalletId.value = walletId;
        walletSearchQuery.value = defaultWallet.name; // Show in dropdown input
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
        selectedWalletId.value =
          defaultWallet.sync_state?.client_generated_id || String(defaultWallet.id);
        walletSearchQuery.value = defaultWallet.name; // Show in dropdown input
        if (defaultWallet.currency) {
          selectedCurrency.value = defaultWallet.currency;
        }
      }
    }
  } catch (e) {
    console.error('[TransactionForm] Failed to load shared data', e);
  }
});

function isSameAsGroup(category) {
  if (!selectedGroupId.value) return false;
  return category.id === selectedGroupId.value;
}

const selectedFileNames = ref([]);

function onFilesSelected(event) {
  const input = event.target;
  const files = input.files;
  if (!files) return;
  filesBase64.value = [];
  selectedFileNames.value = [];
  const tasks = [];
  for (const file of Array.from(files)) {
    tasks.push(
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          const base64 = result.includes(',') ? result.split(',')[1] : result;
          filesBase64.value.push(base64);
          selectedFileNames.value.push({ name: file.name, size: file.size });
          resolve();
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      })
    );
  }
  Promise.all(tasks)
    .then(() => {
      console.log('Files processed successfully');
    })
    .catch((err) => console.error('Failed to read files', err));
}

function removeFile(index) {
  filesBase64.value.splice(index, 1);
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
    descriptionError.value = false;

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
      const wallet = sharedData.wallets.value.find(
        (w) => (w.sync_state?.client_generated_id || String(w.id)) === item.walletId
      );
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
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_transaction-form.scss' as *;
</style>
