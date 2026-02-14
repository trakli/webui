import type {
  Wallet,
  WalletCreatePayload,
  WalletUpdatePayload,
  WalletsResponse,
  ApiResponse
} from '~/types/wallet';
import { buildIconPayload, extractResponseData } from './apiHelpers';

function createApiBusinessError(message: string, errors: string[] = []): Error {
  const err = new Error(message) as Error & { _data?: { message: string; errors: string[] } };
  err._data = { message, errors };
  return err;
}

function extractWalletMutationResult(
  response: ApiResponse<Wallet> | Wallet | null | undefined,
  fallbackMessage: string
): Wallet {
  if (!response) {
    throw createApiBusinessError(fallbackMessage);
  }

  if (
    typeof response === 'object' &&
    'id' in response &&
    typeof (response as Wallet).id === 'number'
  ) {
    return response as Wallet;
  }

  const apiResponse = response as ApiResponse<Wallet>;

  if (apiResponse.success === false) {
    throw createApiBusinessError(apiResponse.message || fallbackMessage, apiResponse.errors || []);
  }

  if (apiResponse.data) {
    return apiResponse.data;
  }

  throw createApiBusinessError(apiResponse.message || fallbackMessage, apiResponse.errors || []);
}

/**
 * Wallets API Service
 * Handles all HTTP requests to the wallets endpoints
 */
const walletsApi = {
  /**
   * Fetch all wallets
   * GET /wallets
   */
  async fetchAll(limit = 20, syncedSince?: string): Promise<WalletsResponse> {
    const api = useApi();
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (syncedSince) {
      params.append('synced_since', syncedSince);
    }

    const queryString = params.toString();
    const url = queryString ? `/wallets?${queryString}` : '/wallets';

    const response = await api<ApiResponse<WalletsResponse>>(url);

    return extractResponseData(response, {
      last_sync: new Date().toISOString(),
      data: []
    });
  },

  /**
   * Create a new wallet
   * POST /wallets
   */
  async create(data: WalletCreatePayload): Promise<Wallet | null> {
    const api = useApi();

    const payload = {
      ...data,
      ...buildIconPayload(data.icon),
      balance: data.balance || 0
    };

    try {
      const response = await api<ApiResponse<Wallet>>('/wallets', {
        method: 'POST',
        body: payload
      });
      return extractWalletMutationResult(response, 'Failed to create wallet');
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  },

  /**
   * Update an existing wallet
   * PUT /wallets/{id}
   */
  async update(id: number, data: WalletUpdatePayload): Promise<Wallet | null> {
    const api = useApi();

    const payload = {
      ...data,
      ...buildIconPayload(data.icon)
    };

    try {
      const response = await api<ApiResponse<Wallet>>(`/wallets/${id}`, {
        method: 'PUT',
        body: payload
      });
      return extractWalletMutationResult(response, 'Failed to update wallet');
    } catch (error) {
      console.error('Error updating wallet:', error);
      throw error;
    }
  },

  /**
   * Delete a wallet
   * DELETE /wallets/{id}
   */
  async delete(id: number): Promise<boolean> {
    const api = useApi();
    try {
      await api(`/wallets/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Error deleting wallet:', error);
      throw error;
    }
  }
};

export default walletsApi;
export { walletsApi };
