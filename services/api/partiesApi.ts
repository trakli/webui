import type {
  Party,
  PartyCreatePayload,
  PartyUpdatePayload,
  PartiesResponse,
  ApiResponse
} from '~/types/party';
import { buildIconPayload, extractResponseData } from './apiHelpers';

function createApiBusinessError(message: string, errors: string[] = []): Error {
  const err = new Error(message) as Error & { _data?: { message: string; errors: string[] } };
  err._data = { message, errors };
  return err;
}

function extractPartyMutationResult(
  response: ApiResponse<Party> | Party | null | undefined,
  fallbackMessage: string
): Party {
  if (!response) {
    throw createApiBusinessError(fallbackMessage);
  }

  if (
    typeof response === 'object' &&
    'id' in response &&
    typeof (response as Party).id === 'number'
  ) {
    return response as Party;
  }

  const apiResponse = response as ApiResponse<Party>;

  if (apiResponse.success === false) {
    throw createApiBusinessError(apiResponse.message || fallbackMessage, apiResponse.errors || []);
  }

  if (apiResponse.data) {
    return apiResponse.data;
  }

  throw createApiBusinessError(apiResponse.message || fallbackMessage, apiResponse.errors || []);
}

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

    return extractResponseData(response, {
      last_sync: new Date().toISOString(),
      data: []
    });
  },

  /**
   * Create a new party
   * POST /parties
   */
  async create(data: PartyCreatePayload): Promise<Party | null> {
    const api = useApi();

    const payload = {
      ...data,
      ...buildIconPayload(data.icon)
    };

    try {
      const response = await api<ApiResponse<Party>>('/parties', {
        method: 'POST',
        body: payload
      });
      return extractPartyMutationResult(response, 'Failed to create party');
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
      ...buildIconPayload(data.icon)
    };

    try {
      const response = await api<ApiResponse<Party>>(`/parties/${id}`, {
        method: 'PUT',
        body: payload
      });
      return extractPartyMutationResult(response, 'Failed to update party');
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
