import { CONFIGURATION_KEYS } from '~/utils/configurationKeys';

/**
 * Where an authenticated, onboarded user should land. The dashboard is the
 * default; users can opt into the chat-first home (the centered chat at /home)
 * in settings.
 */
export async function resolveLandingPath(): Promise<string> {
  try {
    const sharedData = useSharedData();
    const configs = await sharedData.loadConfigurations();
    return configs?.[CONFIGURATION_KEYS.LANDING_MODE] === 'chat' ? '/home' : '/dashboard';
  } catch {
    return '/dashboard';
  }
}
