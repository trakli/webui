import { useApi } from '~/composables/useApi';

interface Transfer {
  id: number;
  amount: number;
  from_wallet_id: number;
  to_wallet_id: number;
  exchange_rate: number;
  source_wallet: {
    id: number;
    name: string;
    currency: string;
  };
  destination_wallet: {
    id: number;
    name: string;
    currency: string;
  };
  created_at: string;
}

interface TransferCreatePayload {
  amount: number;
  from_wallet_id: number;
  to_wallet_id: number;
  exchange_rate?: number;
  created_at?: string;
  client_id?: string;
}

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

const transfersApi = {
  async create(data: TransferCreatePayload): Promise<Transfer | null> {
    const api = useApi();

    try {
      const response = await api<ApiResponse<Transfer>>('/transfers', {
        method: 'POST',
        body: data
      });
      return response?.data || null;
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw error;
    }
  },

  async fetchAll(limit = 20): Promise<Transfer[]> {
    const api = useApi();

    try {
      const response = await api<ApiResponse<{ data: Transfer[] }>>(`/transfers?limit=${limit}`);
      return response?.data?.data || [];
    } catch (error) {
      console.error('Error fetching transfers:', error);
      throw error;
    }
  }
};

export default transfersApi;
export { transfersApi };
export type { Transfer, TransferCreatePayload };
