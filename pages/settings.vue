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
        <template #integrations>
          <div class="integrations-grid">
            <ExtensionSlot name="settings.integrations" />
          </div>
        </template>
        <template v-for="contribution in pluginTabs" :key="contribution.key" #[contribution.key]>
          <DescriptorRenderer :contribution="contribution" />
        </template>
      </TTabs>
    </div>

    <PasswordModal v-if="showPasswordModal" @close="showPasswordModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, markRaw } from 'vue';
import { Settings, Globe, Wallet, Sun, User, Bell, Puzzle } from 'lucide-vue-next';
import TTabs from '@/components/TTabs.vue';
import SettingsAccount from '@/components/settings/SettingsAccount.vue';
import SettingsGeneral from '@/components/settings/SettingsGeneral.vue';
import SettingsWallets from '@/components/settings/SettingsWallets.vue';
import SettingsDisplay from '@/components/settings/SettingsDisplay.vue';
import SettingsNotifications from '@/components/settings/SettingsNotifications.vue';
import PasswordModal from '@/components/settings/PasswordModal.vue';
import ExtensionSlot from '@/components/extensions/ExtensionSlot.vue';
import DescriptorRenderer from '@/components/extensions/DescriptorRenderer.vue';
import { useExtensionSlots } from '@/composables/useExtensionSlots';

const { t } = useI18n();

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});

const showPasswordModal = ref(false);
const activeTab = ref('account');

const { contributionsFor } = useExtensionSlots();
const pluginTabs = contributionsFor('settings.tabs');

const tabs = computed(() => [
  { id: 'account', label: t('Account'), icon: markRaw(User) },
  { id: 'general', label: t('General'), icon: markRaw(Globe) },
  { id: 'wallets', label: t('Wallets'), icon: markRaw(Wallet) },
  { id: 'display', label: t('Display'), icon: markRaw(Sun) },
  { id: 'notifications', label: t('Notifications'), icon: markRaw(Bell) },
  { id: 'integrations', label: t('Integrations'), icon: markRaw(Puzzle) },
  ...pluginTabs.value.map((contribution) => ({
    id: contribution.key,
    label: contribution.ui.card?.title || contribution.integration.name,
    icon: markRaw(Puzzle)
  }))
]);
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
  border: 1px solid $border-light;
  border-radius: 14px;
  box-shadow: $elevation-1;
  padding: 1.25rem 1.5rem;

  @media (max-width: $breakpoint-md) {
    padding: 1rem;
  }
}

.integrations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  align-items: start;
  gap: 1rem;
}
</style>
