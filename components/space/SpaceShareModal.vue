<template>
  <TModal
    :model-value="modelValue"
    :title="mode === 'wallets' ? t('Share a personal wallet') : t('Share a personal transaction')"
    :description="
      mode === 'wallets'
        ? t('Everyone in the space sees this wallet and every transaction in it. It stays yours.')
        : t('Only this transaction is shared. Its wallet stays private.')
    "
    :error="error"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="fields">
      <input
        v-if="mode === 'transactions'"
        v-model="search"
        class="form-input"
        type="search"
        :placeholder="t('Search your transactions')"
        @input="debouncedLoad"
      />
      <ComponentLoader
        :is-loading="loading"
        :has-data="options.length > 0"
        skeleton-variant="list"
        :skeleton-count="4"
      >
        <ul class="choices" role="radiogroup">
          <li v-for="option in options" :key="option.id">
            <label class="choice" :class="{ active: selected === option.id }">
              <input v-model="selected" type="radio" :value="option.id" name="share" />
              <span class="choice-main">{{ option.title }}</span>
              <span class="choice-meta">{{ option.meta }}</span>
            </label>
          </li>
        </ul>
        <template #empty>
          <p class="hint">
            {{
              search
                ? t('No transactions match “{query}”.', { query: search })
                : mode === 'wallets'
                  ? t('You have no personal wallets to share yet.')
                  : t('You have no personal transactions to share yet.')
            }}
          </p>
        </template>
      </ComponentLoader>
      <TPagination
        v-if="mode === 'transactions' && lastPage > 1"
        :current-page="page"
        :total-pages="lastPage"
        @page-change="changePage"
      />
    </div>
    <template #actions>
      <TButton variant="secondary" :text="t('Cancel')" @click="$emit('update:modelValue', false)" />
      <TButton :disabled="!selected" :loading="saving" :text="t('Share')" @click="save" />
    </template>
  </TModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import TModal from '@/components/TModal.vue';
import TButton from '@/components/TButton.vue';
import TPagination from '@/components/TPagination.vue';
import ComponentLoader from '@/components/ComponentLoader.vue';
import walletsApi from '~/services/api/walletsApi';
import transactionApi from '~/services/transactionApi';
import type { Wallet } from '~/types/wallet';
import type { ApiTransaction } from '~/types/transaction';
import { extractApiErrors } from '~/utils/apiErrors';
import { spaceMoney } from '~/utils/spaceMoney';

const props = defineProps<{ modelValue: boolean; mode: 'wallets' | 'transactions' }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
const { t } = useI18n();
const { share } = useSpaceFinance();
const { handle } = useUpsell();
const wallets = ref<Wallet[]>([]);
const transactions = ref<ApiTransaction[]>([]);
const selected = ref<number | null>(null);
const search = ref('');
const page = ref(1);
const lastPage = ref(1);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
let timer: ReturnType<typeof setTimeout> | undefined;

const options = computed(() =>
  props.mode === 'wallets'
    ? wallets.value.map((wallet) => ({
        id: wallet.id,
        title: wallet.name,
        meta: spaceMoney(wallet.balance, wallet.currency)
      }))
    : transactions.value.map((entry) => ({
        id: entry.id,
        title: entry.description || t(entry.type === 'income' ? 'Income' : 'Expense'),
        meta: `${spaceMoney(entry.amount, entry.wallet?.currency ?? '')} · ${entry.datetime.slice(0, 10)}`
      }))
);

async function load() {
  loading.value = true;
  error.value = '';
  try {
    if (props.mode === 'wallets') {
      wallets.value = (await walletsApi.fetchAll()).data;
    } else {
      const response = await transactionApi.fetchAll({
        page: page.value,
        limit: 10,
        search: search.value || undefined
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

function debouncedLoad() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    page.value = 1;
    load();
  }, 300);
}

function changePage(next: number) {
  page.value = next;
  load();
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    selected.value = null;
    search.value = '';
    page.value = 1;
    load();
  }
);

async function save() {
  if (!selected.value) return;
  saving.value = true;
  error.value = '';
  try {
    await share(props.mode, selected.value);
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
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_form-styles.scss';
@use './space-form' as *;

.choices {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
  margin: 0;
  padding: 0;
  list-style: none;
}

.choice {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-2 $spacing-3;
  border: 1px solid $border-light;
  border-radius: $radius-lg;
  cursor: pointer;

  &.active {
    border-color: $primary;
    background: $primary-light;
  }
}

.choice-main {
  overflow: hidden;
  color: $text-primary;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.choice-meta {
  font-size: $font-size-sm;
  color: $text-secondary;
  white-space: nowrap;
}
</style>
