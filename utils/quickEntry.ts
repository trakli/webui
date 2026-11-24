export interface QuickEntryContext {
  wallets: readonly { id: number; name: string }[];
  categories: readonly { id: number; name: string; type?: string }[];
  parties: readonly { id: number; name: string }[];
  history?: {
    description?: string;
    partyId?: number;
    categoryIds?: number[];
    type?: 'INCOME' | 'EXPENSE';
  }[];
}

export interface QuickEntry {
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  walletId?: number;
  partyId?: number;
  categoryIds: number[];
  daysAgo: number;
}

const AMOUNT = /^([+-])?[€$£]?(\d+(?:[.,]\d{1,2})?)[€$£]?$/;
const DAY_WORDS: Record<string, number> = { today: 0, yesterday: 1 };

const norm = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s&]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const containsPhrase = (haystack: string, phrase: string) =>
  !!phrase && ` ${haystack} `.includes(` ${phrase} `);

const removePhrase = (haystack: string, phrase: string) =>
  ` ${haystack} `.replace(` ${phrase} `, ' ').replace(/\s+/g, ' ').trim();

function longestNamed<T extends { name: string }>(
  text: string,
  items: readonly T[]
): T | undefined {
  return items
    .filter((item) => containsPhrase(text, norm(item.name)))
    .sort((a, b) => b.name.length - a.name.length)[0];
}

export function parseQuickEntry(input: string, ctx: QuickEntryContext): QuickEntry | null {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  const index = tokens.findIndex((token) => AMOUNT.test(token));
  if (index === -1) return null;

  const [, sign, digits] = tokens[index].match(AMOUNT)!;
  const amount = Number(digits.replace(',', '.'));
  if (!(amount > 0)) return null;

  let rest = norm(tokens.filter((_, i) => i !== index).join(' '));
  let original = tokens.filter((_, i) => i !== index).join(' ');

  let daysAgo = 0;
  for (const [word, ago] of Object.entries(DAY_WORDS)) {
    if (containsPhrase(rest, word)) {
      daysAgo = ago;
      rest = removePhrase(rest, word);
      original = original.replace(new RegExp(`\\b${word}\\b`, 'i'), ' ');
    }
  }

  const wallet =
    longestNamed(rest, ctx.wallets) ??
    ctx.wallets.find((w) =>
      norm(w.name)
        .split(' ')
        .some((word) => word.length >= 3 && containsPhrase(rest, word))
    );
  if (wallet) {
    const phrase = containsPhrase(rest, norm(wallet.name))
      ? norm(wallet.name)
      : norm(wallet.name)
          .split(' ')
          .find((word) => word.length >= 3 && containsPhrase(rest, word))!;
    rest = removePhrase(rest, phrase);
    original = original.replace(new RegExp(`\\b${phrase}\\b`, 'i'), ' ');
  }

  const party = longestNamed(rest, ctx.parties);
  const category = longestNamed(rest, ctx.categories);

  let categoryIds = category ? [category.id] : [];
  let partyId = party?.id;
  let type: 'INCOME' | 'EXPENSE' = sign === '+' ? 'INCOME' : 'EXPENSE';

  if (!categoryIds.length) {
    const words = rest.split(' ').filter((word) => word.length >= 3);
    const match = (ctx.history ?? []).find(
      (item) =>
        (item.categoryIds?.length ?? 0) > 0 &&
        ((partyId && item.partyId === partyId) ||
          words.some((word) => containsPhrase(norm(item.description ?? ''), word)))
    );
    if (match) {
      categoryIds = match.categoryIds ?? [];
      partyId ??= match.partyId;
      if (!sign && match.type) type = match.type;
    }
  }

  if (!sign && category?.type?.toLowerCase() === 'income') type = 'INCOME';

  const cleaned = original.replace(/\s+/g, ' ').replace(/^[,\s]+|[,\s]+$/g, '');
  const description =
    cleaned.charAt(0).toUpperCase() + cleaned.slice(1) || party?.name || category?.name || '';

  return {
    amount,
    type,
    description,
    walletId: wallet?.id,
    partyId,
    categoryIds,
    daysAgo
  };
}
