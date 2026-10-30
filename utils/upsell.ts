export type UpsellReason = 'workspace' | 'personal' | null;

interface ErrorBody {
  message?: string;
  errors?: Record<string, unknown> | unknown[];
}

function statusOf(error: any): number | undefined {
  return error?.response?.status ?? error?.status ?? error?.statusCode;
}

function bodyOf(error: any): ErrorBody {
  return error?.response?._data ?? error?.data ?? error?._data ?? {};
}

export function upsellReason(error: unknown): UpsellReason {
  const status = statusOf(error);
  const body = bodyOf(error);
  if (status === 402) return 'workspace';
  if (status !== 403) return null;
  if (body.message === 'Changes to this workspace are not allowed.') return 'workspace';
  const errors = body.errors;
  if (errors && !Array.isArray(errors) && 'limit' in errors) return 'personal';
  return null;
}
