import { ref } from 'vue';

/**
 * A one-shot handoff of an assistant request from elsewhere in the app (e.g. a
 * dashboard quick action) into the chat. The sender stows a prompt and/or files,
 * navigates to the chat, and ChatExperience consumes it once on mount so the turn
 * is sent fully-formed instead of as an empty "what do you want" round-trip.
 */
export interface PendingAsk {
  text?: string;
  files?: File[];
}

const pending = ref<PendingAsk | null>(null);

export function usePendingAsk() {
  const setPendingAsk = (value: PendingAsk) => {
    pending.value = value;
  };

  const consumePendingAsk = (): PendingAsk | null => {
    const value = pending.value;
    pending.value = null;
    return value;
  };

  return { setPendingAsk, consumePendingAsk };
}
