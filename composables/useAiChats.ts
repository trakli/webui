import { ref, computed, onMounted, onUnmounted } from 'vue';
import { aiApi, type ChatSession, type FormatType } from '@/services/api/aiApi';

const POLL_INTERVAL_MS = 3000;

export function useAiChats() {
  const sessions = ref<ChatSession[]>([]);
  const currentSession = ref<ChatSession | null>(null);
  const isLoadingSessions = ref(false);
  const isSending = ref(false);
  const error = ref<string | null>(null);

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  // Sequence token to ignore stale openSession responses when the user
  // rapidly switches between chats.
  let openToken = 0;

  // Stop polling after 90s; anything still pending after that is stuck
  // server-side (worker crash, timeout, etc.), not actively in progress.
  const POLL_STUCK_THRESHOLD_MS = 90_000;

  const isPolling = computed(() => {
    if (!currentSession.value?.messages) return false;
    return currentSession.value.messages.some((m) => {
      if (m.role !== 'assistant') return false;
      if (m.status !== 'pending' && m.status !== 'processing') return false;
      const created = new Date(m.created_at).getTime();
      if (!Number.isFinite(created)) return true;
      return Date.now() - created <= POLL_STUCK_THRESHOLD_MS;
    });
  });

  async function loadSessions() {
    isLoadingSessions.value = true;
    try {
      const page = await aiApi.listSessions();
      sessions.value = page.data;
    } finally {
      isLoadingSessions.value = false;
    }
  }

  async function openSession(id: number) {
    const token = ++openToken;
    stopPolling();
    const session = await aiApi.getSession(id);
    // A newer open / new-chat call has superseded us; drop this response.
    if (token !== openToken) return;
    currentSession.value = session;
    maybeStartPolling();
  }

  function newSession() {
    openToken += 1;
    stopPolling();
    currentSession.value = null;
  }

  async function send(message: string, formatHint?: FormatType) {
    if (!message.trim() || isSending.value) return;
    isSending.value = true;
    error.value = null;

    try {
      if (!currentSession.value) {
        const created = await aiApi.createSession({ message, format_hint: formatHint });
        if (created) {
          currentSession.value = created;
          sessions.value = [created, ...sessions.value];
        }
      } else {
        const pair = await aiApi.addMessage(currentSession.value.id, {
          message,
          format_hint: formatHint
        });
        if (pair && currentSession.value.messages) {
          currentSession.value.messages.push(pair.user, pair.assistant);
        }
      }
      maybeStartPolling();
    } catch (e) {
      error.value = (e as Error).message || 'Failed to send message';
    } finally {
      isSending.value = false;
    }
  }

  async function remove(id: number) {
    await aiApi.deleteSession(id);
    sessions.value = sessions.value.filter((s) => s.id !== id);
    if (currentSession.value?.id === id) {
      currentSession.value = null;
      stopPolling();
    }
  }

  async function refreshCurrent() {
    const requestedId = currentSession.value?.id;
    if (!requestedId) return;
    const fresh = await aiApi.getSession(requestedId);
    if (!fresh) return;
    // User switched chats or started a new one while this poll was in flight.
    if (currentSession.value?.id !== requestedId) return;
    currentSession.value = fresh;

    const idx = sessions.value.findIndex((s) => s.id === fresh.id);
    if (idx !== -1 && fresh.title && sessions.value[idx].title !== fresh.title) {
      sessions.value[idx] = { ...sessions.value[idx], title: fresh.title };
    }

    if (!isPolling.value) {
      stopPolling();
    }
  }

  function maybeStartPolling() {
    if (pollTimer || !isPolling.value) return;
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    pollTimer = setInterval(refreshCurrent, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      stopPolling();
    } else if (isPolling.value) {
      maybeStartPolling();
    }
  }

  onMounted(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
  });

  onUnmounted(() => {
    stopPolling();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  });

  return {
    sessions,
    currentSession,
    isLoadingSessions,
    isSending,
    error,
    isPolling,
    loadSessions,
    openSession,
    newSession,
    send,
    remove
  };
}
