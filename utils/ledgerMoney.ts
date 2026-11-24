export interface MoneyOptions {
  sign?: boolean;
  whole?: boolean;
  compact?: boolean;
}

const cache = new Map<string, Intl.NumberFormat>();

function formatter(locale: string, currency: string, options: MoneyOptions) {
  const key = `${locale}|${currency}|${options.sign ? 1 : 0}${options.whole ? 1 : 0}${options.compact ? 1 : 0}`;
  let nf = cache.get(key);
  if (!nf) {
    try {
      nf = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol',
        signDisplay: options.sign ? 'exceptZero' : 'auto',
        ...(options.compact
          ? { notation: 'compact', maximumFractionDigits: 1 }
          : options.whole
            ? { maximumFractionDigits: 0 }
            : {})
      });
    } catch {
      nf = new Intl.NumberFormat(locale, {
        signDisplay: options.sign ? 'exceptZero' : 'auto',
        maximumFractionDigits: options.whole || options.compact ? 0 : 2
      });
    }
    cache.set(key, nf);
  }
  return nf;
}

export function money(
  value: number,
  currency: string,
  locale = 'en',
  options: MoneyOptions = {}
): string {
  return formatter(locale, currency || 'USD', options).format(Number.isFinite(value) ? value : 0);
}

export function walletAmount(value: number, currency: string, locale = 'en'): string {
  return money(value, currency, locale, Math.abs(value) >= 100_000 ? { compact: true } : { whole: Math.abs(value) >= 1000 });
}
