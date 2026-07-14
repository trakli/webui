<template>
  <aside v-if="canvas" class="canvas">
    <header class="canvas-header">
      <div class="canvas-titles">
        <span class="canvas-eyebrow">{{ t('Canvas') }}</span>
        <h2 class="canvas-title">{{ canvas.title || t('Document') }}</h2>
      </div>
      <div class="canvas-tools">
        <button
          v-if="messageId"
          type="button"
          class="canvas-tool"
          :title="t('Download as Markdown')"
          @click="onDownload"
        >
          <Download :size="16" />
        </button>
        <button
          type="button"
          class="canvas-tool"
          :title="t('Print / Save as PDF')"
          @click="onPrint"
        >
          <Printer :size="16" />
        </button>
        <button type="button" class="canvas-close" :title="t('Close')" @click="$emit('close')">
          <X :size="18" />
        </button>
      </div>
    </header>
    <div ref="bodyEl" class="canvas-body">
      <ChatResultRenderer :result="canvasResult" :session-id="sessionId" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { X, Printer, Download } from 'lucide-vue-next';
import ChatResultRenderer from '@/components/ai/ChatResultRenderer.vue';
import { useCanvasExport } from '@/composables/useCanvasExport';
import type { ChatBlock, ChatMessageResult } from '@/services/api/aiApi';

const { t } = useI18n();

const props = defineProps<{
  canvas: (ChatBlock & { title?: string; blocks?: ChatBlock[] }) | null;
  sessionId?: number;
  messageId?: number;
}>();

defineEmits<{ (e: 'close'): void }>();

const bodyEl = ref<HTMLElement | null>(null);
const { printCanvas, downloadExport } = useCanvasExport();

const onPrint = () => printCanvas(bodyEl.value, props.canvas?.title || 'Document');
const onDownload = () => {
  if (props.sessionId && props.messageId) {
    downloadExport(props.sessionId, props.messageId, props.canvas?.title || 'Document', 'md');
  }
};

// Reuse the block dispatcher to render the document's sections.
const canvasResult = computed<ChatMessageResult>(() => ({
  source: 'agent',
  blocks: props.canvas?.blocks ?? []
}));
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

// An in-content panel (not an overlay): it sits inside the page's content area
// beside the chat, matching the rest of the app's surfaces.
.canvas {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: $radius-xl;
  box-shadow: $elevation-1;
  overflow: hidden;
  align-self: stretch;
}

.canvas-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-2;
  padding: 0 $spacing-4;
  min-height: 60px;
  border-bottom: 1px solid $border-light;
  flex-shrink: 0;
}

.canvas-titles {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.canvas-eyebrow {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: $font-semibold;
  color: $primary;
}

.canvas-title {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-bold;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.canvas-tools {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  flex-shrink: 0;
}

.canvas-tool {
  border: none;
  background: transparent;
  color: $text-secondary;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: $primary-light;
    color: $primary;
  }
}

.canvas-close {
  border: none;
  background: $bg-gray;
  color: $text-secondary;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: $primary-light;
    color: $primary;
  }
}

.canvas-body {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-5 $spacing-5 $spacing-6;
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}
</style>
