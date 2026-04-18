export type FormatType = 'scalar' | 'pair' | 'record' | 'list' | 'pair_list' | 'table' | 'raw';
export type ChatRole = 'user' | 'assistant' | 'system';
export type ChatStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ChatMessageResult {
  source?: 'smartql' | 'prism' | 'prism_fallback';
  format_type?: FormatType | null;
  rows?: Record<string, unknown>[];
  human_response?: string;
  explanation?: string;
  [key: string]: unknown;
}

export interface ChatMessage {
  id: number;
  user_id: number | null;
  role: ChatRole;
  content: string | null;
  status: ChatStatus | null;
  format_hint: string | null;
  language: string | null;
  result: ChatMessageResult | null;
  error: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: number;
  title: string | null;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface HealthResponse {
  available: boolean;
}

interface SendPayload {
  message: string;
  format_hint?: FormatType;
  title?: string;
}

const aiApi = {
  async listSessions(page = 1): Promise<Paginated<ChatSession>> {
    const api = useApi();
    const response = await api<ApiEnvelope<Paginated<ChatSession>>>(`/ai/chats?page=${page}`);
    return response?.data || { data: [], current_page: 1, last_page: 1, total: 0 };
  },

  async getSession(id: number): Promise<ChatSession | null> {
    const api = useApi();
    const response = await api<ApiEnvelope<ChatSession>>(`/ai/chats/${id}`);
    return response?.data || null;
  },

  async createSession(payload: SendPayload): Promise<ChatSession | null> {
    const api = useApi();
    const response = await api<ApiEnvelope<ChatSession>>('/ai/chats', {
      method: 'POST',
      body: payload
    });
    return response?.data || null;
  },

  async addMessage(
    sessionId: number,
    payload: Omit<SendPayload, 'title'>
  ): Promise<{ user: ChatMessage; assistant: ChatMessage } | null> {
    const api = useApi();
    const response = await api<ApiEnvelope<{ user: ChatMessage; assistant: ChatMessage }>>(
      `/ai/chats/${sessionId}/messages`,
      { method: 'POST', body: payload }
    );
    return response?.data || null;
  },

  async deleteSession(id: number): Promise<boolean> {
    const api = useApi();
    await api(`/ai/chats/${id}`, { method: 'DELETE' });
    return true;
  },

  async checkHealth(): Promise<HealthResponse> {
    const api = useApi();
    return await api<HealthResponse>('/ai/health');
  }
};

export default aiApi;
export { aiApi };
