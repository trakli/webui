import { CONFIGURATION_KEYS } from '~/utils/configurationKeys';

/**
 * Where an authenticated, onboarded user should land. Chat-first (the centered
 * chat at /home) is the default; users can switch to the dashboard in settings.
 */
export async function resolveLandingPath(): Promise<string> {
  try {
    const sharedData = useSharedData();
    const configs = await sharedData.loadConfigurations();
    return configs?.[CONFIGURATION_KEYS.LANDING_MODE] === 'dashboard' ? '/dashboard' : '/home';
  } catch {
    return '/home';
  }
}
