<template>
  <div>
    <div class="section-grid">
      <div class="form-group">
        <label class="form-label">{{ t('Default Wallet') }}</label>
        <select v-if="isEditMode" v-model="walletId" class="form-select">
          <option v-for="w in wallets" :key="w.id" :value="w.id">
            {{ w.name }}
            <template v-if="w.currency"> ({{ w.currency }})</template>
          </option>
        </select>
        <div v-else class="wallet-display">
          <p class="text-display">{{ walletLabel || '—' }}</p>
          <span v-if="walletLabel" class="wallet-badge">{{ t('Currently Selected') }}</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('Default Group') }}</label>
        <select v-if="isEditMode" v-model="groupId" class="form-select">
          <option :value="null">{{ t('None') }}</option>
          <option v-for="g in groups" :key="g.id" :value="g.id">
            {{ g.name }}
          </option>
        </select>
        <p v-else class="text-display">{{ groupLabel || '—' }}</p>
      </div>
    </div>

    <div v-if="isEditMode" class="actions">
      <button type="button" class="submit-btn" @click="handleSave">
        <Save class="inline-icon" />
        <span>{{ t('Update Wallets & Groups') }}</span>
      </button>
      <p v-if="message" class="success-text">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { Save } from 'lucide-vue-next';
import { useSharedData } from '@/composables/useSharedData';
import configurationsApi from '@/services/api/configurationsApi';
import walletsApi from '@/services/api/walletsApi';
import groupsApi from '@/services/api/groupsApi';
import { CONFIGURATION_KEYS } from '@/utils/configurationKeys';

const SERVER_UUID = '00000000-0000-0000-0000-000000000000';

function generateClientId(): string {
  return `${SERVER_UUID}:${crypto.randomUUID()}`;
}

const { t } = useI18n();

const props = defineProps({
  isEditMode: { type: Boolean, default: false }
});

const sharedData = useSharedData();
const wallets = computed(() => sharedData.wallets.value);
const groups = computed(() => sharedData.groups.value);

const walletId = ref(null);
const groupId = ref(null);
const message = ref('');

watch(
  () => props.isEditMode,
  () => {
    message.value = '';
  }
);

const walletLabel = computed(() => {
  if (!walletId.value) return '';
  const w = wallets.value.find((x) => x.id === walletId.value);
  return w ? w.name : '';
});

const groupLabel = computed(() => {
  if (!groupId.value) return '';
  const g = groups.value.find((x) => x.id === groupId.value);
  return g ? g.name : '';
});

onMounted(async () => {
  try {
    await sharedData.loadWallets();
    await sharedData.loadGroups();
    await sharedData.loadConfigurations();

    const defWallet = sharedData.getDefaultWallet.value;
    if (defWallet?.id != null) {
      walletId.value = defWallet.id;
    }

    const defGroup = sharedData.getDefaultGroup.value;
    if (defGroup?.id != null) {
      groupId.value = defGroup.id;
    }
  } catch (e) {
    console.error('Failed to load wallets/groups/configurations for settings', e);
  }
});

const handleSave = async () => {
  try {
    if (walletId.value) {
      const wallet = wallets.value.find((w) => w.id === walletId.value);
      let walletClientId = wallet?.client_generated_id;

      if (!walletClientId && wallet) {
        walletClientId = generateClientId();
        await walletsApi.update(wallet.id, { client_id: walletClientId });
        await sharedData.loadWallets(true);
      }

      await configurationsApi.update(CONFIGURATION_KEYS.WALLET, {
        value: walletClientId || walletId.value,
        type: 'string'
      });
    }

    if (groupId.value) {
      const group = groups.value.find((g) => g.id === groupId.value);
      let groupClientId = group?.client_generated_id;

      if (!groupClientId && group) {
        groupClientId = generateClientId();
        await groupsApi.update(group.id, { client_id: groupClientId });
        await sharedData.loadGroups(true);
      }

      await configurationsApi.update(CONFIGURATION_KEYS.GROUP, {
        value: groupClientId || groupId.value,
        type: 'string'
      });
    } else {
      await configurationsApi.update(CONFIGURATION_KEYS.GROUP, {
        value: null,
        type: 'string'
      });
    }

    await sharedData.loadConfigurations(true);
    message.value = t('Wallet and group settings updated successfully!');
  } catch (e) {
    console.error('Failed to update wallet/group configuration', e);
  } finally {
    setTimeout(() => {
      message.value = '';
    }, 2000);
  }
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.section-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: $breakpoint-md) {
    grid-template-columns: 1fr 1fr;
  }
}

.text-display {
  padding: 0.75rem 1rem;
  border-radius: $radius-lg;
  background: $bg-gray;
  color: $text-primary;
  font-weight: $font-medium;
}

.wallet-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .text-display {
    margin: 0;
  }

  .wallet-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--color-primary-rgb), 0.1);
    color: $primary;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 4px;
    width: fit-content;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    border: 1px solid $primary;
  }
}

.inline-icon {
  width: 18px;
  height: 18px;
}

.actions {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.success-text {
  margin-top: 0.75rem;
  color: $primary;
  font-weight: $font-semibold;
}
</style>
