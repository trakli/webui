<template>
  <div class="space-page">
    <header class="page-head">
      <div>
        <h1>{{ t('Wallets') }}</h1>
        <p>{{ t('Shared wallets belong to the space. Personal wallets you share stay yours.') }}</p>
      </div>
      <div v-if="canWrite" class="page-actions">
        <TButton
          variant="secondary"
          :full-width="false"
          :text="t('Share a personal wallet')"
          @click="sharing = true"
        />
        <TButton
          v-if="canManage"
          :full-width="false"
          :text="t('Add a shared wallet')"
          @click="openWallet(null)"
        />
      </div>
    </header>

    <ComponentLoader
      :is-loading="!ready && !error"
      :error="error"
      :has-data="ready && overview.wallets.length > 0"
      skeleton-variant="card"
      :on-retry="() => load(1)"
    >
      <div class="wallet-grid">
        <article v-for="wallet in overview.wallets" :key="wallet.id" class="wallet tone-card">
          <header class="wallet-head">
            <span class="wallet-name">{{ wallet.name }}</span>
            <SpaceRowActions :items="actionsFor(wallet)" />
          </header>
          <p class="wallet-balance">{{ spaceMoney(wallet.balance, wallet.currency) }}</p>
          <p class="wallet-source">
            {{ wallet.source === 'workspace' ? t('Shared wallet') : t('Personal wallet, shared') }}
            · {{ typeLabel(wallet.type) }}
          </p>
        </article>
      </div>
      <template #empty>
        <div class="empty">
          <h2>{{ t('No wallets in this space yet') }}</h2>
          <p>
            {{
              canManage
                ? t('Add a shared wallet for money you spend together, or share one of your own.')
                : t(
                    'An admin needs to add a shared wallet. You can share one of your own meanwhile.'
                  )
            }}
          </p>
          <TButton
            v-if="canWrite && canManage"
            :full-width="false"
            :text="t('Add a shared wallet')"
            @click="openWallet(null)"
          />
          <TButton
            v-else-if="canWrite"
            :full-width="false"
            :text="t('Share a personal wallet')"
            @click="sharing = true"
          />
        </div>
      </template>
    </ComponentLoader>

    <SpaceWalletModal v-model="walletOpen" :wallet="editing" />
    <SpaceShareModal v-model="sharing" mode="wallets" />
    <ConfirmModal
      :is-open="!!confirming"
      :title="confirming?.title ?? ''"
      :message="confirming?.message ?? ''"
      :confirm-text="confirming?.confirm"
      type="danger"
      @confirm="runConfirm"
      @cancel="confirming = null"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TButton from '@/components/TButton.vue';
import ComponentLoader from '@/components/ComponentLoader.vue';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';
import SpaceRowActions from './SpaceRowActions.vue';
import SpaceWalletModal from './SpaceWalletModal.vue';
import SpaceShareModal from './SpaceShareModal.vue';
import type { WorkspaceWallet } from '~/types/workspace';
import { spaceMoney } from '~/utils/spaceMoney';

const { t } = useI18n();
const route = useRoute();
const { canWrite, canManage } = useActiveSpace();
const { overview, ready, error, load, ensure, removeWallet } = useSpaceFinance();
const { confirming, ask, runConfirm } = useSpaceConfirm();
const walletOpen = ref(false);
const sharing = ref(false);
const editing = ref<WorkspaceWallet | null>(null);

function openWallet(wallet: WorkspaceWallet | null) {
  editing.value = wallet;
  walletOpen.value = true;
}

function typeLabel(type: string) {
  return (
    { bank: t('Bank'), cash: t('Cash'), credit_card: t('Credit card'), mobile: t('Mobile money') }[
      type
    ] ?? type
  );
}

function hasEntries(wallet: WorkspaceWallet) {
  return wallet.transactions_count !== 0;
}

function actionsFor(wallet: WorkspaceWallet) {
  const items = [];
  if (wallet.can_edit) items.push({ label: t('Edit'), run: () => openWallet(wallet) });
  if (wallet.can_edit && !hasEntries(wallet)) {
    items.push({
      label: t('Delete'),
      danger: true,
      run: () =>
        ask({
          title: t('Delete {name}?', { name: wallet.name }),
          message: t('The wallet and its opening balance leave this space.'),
          confirm: t('Delete'),
          action: () => removeWallet(wallet)
        })
    });
  }
  if (wallet.can_unshare) {
    items.push({
      label: t('Stop sharing'),
      danger: true,
      run: () =>
        ask({
          title: t('Stop sharing {name}?', { name: wallet.name }),
          message: t(
            'The space loses access to this wallet and its transactions. Budgets are recalculated.'
          ),
          confirm: t('Stop sharing'),
          action: () => removeWallet(wallet)
        })
    });
  }
  return items;
}

onMounted(async () => {
  await ensure();
  if (route.query.new === '1' && canManage.value && canWrite.value) openWallet(null);
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use './space-page' as *;

.wallet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: $spacing-4;
}

.wallet {
  border-radius: $radius-xl;

  p {
    margin: 0;
  }
}

.wallet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.wallet-name {
  font-weight: $font-semibold;
  color: $text-primary;
}

.wallet-balance {
  margin: $spacing-3 0 $spacing-1 !important;
  font-size: $font-size-2xl;
  font-weight: $font-bold;
  color: $text-primary;
}

.wallet-source {
  font-size: $font-size-sm;
  color: $text-secondary;
}
</style>
