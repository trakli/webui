/**
 * Centralized Currency Utility
 * Provides locale-aware parsing and formatting for currency amounts
 */

/**
 * Currency symbol mappings
 * Maps internal currency codes to display symbols
 */
export const CURRENCY_SYMBOL_MAP: Record<string, string> = {
  XAF: 'FCFA',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  JPY: '¥',
  CHF: 'CHF'
  // Add more mappings as needed
};

/**
 * Get display currency symbol from currency code
 * @param currencyCode - The currency code (e.g., 'XAF', 'USD')
 * @returns The display symbol (e.g., 'FCFA', '$')
 */
export function getCurrencySymbol(currencyCode: string): string {
  if (!currencyCode) return '';
  return CURRENCY_SYMBOL_MAP[currencyCode.toUpperCase()] || currencyCode;
}

/**
 * Parse an amount string that may contain currency symbols and locale-specific formatting
 * Handles multiple formats:
 * - "1,234.56 USD" (English format with currency)
 * - "1.234,56 EUR" (European format with currency)
 * - "5000 XAF" (simple format)
 * - "1234.56" (no currency)
 *
 * @param amountStr - The amount string to parse
 * @returns Object with numeric value and extracted currency code
 */
export function parseAmount(amountStr: string | number): { value: number; currency: string } {
  // Handle numeric input directly
  if (typeof amountStr === 'number') {
    return { value: amountStr, currency: '' };
  }

  if (!amountStr || typeof amountStr !== 'string') {
    return { value: 0, currency: '' };
  }

  try {
    // Extract currency (last word/token in the string, typically 3 uppercase letters)
    const currencyMatch = amountStr.match(/\b([A-Z]{3})\b\s*$/);
    const currency = currencyMatch ? currencyMatch[1] : '';

    // Remove currency and extract only numeric characters and separators
    const numericPart = amountStr
      .replace(/[A-Z]{3}\s*$/i, '')
      .replace(/[^\d.,-]/g, '')
      .trim();

    if (!numericPart) {
      return { value: 0, currency };
    }

    let value = 0;

    // Count dots and commas
    const dotCount = (numericPart.match(/\./g) || []).length;
    const commaCount = (numericPart.match(/,/g) || []).length;

    if (dotCount === 0 && commaCount === 0) {
      // Simple integer: "1234"
      value = parseFloat(numericPart);
    } else if (dotCount === 0 && commaCount === 1) {
      // One comma: could be "1234,56" (decimal) or "1,234" (thousands)
      const commaPos = numericPart.lastIndexOf(',');
      const afterComma = numericPart.substring(commaPos + 1);

      if (afterComma.length <= 2) {
        // Likely decimal separator (European format): "1234,56"
        value = parseFloat(numericPart.replace(',', '.'));
      } else {
        // Likely thousands separator: "1,234"
        value = parseFloat(numericPart.replace(',', ''));
      }
    } else if (commaCount === 0 && dotCount === 1) {
      // One dot: could be "1234.56" (decimal) or "1.234" (thousands)
      const dotPos = numericPart.lastIndexOf('.');
      const afterDot = numericPart.substring(dotPos + 1);

      if (afterDot.length <= 2) {
        // Likely decimal separator (English format): "1234.56"
        value = parseFloat(numericPart);
      } else {
        // Likely thousands separator: "1.234"
        value = parseFloat(numericPart.replace('.', ''));
      }
    } else {
      // Multiple separators - determine which is the decimal separator
      // Rule: the last separator is the decimal separator
      const lastDot = numericPart.lastIndexOf('.');
      const lastComma = numericPart.lastIndexOf(',');

      if (lastDot > lastComma) {
        // Dot is decimal separator: "1,234.56" or "1.234.56"
        value = parseFloat(numericPart.replace(/,/g, ''));
      } else {
        // Comma is decimal separator: "1.234,56"
        value = parseFloat(numericPart.replace(/\./g, '').replace(',', '.'));
      }
    }

    return {
      value: isNaN(value) ? 0 : value,
      currency
    };
  } catch (error) {
    console.error('Error parsing amount:', amountStr, error);
    return { value: 0, currency: '' };
  }
}

export interface FormatAmountOptions {
  /** The locale to use for formatting (defaults to browser locale) */
  locale?: string;
  /** Whether to use compact notation (1.2k instead of 1,200) */
  compact?: boolean;
  /** Threshold for compact notation in base units (default: 1000) */
  compactThreshold?: number;
  /** Minimum fraction digits (default: 0) */
  minimumFractionDigits?: number;
  /** Maximum fraction digits (default: 2) */
  maximumFractionDigits?: number;
  /** Whether to show currency symbol/code (default: true) */
  showCurrency?: boolean;
}

/**
 * Format amount with proper locale and optional compact notation
 *
 * @param amount - The amount to format (string or number)
 * @param options - Formatting options
 * @returns Formatted amount string with currency
 *
 * @example
 * formatAmount("1234.56 USD") // "1,234.56 $"
 * formatAmount(1234.56, { compact: true }) // "1.2k"
 * formatAmount("5000 XAF", { locale: 'fr-FR' }) // "5 000 FCFA"
 */
export function formatAmount(amount: string | number, options: FormatAmountOptions = {}): string {
  const {
    locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US',
    compact = false,
    compactThreshold = 1000,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    showCurrency = true
  } = options;

  // Parse the amount if it's a string
  const { value, currency } =
    typeof amount === 'string' ? parseAmount(amount) : { value: amount, currency: '' };

  // Get display currency symbol
  const displayCurrency = getCurrencySymbol(currency);

  // Determine if we should use compact notation
  const useCompact = compact && Math.abs(value) >= compactThreshold;

  try {
    const formatterOptions: Intl.NumberFormatOptions = {
      minimumFractionDigits,
      maximumFractionDigits
    };

    // Add compact notation if supported and requested
    if (useCompact) {
      formatterOptions.notation = 'compact';
      formatterOptions.compactDisplay = 'short';
    }

    const formatter = new Intl.NumberFormat(locale, formatterOptions);
    const formattedNumber = formatter.format(value);

    // Return with or without currency
    if (showCurrency && displayCurrency) {
      return `${formattedNumber} ${displayCurrency}`;
    }

    return formattedNumber;
  } catch (error) {
    console.error('Error formatting amount:', amount, error);
    // Fallback to simple formatting
    const rounded = Math.round(value * 100) / 100;
    return showCurrency && displayCurrency ? `${rounded} ${displayCurrency}` : String(rounded);
  }
}

/**
 * Format amount for compact display (mobile cards, summaries)
 * Always uses compact notation for numbers >= 1000
 *
 * @param amount - The amount to format
 * @returns Formatted amount string (e.g., "1.2k FCFA", "450 $")
 */
export function formatShortAmount(amount: string | number): string {
  return formatAmount(amount, {
    compact: true,
    compactThreshold: 1000,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

/**
 * Format amount for full display (tables, detailed views)
 * Never uses compact notation, shows all digits with locale formatting
 *
 * @param amount - The amount to format
 * @returns Formatted amount string (e.g., "1,234.56 $")
 */
export function formatFullAmount(amount: string | number): string {
  return formatAmount(amount, {
    compact: false,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Format amount without currency symbol (for input fields, calculations)
 *
 * @param amount - The amount to format
 * @returns Formatted number without currency
 */
export function formatAmountNoCurrency(amount: string | number): string {
  return formatAmount(amount, {
    showCurrency: false,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
