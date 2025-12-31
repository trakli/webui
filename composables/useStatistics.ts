import { ref, computed, watch } from 'vue';
import { useTransactions } from '~/composables/useTransactions';
import { useWallets } from '~/composables/useWallets';
import { useSharedData } from '~/composables/useSharedData';
import type { FrontendTransaction } from '~/types/transaction';
import { parseAmount, formatAmount, formatShortAmount } from '@/utils/currency';
import { checkAuth } from '~/utils/auth';

export interface PartyBreakdown {
  party: string;
  amount: number;
  percentage: number;
  transaction_count: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  transaction_count: number;
  type: 'INCOME' | 'EXPENSE';
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface WalletBreakdown {
  wallet_id: number;
  wallet_name: string;
  balance: number;
  income: number;
  expenses: number;
  transaction_count: number;
  percentage_of_total: number;
}

export interface BiggestCategory {
  category: string;
  amount: number;
  percentage: number;
  transaction_count: number;
}

export interface IncomeInsights {
  total: number;
  biggest_source: PartyBreakdown | null;
  biggest_category: BiggestCategory | null;
  top_sources: PartyBreakdown[];
  top_categories: CategoryBreakdown[];
  average_transaction: number;
  frequency_analysis: {
    daily_average: number;
    weekly_average: number;
    monthly_average: number;
  };
  growth_trends: {
    current_vs_previous: number;
    trend_direction: 'up' | 'down' | 'stable';
    momentum: 'accelerating' | 'decelerating' | 'steady';
  };
}

export interface ExpenseInsights {
  total: number;
  biggest_expense: PartyBreakdown | null;
  biggest_category: BiggestCategory | null;
  top_destinations: PartyBreakdown[];
  top_categories: CategoryBreakdown[];
  average_transaction: number;
  spending_patterns: {
    daily_average: number;
    weekly_average: number;
    monthly_average: number;
  };
  budget_analysis: {
    expense_ratio: number; // expenses / income
    savings_rate: number; // (income - expenses) / income
    risk_level: 'low' | 'medium' | 'high';
  };
}

export interface WalletStatistics {
  total_balance: number;
  total_income: number;
  total_expenses: number;
  transaction_count: number;
  unique_parties: number;
  period: string;
  wallet_id?: number | null;
  wallet_name?: string;
  last_updated: string;

  income_insights: IncomeInsights;
  expense_insights: ExpenseInsights;

  category_breakdown: {
    income_categories: CategoryBreakdown[];
    expense_categories: CategoryBreakdown[];
    most_used_category: CategoryBreakdown | null;
  };

  party_breakdown: {
    income_sources: PartyBreakdown[];
    expense_destinations: PartyBreakdown[];
    most_frequent_party: PartyBreakdown | null;
  };

  wallet_distribution?: WalletBreakdown[];

  time_analysis: {
    monthly_trends: MonthlyTrend[];
    busiest_day: string;
    peak_transaction_hour?: number;
    transaction_frequency: {
      per_day: number;
      per_week: number;
      per_month: number;
    };
  };

  performance: {
    growth_percentage: number;
    velocity: number; // transaction frequency change
    efficiency: number; // income/expense ratio improvement
    consistency: number; // variance in monthly performance
  };

  insights: {
    key_observations: string[];
    recommendations: string[];
    alerts: string[];
    opportunities: string[];
  };
}

export interface StatisticsPeriod {
  label: string;
  value: string;
  days: number;
}

// Configuration for statistics source
const USE_API_STATISTICS = true;

// TODO: Replace with API call to fetch real-time currency conversion rates
// Simple currency conversion rates (should come from API in production)
const CURRENCY_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.85,
  XAF: 600.0,
  GBP: 0.75,
  CAD: 1.35
};

// Available time periods - labels are translation keys
const AVAILABLE_PERIODS: StatisticsPeriod[] = [
  { label: 'All time', value: 'all_time', days: 0 },
  { label: 'This Week', value: 'current_week', days: 0 },
  { label: 'This Month', value: 'current_month', days: 0 },
  { label: 'Last 3 months', value: '90d', days: 90 },
  { label: 'Custom', value: 'custom', days: 0 }
];

const currentPeriod = ref<string>('all_time');
const selectedWalletId = ref<number | null>(null); // null = all wallets
const isLoading = ref(typeof window !== 'undefined' && checkAuth());
const error = ref<string | null>(null);

export interface CustomFilters {
  startDate: string;
  endDate: string;
  walletIds: number[];
}

const customFilters = ref<CustomFilters | null>(null);

export const useStatistics = () => {
  const { transactions } = useTransactions();
  const { wallets } = useWallets();
  const { getDefaultCurrency } = useSharedData();

  const getDateRangeForPeriod = (period: string): { start: Date; end: Date } => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let start: Date;

    switch (period) {
      case 'all_time':
        start = new Date(2000, 0, 1);
        break;
      case 'current_week': {
        // Get the start of the current week (Monday)
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
        start = new Date(now.getTime() - daysToMonday * 24 * 60 * 60 * 1000);
        start.setHours(0, 0, 0, 0);
        break;
      }
      case 'current_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        // For custom, default to current month (will be overridden by UI)
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'current_year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(2000, 0, 1);
    }

    return { start, end };
  };

  const getPrimaryCurrency = (walletId: number | null): string => {
    if (walletId) {
      const wallet = wallets.value.find((w) => w.id === walletId);
      return wallet?.currency || 'USD';
    }

    return getDefaultCurrency.value;
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;

    const fromRate = CURRENCY_RATES[fromCurrency] || 1;
    const toRate = CURRENCY_RATES[toCurrency] || 1;

    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  };

  const calculatePartyBreakdown = (
    filteredTransactions: FrontendTransaction[],
    type: 'INCOME' | 'EXPENSE',
    primaryCurrency: string,
    walletId: number | null = null
  ): PartyBreakdown[] => {
    const partyMap = new Map<string, { amount: number; count: number }>();
    const typeTransactions = filteredTransactions.filter((t) => t.type === type);

    let totalAmount = 0;

    typeTransactions.forEach((t) => {
      const { value, currency } = parseAmount(t.amount);
      let convertedAmount = value;

      if (walletId === null) {
        convertedAmount = convertCurrency(value, currency, primaryCurrency);
      } else {
        // For specific wallet, use all transactions (already filtered by wallet)
        convertedAmount = value;
      }

      totalAmount += convertedAmount;

      const existing = partyMap.get(t.party) || { amount: 0, count: 0 };
      partyMap.set(t.party, {
        amount: existing.amount + convertedAmount,
        count: existing.count + 1
      });
    });

    return Array.from(partyMap.entries())
      .map(([party, data]) => ({
        party,
        amount: data.amount,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        transaction_count: data.count
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  // Helper to calculate category breakdown (currency-aware)
  const calculateCategoryBreakdown = (
    filteredTransactions: FrontendTransaction[],
    type: 'INCOME' | 'EXPENSE',
    primaryCurrency: string,
    walletId: number | null = null
  ): CategoryBreakdown[] => {
    const categoryMap = new Map<string, { amount: number; count: number }>();
    const typeTransactions = filteredTransactions.filter((t) => t.type === type);

    let totalAmount = 0;

    typeTransactions.forEach((t) => {
      const { value, currency } = parseAmount(t.amount);
      let convertedAmount = value;

      if (walletId === null) {
        convertedAmount = convertCurrency(value, currency, primaryCurrency);
      } else {
        // For specific wallet, use all transactions (already filtered by wallet)
        convertedAmount = value;
      }

      totalAmount += convertedAmount;

      const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
      categoryMap.set(t.category, {
        amount: existing.amount + convertedAmount,
        count: existing.count + 1
      });
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        transaction_count: data.count,
        type
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const calculateMonthlyTrends = (filteredTransactions: FrontendTransaction[]): MonthlyTrend[] => {
    const monthMap = new Map<string, { income: number; expenses: number }>();

    filteredTransactions.forEach((t) => {
      const date = new Date(t.date + 'T00:00:00');
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const amount = parseAmount(t.amount);

      const existing = monthMap.get(monthKey) || { income: 0, expenses: 0 };

      if (t.type === 'INCOME') {
        existing.income += amount.value;
      } else {
        existing.expenses += amount.value;
      }

      monthMap.set(monthKey, existing);
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const calculateWalletDistribution = (
    filteredTransactions: FrontendTransaction[],
    targetCurrency: string
  ): WalletBreakdown[] => {
    const walletMap = new Map<string, { income: number; expenses: number; count: number }>();

    filteredTransactions.forEach((t) => {
      const { value, currency } = parseAmount(t.amount);
      // Convert to target currency for aggregated wallet view
      const convertedAmount = convertCurrency(value, currency, targetCurrency);
      const existing = walletMap.get(t.wallet) || { income: 0, expenses: 0, count: 0 };

      if (t.type === 'INCOME') {
        existing.income += convertedAmount;
      } else {
        existing.expenses += convertedAmount;
      }
      existing.count += 1;

      walletMap.set(t.wallet, existing);
    });

    const totalBalance = Array.from(walletMap.values()).reduce(
      (sum, w) => sum + (w.income - w.expenses),
      0
    );

    return Array.from(walletMap.entries())
      .map(([walletName, data]) => {
        const wallet = wallets.value.find((w) => w.name === walletName);
        const balance = data.income - data.expenses;

        return {
          wallet_id: wallet?.id || 0,
          wallet_name: walletName,
          balance,
          income: data.income,
          expenses: data.expenses,
          transaction_count: data.count,
          percentage_of_total: totalBalance > 0 ? (balance / totalBalance) * 100 : 0
        };
      })
      .sort((a, b) => b.balance - a.balance);
  };

  const generateInsights = (
    stats: Partial<WalletStatistics>
  ): {
    key_observations: string[];
    recommendations: string[];
    alerts: string[];
    opportunities: string[];
  } => {
    const insights = {
      key_observations: [],
      recommendations: [],
      alerts: [],
      opportunities: []
    };

    if (
      stats.expense_insights?.budget_analysis?.savings_rate &&
      stats.expense_insights.budget_analysis.savings_rate < 0.1
    ) {
      insights.alerts.push('Low savings rate detected - consider reducing expenses');
    }

    if (
      stats.income_insights?.biggest_source?.percentage &&
      stats.income_insights.biggest_source.percentage > 70
    ) {
      insights.alerts.push('High income concentration risk - consider diversifying income sources');
    }

    if (stats.performance?.growth_percentage && stats.performance.growth_percentage > 10) {
      insights.key_observations.push(
        `Strong income growth of ${stats.performance.growth_percentage}% this period`
      );
    }

    return insights;
  };

  const calculateStatistics = async (
    walletId: number | null,
    period: string
  ): Promise<WalletStatistics> => {
    const { start, end } = getDateRangeForPeriod(period);

    const filteredTransactions = transactions.value.filter((t) => {
      // Parse date as local time by appending T00:00:00 (without Z)
      const txnDate = new Date(t.date + 'T00:00:00');
      return txnDate >= start && txnDate <= end;
    });

    const walletFilteredTransactions = walletId
      ? filteredTransactions.filter((t) => {
          const wallet = wallets.value.find((w) => w.id === walletId);
          return wallet && t.wallet === wallet.name;
        })
      : filteredTransactions;

    const primaryCurrency = getPrimaryCurrency(walletId);

    const incomeTransactions = walletFilteredTransactions.filter((t) => t.type === 'INCOME');
    const expenseTransactions = walletFilteredTransactions.filter((t) => t.type === 'EXPENSE');

    const totalIncome = incomeTransactions.reduce((sum, t) => {
      const { value, currency } = parseAmount(t.amount);
      const roundedValue = Math.round(value * 100) / 100;

      if (walletId === null) {
        const convertedAmount = convertCurrency(roundedValue, currency || 'USD', 'USD');
        return sum + Math.round(convertedAmount * 100) / 100;
      } else {
        return sum + roundedValue;
      }
    }, 0);

    const totalExpenses = expenseTransactions.reduce((sum, t) => {
      const { value, currency } = parseAmount(t.amount);
      const roundedValue = Math.round(value * 100) / 100;

      if (walletId === null) {
        const convertedAmount = convertCurrency(roundedValue, currency || 'USD', 'USD');
        return sum + Math.round(convertedAmount * 100) / 100;
      } else {
        return sum + roundedValue;
      }
    }, 0);

    const totalBalance = totalIncome - totalExpenses;

    const incomeParties = calculatePartyBreakdown(
      walletFilteredTransactions,
      'INCOME',
      primaryCurrency,
      walletId
    );
    const expenseParties = calculatePartyBreakdown(
      walletFilteredTransactions,
      'EXPENSE',
      primaryCurrency,
      walletId
    );

    const incomeCategories = calculateCategoryBreakdown(
      walletFilteredTransactions,
      'INCOME',
      primaryCurrency,
      walletId
    );
    const expenseCategories = calculateCategoryBreakdown(
      walletFilteredTransactions,
      'EXPENSE',
      primaryCurrency,
      walletId
    );

    const monthlyTrends = calculateMonthlyTrends(walletFilteredTransactions);
    const periodDays = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const previousPeriodStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
    const previousPeriodTransactions = transactions.value.filter((t) => {
      const txnDate = new Date(t.date + 'T00:00:00');
      return txnDate >= previousPeriodStart && txnDate < start;
    });
    const previousIncome = previousPeriodTransactions
      .filter(
        (t) =>
          t.type === 'INCOME' &&
          (walletId ? t.wallet === wallets.value.find((w) => w.id === walletId)?.name : true)
      )
      .reduce((sum, t) => sum + parseAmount(t.amount).value, 0);

    const growthPercentage =
      previousIncome > 0
        ? Math.round(((totalIncome - previousIncome) / previousIncome) * 100)
        : totalIncome > 0
          ? 100
          : 0;

    const stats: WalletStatistics = {
      total_balance: totalBalance,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      transaction_count: walletFilteredTransactions.length, // Count ALL transactions regardless of currency
      unique_parties: new Set(walletFilteredTransactions.map((t) => t.party)).size,
      period,
      wallet_id: walletId,
      wallet_name: walletId ? wallets.value.find((w) => w.id === walletId)?.name : 'All Wallets',
      last_updated: new Date().toISOString(),

      income_insights: {
        total: totalIncome,
        biggest_source: incomeParties[0] || null,
        biggest_category: incomeCategories[0]
          ? {
              category: incomeCategories[0].category,
              amount: incomeCategories[0].amount,
              percentage: incomeCategories[0].percentage,
              transaction_count: incomeCategories[0].transaction_count
            }
          : null,
        top_sources: incomeParties.slice(0, 5),
        top_categories: incomeCategories.slice(0, 5),
        average_transaction:
          incomeTransactions.length > 0 ? totalIncome / incomeTransactions.length : 0,
        frequency_analysis: {
          daily_average: totalIncome / periodDays,
          weekly_average: totalIncome / (periodDays / 7),
          monthly_average: totalIncome / (periodDays / 30)
        },
        growth_trends: {
          current_vs_previous: growthPercentage,
          trend_direction: growthPercentage > 5 ? 'up' : growthPercentage < -5 ? 'down' : 'stable',
          momentum: 'steady' // TODO: Calculate based on multiple periods
        }
      },

      expense_insights: {
        total: totalExpenses,
        biggest_expense: expenseParties[0] || null,
        biggest_category: expenseCategories[0]
          ? {
              category: expenseCategories[0].category,
              amount: expenseCategories[0].amount,
              percentage: expenseCategories[0].percentage,
              transaction_count: expenseCategories[0].transaction_count
            }
          : null,
        top_destinations: expenseParties.slice(0, 5),
        top_categories: expenseCategories.slice(0, 5),
        average_transaction:
          expenseTransactions.length > 0 ? totalExpenses / expenseTransactions.length : 0,
        spending_patterns: {
          daily_average: totalExpenses / periodDays,
          weekly_average: totalExpenses / (periodDays / 7),
          monthly_average: totalExpenses / (periodDays / 30)
        },
        budget_analysis: {
          expense_ratio: totalIncome > 0 ? totalExpenses / totalIncome : 0,
          savings_rate: totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0,
          risk_level:
            totalExpenses > totalIncome
              ? 'high'
              : totalExpenses > totalIncome * 0.8
                ? 'medium'
                : 'low'
        }
      },

      category_breakdown: {
        income_categories: incomeCategories,
        expense_categories: expenseCategories,
        most_used_category:
          [...incomeCategories, ...expenseCategories].sort(
            (a, b) => b.transaction_count - a.transaction_count
          )[0] || null
      },

      party_breakdown: {
        income_sources: incomeParties,
        expense_destinations: expenseParties,
        most_frequent_party:
          [...incomeParties, ...expenseParties].sort(
            (a, b) => b.transaction_count - a.transaction_count
          )[0] || null
      },

      // Wallet distribution (only for aggregated stats)
      wallet_distribution: walletId
        ? undefined
        : calculateWalletDistribution(filteredTransactions, primaryCurrency),

      time_analysis: {
        monthly_trends: monthlyTrends,
        busiest_day: 'Monday', // TODO: Calculate actual busiest day
        transaction_frequency: {
          per_day: walletFilteredTransactions.length / periodDays,
          per_week: walletFilteredTransactions.length / (periodDays / 7),
          per_month: walletFilteredTransactions.length / (periodDays / 30)
        }
      },

      performance: {
        growth_percentage: growthPercentage,
        velocity: 0, // TODO: Calculate transaction frequency change
        efficiency: totalIncome > 0 ? totalBalance / totalIncome : 0,
        consistency: 0 // TODO: Calculate variance in monthly performance
      },

      // AI insights placeholder
      insights: {
        key_observations: [],
        recommendations: [],
        alerts: [],
        opportunities: []
      }
    };

    stats.insights = generateInsights(stats);

    return stats;
  };

  const fetchStatisticsFromAPI = async (
    walletId: number | null,
    period: string
  ): Promise<WalletStatistics> => {
    const { api } = await import('~/services/api');

    // Map period to preset
    const presetMap: Record<string, string> = {
      all_time: 'all_time',
      current_week: 'current_week',
      current_month: 'current_month',
      '90d': 'last_3_months'
    };

    const params: Record<string, string> = {};

    // Use custom filters if set, otherwise use preset
    if (period === 'custom' && customFilters.value) {
      if (customFilters.value.startDate) {
        params.start_date = customFilters.value.startDate;
      }
      if (customFilters.value.endDate) {
        params.end_date = customFilters.value.endDate;
      }
      if (customFilters.value.walletIds.length > 0) {
        params.wallet_ids = customFilters.value.walletIds.join(',');
      }
    } else {
      if (presetMap[period]) {
        params.preset = presetMap[period];
      }
      if (walletId) {
        params.wallet_ids = String(walletId);
      }
    }

    const response = await api.stats.fetch(params);
    const data = response.data;

    // Transform API response to WalletStatistics format
    return {
      total_balance: data.overview.net_cash_flow,
      total_income: data.overview.total_income,
      total_expenses: data.overview.total_expenses,
      transaction_count: 0,
      unique_parties: 0,
      period,
      wallet_id: walletId,
      wallet_name: walletId ? wallets.value.find((w) => w.id === walletId)?.name : 'All Wallets',
      last_updated: new Date().toISOString(),

      income_insights: {
        total: data.overview.total_income,
        biggest_source: data.charts?.party_income?.[0]
          ? {
              party: data.charts.party_income[0].name,
              amount: data.charts.party_income[0].amount,
              percentage: data.charts.party_income[0].percentage,
              transaction_count: data.charts.party_income[0].transaction_count || 0
            }
          : null,
        biggest_category: data.top_categories?.income?.[0]
          ? {
              category: data.top_categories.income[0].name,
              amount: data.top_categories.income[0].amount,
              percentage: data.top_categories.income[0].percentage,
              transaction_count: 0
            }
          : null,
        top_sources: (data.charts?.party_income || []).slice(0, 5).map((p: any) => ({
          party: p.name,
          amount: p.amount,
          percentage: p.percentage,
          transaction_count: p.transaction_count || 0
        })),
        top_categories: (data.top_categories?.income || []).map((c: any) => ({
          category: c.name,
          amount: c.amount,
          percentage: c.percentage,
          transaction_count: 0,
          type: 'INCOME' as const
        })),
        average_transaction: 0,
        frequency_analysis: {
          daily_average: 0,
          weekly_average: 0,
          monthly_average: data.overview.avg_monthly_income
        },
        growth_trends: {
          current_vs_previous: data.comparisons?.previous_period?.income_change_percent || 0,
          trend_direction:
            (data.comparisons?.previous_period?.income_change_percent || 0) > 5
              ? 'up'
              : (data.comparisons?.previous_period?.income_change_percent || 0) < -5
                ? 'down'
                : 'stable',
          momentum: 'steady'
        }
      },

      expense_insights: {
        total: data.overview.total_expenses,
        biggest_expense: data.charts?.party_spending?.[0]
          ? {
              party: data.charts.party_spending[0].name,
              amount: data.charts.party_spending[0].amount,
              percentage: data.charts.party_spending[0].percentage,
              transaction_count: data.charts.party_spending[0].transaction_count || 0
            }
          : null,
        biggest_category: data.top_categories?.expenses?.[0]
          ? {
              category: data.top_categories.expenses[0].name,
              amount: data.top_categories.expenses[0].amount,
              percentage: data.top_categories.expenses[0].percentage,
              transaction_count: 0
            }
          : null,
        top_destinations: (data.charts?.party_spending || []).slice(0, 5).map((p: any) => ({
          party: p.name,
          amount: p.amount,
          percentage: p.percentage,
          transaction_count: p.transaction_count || 0
        })),
        top_categories: (data.top_categories?.expenses || []).map((c: any) => ({
          category: c.name,
          amount: c.amount,
          percentage: c.percentage,
          transaction_count: 0,
          type: 'EXPENSE' as const
        })),
        average_transaction: 0,
        spending_patterns: {
          daily_average: 0,
          weekly_average: 0,
          monthly_average: data.overview.avg_monthly_expenses
        },
        budget_analysis: {
          expense_ratio:
            data.overview.total_income > 0
              ? data.overview.total_expenses / data.overview.total_income
              : 0,
          savings_rate: data.overview.savings_rate / 100,
          risk_level:
            data.overview.savings_rate < 10
              ? 'high'
              : data.overview.savings_rate < 30
                ? 'medium'
                : 'low'
        }
      },

      category_breakdown: {
        income_categories: (data.charts?.income_sources || []).map((c: any) => ({
          category: c.name,
          amount: c.amount,
          percentage: c.percentage,
          transaction_count: c.transaction_count || 0,
          type: 'INCOME' as const
        })),
        expense_categories: (data.charts?.category_spending || []).map((c: any) => ({
          category: c.name,
          amount: c.amount,
          percentage: c.percentage,
          transaction_count: c.transaction_count || 0,
          type: 'EXPENSE' as const
        })),
        most_used_category: null
      },

      party_breakdown: {
        income_sources: (data.charts?.party_income || []).map((p: any) => ({
          party: p.name,
          amount: p.amount,
          percentage: p.percentage,
          transaction_count: p.transaction_count || 0
        })),
        expense_destinations: (data.charts?.party_spending || []).map((p: any) => ({
          party: p.name,
          amount: p.amount,
          percentage: p.percentage,
          transaction_count: p.transaction_count || 0
        })),
        most_frequent_party: null
      },

      time_analysis: {
        monthly_trends: (data.charts?.monthly_cash_flow || []).map((m: any) => ({
          month: m.period,
          income: m.income,
          expenses: m.expense,
          net: m.net
        })),
        busiest_day: 'Monday',
        transaction_frequency: { per_day: 0, per_week: 0, per_month: 0 }
      },

      performance: {
        growth_percentage: data.comparisons?.previous_period?.income_change_percent || 0,
        velocity: 0,
        efficiency: data.overview.savings_rate / 100,
        consistency: 0
      },

      insights: { key_observations: [], recommendations: [], alerts: [], opportunities: [] }
    };
  };

  const getStatistics = async (
    walletId: number | null = null,
    period: string = 'all_time'
  ): Promise<WalletStatistics> => {
    if (USE_API_STATISTICS) {
      try {
        return await fetchStatisticsFromAPI(walletId, period);
      } catch (err) {
        console.warn('API statistics failed, falling back to client-side calculation:', err);
        return await calculateStatistics(walletId, period);
      }
    } else {
      return await calculateStatistics(walletId, period);
    }
  };

  const currentStatistics = ref<WalletStatistics | null>(null);

  const updateCurrentStatistics = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      currentStatistics.value = await getStatistics(selectedWalletId.value, currentPeriod.value);
    } catch (err) {
      console.error('Error loading current statistics:', err);
      error.value = 'Failed to load statistics';
      currentStatistics.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  // Watch for changes in selected wallet, period, custom filters, AND when the underlying data becomes available
  watch(
    [selectedWalletId, currentPeriod, customFilters, transactions, wallets],
    updateCurrentStatistics,
    {
      immediate: true,
      deep: true
    }
  );

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    const rounded = Math.round(amount * 100) / 100;
    return formatAmount(`${rounded} ${currency}`, {
      compact: false,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatCompactCurrency = (amount: number, currency: string = 'USD'): string => {
    const rounded = Math.round(amount * 100) / 100;
    return formatShortAmount(`${rounded} ${currency}`);
  };

  const setSelectedWallet = (walletId: number | null) => {
    selectedWalletId.value = walletId;
  };

  const setPeriod = (period: string) => {
    console.log('[Statistics] Setting period to:', period);
    currentPeriod.value = period;
  };

  const setCustomFilters = (filters: CustomFilters) => {
    console.log('[Statistics] Setting custom filters:', filters);
    customFilters.value = filters;
    currentPeriod.value = 'custom';
  };

  const clearCustomFilters = () => {
    customFilters.value = null;
    currentPeriod.value = 'all_time';
  };

  const availableWallets = computed(() => {
    return [
      { id: null, name: 'All Wallets', currency: getDefaultCurrency.value },
      ...wallets.value.map((w) => ({ id: w.id, name: w.name, currency: w.currency }))
    ];
  });

  return {
    currentPeriod,
    selectedWalletId,
    customFilters,
    isLoading,
    error,

    currentStatistics,
    availableWallets,
    availablePeriods: AVAILABLE_PERIODS,

    getStatistics,
    setSelectedWallet,
    setPeriod,
    setCustomFilters,
    clearCustomFilters,
    formatCurrency,
    formatCompactCurrency,

    USE_API_STATISTICS
  };
};
