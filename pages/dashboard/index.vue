<template>
  <LedgerSpace v-if="isShared" />
  <div v-else-if="shouldShowWizard" class="dashboard">
    <DashboardAgentHero />
    <OnboardingWizard
      @start-action="handleWizardAction"
      @step-action="handleWizardAction"
      @complete-onboarding="handleCompleteOnboarding"
    />
  </div>
  <LedgerOverview v-else />
</template>

<script setup>
import LedgerSpace from '@/components/ledger/space/LedgerSpace.vue';
import LedgerOverview from '@/components/ledger/overview/LedgerOverview.vue';
import { computed, watch } from 'vue';
import { useRouter } from 'nuxt/app';
import { useTransactions } from '@/composables/useTransactions';
import { useNotifications } from '@/composables/useNotifications';
import { checkAuth } from '~/utils/auth';
import { CONFIGURATION_KEYS } from '~/utils/configurationKeys';
import DashboardAgentHero from '@/components/dashboard/DashboardAgentHero.vue';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard.vue';

const { isShared } = useActiveSpace();

const router = useRouter();

const { transactions } = useTransactions();
const { configurationsMap } = useSharedData();
const { setComplete: setOnboardingComplete } = useOnboardingStatus();

const { isLoading, error, isInitialized } = useDataManagerStates();
useDataInitialization();

// Check onboarding status after data loads
watch(
  isInitialized,
  (initialized) => {
    if (initialized && configurationsMap.value) {
      const isOnboardingComplete =
        !!configurationsMap.value[CONFIGURATION_KEYS.ONBOARDING_COMPLETE];
      if (isOnboardingComplete) {
        setOnboardingComplete();
      } else {
        router.push('/onboarding');
      }
    }
  },
  { immediate: true }
);

const shouldShowWizard = computed(() => {
  if (typeof window === 'undefined') return false;
  if (!checkAuth()) return false;
  if (error.value) return false;
  return isInitialized.value && !isLoading.value && transactions.value.length === 0;
});

const { showSuccess } = useNotifications();

const handleWizardAction = (action) => {
  const actionRoutes = {
    'add-transaction': '/transactions/new',
    'setup-wallets': '/wallets',
    'manage-categories': '/categories',
    'add-parties': '/parties'
  };

  if (actionRoutes[action]) {
    router.push(actionRoutes[action]);
  }
};

const handleCompleteOnboarding = () => {
  localStorage.setItem('onboarding-completed', 'true');
  showSuccess('Welcome to Trakli!', "You're all set to start tracking your finances.");
};

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  ledgerFrame: true
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 24px 32px;
  overflow: auto;
  height: 100%;
}
</style>
