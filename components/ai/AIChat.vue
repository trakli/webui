<template>
  <div class="ai-chat card">
    <h2 class="title">AI Insights Chat</h2>
    <div ref="chatWindow" class="chat-window">
      <div
        v-for="(message, index) in chatHistory"
        :key="index"
        class="chat-row"
        :class="message.type"
      >
        <div class="bubble" :class="message.type">
          <div class="message-text">{{ message.text }}</div>
          <div v-if="message.results?.length && message.formatType" class="results-container">
            <template v-if="message.formatType === 'scalar'">
              <div class="result-scalar">
                {{ formatValue(Object.values(message.results[0])[0]) }}
              </div>
            </template>
            <template v-else-if="message.formatType === 'pair'">
              <div class="result-pair">
                <span class="pair-label">{{ Object.keys(message.results[0])[0] }}:</span>
                <span class="pair-value">{{
                  formatValue(Object.values(message.results[0])[1])
                }}</span>
              </div>
            </template>
            <template v-else-if="message.formatType === 'record'">
              <div class="result-record">
                <div v-for="(value, key) in message.results[0]" :key="key" class="record-row">
                  <span class="record-key">{{ formatKey(key) }}:</span>
                  <span class="record-value">{{ formatValue(value) }}</span>
                </div>
              </div>
            </template>
            <template v-else-if="message.formatType === 'list'">
              <ul class="result-list">
                <li v-for="(row, i) in message.results" :key="i">
                  {{ formatValue(Object.values(row)[0]) }}
                </li>
              </ul>
            </template>
            <template v-else-if="message.formatType === 'pair_list'">
              <div class="result-pair-list">
                <div v-for="(row, i) in message.results" :key="i" class="pair-row">
                  <span class="pair-label">{{ Object.values(row)[0] }}:</span>
                  <span class="pair-value">{{ formatValue(Object.values(row)[1]) }}</span>
                </div>
              </div>
            </template>
            <template v-else-if="message.formatType === 'table'">
              <div class="result-table-wrapper">
                <table class="result-table">
                  <thead>
                    <tr>
                      <th v-for="key in Object.keys(message.results[0])" :key="key">
                        {{ formatKey(key) }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in message.results" :key="i">
                      <td v-for="(value, key) in row" :key="key">{{ formatValue(value) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
            <template v-else>
              <pre class="result-raw">{{ JSON.stringify(message.results, null, 2) }}</pre>
            </template>
          </div>
        </div>
      </div>
      <div v-if="isLoading" class="chat-row ai">
        <div class="bubble ai loading">Thinking...</div>
      </div>
    </div>
    <form class="composer" @submit.prevent="handleSendMessage">
      <input
        v-model="input"
        type="text"
        class="chat-input"
        placeholder="Ask me anything about your finances..."
        :disabled="isLoading"
      />
      <button type="submit" class="send-btn" :disabled="isLoading || !input.trim()">
        {{ isLoading ? '...' : 'Send' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { aiApi, type FormatType } from '@/services/api/aiApi';

interface ChatMessage {
  type: 'user' | 'ai';
  text: string;
  results?: Record<string, unknown>[];
  formatType?: FormatType | null;
}

const chatHistory = ref<ChatMessage[]>([
  { type: 'ai', text: 'Hello! I am your personal financial assistant. How can I help you today?' }
]);
const input = ref('');
const isLoading = ref(false);
const chatWindow = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
  nextTick(() => {
    if (chatWindow.value) {
      chatWindow.value.scrollTop = chatWindow.value.scrollHeight;
    }
  });
};

const formatKey = (key: string): string => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

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

const handleSendMessage = async () => {
  if (!input.value.trim() || isLoading.value) return;

  const userMessage: ChatMessage = { type: 'user', text: input.value };
  chatHistory.value.push(userMessage);
  const question = input.value;
  input.value = '';
  isLoading.value = true;
  scrollToBottom();

  try {
    const response = await aiApi.ask(question);

    if (response.success && response.data) {
      chatHistory.value.push({
        type: 'ai',
        text: response.data.answer,
        results: response.data.results,
        formatType: response.data.format_type
      });
    } else {
      chatHistory.value.push({
        type: 'ai',
        text: response.message || 'Sorry, I could not process your request. Please try again.'
      });
    }
  } catch {
    chatHistory.value.push({
      type: 'ai',
      text: 'Sorry, the AI service is currently unavailable. Please try again later.'
    });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use 'sass:color';

.card {
  background: $bg-white;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
  padding: $spacing-4;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.title {
  font-size: $font-size-xl;
  font-weight: $font-bold;
  margin-bottom: $spacing-3;
}
.chat-window {
  flex: 1;
  min-height: 60vh;
  overflow-y: auto;
  padding: $spacing-2;
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}
.chat-row {
  display: flex;
  width: 100%;
}
.chat-row.ai {
  justify-content: flex-start;
}
.chat-row.user {
  justify-content: flex-end;
}
.bubble {
  max-width: min(80%, 520px);
  padding: $spacing-2 $spacing-3;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  font-size: $font-size-base;
  line-height: 1.5;
  word-break: break-word;
}
.bubble.ai {
  background: $primary-light;
  color: $primary;
  border: 1px solid color.adjust($primary, $lightness: 35%);

  &.loading {
    opacity: 0.7;
    animation: pulse 1.5s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.4;
  }
}
.bubble.user {
  background: $bg-gray;
  color: $text-primary;
}
.composer {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  margin-top: $spacing-2;
}
.chat-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid $border-light;
  border-radius: 9999px;
  outline: none;
  font-size: $font-size-base;
  background: $bg-white;
  transition: $transition-base;

  &:focus {
    border-color: $primary;
    box-shadow: 0 0 0 2px rgba(4, 120, 68, 0.15);
  }
}
.send-btn {
  padding: 0.6rem 1rem;
  border-radius: 9999px;
  background: $primary;
  color: $bg-white;
  font-weight: $font-semibold;
  transition: $transition-base;

  &:hover {
    background: $primary-hover;
  }
}

.message-text {
  white-space: pre-wrap;
}

.results-container {
  margin-top: $spacing-2;
  padding-top: $spacing-2;
  border-top: 1px solid color.adjust($primary, $lightness: 30%);
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
    border-bottom: 1px solid color.adjust($primary, $lightness: 35%);

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
    border-bottom: 1px solid color.adjust($primary, $lightness: 35%);
  }

  th {
    font-weight: $font-semibold;
    background: color.adjust($primary-light, $lightness: 5%);
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
