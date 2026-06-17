export type FormatType = 'scalar' | 'pair' | 'record' | 'list' | 'pair_list' | 'table' | 'raw';
export type ChatRole = 'user' | 'assistant' | 'system';
export type ChatStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type BlockType =
  | 'markdown'
  | 'table'
  | 'kpi'
  | 'chart'
  | 'comparison'
  | 'list'
  | 'quick_actions'
  | 'proposed_action'
  | 'import_review'
  | 'canvas';

/**
 * One rendered widget in an assistant message. The shape is authored by the
 * backend BlockBuilder; the renderer dispatches on `type` and each component
 * adapts to its payload. Extra keys per type are intentionally loose.
 */
export interface ChatBlock {
  type: BlockType | string;
  [key: string]: unknown;
}

export interface ProposedActionBlock extends ChatBlock {
  type: 'proposed_action';
  id: number;
  action_type: string;
  summary: string;
  risk: 'low' | 'medium' | 'high';
  status: string;
  confirm_url: string;
  reject_url: string;
  payload?: Record<string, unknown>;
  fields?: { label: string; value: string }[];
}

export interface ChatMessageResult {
  source?: 'smartql' | 'prism' | 'prism_fallback' | 'agent';
  blocks?: ChatBlock[];
  tool_calls?: { name: string; arguments: Record<string, unknown> }[];
  usage?: Record<string, number>;
  // Legacy SmartQL fields, still emitted by the data route.
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
  // Hold the agent until attachments finish uploading; the file-upload call
  // releases the turn so the agent sees the file.
  defer_processing?: boolean;
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

  async deleteSession(id: number): Promise<void> {
    const api = useApi();
    await api(`/ai/chats/${id}`, { method: 'DELETE' });
  },

  async confirmAction(
    sessionId: number,
    actionId: number,
    overrides?: Record<string, unknown>
  ): Promise<{ action: Record<string, unknown>; resource: Record<string, unknown> } | null> {
    const api = useApi();
    const response = await api<
      ApiEnvelope<{ action: Record<string, unknown>; resource: Record<string, unknown> }>
    >(`/ai/chats/${sessionId}/actions/${actionId}/confirm`, {
      method: 'POST',
      body: overrides && Object.keys(overrides).length ? { overrides } : {}
    });
    return response?.data || null;
  },

  exportCanvasUrl(sessionId: number, messageId: number, format = 'md'): string {
    return `/ai/chats/${sessionId}/messages/${messageId}/export?format=${format}`;
  },

  async rejectAction(sessionId: number, actionId: number): Promise<void> {
    const api = useApi();
    await api(`/ai/chats/${sessionId}/actions/${actionId}/reject`, { method: 'POST' });
  },

  async uploadFiles(
    sessionId: number,
    messageId: number,
    files: File[],
    documentType?: string | null
  ): Promise<ChatMessage | null> {
    const api = useApi();
    const form = new FormData();
    files.forEach((file) => form.append('files[]', file));
    if (documentType) form.append('document_type', documentType);
    const response = await api<ApiEnvelope<ChatMessage>>(
      `/ai/chats/${sessionId}/messages/${messageId}/files`,
      { method: 'POST', body: form }
    );
    return response?.data || null;
  },

  async checkHealth(): Promise<HealthResponse> {
    const api = useApi();
    return await api<HealthResponse>('/ai/health');
  }
};

export default aiApi;
export { aiApi };
