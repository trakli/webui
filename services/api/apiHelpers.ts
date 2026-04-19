/**
 * Default page size for list endpoints that support pagination.
 */
export const API_DEFAULT_LIMIT = 200;

/**
 * Hard stop on how many pages we chase when loading a full list. Prevents
 * a runaway loop if a future bug makes `last_page` drift.
 */
const FETCH_ALL_PAGE_CEILING = 200;

interface PaginatedPageShape<T> {
  data?: T[];
  current_page?: number;
  last_page?: number;
  total?: number;
  per_page?: number;
}

/**
 * Walks every page of a paginated endpoint and returns the combined rows.
 * Use when the UI needs the full list (dropdowns, filters) — not for
 * anything that actually paginates visibly.
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<unknown>
): Promise<{ data: T[] }> {
  const all: T[] = [];
  let page = 1;

  while (page <= FETCH_ALL_PAGE_CEILING) {
    const raw = await fetchPage(page);
    const body = extractResponseData<PaginatedPageShape<T>>(raw, {});
    const rows = Array.isArray(body.data) ? body.data : [];
    all.push(...rows);

    const lastPage = body.last_page ?? 1;
    const currentPage = body.current_page ?? page;
    if (rows.length === 0 || currentPage >= lastPage) break;

    page = currentPage + 1;
  }

  return { data: all };
}

/**
 * Helper function to build icon payload for API requests
 * Standardizes icon handling across all API services
 */
export function buildIconPayload(
  icon: string | { path: string } | undefined | null
): { icon: string; icon_type: string } | Record<string, never> {
  if (!icon) return {} as Record<string, never>;

  const iconValue = typeof icon === 'string' ? icon : icon?.path || '';

  return iconValue.trim() !== ''
    ? { icon: iconValue, icon_type: 'image' }
    : ({} as Record<string, never>);
}

/**
 * Type guard to check if response has nested data structure
 * Helps avoid unsafe type casting
 */
export function hasNestedData<T>(response: any): response is { data: T } {
  return (
    response && typeof response === 'object' && 'data' in response && response.data !== undefined
  );
}

/**
 * Safely extract data from API response
 * Handles both wrapped and direct response formats
 */
export function extractResponseData<T>(response: any, fallback: T): T {
  if (hasNestedData<T>(response)) {
    return response.data;
  }

  // If response has the expected structure directly (has a `data` array)
  if (response && typeof response === 'object' && 'data' in response) {
    return response;
  }

  return fallback;
}
