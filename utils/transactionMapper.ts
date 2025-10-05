import type {
  ApiTransaction,
  FrontendTransaction,
  TransactionCreatePayload
} from '~/types/transaction';
import type { Party } from '~/types/party';
import type { Category } from '~/types/category';
import type { Wallet } from '~/types/wallet';
type GroupLite = { id: number; name: string };

/**
 * Transaction Mapper Utility
 * Transforms data between API format and Frontend/UI format
 */
export const transactionMapper = {
  /**
   * Transform API transaction to Frontend format
   * @param api - Transaction from API (now includes nested objects)
   * @param parties - List of parties for fallback lookup (optional)
   * @param categories - List of categories for fallback lookup (optional)
   * @param wallets - List of wallets for fallback lookup (optional)
   * @param groups - List of groups for fallback lookup (optional)
   * @returns Frontend transaction object
   */
  toFrontend(
    api: ApiTransaction,
    parties: Party[] = [],
    categories: Category[] = [],
    wallets: Wallet[] = [],
    groups: GroupLite[] = []
  ): FrontendTransaction {
    // Split ISO datetime into date and time
    const dt = new Date(api.datetime);
    const date = dt.toISOString().slice(0, 10); // YYYY-MM-DD
    const time = dt.toTimeString().slice(0, 5); // HH:mm

    // Use nested party object if available, otherwise lookup
    const party =
      api.party ||
      parties.find((p) => p.sync_state?.client_generated_id === api.party_client_generated_id);

    // Use nested wallet object if available, otherwise lookup
    const wallet =
      api.wallet ||
      wallets.find((w) => w.sync_state?.client_generated_id === api.wallet_client_generated_id);

    // Use nested group object if available, otherwise lookup
    const group = api.group || groups.find((g) => g.id === api.group_id);

    // Use nested categories array if available, otherwise lookup
    const transactionCategories = api.categories || [];
    const categoryNames = transactionCategories.map((cat) => cat.name).join(', ');

    // Get currency from wallet or default to XAF
    const currency = wallet?.currency || 'XAF';

    return {
      id: String(api.id),
      date,
      time,
      type: api.type.toUpperCase() as 'INCOME' | 'EXPENSE',
      party: party?.name || '',
      partyId: api.party_client_generated_id,
      amount: `${api.amount} ${currency}`,
      // Display: show group then categories
      category: group?.name || categoryNames || 'Uncategorized',
      groupId: api.group_id,
      categoryIds: transactionCategories.map((cat) => cat.id),
      wallet: wallet?.name || '',
      walletId: api.wallet_client_generated_id,
      description: api.description || '',
      isRecurring: api.is_recurring || false,
      files: api.files || []
    };
  },

  /**
   * Transform API transaction to Edit Form format (no display defaults)
   * @param api - Transaction from API
   * @param parties - List of parties for name lookup
   * @param wallets - List of wallets for name lookup
   * @returns Edit form transaction object with empty strings instead of defaults
   */
  toEditForm(
    api: ApiTransaction,
    parties: Party[] = [],
    wallets: Wallet[] = []
  ): FrontendTransaction {
    // Split ISO datetime into date and time
    const dt = new Date(api.datetime);
    const date = dt.toISOString().slice(0, 10); // YYYY-MM-DD
    const time = dt.toTimeString().slice(0, 5); // HH:mm

    // Use nested party object if available, otherwise lookup
    const party =
      api.party ||
      parties.find((p) => p.sync_state?.client_generated_id === api.party_client_generated_id);

    // Use nested wallet object if available, otherwise lookup
    const wallet =
      api.wallet ||
      wallets.find((w) => w.sync_state?.client_generated_id === api.wallet_client_generated_id);

    // Use nested categories array if available
    const transactionCategories = api.categories || [];

    return {
      id: String(api.id),
      date,
      time,
      type: api.type.toUpperCase() as 'INCOME' | 'EXPENSE',
      party: party?.name || '', // Empty string for edit form
      partyId: api.party_client_generated_id,
      amount: String(api.amount), // Just the number for editing
      category: '', // Not used in edit form
      groupId: api.group_id,
      categoryIds: transactionCategories.map((cat) => cat.id),
      wallet: wallet?.name || '',
      walletId: api.wallet_client_generated_id,
      description: api.description || '',
      isRecurring: api.is_recurring || false,
      files: api.files || []
    };
  },

  /**
   * Transform Frontend transaction to API payload
   * @param frontend - Transaction from UI
   * @param currentDatetime - Optional override for datetime (for updates)
   * @param parties - List of parties for ID lookup
   * @param wallets - List of wallets for ID lookup
   * @returns API create/update payload
   */
  toApi(
    frontend: Partial<FrontendTransaction>,
    parties: Party[] = [],
    wallets: Wallet[] = [],
    currentDatetime?: string,
    defaultGroup?: { id: number; name: string }
  ): TransactionCreatePayload {
    // Combine date + time into ISO datetime with timezone
    let datetime: string;
    if (currentDatetime) {
      datetime = currentDatetime;
    } else if (frontend.date && frontend.time) {
      // Create full ISO 8601 datetime with timezone
      // Format: YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DDTHH:mm:ss+00:00
      const localDateTime = new Date(`${frontend.date}T${frontend.time}:00`);
      datetime = localDateTime.toISOString();
    } else {
      // Fallback to current datetime
      datetime = new Date().toISOString();
    }

    // Parse amount string to number (remove non-numeric except decimal)
    const amountStr = frontend.amount || '0';
    const amount = parseFloat(amountStr.replace(/[^\d.]/g, '')) || 0;

    let partyId = null;
    let walletId = null;

    if (frontend.partyId) {
      let party = parties.find((p) => p.sync_state?.client_generated_id === frontend.partyId);

      if (!party) {
        const numericId = parseInt(frontend.partyId);
        if (!isNaN(numericId)) {
          party = parties.find((p) => p.id === numericId);
        }
      }

      if (party) {
        partyId = party.id;
      }
    }

    if (frontend.walletId) {
      let wallet = wallets.find((w) => w.sync_state?.client_generated_id === frontend.walletId);

      if (!wallet) {
        const numericId = parseInt(frontend.walletId);
        if (!isNaN(numericId)) {
          wallet = wallets.find((w) => w.id === numericId);
        }
      }

      if (wallet) {
        walletId = wallet.id;
      }
    }

    // Only assign default wallet if one is explicitly configured
    if (walletId === null && wallets.length > 0) {
      // Try to find a wallet marked as default first
      const defaultWallet = wallets.find(
        (wallet) => wallet.name.toLowerCase().includes('default') || wallet.is_default === true
      );
      if (defaultWallet) {
        walletId = defaultWallet.id;
      }
      // Otherwise leave as null - backend should handle this case
    }

    const groupId = frontend.groupId || defaultGroup?.id || null;

    const payload = {
      amount,
      type: (frontend.type?.toLowerCase() as 'income' | 'expense') || 'income',
      description: frontend.description || '',
      datetime,
      party_id: partyId,
      wallet_id: walletId,
      group_id: groupId,
      categories:
        frontend.categoryIds && frontend.categoryIds.length > 0 ? frontend.categoryIds : [],
      files: frontend.filesToUpload || []
    };

    return payload;
  },

  /**
   * Batch transform API transactions to Frontend format
   */
  toFrontendBatch(
    apiTransactions: ApiTransaction[],
    parties: Party[],
    categories: Category[],
    wallets: Wallet[],
    groups: GroupLite[]
  ): FrontendTransaction[] {
    return apiTransactions.map((api) => this.toFrontend(api, parties, categories, wallets, groups));
  },

  /**
   * Helper: Parse amount string to number
   * Handles formats like "5000 XAF", "5,000.50", "$5000"
   */
  parseAmount(amountStr: string): number {
    const cleaned = amountStr.replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
  },

  /**
   * Helper: Format number to amount string with currency
   */
  formatAmount(amount: number, currency: string = 'XAF'): string {
    return `${amount} ${currency}`;
  },

  /**
   * Helper: Combine date and time into ISO datetime
   */
  combineDatetime(date: string, time: string): string {
    return `${date}T${time}:00`;
  },

  /**
   * Helper: Split ISO datetime into date and time
   */
  splitDatetime(datetime: string): { date: string; time: string } {
    const dt = new Date(datetime);
    return {
      date: dt.toISOString().slice(0, 10), // YYYY-MM-DD
      time: dt.toTimeString().slice(0, 5) // HH:mm
    };
  }
};
