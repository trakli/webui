/**
 * Dynamic color generation utilities for consistent UI theming
 */

// Base color palette for better visual consistency
const BASE_COLORS = [
  '#3b82f6', // Blue
  '#f97316', // Orange
  '#10b981', // Green
  '#f43f5e', // Pink
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#a855f7', // Violet
  '#22d3ee', // Sky
  '#65a30d', // Green-600
  '#dc2626', // Red-600
  '#7c3aed' // Violet-600
];

/**
 * Generate a hash from a string for consistent color assignment
 */
function hashString(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash);
}

/**
 * Generate HSL color based on input string for infinite unique colors
 */
function generateHSLColor(input: string, saturation = 65, lightness = 55): string {
  const hash = hashString(input);
  const hue = hash % 360;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Get color for a given input with consistent assignment
 * First tries base palette, then generates unique HSL colors
 */
export function getColorForItem(
  item: string,
  index?: number,
  options: {
    saturation?: number;
    lightness?: number;
    forceGenerated?: boolean;
  } = {}
): string {
  const { saturation = 65, lightness = 55, forceGenerated = false } = options;

  // If we have an index and it's within base colors range, use base palette
  if (!forceGenerated && typeof index === 'number' && index < BASE_COLORS.length) {
    return BASE_COLORS[index];
  }

  // Generate consistent color based on item name hash
  return generateHSLColor(item, saturation, lightness);
}

/**
 * Generate a set of colors for multiple items ensuring uniqueness and consistency
 */
export function generateColorPalette(
  items: string[],
  options: {
    saturation?: number;
    lightness?: number;
    preferBasePalette?: boolean;
  } = {}
): Record<string, string> {
  const { preferBasePalette = true } = options;
  const colorMap: Record<string, string> = {};

  items.forEach((item, index) => {
    colorMap[item] = getColorForItem(item, preferBasePalette ? index : undefined, options);
  });

  return colorMap;
}

/**
 * Get colors specifically for chart data with consistent assignment
 */
export function getChartColors<T extends { name: string }>(
  data: T[],
  options: {
    saturation?: number;
    lightness?: number;
  } = {}
): Array<T & { color: string }> {
  return data.map((item, index) => ({
    ...item,
    color: getColorForItem(item.name, index, options)
  }));
}

/**
 * Predefined theme colors for specific contexts
 */
export const THEME_COLORS = {
  income: '#10b981', // Green
  expense: '#ef4444', // Red
  balance: '#3b82f6', // Blue
  neutral: '#6b7280', // Gray
  success: '#059669', // Green-600
  warning: '#d97706', // Orange-600
  danger: '#dc2626', // Red-600
  info: '#0284c7' // Sky-600
} as const;
