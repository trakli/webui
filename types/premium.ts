export interface BillingStatus {
  paid_access: boolean;
  has_billing_account: boolean;
  status: string;
  paid_through: string | null;
  limits: { wallets: number | null; categories: number | null; bank_connections: number | null };
  ai_usage: {
    used: number;
    allowance: number;
    remaining: number;
    period_start: string;
    period_end: string;
  };
}
export interface BankConnection {
  id: number;
  institution_name: string | null;
  status: string;
  is_active: boolean;
  disconnected_at: string | null;
  last_synced_at: string | null;
}
export interface BankAccount {
  account_id: string;
  name: string;
  mask: string | null;
  balances: { iso_currency_code: string | null };
}
export interface BankMapping {
  plaid_account_id: string;
  wallet_id: number;
}
export interface LinkSession {
  id: number;
  url: string;
  status: string;
  expires_at: string;
}
export interface PremiumResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CloudPlans {
  trial_days: number;
  regions: Record<
    string,
    {
      name: string;
      currency: string;
      prices: Record<string, { price: number; price_formatted: string }>;
    }
  >;
}

export interface PremiumPage<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
