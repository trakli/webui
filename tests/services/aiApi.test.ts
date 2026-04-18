import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiApi, type ChatSession, type FormatType } from '@/services/api/aiApi';

const mockApi = vi.fn();
vi.mock('#imports', () => ({
  useApi: () => mockApi
}));
vi.stubGlobal('useApi', () => mockApi);

const envelope = <T>(data: T) => ({ success: true, message: 'ok', data });

describe('aiApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists sessions with pagination', async () => {
    const page = { data: [], current_page: 1, last_page: 1, total: 0 };
    mockApi.mockResolvedValueOnce(envelope(page));

    const result = await aiApi.listSessions();

    expect(mockApi).toHaveBeenCalledWith('/ai/chats?page=1');
    expect(result).toEqual(page);
  });

  it('gets a single session', async () => {
    const session: ChatSession = {
      id: 1,
      title: 'test',
      created_at: '2026-04-18T00:00:00Z',
      updated_at: '2026-04-18T00:00:00Z',
      messages: []
    };
    mockApi.mockResolvedValueOnce(envelope(session));

    const result = await aiApi.getSession(1);

    expect(mockApi).toHaveBeenCalledWith('/ai/chats/1');
    expect(result).toEqual(session);
  });

  it('creates a session with a first message', async () => {
    const session: ChatSession = {
      id: 1,
      title: null,
      created_at: '',
      updated_at: '',
      messages: []
    };
    mockApi.mockResolvedValueOnce(envelope(session));

    const result = await aiApi.createSession({ message: 'hi' });

    expect(mockApi).toHaveBeenCalledWith('/ai/chats', {
      method: 'POST',
      body: { message: 'hi' }
    });
    expect(result).toEqual(session);
  });

  it('adds a follow-up message to a session', async () => {
    const pair = {
      user: { id: 2, role: 'user', content: 'follow', status: null } as never,
      assistant: { id: 3, role: 'assistant', status: 'pending', content: null } as never
    };
    mockApi.mockResolvedValueOnce(envelope(pair));

    const result = await aiApi.addMessage(1, { message: 'follow' });

    expect(mockApi).toHaveBeenCalledWith('/ai/chats/1/messages', {
      method: 'POST',
      body: { message: 'follow' }
    });
    expect(result).toEqual(pair);
  });

  it('deletes a session', async () => {
    mockApi.mockResolvedValueOnce(undefined);

    const result = await aiApi.deleteSession(1);

    expect(mockApi).toHaveBeenCalledWith('/ai/chats/1', { method: 'DELETE' });
    expect(result).toBe(true);
  });

  it('checks health', async () => {
    mockApi.mockResolvedValueOnce({ available: true });

    const result = await aiApi.checkHealth();

    expect(mockApi).toHaveBeenCalledWith('/ai/health');
    expect(result.available).toBe(true);
  });

  it('accepts all format type values', () => {
    const validTypes: FormatType[] = [
      'scalar',
      'pair',
      'record',
      'list',
      'pair_list',
      'table',
      'raw'
    ];
    validTypes.forEach((t) => expect(typeof t).toBe('string'));
  });
});
