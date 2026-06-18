<template>
  <Teleport to="body">
    <div class="qa-overlay" @click.self="$emit('close')">
      <div class="qa-modal">
        <header class="qa-head">
          <span class="qa-icon"><component :is="config.icon" :size="18" /></span>
          <div class="qa-heading">
            <h3 class="qa-title">{{ config.title }}</h3>
            <p class="qa-sub">{{ config.sub }}</p>
          </div>
          <button class="qa-close" :aria-label="t('Close')" @click="$emit('close')">
            <X :size="18" />
          </button>
        </header>

        <div class="qa-body">
          <!-- Log a transaction (executes directly) -->
          <template v-if="action === 'log'">
            <div class="qa-row">
              <button
                type="button"
                class="qa-toggle"
                :class="{ active: form.type === 'expense' }"
                @click="form.type = 'expense'"
              >
                {{ t('Expense') }}
              </button>
              <button
                type="button"
                class="qa-toggle"
                :class="{ active: form.type === 'income' }"
                @click="form.type = 'income'"
              >
                {{ t('Income') }}
              </button>
            </div>
            <label class="qa-field">
              <span class="qa-label">{{ t('Amount') }}</span>
              <input
                v-model.number="form.amount"
                type="number"
                step="0.01"
                min="0"
                class="qa-input"
              />
            </label>
            <label class="qa-field">
              <span class="qa-label">{{ t('What for?') }}</span>
              <input
                v-model="form.description"
                type="text"
                class="qa-input"
                :placeholder="t('e.g. coffee')"
              />
            </label>
            <label class="qa-field">
              <span class="qa-label">{{ t('Wallet') }} ({{ t('optional') }})</span>
              <select v-model="form.walletId" class="qa-input">
                <option :value="null">{{ t('Default') }}</option>
                <option v-for="w in wallets" :key="w.id" :value="w.id">{{ w.name }}</option>
              </select>
            </label>
            <label class="qa-field">
              <span class="qa-label">{{ t('Party') }} ({{ t('optional') }})</span>
              <select v-model="form.partyId" class="qa-input">
                <option :value="null">{{ t('None') }}</option>
                <option v-for="p in parties" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </label>
            <label class="qa-field">
              <span class="qa-label">{{ t('When') }} ({{ t('optional') }})</span>
              <input v-model="form.date" type="date" class="qa-input" />
            </label>
          </template>

          <!-- Transfer money (executes directly) -->
          <template v-else-if="action === 'transfer'">
            <label class="qa-field">
              <span class="qa-label">{{ t('Amount') }}</span>
              <input
                v-model.number="form.amount"
                type="number"
                step="0.01"
                min="0"
                class="qa-input"
              />
            </label>
            <label class="qa-field">
              <span class="qa-label">{{ t('From wallet') }}</span>
              <select v-model="form.fromWalletId" class="qa-input">
                <option :value="null" disabled>{{ t('Select a wallet') }}</option>
                <option v-for="w in wallets" :key="w.id" :value="w.id">
                  {{ w.name }} ({{ w.currency }})
                </option>
              </select>
            </label>
            <label class="qa-field">
              <span class="qa-label">{{ t('To wallet') }}</span>
              <select v-model="form.toWalletId" class="qa-input">
                <option :value="null" disabled>{{ t('Select a wallet') }}</option>
                <option v-for="w in wallets" :key="w.id" :value="w.id">
                  {{ w.name }} ({{ w.currency }})
                </option>
              </select>
            </label>
            <label v-if="needsRate" class="qa-field">
              <span class="qa-label">{{ t('Exchange rate') }}</span>
              <input
                v-model.number="form.exchangeRate"
                type="number"
                step="0.0001"
                min="0"
                class="qa-input"
              />
            </label>
          </template>

          <!-- Build a report (goes to chat) -->
          <template v-else-if="action === 'report'">
            <label class="qa-field">
              <span class="qa-label">{{ t('Period') }}</span>
              <select v-model="form.period" class="qa-input">
                <option value="this month">{{ t('This month') }}</option>
                <option value="last month">{{ t('Last month') }}</option>
                <option value="this year">{{ t('This year') }}</option>
              </select>
            </label>
            <label class="qa-field">
              <span class="qa-label">{{ t('Focus') }} ({{ t('optional') }})</span>
              <input
                v-model="form.focus"
                type="text"
                class="qa-input"
                :placeholder="t('e.g. dining, subscriptions')"
              />
            </label>
          </template>

          <!-- Import a document (goes to chat with the file) -->
          <template v-else-if="action === 'import'">
            <div class="qa-field">
              <span class="qa-label">{{ t('Document') }}</span>
              <button type="button" class="qa-file" @click="fileInput?.click()">
                <Upload :size="16" />
                <span>{{ fileName || t('Choose a file') }}</span>
              </button>
              <input
                ref="fileInput"
                type="file"
                accept="image/*,.pdf,.csv"
                class="qa-file-input"
                @change="onFile"
              />
            </div>
            <label class="qa-field">
              <span class="qa-label">{{ t('Anything to add?') }} ({{ t('optional') }})</span>
              <input
                v-model="form.prompt"
                type="text"
                class="qa-input"
                :placeholder="t('e.g. this is a bank statement for June')"
              />
            </label>
          </template>
        </div>

        <div class="qa-actions">
          <button class="qa-btn qa-cancel" @click="$emit('close')">{{ t('Cancel') }}</button>
          <button class="qa-btn qa-submit" :disabled="!canSubmit || busy" @click="submit">
            {{ busy ? t('Working…') : submitLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { X, PlusCircle, ArrowLeftRight, FileBarChart, FileUp, Upload } from 'lucide-vue-next';
import { useSharedData } from '@/composables/useSharedData';
import { useTransactions } from '@/composables/useTransactions';
import { useNotifications } from '@/composables/useNotifications';
import transfersApi from '@/services/api/transfersApi';
import type { FrontendTransaction } from '~/types/transaction';

const props = defineProps<{ action: 'log' | 'transfer' | 'report' | 'import' }>();
const emit = defineEmits<{
  (e: 'close' | 'done'): void;
  (e: 'submit', payload: { text: string; files?: File[] }): void;
}>();

const { t } = useI18n();
const sharedData = useSharedData();
const wallets = sharedData.wallets;
const parties = sharedData.parties;
const { addTransaction, refreshTransactions } = useTransactions();
const { showSuccess, showError } = useNotifications();

const fileInput = ref<HTMLInputElement | null>(null);
const fileName = ref('');
const file = ref<File | null>(null);
const busy = ref(false);

const form = reactive({
  type: 'expense' as 'expense' | 'income',
  amount: null as number | null,
  description: '',
  walletId: null as number | null,
  partyId: null as number | null,
  date: '',
  fromWalletId: null as number | null,
  toWalletId: null as number | null,
  exchangeRate: null as number | null,
  period: 'this month',
  focus: '',
  prompt: ''
});

const CONFIG = {
  log: {
    icon: PlusCircle,
    title: t('Log a transaction'),
    sub: t("Fill in the details and I'll record it")
  },
  transfer: {
    icon: ArrowLeftRight,
    title: t('Transfer money'),
    sub: t('Move money between your wallets')
  },
  report: { icon: FileBarChart, title: t('Build a report'), sub: t('Pick what to summarise') },
  import: {
    icon: FileUp,
    title: t('Import a document'),
    sub: t('Upload a statement, invoice or receipt to extract')
  }
} as const;

const config = computed(() => CONFIG[props.action]);

// log and transfer execute directly; report and import go to the chat.
const isDirect = computed(() => props.action === 'log' || props.action === 'transfer');
const submitLabel = computed(() => (isDirect.value ? t('Save') : t('Ask Trakli')));

const walletById = (id: number | null) => wallets.value.find((w) => w.id === id);

const needsRate = computed(() => {
  const from = walletById(form.fromWalletId);
  const to = walletById(form.toWalletId);
  return !!from && !!to && from.currency !== to.currency;
});

const onFile = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0] ?? null;
  file.value = f;
  fileName.value = f?.name ?? '';
};

const canSubmit = computed(() => {
  if (props.action === 'log') return typeof form.amount === 'number' && form.amount > 0;
  if (props.action === 'transfer') {
    return (
      typeof form.amount === 'number' &&
      form.amount > 0 &&
      !!form.fromWalletId &&
      !!form.toWalletId &&
      form.fromWalletId !== form.toWalletId &&
      (!needsRate.value || (typeof form.exchangeRate === 'number' && form.exchangeRate > 0))
    );
  }
  if (props.action === 'import') return !!file.value;
  return true;
});

const buildText = (): string => {
  if (props.action === 'report') {
    let text = `Build a financial report for ${form.period} with charts`;
    if (form.focus.trim()) text += `, focusing on ${form.focus.trim()}`;
    return text + '.';
  }
  // import a document
  return form.prompt.trim() || 'Import this document and propose the transactions to record.';
};

const runLog = async () => {
  busy.value = true;
  try {
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    await addTransaction({
      id: '',
      date: form.date || '',
      time,
      type: form.type === 'expense' ? 'EXPENSE' : 'INCOME',
      party: '',
      partyId: form.partyId ?? undefined,
      amount: String(form.amount),
      category: '',
      categoryIds: [],
      wallet: '',
      walletId: form.walletId ?? undefined,
      description: form.description.trim(),
      isRefund: false
    } as FrontendTransaction);
    await sharedData.loadWallets(true);
    showSuccess(t('Transaction logged'));
    emit('done');
  } catch {
    showError(t('Could not log the transaction'));
  } finally {
    busy.value = false;
  }
};

const runTransfer = async () => {
  busy.value = true;
  try {
    await transfersApi.create({
      amount: Number(form.amount),
      from_wallet_id: form.fromWalletId as number,
      to_wallet_id: form.toWalletId as number,
      exchange_rate: needsRate.value ? Number(form.exchangeRate) : undefined
    });
    await sharedData.loadWallets(true);
    await refreshTransactions();
    showSuccess(t('Transfer recorded'));
    emit('done');
  } catch {
    showError(t('Could not record the transfer'));
  } finally {
    busy.value = false;
  }
};

const submit = () => {
  if (!canSubmit.value || busy.value) return;
  if (props.action === 'log') return runLog();
  if (props.action === 'transfer') return runTransfer();
  emit('submit', { text: buildText(), files: file.value ? [file.value] : undefined });
};

onMounted(() => {
  if (props.action === 'log') {
    sharedData.loadWallets?.();
    sharedData.loadParties?.();
  }
  if (props.action === 'transfer') sharedData.loadWallets?.();
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.qa-overlay {
  position: fixed;
  inset: 0;
  z-index: 1300;
  // Scroll the overlay itself so a tall modal's footer is always reachable;
  // flex-start + auto margins center it vertically only when it fits.
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  padding: $spacing-4;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
}

.qa-modal {
  width: 100%;
  max-width: 440px;
  margin: auto;
  background: $bg-white;
  border-radius: $radius-xl;
  box-shadow: $shadow-lg;
  overflow: hidden;
}

.qa-head {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-4;
  border-bottom: 1px solid $border-light;
}

.qa-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: $primary-light;
  color: $primary;
  flex-shrink: 0;
}

.qa-heading {
  flex: 1;
  min-width: 0;
}

.qa-title {
  margin: 0;
  font-size: $font-size-base;
  font-weight: $font-bold;
  color: $text-primary;
}

.qa-sub {
  margin: 0;
  font-size: $font-size-xs;
  color: $text-muted;
}

.qa-close {
  border: none;
  background: transparent;
  color: $text-muted;
  cursor: pointer;
  display: inline-flex;
  padding: 4px;
  border-radius: 8px;

  &:hover {
    background: $bg-gray;
    color: $text-secondary;
  }
}

.qa-body {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
  padding: $spacing-4;
}

.qa-row {
  display: flex;
  gap: $spacing-2;
}

.qa-toggle {
  flex: 1;
  padding: $spacing-2;
  border: 1px solid $border-light;
  border-radius: $radius-md;
  background: $bg-white;
  color: $text-secondary;
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  cursor: pointer;
  transition: $transition-base;

  &.active {
    background: $primary-light;
    border-color: $primary;
    color: $primary;
  }
}

.qa-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.qa-label {
  font-size: $font-size-xs;
  color: $text-muted;
}

.qa-input {
  padding: 8px 10px;
  border: 1px solid $border-light;
  border-radius: $radius-md;
  background: $bg-white;
  color: $text-primary;
  font-size: $font-size-sm;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: $primary;
  }
}

.qa-file {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: 8px 10px;
  border: 1px dashed $primary-muted;
  border-radius: $radius-md;
  background: $bg-light;
  color: $text-secondary;
  font-size: $font-size-sm;
  cursor: pointer;
  width: 100%;

  &:hover {
    border-color: $primary;
    color: $primary;
  }
}

.qa-file-input {
  display: none;
}

.qa-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-4;
  border-top: 1px solid $border-light;
}

.qa-btn {
  border: none;
  border-radius: $radius-md;
  padding: $spacing-2 $spacing-4;
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
}

.qa-cancel {
  background: $bg-gray;
  color: $text-secondary;
}

.qa-submit {
  background: $primary;
  color: $text-inverse;
}
</style>
