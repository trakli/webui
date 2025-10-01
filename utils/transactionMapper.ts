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
   * @param api - Transaction from API
   * @param parties - List of parties for name lookup
   * @param categories - List of categories for name lookup
   * @param wallets - List of wallets for name lookup
   * @returns Frontend transaction object
   */
  toFrontend(
    api: ApiTransaction,
    parties: Party[],
    categories: Category[],
    wallets: Wallet[],
    groups: GroupLite[]
  ): FrontendTransaction {
    // Split ISO datetime into date and time
    const dt = new Date(api.datetime);
    const date = dt.toISOString().slice(0, 10); // YYYY-MM-DD
    const time = dt.toTimeString().slice(0, 5); // HH:mm

    // Find party by client_generated_id (UUID)
    const party = parties.find(
      (p) => p.sync_state?.client_generated_id === api.party_client_generated_id
    );

    // Resolve group name
    const groupName = groups.find((g) => g.id === api.group_id)?.name;

    // Resolve additional category names
    const additionalCategoryNames = (api.categories || [])
      .map((catId) => categories.find((c) => c.id === catId)?.name)
      .filter(Boolean)
      .join(', ');

    // Find wallet by client_generated_id (UUID)
    const wallet = wallets.find(
      (w) => w.sync_state?.client_generated_id === api.wallet_client_generated_id
    );

    // Get currency from wallet or default to XAF
    const currency = wallet?.currency || 'XAF';

    return {
      id: String(api.id),
      date,
      time,
      type: api.type.toUpperCase() as 'INCOME' | 'EXPENSE',
      party: party?.name || 'Unknown',
      partyId: api.party_client_generated_id,
      amount: `${api.amount} ${currency}`,
      // Display: show group then additional categories
      category: groupName || additionalCategoryNames || 'Uncategorized',
      // Keep full IDs for edit: [group_id, ...categories]
      groupId: api.group_id,
      categoryIds: [api.group_id, ...((api.categories || []) as number[])],
      wallet: wallet?.name,
      walletId: api.wallet_client_generated_id,
      description: api.description,
      isRecurring: api.is_recurring,
      files: api.files
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
    currentDatetime?: string
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

    // Look up numeric IDs from parties and wallets
    let partyId = 0;
    let walletId = 0;

    // Find party by UUID or numeric ID string
    if (frontend.partyId) {
      console.log('[Mapper] Looking for party with ID:', frontend.partyId);
      console.log(
        '[Mapper] Available parties:',
        parties.length,
        parties.map((p) => ({ name: p.name, id: p.id, uuid: p.sync_state?.client_generated_id }))
      );

      // Try to find by UUID first, then by numeric ID
      let party = parties.find((p) => p.sync_state?.client_generated_id === frontend.partyId);

      // If not found by UUID, try matching by numeric ID
      if (!party) {
        const numericId = parseInt(frontend.partyId);
        if (!isNaN(numericId)) {
          party = parties.find((p) => p.id === numericId);
        }
      }

      if (party) {
        partyId = party.id; // Use the numeric ID
        console.log('[Mapper] Found party:', party.name, 'ID:', partyId);
      } else {
        console.error('[Mapper] Party NOT FOUND for ID:', frontend.partyId);
      }
    } else {
      console.warn('[Mapper] frontend.partyId is empty/undefined');
    }

    // Find wallet by UUID or numeric ID string
    if (frontend.walletId) {
      console.log('[Mapper] Looking for wallet with ID:', frontend.walletId);
      console.log(
        '[Mapper] Available wallets:',
        wallets.length,
        wallets.map((w) => ({ name: w.name, id: w.id, uuid: w.sync_state?.client_generated_id }))
      );

      // Try to find by UUID first, then by numeric ID
      let wallet = wallets.find((w) => w.sync_state?.client_generated_id === frontend.walletId);

      // If not found by UUID, try matching by numeric ID
      if (!wallet) {
        const numericId = parseInt(frontend.walletId);
        if (!isNaN(numericId)) {
          wallet = wallets.find((w) => w.id === numericId);
        }
      }

      if (wallet) {
        walletId = wallet.id; // Use the numeric ID
        console.log('[Mapper] Found wallet:', wallet.name, 'ID:', walletId);
      } else {
        console.error('[Mapper] Wallet NOT FOUND for ID:', frontend.walletId);
      }
    } else {
      console.warn('[Mapper] frontend.walletId is empty/undefined');
    }

    // If still no wallet, use first available
    if (walletId === 0 && wallets.length > 0) {
      walletId = wallets[0].id;
      console.log('[Mapper] Auto-selected first wallet:', wallets[0].name, 'ID:', walletId);
    }

    // Determine group id strictly from explicit groupId; do not infer from categories
    const groupId = typeof frontend.groupId === 'number' ? frontend.groupId : 0;

    const payload = {
      amount,
      type: (frontend.type?.toLowerCase() as 'income' | 'expense') || 'income',
      description: frontend.description || '',
      datetime,
      party_id: partyId,
      wallet_id: walletId,
      group_id: groupId,
      // Optional: send categories as provided (do not include group here)
      categories:
        frontend.categoryIds && frontend.categoryIds.length > 0 ? frontend.categoryIds : undefined
    };

    // Validation warnings
    console.log('[Mapper] Validation:');
    console.log('  - Amount:', amount, '(from:', amountStr + ')');
    console.log('  - Type:', payload.type);
    console.log('  - Datetime:', payload.datetime);
    console.log('  - Party ID:', payload.party_id || 'MISSING (0)');
    console.log('  - Wallet ID:', payload.wallet_id || 'MISSING (0)');
    console.log('  - Group ID (primary category):', payload.group_id || 'MISSING (0)');
    if (payload.categories) {
      console.log('  - Additional Categories:', payload.categories);
    }

    if (!payload.party_id) {
      console.warn('[Mapper] Party ID is 0! Backend might reject this.');
    }
    if (!payload.wallet_id) {
      console.warn('[Mapper] Wallet ID is 0! Backend might reject this.');
    }
    if (!payload.group_id) {
      console.warn('[Mapper] Group ID is 0! Backend might reject this.');
    }

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
