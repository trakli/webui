import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiApi, type FormatType, type AskResponse } from '@/services/api/aiApi';

const mockApi = vi.fn();
vi.mock('#imports', () => ({
  useApi: () => mockApi,
}));

vi.stubGlobal('useApi', () => mockApi);

describe('aiApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ask', () => {
    it('should send message to /ai/chat endpoint', async () => {
      const mockResponse: AskResponse = {
        success: true,
        data: {
          answer: 'You spent $500 on food last month.',
          format_type: 'scalar',
          results: [{ total: 500 }],
        },
      };
      mockApi.mockResolvedValueOnce(mockResponse);

      const result = await aiApi.ask('How much did I spend on food?');

      expect(mockApi).toHaveBeenCalledWith('/ai/chat', {
        method: 'POST',
        body: { message: 'How much did I spend on food?' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle error responses', async () => {
      const mockResponse: AskResponse = {
        success: false,
        message: 'AI service unavailable',
      };
      mockApi.mockResolvedValueOnce(mockResponse);

      const result = await aiApi.ask('test question');

      expect(result.success).toBe(false);
      expect(result.message).toBe('AI service unavailable');
    });
  });

  describe('checkHealth', () => {
    it('should call /ai/health endpoint', async () => {
      mockApi.mockResolvedValueOnce({ available: true });

      const result = await aiApi.checkHealth();

      expect(mockApi).toHaveBeenCalledWith('/ai/health');
      expect(result.available).toBe(true);
    });

    it('should return unavailable when service is down', async () => {
      mockApi.mockResolvedValueOnce({ available: false });

      const result = await aiApi.checkHealth();

      expect(result.available).toBe(false);
    });
  });
});

describe('FormatType', () => {
  it('should accept valid format types', () => {
    const validTypes: FormatType[] = [
      'scalar',
      'pair',
      'record',
      'list',
      'pair_list',
      'table',
      'raw',
    ];

    validTypes.forEach((type) => {
      const response: AskResponse = {
        success: true,
        data: {
          answer: 'test',
          format_type: type,
          results: [],
        },
      };
      expect(response.data?.format_type).toBe(type);
    });
  });

  it('should allow null format_type', () => {
    const response: AskResponse = {
      success: true,
      data: {
        answer: 'test',
        format_type: null,
        results: [],
      },
    };
    expect(response.data?.format_type).toBeNull();
  });
});
