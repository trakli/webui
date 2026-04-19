import { describe, it, expect } from 'vitest';
import { transactionMapper } from '@/utils/transactionMapper';
import type { ApiTransaction } from '@/types/transaction';

const baseApiTransaction: ApiTransaction = {
  id: 1,
  type: 'expense',
  amount: 100,
  description: 'Test',
  datetime: '2025-06-15T10:30:00.000Z',
  group_id: 1,
  categories: [{ id: 1, name: 'Food' }],
  user_id: 1,
  transfer_id: 0,
  wallet_client_generated_id: 'wallet-uuid',
  party_client_generated_id: 'party-uuid',
  wallet: { id: 1, name: 'Main', currency: 'USD' },
  party: { id: 1, name: 'Store' }
};

describe('transactionMapper - recurring fields', () => {
  describe('toFrontend', () => {
    it('sets isRecurring to false when recurring_rules is absent', () => {
      const result = transactionMapper.toFrontend(baseApiTransaction);
      expect(result.isRecurring).toBe(false);
      expect(result.recurrencePeriod).toBeUndefined();
      expect(result.recurrenceInterval).toBeUndefined();
      expect(result.recurrenceEndsAt).toBeUndefined();
    });

    it('sets isRecurring to false when recurring_rules is undefined', () => {
      const api = { ...baseApiTransaction, recurring_rules: undefined };
      const result = transactionMapper.toFrontend(api);
      expect(result.isRecurring).toBe(false);
    });

    it('sets isRecurring to true when recurring_rules is present', () => {
      const api = {
        ...baseApiTransaction,
        recurring_rules: {
          id: 10,
          transaction_id: 1,
          recurrence_period: 'monthly',
          recurrence_interval: 2,
          recurrence_ends_at: '2026-12-31T00:00:00.000Z'
        }
      };
      const result = transactionMapper.toFrontend(api);
      expect(result.isRecurring).toBe(true);
      expect(result.recurrencePeriod).toBe('monthly');
      expect(result.recurrenceInterval).toBe(2);
      expect(result.recurrenceEndsAt).toBe('2026-12-31T00:00:00.000Z');
    });

    it('handles recurring_rules without recurrence_ends_at', () => {
      const api = {
        ...baseApiTransaction,
        recurring_rules: {
          id: 10,
          transaction_id: 1,
          recurrence_period: 'weekly',
          recurrence_interval: 1,
          recurrence_ends_at: ''
        }
      };
      const result = transactionMapper.toFrontend(api);
      expect(result.isRecurring).toBe(true);
      expect(result.recurrencePeriod).toBe('weekly');
      expect(result.recurrenceInterval).toBe(1);
      expect(result.recurrenceEndsAt).toBe('');
    });
  });

  describe('toEditForm', () => {
    it('maps recurring_rules to frontend fields', () => {
      const api = {
        ...baseApiTransaction,
        recurring_rules: {
          id: 10,
          transaction_id: 1,
          recurrence_period: 'daily',
          recurrence_interval: 3,
          recurrence_ends_at: '2026-06-01T00:00:00.000Z'
        }
      };
      const result = transactionMapper.toEditForm(api);
      expect(result.isRecurring).toBe(true);
      expect(result.recurrencePeriod).toBe('daily');
      expect(result.recurrenceInterval).toBe(3);
      expect(result.recurrenceEndsAt).toBe('2026-06-01T00:00:00.000Z');
    });

    it('sets isRecurring false when no recurring_rules', () => {
      const result = transactionMapper.toEditForm(baseApiTransaction);
      expect(result.isRecurring).toBe(false);
    });
  });

  describe('toApi', () => {
    it('does not include recurring fields when isRecurring is false', () => {
      const frontend = {
        type: 'EXPENSE' as const,
        amount: '100 USD',
        description: 'Test',
        date: '2025-06-15',
        time: '10:30',
        isRecurring: false
      };
      const result = transactionMapper.toApi(frontend);
      expect(result.is_recurring).toBeUndefined();
      expect(result.recurrence_period).toBeUndefined();
      expect(result.recurrence_interval).toBeUndefined();
    });

    it('includes recurring fields when isRecurring is true', () => {
      const frontend = {
        type: 'EXPENSE' as const,
        amount: '100 USD',
        description: 'Test',
        date: '2025-06-15',
        time: '10:30',
        isRecurring: true,
        recurrencePeriod: 'monthly',
        recurrenceInterval: 1,
        recurrenceEndsAt: '2026-12-31'
      };
      const result = transactionMapper.toApi(frontend);
      expect(result.is_recurring).toBe(true);
      expect(result.recurrence_period).toBe('monthly');
      expect(result.recurrence_interval).toBe(1);
      expect(result.recurrence_ends_at).toBe('2026-12-31');
    });

    it('includes recurring fields without end date', () => {
      const frontend = {
        type: 'INCOME' as const,
        amount: '500 USD',
        description: 'Salary',
        date: '2025-06-15',
        time: '10:30',
        isRecurring: true,
        recurrencePeriod: 'yearly',
        recurrenceInterval: 1
      };
      const result = transactionMapper.toApi(frontend);
      expect(result.is_recurring).toBe(true);
      expect(result.recurrence_period).toBe('yearly');
      expect(result.recurrence_interval).toBe(1);
      expect(result.recurrence_ends_at).toBeUndefined();
    });
  });

  describe('toFrontendBatch', () => {
    it('maps recurring status for multiple transactions', () => {
      const apiTransactions = [
        baseApiTransaction,
        {
          ...baseApiTransaction,
          id: 2,
          recurring_rules: {
            id: 10,
            transaction_id: 2,
            recurrence_period: 'monthly',
            recurrence_interval: 1,
            recurrence_ends_at: ''
          }
        }
      ];
      const results = transactionMapper.toFrontendBatch(apiTransactions, [], [], [], []);
      expect(results[0].isRecurring).toBe(false);
      expect(results[1].isRecurring).toBe(true);
      expect(results[1].recurrencePeriod).toBe('monthly');
    });
  });
});
