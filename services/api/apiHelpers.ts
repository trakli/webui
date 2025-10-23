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

  // If response has the expected structure directly (like last_sync + data)
  if (response && typeof response === 'object' && 'last_sync' in response) {
    return response;
  }

  return fallback;
}
