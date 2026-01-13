<template>
  <div class="settings-page">
    <div class="page-header">
      <Settings class="header-icon" />
      <h1>{{ t('App Settings') }}</h1>
    </div>

    <div class="settings-card">
      <TTabs v-model:active-tab="activeTab" :tabs="tabs">
        <template #account>
          <SettingsAccount @open-password-modal="showPasswordModal = true" />
        </template>
        <template #general>
          <SettingsGeneral :is-edit-mode="true" />
        </template>
        <template #wallets>
          <SettingsWallets :is-edit-mode="true" />
        </template>
        <template #display>
          <SettingsDisplay :is-edit-mode="true" />
        </template>
        <template #notifications>
          <SettingsNotifications :is-edit-mode="true" />
        </template>
      </TTabs>
    </div>

    <PasswordModal v-if="showPasswordModal" @close="showPasswordModal = false" />
  </div>
</template>

<script setup>
import { ref, markRaw } from 'vue';
import { Settings, Globe, Wallet, Sun, User, Bell } from 'lucide-vue-next';
import TTabs from '@/components/TTabs.vue';
import SettingsAccount from '@/components/settings/SettingsAccount.vue';
import SettingsGeneral from '@/components/settings/SettingsGeneral.vue';
import SettingsWallets from '@/components/settings/SettingsWallets.vue';
import SettingsDisplay from '@/components/settings/SettingsDisplay.vue';
import SettingsNotifications from '@/components/settings/SettingsNotifications.vue';
import PasswordModal from '@/components/settings/PasswordModal.vue';

const { t } = useI18n();

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});

const showPasswordModal = ref(false);
const activeTab = ref('account');

const tabs = [
  { id: 'account', label: t('Account'), icon: markRaw(User) },
  { id: 'general', label: t('General'), icon: markRaw(Globe) },
  { id: 'wallets', label: t('Wallets'), icon: markRaw(Wallet) },
  { id: 'display', label: t('Display'), icon: markRaw(Sun) },
  { id: 'notifications', label: t('Notifications'), icon: markRaw(Bell) }
];
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

.settings-card {
  background: $bg-white;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
  padding: 1.5rem;

  @media (max-width: $breakpoint-md) {
    padding: 1rem;
  }
}
</style>
