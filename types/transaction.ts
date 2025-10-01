// Transaction API Response Interface (from GET /transactions)
export interface ApiTransaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  datetime: string; // ISO 8601 format
  group_id: number; // Primary group/category ID
  categories: number[]; // Array of category IDs
  is_recurring: boolean;
  user_id: number;
  transfer_id: number;
  wallet_client_generated_id: string; // UUID
  party_client_generated_id: string; // UUID
  files?: TransactionFile[];
  recurring_rules?: RecurringRules;
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
  party: string; // Display name
  partyId?: string; // UUID for API calls
  amount: string; // Formatted with currency e.g., "5000 XAF"
  category: string; // Display name(s) - single or comma-separated
  categoryIds?: number[]; // IDs for API calls
  // Selected group for transaction (maps to API group_id)
  groupId?: number;
  wallet?: string; // Display name
  walletId?: string; // UUID for API calls
  description?: string;
  isRecurring?: boolean;
  files?: TransactionFile[];
  // Base64 files prepared on the client for upload after create/update
  filesToUpload?: string[];
}

// Transaction Create/Update Payload (for POST/PUT)
export interface TransactionCreatePayload {
  client_id?: string; // Concatenated UUID pair (optional)
  amount: number;
  type: 'income' | 'expense';
  description: string;
  datetime: string; // ISO 8601 format
  created_at?: string; // ISO 8601 format
  party_id: number; // Numeric ID (required)
  wallet_id: number; // Numeric ID (required)
  group_id: number; // Numeric ID (required) - The primary grouping/category
  is_recurring?: boolean;
  recurrence_period?: string;
  recurrence_interval?: number;
  recurrence_ends_at?: string; // ISO 8601 format
  categories?: number[]; // Additional category IDs (optional array)
  files?: string[]; // File paths/URLs for attachments
}

export interface TransactionUpdatePayload extends Partial<TransactionCreatePayload> {
  // All fields optional for update
}

// Transactions List API Response
export interface TransactionsResponse {
  last_sync: string;
  data: ApiTransaction[];
}

// Generic API Response wrapper
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  last_sync?: string;
  message?: string;
  errors?: string[];
  status?: number;
}

// Query parameters for GET /transactions
export interface TransactionQueryParams {
  type?: 'income' | 'expense';
  limit?: number;
  synced_since?: string;
  no_client_id?: boolean;
}
