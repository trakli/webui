import { describe, expect, it } from 'vitest';
import sample from '../fixtures/apiTransactionRow.json';
import { partyDebts, settlingIntent } from '~/utils/partyDebts';

const row = (changes: Record<string, unknown>) => ({ ...sample, ...changes });

describe('partyDebts', () => {
  it('says a person owes you when you lent more than they paid back', () => {
    const debts = partyDebts([
      row({ type: 'expense', intent: 'debt_settled', amount: '120.0000', datetime: '2026-11-02T10:00:00.000000Z', description: 'Lent for the train' }),
      row({ type: 'income', intent: 'debt_owed', amount: '40.0000', datetime: '2026-11-10T10:00:00.000000Z', description: 'Paid back' })
    ]).get(304)!;
    expect(debts).toHaveLength(1);
    expect(debts[0]).toMatchObject({ currency: 'EUR', net: -80, lent: 120, repaid: 40 });
    expect(debts[0].movements.map((m) => m.direction)).toEqual(['in', 'out']);
    expect(settlingIntent(debts[0])).toBe('debt_owed');
  });

  it('says you owe a person after a loan you have not repaid', () => {
    const debts = partyDebts([
      row({ intent: 'loan_received', amount: '200.0000' }),
      row({ type: 'expense', intent: 'loan_repayment', amount: '50.0000' })
    ]).get(304)!;
    expect(debts[0].net).toBe(150);
    expect(settlingIntent(debts[0])).toBe('loan_repayment');
  });

  it('ignores regular entries and keeps each currency apart', () => {
    const debts = partyDebts([
      sample,
      row({ intent: 'loan_received', amount: '25000.0000', wallet: { ...sample.wallet, currency: 'XAF' } }),
      row({ type: 'expense', intent: 'debt_settled', amount: '10.0000' })
    ]).get(304)!;
    expect(debts.map((d) => [d.currency, d.net])).toEqual([
      ['XAF', 25000],
      ['EUR', -10]
    ]);
  });
});
