import { ref, computed, onUnmounted } from 'vue';
import { aiApi, type ChatSession, type ChatMessage, type FormatType } from '@/services/api/aiApi';

const POLL_INTERVAL_MS = 1500;

export function useAiChats() {
  const sessions = ref<ChatSession[]>([]);
  const currentSession = ref<ChatSession | null>(null);
  const isLoadingSessions = ref(false);
  const isSending = ref(false);
  const error = ref<string | null>(null);

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  const isPolling = computed(() => {
    if (!currentSession.value?.messages) return false;
    return currentSession.value.messages.some(
      (m) => m.role === 'assistant' && (m.status === 'pending' || m.status === 'processing')
    );
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
    stopPolling();
    const session = await aiApi.getSession(id);
    currentSession.value = session;
    maybeStartPolling();
  }

  function newSession() {
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
    if (!currentSession.value) return;
    const fresh = await aiApi.getSession(currentSession.value.id);
    if (!fresh) return;
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
    pollTimer = setInterval(refreshCurrent, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  onUnmounted(stopPolling);

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
