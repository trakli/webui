import type { Budget } from './budget';

export interface Workspace {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  kind: 'family' | 'group';
  role: 'owner' | 'admin' | 'member';
  read_only: boolean;
  can_manage: boolean;
  member_count: number;
}
export interface WorkspaceWallet {
  id: number;
  name: string;
  type: string;
  currency: string;
  balance: number;
  source: 'workspace' | 'shared_wallet';
  transactions_count: number;
  can_edit: boolean;
  can_unshare: boolean;
}
export interface WorkspaceTransaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  datetime: string;
  description: string | null;
  currency: string;
  wallet_id: number | null;
  wallet_name: string | null;
  contributor: string;
  source: 'workspace' | 'shared_wallet' | 'shared_transaction';
  can_edit: boolean;
  can_unshare: boolean;
  is_refund: boolean;
  category_ids: number[];
  group_ids: number[];
}
export interface WorkspaceLabel {
  id: number;
  name: string;
  type?: string;
}
export interface WorkspaceOverview {
  wallets: WorkspaceWallet[];
  budgets: Budget[];
  categories: WorkspaceLabel[];
  groups: WorkspaceLabel[];
  totals: Array<{ currency: string; income: number; expenses: number }>;
}
export interface WorkspaceMember {
  id: number;
  name: string;
  email: string;
  role: string;
}
export interface WorkspaceInvitation {
  id: number;
  email: string;
  role: string;
  expires_at: string;
}
export interface Page<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
