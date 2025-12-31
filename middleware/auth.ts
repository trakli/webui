import { CONFIGURATION_KEYS } from '~/utils/configurationKeys';

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated.value) {
    return navigateTo('/login');
  }

  // Only handle redirecting FROM onboarding if already complete
  // Never redirect TO onboarding from here - let pages handle that after data loads
  if (to.path === '/onboarding') {
    const { isComplete, setComplete } = useOnboardingStatus();

    // Fast path: cookie says complete
    if (isComplete.value) {
      const returnTo = to.query.returnTo as string;
      return navigateTo(returnTo || '/dashboard');
    }

    // Check API to confirm
    try {
      const sharedData = useSharedData();
      const configurations = await sharedData.loadConfigurations();
      const isOnboardingComplete = !!configurations?.[CONFIGURATION_KEYS.ONBOARDING_COMPLETE];

      if (isOnboardingComplete) {
        setComplete();
        const returnTo = to.query.returnTo as string;
        return navigateTo(returnTo || '/dashboard');
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    }
  }
});

// Export reset function for use during logout (kept for API compatibility)
export const resetAuthMiddlewareState = () => {
  // No-op - state is now handled by useOnboardingStatus
};
