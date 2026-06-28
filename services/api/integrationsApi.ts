import type { Integration } from '~/types/integration';
import { extractResponseData } from './apiHelpers';

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

/**
 * Integrations API Service
 * Lists installed integrations and the UI each one describes.
 */
const integrationsApi = {
  /**
   * Fetch all installed integrations.
   * GET /integrations
   */
  async fetchAll(): Promise<Integration[]> {
    const api = useApi();
    const response = await api<ApiResponse<Integration[]>>('/integrations');
    return extractResponseData<Integration[]>(response, []);
  }
};

export default integrationsApi;
export { integrationsApi };
