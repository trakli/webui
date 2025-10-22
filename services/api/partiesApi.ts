import type {
  Party,
  PartyCreatePayload,
  PartyUpdatePayload,
  PartiesResponse,
  ApiResponse
} from '~/types/party';

/**
 * Parties API Service
 * Handles all HTTP requests to the parties endpoints
 */
const partiesApi = {
  /**
   * Fetch all parties
   * GET /parties
   */
  async fetchAll(limit = 20, syncedSince?: string): Promise<PartiesResponse> {
    const api = useApi();
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (syncedSince) {
      params.append('synced_since', syncedSince);
    }

    const queryString = params.toString();
    const url = queryString ? `/parties?${queryString}` : '/parties';

    const response = await api<ApiResponse<PartiesResponse>>(url);

    if (response?.data) {
      return response.data;
    } else if (response?.last_sync) {
      // Direct response format without nested data
      return response as PartiesResponse;
    }

    return {
      last_sync: new Date().toISOString(),
      data: []
    };
  },

  /**
   * Create a new party
   * POST /parties
   */
  async create(data: PartyCreatePayload): Promise<Party | null> {
    const api = useApi();

    const payload = {
      ...data,
      ...(data.icon && {
        icon: typeof data.icon === 'string' ? data.icon : data.icon?.path || '',
        icon_type: 'image'
      })
    };

    try {
      const response = await api<ApiResponse<Party>>('/parties', {
        method: 'POST',
        body: payload
      });
      return response?.data || null;
    } catch (error) {
      console.error('Error creating party:', error);
      throw error;
    }
  },

  /**
   * Update an existing party
   * PUT /parties/{id}
   */
  async update(id: number, data: PartyUpdatePayload): Promise<Party | null> {
    const api = useApi();

    const payload = {
      ...data,
      ...(data.icon && {
        icon: typeof data.icon === 'string' ? data.icon : data.icon?.path || '',
        icon_type: 'image'
      })
    };

    try {
      const response = await api<ApiResponse<Party>>(`/parties/${id}`, {
        method: 'PUT',
        body: payload
      });
      return response?.data || null;
    } catch (error) {
      console.error('Error updating party:', error);
      throw error;
    }
  },

  /**
   * Delete a party
   * DELETE /parties/{id}
   */
  async delete(id: number): Promise<boolean> {
    const api = useApi();
    try {
      await api(`/parties/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Error deleting party:', error);
      throw error;
    }
  }
};

export default partiesApi;
export { partiesApi };
