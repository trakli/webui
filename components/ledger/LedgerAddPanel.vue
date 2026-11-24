<template>
  <div class="la" data-testid="ledger-add-panel">
    <h3 class="la-h">
      <Plus />{{ t('New transaction') }}
      <button type="button" class="la-close" @click="close">{{ t('Close') }}</button>
    </h3>
    <p v-if="saved" class="la-ok" role="status"><Check />{{ saved }}</p>
    <p v-if="errorMessage" class="la-err" role="alert">{{ errorMessage }}</p>
    <FormSection :key="formKey" :is-submitting="isSubmitting" @submit="save" @transfer="transfer" />
    <p class="la-tip">{{ t('Faster: type "64.30 groceries" in the command bar, then fill only what it could not guess.') }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Check, Plus } from 'lucide-vue-next';
import FormSection from '@/components/FormSection.vue';
import { useTransactions } from '@/composables/useTransactions';
import { useSharedData } from '@/composables/useSharedData';
import { useLedgerAdd } from '@/composables/useLedgerAdd';
import { useLedgerEntries } from '@/composables/useLedgerEntries';
import transfersApi from '@/services/api/transfersApi';

const { t } = useI18n();
const { addTransaction, refreshTransactions } = useTransactions();
const shared = useSharedData();
const { close } = useLedgerAdd();
const { load } = useLedgerEntries();

const isSubmitting = ref(false);
const errorMessage = ref('');
const saved = ref('');
const formKey = ref(0);

async function run(task: () => Promise<unknown>) {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  errorMessage.value = '';
  saved.value = '';
  try {
    await task();
    saved.value = t('Saved. Add another or close.');
    formKey.value++;
    load();
  } catch (error: any) {
    const errors = error?.data?.errors;
    errorMessage.value =
      errors && Object.keys(errors).length
        ? Object.values(errors).flat().join(' ')
        : error?.data?.message || error?.message || t('Operation failed. Please check all fields.');
  } finally {
    isSubmitting.value = false;
  }
}

const save = (data: any) => run(() => addTransaction(data));
const transfer = (data: any) =>
  run(async () => {
    await transfersApi.create(data);
    await shared.loadWallets(true);
    await refreshTransactions();
  });
</script>

<style scoped>
.la {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.la-h {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ledger-ink-3);
}

.la-h :deep(svg) {
  width: 14px;
  height: 14px;
}

.la-close {
  margin-left: auto;
  border: 0;
  background: none;
  color: var(--ledger-brand);
  font: inherit;
  font-size: 12.5px;
  letter-spacing: 0;
  text-transform: none;
  cursor: pointer;
}

.la-ok,
.la-err {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 8px 10px;
  border-radius: var(--ledger-r-sm);
  font-size: 13px;
}

.la-ok {
  background: var(--ledger-brand-soft);
  color: var(--ledger-brand);
}

.la-ok :deep(svg) {
  width: 14px;
  height: 14px;
}

.la-err {
  background: var(--ledger-expense-soft);
  color: var(--ledger-expense);
}

.la-tip {
  margin: 0;
  font-size: 12px;
  color: var(--ledger-ink-3);
}

.la :deep(.tab-buttons) {
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r-sm);
  background: var(--ledger-surface-2);
}

.la :deep(.tab-button) {
  flex: 1;
  padding: 6px 8px;
  font-size: 13px;
}

.la :deep(.tab-icon) {
  width: 14px;
  height: 14px;
}
.la :deep(.form-container) {
  padding: 0;
  border: 0;
  box-shadow: none;
  background: none;
}

.la :deep(.form) {
  gap: 12px;
}

.la :deep(.form-transaction) {
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}

.la :deep(.transaction-date),
.la :deep(.transaction-description) {
  gap: 4px;
  min-width: 0;
}

.la :deep(.transaction-date > span),
.la :deep(.transaction-description > span) {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ledger-ink-2);
}

.la :deep(:is(input:not([type='checkbox']):not([type='radio']):not([type='file']), select, textarea)) {
  height: 34px;
  min-height: 34px;
  padding: 6px 10px;
  font-size: 13.5px;
}

.la :deep(textarea) {
  height: 60px;
  min-height: 60px;
}

.la :deep(.transaction-amount input) {
  font-family: var(--ledger-mono);
}

.la :deep(.intent-pills) {
  flex-wrap: wrap;
  gap: 4px;
}

.la :deep(.intent-pill) {
  padding: 4px 8px;
  font-size: 12.5px;
}

.la :deep(.submit-button) {
  height: 36px;
  font-size: 14px;
}
.la :deep(.searchable-dropdown) {
  gap: 4px;
}

.la :deep(.searchable-dropdown > span),
.la :deep(.transaction-files > span),
.la :deep(.transaction-files > h3),
.la :deep(.recurring-toggle),
.la :deep(.refund-toggle) {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ledger-ink-2);
}

.la :deep(.dropdown-search .input-container) {
  min-height: 34px;
  padding: 2px 10px;
}

.la :deep(.dropdown-search .input-container input) {
  height: 28px;
  min-height: 28px;
  padding: 0;
  font-size: 13.5px;
}

.la :deep(:is(.wallet-default-indicator, .group-default-indicator)) {
  top: 27px;
  right: 34px;
  padding: 1px 5px;
  font-size: 10px;
  border-radius: 3px;
}

.la :deep(:is(.wallet-default-indicator, .group-default-indicator))::after {
  display: none;
}

.la :deep(.upload-box) {
  padding: 8px;
  gap: 8px;
}

.la :deep(.upload-button) {
  padding: 6px 10px;
  font-size: 13px;
  white-space: nowrap;
}

.la :deep(.submit-button) {
  align-self: stretch;
  width: 100%;
  margin-top: 4px;
  justify-content: center;
  gap: 6px;
}

.la :deep(.submit-button.submit-button--expense) {
  background: var(--ledger-brand);
  border-color: var(--ledger-brand);
}
</style>
