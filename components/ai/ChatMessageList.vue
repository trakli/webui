<template>
  <div v-for="message in messages" :key="message.id" class="chat-row" :class="rowClass(message)">
    <div class="avatar" :class="rowClass(message)">
      <Bot v-if="message.role === 'assistant'" :size="16" />
      <User v-else :size="16" />
    </div>

    <div class="bubble-wrap">
      <div class="bubble" :class="bubbleClass(message)">
        <TypingDots v-if="isPendingAssistant(message)" />
        <div v-else-if="message.content" class="message-text">
          {{ message.content }}
        </div>
        <div v-else-if="message.status === 'failed'" class="error-text">
          {{ message.error || t('Something went wrong.') }}
        </div>
        <ChatResultRenderer :result="message.result" />
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
import type { ChatMessage } from '@/services/api/aiApi';

const { t } = useI18n();

defineProps<{
  messages: ChatMessage[];
}>();

const rowClass = (message: ChatMessage) => (message.role === 'user' ? 'user' : 'ai');
const bubbleClass = (message: ChatMessage) => {
  if (message.role === 'user') return 'user';
  if (message.status === 'failed') return 'ai error';
  if (isPendingAssistant(message)) return 'ai loading';
  return 'ai';
};
const isPendingAssistant = (m: ChatMessage) =>
  m.role === 'assistant' && (m.status === 'pending' || m.status === 'processing');

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
    background: $primary-light;
    color: $primary;
  }

  &.user {
    background: $bg-gray;
    color: $text-primary;
  }
}

.bubble-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  max-width: min(80%, 560px);
}

.bubble {
  padding: $spacing-2 $spacing-3;
  border-radius: $radius-lg;
  font-size: $font-size-base;
  line-height: 1.5;
  word-break: break-word;
}

.bubble.ai {
  background: $primary-light;
  color: $text-primary;
  border: 1px solid $primary-muted;
  border-top-left-radius: 4px;

  &.error {
    background: $bg-gray;
    color: $error-color;
    border-color: $error-color;
  }
}

.bubble.user {
  background: $primary;
  color: $bg-white;
  border-top-right-radius: 4px;
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
