export interface TransactionSuggestion {
  amount: number | null;
  currency: string | null;
  type: 'income' | 'expense' | null;
  party: string | null;
  wallet: string | null;
  category: string | null;
  description: string | null;
  date: string | null;
  confidence: number;
  document_type: string | null;
}

export interface DuplicateMatch {
  transaction_id: number;
  match_type: 'exact' | 'near' | 'similar';
  confidence: number;
  transaction_amount: number | null;
  transaction_description: string | null;
  transaction_date: string | null;
  transaction_type: string | null;
}

export interface SuggestionWithDuplicate extends TransactionSuggestion {
  duplicate: DuplicateMatch | null;
  status: 'pending' | 'accepted' | 'rejected';
  edited: boolean;
  index: number;
  wallet_id: number | null;
  party_id: number | null;
  category_id: number | null;
}

export interface ImportSession {
  id: number;
  file_name: string;
  file_type: string;
  document_type: string | null;
  processor: string;
  status:
    | 'analyzing'
    | 'extracting'
    | 'enriching'
    | 'checking'
    | 'ready'
    | 'confirmed'
    | 'failed'
    | 'expired';
  suggestions: Array<TransactionSuggestion & { duplicate: DuplicateMatch | null }>;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface ConfirmPayload {
  session_id: number;
  accepted: Array<{
    index: number;
    wallet_id?: number;
    party_id?: number;
    category_id?: number;
    amount?: number;
    type?: 'income' | 'expense';
    description?: string;
    date?: string;
  }>;
  auto_create_wallets?: boolean;
  auto_create_parties?: boolean;
  auto_create_categories?: boolean;
}

export interface AutoCreateOptions {
  wallets: boolean;
  parties: boolean;
  categories: boolean;
}

export interface ConfirmResponse {
  created_count: number;
  errors: string[];
}
