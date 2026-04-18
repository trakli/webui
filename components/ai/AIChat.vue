<template>
  <div class="ai-chat">
    <aside class="sessions-pane">
      <button class="new-chat-btn" @click="handleNew">
        <Plus :size="16" />
        <span>{{ t('New chat') }}</span>
      </button>

      <div v-if="groupedSessions.length" class="sessions-list">
        <div v-for="group in groupedSessions" :key="group.label" class="session-group">
          <div class="group-label">{{ t(group.label) }}</div>
          <ul>
            <li
              v-for="session in group.sessions"
              :key="session.id"
              class="session-item"
              :class="{ active: currentSession?.id === session.id }"
              :title="session.title || t('New chat')"
              @click="handleOpen(session.id)"
            >
              <MessageSquare :size="14" class="session-icon" />
              <span class="session-title">{{ session.title || t('New chat') }}</span>
              <button
                class="remove-btn"
                :title="t('Delete chat')"
                @click.stop="handleDelete(session.id)"
              >
                <Trash2 :size="14" />
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div v-else-if="!isLoadingSessions" class="empty-sessions">
        <MessageSquare :size="28" />
        <p>{{ t('No conversations yet') }}</p>
        <span>{{ t('Your chats will appear here') }}</span>
      </div>
    </aside>

    <section class="chat-pane">
      <header class="chat-header">
        <Bot :size="18" class="chat-header-icon" />
        <h2 class="chat-title">
          {{ currentSession?.title || t('AI Insights') }}
        </h2>
      </header>

      <div ref="chatWindow" class="chat-window">
        <template v-if="currentSession?.messages?.length">
          <div
            v-for="message in currentSession.messages"
            :key="message.id"
            class="chat-row"
            :class="rowClass(message)"
          >
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

                <div
                  v-if="message.result?.rows?.length && message.result.format_type"
                  class="results-container"
                >
                  <div
                    v-if="message.result.format_type === 'scalar' && message.result.rows?.[0]"
                    class="result-scalar"
                  >
                    {{ formatValue(Object.values(message.result.rows[0])[0]) }}
                  </div>

                  <div
                    v-else-if="message.result.format_type === 'pair' && message.result.rows?.[0]"
                    class="result-pair"
                  >
                    <span class="pair-label">{{ Object.values(message.result.rows[0])[0] }}:</span>
                    <span class="pair-value">{{
                      formatValue(Object.values(message.result.rows[0])[1])
                    }}</span>
                  </div>

                  <div
                    v-else-if="message.result.format_type === 'record' && message.result.rows?.[0]"
                    class="result-record"
                  >
                    <div
                      v-for="(value, key) in message.result.rows[0]"
                      :key="key"
                      class="record-row"
                    >
                      <span class="record-key">{{ formatKey(key) }}:</span>
                      <span class="record-value">{{ formatValue(value) }}</span>
                    </div>
                  </div>

                  <ul v-else-if="message.result.format_type === 'list'" class="result-list">
                    <li v-for="(row, i) in message.result.rows" :key="i">
                      {{ formatValue(Object.values(row)[0]) }}
                    </li>
                  </ul>

                  <div
                    v-else-if="message.result.format_type === 'pair_list'"
                    class="result-pair-list"
                  >
                    <div v-for="(row, i) in message.result.rows" :key="i" class="pair-row">
                      <span class="pair-label">{{ Object.values(row)[0] }}:</span>
                      <span class="pair-value">{{ formatValue(Object.values(row)[1]) }}</span>
                    </div>
                  </div>

                  <div
                    v-else-if="message.result.format_type === 'table' && message.result.rows?.[0]"
                    class="result-table-wrapper"
                  >
                    <table class="result-table">
                      <thead>
                        <tr>
                          <th v-for="key in Object.keys(message.result.rows[0])" :key="key">
                            {{ formatKey(key) }}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, i) in message.result.rows" :key="i">
                          <td v-for="(value, key) in row" :key="key">
                            {{ formatValue(value) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <pre v-else class="result-raw">{{
                    JSON.stringify(message.result.rows, null, 2)
                  }}</pre>
                </div>
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

        <div v-else class="empty-chat">
          <div class="empty-chat-icon">
            <Sparkles :size="28" />
          </div>
          <h3>{{ t('Ask about your finances') }}</h3>
          <p>{{ t('Try one of these to get started:') }}</p>
          <div class="suggestions">
            <button
              v-for="prompt in suggestionPrompts"
              :key="prompt"
              class="suggestion"
              @click="handleSuggestion(prompt)"
            >
              {{ t(prompt) }}
            </button>
          </div>
        </div>
      </div>

      <form class="composer" @submit.prevent="handleSubmit">
        <textarea
          ref="textareaEl"
          v-model="input"
          rows="1"
          class="chat-input"
          :placeholder="t('Ask me anything about your finances...')"
          :disabled="isSending"
          @keydown="handleKeydown"
          @input="autoResize"
        />
        <button
          type="submit"
          class="send-btn"
          :title="t('Send')"
          :disabled="isSending || !input.trim()"
        >
          <Send :size="16" />
        </button>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted, computed } from 'vue';
import { Plus, Trash2, Bot, User, Send, MessageSquare, Sparkles } from 'lucide-vue-next';
import type { ChatMessage, ChatSession } from '@/services/api/aiApi';
import { useAiChats } from '@/composables/useAiChats';
import TypingDots from '@/components/ai/TypingDots.vue';

const { t } = useI18n();

const {
  sessions,
  currentSession,
  isLoadingSessions,
  isSending,
  loadSessions,
  openSession,
  newSession,
  send,
  remove
} = useAiChats();

const input = ref('');
const chatWindow = ref<HTMLElement | null>(null);
const textareaEl = ref<HTMLTextAreaElement | null>(null);

const suggestionPrompts = [
  'How much did I spend last month?',
  "What's my biggest spending category?",
  'Show my recent transactions',
  'What wallet has the most money?'
];

onMounted(() => {
  loadSessions();
});

watch(
  () => currentSession.value?.messages?.length,
  () => scrollToBottom()
);
watch(
  () => currentSession.value?.messages?.map((m) => m.status).join(','),
  () => scrollToBottom()
);

const scrollToBottom = () => {
  nextTick(() => {
    if (chatWindow.value) {
      chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
    }
  });
};

const autoResize = () => {
  const el = textareaEl.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
};

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

const formatKey = (key: string | number): string =>
  String(key)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? value.toString()
      : value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
  }
  return String(value);
};

const groupedSessions = computed(() => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const weekAgo = today - 7 * 86400000;

  const buckets: Record<string, ChatSession[]> = {
    Today: [],
    Yesterday: [],
    'This week': [],
    Older: []
  };

  for (const session of sessions.value) {
    const ts = new Date(session.updated_at || session.created_at).getTime();
    if (ts >= today) buckets.Today.push(session);
    else if (ts >= yesterday) buckets.Yesterday.push(session);
    else if (ts >= weekAgo) buckets['This week'].push(session);
    else buckets.Older.push(session);
  }

  return Object.entries(buckets)
    .filter(([, list]) => list.length > 0)
    .map(([label, list]) => ({ label, sessions: list }));
});

const handleSubmit = async () => {
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  if (textareaEl.value) textareaEl.value.style.height = 'auto';
  await send(message);
  scrollToBottom();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSubmit();
  }
};

const handleSuggestion = async (prompt: string) => {
  input.value = prompt;
  await handleSubmit();
};

const handleOpen = async (id: number) => {
  await openSession(id);
  scrollToBottom();
};

const handleNew = () => {
  newSession();
  input.value = '';
  textareaEl.value?.focus();
};

const handleDelete = async (id: number) => {
  await remove(id);
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.ai-chat {
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
  display: grid;
  grid-template-columns: 260px 1fr;
  height: calc(100vh - 120px);
  min-height: 560px;
  overflow: hidden;

  @media (max-width: $breakpoint-md) {
    grid-template-columns: 1fr;
    height: calc(100vh - 100px);
  }
}

.sessions-pane {
  border-right: 1px solid $border-light;
  display: flex;
  flex-direction: column;
  padding: $spacing-3;
  gap: $spacing-3;
  min-height: 0;
  overflow: hidden;

  @media (max-width: $breakpoint-md) {
    display: none;
  }
}

.new-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-3;
  background: $primary;
  color: $bg-white;
  border: none;
  border-radius: $radius-lg;
  font-weight: $font-semibold;
  font-size: $font-size-sm;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    background: $primary-hover;
  }
}

.sessions-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
  margin: 0 (-$spacing-2);
  padding: 0 $spacing-2;
}

.session-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
}

.group-label {
  font-size: 0.7rem;
  font-weight: $font-semibold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $text-muted;
  padding: 0 $spacing-2;
  margin-bottom: $spacing-1;
}

.session-item {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2;
  border-radius: $radius-md;
  cursor: pointer;
  transition: $transition-base;
  color: $text-secondary;
  position: relative;

  &:hover {
    background: $bg-gray;
    color: $text-primary;

    .remove-btn {
      opacity: 1;
    }
  }

  &.active {
    background: $primary-light;
    color: $primary;
    font-weight: $font-semibold;

    .session-icon {
      color: $primary;
    }
  }
}

.session-icon {
  flex-shrink: 0;
  color: $text-muted;
}

.session-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: $font-size-sm;
}

.remove-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: $text-muted;
  padding: 2px;
  border-radius: $radius-sm;
  opacity: 0;
  transition: $transition-base;

  &:hover {
    color: $error-color;
    background: $bg-white;
  }
}

.empty-sessions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: $spacing-1;
  color: $text-muted;
  text-align: center;
  padding: $spacing-4 $spacing-2;

  p {
    margin: 0;
    font-weight: $font-semibold;
    font-size: $font-size-sm;
    color: $text-secondary;
  }

  span {
    font-size: 0.75rem;
  }
}

.chat-pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-4;
  border-bottom: 1px solid $border-light;
}

.chat-header-icon {
  color: $primary;
}

.chat-title {
  margin: 0;
  font-size: $font-size-base;
  font-weight: $font-semibold;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-window {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: $spacing-4;
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.empty-chat {
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-2;
  text-align: center;
  max-width: 420px;

  h3 {
    margin: 0;
    font-size: $font-size-lg;
    font-weight: $font-semibold;
    color: $text-primary;
  }

  p {
    margin: 0;
    font-size: $font-size-sm;
    color: $text-muted;
  }
}

.empty-chat-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: $primary-light;
  color: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
  justify-content: center;
  margin-top: $spacing-2;
}

.suggestion {
  background: $bg-gray;
  border: 1px solid $border-light;
  color: $text-primary;
  border-radius: 9999px;
  padding: $spacing-1 $spacing-3;
  font-size: 0.8rem;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    background: $primary-light;
    color: $primary;
    border-color: $primary-muted;
  }
}

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

.error-text {
  font-style: italic;
}

.composer {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-4;
  border-top: 1px solid $border-light;
  background: $bg-white;
}

.chat-input {
  flex: 1;
  resize: none;
  padding: $spacing-2 $spacing-3;
  border: 1px solid $border-light;
  border-radius: $radius-lg;
  outline: none;
  font-size: $font-size-base;
  font-family: inherit;
  background: $bg-gray;
  color: $text-primary;
  line-height: 1.4;
  max-height: 160px;
  overflow-y: auto;
  transition: $transition-base;

  &::placeholder {
    color: $text-muted;
  }

  &:focus {
    background: $bg-white;
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
  }
}

.send-btn {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  background: $primary;
  color: $bg-white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: $transition-base;

  &:hover:not(:disabled) {
    background: $primary-hover;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.message-text {
  white-space: pre-wrap;
}

.results-container {
  margin-top: $spacing-2;
  padding-top: $spacing-2;
  border-top: 1px solid $primary-border;
}

.result-scalar {
  font-size: $font-size-2xl;
  font-weight: $font-bold;
  color: $primary;
}

.result-pair,
.pair-row {
  display: flex;
  gap: $spacing-2;
  padding: $spacing-1 0;

  .pair-label {
    font-weight: $font-semibold;
    color: $text-secondary;
  }

  .pair-value {
    font-weight: $font-bold;
  }
}

.result-record {
  .record-row {
    display: flex;
    gap: $spacing-2;
    padding: $spacing-1 0;
    border-bottom: 1px solid $primary-muted;

    &:last-child {
      border-bottom: none;
    }

    .record-key {
      font-weight: $font-semibold;
      color: $text-secondary;
      min-width: 100px;
    }
  }
}

.result-list {
  margin: 0;
  padding-left: $spacing-4;

  li {
    padding: $spacing-1 0;
  }
}

.result-pair-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
}

.result-table-wrapper {
  overflow-x: auto;
  margin-top: $spacing-1;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: $font-size-sm;

  th,
  td {
    padding: $spacing-1 $spacing-2;
    text-align: left;
    border-bottom: 1px solid $primary-muted;
  }

  th {
    font-weight: $font-semibold;
    background: $primary-light;
  }

  tr:last-child td {
    border-bottom: none;
  }
}

.result-raw {
  background: $bg-gray;
  padding: $spacing-2;
  border-radius: $radius-md;
  overflow-x: auto;
  font-size: $font-size-sm;
  margin: 0;
}
</style>
