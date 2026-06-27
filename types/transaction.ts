// Intent tag distinguishing real earnings/spend from loan, debt and investment movement
export type TransactionIntent =
  | 'regular'
  | 'loan_received'
  | 'loan_repayment'
  | 'debt_owed'
  | 'debt_settled'
  | 'investment_buy'
  | 'investment_return'
  | 'gift';

export interface IntentOption {
  value: TransactionIntent;
  label: string; // English text, also used as the i18n key
  side: 'income' | 'expense' | 'both';
}

export const TRANSACTION_INTENT_OPTIONS: IntentOption[] = [
  { value: 'regular', label: 'Regular', side: 'both' },
  { value: 'loan_received', label: 'Loan received', side: 'income' },
  { value: 'loan_repayment', label: 'Loan repayment', side: 'expense' },
  { value: 'debt_owed', label: 'Debt owed', side: 'income' },
  { value: 'debt_settled', label: 'Debt settled', side: 'expense' },
  { value: 'investment_buy', label: 'Investment purchase', side: 'expense' },
  { value: 'investment_return', label: 'Investment return', side: 'income' },
  { value: 'gift', label: 'Gift', side: 'income' }
];

export interface ApiTransaction {
  id: number;
  type: 'income' | 'expense';
  intent?: TransactionIntent;
  amount: number;
  description: string;
  datetime: string;
  group_id: number;
  categories: any[];
  user_id: number;
  transfer_id: number;
  wallet_client_generated_id: string;
  party_client_generated_id: string;
  wallet?: any;
  party?: any;
  files?: TransactionFile[];
  recurring_rules?: RecurringRules;
  is_refund?: boolean;
  refund_of_transaction_id?: number | null;
}

// Transaction File attachment
export interface TransactionFile {
  id: number;
  path: string;
  type: 'image' | string;
  model: string;
  model_id: number;
}

// Recurring transaction rules
export interface RecurringRules {
  id: number;
  transaction_id: number;
  recurrence_period: string;
  recurrence_interval: number;
  recurrence_ends_at: string;
}

// Frontend/UI Transaction format (current mock format)
export interface FrontendTransaction {
  id: string; // Convert from API number to string for UI
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: 'INCOME' | 'EXPENSE'; // Uppercase for UI
  intent?: TransactionIntent;
  party: string; // Display name
  partyId?: number; // Numeric ID
  amount: string; // Formatted with currency e.g., "5000 XAF"
  category: string; // Display name(s) - single or comma-separated
  categoryIds?: number[]; // IDs for API calls
  groupId?: number;
  wallet?: string; // Display name
  walletId?: number; // Numeric ID
  description?: string;
  isRecurring?: boolean;
  recurrencePeriod?: string;
  recurrenceInterval?: number;
  recurrenceEndsAt?: string;
  isTransfer?: boolean; // True if this transaction is part of a transfer
  transferId?: number; // ID of the associated transfer
  files?: TransactionFile[];
  filesToUpload?: File[];
  isRefund?: boolean; // User explicitly flagged this income as refunding an expense
  refundOfTransactionId?: number | null; // Optional link to the refunded expense
}

// Transaction Create/Update Payload (for POST/PUT)
export interface TransactionCreatePayload {
  client_id?: string; // Concatenated UUID pair (optional)
  amount: number;
  type: 'income' | 'expense';
  intent?: TransactionIntent;
  description: string;
  datetime: string; // ISO 8601 format
  created_at?: string; // ISO 8601 format
  party_id?: number;
  wallet_id?: number;
  group_id?: number;
  is_recurring?: boolean;
  recurrence_period?: string;
  recurrence_interval?: number;
  recurrence_ends_at?: string; // ISO 8601 format
  categories?: number[]; // Additional category IDs (optional array)
}

export type TransactionUpdatePayload = Partial<TransactionCreatePayload>;

// Transactions List API Response
export interface TransactionsResponse {
  data: ApiTransaction[];
  current_page: number;
  total: number;
  per_page: number;
  last_page: number;
  totals?: {
    income: number;
    expenses: number;
    net: number;
  };
}

// Generic API Response wrapper
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  status?: number;
}

// Query parameters for GET /transactions
export interface TransactionQueryParams {
  type?: 'income' | 'expense';
  intent?: string; // single intent or comma-separated list
  exclude_transfers?: boolean;
  limit?: number;
  page?: number;
  synced_since?: string;
  no_client_id?: boolean;
  date_from?: string;
  date_to?: string;
  wallet_ids?: number[];
  category_ids?: number[];
  search?: string;
}
