<template>
  <TModal
    v-model="open"
    :title="editing ? t('Edit transaction') : t('Record a transaction')"
    :description="
      t('Everyone in {name} sees this entry and who recorded it.', { name: space?.name ?? '' })
    "
    :error="error"
  >
    <div v-if="!nativeWallets.length" class="blocked">
      <p>
        {{
          canManage
            ? t('Add a shared wallet first. Transactions in a space are recorded against one.')
            : t('An admin needs to add a shared wallet before transactions can be recorded.')
        }}
      </p>
    </div>
    <form v-else id="space-transaction" class="fields" @submit.prevent="save">
      <div class="type-toggle" role="radiogroup" :aria-label="t('Type')">
        <button
          v-for="option in types"
          :key="option.value"
          type="button"
          role="radio"
          class="type-option"
          :class="[`type-option--${option.value}`, { active: form.type === option.value }]"
          :aria-checked="form.type === option.value"
          @click="form.type = option.value"
        >
          {{ option.label }}
        </button>
      </div>
      <div class="row">
        <label class="form-group">
          <span class="form-label">{{ t('Amount') }}</span>
          <input
            v-model="form.amount"
            class="form-input"
            type="number"
            min="0.01"
            step="0.01"
            inputmode="decimal"
            required
          />
        </label>
        <label class="form-group">
          <span class="form-label">{{ t('Wallet') }}</span>
          <select v-model="form.wallet_id" class="form-select" required>
            <option v-for="wallet in nativeWallets" :key="wallet.id" :value="wallet.id">
              {{ wallet.name }} ({{ wallet.currency }})
            </option>
          </select>
        </label>
      </div>
      <label class="form-group">
        <span class="form-label">{{ t('Description') }}</span>
        <input v-model="form.description" class="form-input" maxlength="255" />
      </label>
      <label class="form-group">
        <span class="form-label">{{ t('Date and time') }}</span>
        <input v-model="form.datetime" class="form-input" type="datetime-local" required />
      </label>
      <fieldset v-if="overview.categories.length" class="form-group chips">
        <legend class="form-label">{{ t('Categories') }}</legend>
        <button
          v-for="category in overview.categories"
          :key="category.id"
          type="button"
          class="chip"
          :class="{ active: form.category_ids.includes(category.id) }"
          :aria-pressed="form.category_ids.includes(category.id)"
          @click="toggle(form.category_ids, category.id)"
        >
          {{ category.name }}
        </button>
      </fieldset>
      <label v-if="form.type === 'income'" class="refund">
        <input v-model="form.is_refund" type="checkbox" />
        <span>{{ t('This is a refund') }}</span>
      </label>
    </form>
    <template #actions>
      <TButton variant="secondary" :text="t('Cancel')" @click="open = false" />
      <TButton
        v-if="!nativeWallets.length && canManage"
        :text="t('Add a shared wallet')"
        @click="toWallets"
      />
      <TButton
        v-else-if="nativeWallets.length"
        type="submit"
        form="space-transaction"
        :loading="saving"
        :text="editing ? t('Save changes') : t('Record')"
      />
    </template>
  </TModal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import TModal from '@/components/TModal.vue';
import TButton from '@/components/TButton.vue';
import { extractApiErrors } from '~/utils/apiErrors';
import { localDateTime } from '~/utils/spaceMoney';

const { t } = useI18n();
const { open, editing } = useSpaceComposer();
const { space, canManage } = useActiveSpace();
const { overview, nativeWallets, saveTransaction, ensure } = useSpaceFinance();
const { handle } = useUpsell();
const error = ref('');
const saving = ref(false);
const types = [
  { value: 'expense' as const, label: t('Expense') },
  { value: 'income' as const, label: t('Income') }
];
const form = reactive({
  wallet_id: 0,
  amount: '',
  type: 'expense' as 'income' | 'expense',
  datetime: localDateTime(),
  description: '',
  is_refund: false,
  category_ids: [] as number[]
});

function toggle(list: number[], id: number) {
  const index = list.indexOf(id);
  if (index >= 0) list.splice(index, 1);
  else list.push(id);
}

watch(open, async (isOpen) => {
  if (!isOpen) return;
  error.value = '';
  await ensure();
  const entry = editing.value;
  Object.assign(form, {
    wallet_id: entry?.wallet_id ?? nativeWallets.value[0]?.id ?? 0,
    amount: entry ? String(entry.amount) : '',
    type: entry?.type ?? 'expense',
    datetime: entry ? localDateTime(new Date(entry.datetime)) : localDateTime(),
    description: entry?.description ?? '',
    is_refund: entry?.is_refund ?? false,
    category_ids: [...(entry?.category_ids ?? [])]
  });
});

async function save() {
  saving.value = true;
  error.value = '';
  try {
    await saveTransaction(
      {
        wallet_id: Number(form.wallet_id),
        amount: Number(form.amount),
        type: form.type,
        datetime: new Date(form.datetime).toISOString(),
        description: form.description,
        is_refund: form.type === 'income' && form.is_refund,
        category_ids: form.category_ids
      },
      editing.value?.id
    );
    open.value = false;
  } catch (cause) {
    if (handle(cause)) open.value = false;
    else error.value = extractApiErrors(cause);
  } finally {
    saving.value = false;
  }
}

async function toWallets() {
  open.value = false;
  await navigateTo({ path: '/wallets', query: { new: '1' } });
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_form-styles.scss';
@use './space-form' as *;
</style>
