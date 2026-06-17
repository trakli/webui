import type { WalletStatistics } from '@/composables/useStatistics';

// `key`/`prompt` are i18n keys; `params` feed interpolation.
export interface SpotlightInsight {
  key: string;
  params?: Record<string, string | number>;
  prompt: string;
  promptParams?: Record<string, string | number>;
}

type MoneyFormatter = (amount: number) => string;

const pct = (ratio: number): number => Math.round(ratio);

// Returns [] when there is nothing meaningful to say (caller shows the fallback).
export function buildSpotlightInsights(
  stats: Partial<WalletStatistics> | null | undefined,
  money: MoneyFormatter
): SpotlightInsight[] {
  if (!stats) return [];

  const out: SpotlightInsight[] = [];

  const savingsRate = stats.expense_insights?.budget_analysis?.savings_rate;
  if (typeof savingsRate === 'number' && savingsRate > 0) {
    out.push({
      key: "You've saved {rate}% of your income this month.",
      params: { rate: pct(savingsRate * 100) },
      prompt: 'How can I improve my savings rate?'
    });
  }

  const category = stats.expense_insights?.biggest_category;
  if (category?.category && category.percentage > 0) {
    out.push({
      key: '{category} is your biggest spending category at {percent}% of the total.',
      params: { category: category.category, percent: pct(category.percentage) },
      prompt: 'Break down my {category} spending.',
      promptParams: { category: category.category }
    });
  }

  const growth = stats.performance?.growth_percentage;
  if (typeof growth === 'number' && Math.abs(growth) >= 1) {
    out.push({
      key:
        growth > 0
          ? 'Your income is up {percent}% compared with last month.'
          : 'Your income is down {percent}% compared with last month.',
      params: { percent: Math.abs(Math.round(growth)) },
      prompt: 'Why did my income change versus last month?'
    });
  }

  const source = stats.income_insights?.biggest_source;
  if (source?.party) {
    out.push({
      key: '{party} is your top income source this month.',
      params: { party: source.party },
      prompt: 'Show my income from {party}.',
      promptParams: { party: source.party }
    });
  }

  const spent = stats.total_expenses;
  if (typeof spent === 'number' && spent > 0) {
    out.push({
      key: "You've spent {amount} so far this month.",
      params: { amount: money(spent) },
      prompt: 'What did I spend the most on this month?'
    });
  }

  const topExpense = stats.expense_insights?.biggest_expense;
  if (topExpense?.party && topExpense.amount > 0) {
    out.push({
      key: '{amount} of your spending went to {party}.',
      params: { amount: money(topExpense.amount), party: topExpense.party },
      prompt: 'Show my transactions with {party}.',
      promptParams: { party: topExpense.party }
    });
  }

  return out;
}
