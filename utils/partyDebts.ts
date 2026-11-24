export const DEBT_INTENTS = [
  'loan_received',
  'debt_owed',
  'loan_repayment',
  'debt_settled'
] as const;

const MONEY_IN = new Set(['loan_received', 'debt_owed']);
const MONEY_OUT = new Set(['loan_repayment', 'debt_settled']);

export interface DebtRow {
  party_id: number | null;
  intent?: string | null;
  amount: string | number;
  datetime: string;
  description?: string | null;
  wallet?: { currency?: string } | null;
}

export interface DebtMovement {
  date: string;
  amount: number;
  description: string;
  direction: 'in' | 'out';
  intent: string;
}

export interface PartyDebt {
  currency: string;
  /** Positive: you owe them. Negative: they owe you. */
  net: number;
  lent: number;
  repaid: number;
  movements: DebtMovement[];
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Money in tagged as a loan or debt is money you have to give back; money out
 * with those tags pays it back, or lends it when nothing was owed.
 */
export function partyDebts(rows: DebtRow[]): Map<number, PartyDebt[]> {
  const byParty = new Map<number, Map<string, PartyDebt>>();
  for (const row of rows) {
    const intent = row.intent ?? '';
    if (row.party_id == null || !(MONEY_IN.has(intent) || MONEY_OUT.has(intent))) continue;
    const amount = Number(row.amount) || 0;
    const currency = row.wallet?.currency ?? '';
    const party = byParty.get(row.party_id) ?? new Map<string, PartyDebt>();
    byParty.set(row.party_id, party);
    const debt = party.get(currency) ?? { currency, net: 0, lent: 0, repaid: 0, movements: [] };
    party.set(currency, debt);
    const direction = MONEY_IN.has(intent) ? 'in' : 'out';
    debt.net = round(debt.net + (direction === 'in' ? amount : -amount));
    if (direction === 'out') debt.lent = round(debt.lent + amount);
    else debt.repaid = round(debt.repaid + amount);
    debt.movements.push({
      date: row.datetime,
      amount,
      description: row.description ?? '',
      direction,
      intent
    });
  }

  const result = new Map<number, PartyDebt[]>();
  for (const [partyId, currencies] of byParty) {
    const list = [...currencies.values()].filter(
      (debt) => Math.abs(debt.net) >= 0.005 || debt.movements.length
    );
    for (const debt of list) debt.movements.sort((a, b) => (a.date < b.date ? 1 : -1));
    result.set(partyId, list);
  }
  return result;
}

const SETTLES: Record<string, string> = {
  loan_received: 'loan_repayment',
  loan_repayment: 'loan_received',
  debt_owed: 'debt_settled',
  debt_settled: 'debt_owed'
};

/** The intent that moves this balance back toward zero, in the same pair as the latest entry. */
export function settlingIntent(debt: PartyDebt): string {
  const latest = debt.movements.find((movement) =>
    debt.net > 0 ? movement.direction === 'in' : movement.direction === 'out'
  );
  return SETTLES[latest?.intent ?? ''] ?? (debt.net > 0 ? 'debt_settled' : 'debt_owed');
}
