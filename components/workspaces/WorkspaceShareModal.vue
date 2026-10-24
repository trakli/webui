<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  DsModal,
  DsTabs,
  DsButton,
  DsDropdown,
  DsSwitch,
  DsStatePanel,
  DsInput
} from '@whilesmart/design';
import walletsApi from '~/services/api/walletsApi';
import transactionApi from '~/services/transactionApi';
import type { Wallet } from '~/types/wallet';
import type { ApiTransaction } from '~/types/transaction';
import { extractApiErrors } from '~/utils/apiErrors';
const props = defineProps<{ modelValue: boolean; workspace: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; saved: [] }>();
const api = useApi();
const mode = ref('wallet');
const wallets = ref<Wallet[]>([]);
const transactions = ref<ApiTransaction[]>([]);
const selected = ref('');
const confirmed = ref(false);
const error = ref('');
const loading = ref(false);
const saving = ref(false);
const search = ref('');
const page = ref(1);
const lastPage = ref(1);
const options = computed(() =>
  mode.value === 'wallet'
    ? wallets.value.map((wallet) => ({
        value: String(wallet.id),
        label: `${wallet.name} (${wallet.currency})`
      }))
    : transactions.value.map((transaction) => ({
        value: String(transaction.id),
        label: `${transaction.description || transaction.type} · ${transaction.amount} ${transaction.wallet?.currency || ''} · ${transaction.datetime.slice(0, 10)}`
      }))
);
async function load() {
  loading.value = true;
  error.value = '';
  try {
    if (mode.value === 'wallet') {
      wallets.value = (await walletsApi.fetchAll()).data;
    } else {
      const response = await transactionApi.fetchAll({
        page: page.value,
        limit: 25,
        search: search.value
      });
      transactions.value = response.data;
      lastPage.value = response.last_page || 1;
    }
  } catch (cause) {
    error.value = extractApiErrors(cause);
  } finally {
    loading.value = false;
  }
}
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      selected.value = '';
      confirmed.value = false;
      page.value = 1;
      load();
    }
  }
);
watch(mode, () => {
  selected.value = '';
  confirmed.value = false;
  page.value = 1;
  load();
});
async function save() {
  saving.value = true;
  error.value = '';
  try {
    await api(
      `/workspaces/${props.workspace}/shares/${mode.value === 'wallet' ? 'wallets' : 'transactions'}`,
      {
        method: 'POST',
        body: { [`${mode.value}_id`]: Number(selected.value), confirmed: confirmed.value }
      }
    );
    emit('saved');
    emit('update:modelValue', false);
  } catch (cause) {
    error.value = extractApiErrors(cause);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <DsModal
    :model-value="modelValue"
    title="Choose what to share"
    description="You keep ownership. Only you can change your personal originals."
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="share-form" @submit.prevent="save">
      <DsTabs
        v-model="mode"
        area="green"
        :options="[
          { key: 'wallet', label: 'A whole wallet' },
          { key: 'transaction', label: 'One transaction' }
        ]"
      />
      <div
        v-if="mode === 'transaction'"
        class="search"
        @keydown.enter.prevent="
          page = 1;
          load();
        "
      >
        <DsInput v-model="search" label="Find a personal transaction" /><DsButton
          variant="secondary"
          @click="
            page = 1;
            load();
          "
          >Search</DsButton
        >
      </div>
      <DsStatePanel v-if="loading" state="loading" title="Loading your personal records" />
      <DsDropdown
        v-else-if="options.length"
        v-model="selected"
        :label="mode === 'wallet' ? 'Personal wallet' : 'Personal transaction'"
        :options="options"
      />
      <DsStatePanel
        v-else
        title="No records to share"
        description="Add a personal wallet or transaction first, then choose it here."
      />
      <div v-if="mode === 'transaction' && lastPage > 1" class="actions">
        <DsButton
          :disabled="page <= 1"
          variant="ghost"
          @click="
            page--;
            load();
          "
          >Previous</DsButton
        ><span>Page {{ page }} of {{ lastPage }}</span
        ><DsButton
          :disabled="page >= lastPage"
          variant="ghost"
          @click="
            page++;
            load();
          "
          >Next</DsButton
        >
      </div>
      <p v-if="mode === 'wallet'">
        Everyone in this space will see this wallet's balance and full transaction history,
        including future entries. Unsharing removes its wallet and transaction shares from this
        space.
      </p>
      <p v-else>
        Everyone in this space will see this entry's amount, date, description, and currency. Your
        personal wallet, attachments, and other transactions stay private.
      </p>
      <DsSwitch v-model="confirmed" label="I understand what will be shared" />
      <p v-if="error" role="alert">{{ error }}</p>
      <div class="actions">
        <DsButton variant="ghost" @click="emit('update:modelValue', false)">Cancel</DsButton
        ><DsButton type="submit" :disabled="!selected || !confirmed" :loading="saving"
          >Share with this space</DsButton
        >
      </div>
    </form>
  </DsModal>
</template>

<style scoped>
.share-form {
  display: grid;
  gap: var(--ds-space-4);
}
p {
  margin: 0;
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-sm);
  line-height: 1.6;
}
.actions,
.search {
  display: flex;
  align-items: end;
  justify-content: flex-end;
  gap: var(--ds-space-3);
}
.search > :first-child {
  flex: 1;
}
@media (max-width: 600px) {
  .actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }
}
</style>
