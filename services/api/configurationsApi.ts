import { extractResponseData } from './apiHelpers';

export interface Configuration {
  id: number;
  key: string;
  value: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface ConfigurationsResponse {
  data: Configuration[];
  last_sync?: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

const configurationsApi = {
  async fetchAll(): Promise<ConfigurationsResponse> {
    const api = useApi();
    const response = await api<ApiResponse<ConfigurationsResponse>>('/configurations');
    return extractResponseData(response, {
      data: []
    });
  },

  async get(key: string): Promise<Configuration | null> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<Configuration>>(`/configurations/${key}`);
      return response?.data || null;
    } catch (error) {
      console.error(`Error fetching configuration ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: string): Promise<Configuration | null> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<Configuration>>('/configurations', {
        method: 'POST',
        body: { key, value }
      });
      return response?.data || null;
    } catch (error) {
      console.error(`Error setting configuration ${key}:`, error);
      throw error;
    }
  },

  async update(key: string, value: string): Promise<Configuration | null> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<Configuration>>(`/configurations/${key}`, {
        method: 'PUT',
        body: { value }
      });
      return response?.data || null;
    } catch (error) {
      console.error(`Error updating configuration ${key}:`, error);
      throw error;
    }
  },

  async delete(key: string): Promise<boolean> {
    const api = useApi();
    try {
      await api(`/configurations/${key}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error(`Error deleting configuration ${key}:`, error);
      throw error;
    }
  }
};

export default configurationsApi;
export { configurationsApi };
