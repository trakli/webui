import { formatAmount } from '~/utils/currency';

export function spaceMoney(value: number | string, currency: string): string {
  return formatAmount(`${Number(value)} ${currency}`);
}

export function localDateTime(value = new Date()): string {
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
