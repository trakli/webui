import type {
  Holding,
  HoldingPayload,
  HoldingOwner,
  HoldingsResponse,
  CoinSearchResult
} from '~/types/holding';
import type { ApiResponse } from '~/types/transaction';

// The package returns a paginated envelope under `data`.
interface Paginated<T> {
  data: T[];
}

const holdingsApi = {
  async fetchAll(): Promise<HoldingsResponse> {
    const api = useApi();
    const response = await api<ApiResponse<Paginated<Holding>>>('/holdings?per_page=200');
    return { data: response?.data?.data ?? [] };
  },

  async create(payload: HoldingPayload, owner: HoldingOwner): Promise<Holding | null> {
    const api = useApi();
    const response = await api<ApiResponse<Holding>>('/holdings', {
      method: 'POST',
      body: { ...payload, ...owner }
    });
    return response?.data ?? null;
  },

  async update(id: number, payload: Partial<HoldingPayload>): Promise<Holding | null> {
    const api = useApi();
    const response = await api<ApiResponse<Holding>>(`/holdings/${id}`, {
      method: 'PUT',
      body: payload
    });
    return response?.data ?? null;
  },

  async delete(id: number): Promise<boolean> {
    const api = useApi();
    await api(`/holdings/${id}`, { method: 'DELETE' });
    return true;
  },

  async refreshPrices(): Promise<boolean> {
    const api = useApi();
    await api('/holdings/reprice', { method: 'POST' });
    return true;
  },

  async search(query: string): Promise<CoinSearchResult[]> {
    const api = useApi();
    const response = await api<ApiResponse<CoinSearchResult[]>>(
      `/asset-prices/search?q=${encodeURIComponent(query)}`
    );
    return response?.data ?? [];
  }
};

export default holdingsApi;
export { holdingsApi };
