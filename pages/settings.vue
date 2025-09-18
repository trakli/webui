<template>
  <div class="settings-layout">
    <TSidebar />
    <TNavbar />
    <div class="settings-content">
      <div class="settings-content-card">
        <div class="settings-page">
          <div class="settings-header">
            <Settings class="header-icon" />
            <h1>App Settings</h1>
          </div>

          <CollapsibleSection title="Account Information" :icon="User" :defaultOpen="true">
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

          <CollapsibleSection title="Display Settings" :icon="Sun" :defaultOpen="false">
            <template #default="{ isEditMode }">
              <SettingsDisplay :is-edit-mode="isEditMode" />
            </template>
          </CollapsibleSection>

          <PasswordModal v-if="showPasswordModal" @close="showPasswordModal = false" />
        </div>
      </div>
    </div>
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
import TSidebar from '@/components/TSidebar.vue';
import TNavbar from '~/components/TNavbar.vue';

/* eslint-disable no-undef */
definePageMeta({
  layout: 'default',
  middleware: 'auth'
});
/* eslint-enable no-undef */
const showPasswordModal = ref(false);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.settings-layout {
  --sidebar-width: min(300px, 30vw);
  --sidebar-min-width: 200px;
  background-color: $bg-gray;
  min-height: 100vh;
}

.settings-content {
  margin-left: var(--sidebar-width, 100px);
  transition: margin-left 0.3s ease;
  width: calc(100% - var(--sidebar-width, 300px));
  overflow-x: hidden;
  padding: 3.5rem 1rem 1rem;

  @media (max-width: $breakpoint-lg) {
    padding: 1.5rem 1rem;
  }
  @media (max-width: $breakpoint-md) {
    padding: 1.25rem 0.75rem;
    width: 100%;
    margin-left: 0;
  }
}

.settings-content-card {
  min-height: calc(100vh - 100px);
  background-color: $bg-white;
  border-radius: 2rem;
  border: 1px solid $bg-gray;
  padding: 2rem 0.25rem 0.25rem;
  box-sizing: border-box;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 1.5rem 1rem;
  }
}

.settings-page {
  width: 100%;
  width: 95%;
  margin: auto;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.header-icon {
  width: 32px;
  height: 32px;
  color: $primary;
}
</style>
