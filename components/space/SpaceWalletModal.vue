<template>
  <TModal
    :model-value="modelValue"
    :title="wallet ? t('Edit shared wallet') : t('Add a shared wallet')"
    :description="t('A shared wallet belongs to the space. Everyone can record against it.')"
    :error="error"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <form id="space-wallet" class="fields" @submit.prevent="save">
      <label class="form-group">
        <span class="form-label">{{ t('Name') }}</span>
        <input v-model="form.name" class="form-input" maxlength="255" required />
      </label>
      <div class="row">
        <label class="form-group">
          <span class="form-label">{{ t('Type') }}</span>
          <select v-model="form.type" class="form-select">
            <option value="bank">{{ t('Bank') }}</option>
            <option value="cash">{{ t('Cash') }}</option>
            <option value="credit_card">{{ t('Credit card') }}</option>
            <option value="mobile">{{ t('Mobile money') }}</option>
          </select>
        </label>
        <label class="form-group">
          <span class="form-label">{{ t('Currency') }}</span>
          <select v-model="form.currency" class="form-select" :disabled="!!wallet">
            <option v-for="currency in CURRENCIES" :key="currency.code" :value="currency.code">
              {{ currency.code }}
            </option>
          </select>
        </label>
      </div>
      <label class="form-group">
        <span class="form-label">{{ t('Opening balance') }}</span>
        <input
          v-model="form.balance"
          class="form-input"
          type="number"
          step="0.01"
          inputmode="decimal"
        />
      </label>
    </form>
    <template #actions>
      <TButton variant="secondary" :text="t('Cancel')" @click="$emit('update:modelValue', false)" />
      <TButton
        type="submit"
        form="space-wallet"
        :loading="saving"
        :text="wallet ? t('Save changes') : t('Add wallet')"
      />
    </template>
  </TModal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import TModal from '@/components/TModal.vue';
import TButton from '@/components/TButton.vue';
import type { WorkspaceWallet } from '~/types/workspace';
import { CURRENCIES } from '~/utils/currencies';
import { extractApiErrors } from '~/utils/apiErrors';

const props = defineProps<{ modelValue: boolean; wallet: WorkspaceWallet | null }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
const { t } = useI18n();
const { saveWallet } = useSpaceFinance();
const { handle } = useUpsell();
const error = ref('');
const saving = ref(false);
const form = reactive({ name: '', type: 'bank', currency: 'EUR', balance: '0' });

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    error.value = '';
    Object.assign(form, {
      name: props.wallet?.name ?? '',
      type: props.wallet?.type ?? 'bank',
      currency: props.wallet?.currency ?? 'EUR',
      balance: String(props.wallet?.balance ?? 0)
    });
  }
);

async function save() {
  saving.value = true;
  error.value = '';
  try {
    await saveWallet(
      { name: form.name, type: form.type, currency: form.currency, balance: Number(form.balance) },
      props.wallet?.id
    );
    emit('update:modelValue', false);
  } catch (cause) {
    if (handle(cause)) emit('update:modelValue', false);
    else error.value = extractApiErrors(cause);
  } finally {
    saving.value = false;
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_form-styles.scss';
@use './space-form' as *;
</style>
