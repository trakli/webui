<template>
  <div
    class="chat-experience"
    :class="{
      'is-fullscreen': isFullscreen,
      'mode-full': mode === 'full',
      'mode-landing': mode === 'landing'
    }"
  >
    <!-- Full mode: collapsible history sidebar -->
    <ChatSidebar
      v-if="mode === 'full' && !sidebarCollapsed"
      class="experience-sidebar"
      :sessions="sessions"
      :current-session-id="currentSession?.id ?? null"
      :is-loading="isLoadingSessions"
      @new-chat="handleNew"
      @open-session="handleOpen"
      @delete-session="remove"
    />

    <section class="chat-main">
      <!-- Hero: a centered chatbox in both modes until the first message. -->
      <div v-if="!hasConversation" class="hero">
        <div class="hero-mark"><Bot :size="30" /></div>
        <h1 class="hero-title">{{ t('What can I help with?') }}</h1>
        <p class="hero-subtitle">
          {{ t('Ask about your money, log a transaction, or import a statement.') }}
        </p>
        <div class="hero-composer">
          <ChatComposer
            ref="composerEl"
            v-model="input"
            :disabled="isSending"
            @submit="handleSubmit"
            @attach="handleAttach"
          />
        </div>
        <div class="hero-suggestions">
          <button
            v-for="prompt in suggestions"
            :key="prompt"
            type="button"
            class="suggestion"
            @click="handleSuggestion(prompt)"
          >
            {{ t(prompt) }}
          </button>
        </div>
      </div>

      <!-- Work area: conversation, optionally split with the canvas. -->
      <div v-else class="work" :class="{ 'with-canvas': !!openCanvas }">
        <section class="conversation">
          <header class="chat-header">
            <div class="header-left">
              <button
                v-if="mode === 'full'"
                type="button"
                class="header-icon-btn"
                :title="t('Toggle history')"
                @click="sidebarCollapsed = !sidebarCollapsed"
              >
                <component :is="sidebarCollapsed ? PanelLeft : PanelLeftClose" :size="16" />
              </button>

              <DiscussionDropdown
                v-if="mode === 'landing'"
                :sessions="sessions"
                :current-id="currentSession?.id ?? null"
                :current-title="currentSession?.title || t('New chat')"
                @open="handleOpen"
                @new="handleNew"
              />
              <h2 v-else class="chat-title">{{ currentSession?.title || t('Assistant') }}</h2>
            </div>

            <div class="header-actions">
              <button
                type="button"
                class="header-icon-btn"
                :title="t('New chat')"
                @click="handleNew"
              >
                <Plus :size="16" />
              </button>
              <button
                type="button"
                class="header-icon-btn"
                :title="isFullscreen ? t('Exit full screen') : t('Full screen')"
                @click="toggleFullscreen"
              >
                <component :is="isFullscreen ? Minimize2 : Maximize2" :size="16" />
              </button>
            </div>
          </header>

          <div ref="chatWindow" class="chat-window">
            <ChatMessageList
              v-if="currentSession?.messages?.length"
              :messages="currentSession.messages"
              :session-id="currentSession.id"
              @reload="reloadCurrent"
              @open-canvas="onOpenCanvas"
            />
            <ChatEmptyState v-else @pick="handleSuggestion" />
          </div>

          <div class="composer-dock">
            <ChatComposer
              ref="composerEl"
              v-model="input"
              :disabled="isSending"
              @submit="handleSubmit"
              @attach="handleAttach"
            />
          </div>
        </section>

        <CanvasPanel
          v-if="openCanvas"
          class="work-canvas"
          :canvas="openCanvas"
          :session-id="currentSession?.id"
          :message-id="canvasMessageId ?? undefined"
          @close="closeCanvas"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Bot, Plus, Maximize2, Minimize2, PanelLeft, PanelLeftClose } from 'lucide-vue-next';
import { useChatSurface } from '@/composables/useChatSurface';
import ChatSidebar from '@/components/ai/ChatSidebar.vue';
import ChatComposer from '@/components/ai/ChatComposer.vue';
import ChatMessageList from '@/components/ai/ChatMessageList.vue';
import ChatEmptyState from '@/components/ai/ChatEmptyState.vue';
import CanvasPanel from '@/components/ai/CanvasPanel.vue';
import DiscussionDropdown from '@/components/ai/DiscussionDropdown.vue';

withDefaults(defineProps<{ mode?: 'landing' | 'full' }>(), { mode: 'landing' });

const { t } = useI18n();

const {
  sessions,
  currentSession,
  isLoadingSessions,
  isSending,
  loadSessions,
  openSession,
  newSession,
  remove,
  input,
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
} = useChatSurface();

const sidebarCollapsed = ref(false);

const hasConversation = computed(() => (currentSession.value?.messages?.length ?? 0) > 0);

const suggestions = [
  'How much did I spend last month?',
  'Log 20 for coffee from Cash',
  "What's my biggest spending category?",
  'Import my bank statement'
];

onMounted(() => loadSessions());

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
  closeCanvas();
  composerEl.value?.focus?.();
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.chat-experience {
  width: 100%;
  display: flex;
  min-width: 0;
}

/* Full mode: a bordered card with the history sidebar beside the work area. */
.mode-full {
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
  height: calc(100vh - 110px);
  min-height: 560px;
  overflow: hidden;

  .experience-sidebar {
    flex: 0 0 260px;
  }

  @media (max-width: $breakpoint-md) {
    .experience-sidebar {
      display: none;
    }
  }
}

/* Bounded like full mode so the chat header/composer and the canvas stay put
   while only the chat-window and canvas-body scroll (not the whole page). */
.mode-landing {
  height: calc(100vh - 110px);
  min-height: 560px;
  overflow: hidden;
}

.chat-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.is-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: $bg-white;
  border-radius: 0;
  height: 100vh;
  padding: $spacing-2 $spacing-4;
}

/* Hero (landing, empty) */
.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: $spacing-3;
  padding: $spacing-6 $spacing-4;
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
}

.hero-mark {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $primary-light;
  color: $primary;
}

.hero-title {
  font-size: $font-size-2xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin: 0;
}

.hero-subtitle {
  color: $text-muted;
  margin: 0;
}

.hero-composer {
  width: 100%;
  border: 1px solid $border-light;
  border-radius: $radius-xl;
  overflow: hidden;
  box-shadow: $elevation-2;
  margin-top: $spacing-2;
}

.hero-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
  justify-content: center;
}

.suggestion {
  border: 1px solid $primary-muted;
  background: $bg-white;
  color: $text-secondary;
  border-radius: 9999px;
  padding: $spacing-2 $spacing-3;
  font-size: $font-size-sm;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    background: $primary-light;
    color: $primary;
    border-color: $primary;
  }
}

/* Work area */
.work {
  flex: 1;
  display: flex;
  gap: $spacing-4;
  min-height: 0;
}

.conversation {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
}

.work.with-canvas {
  .conversation {
    max-width: none;
    margin: 0;
    flex: 1 1 60%;
  }

  .work-canvas {
    flex: 1 1 40%;
    min-width: 0;
  }
}

@media (max-width: 960px) {
  .work.with-canvas {
    flex-direction: column;
  }
}

/* One header rule for both modes, matching CanvasPanel's header so the chat and
   canvas titles always line up. */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-2;
  min-height: 52px;
  padding: 0 $spacing-4;
  border-bottom: 1px solid $border-light;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  min-width: 0;
}

.chat-title {
  margin: 0;
  font-size: $font-size-base;
  font-weight: $font-medium;
  color: $text-secondary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  flex-shrink: 0;
}

/* Ghost buttons: they recede until hovered so they don't compete with the chat. */
.header-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: $text-muted;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    background: $primary-light;
    color: $primary;
  }
}

/* Full-width scroll area, but the messages stay centered/readable via responsive
   side padding, so the header divider reads as one clean full-width rule. */
.chat-window {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-4 max(#{$spacing-3}, calc((100% - 768px) / 2));
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
  min-height: 0;
}

.composer-dock {
  border: 1px solid $border-light;
  border-radius: $radius-xl;
  overflow: hidden;
  background: $bg-white;
  width: min(768px, calc(100% - #{$spacing-3} * 2));
  margin: 0 auto $spacing-3;
}
</style>
