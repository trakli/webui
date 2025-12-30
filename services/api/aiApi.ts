export type FormatType = 'scalar' | 'pair' | 'record' | 'list' | 'pair_list' | 'table' | 'raw';

export interface AskResponse {
  success: boolean;
  data?: {
    answer: string;
    format_type: FormatType | null;
    results: Record<string, unknown>[];
  };
  message?: string;
}

export interface HealthResponse {
  available: boolean;
}

const aiApi = {
  async ask(message: string): Promise<AskResponse> {
    const api = useApi();
    const response = await api<AskResponse>('/ai/chat', {
      method: 'POST',
      body: { message }
    });
    return response;
  },

  async checkHealth(): Promise<HealthResponse> {
    const api = useApi();
    const response = await api<HealthResponse>('/ai/health');
    return response;
  }
};

export default aiApi;
export { aiApi };
