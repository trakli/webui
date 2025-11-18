<template>
  <div>
    <div class="section-grid">
      <div class="form-group">
        <label class="form-label">Default Wallet</label>
        <select v-if="isEditMode" v-model="walletId" class="form-select">
          <option
            v-for="w in wallets"
            :key="w.id || w.sync_state?.client_generated_id || w.name"
            :value="String(w.sync_state?.client_generated_id ?? w.id)"
          >
            {{ w.name }}
            <template v-if="w.currency"> ({{ w.currency }})</template>
          </option>
        </select>
        <div v-else class="wallet-display">
          <p class="text-display">{{ walletLabel || '—' }}</p>
          <span v-if="walletLabel" class="wallet-badge">Currently Selected</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Default Group</label>
        <select v-if="isEditMode" v-model="group" class="form-select">
          <option value="Personal">Personal</option>
          <option value="Family">Family</option>
          <option value="Work">Work</option>
        </select>
        <p v-else class="text-display">{{ group }}</p>
      </div>
    </div>

    <div v-if="isEditMode" class="actions">
      <button type="button" class="submit-btn" @click="handleSave">
        <Save class="inline-icon" />
        <span>Update Wallets & Groups</span>
      </button>
      <p v-if="message" class="success-text">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { Save } from 'lucide-vue-next';
import { useSharedData } from '@/composables/useSharedData';
import configurationsApi from '@/services/api/configurationsApi';
import { CONFIGURATION_KEYS } from '@/utils/configurationKeys';

const props = defineProps({
  isEditMode: { type: Boolean, default: false }
});

const sharedData = useSharedData();
const wallets = computed(() => sharedData.wallets.value);

const walletId = ref('');
const group = ref('Personal');
const message = ref('');

watch(
  () => props.isEditMode,
  () => {
    message.value = '';
  }
);

const walletLabel = computed(() => {
  if (!walletId.value) return '';
  const w = wallets.value.find(
    (x) => String(x.id) === walletId.value || String(x.sync_state?.client_generated_id || '') === walletId.value
  );
  return w ? w.name : walletId.value;
});

onMounted(async () => {
  try {
    await sharedData.loadWallets();
    await sharedData.loadConfigurations();
    const def = sharedData.getDefaultWallet.value;
    if (def?.id != null) {
      walletId.value = String(def.id);
    }
  } catch (e) {
    console.error('Failed to load wallets/configurations for settings', e);
  }
});

const handleSave = async () => {
  try {
    if (walletId.value) {
      await configurationsApi.update(CONFIGURATION_KEYS.WALLET, {
        value: walletId.value,
        type: 'string'
      });
      // Refresh shared configurations so other parts of the app reflect the change immediately
      await sharedData.loadConfigurations(true);
    }
    message.value = 'Wallet and group settings updated successfully!';
  } catch (e) {
    console.error('Failed to update wallet configuration', e);
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
    background: rgba($primary, 0.1);
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
