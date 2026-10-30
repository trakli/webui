import type { Workspace, WorkspaceOverview } from '~/types/workspace';

export const PERSONAL_SPACE = 'personal';

export const SPACE_ROUTES = [
  '/dashboard',
  '/transactions',
  '/wallets',
  '/budgets',
  '/categories',
  '/people',
  '/space-billing',
  '/settings',
  '/notifications',
  '/feedback'
];

export function resolveSpace(
  stored: string | null | undefined,
  workspaces: Workspace[]
): Workspace | null {
  if (!stored || stored === PERSONAL_SPACE) return null;
  return workspaces.find((workspace) => workspace.slug === stored) ?? null;
}

export function spaceSupports(path: string): boolean {
  return SPACE_ROUTES.some((route) => path === route || path.startsWith(route + '/'));
}

export function landingAfterSwitch(path: string, shared: boolean): string {
  if (path.startsWith('/budgets/')) return '/budgets';
  if (path === '/people' || path === '/space-billing') return shared ? path : '/dashboard';
  if (!shared) return path.startsWith('/workspaces') ? '/dashboard' : path;
  return spaceSupports(path) ? path : '/dashboard';
}

export type SpaceUrgency = 'unpaid' | 'no-wallet' | 'alone' | 'over-budget' | null;

export function spaceUrgency(workspace: Workspace, overview: WorkspaceOverview): SpaceUrgency {
  if (workspace.read_only) return 'unpaid';
  if (!overview.wallets.some((wallet) => wallet.source === 'workspace')) return 'no-wallet';
  if (workspace.member_count < 2) return 'alone';
  const over = overview.budgets.some((budget) => budget.progress?.status === 'over_budget');
  return over ? 'over-budget' : null;
}

export function spaceTone(id: number): 'gift' | 'investment' {
  return id % 2 === 0 ? 'gift' : 'investment';
}
