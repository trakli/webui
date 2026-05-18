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

    <div class="toggle-item">
      <div class="toggle-info">
        <div>
          <p class="toggle-label">{{ t('Allow Negative Balances') }}</p>
          <p class="toggle-desc">
            {{ t('Permit wallet balances to go below zero when spending or transferring.') }}
          </p>
        </div>
      </div>
      <label class="toggle-switch">
        <input v-model="allowNegativeBalance" type="checkbox" :disabled="!isEditMode" />
        <span class="slider"></span>
      </label>
    </div>

    <div v-if="isEditMode" class="actions">
      <button type="button" class="submit-btn" @click="handleSave">
        <Save class="inline-icon" />
        <span>{{ t('Update Wallets & Groups') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Save } from 'lucide-vue-next';
import { useSharedData } from '@/composables/useSharedData';
import { useNotifications } from '@/composables/useNotifications';
import configurationsApi from '@/services/api/configurationsApi';
import walletsApi from '@/services/api/walletsApi';
import groupsApi from '@/services/api/groupsApi';
import { CONFIGURATION_KEYS } from '@/utils/configurationKeys';

const SERVER_UUID = '00000000-0000-0000-0000-000000000000';

function generateClientId(): string {
  return `${SERVER_UUID}:${crypto.randomUUID()}`;
}

const { t } = useI18n();

defineProps({
  isEditMode: { type: Boolean, default: false }
});

const sharedData = useSharedData();
const { showSuccess, showError } = useNotifications();
const wallets = computed(() => sharedData.wallets.value);
const groups = computed(() => sharedData.groups.value);

const walletId = ref(null);
const groupId = ref(null);
const allowNegativeBalance = ref(false);

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

    const map = sharedData.configurationsMap.value || {};
    const rawNegative = map[CONFIGURATION_KEYS.WALLETS_ALLOW_NEGATIVE_BALANCE];
    allowNegativeBalance.value =
      rawNegative === true || rawNegative === 'true' || rawNegative === 1 || rawNegative === '1';
  } catch (e) {
    console.error('Failed to load wallets/groups/configurations for settings', e);
  }
});

const handleSave = async () => {
  const failures: string[] = [];

  try {
    await configurationsApi.update(CONFIGURATION_KEYS.WALLETS_ALLOW_NEGATIVE_BALANCE, {
      value: allowNegativeBalance.value,
      type: 'bool'
    });
  } catch (e) {
    console.error('Failed to update negative-balance setting', e);
    failures.push(t('Allow Negative Balances'));
  }

  if (walletId.value) {
    try {
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
    } catch (e) {
      console.error('Failed to update default wallet', e);
      failures.push(t('Default Wallet'));
    }
  }

  if (groupId.value) {
    try {
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
    } catch (e) {
      console.error('Failed to update default group', e);
      failures.push(t('Default Group'));
    }
  } else {
    // Clearing the default group requires removing the config, since the
    // backend rejects an empty value on update.
    try {
      await configurationsApi.delete(CONFIGURATION_KEYS.GROUP);
    } catch (e: any) {
      // 404 just means there was no config to clear.
      const status = e?.statusCode ?? e?.status;
      if (status !== 404) {
        console.error('Failed to clear default group', e);
        failures.push(t('Default Group'));
      }
    }
  }

  try {
    await sharedData.loadConfigurations(true);
  } catch (e) {
    console.error('Failed to reload configurations', e);
  }

  if (failures.length === 0) {
    showSuccess(t('Settings updated'), t('Wallet and group settings saved successfully.'));
  } else {
    showError(
      t('Some settings did not save'),
      t('Could not update: {fields}.', { fields: failures.join(', ') })
    );
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

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  margin-top: 1rem;
  background: $bg-gray;
  border-radius: $radius-lg;
}

.toggle-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toggle-label {
  font-weight: $font-medium;
  color: $text-primary;
  margin: 0;
}

.toggle-desc {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin: 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  flex-shrink: 0;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .slider {
      background-color: $primary;
    }

    &:checked + .slider:before {
      transform: translateX(24px);
    }

    &:disabled + .slider {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: $border-color;
    transition: 0.3s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: '';
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }
}
</style>
