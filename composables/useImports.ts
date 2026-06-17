import type {
  AutoCreateOptions,
  ImportSession,
  SuggestionWithDuplicate,
  ConfirmPayload,
  ConfirmResponse
} from '~/types/import';
import { api } from '~/services/api';
import { extractApiErrors } from '~/utils/apiErrors';

const POLL_INTERVAL = 3000;

const IN_PROGRESS_STATUSES = ['analyzing', 'extracting', 'enriching', 'checking'];

export const useImports = () => {
  const currentSession = ref<ImportSession | null>(null);
  const sessions = ref<ImportSession[]>([]);
  const suggestions = ref<SuggestionWithDuplicate[]>([]);
  const isAnalyzing = ref(false);
  const isConfirming = ref(false);
  const error = ref<string | null>(null);

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let listTimer: ReturnType<typeof setInterval> | null = null;

  const acceptedCount = computed(
    () => suggestions.value.filter((s) => s.status === 'accepted').length
  );
  const rejectedCount = computed(
    () => suggestions.value.filter((s) => s.status === 'rejected').length
  );
  const pendingCount = computed(
    () => suggestions.value.filter((s) => s.status === 'pending').length
  );
  const duplicateCount = computed(
    () => suggestions.value.filter((s) => s.duplicate !== null).length
  );

  const populateSuggestions = (session: ImportSession) => {
    currentSession.value = session;
    // wallet_id / party_id / category_id start as null. The page wires up a
    // reactive resolver that fills them in once the wallets/parties/categories
    // caches load -- doing it here would freeze a snapshot and miss late loads.
    suggestions.value = (session.suggestions || []).map((s, index) => ({
      ...s,
      status: s.duplicate?.match_type === 'exact' ? ('rejected' as const) : ('accepted' as const),
      edited: false,
      index,
      wallet_id: null,
      party_id: null,
      category_id: null
    }));
  };

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  const pollSession = (sessionId: number) => {
    stopPolling();

    pollTimer = setInterval(async () => {
      try {
        const session = await api.imports.getSession(sessionId);

        currentSession.value = session;

        if (session.status === 'ready') {
          stopPolling();
          isAnalyzing.value = false;
          populateSuggestions(session);
        } else if (session.status === 'failed') {
          stopPolling();
          isAnalyzing.value = false;
          error.value = session.metadata?.error || 'Analysis failed';
          currentSession.value = null;
        }
      } catch {
        stopPolling();
        isAnalyzing.value = false;
        error.value = 'Lost connection while checking analysis status';
      }
    }, POLL_INTERVAL);
  };

  const analyzeFile = async (file: File, documentType?: string) => {
    isAnalyzing.value = true;
    error.value = null;
    currentSession.value = null;
    suggestions.value = [];

    try {
      const session = await api.imports.analyze(file, documentType);
      currentSession.value = session;

      if (session.status === 'ready') {
        isAnalyzing.value = false;
        populateSuggestions(session);
      } else if (session.status === 'failed') {
        isAnalyzing.value = false;
        error.value = session.metadata?.error || 'Analysis failed';
        currentSession.value = null;
      } else {
        pollSession(session.id);
      }
    } catch (err: unknown) {
      error.value = extractApiErrors(err);
      currentSession.value = null;
      suggestions.value = [];
      isAnalyzing.value = false;
    }
  };

  const stopListPolling = () => {
    if (listTimer) {
      clearInterval(listTimer);
      listTimer = null;
    }
  };

  const loadSessions = async () => {
    try {
      sessions.value = await api.imports.getSessions();
    } catch {
      // Non-fatal: leave the list as-is and let the user retry.
      return;
    }

    // Keep badges fresh while any import is still analyzing.
    const anyInProgress = () => sessions.value.some((s) => IN_PROGRESS_STATUSES.includes(s.status));
    if (anyInProgress() && !listTimer) {
      listTimer = setInterval(async () => {
        try {
          sessions.value = await api.imports.getSessions();
        } catch {
          stopListPolling();
          return;
        }
        if (!anyInProgress()) stopListPolling();
      }, POLL_INTERVAL);
    } else if (!anyInProgress()) {
      stopListPolling();
    }
  };

  const removeSession = async (id: number) => {
    await api.imports.deleteSession(id);
    sessions.value = sessions.value.filter((s) => s.id !== id);
  };

  const openSession = async (id: number) => {
    error.value = null;
    isAnalyzing.value = false;

    try {
      const session = await api.imports.getSession(id);
      currentSession.value = session;

      if (session.status === 'ready' || session.status === 'confirmed') {
        populateSuggestions(session);
      } else if (session.status === 'failed') {
        error.value = session.metadata?.error || 'Analysis failed';
        currentSession.value = null;
      } else if (IN_PROGRESS_STATUSES.includes(session.status)) {
        isAnalyzing.value = true;
        pollSession(id);
      }
    } catch (err: unknown) {
      error.value = extractApiErrors(err);
      currentSession.value = null;
    }
  };

  const acceptSuggestion = (index: number) => {
    const s = suggestions.value.find((s) => s.index === index);
    if (s) s.status = 'accepted';
  };

  const rejectSuggestion = (index: number) => {
    const s = suggestions.value.find((s) => s.index === index);
    if (s) s.status = 'rejected';
  };

  const toggleSuggestion = (index: number) => {
    const s = suggestions.value.find((s) => s.index === index);
    if (s) {
      s.status = s.status === 'accepted' ? 'rejected' : 'accepted';
    }
  };

  const acceptAll = () => {
    suggestions.value.forEach((s) => {
      s.status = 'accepted';
    });
  };

  const rejectAll = () => {
    suggestions.value.forEach((s) => {
      s.status = 'rejected';
    });
  };

  const editSuggestion = (index: number, edits: Partial<SuggestionWithDuplicate>) => {
    const s = suggestions.value.find((s) => s.index === index);
    if (s) {
      Object.assign(s, edits, { edited: true });
    }
  };

  const confirmImport = async (
    autoCreate: AutoCreateOptions = { wallets: false, parties: false, categories: false }
  ): Promise<ConfirmResponse | null> => {
    if (!currentSession.value) return null;

    isConfirming.value = true;
    error.value = null;

    const accepted: ConfirmPayload['accepted'] = [];
    for (const s of suggestions.value) {
      if (s.status !== 'accepted') continue;

      const item: ConfirmPayload['accepted'][number] = { index: s.index };
      if (s.wallet_id != null) item.wallet_id = s.wallet_id;
      if (s.party_id != null) item.party_id = s.party_id;
      if (s.category_id != null) item.category_id = s.category_id;
      if (s.edited) {
        if (s.amount != null) item.amount = s.amount;
        if (s.type) item.type = s.type;
        if (s.description != null) item.description = s.description;
        if (s.date) item.date = s.date;
      }
      accepted.push(item);
    }

    try {
      const result = await api.imports.confirm({
        session_id: currentSession.value.id,
        accepted,
        auto_create_wallets: autoCreate.wallets,
        auto_create_parties: autoCreate.parties,
        auto_create_categories: autoCreate.categories
      });
      if (result.errors.length === 0) {
        currentSession.value.status = 'confirmed';
      }
      return result;
    } catch (err: unknown) {
      error.value = extractApiErrors(err);
      return null;
    } finally {
      isConfirming.value = false;
    }
  };

  const reset = () => {
    stopPolling();
    currentSession.value = null;
    suggestions.value = [];
    error.value = null;
    isAnalyzing.value = false;
    isConfirming.value = false;
  };

  if (import.meta.client) {
    onUnmounted(() => {
      stopPolling();
      stopListPolling();
    });
  }

  return {
    currentSession,
    sessions,
    suggestions,
    isAnalyzing,
    isConfirming,
    error,
    acceptedCount,
    rejectedCount,
    pendingCount,
    duplicateCount,
    analyzeFile,
    acceptSuggestion,
    rejectSuggestion,
    toggleSuggestion,
    acceptAll,
    rejectAll,
    editSuggestion,
    confirmImport,
    loadSessions,
    openSession,
    removeSession,
    reset
  };
};
