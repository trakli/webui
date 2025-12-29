<template>
  <div class="settings-page">
    <div class="page-header">
      <Settings class="header-icon" />
      <h1>App Settings</h1>
    </div>

    <CollapsibleSection title="Account Information" :icon="User" :default-open="true">
      <template #default="{ isEditMode }">
        <SettingsAccount
          :is-edit-mode="isEditMode"
          @open-password-modal="showPasswordModal = true"
        />
      </template>
    </CollapsibleSection>

    <CollapsibleSection title="General Settings" :icon="Globe">
      <template #default="{ isEditMode }">
        <SettingsGeneral :is-edit-mode="isEditMode" />
      </template>
    </CollapsibleSection>

    <CollapsibleSection title="Account & Wallets" :icon="Wallet">
      <template #default="{ isEditMode }">
        <SettingsWallets :is-edit-mode="isEditMode" />
      </template>
    </CollapsibleSection>

    <CollapsibleSection title="Display Settings" :icon="Sun" :default-open="false">
      <template #default="{ isEditMode }">
        <SettingsDisplay :is-edit-mode="isEditMode" />
      </template>
    </CollapsibleSection>

    <PasswordModal v-if="showPasswordModal" @close="showPasswordModal = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Settings, Globe, Wallet, Sun, User } from 'lucide-vue-next';
import CollapsibleSection from '@/components/settings/CollapsibleSection.vue';
import SettingsAccount from '@/components/settings/SettingsAccount.vue';
import SettingsGeneral from '@/components/settings/SettingsGeneral.vue';
import SettingsWallets from '@/components/settings/SettingsWallets.vue';
import SettingsDisplay from '@/components/settings/SettingsDisplay.vue';
import PasswordModal from '@/components/settings/PasswordModal.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});

const showPasswordModal = ref(false);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.settings-page {
  width: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;

  h1 {
    font-size: $font-size-lg;
    font-weight: $font-semibold;
    color: $text-primary;
    margin: 0;

    @media (max-width: $breakpoint-md) {
      font-size: $font-size-base;
    }

    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-sm;
    }
  }

  @media (max-width: $breakpoint-sm) {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
}

.header-icon {
  width: 24px;
  height: 24px;
  color: $primary;

  @media (max-width: $breakpoint-sm) {
    width: 20px;
    height: 20px;
  }
}
</style>
