import { describe, expect, it } from 'vitest';
import { parseQuickEntry, type QuickEntryContext } from '~/utils/quickEntry';

const ctx: QuickEntryContext = {
  wallets: [
    { id: 1, name: 'Cash' },
    { id: 2, name: 'Main Checking' },
    { id: 3, name: 'Dollar Savings' }
  ],
  categories: [
    { id: 10, name: 'Food & Dining', type: 'expense' },
    { id: 11, name: 'Groceries', type: 'expense' },
    { id: 12, name: 'Salary', type: 'income' }
  ],
  parties: [
    { id: 20, name: 'Corner Coffee' },
    { id: 21, name: 'Chez Lou' }
  ],
  history: [
    { description: 'Flat white', partyId: 20, categoryIds: [10], type: 'EXPENSE' },
    { description: 'Lunch', categoryIds: [10], type: 'EXPENSE' }
  ]
};

describe('parseQuickEntry', () => {
  it('reads amount, wallet and person from one line', () => {
    expect(parseQuickEntry('12.50 lunch Chez Lou cash', ctx)).toEqual({
      amount: 12.5,
      type: 'EXPENSE',
      description: 'Lunch Chez Lou',
      walletId: 1,
      partyId: 21,
      categoryIds: [10],
      daysAgo: 0
    });
  });

  it('takes the category from the person when the words name none', () => {
    const entry = parseQuickEntry('3,80 Corner Coffee yesterday', ctx)!;
    expect(entry.amount).toBe(3.8);
    expect(entry.partyId).toBe(20);
    expect(entry.categoryIds).toEqual([10]);
    expect(entry.daysAgo).toBe(1);
    expect(entry.walletId).toBeUndefined();
  });

  it('matches a wallet by one word of its name and a category by name', () => {
    const entry = parseQuickEntry('64.30 groceries checking', ctx)!;
    expect(entry.walletId).toBe(2);
    expect(entry.categoryIds).toEqual([11]);
    expect(entry.description).toBe('Groceries');
  });

  it('treats a plus sign or an income category as money in', () => {
    expect(parseQuickEntry('+40 from Tomás', ctx)!.type).toBe('INCOME');
    expect(parseQuickEntry('3420 salary', ctx)!.type).toBe('INCOME');
  });

  it('returns null without a positive amount', () => {
    expect(parseQuickEntry('lunch at Chez Lou', ctx)).toBeNull();
    expect(parseQuickEntry('0 lunch', ctx)).toBeNull();
  });
});
