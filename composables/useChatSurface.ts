import { ref, nextTick } from 'vue';
import { useAiChats } from '@/composables/useAiChats';
import type { ChatBlock } from '@/services/api/aiApi';

/**
 * Shared chat-surface logic used by both the landing and full chat modes of
 * ChatExperience: composer input, attachments, canvas open state, fullscreen,
 * scrolling, and the send/reload handlers. Wraps useAiChats so the two modes
 * differ only in shell (hero + dropdown vs collapsible history sidebar).
 */
export function useChatSurface() {
  const chats = useAiChats();

  const input = ref('');
  const pendingFiles = ref<File[]>([]);
  const openCanvas = ref<ChatBlock | null>(null);
  const canvasMessageId = ref<number | null>(null);
  const isFullscreen = ref(false);
  const chatWindow = ref<HTMLElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const composerEl = ref<any>(null);

  const scrollToBottom = () => {
    nextTick(() => {
      if (chatWindow.value) chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
    });
  };

  const handleAttach = (files: File[]) => {
    pendingFiles.value = files;
  };

  const handleSubmit = async () => {
    const message = input.value.trim();
    const files = pendingFiles.value.slice();
    if (!message && files.length === 0) return;
    const documentType = (composerEl.value?.documentType as string | null) ?? null;
    input.value = '';
    pendingFiles.value = [];
    composerEl.value?.clearFiles?.();
    await chats.send(message, undefined, files, documentType);
    scrollToBottom();
  };

  const reloadCurrent = () => {
    if (chats.currentSession.value?.id) chats.openSession(chats.currentSession.value.id);
  };

  const onOpenCanvas = (payload: { canvas: ChatBlock; messageId?: number }) => {
    openCanvas.value = payload.canvas;
    canvasMessageId.value = payload.messageId ?? null;
  };

  const closeCanvas = () => {
    openCanvas.value = null;
    canvasMessageId.value = null;
  };

  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value;
  };

  return {
    ...chats,
    input,
    pendingFiles,
    openCanvas,
    canvasMessageId,
    isFullscreen,
    chatWindow,
    composerEl,
    scrollToBottom,
    handleAttach,
    handleSubmit,
    reloadCurrent,
    onOpenCanvas,
    closeCanvas,
    toggleFullscreen
  };
}
