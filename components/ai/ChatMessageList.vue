<template>
  <div v-for="message in messages" :key="message.id" class="chat-row" :class="rowClass(message)">
    <div class="avatar" :class="rowClass(message)">
      <Bot v-if="message.role === 'assistant'" :size="16" />
      <User v-else :size="16" />
    </div>

    <div class="bubble-wrap">
      <div class="bubble" :class="bubbleClass(message)">
        <TypingDots v-if="isPendingAssistant(message)" />
        <template v-else>
          <!-- When the message has rendered blocks, they own the output (the
               narration is the first block); otherwise show the text as markdown. -->
          <ChatMarkdownBlock
            v-if="message.content && !hasBlocks(message)"
            :text="message.content"
          />
          <div v-else-if="!message.content && message.status === 'failed'" class="error-text">
            {{ message.error || t('Something went wrong.') }}
          </div>
          <div v-else-if="!message.content && isStuckAssistant(message)" class="error-text">
            {{ t('This response did not finish. Try sending the question again.') }}
          </div>
          <ChatResultRenderer
            v-if="showResult(message)"
            :result="message.result"
            :session-id="sessionId"
            @changed="$emit('reload')"
            @open-canvas="$emit('open-canvas', { canvas: $event, messageId: message.id })"
          />
        </template>
      </div>

      <div class="bubble-meta">
        <span v-if="message.created_at">{{ formatTime(message.created_at) }}</span>
        <span v-if="sourceLabel(message)" class="source-badge">
          {{ sourceLabel(message) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bot, User } from 'lucide-vue-next';
import TypingDots from '@/components/ai/TypingDots.vue';
import ChatResultRenderer from '@/components/ai/ChatResultRenderer.vue';
import ChatMarkdownBlock from '@/components/ai/blocks/ChatMarkdownBlock.vue';
import type { ChatBlock, ChatMessage } from '@/services/api/aiApi';

const { t } = useI18n();

defineProps<{
  messages: ChatMessage[];
  sessionId?: number;
}>();

defineEmits<{
  (e: 'reload'): void;
  (e: 'open-canvas', payload: { canvas: ChatBlock; messageId: number }): void;
}>();

const hasBlocks = (message: ChatMessage): boolean => (message.result?.blocks?.length ?? 0) > 0;

// Structured legacy (SmartQL) results worth showing alongside the prose answer.
// A scalar/pair just restates the prose, so we suppress it to avoid the
// "$500" + "500" duplicate; a table/list/record carries real content.
const STRUCTURED_FORMATS = ['table', 'list', 'pair_list', 'record'];

const showResult = (message: ChatMessage): boolean => {
  if (hasBlocks(message)) return true;
  if (!message.content) return true;
  return STRUCTURED_FORMATS.includes(message.result?.format_type ?? '');
};

const rowClass = (message: ChatMessage) => (message.role === 'user' ? 'user' : 'ai');
const bubbleClass = (message: ChatMessage) => {
  if (message.role === 'user') return 'user';
  if (message.status === 'failed' || isStuckAssistant(message)) return 'ai error';
  if (isPendingAssistant(message)) return 'ai loading';
  return 'ai';
};

// Assistant responses that never settled get stuck in 'pending' / 'processing'
// indefinitely (a worker crash, a backend timeout, etc.). Treat anything older
// than this window as stuck instead of showing the typing dots forever.
const STUCK_THRESHOLD_MS = 90_000;

const isAssistantAwaiting = (m: ChatMessage) =>
  m.role === 'assistant' && (m.status === 'pending' || m.status === 'processing');

const messageAgeMs = (m: ChatMessage): number => {
  const created = new Date(m.created_at).getTime();
  if (!Number.isFinite(created)) return 0;
  return Date.now() - created;
};

const isPendingAssistant = (m: ChatMessage) =>
  isAssistantAwaiting(m) && messageAgeMs(m) <= STUCK_THRESHOLD_MS;

const isStuckAssistant = (m: ChatMessage) =>
  isAssistantAwaiting(m) && messageAgeMs(m) > STUCK_THRESHOLD_MS;

const sourceLabel = (message: ChatMessage): string | null => {
  if (message.role !== 'assistant' || message.status !== 'completed') return null;
  const source = message.result?.source;
  if (source === 'smartql') return t('data');
  if (source === 'prism_fallback') return t('fallback');
  return null;
};

const formatTime = (iso: string): string => {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.chat-row {
  display: flex;
  gap: $spacing-2;
  align-items: flex-start;
  max-width: 100%;

  &.user {
    flex-direction: row-reverse;
    .bubble-meta {
      justify-content: flex-end;
    }
  }
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.ai {
    background: $bg-gray;
    color: $text-secondary;
  }

  &.user {
    background: $primary-light;
    color: $primary;
  }
}

.bubble-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  max-width: min(82%, 600px);
}

.bubble {
  padding: $spacing-3 $spacing-4;
  border-radius: 18px;
  font-size: $font-size-base;
  line-height: 1.55;
  word-break: break-word;
}

.bubble.ai {
  background: $bg-white;
  color: $text-primary;
  border: 1px solid $border-light;
  box-shadow: $elevation-1;
  border-top-left-radius: 6px;

  &.error {
    background: $bg-white;
    color: $error-color;
    border-color: $error-color;
  }
}

.bubble.user {
  background: $primary-light;
  color: $text-primary;
  border: 1px solid $primary-muted;
  border-top-right-radius: 6px;
}

.bubble-meta {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  font-size: 0.7rem;
  color: $text-muted;
  padding: 0 $spacing-1;
}

.source-badge {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: $font-semibold;
  padding: 1px 6px;
  border-radius: 9999px;
  background: $bg-gray;
  color: $text-secondary;
  font-size: 0.6rem;
}

.message-text {
  white-space: pre-wrap;
}

.error-text {
  font-style: italic;
}
</style>
