import { ref, computed, watch } from 'vue';
import { useTransactions } from '~/composables/useTransactions';
import { useWallets } from '~/composables/useWallets';
import { useSharedData } from '~/composables/useSharedData';
import type { FrontendTransaction } from '~/types/transaction';
import { parseAmount, formatAmount, formatShortAmount } from '@/utils/currency';

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

export interface IncomeInsights {
  total: number;
  biggest_source: PartyBreakdown | null;
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
const USE_API_STATISTICS = false; // TODO: Set to true when backend endpoint is ready

// Simple currency conversion rates (should come from API in production)
const CURRENCY_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.85,
  XAF: 600.0,
  GBP: 0.75,
  CAD: 1.35
};

// Available time periods
const AVAILABLE_PERIODS: StatisticsPeriod[] = [
  { label: 'All time', value: 'all_time', days: 0 },
  { label: 'This week', value: 'current_week', days: 0 },
  { label: 'This month', value: 'current_month', days: 0 },
  { label: 'Last 3 months', value: '90d', days: 90 },
  { label: 'Custom', value: 'custom', days: 0 }
];

const currentPeriod = ref<string>('all_time');
const selectedWalletId = ref<number | null>(null); // null = all wallets
const isLoading = ref(false);
const error = ref<string | null>(null);

export const useStatistics = () => {
  const { transactions } = useTransactions();
  const { wallets } = useWallets();

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

    const { getDefaultCurrency } = useSharedData();
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
      const date = new Date(t.date);
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
      const txnDate = new Date(t.date);
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
      const txnDate = new Date(t.date);
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

  // Future API-based statistics (ready for backend integration)
  const fetchStatisticsFromAPI = async (
    walletId: number | null,
    period: string
  ): Promise<WalletStatistics> => {
    try {
      isLoading.value = true;
      error.value = null;

      // TODO: Implement when backend statistics endpoint is available
      const response = await api.statistics.fetch({
        wallet_id: walletId,
        period: period,
        include_insights: true,
        include_breakdowns: true
      });
      return response.data;

      return await calculateStatistics(walletId, period);
    } catch (err) {
      console.error('Error fetching statistics from API:', err);
      error.value = 'Failed to fetch statistics';
      return await calculateStatistics(walletId, period);
    } finally {
      isLoading.value = false;
    }
  };

  const getStatistics = async (
    walletId: number | null = null,
    period: string = 'all_time'
  ): Promise<WalletStatistics> => {
    if (USE_API_STATISTICS) {
      return await fetchStatisticsFromAPI(walletId, period);
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

  // Watch for changes in selected wallet, period, AND when the underlying data becomes available
  watch([selectedWalletId, currentPeriod, transactions, wallets], updateCurrentStatistics, {
    immediate: true
  });

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

  const availableWallets = computed(() => {
    const { getDefaultCurrency } = useSharedData();
    return [
      { id: null, name: 'All Wallets', currency: getDefaultCurrency.value },
      ...wallets.value.map((w) => ({ id: w.id, name: w.name, currency: w.currency }))
    ];
  });

  return {
    currentPeriod,
    selectedWalletId,
    isLoading,
    error,

    currentStatistics,
    availableWallets,
    availablePeriods: AVAILABLE_PERIODS,

    getStatistics,
    setSelectedWallet,
    setPeriod,
    formatCurrency,
    formatCompactCurrency,

    USE_API_STATISTICS
  };
};
