import type {
  ApiTransaction,
  FrontendTransaction,
  TransactionCreatePayload
} from '~/types/transaction';
import type { Party } from '~/types/party';
import type { Category } from '~/types/category';
import type { Wallet } from '~/types/wallet';
import { parseAmount as parseAmountUtil } from '@/utils/currency';
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
    _categories: Category[] = [],
    wallets: Wallet[] = [],
    _groups: GroupLite[] = []
  ): FrontendTransaction {
    const dt = new Date(api.datetime);
    // Use local date to avoid timezone issues with filtering
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;
    const time = dt.toTimeString().slice(0, 5);

    const party =
      api.party ||
      (api.party_client_generated_id
        ? parties.find((p) => p.sync_state?.client_generated_id === api.party_client_generated_id)
        : undefined);

    const wallet =
      api.wallet ||
      (api.wallet_client_generated_id
        ? wallets.find((w) => w.sync_state?.client_generated_id === api.wallet_client_generated_id)
        : undefined);

    const transactionCategories = api.categories || [];
    const categoryNames = transactionCategories.map((cat) => cat.name).join(', ');
    const isTransfer = !!api.transfer_id;
    const currency = wallet?.currency || 'XAF';

    if (!wallet) {
      console.warn(
        `[transactionMapper] No wallet found for transaction ${api.id}, wallet_client_generated_id: ${api.wallet_client_generated_id}`
      );
    } else if (api.wallet && !api.wallet.currency) {
      console.warn(
        `[transactionMapper] Transaction ${api.id} has api.wallet but no currency:`,
        api.wallet
      );
    }

    const numericAmount =
      typeof api.amount === 'number' ? api.amount : parseFloat(String(api.amount));
    const formattedAmount = `${numericAmount.toFixed(2)} ${currency}`;

    return {
      id: String(api.id),
      date,
      time,
      type: api.type.toUpperCase() as 'INCOME' | 'EXPENSE',
      party: party?.name || '',
      partyId: party?.id,
      amount: formattedAmount,
      category: categoryNames || (isTransfer ? 'Transfer' : 'Uncategorized'),
      groupId: api.group_id,
      categoryIds: transactionCategories.map((cat) => cat.id),
      wallet: wallet?.name || '',
      walletId: wallet?.id,
      description: api.description || '',
      isRecurring: api.is_recurring || false,
      isTransfer,
      transferId: api.transfer_id || undefined,
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
    const dt = new Date(api.datetime);
    // Use local date to avoid timezone issues
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;
    const time = dt.toTimeString().slice(0, 5);

    const party =
      api.party ||
      (api.party_client_generated_id
        ? parties.find((p) => p.sync_state?.client_generated_id === api.party_client_generated_id)
        : undefined);

    const wallet =
      api.wallet ||
      (api.wallet_client_generated_id
        ? wallets.find((w) => w.sync_state?.client_generated_id === api.wallet_client_generated_id)
        : undefined);

    const transactionCategories = api.categories || [];

    return {
      id: String(api.id),
      date,
      time,
      type: api.type.toUpperCase() as 'INCOME' | 'EXPENSE',
      party: party?.name || '',
      partyId: party?.id,
      amount: String(api.amount),
      category: '',
      groupId: api.group_id,
      categoryIds: transactionCategories.map((cat) => cat.id),
      wallet: wallet?.name || '',
      walletId: wallet?.id,
      description: api.description || '',
      isRecurring: api.is_recurring || false,
      isTransfer: !!api.transfer_id,
      transferId: api.transfer_id || undefined,
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
    _parties: Party[] = [],
    _wallets: Wallet[] = [],
    currentDatetime?: string,
    defaultGroup?: { id: number; name: string },
    defaultWallet?: Wallet | null
  ): TransactionCreatePayload {
    let datetime: string;
    if (currentDatetime) {
      datetime = currentDatetime;
    } else if (frontend.date && frontend.time) {
      const localDateTime = new Date(`${frontend.date}T${frontend.time}:00`);
      datetime = localDateTime.toISOString();
    } else {
      datetime = new Date().toISOString();
    }

    const amountStr = frontend.amount || '0';
    const amount = parseAmountUtil(amountStr).value;

    const partyId: number | null = frontend.partyId || null;
    let walletId: number | null = frontend.walletId || null;

    if (walletId === null && defaultWallet) {
      walletId = defaultWallet.id;
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
   * Helper: Combine date and time into ISO datetime
   */
  combineDatetime(date: string, time: string): string {
    return `${date}T${time}:00`;
  },

  /**
   * Helper: Split ISO datetime into date and time (local timezone)
   */
  splitDatetime(datetime: string): { date: string; time: string } {
    const dt = new Date(datetime);
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return {
      date: `${year}-${month}-${day}`,
      time: dt.toTimeString().slice(0, 5)
    };
  }
};
