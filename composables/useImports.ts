import type {
  ImportSession,
  SuggestionWithDuplicate,
  ConfirmPayload,
  ConfirmResponse
} from '~/types/import';
import { api } from '~/services/api';
import { extractApiErrors } from '~/utils/apiErrors';

const POLL_INTERVAL = 3000;

export const useImports = () => {
  const currentSession = ref<ImportSession | null>(null);
  const suggestions = ref<SuggestionWithDuplicate[]>([]);
  const isAnalyzing = ref(false);
  const isConfirming = ref(false);
  const error = ref<string | null>(null);

  let pollTimer: ReturnType<typeof setInterval> | null = null;

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
    suggestions.value = (session.suggestions || []).map((s, index) => ({
      ...s,
      status: s.duplicate?.match_type === 'exact' ? ('rejected' as const) : ('accepted' as const),
      edited: false,
      index
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

        // Update session so UI can react to stage changes
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
        // else still processing (analyzing/extracting/enriching/checking) — keep polling
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
        // Synchronous completion (e.g. fast CSV)
        isAnalyzing.value = false;
        populateSuggestions(session);
      } else if (session.status === 'failed') {
        isAnalyzing.value = false;
        error.value = session.metadata?.error || 'Analysis failed';
        currentSession.value = null;
      } else {
        // Async — poll for completion
        pollSession(session.id);
      }
    } catch (err: unknown) {
      error.value = extractApiErrors(err);
      currentSession.value = null;
      suggestions.value = [];
      isAnalyzing.value = false;
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

  const confirmImport = async (): Promise<ConfirmResponse | null> => {
    if (!currentSession.value) return null;

    isConfirming.value = true;
    error.value = null;

    const accepted: ConfirmPayload['accepted'] = suggestions.value
      .filter((s) => s.status === 'accepted')
      .map((s) => {
        const item: ConfirmPayload['accepted'][number] = { index: s.index };
        if (s.edited) {
          if (s.amount !== null) item.amount = s.amount;
          if (s.currency) item.currency = s.currency ?? undefined;
          if (s.type) item.type = s.type;
          if (s.party) item.party = s.party;
          if (s.wallet) item.wallet = s.wallet;
          if (s.category) item.category = s.category;
          if (s.description) item.description = s.description;
          if (s.date) item.date = s.date;
        }
        return item;
      });

    try {
      const result = await api.imports.confirm({
        session_id: currentSession.value.id,
        accepted
      });
      currentSession.value.status = 'confirmed';
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

  // Clean up polling on unmount
  if (import.meta.client) {
    onUnmounted(() => stopPolling());
  }

  return {
    currentSession,
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
    reset
  };
};
