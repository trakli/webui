export type StatsSection =
  | 'overview'
  | 'activity'
  | 'comparisons'
  | 'categories'
  | 'parties'
  | 'cashflow';

export interface StatsParams {
  preset?: 'all_time' | 'current_week' | 'current_month' | 'last_3_months';
  start_date?: string;
  end_date?: string;
  wallet_ids?: string;
  section?: StatsSection;
}

export interface StatsOverview {
  total_balance: number;
  net_worth: number;
  total_income: number;
  total_expenses: number;
  net_cash_flow: number;
  avg_monthly_income: number;
  avg_monthly_expenses: number;
  savings_rate: number;
}

export interface CategoryData {
  id: number | string;
  name: string;
  amount: number;
  percentage: number;
  transaction_count?: number;
}

export interface PartyData {
  id: number | string;
  name: string;
  amount: number;
  percentage: number;
  transaction_count: number;
}

export interface MonthlyCashFlow {
  period: string;
  income: number;
  expense: number;
  net: number;
}

export interface StatsResponse {
  data: {
    overview: StatsOverview;
    comparisons: {
      previous_period: {
        income_change_percent: number;
        expense_change_percent: number;
        savings_rate_change: number;
      };
    };
    top_categories: {
      income: CategoryData[];
      expenses: CategoryData[];
    };
    largest_transactions: {
      income: { amount: number; description: string; date: string; category: string } | null;
      expense: { amount: number; description: string; date: string; category: string } | null;
    };
    charts: {
      party_spending: PartyData[];
      party_income?: PartyData[];
      category_spending: CategoryData[];
      income_sources: CategoryData[];
      monthly_cash_flow: MonthlyCashFlow[];
      expense_by_wallet?: PartyData[];
    };
  };
}

const statsApi = {
  async fetch(params: StatsParams = {}): Promise<StatsResponse> {
    const api = useApi();
    const queryParams = new URLSearchParams();

    if (params.preset) {
      queryParams.append('preset', params.preset);
    }
    if (params.start_date) {
      queryParams.append('start_date', params.start_date);
    }
    if (params.end_date) {
      queryParams.append('end_date', params.end_date);
    }
    if (params.wallet_ids) {
      queryParams.append('wallet_ids', params.wallet_ids);
    }
    if (params.section) {
      queryParams.append('section', params.section);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/stats?${queryString}` : '/stats';

    const response = await api<StatsResponse>(url);
    return response;
  }
};

export default statsApi;
export { statsApi };
