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
    if (params?.intent) {
      queryParams.append('intent', params.intent);
    }
    if (params?.exclude_transfers) {
      queryParams.append('exclude_transfers', '1');
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.synced_since) {
      queryParams.append('synced_since', params.synced_since);
    }
    if (params?.no_client_id) {
      queryParams.append('no_client_id', params.no_client_id.toString());
    }
    if (params?.date_from) {
      queryParams.append('date_from', params.date_from);
    }
    if (params?.date_to) {
      queryParams.append('date_to', params.date_to);
    }
    if (params?.wallet_ids?.length) {
      params.wallet_ids.forEach((id) => queryParams.append('wallet_ids[]', id.toString()));
    }
    if (params?.category_ids?.length) {
      params.category_ids.forEach((id) => queryParams.append('category_ids[]', id.toString()));
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/transactions?${queryString}` : '/transactions';

    const response = await api<ApiResponse<TransactionsResponse>>(url);

    const defaults: TransactionsResponse = {
      data: [],
      current_page: 1,
      total: 0,
      per_page: params?.limit || 20,
      last_page: 1,
      totals: { income: 0, expenses: 0, net: 0 }
    };

    if (response?.data) {
      return { ...defaults, ...response.data };
    } else if (response && typeof response === 'object' && 'data' in response) {
      return { ...defaults, ...(response as TransactionsResponse) };
    }

    return defaults;
  },

  /**
   * Add multiple files to a transaction as multipart upload.
   * POST /transactions/{id}/files
   * Returns updated transaction.
   */
  async addFilesBulk(id: number, files: File[]): Promise<ApiTransaction | null> {
    const api = useApi();
    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('files[]', file, file.name);
      }
      const response = await api<ApiResponse<ApiTransaction>>(`/transactions/${id}/files`, {
        method: 'POST',
        body: formData
      });
      return response?.data || null;
    } catch (error) {
      console.error('Error adding files to transaction:', error);
      throw error;
    }
  },

  /**
   * Remove a single attachment from a transaction.
   * DELETE /transactions/{id}/files/{fileId}
   * Returns the refreshed transaction.
   */
  async deleteFile(id: number, fileId: number): Promise<ApiTransaction | null> {
    const api = useApi();
    try {
      const response = await api<ApiResponse<ApiTransaction>>(
        `/transactions/${id}/files/${fileId}`,
        { method: 'DELETE' }
      );
      return response?.data || null;
    } catch (error) {
      console.error('Error deleting transaction file:', error);
      throw error;
    }
  },

  /**
   * Fetch a single file's binary content as a Blob via the auth-gated
   * /files/{id} endpoint, so the browser can render previews without
   * losing the bearer token.
   */
  async fetchFileBlob(fileId: number): Promise<Blob> {
    const api = useApi();
    return api<Blob>(`/files/${fileId}`, { responseType: 'blob' });
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
   * Mark an income transaction as a refund, optionally linking it to the
   * expense it reversed. POST /transactions/{id}/refund
   */
  async markRefund(id: number, originalTransactionId?: number | null): Promise<boolean> {
    const api = useApi();
    try {
      await api(`/transactions/${id}/refund`, {
        method: 'POST',
        body: originalTransactionId ? { original_transaction_id: originalTransactionId } : {}
      });
      return true;
    } catch (error) {
      console.error('Error marking transaction as refund:', error);
      throw error;
    }
  },

  /**
   * Remove the refund flag from a transaction.
   * DELETE /transactions/{id}/refund
   */
  async unmarkRefund(id: number): Promise<boolean> {
    const api = useApi();
    try {
      await api(`/transactions/${id}/refund`, { method: 'DELETE' });
      return true;
    } catch (error) {
      console.error('Error unmarking refund:', error);
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
