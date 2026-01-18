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
    const body: Record<string, any> = { value: payload.value };
    if (typeof payload.type !== 'undefined') {
      body.type = payload.type;
    }

    try {
      const response = await api<ApiResponse<ConfigurationItem>>(
        `/configurations/${encodeURIComponent(key)}`,
        {
          method: 'PUT',
          body
        }
      );
      return response?.data || null;
    } catch (error: any) {
      // If config doesn't exist (404), create it instead
      if (error?.statusCode === 404 || error?.status === 404) {
        return this.create({
          key,
          value: payload.value,
          type: payload.type || 'string'
        });
      }
      throw error;
    }
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
