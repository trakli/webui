import { CONFIGURATION_KEYS } from '~/utils/configurationKeys';

// Track if we've done the initial config check this session
let initialCheckDone = false;

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const { isAuthenticated } = useAuth();
  const sharedData = useSharedData();

  if (!isAuthenticated.value) {
    initialCheckDone = false;
    return navigateTo('/login');
  }

  try {
    // Only force reload on first navigation after login or if cache is empty
    const forceReload = !initialCheckDone || !sharedData.configurationsMap.value;
    const configurations = await sharedData.loadConfigurations(forceReload);
    initialCheckDone = true;

    const isOnboardingComplete = !!configurations?.[CONFIGURATION_KEYS.ONBOARDING_COMPLETE];

    if (!isOnboardingComplete) {
      if (to.path !== '/onboarding') {
        return navigateTo('/onboarding');
      }
      return;
    }

    if (isOnboardingComplete && to.path === '/onboarding') {
      return navigateTo('/dashboard');
    }
  } catch (error) {
    console.error('Failed to load configurations in auth middleware:', error);
    // On error, allow navigation but skip onboarding check
    // This prevents the app from breaking if the API is temporarily unavailable
    initialCheckDone = true;
  }
});

// Export reset function for use during logout
export const resetAuthMiddlewareState = () => {
  initialCheckDone = false;
};
