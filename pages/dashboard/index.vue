<template>
  <div class="dashboard">
    <TDashboardTopCard :show-filters="hasData" />

    <OnboardingWizard
      v-if="shouldShowWizard"
      @start-action="handleWizardAction"
      @step-action="handleWizardAction"
      @complete-onboarding="handleCompleteOnboarding"
    />

    <template v-if="!shouldShowWizard">
      <ComponentLoader
        :is-loading="isLoadingOrNotReady"
        :has-data="hasData"
        :show-empty="false"
        skeleton-variant="card"
      >
        <DashboardKPIs />
      </ComponentLoader>

      <div class="middle-section">
        <ComponentLoader
          :is-loading="isLoadingOrNotReady"
          :has-data="hasData"
          :show-empty="false"
          skeleton-variant="card"
        >
          <CategoryBreakdown />
        </ComponentLoader>

        <ComponentLoader
          :is-loading="isLoadingOrNotReady"
          :has-data="hasTransactions"
          :show-empty="false"
          skeleton-variant="card"
        >
          <RecentTransactions />
        </ComponentLoader>
      </div>

      <ComponentLoader
        :is-loading="isLoadingOrNotReady"
        :has-data="hasData"
        :show-empty="false"
        skeleton-variant="card"
      >
        <QuickInsights />
      </ComponentLoader>
    </template>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useRouter } from 'nuxt/app';
import { useTransactions } from '@/composables/useTransactions';
import { useNotifications } from '@/composables/useNotifications';
import { checkAuth } from '~/utils/auth';
import { CONFIGURATION_KEYS } from '~/utils/configurationKeys';
import TDashboardTopCard from '@/components/TDashboardTopCard.vue';
import DashboardKPIs from '@/components/dashboard/DashboardKPIs.vue';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown.vue';
import RecentTransactions from '@/components/dashboard/RecentTransactions.vue';
import QuickInsights from '@/components/dashboard/QuickInsights.vue';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard.vue';
import ComponentLoader from '@/components/ComponentLoader.vue';

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

const isLoadingOrNotReady = computed(() => isLoading.value || !isInitialized.value);
const hasDataLoaded = computed(() => isInitialized.value && !isLoading.value);
const hasTransactions = computed(() => hasDataLoaded.value && transactions.value.length > 0);
const hasData = computed(() => hasDataLoaded.value);

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
  middleware: 'auth'
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.dashboard {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.middle-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-4;

  @media (max-width: $breakpoint-md) {
    grid-template-columns: 1fr;
  }
}
</style>
