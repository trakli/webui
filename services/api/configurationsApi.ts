import type {
  ConfigurationItem,
  ConfigurationsResponse,
  ConfigurationPayload,
  ApiResponse
} from '~/types/configuration';
import { extractResponseData } from './apiHelpers';

const configurationsApi = {
  async fetchAll(): Promise<ConfigurationsResponse> {
    const api = useApi();
    const response = await api<ApiResponse<ConfigurationsResponse>>('/configurations');
    return extractResponseData(response, {
      last_sync: new Date().toISOString(),
      data: []
    });
  },

  async create(payload: {
    key: string;
    value: any;
    type?: string;
  }): Promise<ConfigurationItem | null> {
    const api = useApi();
    const response = await api<ApiResponse<ConfigurationItem>>('/configurations', {
      method: 'POST',
      body: payload
    });
    return response?.data || null;
  },

  async update(key: string, payload: ConfigurationPayload): Promise<ConfigurationItem | null> {
    const api = useApi();
    const response = await api<ApiResponse<ConfigurationItem>>(
      `/configurations/${encodeURIComponent(key)}`,
      {
        method: 'PUT',
        body: payload
      }
    );
    return response?.data || null;
  },

  async fetchByKey(key: string): Promise<ConfigurationItem | null> {
    const api = useApi();
    const response = await api<ApiResponse<ConfigurationItem>>(
      `/configurations/${encodeURIComponent(key)}`
    );
    return response?.data || null;
  },

  async delete(key: string): Promise<boolean> {
    const api = useApi();
    await api(`/configurations/${encodeURIComponent(key)}`, {
      method: 'DELETE'
    });
    return true;
  }
};

export default configurationsApi;
export { configurationsApi };
