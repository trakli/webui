<template>
  <LedgerShell>
    <slot />
    <NotificationsContainer />
    <SpaceTransactionModal v-if="isShared" />
    <UpsellPrompt />
  </LedgerShell>
</template>

<script setup>
import { onMounted } from 'vue';
import NotificationsContainer from '@/components/NotificationsContainer.vue';
import SpaceTransactionModal from '@/components/space/SpaceTransactionModal.vue';
import UpsellPrompt from '@/components/space/UpsellPrompt.vue';
import { useAuth } from '@/composables/useAuth';
import LedgerShell from '@/components/ledger/LedgerShell.vue';

const { user, fetchUser } = useAuth();
const { isShared } = useActiveSpace();
useSpaceFinanceReset();

onMounted(() => {
  if (!user.value) {
    fetchUser();
  }
});
</script>
