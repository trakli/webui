// `icon` is a lucide-vue-next component name. Prompts are canonical English
// (user-message content sent to the assistant), so they are not routed through i18n.
export interface Suggestion {
  text: string;
  icon: string;
}

export const SUGGESTIONS: Suggestion[] = [
  // Spending overview
  { text: 'How much did I spend last month?', icon: 'Wallet' },
  { text: 'What did I spend the most on this month?', icon: 'TrendingDown' },
  { text: 'Where is my money actually going?', icon: 'PieChart' },
  { text: 'Show my spending week by week', icon: 'CalendarDays' },
  { text: 'How does this month compare to last month?', icon: 'GitCompareArrows' },
  { text: 'What was my biggest purchase this month?', icon: 'Receipt' },
  { text: 'Am I spending more than usual lately?', icon: 'TrendingUp' },
  { text: 'Break down my spending by category', icon: 'ChartColumnBig' },
  { text: 'What percent of my income did I spend?', icon: 'Percent' },
  { text: 'Show me every expense over 100 this month', icon: 'Banknote' },

  // Food & dining
  { text: 'How much do I spend on coffee?', icon: 'Coffee' },
  { text: 'What did I spend eating out this month?', icon: 'Utensils' },
  { text: 'How much went to groceries?', icon: 'ShoppingCart' },
  { text: 'Am I ordering too much takeout?', icon: 'Pizza' },

  // Transport
  { text: 'What did I spend on transport this month?', icon: 'Car' },
  { text: 'How much went to fuel?', icon: 'Fuel' },
  { text: 'Show my ride and taxi spending', icon: 'CarTaxiFront' },
  { text: 'How much do I spend commuting?', icon: 'TrainFront' },

  // Home & bills
  { text: 'What are my recurring bills?', icon: 'Repeat' },
  { text: 'How much goes to rent each month?', icon: 'House' },
  { text: 'What do my utilities cost me?', icon: 'Plug' },
  { text: 'Show my phone and internet spending', icon: 'Smartphone' },
  { text: 'Which bills went up recently?', icon: 'ArrowUpRight' },

  // Subscriptions
  { text: 'List all my subscriptions', icon: 'CreditCard' },
  { text: 'Which subscriptions could I cancel?', icon: 'Scissors' },
  { text: 'How much do subscriptions cost me a year?', icon: 'CalendarClock' },
  { text: 'Did any subscription charge me twice?', icon: 'CopyCheck' },

  // Shopping & lifestyle
  { text: 'How much did I spend shopping this month?', icon: 'ShoppingBag' },
  { text: 'What did I spend on clothes?', icon: 'Shirt' },
  { text: 'Show my entertainment spending', icon: 'Tv' },
  { text: 'How much went to gaming?', icon: 'Gamepad2' },
  { text: 'What do I spend on the gym and fitness?', icon: 'Dumbbell' },
  { text: 'How much did I spend on gifts?', icon: 'Gift' },
  { text: 'Show my travel spending this year', icon: 'Plane' },
  { text: 'What did I spend on health and pharmacy?', icon: 'HeartPulse' },
  { text: 'How much goes to my pet?', icon: 'Dog' },
  { text: 'What did I spend on books and learning?', icon: 'BookOpen' },

  // Income
  { text: 'How much did I earn this month?', icon: 'Banknote' },
  { text: "What's my main source of income?", icon: 'Briefcase' },
  { text: 'Is my income growing over time?', icon: 'TrendingUp' },
  { text: 'When did I last get paid?', icon: 'CalendarCheck' },
  { text: 'Show my income by source', icon: 'Coins' },
  { text: 'Did I have any unusual income this month?', icon: 'Sparkle' },

  // Savings & budget
  { text: "What's my savings rate this month?", icon: 'PiggyBank' },
  { text: 'How much could I realistically save?', icon: 'Target' },
  { text: 'Where can I cut back without hurting much?', icon: 'Scissors' },
  { text: 'Am I on track to save this year?', icon: 'Goal' },
  { text: 'How much do I have left to spend this month?', icon: 'Gauge' },
  { text: 'Build me a simple budget from my history', icon: 'NotebookPen' },
  { text: 'How many months of expenses do I have saved?', icon: 'Shield' },

  // Trends & forecasting
  { text: 'Predict my spending for next month', icon: 'ChartLine' },
  { text: 'What is my average daily spend?', icon: 'CalendarDays' },
  { text: 'Which day of the week do I spend most?', icon: 'CalendarRange' },
  { text: 'Show my cashflow over the last 6 months', icon: 'Activity' },
  { text: 'Has my biggest category changed this year?', icon: 'ArrowLeftRight' },
  { text: 'Flag anything unusual in my spending', icon: 'TriangleAlert' },
  { text: 'What is my net worth trend?', icon: 'ChartArea' },

  // Wallets & transfers
  { text: 'Which wallet has the most money?', icon: 'Wallet' },
  { text: 'Show the balance of all my wallets', icon: 'Wallet' },
  { text: 'How much did I move between wallets?', icon: 'ArrowRightLeft' },
  { text: 'Which wallet do I spend from most?', icon: 'WalletCards' },
  { text: 'Transfer 50 from Cash to Savings', icon: 'ArrowLeftRight' },

  // Parties & merchants
  { text: 'Who do I pay the most each month?', icon: 'Store' },
  { text: 'Show everything I paid to my landlord', icon: 'House' },
  { text: 'List my top 5 merchants this month', icon: 'Tags' },
  { text: 'How much have I paid this person in total?', icon: 'UserRound' },

  // Logging actions
  { text: 'Log 20 for coffee from Cash', icon: 'Coffee' },
  { text: 'Log 12 for lunch from my card', icon: 'Utensils' },
  { text: 'Add 40 groceries to Main wallet', icon: 'ShoppingCart' },
  { text: 'Record 1500 salary as income', icon: 'Banknote' },
  { text: 'Add a 9.99 monthly subscription', icon: 'CreditCard' },
  { text: 'Log 30 fuel from Cash', icon: 'Fuel' },
  { text: 'Add a 200 expense for new shoes', icon: 'Shirt' },

  // Categories & cleanup
  { text: 'Which categories do I never use?', icon: 'FolderMinus' },
  { text: 'Suggest categories for my recent transactions', icon: 'WandSparkles' },
  { text: 'How many transactions did I make this month?', icon: 'Hash' },
  { text: 'Find transactions I might have miscategorised', icon: 'SearchCheck' },

  // Imports & receipts
  { text: 'Import my bank statement', icon: 'FileUp' },
  { text: 'Read this receipt and log it', icon: 'ScanLine' },
  { text: 'Turn this CSV into transactions', icon: 'FileSpreadsheet' },
  { text: 'Match my imported transactions to wallets', icon: 'GitMerge' },

  // Goals & advice
  { text: 'How long until I can save 1000?', icon: 'Target' },
  { text: 'Give me one tip to improve my finances', icon: 'Lightbulb' },
  { text: 'What habit is costing me the most?', icon: 'Hourglass' },
  { text: 'Roast my spending this month', icon: 'Flame' },
  { text: 'Show me a win from this month', icon: 'PartyPopper' },
  { text: 'What should I look at first?', icon: 'Compass' },

  // Time-bound
  { text: 'What did I spend today?', icon: 'Sun' },
  { text: 'Show this week so far', icon: 'CalendarDays' },
  { text: 'How was my spending this weekend?', icon: 'Coffee' },
  { text: 'Compare this quarter to last quarter', icon: 'GitCompareArrows' },
  { text: 'What did I spend on my last trip?', icon: 'Plane' },

  // Reflective
  { text: 'Did I stick to my usual spending this month?', icon: 'CircleCheck' },
  { text: 'What surprised me financially this month?', icon: 'Sparkles' },
  { text: 'Summarise my month in three lines', icon: 'NotebookPen' },
  { text: 'Am I better off than last month?', icon: 'Scale' }
];

// Fisher-Yates with an injectable rng so it is testable; landing passes Math.random.
export function pickSuggestions(
  count: number,
  rng: () => number = Math.random,
  pool: Suggestion[] = SUGGESTIONS
): Suggestion[] {
  const items = pool.slice();
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items.slice(0, Math.min(count, items.length));
}
