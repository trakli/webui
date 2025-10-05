import type {
  ApiTransaction,
  TransactionCreatePayload,
  TransactionUpdatePayload,
  TransactionsResponse,
  ApiResponse,
  TransactionQueryParams
} from '~/types/transaction';

/**
 * Transaction API Service
 * Handles all HTTP requests to the transactions endpoints
 */
const transactionApi = {
  /**
   * Fetch all transactions
   * GET /transactions
   */
  async fetchAll(params?: TransactionQueryParams): Promise<TransactionsResponse> {
    const api = useApi();
    const queryParams = new URLSearchParams();

    if (params?.type) {
      queryParams.append('type', params.type);
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.synced_since) {
      queryParams.append('synced_since', params.synced_since);
    }
    if (params?.no_client_id) {
      queryParams.append('no_client_id', params.no_client_id.toString());
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/transactions?${queryString}` : '/transactions';

    const response = await api<ApiResponse<TransactionsResponse>>(url);

    // Handle different response formats
    if (response?.data) {
      return response.data;
    } else if (response?.last_sync) {
      // Direct response format without nested data
      return response as TransactionsResponse;
    }

    // Fallback
    return {
      last_sync: new Date().toISOString(),
      data: []
    };
  },

  /**
   * Add multiple files (base64 strings) to a transaction
   * POST /transactions/{id}/files
   * Body: { files: string[] }
   * Returns updated transaction
   */
  async addFilesBulk(id: number, files: string[]): Promise<ApiTransaction | null> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<ApiTransaction>>(`/transactions/${id}/files`, {
        method: 'POST',
        body: { files }
      });
      return response?.data || null;
    } catch (error) {
      console.error('Error adding files to transaction:', error);
      throw error;
    }
  },

  /**
   * Fetch a single transaction by ID
   * GET /transactions/{id}
   */
  async fetchById(id: number): Promise<ApiTransaction | null> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<ApiTransaction>>(`/transactions/${id}`);
      return response?.data || null;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  },

  /**
   * Create a new transaction
   * POST /transactions
   */
  async create(payload: TransactionCreatePayload): Promise<ApiTransaction | null> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<ApiTransaction>>('/transactions', {
        method: 'POST',
        body: payload
      });
      return response?.data || null;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  /**
   * Update an existing transaction
   * PUT /transactions/{id}
   */
  async update(id: number, payload: TransactionUpdatePayload): Promise<ApiTransaction | null> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<ApiTransaction>>(`/transactions/${id}`, {
        method: 'PUT',
        body: payload
      });
      return response?.data || null;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  /**
   * Delete a transaction
   * DELETE /transactions/{id}
   */
  async delete(id: number): Promise<boolean> {
    const api = useApi();
    try {
      await api(`/transactions/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  /**
   * Add file to a transaction
   * POST /transactions/{id}/files
   */
  async addFile(
    id: number,
    file: File
  ): Promise<{ success: boolean; data?: unknown; message?: string }> {
    const api = useApi();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api(`/transactions/${id}/files`, {
        method: 'POST',
        body: formData
      });
      return response;
    } catch (error) {
      console.error('Error adding file to transaction:', error);
      throw error;
    }
  },

  /**
   * Remove file from a transaction
   * DELETE /transactions/{id}/files/{file_id}
   */
  async removeFile(transactionId: number, fileId: number): Promise<boolean> {
    const api = useApi();
    try {
      await api(`/transactions/${transactionId}/files/${fileId}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Error removing file from transaction:', error);
      throw error;
    }
  }
};

export default transactionApi;
export { transactionApi };
