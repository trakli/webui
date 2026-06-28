import { ref, readonly } from 'vue';
import type { Integration } from '~/types/integration';
import integrationsApi from '~/services/api/integrationsApi';

// Module-level shared state (mirrors useSharedData's pattern).
const integrations = ref<Integration[]>([]);
const loading = ref(false);
const loaded = ref(false);

export const useIntegrations = () => {
  const load = async (force = false): Promise<Integration[]> => {
    // Never call the authenticated endpoint without a token: a 401 here would
    // trip the global handler and log the user out over a non-critical fetch.
    const { token } = useAuth();
    if (!token.value) return integrations.value;

    if (loading.value) return integrations.value;
    if (loaded.value && !force) return integrations.value;

    loading.value = true;
    try {
      integrations.value = await integrationsApi.fetchAll();
      loaded.value = true;
    } catch (error) {
      console.error('Error loading integrations:', error);
      integrations.value = [];
    } finally {
      loading.value = false;
    }

    return integrations.value;
  };

  const clear = () => {
    integrations.value = [];
    loaded.value = false;
  };

  return {
    integrations: readonly(integrations),
    loading: readonly(loading),
    loaded: readonly(loaded),
    load,
    clear
  };
};
