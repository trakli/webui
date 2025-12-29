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

definePageMeta({
  layout: 'default',
  middleware: 'auth'
});

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
  padding: 6rem 1rem 1rem;

  @media (max-width: $breakpoint-lg) {
    padding: 5.5rem 1rem 1rem;
  }

  @media (max-width: $breakpoint-md) {
    padding: 5rem 0.75rem 1rem;
    width: 100%;
    margin-left: 0;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 4.5rem 0.5rem 1rem;
  }

  @media (max-width: 480px) {
    padding: 4rem 0.25rem 1rem;
  }
}

.settings-content-card {
  min-height: calc(100vh - 120px);
  background-color: $bg-white;
  border-radius: 2rem;
  border: 1px solid $bg-gray;
  padding: 2rem 1rem;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: $breakpoint-md) {
    border-radius: 1.5rem;
    padding: 1.5rem 0.75rem;
    min-height: calc(100vh - 100px);
  }

  @media (max-width: $breakpoint-sm) {
    border-radius: 1rem;
    padding: 1rem 0.5rem;
    min-height: calc(100vh - 80px);
  }

  @media (max-width: 480px) {
    border-radius: 0.75rem;
    padding: 0.75rem 0.25rem;
  }
}

.settings-page {
  width: 95%;
  margin: auto;

  @media (max-width: $breakpoint-sm) {
    width: 100%;
  }
}

.settings-header {
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
