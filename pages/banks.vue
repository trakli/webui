<template>
  <div class="banks-page">
    <h1>{{ t('Bank connections') }}</h1>
    <ComponentLoader :is-loading="loading" :error="error" :has-data="loaded" :on-retry="load">
      <TCard v-if="billing && !billing.paid_access">
        <h2>{{ t('Connect your banks with a paid plan') }}</h2>
        <p>{{ t('Your imported transactions stay available when paid access ends.') }}</p>
        <TButton to="/billing" :text="t('Upgrade')" :full-width="false" />
      </TCard>
      <TCard v-if="connections.length === 0">
        <h2>{{ t('No banks connected') }}</h2>
        <p>{{ t('Connect a bank, then choose which accounts to import into your wallets.') }}</p>
      </TCard>
      <TButton
        v-if="billing?.paid_access"
        :text="t('Connect a bank')"
        :loading="busy"
        :full-width="false"
        @click="connect()"
      />
      <TCard v-if="session">
        <p role="status">{{ t('Connection session') }}: {{ t(session.status) }}</p>
        <template
          v-if="session.status === 'requires_relink' || session.status === 'partial_relink'"
        >
          <p>
            {{
              t(
                'This bank connection could not be confirmed. Start a new connection session. Banks already connected remain available.'
              )
            }}
          </p>
          <TButton
            v-if="billing?.paid_access"
            :text="t('Start a new connection session')"
            :loading="busy"
            :full-width="false"
            @click="connect()"
          />
          <TButton v-else to="/billing" :text="t('Upgrade')" :full-width="false" />
        </template>
        <TButton
          v-if="session.status === 'pending'"
          :to="session.url"
          :text="t('Continue bank connection')"
          :full-width="false"
        />
        <TButton
          :text="t('Check connection status')"
          variant="outline"
          :loading="busy"
          :full-width="false"
          @click="checkSession"
        />
      </TCard>
      <TCard v-for="connection in connections" :key="connection.id">
        <h2>{{ connection.institution_name || `${t('Bank')} ${connection.id}` }}</h2>
        <p>{{ t('Status') }}: {{ t(connection.status) }}</p>
        <p v-if="connection.last_synced_at">
          {{ t('Last synchronized') }}: {{ new Date(connection.last_synced_at).toLocaleString() }}
        </p>
        <div
          v-if="!connection.disconnected_at || connection.status === 'disconnect_pending'"
          class="bank-actions"
        >
          <TButton
            v-if="billing?.paid_access && !connection.disconnected_at"
            :text="t('Choose accounts')"
            variant="outline"
            :loading="busy"
            :full-width="false"
            @click="edit(connection)"
          />
          <TButton
            v-if="billing?.paid_access && !connection.disconnected_at"
            :text="t('Synchronize')"
            :loading="busy"
            :full-width="false"
            @click="sync(connection)"
          />
          <TButton
            v-if="billing?.paid_access && !connection.disconnected_at"
            :text="t('Reconnect')"
            variant="outline"
            :loading="busy"
            :full-width="false"
            @click="connect(connection)"
          />
          <TButton
            :text="t('Disconnect')"
            variant="text"
            :disabled="busy"
            :full-width="false"
            @click="disconnectTarget = connection"
          />
        </div>
      </TCard>
      <TCard v-if="editing">
        <h2>{{ t('Choose accounts to import') }}</h2>
        <p>
          {{ t('Only selected accounts are imported. Each wallet must use the account currency.') }}
        </p>
        <p v-if="accounts.length === 0">{{ t('This bank has no available accounts.') }}</p>
        <div v-for="account in accounts" :key="account.account_id" class="account-mapping">
          <label :for="`account-${account.account_id}`"
            >{{ account.name }} {{ account.mask ? `(${account.mask})` : '' }}
            {{ account.balances.iso_currency_code }}</label
          >
          <select :id="`account-${account.account_id}`" v-model="selection[account.account_id]">
            <option value="">{{ t('Do not import') }}</option>
            <option
              v-for="wallet in matchingWallets(account)"
              :key="wallet.id"
              :value="String(wallet.id)"
            >
              {{ wallet.name }}
            </option>
          </select>
          <NuxtLink v-if="matchingWallets(account).length === 0" to="/wallets">{{
            t('Create a wallet in this currency')
          }}</NuxtLink>
        </div>
        <div class="bank-actions">
          <TButton
            :text="t('Save and synchronize')"
            :loading="busy"
            :full-width="false"
            @click="save"
          />
          <TButton
            :text="t('Cancel')"
            variant="text"
            :disabled="busy"
            :full-width="false"
            @click="editing = null"
          />
        </div>
      </TCard>
      <p v-if="notice" role="status">{{ notice }}</p>
    </ComponentLoader>
    <ConfirmModal
      :is-open="!!disconnectTarget"
      :title="t('Disconnect bank?')"
      :message="t('This stops imports from this bank. Your imported transactions stay available.')"
      :confirm-text="t('Disconnect')"
      @cancel="disconnectTarget = null"
      @confirm="disconnect"
    />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useApi } from '~/composables/useApi';
import { useWallets } from '~/composables/useWallets';
import ConfirmModal from '~/components/modals/ConfirmModal.vue';
import type {
  BankAccount,
  BankConnection,
  BankMapping,
  BillingStatus,
  LinkSession,
  PremiumPage,
  PremiumResponse
} from '~/types/premium';
import { extractApiErrors } from '~/utils/apiErrors';
definePageMeta({ layout: 'dashboard', middleware: 'auth' });
const { t } = useI18n();
const api = useApi();
const route = useRoute();
const { wallets, fetchWallets } = useWallets();
const billing = ref<BillingStatus | null>(null);
const connections = ref<BankConnection[]>([]);
const session = ref<LinkSession | null>(null);
const editing = ref<BankConnection | null>(null);
const accounts = ref<BankAccount[]>([]);
const mappings = ref<BankMapping[]>([]);
const selection = ref<Record<string, string>>({});
const disconnectTarget = ref<BankConnection | null>(null);
const error = ref<string | null>(null);
const notice = ref('');
const loading = ref(true);
const loaded = ref(false);
const busy = ref(false);
const base = (connection: BankConnection) => `/plaid/connections/${connection.id}`;
const matchingWallets = (account: BankAccount) =>
  wallets.value.filter((wallet) => wallet.currency === account.balances.iso_currency_code);
async function allPages<T>(path: string): Promise<T[]> {
  const records: T[] = [];
  let page = 1;
  let lastPage = 1;
  do {
    const result = await api<PremiumResponse<PremiumPage<T>>>(path, {
      query: { page, limit: 100 }
    });
    records.push(...result.data.data);
    lastPage = result.data.last_page;
    page += 1;
  } while (page <= lastPage);
  return records;
}
async function load() {
  loading.value = true;
  error.value = null;
  try {
    const [status, banks] = await Promise.all([
      api<PremiumResponse<BillingStatus>>('/cloud/billing/status'),
      allPages<BankConnection>('/plaid/connections'),
      fetchWallets()
    ]);
    billing.value = status.data;
    connections.value = banks;
    loaded.value = true;
  } catch (e) {
    error.value = extractApiErrors(e);
  } finally {
    loading.value = false;
  }
}
async function action(run: () => Promise<void>) {
  busy.value = true;
  error.value = null;
  notice.value = '';
  try {
    await run();
  } catch (e) {
    error.value = extractApiErrors(e);
  } finally {
    busy.value = false;
  }
}
const connect = (connection?: BankConnection) =>
  action(async () => {
    const result = await api<PremiumResponse<LinkSession>>(
      connection ? `${base(connection)}/reconnect` : '/plaid/link-sessions',
      { method: 'POST' }
    );
    session.value = result.data;
    await navigateTo(
      { path: '/banks', query: { session: String(result.data.id) } },
      { replace: true }
    );
  });
const checkSession = () =>
  action(async () => {
    if (!session.value) return;
    session.value = (
      await api<PremiumResponse<LinkSession>>(`/plaid/link-sessions/${session.value.id}`)
    ).data;
    if (session.value.status === 'completed') await load();
  });
const edit = (connection: BankConnection) =>
  action(async () => {
    const [remote, mapped] = await Promise.all([
      api<PremiumResponse<BankAccount[]>>(`${base(connection)}/accounts`),
      allPages<BankMapping>(`${base(connection)}/mappings`)
    ]);
    accounts.value = remote.data;
    mappings.value = mapped;
    selection.value = Object.fromEntries(
      remote.data.map((account) => [
        account.account_id,
        String(
          mapped.find((mapping) => mapping.plaid_account_id === account.account_id)?.wallet_id || ''
        )
      ])
    );
    editing.value = connection;
  });
const sync = (connection: BankConnection) =>
  action(async () => {
    await api(`${base(connection)}/sync`, { method: 'POST' });
    notice.value = t(
      'Synchronization queued. Imported transactions will appear in your transaction list.'
    );
  });
const save = () =>
  action(async () => {
    if (!editing.value) return;
    for (const account of accounts.value) {
      const walletId = selection.value[account.account_id];
      if (walletId) {
        await api(`${base(editing.value)}/mappings`, {
          method: 'POST',
          body: { plaid_account_id: account.account_id, wallet_id: Number(walletId) }
        });
      } else if (
        mappings.value.some((mapping) => mapping.plaid_account_id === account.account_id)
      ) {
        await api(`${base(editing.value)}/mappings/${encodeURIComponent(account.account_id)}`, {
          method: 'DELETE'
        });
      }
    }
    await api(`${base(editing.value)}/sync`, { method: 'POST' });
    editing.value = null;
    notice.value = t('Account selection saved. Synchronization queued.');
  });
const disconnect = () =>
  action(async () => {
    const connection = disconnectTarget.value;
    disconnectTarget.value = null;
    if (!connection) return;
    await api(base(connection), { method: 'DELETE' });
    await load();
  });
onMounted(async () => {
  await load();
  if (typeof route.query.session === 'string' && /^\d+$/.test(route.query.session)) {
    await action(async () => {
      session.value = (
        await api<PremiumResponse<LinkSession>>(`/plaid/link-sessions/${route.query.session}`)
      ).data;
    });
  }
});
</script>
<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
.banks-page {
  display: grid;
  gap: $spacing-4;
}
.bank-actions {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-3;
}
.account-mapping {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: $spacing-3;
  margin: $spacing-4 0;
}
select {
  background: $bg-white;
  color: $text-primary;
  border: 1px solid $border-light;
  border-radius: $radius-md;
  padding: $spacing-2;
}
@media (max-width: 640px) {
  .bank-actions {
    flex-direction: column;
  }
  .account-mapping {
    grid-template-columns: 1fr;
  }
}
</style>
