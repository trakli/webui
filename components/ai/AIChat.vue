<template>
  <div class="ai-chat card">
    <h2 class="title">AI Insights Chat</h2>
    <div class="chat-window">
      <div
        v-for="(message, index) in chatHistory"
        :key="index"
        class="chat-row"
        :class="message.type"
      >
        <div class="bubble" :class="message.type">{{ message.text }}</div>
      </div>
    </div>
    <form class="composer" @submit.prevent="handleSendMessage">
      <input
        v-model="input"
        type="text"
        class="chat-input"
        placeholder="Ask me anything about your finances..."
      />
      <button type="submit" class="send-btn">Send</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const chatHistory = ref([
  { type: 'ai', text: 'Hello! I am your personal financial assistant. How can I help you today?' }
]);
const input = ref('');

const handleSendMessage = () => {
  if (!input.value.trim()) return;
  const userMessage = { type: 'user', text: input.value };
  chatHistory.value.push(userMessage);

  let aiResponse = 'I am not quite sure how to answer that yet. Please try a different query.';
  const lower = input.value.toLowerCase();
  if (lower.includes('highest-paying months')) {
    aiResponse =
      "Based on last year's data, your highest-paying months were November ($8,500) and December ($7,900) due to holiday bonuses and year-end client projects.";
  } else if (lower.includes('on track to save')) {
    aiResponse =
      'Yes, you are currently on track to save 20% of your income. Your current savings rate is 21.5%, which is slightly ahead of your goal.';
  }

  setTimeout(() => {
    chatHistory.value.push({ type: 'ai', text: aiResponse });
  }, 600);

  input.value = '';
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

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
  border: 1px solid lighten($primary, 35%);
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
</style>
