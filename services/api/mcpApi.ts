import { extractResponseData } from './apiHelpers';

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface McpToken {
  id: number;
  name: string;
  last_used_at: string | null;
  created_at: string;
}

export interface McpTokenCreated {
  id: number;
  name: string;
  token: string;
}

/**
 * MCP API Service
 * Manages the personal access tokens a user issues so an external AI client
 * (Claude Desktop, Cursor) can connect to the MCP server.
 */
const mcpApi = {
  /**
   * List the user's MCP tokens (never includes the raw token).
   * GET /ai/mcp/tokens
   */
  async listTokens(): Promise<McpToken[]> {
    const api = useApi();
    const response = await api<ApiResponse<McpToken[]>>('/ai/mcp/tokens');
    return extractResponseData<McpToken[]>(response, []);
  },

  /**
   * Create a token. The raw token is returned once, here only.
   * POST /ai/mcp/tokens
   */
  async createToken(name: string): Promise<McpTokenCreated> {
    const api = useApi();
    const response = await api<ApiResponse<McpTokenCreated>>('/ai/mcp/tokens', {
      method: 'POST',
      body: { name }
    });
    return extractResponseData<McpTokenCreated>(response, {} as McpTokenCreated);
  },

  /**
   * Revoke a token by id.
   * DELETE /ai/mcp/tokens/{id}
   */
  async revokeToken(id: number): Promise<void> {
    const api = useApi();
    await api(`/ai/mcp/tokens/${id}`, { method: 'DELETE' });
  }
};

export default mcpApi;
export { mcpApi };
