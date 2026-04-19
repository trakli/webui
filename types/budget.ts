export type BudgetPeriodType = 'weekly' | 'monthly' | 'yearly' | 'custom';

export type BudgetTargetType = 'category' | 'group' | 'wallet';

export type BudgetStatus = 'on_track' | 'near_limit' | 'over_budget' | 'forecast_breach';

export interface BudgetTarget {
  type: BudgetTargetType;
  id: number;
  client_generated_id?: string | null;
  name?: string;
}

export interface BudgetProgress {
  period_start: string;
  period_end: string;
  limit: number;
  gross_spent: number;
  refunds: number;
  net_spent: number;
  rollover_in: number;
  effective_limit: number;
  remaining: number;
  percent_used: number;
  projected_spend: number;
  status: BudgetStatus;
  is_threshold_crossed: boolean;
  is_forecast_breach: boolean;
}

export interface Budget {
  id: number;
  owner_id: number;
  owner_type: string;
  name: string;
  slug: string;
  description: string | null;
  amount: number | string;
  currency: string;
  period_type: BudgetPeriodType;
  start_date: string;
  end_date: string | null;
  rollover_enabled: boolean;
  threshold_percent: number;
  forecast_alerts_enabled: boolean;
  is_active: boolean;
  targets: BudgetTarget[];
  progress?: BudgetProgress;
  last_synced_at?: string | null;
  client_generated_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetCreatePayload {
  name: string;
  description?: string;
  amount: number;
  currency: string;
  period_type: BudgetPeriodType;
  start_date: string;
  end_date?: string | null;
  rollover_enabled?: boolean;
  threshold_percent?: number;
  forecast_alerts_enabled?: boolean;
  is_active?: boolean;
  targets?: Array<{ type: BudgetTargetType; id: number }>;
  owner?: { type: 'user'; id: number };
  client_id?: string;
}

export type BudgetUpdatePayload = Partial<BudgetCreatePayload>;

export interface BudgetsResponse {
  data: Budget[];
}

export interface BudgetApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  status?: number;
}
