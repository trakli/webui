import type {
  Budget,
  BudgetCreatePayload,
  BudgetUpdatePayload,
  BudgetsResponse,
  BudgetProgress,
  BudgetApiResponse
} from '~/types/budget';
import { extractResponseData } from './apiHelpers';

function createApiBusinessError(message: string, errors: string[] = []): Error {
  const err = new Error(message) as Error & { _data?: { message: string; errors: string[] } };
  err._data = { message, errors };
  return err;
}

function extractBudgetResult(
  response: BudgetApiResponse<Budget> | Budget | null | undefined,
  fallbackMessage: string
): Budget {
  if (!response) {
    throw createApiBusinessError(fallbackMessage);
  }

  if (
    typeof response === 'object' &&
    'id' in response &&
    typeof (response as Budget).id === 'number'
  ) {
    return response as Budget;
  }

  const apiResponse = response as BudgetApiResponse<Budget>;
  if (apiResponse.success === false) {
    throw createApiBusinessError(apiResponse.message || fallbackMessage, apiResponse.errors || []);
  }
  if (apiResponse.data) return apiResponse.data;
  throw createApiBusinessError(apiResponse.message || fallbackMessage, apiResponse.errors || []);
}

const budgetsApi = {
  async fetchAll(): Promise<BudgetsResponse> {
    const api = useApi();
    const response = await api<BudgetApiResponse<BudgetsResponse>>('/budgets');
    return extractResponseData(response, { data: [] });
  },

  async fetchById(id: number): Promise<Budget | null> {
    const api = useApi();
    const response = await api<BudgetApiResponse<Budget>>(`/budgets/${id}`);
    return response?.data ?? null;
  },

  async fetchProgress(id: number): Promise<BudgetProgress | null> {
    const api = useApi();
    const response = await api<BudgetApiResponse<BudgetProgress>>(`/budgets/${id}/progress`);
    return response?.data ?? null;
  },

  async fetchTransactions(
    id: number
  ): Promise<{ period_start: string; period_end: string; data: any[] } | null> {
    const api = useApi();
    const response = await api<
      BudgetApiResponse<{ period_start: string; period_end: string; data: any[] }>
    >(`/budgets/${id}/transactions`);
    return response?.data ?? null;
  },

  async create(data: BudgetCreatePayload): Promise<Budget> {
    const api = useApi();
    const response = await api<BudgetApiResponse<Budget>>('/budgets', {
      method: 'POST',
      body: data
    });
    return extractBudgetResult(response, 'Failed to create budget');
  },

  async update(id: number, data: BudgetUpdatePayload): Promise<Budget> {
    const api = useApi();
    const response = await api<BudgetApiResponse<Budget>>(`/budgets/${id}`, {
      method: 'PUT',
      body: data
    });
    return extractBudgetResult(response, 'Failed to update budget');
  },

  async delete(id: number): Promise<boolean> {
    const api = useApi();
    await api(`/budgets/${id}`, { method: 'DELETE' });
    return true;
  },

  async closePeriod(id: number): Promise<Budget | null> {
    const api = useApi();
    const response = await api<BudgetApiResponse<Budget>>(`/budgets/${id}/close-period`, {
      method: 'POST'
    });
    return response?.data ?? null;
  }
};

export default budgetsApi;
export { budgetsApi };
